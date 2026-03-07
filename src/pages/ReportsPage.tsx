import { useState, useEffect } from "react";
import { FileText, Download, Filter, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "../lib/api";
import { useToast, Toast } from "../components/Toast";

interface Branch {
  id: string;
  name: string;
}

interface ReportRow {
  name: string;
  nik: string;
  branch: string;
  hadir: number;
  terlambat: number;
  izin: number;
  alpha: number;
  poin: number;
}

export function ReportsPage() {
  const { toast, show: showToast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    branch: "Semua Cabang",
  });

  // Fetch branches on mount
  useEffect(() => {
    api.get("/branch", { params: { get_all: true } }).then((res) => {
      const data = res.data?.data ?? res.data;
      setBranches(Array.isArray(data) ? data : (data?.data ?? []));
    });
  }, []);

  const handleGenerate = async () => {
    if (!filters.startDate || !filters.endDate) {
      showToast("Silakan pilih periode mulai dan selesai", "info");
      return;
    }

    setIsGenerating(true);
    try {
      // Fetch attendance records for the period
      const attParams: Record<string, string> = {
        get_all: "true",
        "filter[startDate]": filters.startDate,
        "filter[endDate]": filters.endDate,
      };
      if (filters.branch !== "Semua Cabang") {
        const br = branches.find((b) => b.name === filters.branch);
        if (br) attParams["filter[branchId]"] = br.id;
      }

      // Fetch employees and attendance in parallel
      const [attRes, empRes] = await Promise.all([
        api.get("/attendances", { params: attParams }),
        api.get("/employees", { params: { get_all: true } }),
      ]);

      const attendances = (() => {
        const d = attRes.data?.data ?? attRes.data;
        return Array.isArray(d) ? d : (d?.data ?? []);
      })();

      const employees = (() => {
        const d = empRes.data?.data ?? empRes.data;
        return Array.isArray(d) ? d : (d?.data ?? []);
      })();

      // Build employee map
      const empMap = new Map<string, { name: string; nik: string; branch: string }>();
      for (const emp of employees) {
        empMap.set(emp.id, {
          name: emp.name,
          nik: emp.nik,
          branch: emp.branch?.name ?? "-",
        });
      }

      // Aggregate per employee
      const agg = new Map<string, ReportRow>();
      for (const att of attendances) {
        const empId = att.employeeId ?? att.employee?.id;
        if (!empId) continue;

        if (!agg.has(empId)) {
          const empInfo = empMap.get(empId) ?? {
            name: att.employee?.name ?? "-",
            nik: att.employee?.nik ?? "-",
            branch: att.employee?.branch?.name ?? "-",
          };
          agg.set(empId, {
            name: empInfo.name,
            nik: empInfo.nik,
            branch: empInfo.branch,
            hadir: 0,
            terlambat: 0,
            izin: 0,
            alpha: 0,
            poin: 0,
          });
        }

        const row = agg.get(empId)!;
        row.poin += att.points ?? 0;

        switch (att.status) {
          case "HADIR":
            row.hadir++;
            break;
          case "TERLAMBAT":
            row.terlambat++;
            break;
          case "ALPHA":
            row.alpha++;
            break;
          case "CUTI":
          case "SAKIT":
          case "SETENGAH_HARI":
          case "IZIN_CUTI":
          case "IZIN_SAKIT":
          case "IZIN_SETENGAH_HARI":
            row.izin++;
            break;
        }
      }

      // Filter by branch if needed (in case API doesn't filter)
      let rows = Array.from(agg.values());
      if (filters.branch !== "Semua Cabang") {
        rows = rows.filter((r) => r.branch === filters.branch);
      }

      rows.sort((a, b) => a.name.localeCompare(b.name));
      setReportData(rows);
      setIsGenerated(true);
    } catch {
      showToast("Gagal generate laporan. Coba lagi.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredData = reportData;

  const totals = filteredData.reduce(
    (acc, row) => ({
      hadir: acc.hadir + row.hadir,
      terlambat: acc.terlambat + row.terlambat,
      izin: acc.izin + row.izin,
      alpha: acc.alpha + row.alpha,
      poin: acc.poin + row.poin,
    }),
    { hadir: 0, terlambat: 0, izin: 0, alpha: 0, poin: 0 },
  );

  const handleExportXlsx = async () => {
    try {
      const params: Record<string, string> = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.branch !== "Semua Cabang") {
        const br = branches.find((b) => b.name === filters.branch);
        if (br) params.branchId = br.id;
      }

      const res = await api.get("/attendances/export-xlsx", {
        params,
        responseType: "blob",
      });

      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-absensi-${filters.startDate}_${filters.endDate}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Laporan XLSX berhasil diunduh!");
    } catch {
      showToast("Gagal mengunduh XLSX. Coba export CSV.", "error");
    }
  };

  const handleExport = (type: "Excel" | "CSV" | "PDF") => {
    if (type === "Excel") {
      handleExportXlsx();
    } else if (type === "CSV") {
      exportCSV();
    } else {
      window.print();
    }
  };

  const exportCSV = () => {
    const header = ["Nama Karyawan", "NIK", "Cabang", "Hadir", "Terlambat", "Izin", "Alpha", "Total Poin"];
    const rows = filteredData.map((r) => [r.name, r.nik, r.branch, r.hadir, r.terlambat, r.izin, r.alpha, r.poin]);
    rows.push(["TOTAL", "", "", totals.hadir, totals.terlambat, totals.izin, totals.alpha, totals.poin]);

    const csvContent = [header, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-absensi-${filters.startDate}_${filters.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("Laporan berhasil diexport ke Excel!");
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Toast toast={toast} />

      {/* Filter Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Filter size={20} className="text-blue-600" />
          Filter Laporan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Periode Mulai</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Periode Selesai</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Kantor Cabang</label>
            <select
              value={filters.branch}
              onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>Semua Cabang</option>
              {branches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating && <Loader2 size={16} className="animate-spin" />}
            {isGenerating ? "Memproses..." : "Generate Laporan"}
          </button>
        </div>
      </div>

      {/* Preview & Export */}
      {isGenerated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none"
        >
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Preview Laporan Absensi</h3>
              <p className="text-sm text-gray-500">
                Periode: {formatDateLabel(filters.startDate)} - {formatDateLabel(filters.endDate)}
                {filters.branch !== "Semua Cabang" && ` | ${filters.branch}`}
              </p>
            </div>
            <div className="flex gap-3 print:hidden">
              <button
                onClick={() => handleExport("Excel")}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
              >
                <Download size={18} />
                Excel (XLSX)
              </button>
              <button
                onClick={() => handleExport("CSV")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Download size={18} />
                CSV
              </button>
              <button
                onClick={() => handleExport("PDF")}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-100 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <FileText size={18} />
                PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredData.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Tidak ada data absensi untuk periode dan cabang yang dipilih.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="px-6 py-4">Nama Karyawan</th>
                    <th className="px-6 py-4">NIK</th>
                    <th className="px-6 py-4">Cabang</th>
                    <th className="px-6 py-4 text-center">Hadir</th>
                    <th className="px-6 py-4 text-center">Terlambat</th>
                    <th className="px-6 py-4 text-center">Izin</th>
                    <th className="px-6 py-4 text-center">Alpha</th>
                    <th className="px-6 py-4 text-right">Total Poin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredData.map((row) => (
                    <tr key={row.nik} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{row.nik}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{row.branch}</td>
                      <td className="px-6 py-4 text-center text-sm text-emerald-600 font-medium">{row.hadir}</td>
                      <td className="px-6 py-4 text-center text-sm text-amber-600 font-medium">{row.terlambat}</td>
                      <td className="px-6 py-4 text-center text-sm text-blue-600 font-medium">{row.izin}</td>
                      <td className="px-6 py-4 text-center text-sm text-red-600 font-medium">{row.alpha}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">{row.poin}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-100">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-sm font-bold text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-emerald-600">{totals.hadir}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-amber-600">{totals.terlambat}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-blue-600">{totals.izin}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-red-600">{totals.alpha}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">{totals.poin}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

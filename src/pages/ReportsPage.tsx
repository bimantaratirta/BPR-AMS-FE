import { useState, useEffect } from "react";
import { FileText, Download, Filter, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
      const params: Record<string, string> = {
        startDate: filters.startDate,
        endDate: filters.endDate,
      };
      if (filters.branch !== "Semua Cabang") {
        const br = branches.find((b) => b.name === filters.branch);
        if (br) params.branchId = br.id;
      }

      const res = await api.get("/attendances/report-summary", { params });
      const data = res.data?.data ?? res.data;
      let rows: ReportRow[] = Array.isArray(data) ? data : [];
      rows.sort((a, b) => a.name.localeCompare(b.name));
      setReportData(rows);
      setCurrentPage(1);
      if (res.data?.branches) setBranches(res.data.branches);
      setIsGenerated(true);
    } catch {
      showToast("Gagal generate laporan. Coba lagi.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    const title = "Laporan Rekap Absensi Karyawan";
    const subtitle = `Periode: ${formatDateLabel(filters.startDate)} - ${formatDateLabel(filters.endDate)}${filters.branch !== "Semua Cabang" ? `  |  ${filters.branch}` : ""}`;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 16);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(subtitle, 14, 23);
    doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}  |  Total: ${filteredData.length} karyawan`, 14, 29);
    doc.setTextColor(0);

    autoTable(doc, {
      startY: 34,
      head: [["Nama Karyawan", "NIK", "Cabang", "Hadir", "Terlambat", "Izin", "Alpha", "Total Poin"]],
      body: [
        ...filteredData.map((r) => [r.name, r.nik, r.branch, r.hadir, r.terlambat, r.izin, r.alpha, r.poin]),
        ["TOTAL", "", "", totals.hadir, totals.terlambat, totals.izin, totals.alpha, totals.poin],
      ],
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      bodyStyles: {},
      didParseCell: (data) => {
        if (data.row.index === filteredData.length) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [226, 232, 240];
        }
      },
      columnStyles: {
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center" },
      },
    });

    doc.save(`laporan-absensi-${filters.startDate}_${filters.endDate}.pdf`);
    showToast("PDF berhasil diunduh!");
  };

  const handleExport = (type: "Excel" | "CSV" | "PDF") => {
    if (type === "Excel") {
      handleExportXlsx();
    } else if (type === "CSV") {
      exportCSV();
    } else {
      exportPDF();
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
                  {paginatedData.map((row) => (
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

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Tampilkan</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <span>dari {filteredData.length} data</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`dot-${i}`} className="px-2 text-gray-400 text-sm">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p as number)}
                        className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === p
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

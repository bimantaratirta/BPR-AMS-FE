import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Star, Clock, CheckCircle2, XCircle, ChevronDown, Loader2, Download } from "lucide-react";
import { motion } from "framer-motion";
import api from "../lib/api";
import { useDebounce } from "../hooks/useDebounce";
import { Pagination } from "../components/Pagination";

interface AggregatedEmployee {
  employeeId: string;
  name: string;
  nik: string;
  branch: string;
  hadir: number;
  terlambat05: number;
  terlambat0: number;
  alpha: number;
  totalPoin: number;
}

export function PointsPage() {
  const [aggregated, setAggregated] = useState<AggregatedEmployee[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedBranch, setSelectedBranch] = useState("Semua Cabang");
  const [showBranchFilter, setShowBranchFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    api.get("/branch", { params: { get_all: true } }).then((res) => {
      const data = res.data?.data ?? res.data;
      setBranches(Array.isArray(data) ? data : (data?.data ?? []));
    });
  }, []);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const branchObj = branches.find((b) => b.name === selectedBranch);
      if (branchObj) params.branchId = branchObj.id;

      const res = await api.get("/point-records/summary", { params });
      const data = res.data?.data ?? res.data;
      setAggregated(Array.isArray(data) ? data : []);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, selectedBranch, branches]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const exportCSV = () => {
    const header = "Nama,NIK,Cabang,Tepat Waktu,Setengah Poin,Terlambat,Alpha,Total Poin\n";
    const rows = filteredData
      .map(
        (e) =>
          `"${e.name}","${e.nik}","${e.branch}",${e.hadir},${e.terlambat05},${e.terlambat0},${e.alpha},${e.totalPoin.toFixed(1)}`,
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `poin-kehadiran${startDate ? `-${startDate}` : ""}${endDate ? `-${endDate}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredData = aggregated.filter((emp) => {
    const matchSearch = emp.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || emp.nik.includes(debouncedSearch);
    const matchBranch = selectedBranch === "Semua Cabang" || emp.branch === selectedBranch;
    return matchSearch && matchBranch;
  });

  const totalFilteredItems = filteredData.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPoin = filteredData.reduce((sum, e) => sum + e.totalPoin, 0);
  const avgPoin = filteredData.length > 0 ? (totalPoin / filteredData.length).toFixed(1) : "0";
  const totalHadir = filteredData.reduce((sum, e) => sum + e.hadir, 0);
  const totalTerlambat = filteredData.reduce((sum, e) => sum + e.terlambat05 + e.terlambat0, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Aturan Poin */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Star size={20} className="text-amber-500" />
          Aturan Poin Kehadiran
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: CheckCircle2,
              label: "Sampai 08:00",
              sub: "+1 Poin",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
              iconBg: "bg-emerald-100",
              iconColor: "text-emerald-600",
              textColor: "text-emerald-700",
              subColor: "text-emerald-600",
            },
            {
              icon: Clock,
              label: "08:01 - 08:30",
              sub: "+0.5 Poin",
              bg: "bg-amber-50",
              border: "border-amber-100",
              iconBg: "bg-amber-100",
              iconColor: "text-amber-600",
              textColor: "text-amber-700",
              subColor: "text-amber-600",
            },
            {
              icon: XCircle,
              label: "Setelah 08:30",
              sub: "0 Poin",
              bg: "bg-red-50",
              border: "border-red-100",
              iconBg: "bg-red-100",
              iconColor: "text-red-600",
              textColor: "text-red-700",
              subColor: "text-red-600",
            },
          ].map((item) => (
            <div key={item.label} className={`flex items-center gap-3 p-4 ${item.bg} rounded-xl border ${item.border}`}>
              <div className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                <item.icon size={20} className={item.iconColor} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${item.textColor}`}>{item.label}</p>
                <p className={`text-xs ${item.subColor}`}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Poin",
            value: isLoading ? "..." : totalPoin.toFixed(1),
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          { label: "Rata-rata", value: isLoading ? "..." : avgPoin, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Tepat Waktu", value: isLoading ? "..." : totalHadir, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Terlambat", value: isLoading ? "..." : totalTerlambat, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"
          >
            <span className="text-sm font-medium text-gray-500">{stat.label}</span>
            <span className={`text-xl font-bold px-3 py-1 rounded-lg ${stat.bg} ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative z-20">
        <div className="flex flex-wrap items-center gap-4 w-full">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau NIK..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Dari"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Sampai"
          />
          <div className="relative">
            <button
              onClick={() => setShowBranchFilter(!showBranchFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Filter size={18} />
              <span className="hidden sm:inline text-sm">
                {selectedBranch === "Semua Cabang" ? "Filter Cabang" : selectedBranch}
              </span>
              <ChevronDown size={16} />
            </button>
            {showBranchFilter && (
              <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30">
                {["Semua Cabang", ...branches.map((b) => b.name)].map((branch) => (
                  <button
                    key={branch}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setShowBranchFilter(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedBranch === branch ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"}`}
                  >
                    {branch}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors ml-auto"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Karyawan</th>
                <th className="px-6 py-4">NIK</th>
                <th className="px-6 py-4">Cabang</th>
                <th className="px-6 py-4 text-center">Tepat Waktu</th>
                <th className="px-6 py-4 text-center">Setengah Poin</th>
                <th className="px-6 py-4 text-center">Terlambat</th>
                <th className="px-6 py-4 text-right">Total Poin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedData.map((emp) => (
                  <tr key={emp.employeeId} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {emp.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.nik}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.branch}</td>
                    <td className="px-6 py-4 text-center text-sm text-emerald-600 font-medium">{emp.hadir}</td>
                    <td className="px-6 py-4 text-center text-sm text-amber-600 font-medium">{emp.terlambat05}</td>
                    <td className="px-6 py-4 text-center text-sm text-red-600 font-medium">{emp.terlambat0}</td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${emp.totalPoin >= 20 ? "bg-emerald-50 text-emerald-700" : emp.totalPoin >= 17 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}
                      >
                        {emp.totalPoin.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalFilteredItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="karyawan"
        />
      </div>
    </motion.div>
  );
}

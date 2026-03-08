import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Download, Calendar, Filter, FileSpreadsheet, FileText, Camera, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { useToast, Toast } from "../components/Toast";
import { useDebounce } from "../hooks/useDebounce";
import { Pagination } from "../components/Pagination";

type AttendanceStatus = "HADIR" | "TERLAMBAT" | "ALPHA" | "CUTI" | "SAKIT" | "SETENGAH_HARI";

interface AttendanceRecord {
  id: string;
  date: string;
  employee?: { id: string; nik: string; name: string; branch?: { name: string } };
  checkInTime?: string | null;
  checkOutTime?: string | null;
  durationMinutes?: number | null;
  status: AttendanceStatus;
  points: number;
  checkInPhoto?: string | null;
}

function formatTime(iso?: string | null): string {
  if (!iso) return "--:--";
  try {
    return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "--:--";
  }
}

function formatDate(iso?: string): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function formatDuration(minutes?: number | null): string {
  if (!minutes) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}j ${m}m`;
}

const STATUS_LABEL: Record<string, string> = {
  HADIR: "Hadir",
  TERLAMBAT: "Terlambat",
  ALPHA: "Alpha",
  CUTI: "Izin Cuti",
  SAKIT: "Izin Sakit",
  SETENGAH_HARI: "Setengah Hari",
};

function getStatusBadge(status: string): string {
  switch (status) {
    case "HADIR":
      return "bg-green-50 text-green-700 border-green-200";
    case "TERLAMBAT":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "CUTI":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "SAKIT":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "SETENGAH_HARI":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "ALPHA":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export function AttendancePage() {
  const { toast, show: showToast } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedBranch, setSelectedBranch] = useState("Semua Cabang");
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().slice(0, 10));
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  const [stats, setStats] = useState({ hadir: 0, terlambat: 0, izin: 0, alpha: 0 });
  const branchesRef = useRef<{ id: string; name: string }[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; name: string; date: string } | null>(null);

  const buildFilterParams = useCallback(() => {
    const params: any = {};
    if (dateFilter) params["filter[date]"] = dateFilter;
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedBranch !== "Semua Cabang") {
      const branchObj = branchesRef.current.find((b) => b.name === selectedBranch);
      if (branchObj) params["filter[branchId]"] = branchObj.id;
    }
    return params;
  }, [dateFilter, debouncedSearch, selectedBranch]);

  // Single fetch: paginated data + stats + branches
  useEffect(() => {
    const fetchAttendances = async () => {
      setIsLoading(true);
      try {
        const params = {
          ...buildFilterParams(),
          "pagination[page]": currentPage,
          "pagination[limit]": itemsPerPage,
        };
        const res = await api.get("/attendances", { params });
        const data = res.data?.data ?? res.data;
        setRecords(Array.isArray(data) ? data : (data?.data ?? []));
        const pagination = res.data?.pagination;
        if (pagination) {
          setTotalPages(pagination.totalPages ?? 1);
          setTotalItems(pagination.totalItems ?? 0);
        }
        if (res.data?.stats) setStats(res.data.stats);
        if (res.data?.branches) {
          branchesRef.current = res.data.branches;
          setBranches(res.data.branches);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendances();
  }, [currentPage, buildFilterParams]);

  const handleExportExcel = () => {
    const header = ["Tanggal", "Nama", "NIK", "Cabang", "Masuk", "Keluar", "Status", "Poin"];
    const rows = records.map((r) => [
      formatDate(r.date),
      r.employee?.name ?? "-",
      r.employee?.nik ?? "-",
      r.employee?.branch?.name ?? "-",
      formatTime(r.checkInTime),
      formatTime(r.checkOutTime),
      STATUS_LABEL[r.status] ?? r.status,
      r.points,
    ]);

    const csvContent = [header, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `absensi-${dateFilter || "semua"}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setShowExportDialog(false);
    showToast("Data berhasil diexport!");
  };

  const handleExportPDF = () => {
    setShowExportDialog(false);
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Toast toast={toast} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Hadir", value: stats.hadir, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Terlambat", value: stats.terlambat, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Izin / Sakit", value: stats.izin, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Alpha", value: stats.alpha, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"
          >
            <span className="text-sm font-medium text-gray-500">{stat.label}</span>
            <span className={`text-xl font-bold px-3 py-1 rounded-lg ${stat.bg} ${stat.color}`}>
              {isLoading ? "..." : stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative z-20">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="relative flex-1 min-w-[140px]">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari karyawan..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
            >
              <Filter size={16} />
              <span>{selectedBranch === "Semua Cabang" ? "Filter" : selectedBranch}</span>
            </button>
            {showFilterDropdown && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30">
                {["Semua Cabang", ...branches.map((b) => b.name)].map((branch) => (
                  <button
                    key={branch}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setShowFilterDropdown(false);
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
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 text-sm font-medium"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Karyawan</th>
                <th className="px-6 py-4">Cabang</th>
                <th className="px-6 py-4 text-center">Masuk</th>
                <th className="px-6 py-4 text-center">Keluar</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Poin</th>
                <th className="px-6 py-4 text-center">Foto</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data absensi ditemukan.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/80 transition-colors border-b border-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(record.date)}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{record.employee?.name ?? "-"}</p>
                        <p className="text-xs text-gray-400">{record.employee?.nik ?? "-"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{record.employee?.branch?.name ?? "-"}</td>
                    <td className="px-6 py-4 text-center text-sm font-mono text-gray-700">
                      {formatTime(record.checkInTime)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-mono text-gray-700">
                      {formatTime(record.checkOutTime)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(record.status)}`}
                      >
                        {STATUS_LABEL[record.status] ?? record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${record.points === 1 ? "bg-emerald-50 text-emerald-700" : record.points === 0.5 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}
                      >
                        {record.points}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {record.checkInPhoto ? (
                        <button
                          onClick={() => {
                            setSelectedPhoto({
                              url: record.checkInPhoto!,
                              name: record.employee?.name ?? "-",
                              date: formatDate(record.date),
                            });
                            setShowPhotoModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Camera size={14} />
                          Lihat
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
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
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="data"
        />
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {showPhotoModal && selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPhotoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Foto Absensi</h3>
                <p className="text-sm text-gray-500 mb-1">{selectedPhoto.name}</p>
                <p className="text-xs text-gray-400 mb-4">{selectedPhoto.date}</p>
                <img
                  src={selectedPhoto.url}
                  alt="Foto absensi"
                  className="w-full rounded-xl object-cover max-h-72"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Dialog */}
      <AnimatePresence>
        {showExportDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Export Data Absensi</h3>
                <p className="text-gray-500 text-sm mb-6">Pilih format file untuk mengunduh data absensi.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExportExcel}
                    className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all group"
                  >
                    <FileSpreadsheet size={24} className="mb-2 text-gray-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-medium">Excel (.csv)</span>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all group"
                  >
                    <FileText size={24} className="mb-2 text-gray-400 group-hover:text-red-600" />
                    <span className="text-sm font-medium">PDF (.pdf)</span>
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                <button
                  onClick={() => setShowExportDialog(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

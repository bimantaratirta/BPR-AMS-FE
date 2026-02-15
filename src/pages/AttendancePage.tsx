import { useState } from "react";
import { Search, Download, Calendar, Filter, FileSpreadsheet, FileText, CheckCircle2, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AttendanceStatus = "Hadir" | "Terlambat" | "Izin Cuti" | "Izin Sakit" | "Izin Setengah Hari";

interface AttendanceRecord {
  date: string;
  nik: string;
  name: string;
  branch: string;
  in: string;
  out: string;
  duration: string;
  status: AttendanceStatus;
  poin: number;
  photo?: string;
}

// Helper: calculate points based on check-in time
function calculatePoints(checkInTime: string): number {
  if (!checkInTime || checkInTime === "--:--") return 0;
  const [hours, minutes] = checkInTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  if (totalMinutes <= 480) return 1; // sampai 08:00 → 1 poin (Hadir)
  if (totalMinutes <= 510) return 0.5; // 08:01 - 08:30 → 0.5 poin (Terlambat)
  return 0; // setelah 08:30 → 0 poin (Terlambat)
}

// Helper: calculate duration
function calculateDuration(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut || checkIn === "--:--" || checkOut === "--:--") return "-";
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);
  const diffMinutes = outH * 60 + outM - (inH * 60 + inM);
  if (diffMinutes <= 0) return "-";
  const h = Math.floor(diffMinutes / 60);
  const m = diffMinutes % 60;
  return `${h}j ${m}m`;
}

// Helper: determine status based on check-in time
function determineStatus(checkInTime: string): "Hadir" | "Terlambat" {
  if (!checkInTime || checkInTime === "--:--") return "Terlambat";
  const [hours, minutes] = checkInTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  return totalMinutes <= 480 ? "Hadir" : "Terlambat"; // sampai 08:00 = Hadir
}

const attendanceData: AttendanceRecord[] = [
  {
    date: "14 Feb 2026",
    nik: "2023001",
    name: "Andi Pratama",
    branch: "Kantor Pusat",
    in: "07:45",
    out: "17:05",
    duration: calculateDuration("07:45", "17:05"),
    status: determineStatus("07:45"),
    poin: calculatePoints("07:45"),
    photo: "foto_andi_14feb.jpg",
  },
  {
    date: "14 Feb 2026",
    nik: "2023002",
    name: "Siti Rahayu",
    branch: "Kantor Pusat",
    in: "07:50",
    out: "17:10",
    duration: calculateDuration("07:50", "17:10"),
    status: determineStatus("07:50"),
    poin: calculatePoints("07:50"),
    photo: "foto_siti_14feb.jpg",
  },
  {
    date: "14 Feb 2026",
    nik: "2023003",
    name: "Budi Santoso",
    branch: "Cabang Sudirman",
    in: "08:15",
    out: "17:20",
    duration: calculateDuration("08:15", "17:20"),
    status: determineStatus("08:15"),
    poin: calculatePoints("08:15"),
    photo: "foto_budi_14feb.jpg",
  },
  {
    date: "14 Feb 2026",
    nik: "2023004",
    name: "Dewi Lestari",
    branch: "Cabang Sudirman",
    in: "--:--",
    out: "--:--",
    duration: "-",
    status: "Izin Sakit",
    poin: 0,
  },
  {
    date: "14 Feb 2026",
    nik: "2023005",
    name: "Rizki Hidayat",
    branch: "Kantor Pusat",
    in: "08:35",
    out: "17:00",
    duration: calculateDuration("08:35", "17:00"),
    status: determineStatus("08:35"),
    poin: calculatePoints("08:35"),
    photo: "foto_rizki_14feb.jpg",
  },
  {
    date: "14 Feb 2026",
    nik: "2023006",
    name: "Maya Sari",
    branch: "Cabang Gatot Subroto",
    in: "--:--",
    out: "--:--",
    duration: "-",
    status: "Izin Cuti",
    poin: 0,
  },
  {
    date: "14 Feb 2026",
    nik: "2023007",
    name: "Ahmad Fauzi",
    branch: "Cabang Sudirman",
    in: "07:55",
    out: "17:02",
    duration: calculateDuration("07:55", "17:02"),
    status: determineStatus("07:55"),
    poin: calculatePoints("07:55"),
    photo: "foto_ahmad_14feb.jpg",
  },
  {
    date: "14 Feb 2026",
    nik: "2023008",
    name: "Lina Marlina",
    branch: "Kantor Pusat",
    in: "08:25",
    out: "17:15",
    duration: calculateDuration("08:25", "17:15"),
    status: determineStatus("08:25"),
    poin: calculatePoints("08:25"),
    photo: "foto_lina_14feb.jpg",
  },
  {
    date: "14 Feb 2026",
    nik: "2023009",
    name: "Hendra Wijaya",
    branch: "Cabang Gatot Subroto",
    in: "07:58",
    out: "17:00",
    duration: calculateDuration("07:58", "17:00"),
    status: determineStatus("07:58"),
    poin: calculatePoints("07:58"),
    photo: "foto_hendra_14feb.jpg",
  },
  {
    date: "14 Feb 2026",
    nik: "2023010",
    name: "Putri Wulandari",
    branch: "Cabang Sudirman",
    in: "08:05",
    out: "12:00",
    duration: calculateDuration("08:05", "12:00"),
    status: "Izin Setengah Hari",
    poin: calculatePoints("08:05"),
    photo: "foto_putri_14feb.jpg",
  },
  {
    date: "13 Feb 2026",
    nik: "2023001",
    name: "Andi Pratama",
    branch: "Kantor Pusat",
    in: "08:10",
    out: "17:00",
    duration: calculateDuration("08:10", "17:00"),
    status: determineStatus("08:10"),
    poin: calculatePoints("08:10"),
    photo: "foto_andi_13feb.jpg",
  },
  {
    date: "13 Feb 2026",
    nik: "2023002",
    name: "Siti Rahayu",
    branch: "Kantor Pusat",
    in: "08:00",
    out: "17:05",
    duration: calculateDuration("08:00", "17:05"),
    status: determineStatus("08:00"),
    poin: calculatePoints("08:00"),
    photo: "foto_siti_13feb.jpg",
  },
  {
    date: "13 Feb 2026",
    nik: "2023003",
    name: "Budi Santoso",
    branch: "Cabang Sudirman",
    in: "08:01",
    out: "17:10",
    duration: calculateDuration("08:01", "17:10"),
    status: determineStatus("08:01"),
    poin: calculatePoints("08:01"),
    photo: "foto_budi_13feb.jpg",
  },
  {
    date: "13 Feb 2026",
    nik: "2023007",
    name: "Ahmad Fauzi",
    branch: "Cabang Sudirman",
    in: "08:15",
    out: "17:15",
    duration: calculateDuration("08:15", "17:15"),
    status: determineStatus("08:15"),
    poin: calculatePoints("08:15"),
    photo: "foto_ahmad_13feb.jpg",
  },
];

const branches = [
  "Semua Cabang",
  "Kantor Pusat",
  "Cabang Sudirman",
  "Cabang Gatot Subroto",
  "Kas Pasar Minggu",
  "Kas Kemang",
];

export function AttendancePage() {
  const [activeTab, setActiveTab] = useState<"harian" | "mingguan" | "bulanan">("harian");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("Semua Cabang");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ photo: string; name: string; date: string } | null>(null);

  const handleExport = () => {
    setShowExportDialog(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const filteredData = attendanceData.filter((record) => {
    const matchSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) || record.nik.includes(searchTerm);
    const matchBranch = selectedBranch === "Semua Cabang" || record.branch === selectedBranch;
    return matchSearch && matchBranch;
  });

  const stats = {
    hadir: filteredData.filter((r) => r.status === "Hadir").length,
    terlambat: filteredData.filter((r) => r.status === "Terlambat").length,
    izin: filteredData.filter(
      (r) => r.status === "Izin Cuti" || r.status === "Izin Sakit" || r.status === "Izin Setengah Hari",
    ).length,
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "Hadir":
        return "bg-green-50 text-green-700 border-green-200";
      case "Terlambat":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Izin Cuti":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Izin Sakit":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Izin Setengah Hari":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            <span className="font-medium">Data berhasil diexport!</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Hadir", value: stats.hadir, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Terlambat", value: stats.terlambat, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Izin / Sakit", value: stats.izin, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Alpha", value: 0, color: "text-red-600", bg: "bg-red-50" },
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

      {/* Filters & Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative z-20">
        <div className="flex p-1 bg-gray-100 rounded-lg">
          {["harian", "mingguan", "bulanan"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[140px]">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari karyawan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                {branches.map((branch) => (
                  <button
                    key={branch}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      selectedBranch === branch ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"
                    }`}
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
              {filteredData.map((record, idx) => (
                <tr key={`${record.nik}-${record.date}-${idx}`} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{record.date}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{record.name}</p>
                      <p className="text-xs text-gray-400">{record.nik}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{record.branch}</td>
                  <td className="px-6 py-4 text-center text-sm font-mono text-gray-700">{record.in}</td>
                  <td className="px-6 py-4 text-center text-sm font-mono text-gray-700">{record.out}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(record.status)}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        record.poin === 1
                          ? "bg-emerald-50 text-emerald-700"
                          : record.poin === 0.5
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {record.poin}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {record.photo ? (
                      <button
                        onClick={() => {
                          setSelectedPhoto({ photo: record.photo!, name: record.name, date: record.date });
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
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data absensi ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Preview Modal */}
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
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Foto Absensi</h3>
                <p className="text-sm text-gray-500 mb-1">{selectedPhoto.name}</p>
                <p className="text-xs text-gray-400 mb-4">{selectedPhoto.date}</p>
                <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 flex flex-col items-center justify-center gap-2">
                  <Camera size={40} className="text-gray-300" />
                  <span className="text-sm font-medium text-gray-500">{selectedPhoto.photo}</span>
                  <span className="text-xs text-gray-400">Preview foto absensi</span>
                </div>
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
                <p className="text-gray-500 text-sm mb-6">Pilih format file untuk mengunduh data absensi yang difilter.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExport}
                    className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all group"
                  >
                    <FileSpreadsheet size={24} className="mb-2 text-gray-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-medium">Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={handleExport}
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

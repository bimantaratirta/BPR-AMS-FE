import { useState } from "react";
import { Search, Download, Calendar, Filter, FileSpreadsheet, FileText, Clock, Timer } from "lucide-react";
import { motion } from "framer-motion";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("Semua Cabang");
  const [selectedDate, setSelectedDate] = useState("14 Feb 2026");
  const [showExport, setShowExport] = useState(false);

  const filteredData = attendanceData.filter((record) => {
    const matchSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) || record.nik.includes(searchTerm);
    const matchBranch = selectedBranch === "Semua Cabang" || record.branch === selectedBranch;
    const matchDate = record.date === selectedDate;
    return matchSearch && matchBranch && matchDate;
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hadir</p>
              <p className="text-2xl font-bold text-gray-900">{stats.hadir}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Terlambat</p>
              <p className="text-2xl font-bold text-gray-900">{stats.terlambat}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Izin / Cuti</p>
              <p className="text-2xl font-bold text-gray-900">{stats.izin}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Point System Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Aturan Poin Kehadiran</h3>
        <div className="flex flex-wrap gap-4 text-xs text-blue-700">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Sebelum 08:00 → <strong>1 poin</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            08:01 – 08:30 → <strong>0.5 poin</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            Setelah 08:30 → <strong>0 poin</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Izin / Cuti → <strong>0 poin</strong>
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau NIK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 appearance-none cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 appearance-none cursor-pointer"
          >
            <option value="14 Feb 2026">14 Feb 2026</option>
            <option value="13 Feb 2026">13 Feb 2026</option>
          </select>
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Ekspor
            </button>
            {showExport && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                <button className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left">
                  <FileSpreadsheet size={16} className="text-green-600" />
                  Ekspor Excel
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left border-t border-gray-100">
                  <FileText size={16} className="text-red-500" />
                  Ekspor PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Tanggal</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">NIK</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nama</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Cabang</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Masuk</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Keluar</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Timer size={14} />
                    Durasi
                  </div>
                </th>
                <th className="text-left px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Poin</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((record, idx) => (
                <tr
                  key={`${record.nik}-${record.date}-${idx}`}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{record.date}</td>
                  <td className="px-5 py-3.5 text-gray-600 font-mono text-xs">{record.nik}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{record.name}</td>
                  <td className="px-5 py-3.5 text-gray-600">{record.branch}</td>
                  <td className="px-5 py-3.5 text-gray-600 font-mono">{record.in}</td>
                  <td className="px-5 py-3.5 text-gray-600 font-mono">{record.out}</td>
                  <td className="px-5 py-3.5 text-gray-600 font-mono">{record.duration}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                        record.status,
                      )}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        record.poin === 1
                          ? "bg-emerald-50 text-emerald-600"
                          : record.poin === 0.5
                            ? "bg-amber-50 text-amber-600"
                            : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      {record.poin}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Tidak ada data absensi ditemukan</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

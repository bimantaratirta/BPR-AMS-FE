import { useState } from "react";
import { Search, Filter, Star, Clock, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

interface EmployeePoints {
  name: string;
  nik: string;
  branch: string;
  tepatWaktu: number;
  setengahPoin: number;
  terlambat: number;
  totalPoin: number;
}

const employeePointsData: EmployeePoints[] = [
  { name: "Andi Pratama", nik: "2023001", branch: "Kantor Pusat", tepatWaktu: 16, setengahPoin: 4, terlambat: 2, totalPoin: 18 },
  { name: "Siti Rahayu", nik: "2023002", branch: "Kantor Pusat", tepatWaktu: 19, setengahPoin: 2, terlambat: 1, totalPoin: 20 },
  { name: "Budi Santoso", nik: "2023003", branch: "Cabang Sudirman", tepatWaktu: 15, setengahPoin: 5, terlambat: 2, totalPoin: 17.5 },
  { name: "Dewi Lestari", nik: "2023004", branch: "Cabang Sudirman", tepatWaktu: 14, setengahPoin: 4, terlambat: 4, totalPoin: 16 },
  { name: "Rizki Hidayat", nik: "2023005", branch: "Kantor Pusat", tepatWaktu: 16, setengahPoin: 4, terlambat: 2, totalPoin: 18 },
  { name: "Maya Sari", nik: "2023006", branch: "Cabang Gatot Subroto", tepatWaktu: 15, setengahPoin: 3, terlambat: 4, totalPoin: 16.5 },
  { name: "Ahmad Fauzi", nik: "2023007", branch: "Cabang Sudirman", tepatWaktu: 16, setengahPoin: 4, terlambat: 2, totalPoin: 18 },
  { name: "Lina Marlina", nik: "2023008", branch: "Kantor Pusat", tepatWaktu: 19, setengahPoin: 2, terlambat: 1, totalPoin: 20 },
  { name: "Hendra Wijaya", nik: "2023009", branch: "Cabang Gatot Subroto", tepatWaktu: 22, setengahPoin: 0, terlambat: 0, totalPoin: 22 },
  { name: "Putri Wulandari", nik: "2023010", branch: "Cabang Sudirman", tepatWaktu: 15, setengahPoin: 4, terlambat: 3, totalPoin: 17 },
];

const branches = ["Semua Cabang", "Kantor Pusat", "Cabang Sudirman", "Cabang Gatot Subroto", "Kas Pasar Minggu", "Kas Kemang"];

export function PointsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("Semua Cabang");
  const [showBranchFilter, setShowBranchFilter] = useState(false);

  const filteredData = employeePointsData.filter((emp) => {
    const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.nik.includes(searchTerm);
    const matchBranch = selectedBranch === "Semua Cabang" || emp.branch === selectedBranch;
    return matchSearch && matchBranch;
  });

  const totalPoin = filteredData.reduce((sum, e) => sum + e.totalPoin, 0);
  const avgPoin = filteredData.length > 0 ? (totalPoin / filteredData.length).toFixed(1) : "0";
  const totalTepatWaktu = filteredData.reduce((sum, e) => sum + e.tepatWaktu, 0);
  const totalTerlambat = filteredData.reduce((sum, e) => sum + e.terlambat, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      {/* Aturan Poin */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Star size={20} className="text-amber-500" />
          Aturan Poin Kehadiran
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700">Sampai 08:00</p>
              <p className="text-xs text-emerald-600">+1 Poin</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-700">08:01 - 08:30</p>
              <p className="text-xs text-amber-600">+0.5 Poin</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">Setelah 08:30</p>
              <p className="text-xs text-red-600">0 Poin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Poin", value: totalPoin, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Rata-rata", value: avgPoin, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Tepat Waktu", value: totalTepatWaktu, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Terlambat", value: totalTerlambat, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">{stat.label}</span>
            <span className={`text-xl font-bold px-3 py-1 rounded-lg ${stat.bg} ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative z-20">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau NIK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowBranchFilter(!showBranchFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Filter size={18} />
              <span className="hidden sm:inline text-sm">{selectedBranch === "Semua Cabang" ? "Filter Cabang" : selectedBranch}</span>
              <ChevronDown size={16} />
            </button>
            {showBranchFilter && (
              <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30">
                {branches.map((branch) => (
                  <button
                    key={branch}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setShowBranchFilter(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedBranch === branch ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"}`}
                  >
                    {branch}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Karyawan */}
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
              {filteredData.map((emp) => (
                <tr key={emp.nik} className="hover:bg-gray-50/80 transition-colors">
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
                  <td className="px-6 py-4 text-center text-sm text-emerald-600 font-medium">{emp.tepatWaktu}</td>
                  <td className="px-6 py-4 text-center text-sm text-amber-600 font-medium">{emp.setengahPoin}</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600 font-medium">{emp.terlambat}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        emp.totalPoin >= 20
                          ? "bg-emerald-50 text-emerald-700"
                          : emp.totalPoin >= 17
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {emp.totalPoin}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

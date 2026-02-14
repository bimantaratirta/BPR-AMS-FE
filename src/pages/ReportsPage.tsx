import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText, Calendar, Filter, Eye, Timer } from "lucide-react";
import { motion } from "framer-motion";

const branches = [
  "Semua Cabang",
  "Kantor Pusat",
  "Cabang Sudirman",
  "Cabang Gatot Subroto",
  "Kas Pasar Minggu",
  "Kas Kemang",
];

const reportData = [
  {
    nik: "2023001",
    name: "Andi Pratama",
    branch: "Kantor Pusat",
    hadir: 20,
    terlambat: 2,
    izin: 1,
    totalDurasi: "176j 30m",
    poin: 18.5,
  },
  {
    nik: "2023002",
    name: "Siti Rahayu",
    branch: "Kantor Pusat",
    hadir: 21,
    terlambat: 1,
    izin: 0,
    totalDurasi: "185j 15m",
    poin: 20.5,
  },
  {
    nik: "2023003",
    name: "Budi Santoso",
    branch: "Cabang Sudirman",
    hadir: 19,
    terlambat: 3,
    izin: 0,
    totalDurasi: "170j 45m",
    poin: 17.5,
  },
  {
    nik: "2023004",
    name: "Dewi Lestari",
    branch: "Cabang Sudirman",
    hadir: 18,
    terlambat: 2,
    izin: 2,
    totalDurasi: "158j 20m",
    poin: 16,
  },
  {
    nik: "2023005",
    name: "Rizki Hidayat",
    branch: "Kantor Pusat",
    hadir: 20,
    terlambat: 2,
    izin: 0,
    totalDurasi: "178j 10m",
    poin: 18,
  },
  {
    nik: "2023006",
    name: "Maya Sari",
    branch: "Cabang Gatot Subroto",
    hadir: 17,
    terlambat: 1,
    izin: 4,
    totalDurasi: "150j 0m",
    poin: 16.5,
  },
  {
    nik: "2023007",
    name: "Ahmad Fauzi",
    branch: "Cabang Sudirman",
    hadir: 20,
    terlambat: 2,
    izin: 0,
    totalDurasi: "180j 5m",
    poin: 18.5,
  },
  {
    nik: "2023008",
    name: "Lina Marlina",
    branch: "Kantor Pusat",
    hadir: 21,
    terlambat: 1,
    izin: 0,
    totalDurasi: "184j 50m",
    poin: 20.5,
  },
  {
    nik: "2023009",
    name: "Hendra Wijaya",
    branch: "Cabang Gatot Subroto",
    hadir: 22,
    terlambat: 0,
    izin: 0,
    totalDurasi: "193j 20m",
    poin: 22,
  },
  {
    nik: "2023010",
    name: "Putri Wulandari",
    branch: "Cabang Sudirman",
    hadir: 19,
    terlambat: 2,
    izin: 1,
    totalDurasi: "168j 15m",
    poin: 17,
  },
];

export function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("Semua Cabang");
  const [showPreview, setShowPreview] = useState(false);

  const filteredData = reportData.filter((r) => {
    return selectedBranch === "Semua Cabang" || r.branch === selectedBranch;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Filter Laporan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Tanggal Mulai</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Tanggal Selesai</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Cabang</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 appearance-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Eye size={16} />
            Tampilkan Pratinjau
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
            <FileSpreadsheet size={16} />
            Ekspor Excel
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
            <FileText size={16} />
            Ekspor PDF
          </button>
        </div>
      </div>

      {/* Point System Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Aturan Poin Kehadiran</h3>
        <div className="flex flex-wrap gap-4 text-xs text-blue-700">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Sampai 08:00 → <strong>1 poin</strong> (Hadir)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            08:01 – 08:30 → <strong>0.5 poin</strong> (Terlambat)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            Setelah 08:30 → <strong>0 poin</strong> (Terlambat)
          </span>
        </div>
      </div>

      {/* Preview Table */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Pratinjau Laporan Kehadiran</h3>
            <p className="text-xs text-gray-500 mt-1">
              {startDate && endDate ? `Periode: ${startDate} s/d ${endDate}` : "Semua periode"} •{" "}
              {selectedBranch !== "Semua Cabang" ? selectedBranch : "Semua Cabang"}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">NIK</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nama</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Cabang
                  </th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Hadir
                  </th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Terlambat
                  </th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Izin
                  </th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <Timer size={14} />
                      Total Durasi
                    </div>
                  </th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Poin
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row) => (
                  <tr key={row.nik} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-gray-600 font-mono text-xs">{row.nik}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{row.name}</td>
                    <td className="px-5 py-3 text-gray-600">{row.branch}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 text-xs font-bold">
                        {row.hadir}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-600 text-xs font-bold">
                        {row.terlambat}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                        {row.izin}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-gray-600 font-mono text-xs">{row.totalDurasi}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-8 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                        {row.poin}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

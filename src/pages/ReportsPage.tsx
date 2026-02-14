import { useState } from "react";
import { FileText, Download, Filter, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const reportData = [
  {
    name: "Andi Pratama",
    nik: "2023001",
    branch: "Kantor Pusat",
    hadir: 20,
    terlambat: 2,
    izin: 1,
    alpha: 0,
    poin: 18.5,
  },
  {
    name: "Siti Rahayu",
    nik: "2023002",
    branch: "Kantor Pusat",
    hadir: 21,
    terlambat: 1,
    izin: 0,
    alpha: 0,
    poin: 20.5,
  },
  {
    name: "Budi Santoso",
    nik: "2023003",
    branch: "Cabang Sudirman",
    hadir: 19,
    terlambat: 3,
    izin: 0,
    alpha: 0,
    poin: 17.5,
  },
  {
    name: "Dewi Lestari",
    nik: "2023004",
    branch: "Cabang Sudirman",
    hadir: 18,
    terlambat: 2,
    izin: 2,
    alpha: 0,
    poin: 16,
  },
  {
    name: "Rizki Hidayat",
    nik: "2023005",
    branch: "Kantor Pusat",
    hadir: 20,
    terlambat: 2,
    izin: 0,
    alpha: 1,
    poin: 18,
  },
  {
    name: "Maya Sari",
    nik: "2023006",
    branch: "Cabang Gatot Subroto",
    hadir: 17,
    terlambat: 1,
    izin: 4,
    alpha: 0,
    poin: 16.5,
  },
  {
    name: "Ahmad Fauzi",
    nik: "2023007",
    branch: "Cabang Sudirman",
    hadir: 20,
    terlambat: 2,
    izin: 0,
    alpha: 0,
    poin: 18.5,
  },
  {
    name: "Lina Marlina",
    nik: "2023008",
    branch: "Kantor Pusat",
    hadir: 21,
    terlambat: 1,
    izin: 0,
    alpha: 0,
    poin: 20.5,
  },
  {
    name: "Hendra Wijaya",
    nik: "2023009",
    branch: "Cabang Gatot Subroto",
    hadir: 22,
    terlambat: 0,
    izin: 0,
    alpha: 0,
    poin: 22,
  },
  {
    name: "Putri Wulandari",
    nik: "2023010",
    branch: "Cabang Sudirman",
    hadir: 19,
    terlambat: 2,
    izin: 1,
    alpha: 0,
    poin: 17,
  },
];

export function ReportsPage() {
  const [isGenerated, setIsGenerated] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    branch: "Semua Cabang",
  });

  const handleGenerate = () => {
    setIsGenerated(true);
  };

  const handleExport = (type: "Excel" | "PDF") => {
    setToastMessage(`Laporan berhasil diexport ke ${type}!`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const filteredData = reportData.filter((r) => {
    return filters.branch === "Semua Cabang" || r.branch === filters.branch;
  });

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
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
              <option>Kantor Pusat</option>
              <option>Cabang Sudirman</option>
              <option>Cabang Gatot Subroto</option>
            </select>
          </div>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Generate Laporan
          </button>
        </div>
      </div>

      {/* Preview & Export */}
      {isGenerated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Preview Laporan Absensi</h3>
              <p className="text-sm text-gray-500">
                Periode: {filters.startDate || "01 Feb 2026"} - {filters.endDate || "14 Feb 2026"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport("Excel")}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
              >
                <Download size={18} />
                Excel
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
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

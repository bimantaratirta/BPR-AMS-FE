import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Plus, Edit2, Trash2, Smartphone, X, AlertTriangle, ChevronDown, Eye, EyeOff, Users, WifiOff } from "lucide-react";
interface Employee {
  nik: string;
  name: string;
  branch: string;
  role: string;
  phone: string;
  email: string;
  password: string;
  deviceId: boolean;
}
export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      nik: "2023001",
      name: "Andi Pratama",
      branch: "Kantor Pusat",
      role: "IT Support",
      phone: "081234567890",
      email: "andi.pratama@bpr.co.id",
      password: "pass123",
      deviceId: true,
    },
    {
      nik: "2023002",
      name: "Siti Rahayu",
      branch: "Cabang Sudirman",
      role: "HR Manager",
      phone: "081234567891",
      email: "siti.rahayu@bpr.co.id",
      password: "pass123",
      deviceId: true,
    },
    {
      nik: "2023003",
      name: "Budi Santoso",
      branch: "Cabang Gatot Subroto",
      role: "Finance Staff",
      phone: "081234567892",
      email: "budi.santoso@bpr.co.id",
      password: "pass123",
      deviceId: false,
    },
    {
      nik: "2023004",
      name: "Dewi Lestari",
      branch: "Kas Pasar Minggu",
      role: "Marketing",
      phone: "081234567893",
      email: "dewi.lestari@bpr.co.id",
      password: "pass123",
      deviceId: true,
    },
    {
      nik: "2023005",
      name: "Rizki Hidayat",
      branch: "Kas Kemang",
      role: "Operations",
      phone: "081234567894",
      email: "rizki.hidayat@bpr.co.id",
      password: "pass123",
      deviceId: true,
    },
    {
      nik: "2023006",
      name: "Putri Wulandari",
      branch: "Kantor Pusat",
      role: "Sales",
      phone: "081234567895",
      email: "putri.wulandari@bpr.co.id",
      password: "pass123",
      deviceId: true,
    },
    {
      nik: "2023007",
      name: "Ahmad Fauzi",
      branch: "Cabang Sudirman",
      role: "Teller",
      phone: "081234567896",
      email: "ahmad.fauzi@bpr.co.id",
      password: "pass123",
      deviceId: false,
    },
    {
      nik: "2023008",
      name: "Ratna Sari",
      branch: "Cabang Gatot Subroto",
      role: "CS",
      phone: "081234567897",
      email: "ratna.sari@bpr.co.id",
      password: "pass123",
      deviceId: true,
    },
    {
      nik: "2023009",
      name: "Eko Prasetyo",
      branch: "Kas Pasar Minggu",
      role: "Security",
      phone: "081234567898",
      email: "eko.prasetyo@bpr.co.id",
      password: "pass123",
      deviceId: true,
    },
    {
      nik: "2023010",
      name: "Nina Marlina",
      branch: "Kas Kemang",
      role: "Admin",
      phone: "081234567899",
      email: "nina.marlina@bpr.co.id",
      password: "pass123",
      deviceId: true,
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("Semua");
  const [deviceFilter, setDeviceFilter] = useState<"all" | "registered" | "unregistered">("all");
  const [showBranchFilter, setShowBranchFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Employee>({
    nik: "",
    name: "",
    branch: "Kantor Pusat",
    role: "",
    phone: "",
    email: "",
    password: "",
    deviceId: false,
  });
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.nik.includes(searchTerm);
    const matchesBranch = branchFilter === "Semua" || emp.branch === branchFilter;
    const matchesDevice =
      deviceFilter === "all" ||
      (deviceFilter === "registered" && emp.deviceId) ||
      (deviceFilter === "unregistered" && !emp.deviceId);
    return matchesSearch && matchesBranch && matchesDevice;
  });
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handleAdd = () => {
    setFormData({
      nik: "",
      name: "",
      branch: "Kantor Pusat",
      role: "",
      phone: "",
      email: "",
      password: "",
      deviceId: false,
    });
    setShowPassword(false);
    setShowAddModal(true);
  };
  const handleEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      ...emp,
      password: "",
    });
    setShowPassword(false);
    setShowEditModal(true);
  };
  const handleDeleteClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowDeleteDialog(true);
  };
  const handleResetClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowResetDialog(true);
  };
  const saveNewEmployee = () => {
    setEmployees([
      ...employees,
      {
        ...formData,
        deviceId: false,
      },
    ]);
    setShowAddModal(false);
  };
  const updateEmployee = () => {
    setEmployees(
      employees.map((emp) =>
        emp.nik === selectedEmployee?.nik
          ? {
              ...formData,
              password: formData.password || emp.password,
            }
          : emp,
      ),
    );
    setShowEditModal(false);
  };
  const deleteEmployee = () => {
    setEmployees(employees.filter((emp) => emp.nik !== selectedEmployee?.nik));
    setShowDeleteDialog(false);
  };
  const resetDevice = () => {
    setEmployees(
      employees.map((emp) =>
        emp.nik === selectedEmployee?.nik
          ? {
              ...emp,
              deviceId: false,
            }
          : emp,
      ),
    );
    setShowResetDialog(false);
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="space-y-6"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative z-20">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

            <input
              type="text"
              placeholder="Cari nama atau NIK..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowBranchFilter(!showBranchFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Filter size={20} />
              <span className="hidden sm:inline">{branchFilter === "Semua" ? "Filter Cabang" : branchFilter}</span>
              <ChevronDown size={16} />
            </button>
            {showBranchFilter && (
              <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30">
                {["Semua", "Kantor Pusat", "Cabang Sudirman", "Cabang Gatot Subroto", "Kas Pasar Minggu", "Kas Kemang"].map(
                  (branch) => (
                    <button
                      key={branch}
                      onClick={() => {
                        setBranchFilter(branch);
                        setShowBranchFilter(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${branchFilter === branch ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"}`}
                    >
                      {branch}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          <span>Tambah Karyawan</span>
        </button>
      </div>

      {/* Device Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            key: "all" as const,
            label: "Semua Device",
            value: employees.length,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-200",
          },
          {
            key: "registered" as const,
            label: "Terdaftar",
            value: employees.filter((e) => e.deviceId).length,
            icon: Smartphone,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
          },
          {
            key: "unregistered" as const,
            label: "Belum Ada",
            value: employees.filter((e) => !e.deviceId).length,
            icon: WifiOff,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-200",
          },
        ].map((card) => (
          <button
            key={card.key}
            onClick={() => {
              setDeviceFilter(card.key);
              setCurrentPage(1);
            }}
            className={`bg-white p-4 rounded-xl shadow-sm border transition-all text-left ${
              deviceFilter === card.key ? `${card.border} ring-1 ring-offset-0 ring-current ${card.color}` : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className={`text-2xl font-bold mt-1 ${deviceFilter === card.key ? card.color : "text-gray-900"}`}>{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={20} className={card.color} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">NIK</th>
                <th className="px-6 py-4">Nama Karyawan</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Kantor Cabang</th>
                <th className="px-6 py-4">Jabatan</th>
                <th className="px-6 py-4">Status Device</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => (
                  <tr key={employee.nik} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.nik}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{employee.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{employee.branch}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{employee.role}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${employee.deviceId ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${employee.deviceId ? "bg-emerald-500" : "bg-gray-400"}`}
                        ></span>
                        {employee.deviceId ? "Terdaftar" : "Belum Ada"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleResetClick(employee)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Reset Device ID"
                        >
                          <Smartphone size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(employee)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data karyawan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>
            Menampilkan {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} dari {filteredEmployees.length} karyawan
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from(
              {
                length: totalPages,
              },
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded border ${currentPage === page ? "bg-blue-50 text-blue-600 border-blue-100 font-medium" : "border-gray-200 hover:bg-gray-50"}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{
                scale: 0.95,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.95,
                opacity: 0,
              }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">
                  {showAddModal ? "Tambah Karyawan" : "Edit Data Karyawan"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">NIK</label>
                    <input
                      type="text"
                      value={formData.nik}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nik: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">No. HP</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    placeholder="nama@bpr.co.id"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {showEditModal ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value,
                        })
                      }
                      placeholder={showEditModal ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                      className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Kantor Cabang</label>
                  <select
                    value={formData.branch}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branch: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option>Kantor Pusat</option>
                    <option>Cabang Sudirman</option>
                    <option>Cabang Gatot Subroto</option>
                    <option>Kas Pasar Minggu</option>
                    <option>Kas Kemang</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Jabatan</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={showAddModal ? saveNewEmployee : updateEmployee}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                >
                  {showAddModal ? "Simpan" : "Perbarui"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeleteDialog && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{
                scale: 0.95,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.95,
                opacity: 0,
              }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Karyawan?</h3>
                <p className="text-gray-500 text-sm">
                  Apakah Anda yakin ingin menghapus data karyawan <strong>{selectedEmployee?.name}</strong>? Tindakan ini
                  tidak dapat dibatalkan.
                </p>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={deleteEmployee}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showResetDialog && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{
                scale: 0.95,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.95,
                opacity: 0,
              }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Device ID?</h3>
                <p className="text-gray-500 text-sm">
                  Ini akan menghapus device ID terdaftar untuk <strong>{selectedEmployee?.name}</strong>. Karyawan harus
                  mendaftarkan ulang device mereka saat login berikutnya.
                </p>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
                <button
                  onClick={() => setShowResetDialog(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={resetDevice}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium shadow-sm"
                >
                  Reset Device
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

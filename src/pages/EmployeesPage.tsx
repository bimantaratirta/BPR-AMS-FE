import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Smartphone,
  X,
  AlertTriangle,
  ChevronDown,
  Users,
  WifiOff,
  Loader2,
} from "lucide-react";
import api from "../lib/api";
import { useToast, Toast } from "../components/Toast";
import { useDebounce } from "../hooks/useDebounce";
import { Pagination } from "../components/Pagination";

interface Employee {
  id: string;
  nik: string;
  name: string;
  branchId: string;
  branch?: { id: string; name: string };
  role: string;
  phone: string;
  email: string;
  deviceId: string | null;
  isActive: boolean;
  avatar?: string;
}

interface Branch {
  id: string;
  name: string;
}

interface EmployeeForm {
  nik: string;
  name: string;
  branchId: string;
  role: string;
  phone: string;
  email: string;
  password: string;
  isActive: boolean;
}

export function EmployeesPage() {
  const { toast, show: showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [branchFilter, setBranchFilter] = useState("Semua");
  const [deviceFilter, setDeviceFilter] = useState<"all" | "registered" | "unregistered">("all");
  const [showBranchFilter, setShowBranchFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [deviceCounts, setDeviceCounts] = useState({ total: 0, registered: 0, unregistered: 0 });
  const branchesRef = useRef<Branch[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const emptyForm: EmployeeForm = {
    nik: "",
    name: "",
    branchId: "",
    role: "",
    phone: "",
    email: "",
    password: "",
    isActive: true,
  };
  const [formData, setFormData] = useState<EmployeeForm>(emptyForm);

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const params: any = {
        "pagination[page]": currentPage,
        "pagination[limit]": itemsPerPage,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (branchFilter !== "Semua") {
        const branchObj = branchesRef.current.find((b) => b.name === branchFilter);
        if (branchObj) params["filter[branchId]"] = branchObj.id;
      }
      if (deviceFilter === "registered") params["filter[is_not_null][]"] = "deviceId";
      if (deviceFilter === "unregistered") params["filter[is_null][]"] = "deviceId";
      const res = await api.get("/employees", { params });
      const data = res.data?.data ?? res.data;
      setEmployees(Array.isArray(data) ? data : (data?.data ?? []));
      const pagination = res.data?.pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages ?? 1);
        setTotalItems(pagination.totalItems ?? 0);
      }
      if (res.data?.stats) setDeviceCounts(res.data.stats);
      if (res.data?.branches) {
        branchesRef.current = res.data.branches;
        setBranches(res.data.branches);
      }
    } catch (e: any) {
      setError("Gagal memuat data karyawan.");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, branchFilter, deviceFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAdd = () => {
    setFormData({ ...emptyForm, branchId: branches[0]?.id ?? "" });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      nik: emp.nik,
      name: emp.name,
      branchId: emp.branchId,
      role: emp.role,
      phone: emp.phone ?? "",
      email: emp.email,
      password: "",
      isActive: emp.isActive,
    });
    setFormErrors({});
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

  const parseValidationErrors = (e: any): boolean => {
    const validation = e.response?.data?.errors?.validation;
    if (validation && typeof validation === "object") {
      const mapped: Record<string, string> = {};
      for (const [field, msgs] of Object.entries(validation)) {
        mapped[field] = Array.isArray(msgs) ? (msgs as string[])[0] : String(msgs);
      }
      setFormErrors(mapped);
      return true;
    }
    return false;
  };

  const saveNewEmployee = async () => {
    setIsSaving(true);
    setFormErrors({});
    try {
      await api.post("/employees", {
        nik: formData.nik,
        name: formData.name,
        branchId: formData.branchId,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        isActive: formData.isActive,
      });
      setShowAddModal(false);
      fetchEmployees();
    } catch (e: any) {
      if (!parseValidationErrors(e)) {
        showToast(e.response?.data?.message ?? "Gagal menambah karyawan.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateEmployee = async () => {
    if (!selectedEmployee) return;
    setIsSaving(true);
    try {
      const payload: any = {
        nik: formData.nik,
        name: formData.name,
        branchId: formData.branchId,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        isActive: formData.isActive,
      };
      if (formData.password) payload.password = formData.password;
      const formDataObj = new FormData();
      Object.entries(payload).forEach(([k, v]) => formDataObj.append(k, String(v)));
      await api.put(`/employees/${selectedEmployee.id}`, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowEditModal(false);
      fetchEmployees();
    } catch (e: any) {
      if (!parseValidationErrors(e)) {
        showToast(e.response?.data?.message ?? "Gagal memperbarui karyawan.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      await api.delete(`/employees/${selectedEmployee.id}`);
      setShowDeleteDialog(false);
      fetchEmployees();
    } catch (e: any) {
      showToast(e.response?.data?.message ?? "Gagal menghapus karyawan.", "error");
    }
  };

  const resetDevice = async () => {
    if (!selectedEmployee) return;
    try {
      await api.put(
        `/employees/${selectedEmployee.id}`,
        { deviceId: null },
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      setShowResetDialog(false);
      fetchEmployees();
    } catch (e: any) {
      showToast(e.response?.data?.message ?? "Gagal mereset device.", "error");
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
                {["Semua", ...branches.map((b) => b.name)].map((branch) => (
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
                ))}
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
            label: "Semua Karyawan",
            value: deviceCounts.total,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-200",
          },
          {
            key: "registered" as const,
            label: "Device Terdaftar",
            value: deviceCounts.registered,
            icon: Smartphone,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
          },
          {
            key: "unregistered" as const,
            label: "Belum Ada Device",
            value: deviceCounts.unregistered,
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
            className={`bg-white p-4 rounded-xl shadow-sm border transition-all text-left ${deviceFilter === card.key ? `${card.border} ring-1 ring-offset-0 ring-current ${card.color}` : "border-gray-100 hover:border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className={`text-2xl font-bold mt-1 ${deviceFilter === card.key ? card.color : "text-gray-900"}`}>
                  {isLoading ? "..." : card.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={20} className={card.color} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm">{error}</div>}

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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : employees.length > 0 ? (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50/80 transition-colors group">
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
                    <td className="px-6 py-4 text-sm text-gray-500">{employee.branch?.name ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{employee.role ?? "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${employee.deviceId !== null ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${employee.deviceId !== null ? "bg-emerald-500" : "bg-gray-400"}`}
                        ></span>
                        {employee.deviceId !== null ? "Terdaftar" : "Belum Ada"}
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="karyawan"
        />
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
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
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">NIK (16 digit)</label>
                    <input
                      type="text"
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none ${formErrors.nik ? "border-red-400" : "border-gray-200"}`}
                    />
                    {formErrors.nik && <p className="text-xs text-red-500">{formErrors.nik}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">No. HP</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none ${formErrors.phone ? "border-red-400" : "border-gray-200"}`}
                    />
                    {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none ${formErrors.name ? "border-red-400" : "border-gray-200"}`}
                  />
                  {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@bpr.co.id"
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none ${formErrors.email ? "border-red-400" : "border-gray-200"}`}
                  />
                  {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
                </div>
                {showAddModal && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none ${formErrors.password ? "border-red-400" : "border-gray-200"}`}
                    />
                    {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Kantor Cabang</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Jabatan</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {showAddModal ? "Simpan" : "Perbarui"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeleteDialog && (
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
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Karyawan?</h3>
                <p className="text-gray-500 text-sm">
                  Yakin ingin menghapus <strong>{selectedEmployee?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Device ID?</h3>
                <p className="text-gray-500 text-sm">
                  Ini akan menghapus device ID terdaftar untuk <strong>{selectedEmployee?.name}</strong>.
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

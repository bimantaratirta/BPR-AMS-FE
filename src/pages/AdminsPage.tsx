import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit2, Trash2, X, AlertTriangle, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import api from "../lib/api";
import { useToast, Toast } from "../components/Toast";
import { useDebounce } from "../hooks/useDebounce";

type AdminRole = "SUPER_ADMIN" | "ADMIN" | "VIEWER";
type AdminStatus = "ACTIVE" | "INACTIVE";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
}

interface AdminForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: AdminRole;
  status: AdminStatus;
}

const ROLE_LABEL: Record<AdminRole, string> = { SUPER_ADMIN: "Super Admin", ADMIN: "Admin", VIEWER: "Viewer" };
const ROLE_BADGE: Record<AdminRole, string> = {
  SUPER_ADMIN: "bg-blue-50 text-blue-700",
  ADMIN: "bg-emerald-50 text-emerald-700",
  VIEWER: "bg-gray-100 text-gray-600",
};
const ROLE_AVATAR: Record<AdminRole, string> = {
  SUPER_ADMIN: "bg-gradient-to-br from-blue-500 to-indigo-600",
  ADMIN: "bg-gradient-to-br from-emerald-500 to-teal-600",
  VIEWER: "bg-gradient-to-br from-gray-400 to-gray-500",
};

export function AdminsPage() {
  const { toast, show: showToast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const emptyForm: AdminForm = { name: "", email: "", password: "", password_confirmation: "", role: "ADMIN", status: "ACTIVE" };
  const [formData, setFormData] = useState<AdminForm>(emptyForm);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admins", { params: { get_all: true } });
      const data = res.data?.data ?? res.data;
      setAdmins(Array.isArray(data) ? data : (data?.data ?? []));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const parseValidationErrors = (e: any): boolean => {
    const errors = e.response?.data?.errors;
    const validation = errors?.validation;
    if (validation && typeof validation === "object") {
      const mapped: Record<string, string> = {};
      for (const [field, msgs] of Object.entries(validation)) {
        mapped[field] = Array.isArray(msgs) ? (msgs as string[])[0] : String(msgs);
      }
      setFormErrors(mapped);
      return true;
    }
    // Handle duplicate email (409 or message contains "sudah" / "already")
    const msg: string = e.response?.data?.message ?? "";
    if (e.response?.status === 409 || /sudah|already|duplicate|exist/i.test(msg)) {
      setFormErrors({ email: msg || "Email sudah terdaftar." });
      return true;
    }
    return false;
  };

  const handleAdd = () => {
    setFormData(emptyForm);
    setFormErrors({});
    setShowPassword(false);
    setShowAddModal(true);
  };

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({ name: admin.name, email: admin.email, password: "", password_confirmation: "", role: admin.role, status: admin.status });
    setFormErrors({});
    setShowPassword(false);
    setShowEditModal(true);
  };

  const handleDeleteClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowDeleteDialog(true);
  };

  const saveNewAdmin = async () => {
    setIsSaving(true);
    setFormErrors({});
    try {
      await api.post("/auth/admin/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role,
        status: formData.status,
      });
      setShowAddModal(false);
      fetchAdmins();
    } catch (e: any) {
      if (!parseValidationErrors(e)) {
        showToast(e.response?.data?.message ?? "Gagal menambah admin.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateAdmin = async () => {
    if (!selectedAdmin) return;
    setIsSaving(true);
    setFormErrors({});
    try {
      const payload: any = { name: formData.name, email: formData.email, role: formData.role, status: formData.status };
      if (formData.password) {
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }
      await api.put(`/admins/${selectedAdmin.id}`, payload);
      setShowEditModal(false);
      fetchAdmins();
    } catch (e: any) {
      if (!parseValidationErrors(e)) {
        showToast(e.response?.data?.message ?? "Gagal memperbarui admin.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAdmin = async () => {
    if (!selectedAdmin) return;
    try {
      await api.delete(`/admins/${selectedAdmin.id}`);
      setShowDeleteDialog(false);
      fetchAdmins();
    } catch (e: any) {
      showToast(e.response?.data?.message ?? "Gagal menghapus admin.", "error");
    }
  };

  const toggleStatus = async (admin: Admin) => {
    try {
      const newStatus: AdminStatus = admin.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await api.put(`/admins/${admin.id}`, { status: newStatus });
      fetchAdmins();
    } catch (e: any) {
      showToast(e.response?.data?.message ?? "Gagal mengubah status.", "error");
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 sm:w-64 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari admin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          <span>Tambah Admin</span>
        </button>
      </div>

      {/* Admin Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          Memuat data...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAdmins.map((admin) => (
            <div key={admin.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${ROLE_AVATAR[admin.role]}`}
                  >
                    {admin.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{admin.name}</h3>
                    <p className="text-xs text-gray-500">{admin.email}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(admin)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ubah"
                  >
                    <Edit2 size={14} />
                  </button>
                  {admin.role !== "SUPER_ADMIN" && (
                    <button
                      onClick={() => handleDeleteClick(admin)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE[admin.role]}`}
                >
                  <Shield size={12} />
                  {ROLE_LABEL[admin.role]}
                </span>
                <button
                  onClick={() => toggleStatus(admin)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${admin.status === "ACTIVE" ? "bg-emerald-500" : "bg-gray-300"}`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${admin.status === "ACTIVE" ? "left-5" : "left-0.5"}`}
                  />
                </button>
              </div>
            </div>
          ))}
          {filteredAdmins.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">Tidak ada admin ditemukan.</div>
          )}
        </div>
      )}

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
                <h3 className="text-lg font-bold text-gray-900">{showAddModal ? "Tambah Admin" : "Edit Admin"}</h3>
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
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {showEditModal ? "Password Baru (kosongkan jika tidak diubah)" : "Kata Sandi"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={showEditModal ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                      className={`w-full px-3 py-2 pr-10 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none ${formErrors.password ? "border-red-400" : "border-gray-200"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
                </div>
                {(showAddModal || formData.password) && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Konfirmasi Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password_confirmation}
                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                        placeholder="Ulangi password"
                        className={`w-full px-3 py-2 pr-10 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none ${formErrors.password_confirmation ? "border-red-400" : "border-gray-200"}`}
                      />
                    </div>
                    {formErrors.password_confirmation && <p className="text-xs text-red-500">{formErrors.password_confirmation}</p>}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
                      className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none ${formErrors.role ? "border-red-400" : "border-gray-200"}`}
                    >
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="ADMIN">Admin</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    {formErrors.role && <p className="text-xs text-red-500">{formErrors.role}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as AdminStatus })}
                      className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none ${formErrors.status ? "border-red-400" : "border-gray-200"}`}
                    >
                      <option value="ACTIVE">Aktif</option>
                      <option value="INACTIVE">Nonaktif</option>
                    </select>
                    {formErrors.status && <p className="text-xs text-red-500">{formErrors.status}</p>}
                  </div>
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
                  onClick={showAddModal ? saveNewAdmin : updateAdmin}
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Admin?</h3>
                <p className="text-gray-500 text-sm">
                  Yakin ingin menghapus <strong>{selectedAdmin?.name}</strong>?
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
                  onClick={deleteAdmin}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

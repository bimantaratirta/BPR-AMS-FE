import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit2, Trash2, X, AlertTriangle, Shield, Eye, EyeOff } from "lucide-react";
interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "Super Admin" | "Admin" | "Viewer";
  status: "active" | "inactive";
}
export function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: "1",
      name: "Admin User",
      email: "admin@bpr.co.id",
      password: "admin123",
      role: "Super Admin",
      status: "active",
    },
    {
      id: "2",
      name: "Rina Kusuma",
      email: "rina.kusuma@bpr.co.id",
      password: "pass123",
      role: "Admin",
      status: "active",
    },
    {
      id: "3",
      name: "Hendra Wijaya",
      email: "hendra.w@bpr.co.id",
      password: "pass123",
      role: "Admin",
      status: "active",
    },
    {
      id: "4",
      name: "Lina Sari",
      email: "lina.sari@bpr.co.id",
      password: "pass123",
      role: "Viewer",
      status: "inactive",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState<Omit<Admin, "id">>({
    name: "",
    email: "",
    password: "",
    role: "Admin",
    status: "active",
  });
  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const handleAdd = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Admin",
      status: "active",
    });
    setShowPassword(false);
    setShowAddModal(true);
  };
  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role,
      status: admin.status,
    });
    setShowPassword(false);
    setShowEditModal(true);
  };
  const handleDeleteClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowDeleteDialog(true);
  };
  const saveNewAdmin = () => {
    setAdmins([
      ...admins,
      {
        ...formData,
        id: Date.now().toString(),
      },
    ]);
    setShowAddModal(false);
  };
  const updateAdmin = () => {
    setAdmins(
      admins.map((a) =>
        a.id === selectedAdmin?.id
          ? {
              ...a,
              ...formData,
              password: formData.password || a.password,
            }
          : a,
      ),
    );
    setShowEditModal(false);
  };
  const deleteAdmin = () => {
    setAdmins(admins.filter((a) => a.id !== selectedAdmin?.id));
    setShowDeleteDialog(false);
  };
  const toggleStatus = (admin: Admin) => {
    setAdmins(
      admins.map((a) =>
        a.id === admin.id
          ? {
              ...a,
              status: a.status === "active" ? "inactive" : "active",
            }
          : a,
      ),
    );
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 sm:w-64 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

          <input
            type="text"
            placeholder="Cari admin..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAdmins.map((admin) => (
          <div key={admin.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${admin.role === "Super Admin" ? "bg-gradient-to-br from-blue-500 to-indigo-600" : admin.role === "Admin" ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-gray-400 to-gray-500"}`}
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
                {admin.role !== "Super Admin" && (
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
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${admin.role === "Super Admin" ? "bg-blue-50 text-blue-700" : admin.role === "Admin" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
              >
                <Shield size={12} />
                {admin.role}
              </span>
              <button
                onClick={() => toggleStatus(admin)}
                className={`relative w-10 h-5 rounded-full transition-colors ${admin.status === "active" ? "bg-emerald-500" : "bg-gray-300"}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${admin.status === "active" ? "left-5" : "left-0.5"}`}
                />
              </button>
            </div>
          </div>
        ))}

        {filteredAdmins.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">Tidak ada admin ditemukan.</div>
        )}
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
              <div className="p-6 space-y-4">
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
                    {showEditModal ? "Password Baru (kosongkan jika tidak diubah)" : "Kata Sandi"}
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
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Admin?</h3>
                <p className="text-gray-500 text-sm">
                  Apakah Anda yakin ingin menghapus <strong>{selectedAdmin?.name}</strong>? Admin ini tidak akan bisa
                  mengakses sistem lagi.
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

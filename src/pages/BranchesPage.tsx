import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, Navigation, Edit2, Trash2, Plus, Building2, X, AlertTriangle, Loader2 } from "lucide-react";
import api from "../lib/api";
import { useToast, Toast } from "../components/Toast";

interface Branch {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  _count?: { employees: number };
}

interface BranchForm {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  radius: string;
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
  </div>
);

export function BranchesPage() {
  const { toast, show: showToast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const emptyForm: BranchForm = { name: "", address: "", latitude: "", longitude: "", radius: "50" };
  const [formData, setFormData] = useState<BranchForm>(emptyForm);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/branch", { params: { get_all: true } });
      const data = res.data?.data ?? res.data;
      setBranches(Array.isArray(data) ? data : (data?.data ?? []));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleAdd = () => {
    setFormData(emptyForm);
    setShowAddModal(true);
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      latitude: String(branch.latitude),
      longitude: String(branch.longitude),
      radius: String(branch.radius),
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDeleteDialog(true);
  };

  const saveNewBranch = async () => {
    setIsSaving(true);
    try {
      await api.post("/branch", {
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseInt(formData.radius),
      });
      setShowAddModal(false);
      fetchBranches();
    } catch (e: any) {
      showToast(e.response?.data?.message ?? "Gagal menambah cabang.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const updateBranch = async () => {
    if (!selectedBranch) return;
    setIsSaving(true);
    try {
      await api.put(`/branch/${selectedBranch.id}`, {
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseInt(formData.radius),
      });
      setShowEditModal(false);
      fetchBranches();
    } catch (e: any) {
      showToast(e.response?.data?.message ?? "Gagal memperbarui cabang.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBranch = async () => {
    if (!selectedBranch) return;
    try {
      await api.delete(`/branch/${selectedBranch.id}`);
      setShowDeleteDialog(false);
      fetchBranches();
    } catch (e: any) {
      showToast(e.response?.data?.message ?? "Gagal menghapus cabang.", "error");
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
      {/* Map placeholder */}
      <div className="w-full h-64 bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-gray-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="z-10 flex flex-col items-center gap-3">
          <div className="p-4 bg-white rounded-full shadow-sm">
            <MapPin size={32} className="text-blue-500" />
          </div>
          <p className="font-medium">Peta Lokasi Kantor Cabang</p>
          <p className="text-sm text-gray-400">Integrasi Google Maps API</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Daftar Kantor Cabang</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Tambah Cabang</span>
        </button>
      </div>

      {/* Branch Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" /> Memuat data...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{branch.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Navigation size={12} />
                      <span>
                        {branch.latitude?.toFixed(4)}, {branch.longitude?.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(branch)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(branch)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 mb-6 min-h-[40px]">
                <MapPin size={16} className="shrink-0 mt-0.5 text-gray-400" />
                <p>{branch.address}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users size={16} className="text-blue-500" />
                  <span>{branch._count?.employees ?? 0} Karyawan</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                  Radius {branch.radius}m
                </div>
              </div>
            </div>
          ))}
          {branches.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400">Tidak ada data cabang.</div>
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
                <h3 className="text-lg font-bold text-gray-900">
                  {showAddModal ? "Tambah Kantor Cabang" : "Ubah Kantor Cabang"}
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
              <div className="p-6 space-y-4">
                <Field label="Nama Cabang">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </Field>
                <Field label="Alamat Lengkap">
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none h-24 resize-none"
                  />
                </Field>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Latitude">
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="-6.225"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </Field>
                  <Field label="Longitude">
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="106.800"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </Field>
                  <Field label="Radius (m)">
                    <input
                      type="number"
                      value={formData.radius}
                      onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </Field>
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
                  onClick={showAddModal ? saveNewBranch : updateBranch}
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Kantor Cabang?</h3>
                <p className="text-gray-500 text-sm">
                  Yakin ingin menghapus <strong>{selectedBranch?.name}</strong>?
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
                  onClick={deleteBranch}
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

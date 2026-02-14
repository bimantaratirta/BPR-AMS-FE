import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, Navigation, Edit2, Trash2, Plus, Building2, X, AlertTriangle } from "lucide-react";
interface Branch {
  id: number;
  name: string;
  address: string;
  employees: number;
  radius: number;
  coords: string;
}
export function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: 1,
      name: "Kantor Pusat",
      address: "Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan",
      employees: 120,
      radius: 50,
      coords: "-6.225, 106.800",
    },
    {
      id: 2,
      name: "Cabang Sudirman",
      address: "Gedung Artha Graha Lt. 3, SCBD, Jakarta Selatan",
      employees: 45,
      radius: 30,
      coords: "-6.228, 106.805",
    },
    {
      id: 3,
      name: "Cabang Gatot Subroto",
      address: "Menara Mulia, Jl. Gatot Subroto, Jakarta Selatan",
      employees: 38,
      radius: 30,
      coords: "-6.230, 106.810",
    },
    {
      id: 4,
      name: "Kas Pasar Minggu",
      address: "Jl. Raya Pasar Minggu No. 18, Jakarta Selatan",
      employees: 12,
      radius: 20,
      coords: "-6.285, 106.830",
    },
    {
      id: 5,
      name: "Kas Kemang",
      address: "Jl. Kemang Raya No. 45, Jakarta Selatan",
      employees: 15,
      radius: 20,
      coords: "-6.270, 106.820",
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Omit<Branch, "id">>({
    name: "",
    address: "",
    employees: 0,
    radius: 50,
    coords: "",
  });
  const handleAdd = () => {
    setFormData({
      name: "",
      address: "",
      employees: 0,
      radius: 50,
      coords: "",
    });
    setShowAddModal(true);
  };
  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      ...branch,
    });
    setShowEditModal(true);
  };
  const handleDeleteClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDeleteDialog(true);
  };
  const saveNewBranch = () => {
    setBranches([
      ...branches,
      {
        ...formData,
        id: Date.now(),
      },
    ]);
    setShowAddModal(false);
  };
  const updateBranch = () => {
    setBranches(
      branches.map((b) =>
        b.id === selectedBranch?.id
          ? {
              ...formData,
              id: b.id,
            }
          : b,
      ),
    );
    setShowEditModal(false);
  };
  const deleteBranch = () => {
    setBranches(branches.filter((b) => b.id !== selectedBranch?.id));
    setShowDeleteDialog(false);
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
      {/* Map Placeholder */}
      <div className="w-full h-64 bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-gray-400 relative overflow-hidden group">
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

      {/* Branch Cards Grid */}
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
                    <span>{branch.coords}</span>
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
                <span>{branch.employees} Karyawan</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                Radius {branch.radius}m
              </div>
            </div>
          </div>
        ))}
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nama Cabang</label>
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
                  <label className="text-sm font-medium text-gray-700">Alamat Lengkap</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none h-24 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Koordinat (Lat, Long)</label>
                    <input
                      type="text"
                      value={formData.coords}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coords: e.target.value,
                        })
                      }
                      placeholder="-6.225, 106.800"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Radius Absensi (Meter)</label>
                    <input
                      type="number"
                      value={formData.radius}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          radius: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
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
                  onClick={showAddModal ? saveNewBranch : updateBranch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                >
                  {showAddModal ? "Simpan" : "Perbarui"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Dialog */}
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Kantor Cabang?</h3>
                <p className="text-gray-500 text-sm">
                  Apakah Anda yakin ingin menghapus <strong>{selectedBranch?.name}</strong>? Data karyawan yang terhubung
                  mungkin akan terdampak.
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

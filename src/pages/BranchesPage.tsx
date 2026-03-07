import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, Navigation, Edit2, Trash2, Plus, Building2, X, AlertTriangle, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../lib/api";
import { useToast, Toast } from "../components/Toast";
import { Pagination } from "../components/Pagination";

// Fix default marker icon (Leaflet + bundler issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Fit bounds on initial load only
function FitBounds({ branches }: { branches: Branch[] }) {
  const map = useMap();
  const didFit = React.useRef(false);
  useEffect(() => {
    if (didFit.current || branches.length === 0) return;
    didFit.current = true;
    const bounds = L.latLngBounds(branches.map((b) => [b.latitude, b.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [branches, map]);
  return null;
}

// Fly to a specific branch when focused
function FlyTo({ branch }: { branch: Branch | null }) {
  const map = useMap();
  useEffect(() => {
    if (!branch) return;
    map.flyTo([branch.latitude, branch.longitude], 16, { duration: 0.8 });
  }, [branch, map]);
  return null;
}

// Component to pick location on click
function LocationPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

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
  const [focusedBranchId, setFocusedBranchId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const emptyForm: BranchForm = { name: "", address: "", latitude: "", longitude: "", radius: "50" };
  const [formData, setFormData] = useState<BranchForm>(emptyForm);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        "pagination[page]": currentPage,
        "pagination[limit]": itemsPerPage,
      };
      const res = await api.get("/branch", { params });
      const data = res.data?.data ?? res.data;
      setBranches(Array.isArray(data) ? data : (data?.data ?? []));
      const pagination = res.data?.pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages ?? 1);
        setTotalItems(pagination.totalItems ?? 0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [currentPage]);

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
      {/* Map */}
      <div className="w-full h-80 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {!isLoading && (
          <MapContainer
            center={
              branches.length > 0
                ? [branches[0].latitude, branches[0].longitude]
                : [-6.2, 106.8]
            }
            zoom={12}
            className="w-full h-full z-0"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds branches={branches} />
            <FlyTo branch={branches.find((b) => b.id === focusedBranchId) ?? null} />
            {branches.map((branch) => {
              const isFocused = focusedBranchId === branch.id;
              const isDimmed = focusedBranchId !== null && !isFocused;
              return (
                <React.Fragment key={branch.id}>
                  <Marker
                    position={[branch.latitude, branch.longitude]}
                    opacity={isDimmed ? 0.4 : 1}
                    eventHandlers={{
                      click: () => setFocusedBranchId(isFocused ? null : branch.id),
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{branch.name}</strong>
                        <br />
                        <span className="text-gray-500">{branch.address}</span>
                        <br />
                        <span className="text-blue-600 font-medium">
                          Radius: {branch.radius}m · {branch._count?.employees ?? 0} karyawan
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[branch.latitude, branch.longitude]}
                    radius={branch.radius}
                    pathOptions={{
                      color: isFocused ? "#2563eb" : "#3b82f6",
                      fillColor: isFocused ? "#2563eb" : "#3b82f6",
                      fillOpacity: isDimmed ? 0.05 : isFocused ? 0.2 : 0.12,
                      weight: isFocused ? 3 : isDimmed ? 1 : 2,
                      opacity: isDimmed ? 0.3 : 1,
                    }}
                  />
                </React.Fragment>
              );
            })}
          </MapContainer>
        )}
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
              onClick={() => setFocusedBranchId(focusedBranchId === branch.id ? null : branch.id)}
              className={`bg-white p-6 rounded-xl shadow-sm border-2 hover:shadow-md transition-all cursor-pointer group ${
                focusedBranchId === branch.id
                  ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                  : "border-gray-100"
              }`}
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
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
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

      {!isLoading && totalItems > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="cabang"
          />
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
                {/* Map picker */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Pilih Lokasi di Peta</label>
                  <p className="text-xs text-gray-400">Klik pada peta untuk menentukan koordinat</p>
                  <div className="w-full h-48 rounded-lg border border-gray-200 overflow-hidden">
                    <MapContainer
                      center={
                        formData.latitude && formData.longitude
                          ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
                          : [-6.2, 106.8]
                      }
                      zoom={13}
                      className="w-full h-full z-0"
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationPicker
                        onPick={(lat, lng) =>
                          setFormData({ ...formData, latitude: lat.toFixed(6), longitude: lng.toFixed(6) })
                        }
                      />
                      {formData.latitude && formData.longitude && (
                        <>
                          <Marker
                            position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
                          />
                          <Circle
                            center={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
                            radius={parseInt(formData.radius) || 50}
                            pathOptions={{
                              color: "#3b82f6",
                              fillColor: "#3b82f6",
                              fillOpacity: 0.15,
                              weight: 2,
                            }}
                          />
                        </>
                      )}
                    </MapContainer>
                  </div>
                </div>
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

import { useState } from "react";
import { Search, Check, X, Edit3, Calendar, FileText, AlertCircle, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type LeaveStatus = "Menunggu" | "Disetujui" | "Ditolak";

interface LeaveRequest {
  id: number;
  name: string;
  nik: string;
  type: string;
  dates: string;
  reason: string;
  status: LeaveStatus;
  avatar: string;
  attachment?: string;
}

const leaveTypes = ["Izin Cuti", "Izin Sakit", "Izin Setengah Hari"];

const initialRequests: LeaveRequest[] = [
  {
    id: 1,
    name: "Dewi Lestari",
    nik: "2023004",
    type: "Izin Sakit",
    dates: "14 Feb 2026",
    reason: "Demam tinggi dan perlu istirahat",
    status: "Menunggu",
    avatar: "DL",
    attachment: "surat_dokter_dewi.pdf",
  },
  {
    id: 2,
    name: "Maya Sari",
    nik: "2023006",
    type: "Izin Cuti",
    dates: "14 - 16 Feb 2026",
    reason: "Acara pernikahan keluarga",
    status: "Menunggu",
    avatar: "MS",
  },
  {
    id: 3,
    name: "Putri Wulandari",
    nik: "2023010",
    type: "Izin Setengah Hari",
    dates: "14 Feb 2026",
    reason: "Kontrol ke dokter siang",
    status: "Menunggu",
    avatar: "PW",
  },
  {
    id: 4,
    name: "Andi Pratama",
    nik: "2023001",
    type: "Izin Cuti",
    dates: "10 - 12 Feb 2026",
    reason: "Liburan keluarga",
    status: "Disetujui",
    avatar: "AP",
  },
  {
    id: 5,
    name: "Siti Rahayu",
    nik: "2023002",
    type: "Izin Sakit",
    dates: "8 - 9 Feb 2026",
    reason: "Flu berat",
    status: "Disetujui",
    avatar: "SR",
    attachment: "surat_dokter_siti.jpg",
  },
  {
    id: 6,
    name: "Ahmad Fauzi",
    nik: "2023007",
    type: "Izin Cuti",
    dates: "20 - 22 Feb 2026",
    reason: "Acara keluarga di luar kota",
    status: "Ditolak",
    avatar: "AF",
  },
  {
    id: 7,
    name: "Budi Santoso",
    nik: "2023003",
    type: "Izin Setengah Hari",
    dates: "5 Feb 2026",
    reason: "Keperluan ke bank",
    status: "Disetujui",
    avatar: "BS",
  },
];

export function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<LeaveStatus>("Menunggu");
  const [searchTerm, setSearchTerm] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{ filename: string; name: string } | null>(null);

  const filteredRequests = requests.filter((r) => {
    const matchStatus = r.status === activeTab;
    const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.nik.includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const tabs = [
    {
      key: "Menunggu" as LeaveStatus,
      label: "Menunggu",
      count: requests.filter((r) => r.status === "Menunggu").length,
      color: "amber",
    },
    {
      key: "Disetujui" as LeaveStatus,
      label: "Disetujui",
      count: requests.filter((r) => r.status === "Disetujui").length,
      color: "green",
    },
    {
      key: "Ditolak" as LeaveStatus,
      label: "Ditolak",
      count: requests.filter((r) => r.status === "Ditolak").length,
      color: "red",
    },
  ];

  const confirmApprove = () => {
    if (!selectedRequest) return;
    setRequests((prev) => prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: "Disetujui" as const } : r)));
    setShowApproveDialog(false);
    setSelectedRequest(null);
  };

  const confirmReject = () => {
    if (!selectedRequest) return;
    setRequests((prev) => prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: "Ditolak" as const } : r)));
    setShowRejectDialog(false);
    setSelectedRequest(null);
    setRejectReason("");
  };

  const handleEditSave = () => {
    if (!editingRequest) return;
    setRequests((prev) => prev.map((r) => (r.id === editingRequest.id ? editingRequest : r)));
    setShowEditModal(false);
    setEditingRequest(null);
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case "Menunggu":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Disetujui":
        return "bg-green-50 text-green-700 border-green-200";
      case "Ditolak":
        return "bg-red-50 text-red-700 border-red-200";
    }
  };

  const getStatusLabel = (status: LeaveStatus) => {
    switch (status) {
      case "Menunggu":
        return "Menunggu";
      case "Disetujui":
        return "Disetujui";
      case "Ditolak":
        return "Ditolak";
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Izin Cuti":
        return "bg-blue-50 text-blue-700";
      case "Izin Sakit":
        return "bg-purple-50 text-purple-700";
      case "Izin Setengah Hari":
        return "bg-indigo-50 text-indigo-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama atau NIK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {request.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">NIK: {request.nik}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getTypeBadge(request.type)}`}>
                        {request.type}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {request.dates}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{request.reason}</p>
                    {request.attachment && (
                      <button
                        onClick={() => {
                          setSelectedAttachment({ filename: request.attachment!, name: request.name });
                          setShowAttachmentModal(true);
                        }}
                        className="flex items-center gap-1.5 mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        <Paperclip size={12} />
                        Lampiran
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusBadge(request.status)}`}
                  >
                    {getStatusLabel(request.status)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {request.status === "Menunggu" && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowApproveDialog(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    <Check size={16} />
                    Setujui
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setRejectReason("");
                      setShowRejectDialog(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <X size={16} />
                    Tolak
                  </button>
                  <button
                    onClick={() => {
                      setEditingRequest(request);
                      setShowEditModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">Tidak ada pengajuan ditemukan</p>
          </div>
        )}
      </div>

      {/* Approve Dialog */}
      <AnimatePresence>
        {showApproveDialog && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Setujui Permohonan?</h3>
                <p className="text-gray-500 text-sm">
                  Anda akan menyetujui permohonan <strong>{selectedRequest.type}</strong> dari{" "}
                  <strong>{selectedRequest.name}</strong>.
                </p>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
                <button
                  onClick={() => setShowApproveDialog(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={confirmApprove}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm"
                >
                  Setujui
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Dialog with Reason */}
      <AnimatePresence>
        {showRejectDialog && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Tolak Permohonan?</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Anda akan menolak permohonan ini. Silakan masukkan alasan penolakan (opsional).
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 outline-none resize-none h-24"
                  placeholder="Alasan penolakan..."
                />
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
                <button
                  onClick={() => setShowRejectDialog(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={confirmReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm"
                >
                  Tolak
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Pengajuan</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Jenis Izin</label>
                  <select
                    value={editingRequest.type}
                    onChange={(e) =>
                      setEditingRequest({
                        ...editingRequest,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  >
                    {leaveTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Tanggal</label>
                  <input
                    type="text"
                    value={editingRequest.dates}
                    onChange={(e) =>
                      setEditingRequest({
                        ...editingRequest,
                        dates: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Alasan</label>
                  <textarea
                    value={editingRequest.reason}
                    onChange={(e) =>
                      setEditingRequest({
                        ...editingRequest,
                        reason: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleEditSave}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachment Preview Modal */}
      <AnimatePresence>
        {showAttachmentModal && selectedAttachment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => setShowAttachmentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Paperclip size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Lampiran</h3>
                <p className="text-sm text-gray-500 mb-4">Dari: {selectedAttachment.name}</p>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <FileText size={20} />
                    <span className="text-sm font-medium">{selectedAttachment.filename}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                <button
                  onClick={() => setShowAttachmentModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

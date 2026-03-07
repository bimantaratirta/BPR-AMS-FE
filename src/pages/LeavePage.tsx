import { useState, useEffect } from "react";
import { Search, Check, X, Calendar, FileText, AlertCircle, Paperclip, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { useToast, Toast } from "../components/Toast";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
type LeaveStatusDisplay = "Menunggu" | "Disetujui" | "Ditolak";

interface LeaveRequest {
  id: string;
  employee?: { id: string; name: string; nik: string };
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  rejectReason?: string | null;
  attachment?: string | null;
}

const STATUS_MAP: Record<LeaveStatus, LeaveStatusDisplay> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

const STATUS_BADGE: Record<LeaveStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

function formatDate(iso?: string): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function getTypeBadge(type: string): string {
  switch (type) {
    case "IZIN_CUTI":
    case "CUTI":
      return "bg-blue-50 text-blue-700";
    case "IZIN_SAKIT":
    case "SAKIT":
      return "bg-purple-50 text-purple-700";
    case "IZIN_SETENGAH_HARI":
    case "SETENGAH_HARI":
      return "bg-indigo-50 text-indigo-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

const TYPE_LABEL: Record<string, string> = {
  IZIN_CUTI: "Izin Cuti",
  IZIN_SAKIT: "Izin Sakit",
  IZIN_SETENGAH_HARI: "Izin Setengah Hari",
  CUTI: "Izin Cuti",
  SAKIT: "Izin Sakit",
  SETENGAH_HARI: "Izin Setengah Hari",
};

function getDateRange(start?: string, end?: string): string {
  if (!start) return "-";
  const s = formatDate(start);
  if (!end || start === end) return s;
  return `${s} – ${formatDate(end)}`;
}

export function LeavePage() {
  const { toast, show: showToast } = useToast();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LeaveStatus>("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{ url: string; name: string } | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/leave-requests", { params: { get_all: true } });
      const data = res.data?.data ?? res.data;
      setRequests(Array.isArray(data) ? data : (data?.data ?? []));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((r) => {
    const matchStatus = r.status === activeTab;
    const name = r.employee?.name ?? "";
    const nik = r.employee?.nik ?? "";
    const matchSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || nik.includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const counts = {
    PENDING: requests.filter((r) => r.status === "PENDING").length,
    APPROVED: requests.filter((r) => r.status === "APPROVED").length,
    REJECTED: requests.filter((r) => r.status === "REJECTED").length,
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;
    setIsActing(true);
    try {
      await api.put(`/leave-requests/${selectedRequest.id}`, { status: "APPROVED" });
      setShowApproveDialog(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (e: any) {
      showToast(e.response?.data?.message ?? "Gagal menyetujui permohonan.", "error");
    } finally {
      setIsActing(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      showToast("Alasan penolakan wajib diisi.", "error");
      return;
    }
    setIsActing(true);
    try {
      await api.put(`/leave-requests/${selectedRequest.id}`, { status: "REJECTED", rejectReason: rejectReason.trim() });
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectReason("");
      fetchRequests();
    } catch (e: any) {
      showToast(e.response?.data?.message ?? "Gagal menolak permohonan.", "error");
    } finally {
      setIsActing(false);
    }
  };

  const tabs: { key: LeaveStatus; label: string; color: string }[] = [
    { key: "PENDING", label: "Menunggu", color: "amber" },
    { key: "APPROVED", label: "Disetujui", color: "green" },
    { key: "REJECTED", label: "Ditolak", color: "red" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Toast toast={toast} />
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            {tab.label}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              {counts[tab.key]}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" /> Memuat data...
          </div>
        ) : (
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
                      {(request.employee?.name ?? "?")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.employee?.name ?? "-"}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">NIK: {request.employee?.nik ?? "-"}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getTypeBadge(request.type)}`}>
                          {TYPE_LABEL[request.type] ?? request.type}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {getDateRange(request.startDate, request.endDate)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{request.reason}</p>
                      {request.status === "REJECTED" && request.rejectReason && (
                        <div className="mt-2 p-2.5 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-xs font-medium text-red-700">Alasan penolakan:</p>
                          <p className="text-sm text-red-600 mt-0.5">{request.rejectReason}</p>
                        </div>
                      )}
                      {request.attachment && (
                        <button
                          onClick={() => {
                            setSelectedAttachment({ url: request.attachment!, name: request.employee?.name ?? "" });
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
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${STATUS_BADGE[request.status]}`}>
                    {STATUS_MAP[request.status]}
                  </span>
                </div>

                {request.status === "PENDING" && (
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
                        setShowRejectDialog(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <X size={16} />
                      Tolak
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
            {filteredRequests.length === 0 && !isLoading && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-400">Tidak ada pengajuan ditemukan</p>
              </div>
            )}
          </AnimatePresence>
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
                  Anda akan menyetujui permohonan <strong>{TYPE_LABEL[selectedRequest.type] ?? selectedRequest.type}</strong>{" "}
                  dari <strong>{selectedRequest.employee?.name}</strong>.
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
                  disabled={isActing}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {isActing && <Loader2 size={16} className="animate-spin" />}Setujui
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Dialog */}
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
                <p className="text-gray-500 text-sm">
                  Anda akan menolak permohonan dari <strong>{selectedRequest.employee?.name}</strong>.
                </p>
                <textarea
                  placeholder="Alasan penolakan (wajib diisi)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full mt-4 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 resize-none"
                />
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
                <button
                  onClick={() => { setShowRejectDialog(false); setRejectReason(""); }}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={confirmReject}
                  disabled={isActing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {isActing && <Loader2 size={16} className="animate-spin" />}Tolak
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachment Modal */}
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
                <a
                  href={selectedAttachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <FileText size={16} />
                  Buka Lampiran
                </a>
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

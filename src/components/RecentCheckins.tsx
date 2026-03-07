import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";

interface RecentCheckinsProps {
  checkins: any[];
  onNavigate?: (page: string) => void;
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-purple-100 text-purple-600",
  "bg-indigo-100 text-indigo-600",
  "bg-pink-100 text-pink-600",
];

function formatTime(iso?: string | null): string {
  if (!iso) return "--:--";
  try {
    return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "--:--";
  }
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function RecentCheckins({ checkins, onNavigate }: RecentCheckinsProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Check-in Terbaru</h2>
        <button
          onClick={() => onNavigate?.("attendance")}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          Lihat Semua <ArrowRight size={16} />
        </button>
      </div>

      <div className="relative pl-4 flex-1 overflow-hidden">
        <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-100"></div>

        {checkins.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-400 text-sm">Belum ada check-in hari ini</div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {checkins.map((checkin, idx) => {
              const name = checkin.employee?.name ?? "Karyawan";
              const role = checkin.employee?.role ?? checkin.employee?.nik ?? "-";
              const avatar = name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();
              const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const isLate = checkin.status === "TERLAMBAT";
              return (
                <motion.div key={checkin.id} variants={item} className="relative flex items-center gap-4 group">
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full ${color} flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm shrink-0`}
                  >
                    {avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{name}</h4>
                        <p className="text-xs text-gray-500 truncate">{role}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                          <Clock size={12} /> {formatTime(checkin.checkInTime)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${isLate ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}
                        >
                          {isLate ? "Terlambat" : "Hadir"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

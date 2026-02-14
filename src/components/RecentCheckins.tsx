import React from "react";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
interface RecentCheckinsProps {
  onNavigate?: (page: string) => void;
}
const checkins = [
  {
    id: 1,
    name: "Andi Pratama",
    role: "IT Support",
    time: "07:45",
    status: "Hadir",
    avatar: "AP",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    name: "Siti Rahayu",
    role: "HR Manager",
    time: "07:50",
    status: "Hadir",
    avatar: "SR",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    id: 3,
    name: "Budi Santoso",
    role: "Finance",
    time: "08:12",
    status: "Terlambat",
    avatar: "BS",
    color: "bg-amber-100 text-amber-600",
  },
  {
    id: 4,
    name: "Dewi Lestari",
    role: "Marketing",
    time: "08:15",
    status: "Terlambat",
    avatar: "DL",
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 5,
    name: "Rizki Hidayat",
    role: "Operations",
    time: "08:32",
    status: "Terlambat",
    avatar: "RH",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    id: 6,
    name: "Ahmad Fauzi",
    role: "Teller",
    time: "07:55",
    status: "Hadir",
    avatar: "AF",
    color: "bg-pink-100 text-pink-600",
  },
];

const container = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const item = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};
export function RecentCheckins({ onNavigate }: RecentCheckinsProps) {
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
        {/* Vertical Line */}
        <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-100"></div>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {checkins.map((checkin) => (
            <motion.div key={checkin.id} variants={item} className="relative flex items-center gap-4 group">
              {/* Timeline Dot/Avatar */}
              <div
                className={`relative z-10 w-10 h-10 rounded-full ${checkin.color} flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm shrink-0`}
              >
                {checkin.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{checkin.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{checkin.role}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> {checkin.time}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${checkin.status === "Hadir" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}
                    >
                      {checkin.status}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

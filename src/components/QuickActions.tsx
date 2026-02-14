import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, UserPlus, Download, ClipboardCheck } from "lucide-react";
interface QuickActionsProps {
  onNavigate: (page: string) => void;
}
export function QuickActions({ onNavigate }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);
  const handleAction = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };
  const actions = [
    {
      icon: UserPlus,
      label: "Tambah Karyawan",
      color: "text-blue-600",
      action: () => handleAction("employees"),
    },
    {
      icon: Download,
      label: "Ekspor Laporan",
      color: "text-emerald-600",
      action: () => handleAction("reports"),
    },
    {
      icon: ClipboardCheck,
      label: "Lihat Absensi",
      color: "text-purple-600",
      action: () => handleAction("attendance"),
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  y: 20,
                }}
                transition={{
                  delay: index * 0.05,
                }}
                className="flex items-center gap-3"
              >
                <div
                  className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm opacity-0 animate-in fade-in slide-in-from-right-4 duration-300 fill-mode-forwards"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {action.label}
                </div>
                <button
                  onClick={action.action}
                  className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <action.icon size={20} className={action.color} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleOpen}
        whileHover={{
          scale: 1.05,
        }}
        whileTap={{
          scale: 0.95,
        }}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-colors duration-300 ${isOpen ? "bg-gray-900" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        <motion.div
          animate={{
            rotate: isOpen ? 45 : 0,
          }}
          transition={{
            duration: 0.2,
          }}
        >
          <Plus size={28} />
        </motion.div>
      </motion.button>
    </div>
  );
}

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

const ICON = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const STYLE: Record<ToastType, string> = {
  success: "bg-emerald-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-blue-600 text-white",
};

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<ToastState>({ message: "", type: "success", visible: false });

  const show = useCallback(
    (message: string, type: ToastType = "success") => {
      setToast({ message, type, visible: true });
      setTimeout(() => setToast((t) => ({ ...t, visible: false })), duration);
    },
    [duration],
  );

  return { toast, show };
}

export function Toast({ toast }: { toast: ToastState }) {
  const Icon = ICON[toast.type];
  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className={`fixed top-24 left-1/2 z-[100] px-6 py-3 rounded-full shadow-lg flex items-center gap-2 ${STYLE[toast.type]}`}
        >
          <Icon size={18} />
          <span className="font-medium">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

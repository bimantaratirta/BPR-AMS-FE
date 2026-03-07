import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import api from "../lib/api";
import { StatCards } from "../components/StatCards";
import { AttendanceChart } from "../components/AttendanceChart";
import { RecentCheckins } from "../components/RecentCheckins";

interface DashboardSummary {
  totalEmployees: number;
  todayHadir: number;
  todayTerlambat: number;
  todayAlpha: number;
  weeklyAttendance: { day: string; hadir: number; alpha: number }[];
  recentCheckins: any[];
  pendingLeaveRequests: number;
}

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/dashboard/summary");
        const data = res.data?.data ?? res.data;
        setSummary(data);
      } catch {
        // fallback: empty summary
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 size={32} className="animate-spin mr-3" />
        Memuat dashboard...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <StatCards
        totalEmployees={summary?.totalEmployees ?? 0}
        hadir={summary?.todayHadir ?? 0}
        terlambat={summary?.todayTerlambat ?? 0}
        alpha={summary?.todayAlpha ?? 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        <div className="lg:col-span-2 h-full">
          <AttendanceChart data={summary?.weeklyAttendance ?? []} />
        </div>
        <div className="lg:col-span-1 h-full">
          <RecentCheckins checkins={summary?.recentCheckins ?? []} onNavigate={onNavigate} />
        </div>
      </div>
    </motion.div>
  );
}

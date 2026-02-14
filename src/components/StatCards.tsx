import React from "react";
import { Users, UserCheck, Clock, UserX, ArrowUpRight, ArrowDownRight } from "lucide-react";
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  iconColorClass: string;
}
function StatCard({ title, value, change, trend, icon: Icon, colorClass, bgClass, iconColorClass }: StatCardProps) {
  return (
    <div
      className={`p-6 rounded-xl shadow-sm border border-gray-100/50 bg-white hover:shadow-md transition-shadow duration-300`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${bgClass} ${iconColorClass}`}>
          <Icon size={22} />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
        >
          {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
export function StatCards() {
  const stats = [
    {
      title: "Total Karyawan",
      value: "248",
      change: "+12%",
      trend: "up" as const,
      icon: Users,
      bgClass: "bg-blue-50",
      iconColorClass: "text-blue-600",
      colorClass: "border-blue-100",
    },
    {
      title: "Hadir Hari Ini",
      value: "219",
      change: "+4.5%",
      trend: "up" as const,
      icon: UserCheck,
      bgClass: "bg-emerald-50",
      iconColorClass: "text-emerald-600",
      colorClass: "border-emerald-100",
    },
    {
      title: "Terlambat",
      value: "12",
      change: "-2.1%",
      trend: "down" as const,
      icon: Clock,
      bgClass: "bg-amber-50",
      iconColorClass: "text-amber-600",
      colorClass: "border-amber-100",
    },
    {
      title: "Tidak Hadir",
      value: "17",
      change: "+1.2%",
      trend: "up" as const,
      icon: UserX,
      bgClass: "bg-red-50",
      iconColorClass: "text-red-600",
      colorClass: "border-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}

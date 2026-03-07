import { Users, UserCheck, Clock, UserX, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  bgClass: string;
  iconColorClass: string;
}

function StatCard({ title, value, sub, icon: Icon, bgClass, iconColorClass }: StatCardProps) {
  return (
    <div className="p-6 rounded-xl shadow-sm border border-gray-100/50 bg-white hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${bgClass} ${iconColorClass}`}>
          <Icon size={22} />
        </div>
        {sub && (
          <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-600">
            <ArrowUpRight size={14} />
            {sub}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

interface StatCardsProps {
  totalEmployees: number;
  hadir: number;
  terlambat: number;
  alpha: number;
}

export function StatCards({ totalEmployees, hadir, terlambat, alpha }: StatCardsProps) {
  const cards = [
    { title: "Total Karyawan", value: totalEmployees, icon: Users, bgClass: "bg-blue-50", iconColorClass: "text-blue-600" },
    { title: "Hadir Hari Ini", value: hadir, icon: UserCheck, bgClass: "bg-emerald-50", iconColorClass: "text-emerald-600" },
    { title: "Terlambat", value: terlambat, icon: Clock, bgClass: "bg-amber-50", iconColorClass: "text-amber-600" },
    { title: "Alpha", value: alpha, icon: UserX, bgClass: "bg-red-50", iconColorClass: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}

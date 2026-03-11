import React from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart3,
  Settings,
  Building2,
  CalendarDays,
  ShieldCheck,
  LogOut,
  Star,
} from "lucide-react";
type AdminRole = "SUPER_ADMIN" | "ADMIN" | "VIEWER";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userRole?: AdminRole;
  userName?: string;
  userEmail?: string;
}

const allNavItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Beranda", roles: ["SUPER_ADMIN", "ADMIN", "VIEWER"] },
  { id: "employees", icon: Users, label: "Karyawan", roles: ["SUPER_ADMIN", "ADMIN"] },
  { id: "branches", icon: Building2, label: "Kantor Cabang", roles: ["SUPER_ADMIN", "ADMIN"] },
  { id: "attendance", icon: ClipboardCheck, label: "Absensi", roles: ["SUPER_ADMIN", "ADMIN", "VIEWER"] },
  { id: "leave", icon: CalendarDays, label: "Izin & Cuti", roles: ["SUPER_ADMIN", "ADMIN"] },
  { id: "points", icon: Star, label: "Poin Kehadiran", roles: ["SUPER_ADMIN", "ADMIN", "VIEWER"] },
  { id: "reports", icon: BarChart3, label: "Laporan", roles: ["SUPER_ADMIN", "ADMIN", "VIEWER"] },
  { id: "admins", icon: ShieldCheck, label: "Manajemen Admin", roles: ["SUPER_ADMIN"] },
  // { id: "settings", icon: Settings, label: "Pengaturan", roles: ["SUPER_ADMIN", "ADMIN"] },
];

export function Sidebar({ activePage, onNavigate, onLogout, userRole = "ADMIN", userName, userEmail }: SidebarProps) {
  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-50 transition-all duration-300 ease-in-out w-20 hover:w-64 group shadow-sm overflow-hidden flex flex-col">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-4 border-b border-gray-50">
        <div className="flex items-center gap-3 min-w-max">
          <img src="/logo1.png" alt="BPR Sahabat Sejati" className="w-10 h-10 rounded-full shrink-0 object-cover" />
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold text-gray-900 whitespace-nowrap">
            BPR Sahabat Sejati
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-colors duration-200 min-w-max ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />

              <span
                className={`font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap ${isActive ? "font-semibold" : ""}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-50 space-y-2">
        <div className="flex items-center gap-4 p-2 min-w-max">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm shrink-0 shadow-sm">
            {(userName ?? "AD").split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-left">
            <p className="text-sm font-semibold text-gray-900">{userName ?? "Admin"}</p>
            <p className="text-xs text-gray-500">{userEmail ?? "-"}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors min-w-max"
        >
          <LogOut size={20} className="shrink-0" />
          <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Keluar
          </span>
        </button>
      </div>
    </aside>
  );
}

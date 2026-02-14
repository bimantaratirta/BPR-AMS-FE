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
} from "lucide-react";
interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}
export function Sidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
  const navItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Beranda",
    },
    {
      id: "employees",
      icon: Users,
      label: "Karyawan",
    },
    {
      id: "branches",
      icon: Building2,
      label: "Kantor Cabang",
    },
    {
      id: "attendance",
      icon: ClipboardCheck,
      label: "Absensi",
    },
    {
      id: "leave",
      icon: CalendarDays,
      label: "Izin & Cuti",
    },
    {
      id: "reports",
      icon: BarChart3,
      label: "Laporan",
    },
    {
      id: "admins",
      icon: ShieldCheck,
      label: "Manajemen Admin",
    },
    {
      id: "settings",
      icon: Settings,
      label: "Pengaturan",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-50 transition-all duration-300 ease-in-out w-20 hover:w-64 group shadow-sm overflow-hidden flex flex-col">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-gray-50">
        <div className="flex items-center gap-4 min-w-max">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Building2 size={18} />
          </div>
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
            AD
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-left">
            <p className="text-sm font-semibold text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@bpr.co.id</p>
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

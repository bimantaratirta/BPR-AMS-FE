import React from "react";
import { Calendar } from "lucide-react";
interface TopBarProps {
  activePage: string;
}
export function TopBar({ activePage }: TopBarProps) {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const getPageTitle = () => {
    switch (activePage) {
      case "dashboard":
        return "Selamat Pagi, Admin";
      case "employees":
        return "Data Karyawan";
      case "branches":
        return "Manajemen Kantor Cabang";
      case "attendance":
        return "Monitoring Absensi";
      case "leave":
        return "Pengajuan Izin & Cuti";
      case "points":
        return "Poin Kehadiran";
      case "reports":
        return "Laporan & Ekspor Data";
      case "settings":
        return "Pengaturan Sistem";
      case "admins":
        return "Manajemen Admin";
      default:
        return "Beranda";
    }
  };
  const getBreadcrumb = () => {
    switch (activePage) {
      case "dashboard":
        return "Ringkasan";
      case "employees":
        return "Manajemen SDM";
      case "branches":
        return "Data Master";
      case "attendance":
        return "Monitoring";
      case "leave":
        return "Persetujuan";
      case "points":
        return "Poin";
      case "reports":
        return "Analitik";
      case "settings":
        return "Sistem";
      case "admins":
        return "Manajemen Pengguna";
      default:
        return "Halaman";
    }
  };
  return (
    <header className="w-full mb-8 relative z-40">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <nav className="flex items-center text-sm text-gray-400 font-medium">
            <span>Beranda</span>
            <span className="mx-2">/</span>
            <span className="text-blue-600">{getBreadcrumb()}</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-sm text-gray-600">
            <Calendar size={16} className="text-gray-400" />
            <span className="font-medium capitalize">{today}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

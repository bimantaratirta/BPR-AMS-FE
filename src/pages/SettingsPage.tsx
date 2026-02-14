import React, { useState } from "react";
import { Clock, MapPin, Save, User, Mail, Shield, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function SettingsPage() {
  const [settings, setSettings] = useState({
    defaultCheckIn: "08:00",
    halfPointEnd: "08:30",
    lateTolerance: "15",
    defaultRadius: "50",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Settings */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Pengaturan Absensi</h3>
          <p className="text-sm text-gray-500 mb-6">Konfigurasi aturan kehadiran karyawan</p>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jam Masuk Default</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="time"
                  value={settings.defaultCheckIn}
                  onChange={(e) => setSettings({ ...settings, defaultCheckIn: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Check-in sampai jam ini mendapat 1 poin (Hadir)</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Batas Setengah Poin (0.5)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="time"
                  value={settings.halfPointEnd}
                  onChange={(e) => setSettings({ ...settings, halfPointEnd: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Check-in antara 08:01 dan batas ini mendapat 0.5 poin (Terlambat). Setelahnya 0 poin.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Radius Default (meter)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="number"
                  value={settings.defaultRadius}
                  onChange={(e) => setSettings({ ...settings, defaultRadius: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Radius geofencing default untuk check-in</p>
            </div>

            {/* Point Rules Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-800">Aturan Poin</h4>
              </div>
              <div className="space-y-2 text-xs text-blue-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>
                    Sampai {settings.defaultCheckIn} → <strong>1 poin</strong> (Hadir)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>
                    08:01 – {settings.halfPointEnd} → <strong>0.5 poin</strong> (Terlambat)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  <span>
                    Setelah {settings.halfPointEnd} → <strong>0 poin</strong> (Terlambat)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>
                    Izin / Cuti → <strong>0 poin</strong> (absensi dinonaktifkan)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              {saved ? "Tersimpan!" : "Simpan Pengaturan"}
            </button>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Profil Admin</h3>
          <p className="text-sm text-gray-500 mb-6">Informasi akun administrator</p>

          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              AD
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Admin User</h4>
              <p className="text-sm text-gray-500">Super Admin</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
              <User size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Nama</p>
                <p className="text-sm font-medium text-gray-900">Admin User</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
              <Mail size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900">admin@bpr.co.id</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
              <Shield size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Peran</p>
                <p className="text-sm font-medium text-gray-900">Super Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

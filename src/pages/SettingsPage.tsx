import { useState, useEffect } from "react";
import { Clock, MapPin, Save, User, Mail, Shield, Loader2, Building, Globe, Upload, Image } from "lucide-react";
import { motion } from "framer-motion";
import api from "../lib/api";
import { useToast, Toast } from "../components/Toast";

interface AppSettings {
  id?: string;
  checkInTime?: string;
  defaultRadius?: number;
  [key: string]: any;
}

interface SettingsPageProps {
  currentUser?: { name: string; email: string; role: string };
}

export function SettingsPage({ currentUser }: SettingsPageProps) {
  const { toast, show: showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formCheckIn, setFormCheckIn] = useState("08:00");
  const [formHalfPointEnd, setFormHalfPointEnd] = useState("08:30");
  const [formRadius, setFormRadius] = useState("50");
  const [formCompanyName, setFormCompanyName] = useState("");
  const [formTimezone, setFormTimezone] = useState("Asia/Jakarta");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/app-settings");
        const data = res.data?.data ?? res.data;
        // API may return array or single object
        const setting: AppSettings = Array.isArray(data) ? data[0] : (data?.data?.[0] ?? data);
        if (setting) {
          setSettings(setting);
          if (setting.checkInTime) setFormCheckIn(setting.checkInTime.substring(0, 5));
          if (setting.halfPointEnd) setFormHalfPointEnd(setting.halfPointEnd.substring(0, 5));
          if (setting.defaultRadius !== undefined) setFormRadius(String(setting.defaultRadius));
          if (setting.companyName) setFormCompanyName(setting.companyName);
          if (setting.timezone) setFormTimezone(setting.timezone);
          if (setting.companyLogo) setLogoPreview(setting.companyLogo);
        }
      } catch {
        // if no settings exist yet, use defaults
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("checkInTime", formCheckIn);
      formData.append("halfPointEnd", formHalfPointEnd);
      formData.append("defaultRadius", formRadius);
      formData.append("companyName", formCompanyName);
      formData.append("timezone", formTimezone);
      if (logoFile) {
        formData.append("companyLogo", logoFile);
      }

      if (settings?.id) {
        await api.put(`/app-settings/${settings.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/app-settings", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setSaved(true);
      setLogoFile(null);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      showToast(e.response?.data?.message ?? "Gagal menyimpan pengaturan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    VIEWER: "Viewer",
  };

  const displayUser = currentUser ?? { name: "Admin", email: "-", role: "ADMIN" };
  const initials = displayUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Toast toast={toast} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Settings */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Pengaturan Absensi</h3>
          <p className="text-sm text-gray-500 mb-6">Konfigurasi aturan kehadiran karyawan</p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" />
              Memuat...
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jam Masuk Default</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="time"
                    value={formCheckIn}
                    onChange={(e) => setFormCheckIn(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Check-in sampai jam ini mendapat 1 poin (Hadir)</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Batas Setengah Poin</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="time"
                    value={formHalfPointEnd}
                    onChange={(e) => setFormHalfPointEnd(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Check-in setelah jam masuk sampai jam ini mendapat 0.5 poin</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Radius Default (meter)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    value={formRadius}
                    onChange={(e) => setFormRadius(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Radius geofencing default untuk check-in</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Perusahaan</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    placeholder="PT Contoh Perusahaan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Timezone</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={formTimezone}
                    onChange={(e) => setFormTimezone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 appearance-none bg-white"
                  >
                    <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                    <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                    <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Logo Perusahaan</label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo" className="w-12 h-12 rounded-lg object-contain border border-gray-200" />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload size={16} />
                    {logoFile ? logoFile.name : "Pilih file..."}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setLogoFile(file);
                        if (file) setLogoPreview(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saved ? "Tersimpan!" : "Simpan Pengaturan"}
              </button>
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Profil Admin</h3>
          <p className="text-sm text-gray-500 mb-6">Informasi akun administrator</p>

          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              {initials}
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{displayUser.name}</h4>
              <p className="text-sm text-gray-500">{roleLabel[displayUser.role] ?? displayUser.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
              <User size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Nama</p>
                <p className="text-sm font-medium text-gray-900">{displayUser.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
              <Mail size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900">{displayUser.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
              <Shield size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Peran</p>
                <p className="text-sm font-medium text-gray-900">{roleLabel[displayUser.role] ?? displayUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

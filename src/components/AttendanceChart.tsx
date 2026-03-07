import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DayData {
  day: string;
  hadir: number;
  alpha: number;
}

interface AttendanceChartProps {
  data: DayData[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  const chartData = data.map((d) => ({ name: d.day, hadir: d.hadir, alpha: d.alpha }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Ringkasan Absensi Mingguan</h2>
        <p className="text-sm text-gray-500">Performa kehadiran karyawan minggu ini</p>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Tidak ada data minggu ini
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "#F3F4F6" }}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
              <Bar dataKey="hadir" name="Hadir" fill="#2563EB" radius={[6, 6, 0, 0]} />
              <Bar dataKey="alpha" name="Alpha" fill="#FCA5A5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

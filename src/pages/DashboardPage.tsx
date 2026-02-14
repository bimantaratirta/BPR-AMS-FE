import React from 'react';
import { motion } from 'framer-motion';
import { StatCards } from '../components/StatCards';
import { AttendanceChart } from '../components/AttendanceChart';
import { RecentCheckins } from '../components/RecentCheckins';
interface DashboardPageProps {
  onNavigate: (page: string) => void;
}
export function DashboardPage({ onNavigate }: DashboardPageProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.5
      }}
      className="space-y-6">

      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        <div className="lg:col-span-2 h-full">
          <AttendanceChart />
        </div>
        <div className="lg:col-span-1 h-full">
          <RecentCheckins onNavigate={onNavigate} />
        </div>
      </div>
    </motion.div>);

}
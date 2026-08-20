'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  delay?: number;
}

function StatCard({ icon, label, value, change, positive, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="bg-white border border-[#e5e5e5] rounded-lg p-6 flex flex-col gap-4 hover:border-[#FF8C00]/40 transition-colors duration-300 shadow-sm"
    >
      {/* Icon + Badge */}
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-lg bg-[#fff3e0] text-[#FF8C00]">
          {icon}
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            positive
              ? 'bg-green-500/10 text-green-700'
              : 'bg-red-500/10 text-red-700'
          }`}
        >
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </span>
      </div>

      {/* Value */}
      <div>
        <p className="text-3xl font-bold text-black tracking-tight">{value}</p>
        <p className="text-xs text-[#6b7280] mt-1 tracking-widest uppercase">{label}</p>
      </div>
    </motion.div>
  );
}

interface DashboardStatsProps {
  stats: {
    icon: React.ReactNode;
    label: string;
    value: string;
    change: string;
    positive: boolean;
  }[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} delay={i * 0.08} />
      ))}
    </div>
  );
}

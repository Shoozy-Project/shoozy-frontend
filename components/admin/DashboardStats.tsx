'use client';

import { motion } from 'framer-motion';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay?: number;
}

function StatCard({ icon, label, value, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="bg-card border border-border rounded-lg p-6 flex flex-col gap-4 hover:border-[#FF8C00]/40 transition-colors duration-300 shadow-sm"
    >
      {/* Icon + Badge */}
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-lg bg-[#fff3e0] text-[#FF8C00]">
          {icon}
        </div>
      </div>

      {/* Value */}
      <div>
        <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">{label}</p>
      </div>
    </motion.div>
  );
}

interface DashboardStatsProps {
  stats: {
    icon: React.ReactNode;
    label: string;
    value: string;
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

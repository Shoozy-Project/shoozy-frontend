'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/hooks/use-translations';

interface PasswordStrengthBarProps {
  password: string;
}

function getStrength(password: string): { labelKey: string; level: 0 | 1 | 2 | 3; color: string } {
  if (!password || password.length < 12) {
    return { labelKey: 'auth.strengthShort', level: 0, color: '#dc2626' };
  }

  let score = 0;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { labelKey: 'auth.strengthWeak', level: 1, color: '#dc2626' };
  if (score === 2 || score === 3) return { labelKey: 'auth.strengthFair', level: 2, color: '#f59e0b' };
  return { labelKey: 'auth.strengthStrong', level: 3, color: '#16a34a' };
}

export default function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const { t } = useTranslations();
  if (!password) return null;

  const { labelKey, level, color } = getStrength(password);
  const percent = (level / 3) * 100;

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="h-1 w-full bg-[var(--border-primary)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs font-medium" style={{ color }}>
        {t(labelKey)}
      </p>
    </div>
  );
}

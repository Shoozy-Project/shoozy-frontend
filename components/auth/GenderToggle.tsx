'use client';

interface GenderToggleProps {
  value: 'male' | 'female' | undefined;
  onChange: (value: 'male' | 'female') => void;
  error?: string;
}

export default function GenderToggle({ value, onChange, error }: GenderToggleProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-widest uppercase text-[var(--text-secondary)]">
        Gender
      </span>
      <div
        role="group"
        aria-label="Select gender"
        aria-describedby={error ? 'gender-error' : undefined}
        className="flex"
      >
        <button
          id="gender-male"
          type="button"
          onClick={() => onChange('male')}
          aria-pressed={value === 'male'}
          className={`
            flex-1 py-2.5 text-xs font-semibold tracking-widest uppercase border transition-all duration-200
            ${value === 'male'
              ? 'bg-[var(--text-primary)] text-[var(--surface-primary)] border-[var(--text-primary)]'
              : 'bg-[var(--surface-primary)] text-[var(--text-muted)] border-[var(--border-primary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]'
            }
          `}
        >
          Male
        </button>
        <button
          id="gender-female"
          type="button"
          onClick={() => onChange('female')}
          aria-pressed={value === 'female'}
          className={`
            flex-1 py-2.5 text-xs font-semibold tracking-widest uppercase border-t border-b border-r transition-all duration-200
            ${value === 'female'
              ? 'bg-[var(--text-primary)] text-[var(--surface-primary)] border-[var(--text-primary)]'
              : 'bg-[var(--surface-primary)] text-[var(--text-muted)] border-[var(--border-primary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]'
            }
          `}
        >
          Female
        </button>
      </div>
      {error && (
        <p id="gender-error" role="alert" className="text-xs text-[#dc2626] mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}

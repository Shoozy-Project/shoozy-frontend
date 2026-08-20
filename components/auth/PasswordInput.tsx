'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  label: string;
  registration: Record<string, unknown>;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}

export default function PasswordInput({
  id,
  label,
  registration,
  error,
  placeholder = '••••••••••••',
  autoComplete = 'current-password',
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold tracking-widest uppercase text-[var(--text-secondary)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          className={`
            w-full px-0 py-3 pr-10 text-sm bg-transparent border-b-2 text-[var(--text-primary)] placeholder-[var(--text-faint)]
            focus:outline-none transition-colors duration-200
            ${error
              ? 'border-[#dc2626] focus:border-[#dc2626]'
              : 'border-[var(--border-primary)] focus:border-[var(--text-primary)]'
            }
          `}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors"
        >
          {show
            ? <EyeOff className="w-4 h-4" aria-hidden="true" />
            : <Eye className="w-4 h-4" aria-hidden="true" />
          }
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-[#dc2626] mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sanitizeTunisianLocalPhone } from '@/lib/tunisian-phone';

interface TunisianPhoneInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  required?: boolean;
  optionalLabel?: string;
  helperText?: string;
  error?: string;
  variant?: 'default' | 'auth';
}

export function TunisianPhoneInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  name,
  required = false,
  optionalLabel,
  helperText,
  error,
  variant = 'default',
}: TunisianPhoneInputProps) {
  const describedBy = [error ? `${id}-error` : null, helperText && !error ? `${id}-helper` : null].filter(Boolean).join(' ') || undefined;
  const auth = variant === 'auth';

  return (
    <div className={auth ? 'flex flex-col gap-1.5' : 'space-y-2'}>
      <Label
        htmlFor={id}
        className={auth ? 'text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]' : undefined}
      >
        {label}
        {!required && optionalLabel ? <span className="ms-1 font-normal normal-case text-[var(--text-faint)]">({optionalLabel})</span> : null}
      </Label>
      <div className={auth ? `flex border-b-2 ${error ? 'border-destructive' : 'border-[var(--border-primary)] focus-within:border-[var(--text-primary)]'}` : `flex rounded-lg border bg-transparent focus-within:ring-3 dark:bg-input/30 ${error ? 'border-destructive focus-within:ring-destructive/20' : 'border-input focus-within:border-ring focus-within:ring-ring/50'}`} dir="ltr">
        <span className={auth ? 'flex items-center border-e px-3 text-sm font-medium text-[var(--text-secondary)]' : 'flex h-10 items-center border-e border-input px-3 text-sm font-medium text-muted-foreground'} aria-hidden="true">
          +216
        </span>
        <Input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={8}
          required={required}
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(sanitizeTunisianLocalPhone(event.target.value))}
          placeholder="20 123 456"
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={auth ? 'h-auto rounded-none border-0 bg-transparent px-3 py-3 shadow-none focus-visible:ring-0 dark:bg-transparent' : 'h-10 rounded-s-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent'}
          dir="ltr"
        />
      </div>
      {helperText && !error ? <p id={`${id}-helper`} className="text-xs text-muted-foreground">{helperText}</p> : null}
      {error ? <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

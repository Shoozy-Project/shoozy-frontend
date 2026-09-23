'use client';

import { useSyncExternalStore } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { isTheme, type Theme } from '@/lib/theme';
import { useThemeStore } from '@/stores/theme-store';

const options: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const subscribeToHydration = () => () => undefined;

export function ThemeToggle({
  className,
  tone = 'default',
}: {
  className?: string;
  tone?: 'default' | 'inverse';
}) {
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const selectedTheme = mounted ? theme : 'system';
  const SelectedIcon = options.find((option) => option.value === selectedTheme)?.icon ?? Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Theme: ${selectedTheme}`}
          title="Choose theme"
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:pointer-events-none disabled:opacity-50',
            tone === 'inverse'
              ? 'text-white hover:bg-white/10 hover:text-white'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            className,
          )}
        >
          <SelectedIcon className="size-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-44">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedTheme}
          onValueChange={(value) => {
            if (isTheme(value)) setTheme(value);
          }}
        >
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuRadioItem key={option.value} value={option.value} className="gap-2 px-2.5 py-2">
                <Icon className="size-4" aria-hidden="true" />
                {option.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

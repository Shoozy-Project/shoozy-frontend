'use client';

import { Component, type ReactNode, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Check, Loader2, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/hooks/use-translations';
import { coordinateString, isWithinTunisiaBounds } from '@/lib/tunisia-address';

const LeafletMap = dynamic(() => import('./AddressLeafletMap'), {
  ssr: false,
  loading: () => <div className="flex h-[320px] items-center justify-center rounded-lg border bg-muted"><Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" /></div>,
});

interface AddressLocationPickerProps {
  latitude?: string | null;
  longitude?: string | null;
  onChange: (coordinates: { latitude: string; longitude: string }) => void;
}

export function AddressLocationPicker({ latitude, longitude, onChange }: AddressLocationPickerProps) {
  const { t } = useTranslations();
  const initialPosition = useMemo<[number, number] | null>(() => {
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    return latitude && longitude && Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude)
      ? [parsedLatitude, parsedLongitude]
      : null;
  }, [latitude, longitude]);
  const [position, setPosition] = useState<[number, number] | null>(initialPosition);
  const [focusPosition, setFocusPosition] = useState<[number, number] | null>(initialPosition);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [mapError, setMapError] = useState('');

  const selectLocation = (nextLatitude: number, nextLongitude: number) => {
    if (!isWithinTunisiaBounds(nextLatitude, nextLongitude)) {
      setLocationError(t('map.outsideTunisia'));
      return;
    }

    const nextPosition: [number, number] = [nextLatitude, nextLongitude];
    setPosition(nextPosition);
    setFocusPosition(nextPosition);
    setLocationError('');
    onChange({
      latitude: coordinateString(nextLatitude)!,
      longitude: coordinateString(nextLongitude)!,
    });
  };

  const useMyLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError(t('map.locationError'));
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        selectLocation(coords.latitude, coords.longitude);
      },
      () => {
        setLocating(false);
        setLocationError(t('map.locationError'));
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  };

  return (
    <section className="space-y-3 sm:col-span-2">
      <div>
        <h3 className="text-sm font-medium">{t('map.selectExact')}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{t('map.manualHelper')}</p>
      </div>
      <MapErrorBoundary fallback={<div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{t('map.mapError')}</div>}>
        <LeafletMap
          position={position}
          focusPosition={focusPosition}
          ariaLabel={t('map.ariaLabel')}
          onSelect={selectLocation}
          onTileError={() => setMapError(t('map.mapError'))}
        />
      </MapErrorBoundary>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={useMyLocation} disabled={locating}>
          {locating ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
          {t(locating ? 'map.locating' : 'map.useLocation')}
        </Button>
        {position ? <p className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400"><Check className="size-3.5" />{t('map.selected')}</p> : null}
      </div>
      {locationError ? <p role="alert" className="text-xs text-destructive">{locationError}</p> : null}
      {mapError ? <p role="alert" className="text-xs text-amber-700 dark:text-amber-400">{mapError}</p> : null}
    </section>
  );
}

class MapErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

'use client';

import { useEffect, useMemo } from 'react';
import L, { type LeafletEvent } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { LatLngExpression, LatLngTuple } from 'leaflet';
import { TUNISIA_MAP_BOUNDS, TUNISIA_MAP_CENTER } from '@/lib/tunisia-address';

interface AddressLeafletMapProps {
  position: LatLngTuple | null;
  focusPosition: LatLngTuple | null;
  ariaLabel: string;
  onSelect: (latitude: number, longitude: number) => void;
  onTileError: () => void;
}

const markerIcon = L.divIcon({
  className: 'shoozy-location-marker',
  html: '<span aria-hidden="true"></span>',
  iconAnchor: [14, 28],
  iconSize: [28, 28],
});

function MapEvents({ onSelect }: Pick<AddressLeafletMapProps, 'onSelect'>) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function RecenterMap({ position }: { position: LatLngTuple | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 15, { animate: true });
  }, [map, position]);
  return null;
}

export default function AddressLeafletMap({ position, focusPosition, ariaLabel, onSelect, onTileError }: AddressLeafletMapProps) {
  const markerHandlers = useMemo(() => ({
    dragend(event: LeafletEvent) {
      const marker = event.target as L.Marker;
      const next = marker.getLatLng();
      onSelect(next.lat, next.lng);
    },
  }), [onSelect]);

  const initialCenter: LatLngExpression = position ?? TUNISIA_MAP_CENTER;

  return (
    <div role="region" aria-label={ariaLabel} className="h-[320px] w-full overflow-hidden rounded-lg border" dir="ltr">
      <MapContainer
        center={initialCenter}
        zoom={position ? 15 : 6}
        minZoom={5}
        maxBounds={TUNISIA_MAP_BOUNDS}
        maxBoundsViscosity={0.85}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: onTileError }}
        />
        <MapEvents onSelect={onSelect} />
        <RecenterMap position={focusPosition} />
        {position ? <Marker position={position} draggable icon={markerIcon} eventHandlers={markerHandlers} /> : null}
      </MapContainer>
    </div>
  );
}

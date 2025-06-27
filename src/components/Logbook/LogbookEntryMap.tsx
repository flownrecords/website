import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Popup,
  useMap,
} from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

import type { LogbookEntry, User } from '../../lib/types';

type MapProps = {
  user: User;
  entry: LogbookEntry;
};

const colors = {
  accent: '#313ED8',
  base: '#666666',
};

const LogbookEntryMap: React.FC<MapProps> = ({ entry }) => {
  const API = import.meta.env.VITE_API_URL;

  const [aerodromes, setAerodromes] = useState<any[]>([]);
  const [waypoints, setWaypoints] = useState<any[]>([]);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  const extractRoutePoints = (route: string): string[] => {
    return route
      .split(' ')
      .filter(token => /^[A-Z0-9]{2,5}$/.test(token) && token !== 'DCT');
  };

  useEffect(() => {
    aerodromes
    waypoints

    const fetchData = async () => {
      try {
        const [adsRes, wptRes] = await Promise.all([
          axios.get(API + '/data/nav/ad'),
          axios.get(API + '/data/nav/wpt'),
        ]);

        const ads = adsRes.data;
        const wpts = wptRes.data.flatMap((fir: any) => [
          ...fir.vfr,
          ...fir.ifr,
        ]);

        setAerodromes(ads);
        setWaypoints(wpts);

        const route = extractRoutePoints(entry.plan?.route || '');

        const dep = ads.find((ad: any) => ad.icao === entry.plan?.depAd);
        const arr = ads.find((ad: any) => ad.icao === entry.plan?.arrAd);

        const coords: [number, number][] = [];

        if (dep) coords.push([dep.coords.lat, dep.coords.long]);

        for (const fix of route) {
          const match =
            wpts.find((w: any) => w.name === fix || w.id === fix) ||
            ads.find((ad: any) => ad.icao === fix);
          if (match) {
            coords.push([match.coords.lat, match.coords.long]);
          } else {
            console.warn('⚠️ Route fix not found:', fix);
          }
        }

        if (arr) coords.push([arr.coords.lat, arr.coords.long]);
        setRouteCoords(coords);
      } catch (err) {
        console.error('🚨 Error loading nav data:', err);
      }
    };

    fetchData();
  }, [entry]);

  const bounds = useMemo(() => {
    if (routeCoords.length < 2) return null;
    return routeCoords as [number, number][];
  }, [routeCoords]);

  const mapCenter = useMemo(() => {
    if (routeCoords.length === 0) return [38.7, -9.1]; // Default: Lisbon
    const avgLat = routeCoords.reduce((sum, c) => sum + c[0], 0) / routeCoords.length;
    const avgLng = routeCoords.reduce((sum, c) => sum + c[1], 0) / routeCoords.length;
    return [avgLat, avgLng];
  }, [routeCoords]);

  return (
    <div className="w-full overflow-hidden relative" style={{ height: '400px' }}>
      <MapContainer
        center={mapCenter as any}
        bounds={bounds || undefined}
        boundsOptions={{ padding: [10, 10] }}
        minZoom={2}
        maxZoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap & CARTO"
          keepBuffer={6}
        />

        {bounds && <FitBoundsHandler bounds={bounds} />}

        {routeCoords.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: colors.base }}
            weight={2}
            noClip={true}
            opacity={0.75}
          />
        )}

        {routeCoords.map((pos, idx) => (
          <CircleMarker
            key={idx}
            center={pos}
            radius={3}
            fillColor={colors.accent}
            fillOpacity={1}
            weight={0}
            stroke={true}
          >
            <Popup>Fix {idx + 1}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LogbookEntryMap;

const FitBoundsHandler = ({ bounds }: { bounds: [number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length > 1) {
      map.fitBounds(bounds, { padding: [25, 25] });
    }
  }, [bounds, map]);

  return null;
};

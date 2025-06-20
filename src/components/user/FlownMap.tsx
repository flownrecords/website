import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import type { Aerodrome, User } from '../../lib/types';

type MapProps = {
  big: boolean;
  user: User;
};

const colors = {
  accent: '#313ED8',
  base: '#666666',
};

// 🔹 Marker layer component
const AerodromeLayer = ({
  aerodromes,
  visitedIcaos,
}: {
  aerodromes: Aerodrome[];
  visitedIcaos: Set<string>;
}) => {
  const map = useMap();

  useEffect(() => {
    const bounds = aerodromes
      .filter(ad => ad.coords?.lat && ad.coords?.long)
      .map(ad => [ad.coords.lat, ad.coords.long] as [number, number]);

    if (bounds.length) {
      map.fitBounds(bounds, { padding: [0, 5] });
    }
  }, [aerodromes, map]);

  return (
    <>
      {aerodromes.map(ad => {
        const isVisited = visitedIcaos.has(ad.icao?.toUpperCase?.() || "");
        
        return (
          
        ad.coords?.lat && ad.coords?.long && isVisited ? (
          <CircleMarker
            key={ad.icao}
            center={[ad.coords.lat, ad.coords.long]}
            radius={2}
            fillColor={isVisited ? colors.accent : colors.base}
            fillOpacity={1}
            weight={0}
            stroke={false}
          >
            <Popup>
              <div className="text-sm">
                <strong>{ad.icao}</strong>
                <br />
                {ad.coords.lat.toFixed(4)}, {ad.coords.long.toFixed(4)}
              </div>
            </Popup>
          </CircleMarker>
        ) : null
        )
      })}

      {aerodromes.map(ad => {
        const isVisited = visitedIcaos.has(ad.icao?.toUpperCase?.() || "");
        
        return (
          
        ad.coords?.lat && ad.coords?.long && !isVisited ? (
          <CircleMarker
            key={ad.icao}
            center={[ad.coords.lat, ad.coords.long]}
            radius={2}
            fillColor={isVisited ? colors.accent : colors.base}
            fillOpacity={1}
            weight={0}
            stroke={false}
          >
            <Popup>
              <div className="text-sm">
                <strong>{ad.icao}</strong>
                <br />
                {ad.coords.lat.toFixed(4)}, {ad.coords.long.toFixed(4)}
              </div>
            </Popup>
          </CircleMarker>
        ) : null
        )
      })}

    </>
  );
};

// 🔹 Route lines from logbook
const RouteLines = ({
  aerodromes,
  logbook,
}: {
  aerodromes: Aerodrome[];
  logbook: any[] | undefined;
}) => {
  const adMap = useMemo(() => {
    const map = new Map<string, Aerodrome>();
    aerodromes.forEach(ad => map.set(ad.icao.toUpperCase(), ad));
    return map;
  }, [aerodromes]);

  return (
    <>
      {logbook?.map((entry, i) => {
        const dep = adMap.get(entry.depAd?.toUpperCase() || '');
        const arr = adMap.get(entry.arrAd?.toUpperCase() || '');
        if (
          !dep || !arr ||
          dep.icao === arr.icao ||
          !dep.coords?.lat || !dep.coords?.long ||
          !arr.coords?.lat || !arr.coords?.long
        ) return null;

        return (
          <Polyline
            key={i}
            positions={[
              [dep.coords.lat, dep.coords.long],
              [arr.coords.lat, arr.coords.long],
            ]}
            color={colors.accent}
            weight={2}
            noClip={true}
          />
        );
      })}
    </>
  );
};

// 🔹 Main map component
const FlownMap: React.FC<MapProps> = ({ big, user }) => {
  const [aerodromes, setAerodromes] = useState<Aerodrome[]>([]);

  const visitedIcaos = useMemo(() => {
    const set = new Set<string>();
    user?.logbookEntries.forEach(entry => {
      if (entry.depAd) set.add(entry.depAd.toUpperCase());
      if (entry.arrAd) set.add(entry.arrAd.toUpperCase());
    });
    return set;
  }, [user]);

  useEffect(() => {
    const fetchAerodromes = async () => {
      try {
        const response = await axios.get('http://localhost:7700/data/nav/ad/');
        response.data.forEach((ad: Aerodrome) => {
          ad.icao = ad.icao.toUpperCase();
        });
        setAerodromes(response.data || []);
      } catch (err) {
        console.error('Failed to load aerodromes', err);
      }
    };

    fetchAerodromes();
  }, []);

  return (
    <div className="w-full overflow-hidden">
      <MapContainer
        center={[41.14961, -8.61099]}
        minZoom={2}
        maxZoom={10}
        className={big ? 'h-screen w-screen' : 'h-96 w-full'}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap & CARTO"
        />


        <AerodromeLayer aerodromes={aerodromes} visitedIcaos={visitedIcaos} />
        <RouteLines aerodromes={aerodromes} logbook={user?.logbookEntries} />
        
        
      </MapContainer>
    </div>
  );
};

export default FlownMap;

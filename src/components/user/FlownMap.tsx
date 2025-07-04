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
import Button from '../general/Button';
import { Maximize2 } from 'lucide-react';

type MapProps = {
  big: boolean;
  user: User;
};

const colors = {
  accent: '#313ED8',
  base: '#666666',
};

const AerodromeLayer = ({
  aerodromes,
  visitedIcaos,
}: {
  aerodromes: Aerodrome[];
  visitedIcaos: Set<string>;
}) => {
  const map = useMap();

  useEffect(() => {
    let bounds = aerodromes
    .filter(ad => ad.coords?.lat && ad.coords?.long)
    .map(ad => [ad.coords.lat, ad.coords.long] as [number, number]);

    if (bounds.length) {
      map.fitBounds(bounds, { 
        padding: [5, 5], 
      });
    }

    setTimeout(() => {
      bounds = aerodromes
      .filter(ad => ad.coords?.lat && ad.coords?.long && visitedIcaos.has(ad.icao?.toUpperCase?.()))
      .map(ad => [ad.coords.lat, ad.coords.long] as [number, number]);

      if (bounds.length) {
        map.flyToBounds(bounds, { 
          padding: [5, 5], 
          animate: true,
          duration: 1.5
        });
      }
    }, 500)
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
            radius={1}
            fillColor={isVisited ? colors.accent : colors.base}
            fillOpacity={0.75}
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
            opacity={0.75}
          />
        );
      })}
    </>
  );
};

const FlownMap: React.FC<MapProps> = ({ big, user }) => {
  const API = import.meta.env.VITE_API_URL;
  
  const [ showModal, setShowModal ] = useState(false);
  const [aerodromes, setAerodromes] = useState<Aerodrome[]>([]);
  const [initialMapBounds, setInitialMapBounds] = useState<[number, number][] | null>(null);

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
        const response = await axios.get(API + '/data/nav/ad/');
        const fetchedAerodromes: Aerodrome[] = response.data || [];
        fetchedAerodromes.forEach((ad: Aerodrome) => {
          ad.icao = ad.icao.toUpperCase();
        });
        setAerodromes(fetchedAerodromes);

        // Calculate initial bounds immediately after fetching aerodromes
        const validAerodromes = fetchedAerodromes.filter(ad => ad.coords?.lat && ad.coords?.long);
        let boundsToSet: [number, number][] = [];

        // Prioritize visited aerodromes for initial bounds
        const visitedAerodromeCoords = validAerodromes
          .filter(ad => visitedIcaos.has(ad.icao?.toUpperCase?.()))
          .map(ad => [ad.coords.lat, ad.coords.long] as [number, number]);

        if (visitedAerodromeCoords.length > 0) {
          boundsToSet = visitedAerodromeCoords;
        } else if (validAerodromes.length > 0) {
          // If no visited, use all available aerodromes
          boundsToSet = validAerodromes.map(ad => [ad.coords.lat, ad.coords.long] as [number, number]);
        }

        if (boundsToSet.length > 0) {
          setInitialMapBounds(boundsToSet);
        }

      } catch (err) {
        console.error('Failed to load aerodromes', err);
      }
    };

    fetchAerodromes();
  }, [user, visitedIcaos]); // Add user and visitedIcaos to dependencies for recalculation if they change

  // Determine center based on whether initialMapBounds is available
  const mapCenter = initialMapBounds && initialMapBounds.length > 0
    ? undefined // Let Leaflet calculate center from bounds
    : [41.14961, -8.61099]; // Default center if no data yet

  return (
    <div className="w-full overflow-hidden relative">

      <button 
      onClick={() => setShowModal(true)} 
      className="
        absolute bottom-4 left-4 z-[1000] cursor-pointer bg-gradient-to-t 
      from-neutral-900 to-neutral-800 text-white ring-2 ring-white/25
        hover:opacity-75 transition duration-150 p-2 rounded-lg text-center text-sm
        ">
        <span className='hidden md:inline px-2'>
          Open
        </span>
        <Maximize2 strokeWidth={1.25} className="h-6 w-6 block md:hidden"/>
      </button>

      <MapContainer
        center={mapCenter as any} // Use dynamic center or undefined if bounds are set
        bounds={initialMapBounds || undefined} // Pass calculated bounds or undefined
        boundsOptions={{ padding: [5, 5] }} // Apply padding to initial bounds
        minZoom={2}
        maxZoom={12}
        className={big ? 'h-screen w-screen' : 'h-96 w-full'}
        maxBounds={[
          [-90, -180], // Southwest corner
          [90, 180],   // Northeast corner
        ]}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap & CARTO"
          keepBuffer={6}
        />

        {aerodromes.length > 0 && user?.logbookEntries && (
          <>
            <AerodromeLayer aerodromes={aerodromes} visitedIcaos={visitedIcaos} />
            <RouteLines aerodromes={aerodromes} logbook={user?.logbookEntries} />
          </>
        )}
      </MapContainer>

      {showModal && (
        <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center">
          <div className="relative w-full h-full">
            <Button
              type="button"
              onClick={() => setShowModal(false)}
              text="Close"
              className="absolute top-4 right-4 z-[2100] bg-white text-black px-4 py-2 rounded shadow-md hover:bg-gray-200 transition"
              styleType="small"
            />
            <MapContainer
              center={mapCenter as any}
              bounds={initialMapBounds || undefined}
              boundsOptions={{ padding: [5, 5] }}
              minZoom={2}
              maxZoom={12}
              className="h-full w-full"
              maxBounds={[
                [-90, -180],
                [90, 180],
              ]}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap & CARTO"
                keepBuffer={12}
              />

              {aerodromes.length > 0 && user?.logbookEntries && (
                <>
                  <AerodromeLayer aerodromes={aerodromes} visitedIcaos={visitedIcaos} />
                  <RouteLines aerodromes={aerodromes} logbook={user?.logbookEntries} />
                </>
              )}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlownMap;
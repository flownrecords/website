import { useEffect, useMemo, useState } from "react";
import type { User } from "../../lib/types";
import { MapContainer, TileLayer } from "react-leaflet";
import axios from "axios";
import { AerodromesLayer } from "./AerodromesLayer";
import { RoutePlot } from "./RoutePlot";

type MapProps = {
  type: "OVERVIEW" | "PLANNING" | "ENTRY";
  entryId?: number;
  user: User;
  dimensions?: {
    width?: string;
    height?: string;
  };
};

const RouteMap: React.FC<MapProps> = ({ type, user, dimensions, entryId = 0 }) => {
  const API = import.meta.env.VITE_API_URL;

  const [aerodromes, setAerodromes] = useState<any[]>([]);
  const [waypoints, setWaypoints] = useState<any[]>([]);
  const [mapBounds, setMapBounds] = useState<[number, number][]>([]);

  const visitedIcaos = useMemo(() => {
    const set = new Set<string>();
    const entries = user?.logbookEntries ?? [];
    entries
      .filter((e) => {
        if (type === "OVERVIEW") return true;
        if (type === "ENTRY") return e.id === entryId;
        return false;
      })
      .forEach((entry) => {
        if (entry.depAd) set.add(entry.depAd.toUpperCase());
        if (entry.arrAd) set.add(entry.arrAd.toUpperCase());
        if (entry.plan?.depAd) set.add(entry.plan.depAd.toUpperCase());
        if (entry.plan?.arrAd) set.add(entry.plan.arrAd.toUpperCase());
        if (entry.plan?.route) {
          entry.plan.route.split(" ").forEach((token: string) => {
            if (/^[A-Z0-9]{2,5}$/.test(token)) {
              set.add(token.toUpperCase());
            }
          });
        }
      });

    return set;
  }, [user, type, entryId]);

  useEffect(() => {
    fetchNavdata();

    async function fetchNavdata() {
      const [ad_promise, wpt_promise] = await Promise.all([
        axios.get(API + "/data/nav/ad"),
        axios.get(API + "/data/nav/wpt"),
      ]);

      const ads = ad_promise.data;
      const wpts = wpt_promise.data.flatMap((fir: any) => [...fir.vfr, ...fir.ifr]);

      setAerodromes(ads);
      setWaypoints(wpts);

      const visitedCoords: [number, number][] = ads
        .filter(
          (ad: any) =>
            visitedIcaos.has(ad.icao?.toUpperCase?.()) && ad.coords?.lat && ad.coords?.long
        )
        .map((ad: any) => [ad.coords.lat, ad.coords.long]);

      setMapBounds(visitedCoords);
    }
  }, [user, visitedIcaos, API]);

  return (
    (mapBounds.length > 0 ? (
        <div className="w-full overflow-hidden relative" style={{ height: dimensions?.height ?? "400px" }}>
        <MapContainer
          center={mapBounds.length === 1 ? mapBounds[0] : undefined}
            zoom={mapBounds.length === 1 ? 10 : undefined}  // <-- ADD THIS
          bounds={mapBounds.length > 1 ? mapBounds : undefined}
          boundsOptions={{ padding: [25, 25] }}
          minZoom={2}
          maxZoom={12}
          scrollWheelZoom={true}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap & CARTO"
            keepBuffer={6}
          />

          {aerodromes.length > 0 && waypoints.length > 0 && (
            <RoutePlot
              navdata={{ aerodromes, waypoints }}
              user={user}
              options={type === "ENTRY" ? { singleEntry: true, singleEntryId: entryId } : {}}
            />
          )}

          {aerodromes.length > 0 && (
            <AerodromesLayer navdata={aerodromes} user={user} options={{ highlightVisited: true }} />
          )}

          {
            /* waypoints.length > 0 && (
                <WaypointsLayer navdata={ waypoints } user={ user } options={{}} />
            ) */
          }
        </MapContainer>
      </div>
    ) : (
        <div className="w-full overflow-hidden relative" style={{ height: dimensions?.height ?? "400px" }}>
            
        </div>
    ))
  );
};

export default RouteMap;

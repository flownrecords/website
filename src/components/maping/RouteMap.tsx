import { useEffect, useMemo, useState } from "react";
import type { FIR, FlightRecording, User } from "../../lib/types";
import { MapContainer, TileLayer } from "react-leaflet";
import axios from "axios";
import { AerodromesLayer } from "./AerodromesLayer";
import { RoutePlot } from "./RoutePlot";
import { MapToolbar } from "./MapToolbar";
import RecordingPlot from "./RecordingPlot";

type MapProps = {
    type: "OVERVIEW" | "PLANNING" | "ENTRY";
    entryId?: number;
    recording?: FlightRecording | null;
    user: User;
    dimensions?: {
        width?: string;
        height?: string;
    };
};

const RouteMap: React.FC<MapProps> = ({
    type,
    user,
    dimensions,
    entryId = 0,
    recording = null,
}) => {
    const API = import.meta.env.VITE_API_URL;

    const [aerodromes, setAerodromes] = useState<any[]>([]);
    const [waypoints, setWaypoints] = useState<any[]>([]);
    const [navaids, setNavaids] = useState<any[]>([]);
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
            const [navdata] = await Promise.all([axios.get(API + "/navdata")]);

            const ads = (navdata.data as FIR[]).flatMap((f) => f.ad);
            const wpts = (navdata.data as FIR[]).flatMap((f) => [
                ...(f.waypoints.vfr ?? []),
                ...(f.waypoints.ifr ?? []),
            ]);

            const navaids = (navdata.data as FIR[]).flatMap((f) => f.navaid ?? []);

            setAerodromes(ads);
            setWaypoints(wpts);
            setNavaids(navaids);

            const visitedCoords: [number, number][] = ads
                .filter(
                    (ad: any) =>
                        visitedIcaos.has(ad.icao?.toUpperCase?.()) &&
                        ad.coords?.lat &&
                        ad.coords?.long,
                )
                .map((ad: any) => [ad.coords.lat, ad.coords.long]);

            if (type === "ENTRY" && recording) {
                const coords: [number, number][] = recording?.coords.map((point) => [
                    point.latitude,
                    point.longitude,
                ]);
                visitedCoords.push(...coords);
            }

            setMapBounds(visitedCoords);
        }
    }, [user, visitedIcaos, API]);

    return mapBounds.length > 0 ? (
        <div
            className="w-full overflow-hidden relative"
            style={{ height: dimensions?.height ?? "400px" }}
        >
            <MapContainer
                center={mapBounds.length === 1 ? mapBounds[0] : undefined}
                zoom={mapBounds.length === 1 ? 10 : undefined} // <-- ADD THIS
                bounds={mapBounds.length > 1 ? mapBounds : undefined}
                boundsOptions={{ padding: [25, 25] }}
                minZoom={2}
                maxZoom={12}
                scrollWheelZoom={true}
                zoomControl={false}
                maxBounds={[
                    [-90, -180],
                    [90, 180],
                ]}
                className="h-full w-full"
            >
                <MapToolbar
                    initialBounds={mapBounds.length > 1 ? mapBounds : undefined}
                    initialCenterZoom={
                        mapBounds.length === 1
                            ? { center: mapBounds[0], zoom: 10 } // your default zoom for single point
                            : undefined
                    }
                />

                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
                    attribution="&copy; OpenStreetMap & CARTO"
                    keepBuffer={6}
                />

                {type === "ENTRY" && recording && <RecordingPlot recording={recording} />}

                {aerodromes.length > 0 && waypoints.length > 0 && (
                    <RoutePlot
                        navdata={{ aerodromes, waypoints, navaids }}
                        user={user}
                        options={
                            type === "ENTRY" ? { singleEntry: true, singleEntryId: entryId } : {}
                        }
                    />
                )}

                {aerodromes.length > 0 && (
                    <AerodromesLayer
                        navdata={aerodromes}
                        user={user}
                        options={{ highlightVisited: true, type: type }}
                    />
                )}

                {/* waypoints.length > 0 && (
                <WaypointsLayer navdata={ waypoints } user={ user } options={{}} />
            ) */}
            </MapContainer>
        </div>
    ) : (
        <div
            className="w-full overflow-hidden relative flex items-center justify-center"
            style={{ height: dimensions?.height ?? "400px" }}
        >
            <h1 className="font-bold text-3xl text-white/15">Map not available</h1>
        </div>
    );
};

export default RouteMap;

import { useEffect, useState } from "react";
import type { FIR, FlightRecording, User } from "../../lib/types";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import axios from "axios";
import { AerodromesLayer } from "./AerodromesLayer";
import { RoutePlot } from "./RoutePlot";
import { MapToolbar } from "./MapToolbar";
import RecordingPlot from "./RecordingPlot";
import SigmetMap from "./Sigmets";
import MapNotAvailable from "./MapNotAvail";

type MapProps = {
    type: "OVERVIEW" | "PLANNING" | "ENTRY" | "SIGMET";
    entryId?: number;
    recording?: FlightRecording | null;
    user: User;
    dimensions?: {
        width?: string;
        height?: string;
    };
};

const colors = {
    accent: "#313ED8",
    base: "#666666",
    vor: "#D86E31",
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
    const [visitedRoutes, setVisitedRoutes] = useState<[number, number][][]>([]); // array of [ [dep, arr], [dep, arr], ... ]
    const [displaySigmets, toggleDisplaySigmets] = useState<boolean>(false);
    const [showRoute, setShowRoute] = useState(false || type === "ENTRY");

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

            // Build polyline segments from depAd -> arrAd in logbook order
            const routes: [number, number][][] = [];
            const bounds: [number, number][] = [];

            (user?.logbookEntries ?? [])
                .filter((e) => {
                    if (type === "OVERVIEW") return true;
                    if (type === "ENTRY") return e.id === entryId;
                    return false;
                })
                .forEach((entry) => {
                    const dep = ads.find(
                        (ad) => ad?.icao?.toUpperCase() === entry.depAd?.toUpperCase()
                    );
                    const arr = ads.find(
                        (ad) => ad?.icao?.toUpperCase() === entry.arrAd?.toUpperCase()
                    );

                    if (dep?.coords?.lat && dep?.coords?.long &&
                        arr?.coords?.lat && arr?.coords?.long) {
                        const segment: [number, number][] = [
                            [dep.coords.lat, dep.coords.long],
                            [arr.coords.lat, arr.coords.long],
                        ];
                        routes.push(segment);
                        bounds.push(...segment);
                    }
                });

            // If ENTRY with a recording, include it in bounds
            if (type === "ENTRY" && recording) {
                const coords: [number, number][] = recording?.coords.map((point) => [
                    point.latitude,
                    point.longitude,
                ]);
                bounds.push(...coords);
            }

            setVisitedRoutes(routes);
            setMapBounds(bounds);
        }
    }, [user, entryId, type, API, recording]);

    return mapBounds.length > 0 ? (
        <div
            className="w-full overflow-hidden relative"
            style={{ height: dimensions?.height ?? "400px" }}
        >
            <MapContainer
                center={mapBounds.length === 1 ? mapBounds[0] : undefined}
                zoom={mapBounds.length === 1 ? 10 : undefined}
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
                className="h-full w-full "
            >
                <MapToolbar
                    initialBounds={mapBounds.length > 1 ? mapBounds : undefined}
                    initialCenterZoom={
                        mapBounds.length === 1
                            ? { center: mapBounds[0], zoom: 10 }
                            : undefined
                    }
                    sigmets={{
                        toggle: () => toggleDisplaySigmets((prev) => !prev),
                        status: displaySigmets,
                        disable: type === "ENTRY",
                    }}
                    route={{
                        show: showRoute,
                        toggle: () => setShowRoute((prev) => !prev),
                    }}
                />

                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
                    attribution="&copy; OpenStreetMap & CARTO"
                    keepBuffer={6}
                />

                {type === "ENTRY" && recording && <RecordingPlot recording={recording} />}

                {/* Always connect flown routes (dep -> arr per entry) */}
                {!showRoute && visitedRoutes.map((segment, idx) => (
                    <Polyline
                        key={idx}
                        positions={segment}
                        pathOptions={{ color: colors.base }}
                        weight={1.5}
                        noClip
                        opacity={0.75}
                    />
                ))}

                {aerodromes.length > 0 && waypoints.length > 0 && (
                    <>
                        {showRoute && (
                            <RoutePlot
                                navdata={{ aerodromes, waypoints, navaids }}
                                user={user}
                                options={
                                    type === "ENTRY"
                                        ? { singleEntry: true, singleEntryId: entryId }
                                        : {}
                                }
                            />
                        )}
                    </>
                )}

                {type !== "ENTRY" && aerodromes.length > 0 && (
                    <AerodromesLayer
                        navdata={aerodromes}
                        user={user}
                        options={{ highlightVisited: true, type: type }}
                    />
                )}

                <SigmetMap displaySigmets={displaySigmets} />
            </MapContainer>
        </div>
    ) : (
        <MapNotAvailable dimensions={dimensions} />
    );
};

export default RouteMap;
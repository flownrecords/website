import type { Aerodrome, Navaid, User, Waypoint } from "../../lib/types";
import { extractRoutePoints } from "../../lib/navigation";
import { CircleMarker, Polyline, Popup, Marker } from "react-leaflet";

type CoordType = "WPT" | "AD" | "NAV";

const colors = {
    accent: "#313ED8",
    base: "#666666",
    vor: "#D86E31",
};

export const RoutePlot = ({
    navdata,
    user,
    options = {
        singleEntry: false,
    },
}: {
    navdata: {
        aerodromes: Aerodrome[];
        waypoints: Waypoint[];
        navaids: Navaid[];
    };
    user: User;
    options?: {
        singleEntry?: boolean;
        singleEntryId?: number;
    };
}) => {
    const entries = options.singleEntry
        ? user?.logbookEntries.filter((entry) => entry.id === options.singleEntryId)
        : user?.logbookEntries;

    if (!entries || entries.length === 0) return null;

    return (
        <>
            {entries.map((entry, idx) => {
                const routeCoords: [number, number][] = [];
                const points: {
                    id: string;
                    type: CoordType;
                    coords: [number, number];
                    extra?: any;
                }[] = [];

                // DEP
                const dep = navdata.aerodromes.find(
                    (ad) => ad.icao === (entry.plan?.depAd || entry.depAd),
                );
                const arr = navdata.aerodromes.find(
                    (ad) => ad.icao === (entry.plan?.arrAd || entry.arrAd),
                );

                if (dep) {
                    routeCoords.push([dep.coords.lat, dep.coords.long]);
                    points.push({
                        id: dep.icao,
                        type: "AD",
                        coords: [dep.coords.lat, dep.coords.long],
                    });
                }

                // Extract waypoints, aerodromes, and navaids from route string
                const routeFixes = extractRoutePoints(entry.plan?.route || "")
                    .map((fixId) => {
                        const fix =
                            navdata.waypoints.find((w) => w.id === fixId) ||
                            navdata.aerodromes.find((ad) => ad.icao === fixId) ||
                            navdata.navaids.find((nav) => nav.id === fixId);

                        if (fix) {
                            if ("icao" in fix) {
                                // Aerodrome
                                return {
                                    id: fix.icao,
                                    type: "AD",
                                    coords: [fix.coords.lat, fix.coords.long] as [number, number],
                                };
                            } else if ("frequency" in fix) {
                                // @ts-ignore
                                return {
                                    id: fix.id,
                                    type: "NAV",
                                    coords: [fix.coords.lat, fix.coords.long] as [number, number],
                                    extra: { type: (fix as Navaid).type, freq: fix.frequency },
                                };
                            } else {
                                // Waypoint
                                return {
                                    id: fix.id,
                                    type: "WPT",
                                    coords: [fix.coords.lat, fix.coords.long] as [number, number],
                                };
                            }
                        }
                        console.warn(`Fix not found for ${fixId} in entry ${entry.id}`);
                        return null;
                    })
                    .filter(Boolean) as {
                    id: string;
                    type: CoordType;
                    coords: [number, number];
                    extra?: any;
                }[];

                routeCoords.push(...routeFixes.map((f) => f.coords));
                points.push(...routeFixes);

                if (arr) {
                    routeCoords.push([arr.coords.lat, arr.coords.long]);
                    points.push({
                        id: arr.icao,
                        type: "AD",
                        coords: [arr.coords.lat, arr.coords.long],
                    });
                }

                if (routeCoords.length < 2) return null;

                return (
                    <div key={`route-${idx}`}>
                        {/* Route polyline */}
                        <Polyline
                            positions={routeCoords}
                            pathOptions={{ color: colors.base }}
                            weight={1.5}
                            noClip
                            opacity={0.75}
                        >
                            <Popup>
                                <strong>Route:</strong> {dep?.icao || "?"} → {arr?.icao || "?"}
                            </Popup>
                        </Polyline>

                        {/* Route points */}
                        {points.map((pos, i) => {
                            if (
                                pos.type === "NAV" &&
                                (pos.extra?.type === "VOR" || pos.extra?.type === "VOR/DME")
                            ) {
                                return (
                                    <Marker key={`nav-${idx}-${i}`} position={pos.coords}>
                                        <Popup>
                                            <strong>{pos.id}</strong> ({pos.extra?.type})<br />
                                            Freq: {pos.extra?.freq || "—"} MHz
                                        </Popup>
                                    </Marker>
                                );
                            }

                            return (
                                <CircleMarker
                                    key={`marker-${idx}-${i}`}
                                    center={pos.coords}
                                    pathOptions={{
                                        fillColor: pos.type === "AD" ? colors.accent : colors.base,
                                        color: pos.type === "AD" ? colors.accent : colors.base,
                                        fillOpacity: 1,
                                        weight: 0,
                                    }}
                                    radius={1.5}
                                    stroke={false}
                                >
                                    <Popup>
                                        {pos.type === "AD" ? (
                                            <div>
                                                <strong>{pos.id}</strong>
                                                <br />
                                                {navdata.aerodromes.find((ad) => ad.icao === pos.id)
                                                    ?.name || "Unknown aerodrome"}
                                            </div>
                                        ) : pos.type === "NAV" ? (
                                            <div>
                                                <strong>{pos.id}</strong> ({pos.extra?.type})
                                                <br />
                                                Freq: {pos.extra?.freq || "—"} MHz
                                            </div>
                                        ) : (
                                            <div>
                                                <strong>{pos.id}</strong>
                                                <br />
                                                {navdata.waypoints.find((wpt) => wpt.id === pos.id)
                                                    ?.name || "Unknown waypoint"}
                                            </div>
                                        )}
                                    </Popup>
                                </CircleMarker>
                            );
                        })}
                    </div>
                );
            })}
        </>
    );
};

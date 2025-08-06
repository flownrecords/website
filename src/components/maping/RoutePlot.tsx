import type { Aerodrome, User, Waypoint } from "../../lib/types";
import { extractRoutePoints } from "../../lib/navigation";
import { CircleMarker, Polyline, Popup } from "react-leaflet";

type CoordType = "WPT" | "AD";

const colors = {
    accent: "#313ED8",
    base: "#666666",
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
                const points: { id: string; type: CoordType; coords: [number, number] }[] = [];

                // Find DEP and ARR
                const dep = navdata.aerodromes.find(
                    (ad) => ad.icao === (entry.plan?.depAd || entry.depAd)
                );
                const arr = navdata.aerodromes.find(
                    (ad) => ad.icao === (entry.plan?.arrAd || entry.arrAd)
                );

                if (dep) {
                    routeCoords.push([dep.coords.lat, dep.coords.long]);
                    points.push({ id: dep.icao, type: "AD", coords: [dep.coords.lat, dep.coords.long] });
                }

                // Extract route waypoints
                const routeFixes = extractRoutePoints(entry.plan?.route || "").map((wpt) => {
                    const fix =
                        navdata.waypoints.find((w) => w.id === wpt) ||
                        navdata.aerodromes.find((ad) => ad.icao === wpt);
                    if (fix) {
                        return {
                            id: "icao" in fix ? fix.icao : fix.id,
                            type: navdata.aerodromes.find((ad) => ad.icao === wpt) ? "AD" : "WPT",
                            coords: [fix.coords.lat, fix.coords.long] as [number, number],
                        };
                    }
                    console.warn(`Waypoint or aerodrome not found for ${wpt} in entry ${entry.id}`);
                    return null;
                }).filter(Boolean) as { id: string; type: CoordType; coords: [number, number] }[];

                routeCoords.push(...routeFixes.map((f) => f.coords));
                points.push(...routeFixes);

                if (arr) {
                    routeCoords.push([arr.coords.lat, arr.coords.long]);
                    points.push({ id: arr.icao, type: "AD", coords: [arr.coords.lat, arr.coords.long] });
                }

                if (routeCoords.length < 2) return null;

                return (
                    <div key={`route-${idx}`}>
                        {/* Route Polyline */}
                        <Polyline
                            positions={routeCoords}
                            pathOptions={{ color: colors.base }}
                            weight={1.5}
                            noClip
                            opacity={0.75}
                        >
                            <Popup>
                                <strong>Route:</strong>{" "}
                                {dep?.icao || "?"} → {arr?.icao || "?"}
                            </Popup>
                        </Polyline>

                        {/* Points on the route */}
                        {points.map((pos, i) => (
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
                                            {navdata.aerodromes.find((ad) => ad.icao === pos.id)?.name ||
                                                "Unknown aerodrome"}
                                        </div>
                                    ) : (
                                        <div>
                                            <strong>{pos.id}</strong>
                                            <br />
                                            {navdata.waypoints.find((wpt) => wpt.id === pos.id)?.name ||
                                                "Unknown waypoint"}
                                        </div>
                                    )}
                                </Popup>
                            </CircleMarker>
                        ))}
                    </div>
                );
            })}
        </>
    );
};

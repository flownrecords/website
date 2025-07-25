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
    const coords: { id: string; type: CoordType; data: [number, number] }[] = [];

    const entries = options.singleEntry
        ? user?.logbookEntries.filter((entry) => entry.id === options.singleEntryId)
        : user?.logbookEntries;

    entries?.forEach((entry) => {
        const dep = navdata.aerodromes.find(
            (ad: any) => ad.icao === (entry.plan?.depAd || entry.depAd),
        );
        const arr = navdata.aerodromes.find(
            (ad: any) => ad.icao === (entry.plan?.arrAd || entry.arrAd),
        );

        const route = extractRoutePoints(entry.plan?.route || "").map((wpt) => {
            const fix =
                navdata.waypoints.find((w) => w.id === wpt) ||
                navdata.aerodromes.find((ad) => ad.icao === wpt);

            if (fix) {
                return {
                    ...fix,
                    type: navdata.aerodromes.find((ad) => ad.icao === wpt) ? "AD" : "WPT",
                };
            } else {
                console.warn(`Waypoint or aerodrome not found for ${wpt} in entry ${entry.id}`);
                return null;
            }
        });

        if (dep) {
            coords.push({
                id: dep.icao,
                type: "AD",
                data: [dep.coords.lat, dep.coords.long],
            });
        }

        route.forEach((fix) => {
            if (fix) {
                let id = "icao" in fix ? fix.icao : fix.id;
                coords.push({
                    id: id,
                    type: fix.type === "AD" ? "AD" : "WPT",
                    data: [fix.coords.lat, fix.coords.long],
                });
            }
        });

        if (arr) {
            coords.push({
                id: arr.icao,
                type: "AD",
                data: [arr.coords.lat, arr.coords.long],
            });
        }
    });

    return (
        <>
            {coords.length > 1 && (
                <Polyline
                    positions={coords.map((c) => c.data)}
                    pathOptions={{ color: colors.base }}
                    weight={1.5}
                    noClip={true}
                    opacity={0.75}
                />
            )}

            {coords.map((pos, idx) => (
                <CircleMarker
                    key={`polyline-${idx}`}
                    center={pos.data}
                    pathOptions={{
                        fillColor: pos.type === "AD" ? colors.accent : colors.base,
                        color: pos.type === "AD" ? colors.accent : colors.base,
                        fillOpacity: 1,
                        weight: 0,
                    }}
                    radius={1.5}
                    stroke={false}
                >
                    <Popup className="route-popup">
                        {pos.type === "AD" ? (
                            <div>
                                <strong>{pos.id}</strong>
                                <br />
                                {navdata.aerodromes.find((ad) => ad.icao === pos.id)?.name ||
                                    "Unknown name"}
                            </div>
                        ) : (
                            <div>
                                <strong>{pos.id}</strong>
                                <br />
                                {navdata.waypoints.find((wpt) => wpt.id === pos.id)?.name ||
                                    "Unknown name"}
                            </div>
                        )}
                    </Popup>
                </CircleMarker>
            ))}
        </>
    );
};

import { CircleMarker, Popup } from "react-leaflet";
import type { Aerodrome, User } from "../../lib/types";

export const AerodromesLayer = ({
    options: { highlightVisited = false, type = "OVERVIEW", entryId },
    navdata,
    user,
}: {
    options: {
        highlightVisited?: boolean;
        type: "OVERVIEW" | "PLANNING" | "ENTRY" | "SIGMET";
        entryId?: number;
    };
    navdata: Aerodrome[];
    user: User;
}) => {
    const colors = {
        accent: "#313ED8",
        base: "#666666",
    };

    const visitedAd: string[] = [];

    user?.logbookEntries
        .filter((entry) => {
            if (type === "ENTRY") {
                return entry.id === entryId;
            }
            return true;
        })
        .map((entry) => {
            if (entry.depAd) {
                visitedAd.push(entry.depAd.toUpperCase());
            }
            if (entry.arrAd) {
                visitedAd.push(entry.arrAd.toUpperCase());
            }
            if (entry.plan?.depAd) {
                visitedAd.push(entry.plan.depAd.toUpperCase());
            }
            if (entry.plan?.arrAd) {
                visitedAd.push(entry.plan.arrAd.toUpperCase());
            }

            if (entry.plan?.route) {
                const route = entry.plan.route.split(" ");
                route.forEach((icao) => {
                    if (/^[A-Z0-9]{2,5}$/.test(icao)) {
                        visitedAd.push(icao.toUpperCase());
                    }
                });
            }
        });

    return (
        <>
            {navdata.map((ad) => {
                const isVisited = highlightVisited && visitedAd.includes(ad.icao?.toUpperCase?.());

                if (ad.coords?.lat && ad.coords?.long) {
                    return (
                        <CircleMarker
                            key={ad.icao}
                            center={[ad.coords.lat, ad.coords.long]}
                            pathOptions={{
                                fillColor: isVisited ? colors.accent : colors.base,
                                color: isVisited ? colors.accent : colors.base,
                                fillOpacity: 1,
                                weight: 0,
                            }}
                            radius={1}
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
                    );
                }
            })}
        </>
    );
};

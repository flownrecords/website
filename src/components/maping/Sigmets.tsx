import { useEffect, useState } from "react";
import { Polygon, LayerGroup, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api, { ENDPOINTS } from "../../lib/api";

interface Sigmet {
    isigmetId: number;
    icaoId: string;
    firId: string;
    firName: string;
    coords: { lat: number; lon: number }[];
    hazard: string;
    qualifier: string;
    top?: number | null;
    base?: number | null;
    validTimeFrom: number;
    validTimeTo: number;
    receiptTime: string;
    rawSigmet: string;
}

const colorCoding = {
    TS: "red",
    TURB: "orange",
    ICE: "#0070ff",
    TC: "red",
    VA: "#FFDE21",
};

export default function SigmetLayer({ displaySigmets }: { displaySigmets: boolean }) {
    const [sigmets, setSigmets] = useState<Sigmet[]>([]);

    useEffect(() => {
        api.get(ENDPOINTS.WX.SIGMET)
            .then((response) => {
                setSigmets(response || []);
            })
            .catch(console.error);
    }, []);

    return (
        <LayerGroup>
            {sigmets.map((sig) => {
                if (!sig.coords || sig.coords.length < 3) return null;

                const latlngs = sig.coords
                    .filter((c) => c && typeof c.lat === "number" && typeof c.lon === "number")
                    .map((c) => [c.lat, c.lon] as [number, number]);

                const from =
                    new Date(sig.validTimeFrom * 1000)
                        .toLocaleString("en-GB", {
                            timeZone: "UTC",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        .replace(/:|,/g, "") + "Z";
                const to =
                    new Date(sig.validTimeTo * 1000)
                        .toLocaleString("en-GB", {
                            timeZone: "UTC",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        .replace(/:|,/g, "") + "Z";

                const formatLevel = (value?: number | null) => {
                    if (!value || value < 0) return "SFC";

                    if (value >= 10000) {
                        return `FL${Math.round(value / 100)}`;
                    }

                    return `${value}ft`;
                };

                const top = formatLevel(sig.top);
                const base = formatLevel(sig.base);

                if (displaySigmets) {
                    return (
                        <Polygon
                            key={sig.isigmetId}
                            positions={latlngs}
                            pathOptions={{
                                color:
                                    colorCoding[sig.hazard as keyof typeof colorCoding] || "gray",
                                fillOpacity: 0.1,
                                weight: 1,
                                dashArray: "3,3",
                            }}
                        >
                            <Popup className="w-[300px]">
                                <div className="">
                                    <h1 className="font-semibold">{sig.firId}</h1>
                                    <div className="flex-col gap-1 flex">
                                        <span>
                                            <span className="font-semibold">Hazard</span>{" "}
                                            {sig.hazard}
                                        </span>
                                        <span>
                                            <span className="font-semibold">Qualifier</span>{" "}
                                            {sig.qualifier}
                                        </span>
                                        <span>
                                            <span className="font-semibold">Top</span> {top}
                                        </span>
                                        <span>
                                            <span className="font-semibold">Base</span> {base}
                                        </span>
                                        <span>
                                            <span className="font-semibold">Valid From</span> {from}
                                        </span>
                                        <span>
                                            <span className="font-semibold">Valid To</span> {to}
                                        </span>
                                        <span className="font-medium text-xs">{sig.rawSigmet}</span>
                                    </div>
                                </div>
                            </Popup>
                        </Polygon>
                    );
                }
            })}
        </LayerGroup>
    );
}

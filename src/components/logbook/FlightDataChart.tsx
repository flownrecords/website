import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import type { FlightRecording, FlightRecordingPlacemark } from "../../lib/types";
import { useEffect, useState } from "react";

const colors = {
    accent: "#313ED8",
    secondAccent: "#DD3434",
    base: "#666666",
};

export default function FlightDataChart({ recording }: { recording: FlightRecording }) {
    function useIsMobile(breakpoint = 768) {
        const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

        useEffect(() => {
            const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }, [breakpoint]);

        return isMobile;
    }

    const isMobile = useIsMobile(768);

    const chartData = recording.coords
    .map((point, index, arr) => {
        if (!point.altitude || !point.timestamp) return null;

        const prev = arr[index - 1];
        const next = arr[index + 1];
        const speed = point.groundSpeed || 0;

        if( speed === undefined || speed === null) return null;
        // Remove isolated zeros
        if (speed === 0 && prev.groundSpeed && prev.groundSpeed > 0 && next.groundSpeed && next.groundSpeed > 0) {
            return null;
        }

        // Remove sudden unrealistic drops/spikes (change > 30 knots in 1 step)
        if (prev?.groundSpeed && next?.groundSpeed) {
            const prevDiff = Math.abs(speed - prev.groundSpeed);
            const nextDiff = Math.abs(speed - next.groundSpeed);
            if (prevDiff > 30 && nextDiff > 30) {
                return null;
            }
        }

        return {
            time: point.timestamp,
            altitude: point.altitude.value,
            groundSpeed: speed,
            verticalSpeed: point.verticalSpeed || 0
        };
    })
    .filter(Boolean); // Remove null values

    const smoothData = (data: FlightRecordingPlacemark[], windowSize = 3) => {
        return data.map((d, i) => {
            const start = Math.max(0, i - Math.floor(windowSize / 2));
            const end = Math.min(data.length, i + Math.floor(windowSize / 2) + 1);
            const slice = data.slice(start, end);

            return {
                ...d,
                groundSpeed: slice.reduce((sum, p) => sum + (p.groundSpeed || 0), 0) / slice.length
            };
        });
    };

    const finalChartData = smoothData(chartData as any, 5);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-secondary text-white text-sm p-2 rounded shadow">
                    <p className="mb-2 font-semibold">
                        {new Date(label).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                        })} UTC
                    </p>
                    {payload.map((item: any, index: number) => (
                        <p key={index}>
                            <span style={{ color: item.color }}>{item.name}:</span> <strong>{item.value ? isNaN(item.value) ? item.value : item.value.toFixed(0) : "N/A"}</strong>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={finalChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>

                <CartesianGrid strokeLinecap="round" color={colors.base} opacity={0.1}/>

                <XAxis
                    dataKey="time"
                    tickFormatter={(value) =>
                        new Date(value).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                    }
                    label={{
                        fontSize: isMobile ? 10 : 12,
                        style: { fill: "#ccc" },
                        margin: isMobile ? 0 : 10,
                    }}
                    tickMargin={10}
                />

                <YAxis
                    yAxisId="left"
                    tick={{ fill: "#ccc", fontSize: isMobile ? 10 : 12 }}
                    tickMargin={10}  // <-- Adds spacing between labels and axis
                    label={{
                        value: "Altitude (ft)",
                        angle: -90,
                        position: "insideLeft",
                        fontSize: isMobile ? 12 : 14,
                        style: { fill: "#ccc" },
                    }}
                />

                {/* Right Y Axis (Optional Ground Speed) */}
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: "#ccc", fontSize: isMobile ? 10 : 12 }}
                    tickMargin={10}
                    label={{
                        value: "Ground Speed (kt)",
                        angle: 90,
                        position: "insideRight",
                        fontSize: isMobile ? 12 : 14,
                        style: { fill: "#ccc" },
                    }}
                />

                 <Tooltip content={<CustomTooltip />} />

                <Legend />
                {/* Main Line: Altitude */}
                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="altitude"
                    stroke={colors.accent}
                    dot={false}
                    name="Altitude"
                />

                {/* Optional: Ground Speed */}
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="groundSpeed"
                    stroke={colors.secondAccent}
                    dot={false}
                    name="Ground Speed"
                />

            </LineChart>
        </ResponsiveContainer>
    );
}

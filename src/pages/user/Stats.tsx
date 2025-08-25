import { useAuth } from "../../components/auth/AuthContext";
import { captalize, parseDuration, useIsMobile } from "../../lib/utils";

import PageLoader from "../../components/general/Loader";
import Splash from "../../components/general/Splash";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    CartesianGrid,
    Legend,
    Line,
    PieChart,
    Cell,
    Pie,
} from "recharts";

import { ChartTooltip } from "../../components/user/ChartTooltip";
import Button from "../../components/general/Button";
import { useNavigate } from "react-router-dom";
import { Undo2 } from "lucide-react";
import Footer from "../../components/general/Footer";
import { parseTime } from "../../components/user/ChartCarousel";

export default function Stats() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const logbook = user?.logbookEntries ?? [];

    const isMobile = useIsMobile(768);
    const chartMargin = isMobile
        ? { top: 0, right: 0, left: 0, bottom: 0 }
        : { top: 0, right: 45, left: 45, bottom: 0 };

    const chartHeight = isMobile ? 300 : 400;

    const monthlyData = logbook.reduce(
        (acc, entry) => {
            const key = new Date(entry.date as any).toLocaleString("default", {
                month: "short",
                year: "numeric",
            });

            if (!acc[key]) acc[key] = { time: 0, flights: 0 };
            acc[key].time +=
                (entry.includeInFt
                    ? Number(
                          typeof entry.total === "number" && entry.total > 0
                              ? entry.total
                              : entry.simTime,
                      )
                    : 0) || 0;
            acc[key].flights += 1;
            return acc;
        },
        {} as Record<string, { time: number; flights: number }>,
    );

    const monthFlightHours = Object.entries(monthlyData)
        .sort(([a], [b]) => {
            const dateA = new Date(a);
            const dateB = new Date(b);
            return dateA.getTime() - dateB.getTime();
        })
        .slice(isMobile ? -4 : -12)
        .map(([month, values]) => ({
            name: month,
            time: values.time,
            flights: values.flights,
        }));

    const mostFlownAircraft = logbook.reduce(
        (acc, entry) => {
            const aircraft = entry.aircraftRegistration || "Unknown";
            if (!acc[aircraft]) acc[aircraft] = { name: aircraft, flights: 0 };
            acc[aircraft].flights += 1;
            return acc;
        },
        {} as Record<string, { name: string; flights: number }>,
    );
    Object.values(mostFlownAircraft).sort((a, b) => b.flights - a.flights);

    const sortedAircraft = Object.values(mostFlownAircraft)
        .sort((a, b) => b.flights - a.flights)
        .slice(0, isMobile ? 5 : 15);

    const vfrIfrData = [
        {
            name: "VFR",
            value: logbook.reduce(
                (sum, e) => sum + ((Number(e.sepVfr) || 0) + (Number(e.meVfr) || 0)),
                0,
            ),
        },
        {
            name: "IFR",
            value: logbook.reduce(
                (sum, e) =>
                    sum +
                    ((Number(e.sepIfr) || 0) + (Number(e.meIfr) || 0) + (Number(e.simTime) || 0)),
                0,
            ),
        },
    ];

    const dayNightData = [
        {
            name: "Day",
            value: logbook.reduce(
                (sum, e) => sum + (Number(e.dayTime) || 0) + (Number(e.simTime) || 0),
                0,
            ),
        },
        {
            name: "Night",
            value: logbook.reduce((sum, e) => sum + (Number(e.nightTime) || 0), 0),
        },
    ];

    const landingsDataRaw = logbook.reduce(
        (acc, entry) => {
            const date = new Date(entry.date as any);
            const key = date.toLocaleString("default", { month: "short", year: "numeric" });
            if (!acc[key]) acc[key] = { name: key, landings: 0 };
            acc[key].landings += (entry.landDay || 0) + (entry.landNight || 0);
            return acc;
        },
        {} as Record<string, { name: string; landings: number }>,
    );

    const landingsData = Object.values(landingsDataRaw)
        .sort((a, b) => {
            const dateA = new Date(a.name);
            const dateB = new Date(b.name);
            return dateA.getTime() - dateB.getTime();
        })
        .slice(isMobile ? -5 : -12);
    
    const flightsByDayOfWeek = logbook.reduce((acc, entry) => {
    const date = new Date(entry.date as any);
    const day = date.toLocaleString("en-US", { weekday: "long" }); // "Monday", "Tuesday", etc.

    if (!acc[day]) acc[day] = { name: day, flights: 0 };
    acc[day].flights += 1;

    return acc;
    }, {} as Record<string, { name: string; flights: number }>);

    // Convert to sorted array (Mon → Sun)
    const orderedWeekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    const flightsByDayOfWeekArray = orderedWeekdays.map(day => 
        flightsByDayOfWeek[day] || { name: day, flights: 0 }
    );

    return (
        <>
            <Splash
                uppertext={
                    <>
                        {user ? (
                            `${captalize(user?.firstName) ?? `@${user?.username}`}'s`
                        ) : (
                            <span className="h-8 w-0.5 inline-block"></span>
                        )}
                    </>
                }
                title="Details"
            />

            <div className="container mx-auto max-w-6xl p-4 xl:px-0">
                <div className="mb-4 ring-2 ring-white/25 rounded-lg p-4">
                    <div className="grid grid-cols-4 gap-4">
                        <Button
                            type="button"
                            styleType="small"
                            onClick={() => navigate(-1)}
                            text={
                                <>
                                    <Undo2 className="h-4 w-4 inline-block" strokeWidth={2} />{" "}
                                    <span className="hidden lg:inline">Go Back</span>
                                </>
                            }
                        />
                    </div>
                </div>

                {user ? (
                    <div
                        className="
                            space-y-4
                        "
                    >
                        <div className="bg-primary ring-2 ring-white/25 rounded-lg p-4">
                            <h2 className="text-white mb-2 text-sm font-semibold text-center">
                                Monthly Hours & Flights
                            </h2>

                            <ResponsiveContainer width="100%" height={chartHeight}>
                                <LineChart
                                    data={monthFlightHours}
                                    margin={{
                                        right: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        stroke="#1E1E1E"
                                        strokeLinecap="round"
                                        opacity={0.25}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#ccc"
                                        fontSize={isMobile ? 10 : 14}
                                    />

                                    <YAxis
                                        stroke="#ccc"
                                        tick={{ fontSize: isMobile ? 10 : 14, fill: "#ccc" }}
                                        label={{
                                            value: "Flight Time (h)",
                                            angle: -90,
                                            position: "insideLeft",
                                            fontSize: isMobile ? 12 : 14,
                                            offset: isMobile ? 8 : 10,
                                            style: { fill: "#ccc" },
                                            margin: isMobile ? 0 : 10,
                                        }}
                                    />

                                    <Tooltip
                                        formatter={(value: any, name: string) => {
                                            if (name === "Flight Time")
                                                return [parseDuration(value), name];
                                            return [value, name];
                                        }}
                                        content={<ChartTooltip />}
                                    />

                                    <Legend />

                                    <Line
                                        type="monotone"
                                        dataKey="time"
                                        stroke="#313ED8"
                                        name="Flight Time"
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="flights"
                                        stroke="#DD3434"
                                        name="Flights"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-primary ring-2 ring-white/25 rounded-lg p-4">
                            <h2 className="text-white mb-2 text-sm font-semibold text-center">
                                Most Flown Aircraft
                            </h2>

                            <ResponsiveContainer width="100%" height={chartHeight}>
                                <BarChart
                                    data={Object.values(sortedAircraft)}
                                    margin={{
                                        left: -30,
                                    }}
                                >
                                    <CartesianGrid
                                        stroke="#1E1E1E"
                                        strokeLinecap="round"
                                        opacity={0.25}
                                    />

                                    <XAxis
                                        dataKey="name"
                                        stroke="#fff"
                                        label={""}
                                        angle={isMobile ? -45 : 0}
                                        fontSize={isMobile ? 8 : 12}
                                        textAnchor={isMobile ? "end" : "middle"}
                                        padding={{ left: 0, right: 0 }}
                                    />
                                    <YAxis style={{ padding: 0 }} fontSize={isMobile ? 10 : 12} />

                                    <Tooltip
                                        cursor={{ fill: "rgba(255, 255, 255, 0.01)" }}
                                        content={<ChartTooltip />}
                                    />
                                    <Legend />

                                    <Bar
                                        dataKey="flights"
                                        name="Aircraft Flights"
                                        fill="#E6AF2E"
                                        radius={[5, 5, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-primary lg:ring-2 ring-white/25 rounded-lg lg:p-4 grid grid-cols-1 lg:grid-cols-2 gap-y-4">
                            <div className="ring-2 lg:ring-0 ring-white/25 rounded-lg p-4 lg:p-0">
                                <h2 className="text-white text-center">VFR vs IFR Time</h2>

                                <ResponsiveContainer width="100%" height={chartHeight}>
                                    <PieChart margin={chartMargin}>
                                        <Legend />
                                        <Tooltip
                                            formatter={(value: any) => parseDuration(value)}
                                            content={<ChartTooltip type="time" />}
                                        />

                                        <Pie
                                            data={vfrIfrData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={isMobile ? 64 : 128}
                                            label={(entry) =>
                                                `${entry.name}: ${parseDuration(entry.value)}`
                                            }
                                            strokeWidth={0}
                                        >
                                            {vfrIfrData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}-${entry.name}`}
                                                    fill={index % 2 ? "#DD3434" : "#313ED8"}
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="ring-2 lg:ring-0 ring-white/25 rounded-lg p-4 lg:p-0">
                                <h2 className="text-white text-center">Day vs Night Time</h2>
                                <ResponsiveContainer width="100%" height={chartHeight}>
                                    <PieChart margin={chartMargin}>
                                        <Legend />
                                        <Tooltip content={<ChartTooltip type="time" />} />

                                        <Pie
                                            data={dayNightData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={isMobile ? 64 : 128}
                                            label={(entry) =>
                                                `${entry.name}: ${parseTime(entry.value)}`
                                            }
                                            strokeWidth={0}
                                        >
                                            {dayNightData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-day-${index}-${entry.name}`}
                                                    fill={index % 2 ? "#DD3434" : "#313ED8"}
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-primary ring-2 ring-white/25 rounded-lg p-4">
                            <h2 className="text-white text-center">Monthly Landings</h2>
                            <ResponsiveContainer width="100%" height={chartHeight}>
                                <BarChart
                                    data={landingsData}
                                    margin={{
                                        left: -30,
                                    }}
                                >
                                    <CartesianGrid
                                        stroke="#1E1E1E"
                                        strokeLinecap="round"
                                        opacity={0.25}
                                    />
                                    <XAxis dataKey="name" fontSize={isMobile ? 12 : 14} />
                                    <YAxis fontSize={isMobile ? 10 : 12} />
                                    <Tooltip
                                        cursor={{ fill: "rgba(255, 255, 255, 0.01)" }}
                                        content={<ChartTooltip />}
                                    />
                                    <Bar
                                        dataKey="landings"
                                        name="Landings"
                                        fill="#62BF58"
                                        radius={[5, 5, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-primary ring-2 ring-white/25 rounded-lg p-4">
                            <h2 className="text-white text-center">Flights by Day of Week</h2>
                            <ResponsiveContainer width="100%" height={chartHeight}>
                                <BarChart
                                    data={flightsByDayOfWeekArray}
                                    margin={{
                                        left: -30,
                                    }}
                                >
                                    <CartesianGrid stroke="#1E1E1E" strokeLinecap="round" opacity={0.25} />
                                    <XAxis dataKey="name" fontSize={isMobile ? 12 : 14} />
                                    <YAxis fontSize={isMobile ? 10 : 12} />
                                    <Tooltip
                                        cursor={{ fill: "rgba(255, 255, 255, 0.01)" }}
                                        content={<ChartTooltip />}
                                    />
                                    <Bar
                                        dataKey="flights"
                                        name="Day"
                                        fill="#732EDC"
                                        radius={[5, 5, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <PageLoader />
                )}
            </div>

            <Footer />
        </>
    );
}

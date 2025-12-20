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
import { Undo2, Filter, ChevronDown } from "lucide-react"; // Added Filter icon
import Footer from "../../components/general/Footer";
import { parseTime } from "../../components/user/ChartCarousel";
import { useState, useMemo } from "react"; // Added useMemo and useState

// Temporary fix for erroneous data provided from @nortavia flightlogger logbook which aircraft type is replaced by the callsign
function fixType(aircraftType?: string | null): string | undefined {
    if (!aircraftType) return undefined;
    let type = aircraftType.trim().toUpperCase();
    if (type && type.length === 2) {
        if (type.startsWith("4")) {
            type = "P06T";
        } else if (type.startsWith("2")) {
            type = "C172";
        } else if (type.startsWith("1")) {
            type = "C152";
        }
    }

    return type;
}

export default function Stats() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const logbook = user?.logbookEntries ?? [];

    const isMobile = useIsMobile(768);
    const chartMargin = isMobile
        ? { top: 0, right: 0, left: 0, bottom: 0 }
        : { top: 0, right: 45, left: 45, bottom: 0 };

    const chartHeight = isMobile ? 300 : 400;

    // --- NEW: Aircraft Filter State ---
    const [aircraftTypeFilter, setAircraftTypeFilter] = useState<string>("All");

    // --- FIX 1: Monthly Hours Data (YYYY-MM Sorting) ---
    const monthlyData = logbook.reduce(
        (acc, entry) => {
            if (!entry.date) return acc;
            const date = new Date(entry.date);
            // Create sortable key: "2024-01"
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const key = `${year}-${month}`;

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
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Sort by string "2024-01"
        .slice(isMobile ? -4 : -12)
        .map(([key, values]) => {
            // Convert back to "Jan 2024" for display
            const [year, month] = key.split("-").map(Number);
            const date = new Date(year, month - 1);
            const name = date.toLocaleString("default", {
                month: "short",
                year: "numeric",
            });
            return {
                name,
                time: values.time,
                flights: values.flights,
            };
        });

    // --- NEW: Aircraft Data with Filtering ---
    
    // 1. Get unique types
    const availableAircraftTypes = useMemo(() => {
        const types = new Set<string>();
        logbook.forEach(entry => {
            let type = fixType(entry.aircraftType);

            if (type) types.add(type);
        });
        return ["All", ...Array.from(types).sort()];
    }, [logbook]);

    // 2. Aggregate data including type
    const mostFlownAircraft = logbook.reduce(
        (acc, entry) => {
            const aircraft = entry.aircraftRegistration || "Unknown";
            if (!acc[aircraft]) acc[aircraft] = { name: aircraft, flights: 0, type: fixType(entry.aircraftType) || "Unknown" };
            acc[aircraft].flights += 1;
            return acc;
        },
        {} as Record<string, { name: string; flights: number; type: string }>,
    );

    // 3. Filter and Sort
    const sortedAircraft = Object.values(mostFlownAircraft)
        .filter((item) => {
            if (aircraftTypeFilter === "All") return true;
            return item.type === aircraftTypeFilter;
        })
        .sort((a, b) => b.flights - a.flights)
        .slice(0, isMobile ? 5 : 15);

    // --- Other Charts (VFR/IFR, Day/Night) ---
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

    // --- FIX 2: Monthly Landings Data (YYYY-MM Sorting) ---
    const landingsDataRaw = logbook.reduce(
        (acc, entry) => {
            if (!entry.date) return acc;
            const date = new Date(entry.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const key = `${year}-${month}`; // Sortable Key

            if (!acc[key]) acc[key] = { key, landings: 0 };
            acc[key].landings += (entry.landDay || 0) + (entry.landNight || 0);
            return acc;
        },
        {} as Record<string, { key: string; landings: number }>,
    );

    const landingsData = Object.values(landingsDataRaw)
        .sort((a, b) => a.key.localeCompare(b.key))
        .slice(isMobile ? -5 : -12)
        .map((item) => {
             const [year, month] = item.key.split("-").map(Number);
             const date = new Date(year, month - 1);
             const name = date.toLocaleString("default", {
                 month: "short",
                 year: "numeric",
             });
             return { name, landings: item.landings };
        });

    const flightsByDayOfWeek = logbook.reduce(
        (acc, entry) => {
            const date = new Date(entry.date as any);
            const day = date.toLocaleString("en-US", { weekday: "long" });

            if (!acc[day]) acc[day] = { name: day, flights: 0 };
            acc[day].flights += 1;

            return acc;
        },
        {} as Record<string, { name: string; flights: number }>,
    );

    const orderedWeekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    const flightsByDayOfWeekArray = orderedWeekdays.map(
        (day) => flightsByDayOfWeek[day] || { name: day, flights: 0 },
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
                    <div className="space-y-4">
                        {/* Monthly Hours Chart */}
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

                        {/* Aircraft Chart with Filter */}
                        <div className="bg-primary ring-2 ring-white/25 rounded-lg p-4">
                            {/* Filter Header */}
                            <div className="mb-2 relative z-10 flex items-center justify-center w-full">
                                <div className="absolute left-0 flex items-center space-x-2 bg-neutral-800/50 rounded-md px-2 py-1 border border-white/10">
                                    <Filter className="w-3 h-3 text-white/50" />
                                    <select
                                        value={aircraftTypeFilter}
                                        onChange={(e) => setAircraftTypeFilter(e.target.value)}
                                        className="bg-transparent text-white text-xs outline-none cursor-pointer appearance-none pr-4"
                                        style={{ backgroundImage: "none" }}
                                    >
                                        {availableAircraftTypes.map((type) => (
                                            <option key={type} value={type} className="bg-neutral-800 text-white">
                                                {/* \u00A0 is a non-breaking space. Adding 2 of them creates a nice gap. */}
                                                {`\u00A0\u00A0${type}`} 
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3 h-3 text-white/50 absolute right-1 pointer-events-none" />
                                </div>
                                <h2 className="text-white text-sm font-semibold">
                                    Most Flown Aircraft
                                </h2>
                            </div>

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

                        {/* VFR/IFR and Day/Night */}
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

                        {/* Monthly Landings Chart */}
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

                        {/* Flights by Day of Week */}
                        <div className="bg-primary ring-2 ring-white/25 rounded-lg p-4">
                            <h2 className="text-white text-center">Flights by Day of Week</h2>
                            <ResponsiveContainer width="100%" height={chartHeight}>
                                <BarChart
                                    data={flightsByDayOfWeekArray}
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
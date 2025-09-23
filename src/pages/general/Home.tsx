import Splash from "../../components/general/Splash";
import Footer from "../../components/general/Footer";
import { useAuth } from "../../components/auth/AuthContext";
import { useEffect, useState } from "react";
import api, { ENDPOINTS } from "../../lib/api";
import Button from "../../components/general/Button";

export default function Home() {
    let highlightTimeout: ReturnType<typeof setTimeout> | null = null;

    const { user } = useAuth();
    const [ stats, setStats ] = useState<any>(null);
    const [ uptime, setUptime ] = useState<string>("0d 0h 0m 0s");
    const [ lastUpdate, setLastUpdate ] = useState<any>(null);

    function highlight() {
        const button = document.getElementById("get-started-button") as HTMLButtonElement;
        if (!button) return;

        button.classList.remove("highlight");

        void button.offsetWidth;

        button.classList.add("highlight");

        if (highlightTimeout) {
            clearTimeout(highlightTimeout);
        }

        highlightTimeout = setTimeout(() => {
            button.classList.remove("highlight");
            highlightTimeout = null;
        }, 6 * 1000);
    }

    function humanDate(date : string | number | Date) {
        return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    function updateUptime() {
        if(stats?.uptime) {
            const seconds = Math.floor((stats.uptime || 0) % 60);
            const minutes = Math.floor((stats.uptime || 0) / 60 % 60);
            const hours = Math.floor((stats.uptime || 0) / 3600 % 24);
            const days = Math.floor((stats.uptime || 0) / 86400);

            let human = "";
            if(days > 0) human += `${days}d `;
            if(hours > 0) human += `${hours}h `;
            if(minutes > 0) human += `${minutes}m `;
            human += `${seconds}s`;
            
            setUptime(human.trim());
            setStats((prevStats: any) => ({
                ...prevStats,
                uptime: prevStats.uptime + 1
            }));
        }
    }

    useEffect(() => {
        const interval = setInterval(updateUptime, 1000);
        return () => clearInterval(interval);
    }, [stats]);

    useEffect(() => {
        api.get(ENDPOINTS.GEN.STATS)
        .then((response) => {
            setStats(response);
            if(response.uptime) {
                updateUptime();
            }
        })
        .catch((error) => {
            console.error("Error fetching stats:", error);
        });

        fetch("https://api.github.com/repos/flownrecords/website")
        .then(async (response) => {
            const data = await response.json();
            if(data.updated_at) setLastUpdate(humanDate(data.updated_at));
        })
    }, []);

    const gradient = " bg-gradient-to-br from-neutral-900 to-neutral-800";
    const variableGradient = " hover:from-neutral-800 hover:to-neutral-900 transition duration-500"

    const LAST_MONTH_VALUES = {
        userCount: 1,
        organizationCount: 1,
        logbookEntryCount: 72,
    }

    function calculateGrowth(current: number, previous: number) {
        if(previous === 0) return 100;
        return Math.round(((current - previous) / previous) * 100);
    }

    const LAST_MONTH_PERCENTAGES = {
        userCount: calculateGrowth(stats?.userCount || 0, LAST_MONTH_VALUES.userCount),
        organizationCount: calculateGrowth(stats?.organizationCount || 0, LAST_MONTH_VALUES.organizationCount),
        logbookEntryCount: calculateGrowth(stats?.logbookEntryCount || 0, LAST_MONTH_VALUES.logbookEntryCount),
    }


    const GROWTH = <span className="text-[#57F287]" title="Growth">+</span>
    const STABLE = <span className="text-[#F28757]" title="Stable">-</span>

    return (
        <>
            <Splash />

            <div className="flex gap-6 py-10 px-4 justify-center">
                <div
                    onClick={highlight}
                    title="Personalize your dashboard and manage your pilot logbook all in one place."
                    className={`relative w-72 h-64 md:h-80 ${gradient + variableGradient} rounded-lg p-2 md:p-6 text-white overflow-hidden ring-2 ring-white/25`}
                >
                    <div className="text-lg md:text-2xl font-semibold z-10 relative">
                        Create Your Profile
                    </div>
                    <div className="absolute text-[14rem] md:text-[18rem] h-[16rem] md:h-[20rem] font-bold text-white/5 bottom-2 left-4">
                        1
                    </div>
                </div>

                <div
                    onClick={highlight}
                    title="Import logs from FlightLogger and other sources."
                    className={`relative w-72 h-64 md:h-80 ${gradient + variableGradient} rounded-lg p-2 md:p-6 text-white overflow-hidden ring-2 ring-white/25`}
                >
                    <div className="text-lg md:text-2xl font-semibold z-10 relative">
                        Upload Your Flights
                    </div>
                    <div className="absolute text-[14rem] md:text-[18rem] h-[16rem] md:h-[20rem] font-bold text-white/5 bottom-2 left-4">
                        2
                    </div>
                </div>

                <div
                    onClick={highlight}
                    title="Dive into charts, trends, and milestones. Visualize your flight experience."
                    className={`relative w-72 h-64 md:h-80 ${gradient + variableGradient} rounded-lg p-2 md:p-6 text-white overflow-hidden ring-2 ring-white/25`}
                >
                    <div className="text-lg md:text-2xl font-semibold z-10 relative">
                        See Your Progress
                    </div>
                    <div className="absolute text-[14rem] md:text-[18rem] h-[16rem] md:h-[20rem] font-bold text-white/5 bottom-2 left-4">
                        3
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <div>
                    <Button
                        to={user ? "/me" : "/getstarted"}
                        text={user ? "Go to Profile" : "Get Started"}
                        id="get-started-button"
                    />
                </div>
            </div>

            {/*<div className="flex justify-center py-2 md:py-10">
                <Button
                    to={user ? "/me" : "/getstarted"}
                    text={user ? "Go to Profile" : "Get Started"}
                    id="get-started-button"
                />
            </div>*/}

            { stats &&
                <div className="container mx-auto max-w-6xl p-4 mt-34 lg:mt-28">
                    <div>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                            <div className={`${gradient} p-4 rounded-lg ring-2 ring-white/25 lg:col-2 group`}>
                                <div className="text-3xl font-bold text-white">
                                    {stats.userCount?.toLocaleString()}{" "}
                                    {LAST_MONTH_PERCENTAGES.userCount > 5 ? GROWTH : STABLE}
                                    <span className="transition duration-500 group-hover:opacity-100 opacity-0">{LAST_MONTH_PERCENTAGES.userCount}%</span>
                                </div>
                                <div className="text-sm text-white/75">User{stats.userCount > 1 ? "s" : ""}</div>
                            </div>
                            <div className={`${gradient} p-4 rounded-lg ring-2 ring-white/25 group`}>
                                <div className="text-3xl font-bold text-white">
                                    {stats.logbookEntryCount?.toLocaleString()}{" "}
                                    {LAST_MONTH_PERCENTAGES.logbookEntryCount > 5 ? GROWTH : STABLE}
                                    <span className="transition duration-500 group-hover:opacity-100 opacity-0">
                                        {LAST_MONTH_PERCENTAGES.logbookEntryCount}%
                                    </span>
                                </div>
                                <div className="text-sm text-white/75">Logbook Entrie{stats.logbookEntryCount > 1 ? "s" : ""}</div>
                            </div>
                            <div className={`${gradient} p-4 rounded-lg ring-2 ring-white/25 group`}>
                                <div className="text-3xl font-bold text-white">
                                    {stats.organizationCount?.toLocaleString()}{" "}
                                    {LAST_MONTH_PERCENTAGES.organizationCount > 5 ? GROWTH : STABLE}
                                    {LAST_MONTH_PERCENTAGES.organizationCount > 5 && <span className="transition duration-500 group-hover:opacity-100 opacity-0">
                                        {LAST_MONTH_PERCENTAGES.organizationCount}%
                                    </span>}
                                </div>
                                <div className="text-sm text-white/75">Organizations{stats.organizationCount > 1 ? "s" : ""}</div>
                            </div>
                        </div>
                        <div className="lg:flex flex-row justify-center w-full mt-4">
                            <div className="grid lg:grid-cols-2 gap-4">
                                <div className={`${gradient} p-4 rounded-lg ring-2 ring-white/25 min-w-auto lg:min-w-64`}>
                                    <div className="text-3xl font-bold text-white">{uptime}</div>
                                    <div className="text-sm text-white/75">Uptime</div>
                                </div>
                                <div className={`${gradient} p-4 rounded-lg ring-2 ring-white/25`}>
                                    <div className="text-3xl font-bold text-white">{ lastUpdate }</div>
                                    <div className="text-sm text-white/75">Last Update</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

            <Footer />
        </>
    );
}

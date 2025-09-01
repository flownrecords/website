import { useAuth } from "../../components/auth/AuthContext";
import Button from "../../components/general/Button";
import Splash from "../../components/general/Splash";
import { parseDate, parseDuration } from "../../lib/utils";
import Icon from "../../assets/images/icon.png";
import ProfileCard from "../../components/user/ProfileCard";
import { useEffect, useState } from "react";
import api, { ENDPOINTS } from "../../lib/api";
import { Undo2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/general/Footer";
import PageLoader from "../../components/general/Loader";

export default function CrewLogbook() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [logbook, setLogbook] = useState(user?.crewForEntries ?? []);

    useEffect(() => {
        api.get(ENDPOINTS.USER.ME)
        .then((response) => {
            if(response.meta.status === 200) {
                setLogbook(response.crewForEntries);
            }
        })
    }, []);

    function totalFlightTime() {
        if (!logbook || logbook.length === 0) {
            return "0h00";
        }

        const total = logbook
            .map((entry) => {
                if (!entry.includeInFt) return 0;
                return Number(
                    typeof entry.total === "number" && entry.total > 0
                        ? entry.total
                        : entry.simTime,
                );
            })
            .reduce((acc, entry) => acc + entry, 0);

        const hours = Math.floor(total);
        const minutes = Math.round((total % 1) * 60);
        return `${hours}h${minutes < 10 ? "0" + minutes : minutes}`;
    }

    function mostVisitedAirport() {
        if (!logbook || logbook.length === 0) {
            return "None";
        }

        return logbook
        .map((entry: any) => entry.depAd)
        .reduce((acc: any, icao: string) => {
            acc[icao] = (acc[icao] || 0) + 1;
            return acc;
        }, {})
        ? Object.entries(
                logbook
                    .map((entry: any) => entry.arrAd)
                    .reduce((acc: any, icao: string) => {
                        acc[icao] = (acc[icao] || 0) + 1;
                        return acc;
                    }, {}),
            ).reduce((a: any, b: any) => (a[1] > b[1] ? a : b))[0]
        : "None";
    }

    function mostFlownAcft() {
        if (!logbook || logbook.length === 0) {
            return "None";
        }
        const aircraftCount = logbook.reduce((acc: any, entry: any) => {
            acc[entry.aircraftRegistration] = (acc[entry.aircraftRegistration] || 0) + 1;
            return acc;
        }, {});

        const mostFlownAcft = Object.keys(aircraftCount).reduce((a, b) =>
            aircraftCount[a] > aircraftCount[b] ? a : b,
        );

        return mostFlownAcft || "None";
    }

    return (
        <>
            <Splash uppertext="Logbook" title="Crew" />

            <div className="container mx-auto max-w-6xl p-4 xl:px-0">
                <div className="ring-2 ring-white/25 rounded-lg p-4">
                    <h3 className="font-semibold text-white/75 mb-2">
                        Logbook of flights you are crew of
                    </h3>
                    <div className="grid lg:grid-cols-4 gap-4">
                        <div className="flex justify-between px-4 py-2 bg-secondary rounded-lg ring-2 ring-white/25">
                            <span className="text-white/50">Flight Time</span>
                            <span className="text-white/75 font-semibold">{totalFlightTime()}</span>
                        </div>
                        <div className="flex justify-between px-4 py-2 bg-secondary rounded-lg ring-2 ring-white/25">
                            <span className="text-white/50">Flown</span>
                            <span className="text-white/75 font-semibold">
                                {`${logbook?.length || 0} flights`}
                            </span>
                        </div>
                        <div className="flex justify-between px-4 py-2 bg-secondary rounded-lg ring-2 ring-white/25">
                            <span className="text-white/50">Most flown aircraft</span>
                            <span className="text-white/75 font-semibold">{mostFlownAcft()}</span>
                        </div>
                        <div className="flex justify-between px-4 py-2 bg-secondary rounded-lg ring-2 ring-white/25">
                            <span className="text-white/50">Most visited airport</span>
                            <span className="text-white/75 font-semibold">{mostVisitedAirport()}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 ring-2 ring-white/25 rounded-lg p-4">
                    <div className="flex flex-col lg:grid grid-cols-4 gap-4">
                        <Button
                            styleType="small"
                            type="button"
                            onClick={() => navigate(-1)}
                            text={
                                <>
                                    <Undo2 className="h-4 w-4 inline-block" strokeWidth={2} />{" "}
                                    <span>Go Back</span>
                                </>
                            }
                        />
                    </div>
                </div>

                <div className="mt-4 bg-primary ring-2 ring-white/25 rounded-lg p-4">
                    <div className="flex justify-between md:grid md:grid-cols-6 pb-2 px-4">
                        <span>Date</span>

                        <span className="hidden md:block"> Registration </span>
                        <span className="block md:hidden"> Reg. </span>

                        <span className="hidden md:block"> Departure </span>
                        <span className="block md:hidden"> Dep. </span>

                        <span className="hidden md:block"> Arrival </span>
                        <span className="block md:hidden"> Arr. </span>

                        <span className="hidden md:block"> Flight Time </span>
                        <span className="block md:hidden"> Time </span>

                        <span className="flex items-center justify-end px-4"></span>
                    </div>
                    { logbook &&
                        logbook.length > 0
                        ? logbook
                        .sort(
                            (a, b) =>
                                new Date(b.date as any).getTime() -
                                new Date(a.date as any).getTime(),
                        )
                        .map((entry, index) => (
                            <div
                                key={index}
                                className={`
                                flex justify-between md:grid md:grid-cols-6 py-4 px-4 items-center
                                transition-all duration-150
                                ${index % 2 === 0 ? "bg-primary hover:bg-primary/75" : "bg-gradient-to-br to-neutral-900 from-neutral-800 hover:from-neutral-800/75"} 
                                rounded-lg not:disabled:cursor-pointer
                                `}
                                aria-disabled={true}
                                onClick={() => {
                                    //navigate(`/me/logbook/${entry.id}`);
                                }}
                            >
                                <span className="text-xs md:text-sm text-white/50 hidden">
                                    {parseDate(entry.date, false)}
                                </span>
                                <span className="text-xs md:text-sm text-white/50 md:block">
                                    {parseDate(entry.date, true)}
                                </span>
                                <span className="text-xs md:text-sm text-white/50">
                                    {entry.aircraftRegistration
                                        ? entry.aircraftRegistration.split(" ")[0]
                                        : "-"}
                                </span>
                                <span className="text-xs md:text-sm text-white/50">
                                    {entry.depAd || "-"}
                                </span>
                                <span className="text-xs md:text-sm text-white/50">
                                    {entry.arrAd || "-"}
                                </span>
                                <span className="text-xs md:text-sm text-white/50">
                                    {parseDuration(
                                        typeof entry.total === "number" && entry.total > 0
                                            ? entry.total
                                            : entry.simTime,
                                    ) || "-"}
                                </span>
                                <span className="flex lg:justify-between justify-end items-center">
                                    <div className="relative group inline-block">
                                        <img
                                            className="h-6 w-6 rounded-full object-cover ring-2 ring-white/25"
                                            draggable="false"
                                            src={entry.user?.profilePictureUrl ?? Icon}
                                            alt="User profile icon"
                                        />

                                        <div
                                            className="
                                            fixed sm:absolute 
                                            top-12 sm:top-auto 
                                            left-1/2 
                                            -translate-x-1/2 
                                            sm:bottom-full 
                                            sm:mb-1 
                                            pointer-events-none 
                                            whitespace-nowrap 
                                            text-white text-xs 
                                            rounded px-2 py-1 
                                            opacity-0 
                                            group-hover:opacity-100 
                                            transition-opacity duration-300 
                                            z-10 shadow-xs"
                                                    >
                                                <ProfileCard
                                                    data={{
                                                        profilePictureUrl:
                                                            entry.user?.profilePictureUrl ??
                                                            "",
                                                        firstName:
                                                            entry.user?.firstName ?? null,
                                                        lastName: entry.user?.lastName ?? "",
                                                        username:
                                                            entry.user?.username ?? null,
                                                        location:
                                                            entry.user?.location ?? null,
                                                        publicProfile:
                                                            entry.user?.publicProfile ??
                                                            false,
                                                        bio: entry.user?.bio ?? null,
                                                        organizationId:
                                                            entry.user?.organizationId ?? "",
                                                        organizationRole:
                                                            entry.user?.organizationRole ??
                                                            "",
                                                        organization:
                                                            entry.user?.organization,
                                                    }}
                                                />
                                        </div>
                                    </div>

                                    <span className="hidden md:inline-block">
                                        <Button
                                            disabled={true}
                                            to={`/me/logbook/${entry.id}`}
                                            text="View"
                                            styleType="small"
                                            className="text-sm"
                                        />
                                    </span>
                                </span>
                            </div>
                        ))
                    : <PageLoader/>}
                </div>
            </div>

            <Footer />
        </>
    );
}
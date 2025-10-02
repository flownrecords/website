import { useEffect, useState } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import ProfileHeader from "../../components/user/ProfileHeader";
import api, { ENDPOINTS } from "../../lib/api";
import { useNavigate, useParams } from "react-router-dom";
import { Book, Cloudy, Loader, Share, UserPlus, UsersRound } from "lucide-react";
import Button from "../../components/general/Button";
import RouteMap from "../../components/maping/RouteMap";
import type { User } from "../../lib/types";
import { lastFlightSince, parseDate, parseDuration } from "../../lib/utils";
import Footer from "../../components/general/Footer";
import useAlert from "../../components/alert/useAlert";

export default function Profile() {

    const navigate = useNavigate();
    const alert = useAlert();
    const me = useAuth().user;

    if(me === undefined) {
        navigate("/login");
        return;
    }

    const [ user, updateUser ] = useState<User | undefined>();
    const [homeWx, setHomeWx] = useState<{
        metar?: string;
        taf?: string;
    }>({});

    const [lastFlight, setLastFlight] = useState<string | undefined>(undefined);

    const { userId } = useParams();

    if(!userId) {
        navigate("/me");
        return;
    }
    
    useEffect(() => {
        const endpoint = isNaN(Number(userId)) ? ENDPOINTS.USER.USERNAME : ENDPOINTS.USER.ID;
        const replaceBy = isNaN(Number(userId)) ? [{ key: "{username}", value: userId }] : [{ key: "{id}", value: userId }];

        api.get(endpoint, {
            requireAuth: true,
            navigate: (p) => window.location.replace(p),
            replaceBy
        }).then((res) => {
            updateUser(res);

            setLastFlight(lastFlightSince(res.logbookEntries));

            if (!res.homeAirport) return;
                api.get(ENDPOINTS.WX.AD, {
                    params: { icao: res.homeAirport },
                })
                .then((wx) => {
                    setHomeWx({
                        metar: wx.rawOb,
                        taf: wx.rawTaf,
                    });
                })
                .catch((e) => console.error("Error fetching weather data:", e));

        }).catch((err) => {
            console.error(err);
        });
    }, []);

    function share() {
        navigator
        .share({
            title: `Flight Records - ${user?.firstName || `@${user?.username}`}`,
            text: `Check out ${user?.firstName || `@${user?.username}`}'s flight records on Flight Records!`,
            url: `${import.meta.env.VITE_WEBSITE_URL}/u/${user?.username || user?.id}`,
        })
        .catch(() => {
            alert("Not supported", "Sharing is not supported in this browser.");
            return;
        });
    }

    return (
        <>
            <div className="container mx-auto max-w-6xl p-4 xl:px-0">
                <ProfileHeader user={user as User} />

                {user ? (
                    user.publicProfile && me?.id === user.id ? (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
                        <div className="col-span-1 p-4 ring-2 ring-white/25 rounded-lg block lg:hidden">
                            <div className="grid grid-cols-5 gap-4">
                                <Button
                                    onClick={() => {}}
                                    text={
                                        <UserPlus
                                            strokeWidth={1.25}
                                            className="h-6 w-6 inline-block"
                                        />
                                    }
                                />
                                <Button
                                    onClick={share}
                                    text={
                                        <Share
                                            strokeWidth={1.25}
                                            className="h-6 w-6 inline-block"
                                        />
                                    }
                                />
                            </div>
                        </div>

                        <div className="col-span-1 lg:col-span-3 ring-2 ring-white/25 rounded-lg overflow-hidden">
                            <RouteMap
                                type="OVERVIEW"
                                user={user}
                                dimensions={{ height: "450px" }}
                            />
                        </div>

                        <div className="col-span-1 p-4 ring-2 ring-white/25 rounded-lg hidden lg:block">
                            <div className="flex flex-col space-y-4">
                                <Button
                                    text={
                                        <>
                                            <UsersRound
                                                className="h-4 w-4 inline-block"
                                                strokeWidth={2}
                                            />
                                            <span className="ml-2">Follow</span>
                                        </>
                                    }
                                    onClick={() => {}}
                                />

                                <hr className="bg-transparent border-b-2 border-white/25 rounded-lg" />

                                

                                <Button
                                    text={
                                        <>
                                            <Share
                                                className="h-4 w-4 inline-block"
                                                strokeWidth={2}
                                            />
                                            <span className="ml-2">Share</span>
                                        </>
                                    }
                                    onClick={share}
                                    type="button"
                                />
                            </div>
                        </div>

                        <div className="col-span-1 lg:col-span-3 p-4 ring-2 ring-white/25 rounded-lg ">
                            <div className="flex justify-between mb-1 items-baseline">
                                <h1 className="font-semibold text-white/75">
                                    <Book
                                        strokeWidth={2}
                                        className="h-5 w-5 inline-block mr-2 top-1/2 transform -translate-y-1/10 opacity-75"
                                    />
                                    Most Recent Flights
                                </h1>
                                <span className="font-semibold text-white/75  text-xs md:text-base">
                                    {lastFlight ? `Last flight ${lastFlight}` : " "}
                                </span>
                            </div>
                            {user?.logbookEntries && user?.logbookEntries.length > 0 ? (
                                user?.logbookEntries
                                .sort(
                                    (a, b) =>
                                        new Date(b.date as any).getTime() -
                                        new Date(a.date as any).getTime(),
                                )
                                .slice(0, 5)
                                .map((entry, index) => (
                                    <div
                                        key={index}
                                        className={`
                                        grid grid-cols-5 md:grid-cols-6 py-4 px-2 md:px-4 items-center
                                        transition-all duration-150
                                        ${index % 2 === 0 ? "bg-primary hover:bg-primary/75" : "bg-gradient-to-br to-neutral-900 from-neutral-800 hover:from-neutral-800/75"} 
                                        rounded-lg ${entry.id && me?.id === user.id ? "cursor-pointer" : ""}
                                        `}
                                        onClick={() => {
                                            if(me?.id === user.id) navigate(`/me/logbook/${entry.id}`);
                                        }}
                                    >
                                        <span className="text-xs md:text-sm text-white/50 ml-1 hidden">
                                            {parseDate(entry.date, false)}
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 ml-1 md:block">
                                            {parseDate(entry.date, true)}
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50">
                                            {entry.aircraftRegistration
                                                ? entry.aircraftRegistration.split(" ")[0]
                                                : "-"}
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 text-center">
                                            {entry.depAd || "-"}
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 text-center">
                                            {entry.arrAd || "-"}
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 text-center">
                                            {parseDuration(
                                                typeof entry.total === "number" && entry.total > 0
                                                    ? entry.total
                                                    : entry.simTime,
                                            ) || "-"}
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 text-center hidden md:block">
                                            {
                                                (entry.landDay || 0) + (entry.landNight || 0) === 0 && entry.simTime && (Number(entry.simTime) || 0) > 0
                                                ? "Simulator" :
                                                `${(entry.landDay || 0) + (entry.landNight || 0)} Landing${
                                                    (entry.landDay || 0) + (entry.landNight || 0) > 1
                                                    ? "s"
                                                    : ""
                                                }`
                                            }
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-white/50">
                                    <h1 className="font-semibold text-white/75">
                                        No logbook entries found.
                                    </h1>
                                    <p className="text-sm">
                                        The user has not logged any flights yet.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="col-span-1 p-4 ring-2 ring-white/25 rounded-lg block">
                            <div className="flex justify-between mb-2">
                                <h1 className="font-semibold text-white/75">
                                    <Cloudy
                                        strokeWidth={2}
                                        className="h-5 w-5 inline-block mr-2 top-1/2 transform -translate-y-1/10 opacity-75"
                                    />
                                    Local Weather
                                </h1>
                                <span title="Home Airport">{user?.homeAirport}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm">
                                    <span className="text-white/50">METAR</span>
                                    <p className="text-sm text-white/75">
                                        {homeWx.metar
                                            ? homeWx.metar
                                                  ?.replace(/METAR/g, "")
                                                  .replace(/[A-Z]{4}/, "")
                                            : "No METAR available"}
                                    </p>
                                </div>

                                <div className="text-sm">
                                    <span className="text-white/50">TAF</span>
                                    <p className="text-sm text-white/75">
                                        {homeWx.taf
                                            ? homeWx.taf?.replace(/TAF [A-Z]{4}/, "")
                                            : "No TAF available"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    ) : (
                        <div className="p-4 ring-2 ring-white/25 rounded-lg mt-4 mb-12">
                            <div className="text-center text-white/50 my-24">
                                <h1 className="font-semibold text-white/75 text-2xl">
                                    This profile is private.
                                </h1> 
                                <p className="text-sm mt-2">
                                    The user has set their profile to private. You cannot view their information.
                                </p>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="container mx-auto max-w-6xl p-4 h-screen">
                        <div className="flex justify-center items-center h-64">
                            <Loader className="animate-spin w-12 h-12 text-white/25" />
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </>
    );
}   
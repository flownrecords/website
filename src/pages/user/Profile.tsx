import { useEffect, useState } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import ProfileHeader from "../../components/user/ProfileHeader";
import api, { ENDPOINTS } from "../../lib/api";
import { useNavigate, useParams } from "react-router-dom";
import { Book, Cloudy, Loader, Share, UsersRound } from "lucide-react";
import Button from "../../components/general/Button";
import RouteMap from "../../components/maping/RouteMap";
import type { User } from "../../lib/types";
import { lastFlightSince, parseDate, parseDuration } from "../../lib/utils";

export default function Profile() {

    const navigate = useNavigate();

    if(useAuth().user === undefined) {
        return navigate("/login");
    }

    const [ user, updateUser ] = useState<User | undefined>();
    const [homeWx, setHomeWx] = useState<{
        metar?: string;
        taf?: string;
    }>({});

    const [lastFlight, setLastFlight] = useState<string | undefined>(undefined);

    const { userId } = useParams();

    if(!userId) {
        return <div>No user ID provided</div>;
    }
    
    useEffect(() => {
        api.get(ENDPOINTS.USER.ID, {
            requireAuth: true,
            navigate: (p) => window.location.replace(p),
            replaceBy: [{ key: "{id}", value: userId }]
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



    return (
        <>
            <div className="container mx-auto max-w-6xl p-4 xl:px-0">
                <ProfileHeader user={user as User} />

                {user ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
                        <div className="col-span-1 p-4 ring-2 ring-white/25 rounded-lg block lg:hidden">
                            <div className="grid grid-cols-5 gap-4">
                                {/*<Button
                                    to="/me/edit"
                                    text={
                                        <UserPen
                                            strokeWidth={1.25}
                                            className="h-6 w-6 inline-block"
                                        />
                                    }
                                />

                                <Button
                                    to="/me/logbook"
                                    text={
                                        <Book strokeWidth={1.25} className="h-6 w-6 inline-block" />
                                    }
                                />

                                <Button
                                    to="/me/crew"
                                    text={
                                        <Users
                                            strokeWidth={1.25}
                                            className="h-6 w-6 inline-block"
                                        />
                                    }
                                />

                                <Button
                                    disabled={true}
                                    text={
                                        <FileChartLine
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
                                />*/}
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
                                    onClick={() => {}}
                                    type="button"
                                />
                            </div>
                        </div>

                        <div className="col-span-1 lg:col-span-3 p-4 ring-2 ring-white/25 rounded-lg ">
                            <div className="flex justify-between mb-1">
                                <h1 className="font-semibold text-white/75">
                                    <Book
                                        strokeWidth={2}
                                        className="h-5 w-5 inline-block mr-2 top-1/2 transform -translate-y-1/10 opacity-75"
                                    />
                                    Most Recent Flights
                                </h1>
                                <span className="font-semibold text-white/75">
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
                                        flex justify-between py-4 px-2 md:px-4 items-center
                                        transition-all duration-150
                                        ${index % 2 === 0 ? "bg-primary hover:bg-primary/75" : "bg-gradient-to-br to-neutral-900 from-neutral-800 hover:from-neutral-800/75"} 
                                        rounded-lg cursor-pointer
                                        `}
                                        onClick={() => {
                                            
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
                                        <span className="text-xs md:text-sm text-white/50 text-center md:text-left">
                                            {entry.depAd || "-"}
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 text-center md:text-left">
                                            {entry.arrAd || "-"}
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 text-right md:text-left">
                                            {parseDuration(
                                                typeof entry.total === "number" && entry.total > 0
                                                    ? entry.total
                                                    : entry.simTime,
                                            ) || "-"}
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 text-center md:text-left">
                                            { (entry.landDay || 0) + (entry.landNight || 0)} Landings
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
                    <div className="container mx-auto max-w-6xl p-4 h-screen">
                        <div className="flex justify-center items-center h-64">
                            <Loader className="animate-spin w-12 h-12 text-white/25" />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}   
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/general/Button";

import type { User } from "../../lib/types";
import ChartCarousel from "../../components/user/ChartCarousel";
import Footer from "../../components/general/Footer";
import { Book, Cloudy, FileText, Forward, Loader, Pencil, PencilLine, Share } from "lucide-react";
import useAlert from "../../components/alert/useAlert";
import RouteMap from "../../components/maping/RouteMap";
import ProfileHeader from "../../components/user/ProfileHeader";

import api, { ENDPOINTS } from "../../lib/api";

export default function Me() {
    const alert = useAlert();
    const navigate = useNavigate();
    const [user, setUser] = useState<User>(null);

    const [homeWx, setHomeWx] = useState<{
        metar?: string;
        taf?: string;
    }>({});

    useEffect(() => {
        api.get(ENDPOINTS.USER.ME, {
            requireAuth: true,
            navigate,
        })
            .then((res) => {
                setUser(res);

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
            })
            .catch((e) => console.error("Error fetching user data:", e));
    }, []);

    function share() {
        navigator
            .share({
                title: `Flight Records - ${user?.firstName || `@${user?.username}`}`,
                text: `Check out my flight records on Flight Records!`,
                url: `${import.meta.env.VITE_WEBSITE_URL}/u/${user?.username}`,
            })
            .catch(() => {
                return alert("Not supported", "Sharing is not supported in this browser.");
            });
    }

    return (
        <>
            <div className="container mx-auto max-w-6xl p-4 xl:px-0">
                <ProfileHeader user={user} />

                {user ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
                        <div className="col-span-1 p-4 ring-2 ring-white/25 rounded-lg block lg:hidden">
                            <div className="grid grid-cols-4 gap-4">
                                <Button
                                    to="/me/edit"
                                    text={
                                        <PencilLine
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
                                    disabled={true}
                                    text={
                                        <FileText
                                            strokeWidth={1.25}
                                            className="h-6 w-6 inline-block"
                                        />
                                    }
                                />
                                <Button
                                    onClick={share}
                                    text={
                                        <Forward
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
                                dimensions={{ height: "400px" }}
                            />
                        </div>

                        <div className="col-span-1 p-4 ring-2 ring-white/25 rounded-lg hidden lg:block">
                            <div className="flex flex-col space-y-4">
                                <Button
                                    text={
                                        <>
                                            <Pencil
                                                className="h-4 w-4 inline-block"
                                                strokeWidth={2}
                                            />
                                            <span className="ml-2">Edit Profile</span>
                                        </>
                                    }
                                    to="/me/edit"
                                />

                                <hr className="bg-transparent border-b-2 border-white/25 rounded-lg" />

                                <Button
                                    text={
                                        <>
                                            <Book
                                                className="h-4 w-4 inline-block"
                                                strokeWidth={2}
                                            />
                                            <span className="ml-2">Logbook</span>
                                        </>
                                    }
                                    to="/me/logbook"
                                />

                                <Button
                                    text={
                                        <>
                                            <FileText
                                                className="h-4 w-4 inline-block"
                                                strokeWidth={2}
                                            />
                                            <span className="ml-2">Generate Report</span>
                                        </>
                                    }
                                    disabled={true}
                                    to="/me/report"
                                />

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
                            {user?.logbookEntries && user?.logbookEntries.length > 0 ? (
                                <ChartCarousel logbook={user?.logbookEntries} />
                            ) : (
                                <div className="text-center text-white/50">
                                    <h1 className="font-semibold text-white/75">
                                        No logbook entries found.
                                    </h1>
                                    <p className="text-sm">
                                        Start logging your flights to see your charts here.
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
                                            ? homeWx.metar?.replace(/[A-Z]{4}/, "")
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

            <Footer />
        </>
    );
}

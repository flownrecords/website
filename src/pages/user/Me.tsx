import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/general/Button";

import type { User } from "../../lib/types";
import ChartCarousel from "../../components/user/ChartCarousel";
import Footer from "../../components/general/Footer";
import { Book, Cloudy, FileText, Forward, Loader, Pencil, PencilLine, Share } from "lucide-react";
import useAlert from "../../components/alert/useAlert";
import RouteMap from "../../components/maping/RouteMap";
import ProfileHeader from "../../components/user/ProfileHeader";

export default function Me() {
    const API = import.meta.env.VITE_API_URL;

    const alert = useAlert();
    const navigate = useNavigate();
    const [user, setUser] = useState<User>(null);

    const [localWeather, setLocalWeather] = useState<{
        metar?: string;
        taf?: string;
    }>({});

    useEffect(() => {
        if (!localStorage.getItem("accessToken")) {
            navigate("/login");
        }

        axios
            .get(API + "/users/me", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            })
            .then((response) => {
                if (response.status === 200) {
                    fetchLocalWeather(response.data?.homeAirport);
                    return setUser(response.data as User);
                }
            })
            .catch((error) => {
                console.error("Error fetching user data:", error);
                if (error.response?.status === 401) {
                    console.log("Unauthorized access, redirecting to login.");
                    localStorage.removeItem("accessToken");
                    navigate("/login");
                }
            });
    }, []);

    const fetchLocalWeather = async (homeAirport?: string) => {
        if (!homeAirport) return;

        const response = await axios.get(`${API}/wx/ad?icao=${homeAirport}`);
        setLocalWeather({
            metar: response.data.rawOb,
            taf: response.data.rawTaf,
        });
        return response;
    };

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
                                <Link
                                    to="/me/edit"
                                    className="cursor-pointer bg-gradient-to-t from-neutral-900 to-neutral-800 ring-2 ring-white/25 
            hover:opacity-75 transition duration-150 text-white p-2 rounded-lg text-center flex justify-center items-center"
                                >
                                    <PencilLine strokeWidth={1.25} className="h-6 w-6" />
                                </Link>

                                <Link
                                    to="/me/logbook"
                                    className="cursor-pointer bg-gradient-to-t from-neutral-900 to-neutral-800 ring-2 ring-white/25 
            hover:opacity-75 transition duration-150 text-white p-2 rounded-lg text-center flex justify-center items-center"
                                >
                                    <Book strokeWidth={1.25} className="h-6 w-6" />
                                </Link>

                                <button
                                    onClick={() => {
                                        alert(
                                            "Coming soon",
                                            "This feature is not yet implemented.",
                                        );
                                    }}
                                    className="cursor-pointer bg-gradient-to-t from-neutral-900 to-neutral-800 ring-2 ring-white/25 
            hover:opacity-75 transition duration-150 text-white p-2 rounded-lg text-center flex justify-center items-center"
                                >
                                    <FileText strokeWidth={1.25} className="h-6 w-6" />
                                </button>

                                <button
                                    onClick={share}
                                    className="cursor-pointer bg-gradient-to-t from-neutral-900 to-neutral-800 ring-2 ring-white/25 
            hover:opacity-75 transition duration-150 text-white p-2 rounded-lg text-center flex justify-center items-center"
                                >
                                    <Forward strokeWidth={1.25} className="h-6 w-6" />
                                </button>
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
                                            <Pencil className="h-4 w-4 inline-block" />{" "}
                                            <span className="ml-1">Edit Profile</span>
                                        </>
                                    }
                                    to="/me/edit"
                                />

                                <hr className="bg-transparent border-b-2 border-white/25 rounded-lg" />

                                <Button
                                    text={
                                        <>
                                            <Book className="h-4 w-4 inline-block" />{" "}
                                            <span className="ml-1">Logbook</span>
                                        </>
                                    }
                                    to="/me/logbook"
                                />

                                <Button
                                    text={
                                        <>
                                            <FileText className="h-4 w-4 inline-block" />{" "}
                                            <span className="ml-1">Generate Report</span>
                                        </>
                                    }
                                    disabled={true}
                                    to="/me/report"
                                />

                                <Button
                                    text={
                                        <>
                                            <Share className="h-4 w-4 inline-block" />{" "}
                                            <span className="ml-1">Share</span>
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

                        <div className="col-span-1 p-4 ring-2 ring-white/25 rounded-lg hidden lg:block">
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
                                        {localWeather.metar
                                            ? localWeather.metar?.replace(/[A-Z]{4}/, "")
                                            : "No METAR available"}
                                    </p>
                                </div>

                                <div className="text-sm">
                                    <span className="text-white/50">TAF</span>
                                    <p className="text-sm text-white/75">
                                        {localWeather.taf
                                            ? localWeather.taf?.replace(/TAF [A-Z]{4}/, "")
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/general/Button";

import type { User } from "../../lib/types";
import ChartCarousel from "../../components/user/ChartCarousel";
import Footer from "../../components/general/Footer";
import { Book, Cloudy, FileChartLine, FileText, Loader, Search, Share, UserPen, Users } from "lucide-react";
import useAlert from "../../components/alert/useAlert";
import RouteMap from "../../components/maping/RouteMap";
import ProfileHeader from "../../components/user/ProfileHeader";

import api, { ENDPOINTS } from "../../lib/api";
import Modal from "../../components/general/Modal";

export default function Me() {
    const alert = useAlert();
    const navigate = useNavigate();
    const [user, setUser] = useState<User>(null);
    const [wxModal, toggleWxModal] = useState(false);
    const [queryWx, setQueryWx] = useState<{
        ad: string;
        metar: string | null;
        taf: string | null;
    }>({
        ad: "",
        metar: null,
        taf: null,
    });

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

    function searchWx() {
        if (!queryWx.ad || queryWx.ad.length !== 4) {
            return alert("Invalid ICAO", "Please enter a valid 4-letter ICAO code.");
        }

        api.get(ENDPOINTS.WX.AD, {
            params: { icao: queryWx.ad.toUpperCase() },
        })
        .then((wx) => {
            setQueryWx({
                ...queryWx,
                metar: wx.rawOb,
                taf: wx.rawTaf,
            });
        })
        .catch((e) => {
            console.error("Error fetching weather data:", e);
            alert("Error", "Could not fetch weather data for the given ICAO code.");
        });
    }

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
                            <div className="grid grid-cols-5 gap-4">
                                <Button
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
                                            <UserPen
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
                                            <Users
                                                className="h-4 w-4 inline-block"
                                                strokeWidth={2}
                                            />
                                            <span className="ml-2">Crew</span>
                                        </>
                                    }
                                    to="/me/crew"
                                />

                                <Button
                                    text={
                                        <>
                                            <FileText
                                                className="h-4 w-4 inline-block"
                                                strokeWidth={2}
                                            />
                                            <span className="ml-2">Flight Plan</span>
                                        </>
                                    }
                                    to="/me/plan"
                                />

                                <Button
                                    text={
                                        <>
                                            <FileChartLine
                                                className="h-4 w-4 inline-block"
                                                strokeWidth={2}
                                            />
                                            <span className="ml-2">Reports</span>
                                        </>
                                    }
                                    to="/me/reports"
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
                                            ? homeWx.metar?.replace(/METAR/g, "").replace(/[A-Z]{4}/, "")
                                            : "No METAR available"}
                                    </p>
                                </div>

                                <div className="text-sm">
                                    <span className="text-white/50">TAF</span>
                                    <p className="text-sm text-white/75">
                                        {homeWx.taf
                                            ? homeWx.taf?.replace(/TAF/g, "").replace(/[A-Z]{4}/, "")
                                            : "No TAF available"}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-row">
                                <Button 
                                    className="w-full"
                                    text={
                                        <>
                                            <Search className="h-4 w-4 inline-block mr-2" strokeWidth={2} />
                                            <span>Check other airports</span>
                                        </>
                                    }
                                    onClick={() => toggleWxModal(true)}
                                />
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

            <Modal
                isOpen={wxModal}
                onClose={() => {
                    toggleWxModal(false);
                    setQueryWx({
                        ad: "",
                        metar: null,
                        taf: null,
                    });
                }}
                title=""
                buttons={[
                    <Button text={<><Search className="h-4 w-4 inline-block mr-2" strokeWidth={2} />Check Weather</>} onClick={searchWx} />
                ]}
            >
                <h1 className="text-xl font-semibold mb-2">
                    <Cloudy
                        strokeWidth={2}
                        className="h-5 w-5 inline-block mr-2 top-1/2 transform -translate-y-1/10 opacity-75"
                    />

                    Check Weather
                </h1>
                <div className="bg-primary rounded-lg p-4 mt-4">
                    <div>
                        <div className="flex flex-col mb-2">
                            <label className="text-sm text-white/75 mb-1">
                                Aerodrome ICAO Code
                            </label>
                            <input
                                type="text"
                                value={queryWx.ad}
                                onChange={(e) =>
                                    setQueryWx({
                                        ad: e.target.value.toUpperCase(),
                                        metar: null,
                                        taf: null,
                                    })
                                }
                                placeholder="e.g. LPPR"
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                            />
                        </div>
                        <div className="max-w-96">
                            {queryWx.metar || queryWx.taf ? (
                                <div className="space-y-2 mt-4">
                                    {queryWx.metar && (
                                        <div className="text-sm">
                                            <span className="text-white/50">METAR</span>
                                            <p className="text-sm text-white/75">
                                                {queryWx.metar
                                                    ? queryWx.metar
                                                            ?.replace(/METAR/g, "")
                                                            .replace(/[A-Z]{4}/, "")
                                                    : "No METAR available"}
                                            </p>
                                        </div>
                                    )}

                                    {queryWx.taf && (
                                        <div className="text-sm">
                                            <span className="text-white/50">TAF</span>
                                            <p className="text-sm text-white/75">
                                                {queryWx.taf
                                                    ? queryWx.taf
                                                            ?.replace(/TAF/g, "")
                                                            .replace(/[A-Z]{4}/, "")
                                                    : "No TAF available"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-white/50 mt-4">
                                    Enter an ICAO code and click "Check Weather" to fetch the
                                    latest METAR and TAF.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

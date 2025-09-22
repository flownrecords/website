import { Link, useNavigate, useParams } from "react-router-dom";
import type { LogbookEntry, User } from "../../lib/types";
import { useEffect, useState } from "react";
import api, { ENDPOINTS } from "../../lib/api";
import { captalize, parseDate, parseDuration } from "../../lib/utils";
import RouteMap from "../../components/maping/RouteMap";
import Button from "../../components/general/Button";
import { LogOut, Share, Undo2 } from "lucide-react";
import PageLoader from "../../components/general/Loader";
import Icon from "../../assets/images/icon.png";
import ProfileCard from "../../components/user/ProfileCard";
// import { useAuth } from "../../components/auth/AuthContext";
import Skeleton from "../../components/general/Skeleton";
import Footer from "../../components/general/Footer";
import MapNotAvailable from "../../components/maping/MapNotAvail";

export default function CrewEntry() {
    const navigate = useNavigate();
    // const { user } = useAuth();
    const { entryId } = useParams();
    const [entry, setEntry] = useState<LogbookEntry | null>(null);

    useEffect(() => {
        if (!entryId) {
            navigate("/me/logbook");
        } else {
            api.get(ENDPOINTS.LOGBOOK.CREW_ENTRY, {
                requireAuth: true,
                navigate,
                replaceBy: [{ key: "{id}", value: entryId }],
            })
                .then((response) => {
                    if (response.meta.status === 200) {
                        if (!response) return navigate("/me/crew");
                        setEntry(response);
                    }
                })
                .catch((error) => {
                    if (error?.status === 401) {
                        localStorage.removeItem("accessToken");
                        navigate("/login");
                    } else {
                        navigate("/me/crew");
                    }
                });
        }

        console.log(entry);
    }, [entryId, navigate]);

    function parseTime(rawDate: Date | null): string {
        if (!rawDate) return "N/A";
        const date = new Date(rawDate);
        const hours = date.getUTCHours().toString().padStart(2, "0");
        const minutes = date.getUTCMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    return (
        <>
            <div className="text-center mt-24 mb-4">
                {(() => {
                    if (
                        typeof entry?.total === "number" &&
                        typeof entry?.simTime === "number" &&
                        entry.total > 0 &&
                        entry.simTime === 0
                    ) {
                        return (
                            <div>
                                <h3 className="text-xl md:text-3xl font-bold text-white/50">
                                    {entry?.aircraftRegistration ?? ""}
                                </h3>
                                <h1 className="block text-5xl md:text-8xl font-bold">
                                    {entry?.depAd} <span className="text-white/15">to</span>{" "}
                                    {entry?.arrAd}
                                </h1>
                                <h3 className="font-semibold text-white/50">
                                    {entry.offBlock ? parseDate(entry.offBlock) : "N/A"}
                                </h3>
                            </div>
                        );
                    } else if (typeof entry?.simTime === "number" && entry.simTime > 0) {
                        return (
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white/50">
                                    {entry?.aircraftRegistration ?? ""}
                                </h3>
                                <h1 className="block text-7xl md:text-8xl font-bold">
                                    <span className="text-white/15">Simulator</span>
                                </h1>
                                <h3 className="font-semibold text-white/50">
                                    {entry?.offBlock ? parseDate(entry.offBlock) : "N/A"}
                                </h3>
                            </div>
                        );
                    } else {
                        return (
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white/50">
                                    {"Loading"}
                                </h3>
                                <h1 className="block text-7xl md:text-8xl font-bold">
                                    <span className="text-white/15">Flight</span>
                                </h1>
                            </div>
                        );
                    }
                })()}
            </div>

            <div className="container mx-auto max-w-6xl p-4 xl:px-0">
                <div className="ring-2 ring-white/25 rounded-lg overflow-hidden">
                    {entry ? (
                        <RouteMap
                            type="ENTRY"
                            user={
                                {
                                    ...entry?.user,
                                    logbookEntries: [entry as LogbookEntry],
                                } as User
                            }
                            entryId={entry?.id}
                            recording={entry?.recording}
                        />
                    ) : (
                        <MapNotAvailable />
                    )}
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

                        <Button
                            disabled={true}
                            styleType="small"
                            type="button"
                            onClick={() => {}}
                            text={
                                <>
                                    <LogOut className="h-4 w-4 inline-block" strokeWidth={2} />{" "}
                                    <span>Leave Crew Entry</span>
                                </>
                            }
                        />

                        <Button
                            disabled={!navigator.share || !entry}
                            styleType="small"
                            type="button"
                            onClick={() => {}}
                            text={
                                <>
                                    <Share
                                        className="h-4 w-4 inline-block text-white/75"
                                        strokeWidth={2}
                                    />{" "}
                                    <span>Share</span>
                                </>
                            }
                        />
                    </div>
                </div>

                {entry ? (
                    <>
                        <div className="mt-4 ring-2 ring-white/25 rounded-lg p-4">
                            <div className="relative group inline-block">
                                <Link
                                    to="/me"
                                    className="flex items-center hover:opacity-75 transition-all duration-150"
                                >
                                    <div className="rounded-full ring-2 ring-white/25">
                                        {entry?.user ? (
                                            <img
                                                className="h-8 w-8 rounded-full object-cover"
                                                draggable="false"
                                                src={entry.user.profilePictureUrl ?? Icon}
                                                alt="User profile icon"
                                            />
                                        ) : (
                                            <img
                                                className="h-8 w-8 rounded-full object-cover animate-[pulse_2s_cubic-bezier(0.01,0.02,0.01,0.02)_infinite]"
                                                draggable="false"
                                                src={Icon}
                                                alt="User profile icon"
                                            />
                                        )}
                                    </div>
                                    <h1 className="font-semibold ml-2">
                                        {entry?.user ? (
                                            (captalize(entry.user?.firstName) ??
                                            `@${entry.user?.username}`)
                                        ) : (
                                            <Skeleton type="span" />
                                        )}
                                    </h1>
                                </Link>

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
                                z-9999 shadow-xs"
                                >
                                    <ProfileCard
                                        data={{
                                            profilePictureUrl: entry.user?.profilePictureUrl ?? "",
                                            firstName: entry.user?.firstName ?? null,
                                            lastName: entry.user?.lastName ?? "",
                                            username: entry.user?.username ?? null,
                                            location: entry.user?.location ?? null,
                                            publicProfile: entry.user?.publicProfile ?? false,
                                            bio: entry.user?.bio ?? null,
                                            organizationId: entry.user?.organizationId ?? "",
                                            organizationRole: entry.user?.organizationRole ?? "",
                                            organization: entry.user?.organization,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4 ring-2 ring-white/25 rounded-lg p-4">
                            <h1 className="text-lg text-white/50 font-semibold mb-2">Details</h1>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <h1 className="mb-1">Registration</h1>
                                    <div className="rounded-lg bg-secondary p-2">
                                        {entry ? entry.aircraftRegistration : "N/A"}
                                    </div>
                                </div>

                                <div>
                                    <h1 className="mb-1">Departure</h1>
                                    <div className="rounded-lg bg-secondary p-2">
                                        {entry?.depAd && entry.depAd.length > 0
                                            ? entry.depAd
                                            : "N/A"}
                                    </div>
                                </div>

                                <div>
                                    <h1 className="mb-1">Arrival</h1>
                                    <div className="rounded-lg bg-secondary p-2">
                                        {entry?.arrAd && entry.arrAd.length > 0
                                            ? entry.arrAd
                                            : "N/A"}
                                    </div>
                                </div>

                                <div>
                                    <h1 className="mb-1">Uploaded on</h1>
                                    <div className="rounded-lg bg-secondary p-2">
                                        {entry
                                            ? `${parseDate(entry.createdAt)} ${parseTime(entry.createdAt)}`
                                            : "N/A"}
                                    </div>
                                </div>

                                <div>
                                    <h1 className="mb-1">Date</h1>
                                    <div className="rounded-lg bg-secondary p-2">
                                        {entry ? parseDate(entry.offBlock) : "N/A"}
                                    </div>
                                </div>

                                <div>
                                    <h1 className="mb-1">Off Block</h1>
                                    <div className="rounded-lg bg-secondary p-2">
                                        {entry ? parseTime(entry.offBlock) : "N/A"}
                                    </div>
                                </div>

                                <div>
                                    <h1 className="mb-1">On Block</h1>
                                    <div className="rounded-lg bg-secondary p-2">
                                        {entry ? parseTime(entry.onBlock) : "N/A"}
                                    </div>
                                </div>

                                <div>
                                    <h1 className="mb-1">
                                        {entry && typeof entry.total === "number" && entry.total > 0
                                            ? ""
                                            : "Synthetic"}{" "}
                                        Flight Time
                                    </h1>
                                    <div className="rounded-lg bg-secondary p-2">
                                        {entry
                                            ? parseDuration(
                                                  typeof entry.total === "number" && entry.total > 0
                                                      ? entry.total
                                                      : entry.simTime,
                                              )
                                            : "00h00"}
                                    </div>
                                </div>

                                <div>
                                    <h1 className="mb-1">Crew</h1>
                                    <div className="rounded-lg bg-secondary p-2 relative">
                                        {entry?.crew && entry.crew.length > 0 ? (
                                            entry.crew.map((m: User, i) => {
                                                const fullName = m?.firstName
                                                    ? `${m.firstName} ${m.lastName ?? ""}`
                                                    : `@${m?.username}`;

                                                return (
                                                    <div
                                                        className={`inline-block hover:mr-2 ${
                                                            i !== 0 ? "-ml-1 hover:ml-1" : ""
                                                        } transition-all duration-500`}
                                                        key={i}
                                                    >
                                                        <div className="relative group inline-block">
                                                            <Link
                                                                to={"/users/" + m?.id}
                                                                className="inline-block"
                                                                title={fullName} // still useful for screen readers
                                                            >
                                                                <img
                                                                    src={
                                                                        m?.profilePictureUrl ??
                                                                        `https://placehold.co/512/09090B/313ED8?font=roboto&text=${
                                                                            m?.firstName?.charAt(
                                                                                0,
                                                                            ) || ""
                                                                        }${m?.lastName?.charAt(0) || ""}`
                                                                    }
                                                                    className="h-6 w-6 rounded-full inline-block ring-2 ring-neutral-600 object-cover"
                                                                />
                                                            </Link>

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
                                                                            m?.profilePictureUrl ??
                                                                            "",
                                                                        firstName:
                                                                            m?.firstName ?? null,
                                                                        lastName: m?.lastName ?? "",
                                                                        username:
                                                                            m?.username ?? null,
                                                                        location:
                                                                            m?.location ?? null,
                                                                        publicProfile:
                                                                            m?.publicProfile ??
                                                                            false,
                                                                        bio: m?.bio ?? null,
                                                                        organizationId:
                                                                            m?.organizationId ?? "",
                                                                        organizationRole:
                                                                            m?.organizationRole ??
                                                                            "",
                                                                        organization:
                                                                            m?.organization,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <span className="text-white/75 text-sm flex items-center h-4 my-1">
                                                No crew assigned
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h1 className="mb-1">Landings</h1>
                                    <div className="rounded-lg bg-secondary p-2">
                                        {entry
                                            ? (entry.landDay ?? 0) + (entry.landNight ?? 0)
                                            : "1"}
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <h1 className="mb-1">Remarks</h1>
                                    <div className="rounded-lg bg-secondary p-2">
                                        {entry?.remarks ? entry.remarks : "N/A"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 ring-2 ring-white/25 rounded-lg p-4">
                            <h1 className="text-lg text-white/50 font-semibold mb-2">
                                Flight Plan
                            </h1>
                            {entry?.plan ? (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="">
                                        <h1 className="mb-1">Departure</h1>
                                        <div className="rounded-lg bg-secondary p-2">
                                            {entry && entry.plan ? entry.plan.depAd : "N/A"}
                                        </div>
                                    </div>

                                    <div className="">
                                        <h1 className="mb-1">ETD</h1>
                                        <div className="rounded-lg bg-secondary p-2">
                                            {entry && entry.plan
                                                ? parseTime(entry.plan.etd)
                                                : "N/A"}
                                        </div>
                                    </div>

                                    <div className="">
                                        <h1 className="mb-1">ETE</h1>{" "}
                                        <div className="rounded-lg bg-secondary p-2">
                                            {entry && entry.plan && entry.plan.eta && entry.plan.etd
                                                ? parseDuration(
                                                      (new Date(entry.plan.eta).getTime() -
                                                          new Date(entry.plan.etd).getTime()) /
                                                          1000 /
                                                          60 /
                                                          60,
                                                  )
                                                : "N/A"}
                                        </div>
                                    </div>

                                    <div className="">
                                        <h1 className="mb-1">Estimated Fuel</h1>
                                        <div className="rounded-lg bg-secondary p-2">
                                            {entry && entry.plan && entry.plan.fuelPlan ? (
                                                <>
                                                    <span>{Number(entry.plan.fuelPlan)}</span>{" "}
                                                    <span
                                                        className="font-semibold text-white/50"
                                                        title="Liters"
                                                    >
                                                        L
                                                    </span>
                                                </>
                                            ) : (
                                                "N/A"
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-span-4">
                                        <h1 className="mb-1">Route</h1>
                                        <div className="rounded-lg bg-secondary p-2">
                                            {entry && entry.plan?.route ? entry.plan.route : "N/A"}
                                        </div>
                                    </div>

                                    <div className="">
                                        <h1 className="mb-1">Arrival</h1>
                                        <div className="rounded-lg bg-secondary p-2">
                                            {entry && entry.plan ? entry.plan.arrAd : "N/A"}
                                        </div>
                                    </div>

                                    <div className="">
                                        <h1 className="mb-1">ETA</h1>
                                        <div className="rounded-lg bg-secondary p-2">
                                            {entry && entry.plan
                                                ? parseTime(entry.plan.eta as any)
                                                : "N/A"}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <h1 className="mb-1">Remarks</h1>
                                        <div className="rounded-lg bg-secondary p-2">
                                            {entry && entry.plan.remarks
                                                ? entry.plan.remarks
                                                : "N/A"}
                                        </div>
                                    </div>

                                    <div className="col-span-4">
                                        <h1 className="mb-1">Weather</h1>
                                        <div className="rounded-lg bg-secondary p-2">
                                            {entry && entry.plan.weather
                                                ? entry.plan.weather
                                                : "N/A"}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-white/75 text-sm my-1">
                                    No flight plan available for this entry.
                                </span>
                            )}
                        </div>
                        {/*
                    <div className="mt-4 ring-2 ring-white/25 rounded-lg p-4">
                        <h1 className="text-lg text-white/50 font-semibold mb-2">
                            Flight Recording
                        </h1>
                        {entry?.recording ? (
                            <>
                                <div className="grid lg:grid-cols-3 gap-4">
                                    <div className="space-y-1 p-4 bg-secondary rounded-lg">
                                        <div className="flex justify-between">
                                            <span className="text-white/75">
                                                Highest Flight Level
                                            </span>
                                            <span className="font-semibold">
                                                {calculateStats()?.highestLevel}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/75">
                                                Average Flight Level
                                            </span>
                                            <span className="font-semibold">
                                                {calculateStats()?.averageLevel}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/75">
                                                Highest Vertical Speed
                                            </span>
                                            <span className="font-semibold text-right">
                                                {calculateStats()?.highestVerticalSpeed}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 p-4 bg-secondary rounded-lg">
                                        <div className="flex justify-between">
                                            <span className="text-white/75">Top Speed</span>
                                            <span className="font-semibold">
                                                {calculateStats()?.topSpeed}{" "}
                                                <span className="opacity-50">kt</span>
                                                <span className="text-xs opacity-25">
                                                    {" "}
                                                    (
                                                    {(
                                                        (calculateStats()?.topSpeed ?? 0) *
                                                        1.852
                                                    ).toFixed(0)}{" "}
                                                    km/h)
                                                </span>
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/75">Average Speed</span>
                                            <span className="font-semibold">
                                                {calculateStats()?.averageSpeed}{" "}
                                                <span className="opacity-50">kt</span>
                                                <span className="text-xs opacity-25">
                                                    {" "}
                                                    (
                                                    {(
                                                        (calculateStats()?.averageSpeed ?? 0) *
                                                        1.852
                                                    ).toFixed(0)}{" "}
                                                    km/h)
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 p-4 bg-secondary rounded-lg">
                                        <div className="flex justify-between">
                                            <span className="text-white/75">Squawk</span>
                                            <span className="font-semibold text-right">
                                                {calculateStats()?.squawks
                                                    ? calculateStats()?.squawks.map((s, i) => {
                                                            return (
                                                                <span
                                                                    className={
                                                                        i !== 0
                                                                            ? "opacity-25"
                                                                            : ""
                                                                    }
                                                                    title={
                                                                        i !== 0
                                                                            ? "Previous squawk"
                                                                            : undefined
                                                                    }
                                                                    key={s + i}
                                                                >
                                                                    {s}
                                                                    <br />
                                                                </span>
                                                            );
                                                        })
                                                    : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h2 className="text-white text-center">Flight Overview</h2>
                                    <FlightDataChart recording={entry.recording} />
                                </div>
                            </>
                        ) : (
                            <span className="text-white/75 text-sm my-1">
                                No flight recording available for this entry.
                            </span>
                        )}
                    </div>*/}
                    </>
                ) : (
                    <PageLoader />
                )}
            </div>

            <Footer />
        </>
    );
}

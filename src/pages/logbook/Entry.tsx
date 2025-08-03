import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import axios from "axios";

import type { LogbookEntry, User } from "../../lib/types";
import Button from "../../components/general/Button";
import Footer from "../../components/general/Footer";
import useAlert from "../../components/alert/useAlert";
import RouteMap from "../../components/maping/RouteMap";
import ProfileCard from "../../components/user/ProfileCard";
import { FilePlus2, Pencil, Plus, Save, Undo2 } from "lucide-react";

export default function LogbookEntry() {
    const API = import.meta.env.VITE_API_URL;
    const { entryId } = useParams();

    const [user, setUser] = useState<User>(null);
    const [entry, setEntry] = useState<LogbookEntry | null>(null);
    // @ts-ignore
    const [recording, setRecording] = useState<any>(null); // FlightRecording type can be defined later if needed

    const alert = useAlert();
    const navigate = useNavigate();

    const [crewModal, setCrewModal] = useState<boolean>(false);

    const addCrewMemberRef = useRef<HTMLInputElement>(null);

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
                    setUser(response.data);
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

        axios
            .get(API + "/users/logbook", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            })
            .then((response) => {
                if (response.status === 200) {
                    let entry = response.data?.find(
                        (entry: LogbookEntry) => entry.id === Number(entryId),
                    );
                    if (!entry) return navigate("/me/logbook");
                    setEntry(entry);
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

    function parseDate(date?: string | Date | null, cut = false) {
        return new Date(date as any)
            .toLocaleDateString("en-GB", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
            })
            .slice(0, cut ? 5 : undefined);
    }

    function parseDuration(time?: string | number | null) {
        if (!time) return "0:00";
        const total = typeof time === "string" ? parseFloat(time) : time;
        if (isNaN(total)) return "0:00";
        if (total < 0) return "0:00";
        if (total === 0) return "0:00";
        if (total < 1) {
            const minutes = Math.round(total * 60);
            return `0:${minutes < 10 ? "0" + minutes : minutes}`;
        }

        const hours = total.toFixed(0);
        const minutes = Math.round((total % 1) * 60);
        return `${hours}:${minutes < 10 ? "0" + minutes : minutes}`;
    }

    function parseTime(rawDate: Date | null): string {
        if (!rawDate) return "N/A";
        const date = new Date(rawDate);
        const hours = date.getUTCHours().toString().padStart(2, "0");
        const minutes = date.getUTCMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    function addCrewMember() {
        let username = addCrewMemberRef.current?.value.trim();
        if (username?.startsWith("@")) {
            username = username.slice(1);
        }

        axios
            .get(API + `/users/${username}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            })
            .then((response) => {
                if (response.status === 200) {
                    const newMember = response.data;
                    if (!newMember || !newMember.id) {
                        return alert("Error", "User not found.");
                    }

                    if (entry?.crew && entry.crew.some((member) => member?.id === newMember.id)) {
                        return alert("Error", "This user is already assigned to the crew.");
                    }

                    axios
                        .post(
                            API + `/users/logbook/crewAdd`,
                            {
                                entryId: entry?.id,
                                crewUsername: newMember.username,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                                },
                            },
                        )
                        .then((response) => {
                            if (response.status === 200) {
                                window.location.reload();
                            }
                        });
                }
            })
            .catch((error) => {
                console.error("Error fetching user data:", error);
                if (error.response?.status === 404) {
                    return alert("Error", "User not found.");
                }
                if (error.response?.status === 401) {
                    console.log("Unauthorized access, redirecting to login.");
                    localStorage.removeItem("accessToken");
                    navigate("/login");
                } else {
                    alert(
                        "Error",
                        "An error occurred while trying to add the crew member. Please try again later.",
                    );
                }
            });
    }

    function removeCrewMember(memberUsername: string) {
        if (!entry || !entry.crew || !memberUsername) return;

        axios
            .post(
                API + `/users/logbook/crewRemove`,
                {
                    entryId: entry.id,
                    crewUsername: memberUsername,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                },
            )
            .then((response) => {
                if (response.status === 200) {
                    window.location.reload();
                }
            })
            .catch((error) => {
                console.error("Error removing crew member:", error);
                alert(
                    "Error",
                    "An error occurred while trying to remove the crew member. Please try again later.",
                );
            });
    }

    return (
        <>
            <div className="text-center mt-24 mb-4">
                {typeof entry?.total === "number" &&
                entry.total > 0 &&
                entry?.depAd &&
                entry?.arrAd ? (
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white/50">
                            {entry?.aircraftRegistration ?? ""}
                        </h3>
                        <h1 className="block text-7xl md:text-8xl font-bold">
                            {entry?.depAd} <span className="text-white/15">to</span> {entry?.arrAd}
                        </h1>
                        <h3 className="font-semibold text-white/50">
                            {entry ? parseDate(entry.offBlock) : "N/A"}
                        </h3>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white/50">
                            {entry?.aircraftRegistration ?? ""}
                        </h3>
                        <h1 className="block text-7xl md:text-8xl font-bold">
                            <span className="text-white/15">Simulator</span>
                        </h1>
                        <h3 className="font-semibold text-white/50">
                            {entry ? parseDate(entry.offBlock) : "N/A"}
                        </h3>
                    </div>
                )}
            </div>

            <div className="container mx-auto max-w-6xl p-4 xl:px-0">
                <div className="ring-2 ring-white/25 rounded-lg overflow-hidden">
                    {entry && <RouteMap type="ENTRY" user={user} entryId={entry.id} />}
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
                            onClick={() => navigate(`/logbook/edit/${entry?.id}`)}
                            text={
                                <>
                                    <Pencil className="h-4 w-4 inline-block" strokeWidth={2} />{" "}
                                    <span>Edit Entry</span>
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
                                    <FilePlus2 className="h-4 w-4 inline-block" strokeWidth={2} />{" "}
                                    <span>Add Flight Plan</span>
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
                                    <Save
                                        className="h-4 w-4 inline-block text-white/75"
                                        strokeWidth={2}
                                    />{" "}
                                    <span>Add Flight Record</span>
                                </>
                            }
                        />
                    </div>
                </div>

                <div className="mt-4 ring-2 ring-white/25 rounded-lg p-4">
                    <h1 className="text-lg text-white/50 font-semibold mb-2">
                        Logbook Entry Details
                    </h1>
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
                                {entry?.depAd && entry.depAd.length > 0 ? entry.depAd : "N/A"}
                            </div>
                        </div>

                        <div>
                            <h1 className="mb-1">Arrival</h1>
                            <div className="rounded-lg bg-secondary p-2">
                                {entry?.arrAd && entry.arrAd.length > 0 ? entry.arrAd : "N/A"}
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
                                                                    m?.firstName?.charAt(0) || ""
                                                                }${m?.lastName?.charAt(0) || ""}`
                                                            }
                                                            className="h-6 w-6 rounded-full inline-block ring-2 ring-neutral-600"
                                                        />
                                                    </Link>

                                                    {/* Custom tooltip */}
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
                                                                    m?.profilePictureUrl ?? "",
                                                                firstName: m?.firstName ?? null,
                                                                lastName: m?.lastName ?? "",
                                                                username: m?.username ?? null,
                                                                location: m?.location ?? null,
                                                                publicProfile:
                                                                    m?.publicProfile ?? false,
                                                                bio: m?.bio ?? null,
                                                                organizationId:
                                                                    m?.organizationId ?? "",
                                                                organizationRole:
                                                                    m?.organizationRole ?? "",
                                                                organization: m?.organization,
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

                                <span
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/75 bg-primary px-2 py-1 rounded-lg cursor-pointer flex hover:opacity-75 transition-all duration-300"
                                    onClick={() => setCrewModal(!crewModal)}
                                >
                                    <Plus
                                        className="h-4 w-4 inline-block text-white cursor-pointer lg:mr-1"
                                        strokeWidth={2}
                                    />
                                    <span className="text-xs hidden lg:inline-block">Add Crew</span>
                                </span>
                            </div>
                        </div>

                        <div>
                            <h1 className="mb-1">Landings</h1>
                            <div className="rounded-lg bg-secondary p-2">
                                {entry ? (entry.landDay ?? 0) + (entry.landNight ?? 0) : "1"}
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
                    <h1 className="text-lg text-white/50 font-semibold mb-2">Flight Plan</h1>
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
                                    {entry && entry.plan ? parseTime(entry.plan.etd) : "N/A"}
                                </div>
                            </div>

                            <div className="">
                                <h1 className="mb-1">ETE</h1>{" "}
                                {/* Estimated Time Enroute eta - etd */}
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
                                    {entry && entry.plan && entry.plan.fuelPlan
                                        ? `${Number(entry.plan.fuelPlan)}l`
                                        : "N/A"}
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
                                    {entry && entry.plan ? entry.plan.depAd : "N/A"}
                                </div>
                            </div>

                            <div className="">
                                <h1 className="mb-1">ETA</h1>
                                <div className="rounded-lg bg-secondary p-2">
                                    {entry && entry.plan ? parseTime(entry.plan.eta) : "N/A"}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <span className="text-white/75 text-sm my-1">
                            No flight plan available for this entry.
                        </span>
                    )}
                </div>

                <div className="mt-4 ring-2 ring-white/25 rounded-lg p-4">
                    <h1 className="text-lg text-white/50 font-semibold mb-2">Flight Recording</h1>
                    {recording ? (
                        <></>
                    ) : (
                        <span className="text-white/75 text-sm my-1">
                            No flight recording available for this entry.
                        </span>
                    )}
                </div>
            </div>

            <Footer />

            {crewModal && (
                <div className="fixed inset-0 bg-black/50 z-3000 flex items-center justify-center">
                    <div className="bg-secondary p-4 rounded-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Edit flight crew</h2>
                        <ul>
                            {entry?.crew?.map((member, index) => (
                                <li key={index} className="flex items-center justify-between mb-4">
                                    <Link
                                        to={`/user/${member?.id}`}
                                        className="flex items-center space-x-"
                                    >
                                        <img
                                            src={
                                                member?.profilePictureUrl ??
                                                "https://placehold.co/128x128"
                                            }
                                            alt={`${member?.firstName} ${member?.lastName}`}
                                            className="h-8 w-8 rounded-full ring-2 ring-neutral-600 mr-2"
                                        />
                                        <span>
                                            {member?.firstName} {member?.lastName}
                                        </span>
                                    </Link>
                                    <Button
                                        text="Remove"
                                        styleType="small"
                                        type="button"
                                        onClick={() => {
                                            if (!member?.id) return;
                                            removeCrewMember(member.username);
                                        }}
                                    />
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">add crew @username</label>
                            <input
                                className="bg-primary/5 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                ref={addCrewMemberRef}
                                type="text"
                            />
                            <Button
                                text="Add Crew"
                                styleType="small"
                                type="button"
                                className="mt-4"
                                onClick={addCrewMember}
                            />
                            <Button
                                text="Close"
                                styleType="small"
                                type="button"
                                className="mt-4"
                                onClick={() => setCrewModal(!crewModal)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

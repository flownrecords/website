import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import AirNavLogo from "../../assets/images/airnav.svg";
import FlightTracker from "../../assets/images/flighttracker.png";

import type { LogbookEntry, User } from "../../lib/types";
import Button from "../../components/general/Button";
import Footer from "../../components/general/Footer";
import useAlert from "../../components/alert/useAlert";
import RouteMap from "../../components/maping/RouteMap";
import ProfileCard from "../../components/user/ProfileCard";
import PageLoader from "../../components/general/Loader";

import { FilePlus2, FileText, Pencil, Plus, Save, Trash, Undo2 } from "lucide-react";
import { parseDate, parseDuration } from "../../lib/utils";
import Modal from "../../components/general/Modal";
import FlightDataChart from "../../components/logbook/FlightDataChart";
import { useAuth } from "../../components/auth/AuthContext";
import api, { ENDPOINTS } from "../../lib/api";

type RecordingStats =
    | {
          highestLevel: string; // "000" rounded to nearest 500ft
          averageLevel: string; // "000" rounded to nearest 500ft
          topSpeed: number; // knots
          averageSpeed: number; // knots
          squawks: string[]; // most-used first
          highestVerticalSpeed: string; // ft per min (fpm)
      }
    | undefined;

export default function LogbookEntry() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { entryId } = useParams();

    const [entry, setEntry] = useState<LogbookEntry | null>(null);

    const alert = useAlert();

    const [crewModal, setCrewModal] = useState<boolean>(false);
    const [recordModal, setRecordModal] = useState<boolean>(false);
    const [fplModal, setFplModal] = useState<boolean>(false);

    const [selectedRecordingSource, setSelectedRecordingSource] = useState<string | null>(null);
    const [recordingFile, setRecordingFile] = useState<File | null>(null);
    const [recordUploadInfo, setRecordUploadInfo] = useState<string | null>(null);

    const addCrewMemberRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!entryId) {
            navigate("/me/logbook");
        } else {
            api.get(ENDPOINTS.LOGBOOK.ENTRY, {
                requireAuth: true,
                navigate,
                replaceBy: [{ key: "{id}", value: entryId }],
            })
                .then((response) => {
                    if (response.meta.status === 200) {
                        if (!response) return navigate("/me/logbook");
                        setEntry(response);
                    }
                })
                .catch((error) => {
                    if (error?.status === 401) {
                        localStorage.removeItem("accessToken");
                        navigate("/login");
                    } else {
                        navigate("/me/logbook");
                    }
                });
        }
    }, [entryId, navigate]);

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

        if (!username) {
            return alert("Error", "Please enter a valid username.");
        }

        if (username === user?.username) {
            return alert("Error", "You cannot add yourself as a crew member.");
        }

        api.get(ENDPOINTS.USER.USERNAME, {
            requireAuth: true,
            navigate,
            replaceBy: [{ key: "{username}", value: username }],
        })
            .then((userData) => {
                if (userData.meta.status !== 200 || !userData || !userData.id) {
                    return alert("Error", "User not found.");
                }

                if (entry && entry.crew.some((member) => member?.id === userData.id)) {
                    return alert("Error", "This user is already assigned to the crew.");
                }

                api.post(
                    ENDPOINTS.LOGBOOK.ADD_CREW,
                    {
                        entryId: entry?.id,
                        crewUsername: username,
                    },
                    {
                        requireAuth: true,
                        navigate,
                    },
                ).then(() => {
                    window.location.reload();
                });
            })
            .catch((error) => {
                console.error("Error fetching user data:", error);
                return alert("Error", "User not found.");
            });
    }

    function removeCrewMember(memberUsername: string) {
        if (!entry || !entry.crew || !memberUsername) return;

        api.post(
            ENDPOINTS.LOGBOOK.REMOVE_CREW,
            {
                entryId: entry.id,
                crewUsername: memberUsername,
            },
            {
                requireAuth: true,
                navigate,
            },
        )
            .then(() => {
                window.location.reload();
            })
            .catch((error) => {
                console.error("Error removing crew member:", error);
                return alert(
                    "Error",
                    "An error occurred while trying to remove the crew member. Please try again later.",
                );
            });
    }

    function handleRecordingFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            console.log(file.type);
            if (file.type !== "application/vnd.google-earth.kml+xml") {
                alert("Error", "Please upload a valid KML file.");
                setRecordingFile(null);
                setRecordUploadInfo(null);
                event.target.value = "";
                return;
            }

            setRecordingFile(file);
        }
    }

    function recordUpload() {
        if (!selectedRecordingSource) {
            return setRecordUploadInfo("Please select a recording source.");
        }

        if (!recordingFile) {
            return setRecordUploadInfo("Please select a KML file to upload.");
        }

        if (!entry || !entry.id) {
            return setRecordUploadInfo(
                "No logbook entry found to associate with the recording. Try refreshing the page or ensure you are logged in.",
            );
        }

        const form = new FormData();
        form.append("file", recordingFile);
        form.append("fileSource", selectedRecordingSource);
        form.append("entryId", entry?.id.toString() || "");

        api.post(ENDPOINTS.RECORDING.UPLOAD, form, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
            .then((response) => {
                if (response.meta.status === 200) {
                    setRecordUploadInfo("Recording uploaded successfully.");
                    setRecordModal(false);
                    setRecordingFile(null);
                    setSelectedRecordingSource(null);
                    window.location.reload();
                } else {
                    setRecordUploadInfo("Failed to upload the recording. Please try again.");
                }
            })
            .catch((error) => {
                console.error("Error uploading recording:", error);
                setRecordUploadInfo(
                    "An error occurred while uploading the recording. Please try again later.",
                );
            });
    }

    function calculateStats(): RecordingStats {
        const recording = entry?.recording?.coords;
        if (!recording) return undefined;
        if (!Array.isArray(recording) || recording.length === 0) {
            return {
                highestLevel: "000",
                averageLevel: "000",
                topSpeed: 0,
                averageSpeed: 0,
                squawks: [],
                highestVerticalSpeed: "000fpm",
            };
        }

        // Extract altitude and speed values
        const altitudes = recording.map((r) => r.altitude?.value ?? 0);
        const speeds = recording.map((r) => r.groundSpeed ?? 0);
        const verticalSpeeds = recording.map((r) => r.verticalSpeed ?? 0);

        // Stats
        const highestAltitude = Math.max(...altitudes);
        const averageAltitude = altitudes.reduce((a, b) => a + b, 0) / altitudes.length;

        const topSpeed = Math.max(...speeds);
        const averageSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;

        // Helper to convert altitude → rounded FL string
        const toFlightLevel = (alt: number): string => {
            const rounded = Math.round(alt / 500) * 500; // nearest 500 ft
            return String(Math.floor(rounded / 100)).padStart(3, "0");
        };

        const squawkCounts: Record<string, number> = {};
        for (const r of recording) {
            const code = r.squawk ?? "----"; // placeholder for null/empty squawks
            squawkCounts[code] = (squawkCounts[code] ?? 0) + 1;
        }

        // Sort squawks by frequency
        const squawks = Object.entries(squawkCounts)
            .sort((a, b) => b[1] - a[1]) // most used first
            .map(([code]) => code)
            .filter((code) => code !== "----");

        let highestVerticalSpeedValue = verticalSpeeds.reduce(
            (max, vs) => (Math.abs(vs) > Math.abs(max) ? vs : max),
            0,
        );
        const vsLimit = topSpeed * 7.5;
        if (Math.abs(highestVerticalSpeedValue) > vsLimit) {
            highestVerticalSpeedValue = vsLimit * (highestVerticalSpeedValue >= 0 ? 1 : -1);
        }
        const highestVerticalSpeed = `${highestVerticalSpeedValue >= 0 ? "+" : ""}${highestVerticalSpeedValue} fpm`;

        return {
            highestLevel: toFlightLevel(highestAltitude),
            averageLevel: toFlightLevel(averageAltitude),
            topSpeed,
            averageSpeed: Math.round(averageSpeed),
            squawks,
            highestVerticalSpeed,
        };
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
                    <RouteMap
                        type="ENTRY"
                        user={user}
                        entryId={entry?.id}
                        recording={entry?.recording}
                    />
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

                        {!entry?.plan ? (
                            <Button
                                styleType="small"
                                type="button"
                                onClick={() => {
                                    navigate(`/me/plan?entry=${entry?.id}`);
                                }}
                                text={
                                    <>
                                        <FilePlus2
                                            className="h-4 w-4 inline-block"
                                            strokeWidth={2}
                                        />{" "}
                                        <span>Add Flight Plan</span>
                                    </>
                                }
                            />
                        ) : (
                            <Button
                                styleType="small"
                                type="button"
                                onClick={() => setFplModal(!fplModal)}
                                text={
                                    <>
                                        <FileText
                                            className="h-4 w-4 inline-block"
                                            strokeWidth={2}
                                        />{" "}
                                        <span>Flight Plan Options</span>
                                    </>
                                }
                            />
                        )}

                        {!entry?.recording ? (
                            <Button
                                disabled={entry?.recording ? true : entry?.id ? false : true}
                                styleType="small"
                                type="button"
                                onClick={() => {
                                    setRecordModal(true);
                                }}
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
                        ) : (
                            <Button
                                styleType="small"
                                type="button"
                                disabled={true} // TODO: implement delete flight plan
                                onClick={() => {}}
                                text={
                                    <>
                                        <Trash className="h-4 w-4 inline-block" strokeWidth={2} />{" "}
                                        <span>Delete Flight Recording</span>
                                    </>
                                }
                            />
                        )}
                    </div>
                </div>

                {entry ? (
                    <>
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
                                                                    className="h-6 w-6 rounded-full inline-block ring-2 ring-neutral-600  object-cover"
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

                                        <span
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/75 bg-primary px-2 py-1 rounded-lg cursor-pointer flex hover:opacity-75 transition-all duration-300"
                                            onClick={() => setCrewModal(!crewModal)}
                                        >
                                            <Plus
                                                className="h-4 w-4 inline-block text-white cursor-pointer lg:mr-1"
                                                strokeWidth={2}
                                            />
                                            <span className="text-xs hidden lg:inline-block">
                                                {entry?.crew && entry.crew.length > 0
                                                    ? "Edit"
                                                    : "Add"}{" "}
                                                Crew
                                            </span>
                                        </span>
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
                                                ? parseTime(entry.plan.eta)
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
                        </div>
                    </>
                ) : (
                    <PageLoader />
                )}
            </div>

            <Footer />

            <Modal
                isOpen={crewModal}
                onClose={() => setCrewModal(false)}
                title="Add Flight Recording"
            >
                <div className="bg-primary p-4 rounded-lg">
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
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={recordModal}
                onClose={() => setRecordModal(false)}
                title="Add Flight Recording"
            >
                <div className="bg-primary rounded-lg p-4 mt-4">
                    <h2 className="text-xl font-semibold mb-4">Upload Recording</h2>
                    <div>
                        <label className="inline-block text-sm text-white/75 mb-1">
                            file source
                        </label>
                        <div className="flex flex-row space-x-4">
                            <Button
                                text={
                                    <img
                                        src={AirNavLogo}
                                        alt="AirNav"
                                        title="AirNav"
                                        className="inline-block h-8"
                                    />
                                }
                                styleType="small"
                                type="button"
                                className={`w-full ${selectedRecordingSource === "AIRNAV" ? "opacity-100" : "opacity-50"}`}
                                onClick={() => {
                                    setSelectedRecordingSource("AIRNAV");
                                    setRecordUploadInfo("");
                                    if (selectedRecordingSource === "AIRNAV") {
                                        setSelectedRecordingSource(null);
                                    }
                                }}
                            />
                            <Button
                                disabled={true}
                                text={
                                    <img
                                        src={FlightTracker}
                                        alt="Flight Track"
                                        title="Flight Tracker"
                                        className="inline-block h-8"
                                    />
                                }
                                styleType="small"
                                type="button"
                                className="w-full cursor-not-allowed"
                                onClick={() => {
                                    setSelectedRecordingSource("FLIGHTTRACKER");
                                    setRecordUploadInfo("");
                                    if (selectedRecordingSource === "FLIGHTTRACKER") {
                                        setSelectedRecordingSource(null);
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col mb-4">
                        <label className="text-sm text-white/75 mt-4 mb-1">KML file</label>
                        <input
                            onChange={handleRecordingFileChange}
                            type="file"
                            accept=".kml"
                            className="bg-secondary ring-2 ring-white/25 rounded-lg px-2 py-2 file:text-white file:bg-primary/50 file:border-0 file:rounded-md file:px-3"
                        />
                    </div>
                    {recordUploadInfo && (
                        <div className="text-sm text-second-accent mb-4">{recordUploadInfo}</div>
                    )}
                    <div className="flex justify-start space-x-4">
                        <Button text="Submit" onClick={recordUpload} styleType="small" />
                    </div>
                </div>
            </Modal>

            <Modal isOpen={fplModal} title="Flight Plan Options" onClose={() => setFplModal(false)}>
                <div className="bg-primary p-4 rounded-lg flex flex-col space-y-4">
                    <Button
                        disabled={true} // TODO: implement delete flight plan
                        text={
                            <>
                                <Pencil className="h-4 w-4 inline-block" strokeWidth={2} />{" "}
                                <span>Edit Flight Plan</span>
                            </>
                        }
                        styleType="small"
                        type="button"
                        onClick={() => {}}
                    />
                    <Button
                        disabled={true} // TODO: implement delete flight plan
                        text={
                            <>
                                <Trash className="h-4 w-4 inline-block" strokeWidth={2} />{" "}
                                <span>Delete Flight Plan</span>
                            </>
                        }
                        styleType="small"
                        type="button"
                        onClick={() => {}}
                    />
                </div>
            </Modal>
        </>
    );
}

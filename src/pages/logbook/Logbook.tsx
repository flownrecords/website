import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import axios from "axios";

import Button from "../../components/general/Button";
import Splash from "../../components/general/Splash";
import useAlert from "../../components/alert/useAlert";
import type { User } from "../../lib/types";
import { Loader, Pencil, Plus, Trash, UserRound } from "lucide-react";
import Footer from "../../components/general/Footer";
import Modal from "../../components/general/Modal";

import { captalize, parseDuration } from "../../lib/utils";

export default function Logbook() {
    const API = import.meta.env.VITE_API_URL;

    const [user, setUser] = useState<User>(null);
    const [manageMode, toggleManageMode] = useState(false);
    const [managedEntries, setManagedEntries] = useState<number[]>([]);

    const [entryModal, toggleEntryModal] = useState(false);
    const [uploadModal, toggleUploadModal] = useState(false);
    const [manualModal, toggleManualModal] = useState<boolean>(false);

    const [uploadInfo, setUploadInfo] = useState<string>();
    const [file, setFile] = useState<File | null>(null);

    const [meAircraftReg, setMeAircraftReg] = useState<string | null>(null);
    const [meAircraftType, setMeAircraftType] = useState<string | null>(null);
    const [meDeparture, setMeDeparture] = useState<string | null>(null);
    const [meArrival, setMeArrival] = useState<string | null>(null);

    const selectedSource = useRef<HTMLSelectElement>(null);

    const alert = useAlert();

    let navigate = useNavigate();

    const token = localStorage.getItem("accessToken");

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
                    return setUser(response.data);
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

    const fileSources = [
        {
            id: "flightLogger",
            name: "FlightLogger",
            logo: "https://d308f3rtp9iyib.cloudfront.net/assets/my_flightlogger_icon-99fc56ba222dde06d0b11a88e430a81cc59dbb07027548a1f3666e398f2cfea0.png",
        },
    ];

    function parseDate(date?: string | Date | null, cut = false) {
        return new Date(date as any)
            .toLocaleDateString("en-GB", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
            })
            .slice(0, cut ? 5 : undefined);
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadInfo(undefined);
        } else {
            setFile(null);
            setUploadInfo("No file selected");
        }
    }

    function uploadLogbook() {
        setUploadInfo(undefined);

        let source = selectedSource.current?.value;
        if (!source) {
            setUploadInfo("Please select a file source");
            return;
        }

        if (!file || file.type !== "text/csv") {
            setUploadInfo("Please select a valid file to upload");
            return;
        }

        const form = new FormData();
        form.append("file", file);
        form.append("source", source);

        axios
            .post(API + "/users/logbook/upload", form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                if (response.status === 200) {
                    console.log(response.data);
                    if (response.data.length === 0) {
                        setUploadInfo("No new logbook entries found in the file");
                        return;
                    }

                    toggleUploadModal(false);
                    setFile(null);
                    setUploadInfo(undefined);

                    window.location.reload();
                }
            });
    }

    function handleDeleteSelected() {
        if (managedEntries.length === 0) {
            return alert("Error", "No entries selected for deletion");
        }

        if (
            !window.confirm(
                "Are you sure you want to delete the selected logbook entries? This action cannot be undone.",
            )
        )
            return;

        if (!user) {
            alert("Error", "You must be logged in to delete logbook entries");
            return;
        }

        axios
            .post(
                API + "/users/logbook/delete",
                {
                    entryIds: managedEntries,
                    userId: user.id,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                },
            )
            .then(() => {
                window.location.reload();
            })
            .catch((error) => {
                console.error("Error deleting logbook entries:", error);
                alert(
                    "Error",
                    "An error occurred while deleting logbook entries. Please try again later.",
                );
            });
    }

    function handleManualEntrySubmit(skip: boolean = false) {
        return () => {
            const data = {
                acftReg: meAircraftReg?.toUpperCase().trim() || "",
                acftType: meAircraftType?.toUpperCase().trim() || "",
                depAd: meDeparture?.toUpperCase().trim() || "",
                arrAd: meArrival?.toUpperCase().trim() || "",
            };

            if (skip) return navigate(`/me/logbook/manual?${new URLSearchParams(data).toString()}`);

            if (!meAircraftReg || !meAircraftType || !meDeparture || !meArrival) {
                return alert("Error", "Please fill in all fields before submitting the entry");
            }

            if (data.depAd?.length !== 4 || data.arrAd?.length !== 4) {
                return alert(
                    "Error",
                    "Departure and arrival airport codes must be 4 characters long",
                );
            }

            if (!data.acftReg || data.acftReg.length < 1) {
                return alert("Error", "Aircraft registration must be at least 1 character long");
            }

            if (data.acftReg.length > 8) {
                return alert("Error", "Aircraft registration cannot be longer than 8 characters");
            }

            if (!data.acftType || data.acftType.length < 3 || data.acftType.length > 4) {
                return alert("Error", "Aircraft type must be between 3 and 4 characters long");
            }

            return navigate(`/me/logbook/manual?${new URLSearchParams(data).toString()}`);
        };
    }

    return (
        <>
            <Splash
                uppertext={
                    user ? `${captalize(user?.firstName) ?? `@${user?.username}`}'s` : "User\s"
                }
                title="Logbook"
            />
            <div className="container mx-auto max-w-6xl p-4 xl:px-0">
                <div
                    className="
          bg-primary ring-2 ring-white/25 rounded-lg px-4 py-2
          flex justify-between items-center
          "
                >
                    <Link to="/me" className="flex items-center py-2">
                        <img
                            src={
                                user?.profilePictureUrl ??
                                "https://placehold.co/512/09090B/313ED8?font=roboto"
                            }
                            draggable={false}
                            className="h-8 w-8 rounded-full ring-1 ring-white/25 object-cover"
                            alt="User profile icon"
                        />
                        <h1 className="font-semibold ml-2">
                            {user ? (captalize(user?.firstName) ?? `@${user?.username}`) : "User"}
                        </h1>
                    </Link>

                    <div className="hidden md:flex items-center font-semibold ">
                        <span className="text-sm text-white/50">
                            {user?.logbookEntries.length ?? 0} flights
                        </span>
                    </div>

                    <div className="space-x-4">
                        <div className="hidden lg:inline-block">
                            <Button
                                to="/me"
                                text={
                                    <>
                                        <UserRound className="h-4 w-4 inline-block " strokeWidth={2}/>
                                        <span className="hidden lg:inline-block ml-2">Profile</span>
                                    </>
                                }
                                styleType="small"
                            />
                        </div>

                        <Button
                            type="button"
                            text={
                                <>
                                    <Plus className="h-4 w-4 inline-block" strokeWidth={2}/>
                                    <span className="hidden lg:inline-block ml-2">Add Entry</span>
                                </>
                            }
                            onClick={() => toggleEntryModal(!entryModal)}
                            styleType="small"
                        />

                        {manageMode && (
                            <Button
                                type="button"
                                text={
                                    <>
                                        <Trash className="h-4 w-4 inline-block" strokeWidth={2}/>
                                        <span className="hidden lg:inline-block ml-2">
                                            Delete Selected
                                        </span>
                                    </>
                                }
                                styleType="small"
                                onClick={handleDeleteSelected}
                            />
                        )}
                        <Button
                            type="button"
                            text={
                                <>
                                    <Pencil className="h-4 w-4 inline-block" strokeWidth={2}/>
                                    <span className="hidden lg:inline-block ml-2">Manage</span>
                                </>
                            }
                            className={`${manageMode ? "underline decoration-2 decoration-accent" : ""}`}
                            styleType="small"
                            onClick={() => toggleManageMode(!manageMode)}
                        />
                    </div>
                </div>

                {user?.logbookEntries ? (
                    <div className="mt-4 bg-primary ring-2 ring-white/25 rounded-lg p-4">
                        <div className="grid grid-cols-6 px-2 mb-4">
                            <span>Date</span>

                            <span className="hidden md:block"> Registration </span>
                            <span className="block md:hidden"> Reg. </span>

                            <span className="hidden md:block"> Departure </span>
                            <span className="block md:hidden"> Dep. </span>

                            <span className="hidden md:block"> Arrival </span>
                            <span className="block md:hidden"> Arr. </span>

                            <span className="hidden md:block"> Flight Time </span>
                            <span className="block md:hidden"> Time </span>

                            <span className="flex items-center justify-end px-4">
                                {manageMode && (
                                    <>
                                        <div className="flex items-center cursor-pointer relative mr-2 md:mr-5">
                                            <input
                                                onClick={(e) => {
                                                    const isChecked = (e.target as HTMLInputElement)
                                                        .checked;
                                                    if (isChecked) {
                                                        const allEntryIds =
                                                            user?.logbookEntries.map(
                                                                (entry) => entry.id,
                                                            ) || [];
                                                        setManagedEntries(allEntryIds);

                                                        document
                                                            .querySelectorAll(".peer")
                                                            .forEach((checkbox) => {
                                                                (
                                                                    checkbox as HTMLInputElement
                                                                ).checked = true;
                                                            });
                                                    } else {
                                                        setManagedEntries([]);

                                                        document
                                                            .querySelectorAll(".peer")
                                                            .forEach((checkbox) => {
                                                                (
                                                                    checkbox as HTMLInputElement
                                                                ).checked = false;
                                                            });
                                                    }
                                                }}
                                                type="checkbox"
                                                className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded border border-white/25 checked:bg-accent/25 checked:border-accent"
                                            />
                                            <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-3.5 w-3.5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    stroke="currentColor"
                                                    strokeWidth="1"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </span>
                                        </div>
                                        <span className="text-sm px-1 hidden md:inline-block">
                                            Select all
                                        </span>
                                    </>
                                )}
                            </span>
                        </div>
                        {user?.logbookEntries &&
                            user?.logbookEntries.length > 0 &&
                            user?.logbookEntries
                                .sort(
                                    (a, b) =>
                                        new Date(b.date as any).getTime() -
                                        new Date(a.date as any).getTime(),
                                )
                                .map((entry, index) => (
                                    <div
                                        key={index}
                                        className={`
                  grid grid-cols-6 py-4 px-2 items-center
                  transition-all duration-150
                  ${index % 2 === 0 ? "bg-primary hover:bg-primary/75" : "bg-gradient-to-br to-neutral-900 from-neutral-800 hover:from-neutral-800/75"} 
                  rounded-xl cursor-pointer
                  `}
                                        onClick={() => {
                                            navigate(`/me/logbook/${entry.id}`);
                                        }}
                                    >
                                        <span className="text-xs md:text-sm text-white/50 ml-2 hidden">
                                            {parseDate(entry.date, false)}
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 ml-2 md:block">
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
                                        <span className="flex justify-end px-2">
                                            {manageMode && (
                                                <div className="flex items-center cursor-pointer relative mr-4">
                                                    <input
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                            if (
                                                                (e.target as HTMLInputElement)
                                                                    .checked
                                                            ) {
                                                                if (
                                                                    !managedEntries.includes(
                                                                        entry.id,
                                                                    )
                                                                ) {
                                                                    setManagedEntries([
                                                                        ...managedEntries,
                                                                        entry.id,
                                                                    ]);
                                                                }
                                                            } else {
                                                                const newManagedEntries =
                                                                    managedEntries.filter(
                                                                        (id) => id !== entry.id,
                                                                    );
                                                                setManagedEntries(
                                                                    newManagedEntries,
                                                                );
                                                            }
                                                        }}
                                                        type="checkbox"
                                                        className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded border border-white/25 checked:bg-accent/25 checked:border-accent"
                                                    />
                                                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-3.5 w-3.5"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                            stroke="currentColor"
                                                            strokeWidth="1"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </span>
                                                </div>
                                            )}

                                            <span className="hidden md:inline-block">
                                                <Button
                                                    to={`/me/logbook/${entry.id}`}
                                                    text="View"
                                                    styleType="small"
                                                    className="text-sm"
                                                />
                                            </span>
                                        </span>
                                    </div>
                                ))}
                    </div>
                ) : (
                    <div className="container mx-auto max-w-6xl p-4 h-screen">
                        <div className="flex justify-center items-center h-64">
                            <Loader className="animate-spin w-12 h-12 text-white/25" />
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={entryModal}
                onClose={() => toggleEntryModal(false)}
                title="Add Logbook Entry"
            >
                <h2 className="text-white/75">Choose your source</h2>

                <div className="w-full bg-primary rounded-lg mt-2 flex flex-row justify-between items-center">
                    <div className="w-[45%] py-2 px-4">
                        <Button
                            type="button"
                            className="w-full text-center"
                            styleType="small"
                            text="Manual Entry"
                            onClick={() => {
                                toggleManualModal(!manualModal);
                                toggleUploadModal(false);
                            }}
                        />
                    </div>
                    <div className="py-2 px-4 text-white/25 font-semibold">or</div>
                    <div className="w-[45%] py-2 px-4">
                        <Button
                            type="button"
                            className="w-full text-center"
                            styleType="small"
                            text="Upload Entry"
                            onClick={() => {
                                toggleUploadModal(!uploadModal);
                                toggleManualModal(false);
                            }}
                        />
                    </div>
                </div>

                {uploadModal && (
                    <div className="bg-primary rounded-lg p-4 mt-4">
                        <h2 className="text-xl font-semibold mb-4">Upload Entry</h2>
                        <div>
                            <label className="inline-block text-sm text-white/75 mb-1">
                                file source
                            </label>
                            <select
                                ref={selectedSource}
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-2 py-2 focus:outline-none focus:ring-white/50 w-full"
                                required
                            >
                                {fileSources.map((source) => (
                                    <option key={source.id} value={source.id}>
                                        {source.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col mb-4">
                            <label className="text-sm text-white/75 mt-4 mb-1">CSV file</label>
                            <input
                                onChange={handleFileChange}
                                type="file"
                                accept=".csv"
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-2 py-2 file:text-white file:bg-primary/50 file:border-0 file:rounded-md file:px-3"
                            />
                        </div>
                        {uploadInfo && (
                            <div className="text-sm text-second-accent mb-4">{uploadInfo}</div>
                        )}
                        <div className="flex justify-start space-x-4">
                            <Button text="Submit" onClick={uploadLogbook} styleType="small" />
                        </div>
                    </div>
                )}

                {manualModal && (
                    <div className="bg-primary rounded-lg p-4 mt-4">
                        <h2 className="text-xl font-semibold mb-4">Manual Entry</h2>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col">
                                <label className="text-sm text-white/75 mb-1">aircraft reg.</label>
                                <input
                                    type="text"
                                    autoComplete="me-aircraft-reg"
                                    className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                    maxLength={8}
                                    onChange={(e) => {
                                        e.target.value = e.target.value.replace(
                                            /[^a-zA-Z0-9-]/g,
                                            "",
                                        );
                                        e.target.value = e.target.value.toUpperCase();
                                        setMeAircraftReg(e.target.value);
                                    }}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm text-white/75 mb-1">aircraft type</label>
                                <input
                                    type="text"
                                    autoComplete="me-aircraft-reg"
                                    className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                    minLength={3}
                                    maxLength={4}
                                    onChange={(e) => {
                                        e.target.value = e.target.value.replace(
                                            /[^a-zA-Z0-9-]/g,
                                            "",
                                        );
                                        e.target.value = e.target.value.toUpperCase();
                                        setMeAircraftType(e.target.value);
                                    }}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm text-white/75 mb-1">departure</label>
                                <input
                                    type="text"
                                    autoComplete="me-departure"
                                    className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                    minLength={4}
                                    maxLength={4}
                                    onChange={(e) => {
                                        e.target.value = e.target.value.toUpperCase();
                                        setMeDeparture(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm text-white/75 mb-1">arrival</label>
                                <input
                                    type="text"
                                    autoComplete="me-arrival"
                                    className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                    minLength={4}
                                    maxLength={4}
                                    onChange={(e) => {
                                        e.target.value = e.target.value.toUpperCase();
                                        setMeArrival(e.target.value);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-start mt-4 space-x-4">
                            <Button
                                text="Submit"
                                onClick={handleManualEntrySubmit(false)}
                                styleType="small"
                            />
                            <Button
                                text="Open"
                                onClick={handleManualEntrySubmit(true)}
                                styleType="small"
                            />
                        </div>
                    </div>
                )}
            </Modal>

            <Footer />
        </>
    );
}

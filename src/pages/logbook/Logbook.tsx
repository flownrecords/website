import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import Button from "../../components/general/Button";
import Splash from "../../components/general/Splash";
import useAlert from "../../components/alert/useAlert";
import { InfoIcon, Pencil, Plus, Trash, UserRound } from "lucide-react";
import Footer from "../../components/general/Footer";
import Modal from "../../components/general/Modal";

import { captalize, parseDuration } from "../../lib/utils";
import Skeleton from "../../components/general/Skeleton";
import Icon from "../../assets/images/icon.png";
import api, { ENDPOINTS } from "../../lib/api";
import { useAuth } from "../../components/auth/AuthContext";

import FlightLogger from "../../assets/images/flightlogger.png";
import PageLoader from "../../components/general/Loader";

export default function Logbook() {
    const { user } = useAuth();
    const [manageMode, toggleManageMode] = useState(false);
    const [managedEntries, setManagedEntries] = useState<number[]>([]);

    const [entryModal, toggleEntryModal] = useState(false);
    const [uploadModal, toggleUploadModal] = useState(false);
    const [deleteModal, toggleDeleteModal] = useState<boolean>(false);

    const [uploadInfo, setUploadInfo] = useState<string>();
    const [file, setFile] = useState<File | null>(null);

    const alert = useAlert();

    let navigate = useNavigate();

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

        let source = "flightLogger";
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

        api.post(ENDPOINTS.LOGBOOK.UPLOAD, form, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then((response) => {
                if (response) {
                    if (response.length === 0) {
                        return setUploadInfo("No new logbook entries found in the file");
                    }

                    toggleUploadModal(false);
                    setFile(null);
                    setUploadInfo(undefined);

                    window.location.reload();
                } else {
                    setUploadInfo("Error uploading logbook");
                    console.error("Error uploading logbook:", response);
                    alert(
                        "Error",
                        "An error occurred while uploading the logbook. Please try again later.",
                    );
                }
            })
            .catch((error) => {
                console.error("Error uploading logbook:", error);
                alert(
                    "Error",
                    "An error occurred while uploading the logbook. Please try again later.",
                );
            });
    }

    function proceedDeleteEntries() {
        if (managedEntries.length === 0) {
            return alert("Error", "No entries selected for deletion");
        }

        if (!user) {
            alert("Error", "You must be logged in to delete logbook entries");
            return;
        }

        api.post(
            ENDPOINTS.LOGBOOK.DELETE,
            {
                entryIds: managedEntries,
                userId: user.id,
            },
            {
                headers: { "Content-Type": "application/json" },
            },
        )
            .then(() => {
                return window.location.reload();
            })
            .catch((error) => {
                console.error("Error deleting logbook entries:", error);
                alert(
                    "Error",
                    "An error occurred while deleting logbook entries. Please try again later.",
                );
            });
    }
    
    return (
        <>
            <Splash
                uppertext={
                    <>
                        {user ? (
                            `${captalize(user?.firstName) ?? `@${user?.username}`}'s`
                        ) : (
                            <span className="h-8 w-0.5 inline-block"></span>
                        )}
                    </>
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
                        <div className="rounded-full ring-2 ring-white/25">
                            {user ? (
                                <img
                                    className="h-8 w-8 rounded-full object-cover"
                                    draggable="false"
                                    src={user?.profilePictureUrl ?? Icon}
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
                            {user ? (
                                (captalize(user?.firstName) ?? `@${user?.username}`)
                            ) : (
                                <Skeleton type="span" />
                            )}
                        </h1>
                    </Link>

                    <div className="hidden md:flex items-center font-semibold ">
                        <span className="text-sm text-white/50">
                            {user && user.logbookEntries ? (
                                `${user?.logbookEntries.length ?? 0} flights`
                            ) : (
                                <Skeleton type="span" />
                            )}
                        </span>
                    </div>

                    <div className="space-x-4">
                        <div className="hidden lg:inline-block">
                            <Button
                                to="/me"
                                text={
                                    <>
                                        <UserRound
                                            className="h-4 w-4 inline-block "
                                            strokeWidth={2}
                                        />
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
                                    <Plus className="h-4 w-4 inline-block" strokeWidth={2} />
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
                                        <Trash className="h-4 w-4 inline-block" strokeWidth={2} />
                                        <span className="hidden lg:inline-block ml-2">
                                            Delete Selected
                                        </span>
                                    </>
                                }
                                styleType="small"
                                onClick={() => {
                                    if (managedEntries.length === 0) {
                                        return alert("Error", "No entries selected for deletion");
                                    }

                                    toggleDeleteModal(true);
                                }}
                            />
                        )}
                        <Button
                            type="button"
                            text={
                                <>
                                    <Pencil className="h-4 w-4 inline-block" strokeWidth={2} />
                                    <span className="hidden lg:inline-block ml-2">Manage</span>
                                </>
                            }
                            className={`${manageMode ? "underline decoration-2 decoration-accent" : ""}`}
                            styleType="small"
                            onClick={() => toggleManageMode(!manageMode)}
                        />
                    </div>
                </div>

                <div className="mt-4 bg-primary ring-2 ring-white/25 rounded-lg p-4">
                        <div className="grid grid-cols-6 pb-2 px-2 md:px-4">
                            <span>Date</span>

                            <span className="hidden md:block"> Registration </span>
                            <span className="block md:hidden"> Reg. </span>

                            <span className="hidden md:block"> Departure </span>
                            <span className="block md:hidden text-center"> Dep. </span>

                            <span className="hidden md:block"> Arrival </span>
                            <span className="block md:hidden text-center"> Arr. </span>

                            <span className="hidden md:block"> Flight Time </span>
                            <span className="block md:hidden text-right"> Time </span>

                            <span className="flex items-center justify-end px-4">
                                {manageMode && (
                                    <>
                                        <div className="flex items-center cursor-pointer relative mr-2 md:mr-3">
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
                                                className="peer h-4 w-4 md:h-5 md:w-5 cursor-pointer transition-all appearance-none rounded border border-white/25 checked:bg-accent/25 checked:border-accent"
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
                            user?.logbookEntries.length > 0 ?
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
                  grid grid-cols-6 py-4 px-2 md:px-4 items-center
                  transition-all duration-150
                  ${index % 2 === 0 ? "bg-primary hover:bg-primary/75" : "bg-gradient-to-br to-neutral-900 from-neutral-800 hover:from-neutral-800/75"} 
                  rounded-lg cursor-pointer
                  `}
                                        onClick={() => {
                                            navigate(`/me/logbook/${entry.id}`);
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
                                        <span className="flex justify-end px-2 md:px-0">
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
                                                        className="peer h-4 w-4 md:h-5 md:w-5 cursor-pointer transition-all appearance-none rounded border border-white/25 checked:bg-accent/25 checked:border-accent"
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
                                )) : <>
                                    {
                                        (user?.logbookEntries && user?.logbookEntries?.length === 0) ? <><p className="text-center text-white/25">No entries found.</p></> : <PageLoader/>
                                    }
                                </>}
                    </div>
            </div>

            <Modal
                isOpen={entryModal}
                onClose={() => toggleEntryModal(false)}
                title="Add Logbook Entry"
            >
                <div className="bg-primary rounded-lg p-4 mt-4">
                    <h2 className="text-xl font-semibold mb-4">Choose your source</h2>

                    <div>
                        <label className="inline-block text-sm text-white/75 mb-1">
                            entry source
                        </label>
                        <div className="flex flex-row space-x-4">
                            <Button
                                styleType="small"
                                type="button"
                                className={`w-full ${uploadModal ? "opacity-100" : "opacity-50"}`}
                                onClick={() => {
                                    toggleUploadModal(!uploadModal);
                                }}
                                text={
                                    <img 
                                        src={FlightLogger}
                                        alt="FlightLogger"
                                        title="FlightLogger"
                                        className="inline-block h-6 object-fill"
                                    />
                                }
                            />
                            <Button
                                text={
                                    <h1 className="h-8 text-xl flex justify-center items-center font-medium text-white/75">
                                        Manual Entry
                                    </h1>
                                }
                                styleType="small"
                                type="button"
                                className="w-full opacity-50 hover:opacity-100"
                                to="/me/logbook/manual"
                            />
                        </div>

                        {
                            uploadModal && (
                                <>
                                    <div className="flex flex-col mb-2">
                                        <label className="text-sm text-white/75 mt-4 mb-1">CSV file</label>
                                        <input
                                            onChange={handleFileChange}
                                            type="file"
                                            accept=".csv"
                                            className="bg-secondary ring-2 ring-white/25 rounded-lg px-2 py-2 file:text-white file:bg-primary/50 file:border-0 file:rounded-md file:px-3"
                                        />
                                    </div>

                                    <div className="flex flex-row my-4">
                                        <Link to="/guides#flightlogger" className="text-accent font-medium cursor-pointer hover:opacity-75 transition-all duration-300">
                                            <InfoIcon className="inline-block h-6 w-6"/><span className="text-sm ml-2">How to retrieve your CSV logbook file</span>
                                        </Link>
                                    </div>

                                    {uploadInfo && (
                                        <div className="text-sm text-second-accent mb-4">{uploadInfo}</div>
                                    )}
                                    <div className="flex justify-start space-x-4">
                                        <Button text="Submit" onClick={uploadLogbook} styleType="small" />
                                    </div>
                                </>
                            )
                        }
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={deleteModal}
                onClose={() => toggleDeleteModal(false)}
                title="Delete Logbook Entry"
                buttons={[
                    <Button text="Confirm" onClick={proceedDeleteEntries} styleType="small" />,
                ]}
            >
                <h2 className="text-white/75">
                    Confirm you want to delete {managedEntries.length} logbook entr
                    {managedEntries.length === 1 ? "y" : "ies"}?
                </h2>

                <div className="w-full bg-primary rounded-lg mt-2 flex flex-row justify-between items-center"></div>
            </Modal>

            <Footer />
        </>
    );
}

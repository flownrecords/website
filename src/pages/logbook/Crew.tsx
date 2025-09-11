import { useAuth } from "../../components/auth/AuthContext";
import Button from "../../components/general/Button";
import Splash from "../../components/general/Splash";
import { captalize, parseDate, parseDuration } from "../../lib/utils";
import Icon from "../../assets/images/icon.png";
import ProfileCard from "../../components/user/ProfileCard";
import { useEffect, useState } from "react";
import api, { ENDPOINTS } from "../../lib/api";
import { LogOut, Pencil, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/general/Footer";
import PageLoader from "../../components/general/Loader";
import Skeleton from "../../components/general/Skeleton";
import useAlert from "../../components/alert/useAlert";
import Modal from "../../components/general/Modal";

export default function CrewLogbook() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const alert = useAlert();

    const [logbook, setLogbook] = useState(user?.crewForEntries ?? []);
    const [manageMode, toggleManageMode] = useState(false);
    const [managedEntries, setManagedEntries] = useState<number[]>([]);
    const [removeModal, toggleRemoveModal] = useState<boolean>(false);

    useEffect(() => {
        api.get(ENDPOINTS.USER.ME)
        .then((response) => {
            if(response.meta.status === 200) {
                setLogbook(response.crewForEntries);
            }
        })
    }, []);

    function totalFlightTime() {
        if (!logbook || logbook.length === 0) {
            return "0h00";
        }

        const total = logbook
            .map((entry) => {
                if (!entry.includeInFt) return 0;
                return Number(
                    typeof entry.total === "number" && entry.total > 0
                        ? entry.total
                        : entry.simTime,
                );
            })
            .reduce((acc, entry) => acc + entry, 0);

        const hours = Math.floor(total);
        const minutes = Math.round((total % 1) * 60);
        return `${hours}h${minutes < 10 ? "0" + minutes : minutes}`;
    }

    function proceedRemoveEntries() {
        if (managedEntries.length === 0) {
            return alert("Error", "No entries selected for deletion");
        }

        if (!user) {
            alert("Error", "You must be logged in to delete logbook entries");
            return;
        }

        api.post(
            ENDPOINTS.LOGBOOK.REMOVE_CREW,
            {
                // to be done
                entryId: [],
                crewUsername: user.username,
            },
            {
                headers: { "Content-Type": "application/json" },
            },
        )
            .then(() => {
                return window.location.reload();
            })
            .catch((error) => {
                console.error("Error removing yourself from logbook entries crew:", error);
                alert(
                    "Error",
                    "An error occurred while removing yourself from logbook entries crew. Please try again later.",
                );
            });
    }

    return (
        <>
            <Splash uppertext="Logbook" title="Crew" />

            <div className="container mx-auto max-w-6xl p-4 xl:px-0">
                <div
                    className="
          bg-primary ring-2 ring-white/25 rounded-lg px-4 py-2
          flex justify-between items-center
          "
                >
                    <Link to="/me" className="flex items-center py-2 hover:opacity-75 transition-all duration-150">
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
                            {user && logbook ? (
                                `${logbook.length ?? 0} flights - ${totalFlightTime()}`
                            ) : (
                                <Skeleton type="span" />
                            )}
                        </span>
                        <span>
                            
                        </span>
                    </div>

                    <div className="space-x-4">
                        <div className="hidden">
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

                        

                        {manageMode && (
                            <Button
                                type="button"
                                disabled={true}
                                text={
                                    <>
                                        <LogOut className="h-4 w-4 inline-block" strokeWidth={2} />
                                        <span className="hidden lg:inline-block ml-2">
                                            Remove Selected
                                        </span>
                                    </>
                                }
                                styleType="small"
                                onClick={() => {
                                    if (managedEntries.length === 0) {
                                        return alert("Error", "No entries selected for deletion");
                                    }

                                    toggleRemoveModal(true);
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
                        {logbook &&
                            logbook.length > 0 ?
                            logbook
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
                                            navigate(`/me/crew/${entry.id}`);
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
                                            { entry.plan?.depAd || entry.depAd || "-"}
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 text-center md:text-left">
                                            { entry.plan?.arrAd || entry.arrAd || "-"}
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 text-right md:text-left">
                                            {parseDuration(
                                                typeof entry.total === "number" && entry.total > 0
                                                    ? entry.total
                                                    : entry.simTime,
                                            ) || "-"}
                                        </span>

                                        <span className="flex justify-end px-2 items-center md:px-0">
                                            <div className={`relative group ${manageMode ? "hidden lg:inline-block" : "inline-block" }`}>
                                                <img
                                                    className="h-4 w-4 lg:h-6 lg:w-6 mr-4 rounded-full object-cover ring-2 ring-white/25"
                                                    draggable="false"
                                                    src={entry.user?.profilePictureUrl ?? Icon}
                                                    alt="User profile icon"
                                                />

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
                                                                    entry.user?.profilePictureUrl ??
                                                                    "",
                                                                firstName:
                                                                    entry.user?.firstName ?? null,
                                                                lastName: entry.user?.lastName ?? "",
                                                                username:
                                                                    entry.user?.username ?? null,
                                                                location:
                                                                    entry.user?.location ?? null,
                                                                publicProfile:
                                                                    entry.user?.publicProfile ??
                                                                    false,
                                                                bio: entry.user?.bio ?? null,
                                                                organizationId:
                                                                    entry.user?.organizationId ?? "",
                                                                organizationRole:
                                                                    entry.user?.organizationRole ??
                                                                    "",
                                                                organization:
                                                                    entry.user?.organization,
                                                            }}
                                                        />
                                                </div>
                                            </div>

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
                                                    to={`/me/crew/${entry.id}`}
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
                isOpen={removeModal}
                onClose={() => toggleRemoveModal(false)}
                title="Delete Logbook Entry"
                buttons={[
                    <Button text="Confirm" onClick={proceedRemoveEntries} styleType="small" />,
                ]}
            >
                <h2 className="text-white/75">
                    Confirm you want to remove yourself from {managedEntries.length} logbook entr
                    {managedEntries.length === 1 ? "y" : "ies"} crew list?
                </h2>

                <div className="w-full bg-primary rounded-lg mt-2 flex flex-row justify-between items-center"></div>
            </Modal>

            <Footer />
        </>
    );
}
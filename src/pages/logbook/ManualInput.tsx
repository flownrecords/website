import { useEffect, useRef, useState } from "react";
import Splash from "../../components/general/Splash";
import Footer from "../../components/general/Footer";
import { InfoIcon, Plus, SearchCheck, Undo2 } from "lucide-react";
import Button from "../../components/general/Button";
import type { User } from "../../lib/types";
import { Link, useNavigate } from "react-router-dom";
import ProfileCard from "../../components/user/ProfileCard";
import { timeDifference, applyUTC } from "../../lib/utils";
import useAlert from "../../components/alert/useAlert";
import axios from "axios";

type EntryInput = {
    depAd: string | null,
    arrAd: string | null,
    offBlock: Date | null;
    onBlock: Date | null;

    aircraftType: string | null,
    aircraftRegistration: string | null,
    picName: string | null,

    total: number | string | null;
    dayTime: number | string | null;
    nightTime: number | string | null;
    sepVfr: number | string | null;
    sepIfr: number | string | null;
    meVfr: number | string | null;
    meIfr: number | string | null;
    picTime: number | string | null;
    copilotTime: number | string | null;
    multiPilotTime: number | string | null;
    instructorTime: number | string | null;
    dualTime: number | string | null;
    simTime: number | string | null;
    simInstructorTime: number | string | null;
    landDay: number | null;
    landNight: number | null;
    includeInFt: boolean;
    remarks: string | null;

    crew: User[];
}

export default function LogbookManualInput() {
    const API = import.meta.env.VITE_API_URL;
    
    const query = new URLSearchParams(window.location.search);
    const queryData = {
        acftReg: query.get('acftReg'),
        acftType: query.get('acftType'),
        depAd: query.get('depAd'),
        arrAd: query.get('arrAd'),
    };

    const [displayCrewDialog, setDisplayCrewDialog] = useState(false);
    const [entryData, setEntryData] = useState<EntryInput>({
        depAd: queryData.depAd || null,
        arrAd: queryData.arrAd || null,
        offBlock: null,
        onBlock: null,

        aircraftType: queryData.acftType || null,
        aircraftRegistration: queryData.acftReg || null,
        picName: null,

        total: 0,
        dayTime: 0,
        nightTime: 0,
        sepVfr: 0,
        sepIfr: 0,
        meVfr: 0,
        meIfr: 0,
        picTime: 0,
        copilotTime: 0,
        multiPilotTime: 0,
        instructorTime: 0,
        dualTime: 0,
        simTime: 0,
        simInstructorTime: 0,
        landDay: 0,
        landNight: 0,
        includeInFt: true,
        remarks: null,

        crew: []
    })

    useEffect(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
    }, []);

    const navigate = useNavigate();
    const alert = useAlert();

    const addCrewMemberRef = useRef<HTMLInputElement>(null);
    const [crew, setCrew] = useState<User[]>([]);
    const [fstd, setFstd] = useState<boolean>(false);

    function addCrewMember() {
        let username = addCrewMemberRef.current?.value.trim();
        if (username?.startsWith("@")) {
            username = username.slice(1);
        }

        if (!username) {
            alert("Error", "Username cannot be empty.");
            return;
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

                    if (crew && crew.some((member) => member?.id === newMember.id)) {
                        return alert("Error", "This user is already assigned to the crew.");
                    }

                    setCrew((prev) => [...prev, newMember]);
                    setEntryData((prev) => ({
                        ...prev,
                        crew: [...prev.crew, newMember],
                    }));
                }
            })
            .catch((error) => {

                if (error.response?.status === 404 || error.response?.status === 500) {
                    return alert("Error", "User not found.");
                } else 
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

    function removeCrewMember(username: string) {
        if (!username) {
            alert("Error", "Username cannot be empty.");
            return;
        }
        setCrew((prev) => prev.filter((member) => member?.username !== username));
        setEntryData((prev) => ({
            ...prev,
            crew: prev.crew.filter((member) => member?.username !== username),
        }));
    }

    function parseTimeInput(time: string): number {
        const [hours, minutes] = time.split(":").map(Number);
        return (hours * 60 + minutes) / 60; // Convert to hours
    }

    function handleSubmit() {
        checkData();
        
        const total = timeDifference(entryData.offBlock as Date, entryData.onBlock as Date);

        const updated = { ...entryData, total, simTime: fstd ? total : 0 };
        setEntryData(updated);

        console.log("Updated entry:", updated); // ✅ This will now show correct `total`

        axios.post(API + "/users/logbook/manual", updated, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        })
        .then((response) => {
            if (response.status === 200) {
                alert("Success", "Logbook entry added successfully.");
                navigate("/me/logbook");
            } else {
                alert("Error", "Failed to add logbook entry. Please try again.");
            }
        })
        .catch((error) => {
            console.error("Error adding logbook entry:", error);
            alert("Error", "Failed to add logbook entry. Please try again.");
        });
    }

    function checkData() {

        if (!entryData.aircraftRegistration || entryData.aircraftRegistration.length < 3 || entryData.aircraftRegistration.length > 8) return alert("Error", "Aircraft registration must be between 3 and 8 characters long.");
        if (!entryData.aircraftType || entryData.aircraftType.length < 3 || entryData.aircraftType.length > 4) return alert("Error", "Aircraft type must be between 3 and 4 characters long.");

        if (!entryData.depAd || entryData.depAd.length !== 4) return alert("Error", "Departure airport ICAO code must be exactly 4 characters long.");
        if (!entryData.arrAd || entryData.arrAd.length !== 4) return alert("Error", "Arrival airport ICAO code must be exactly 4 characters long.");

        if (entryData.landDay === 0 && entryData.landNight === 0) return alert("Error", "At least one landing must be recorded.");
        if (!entryData.picName) return alert("Error", "PIC name must be added.");

        // check if offblock and onBlock are set and if type date
        if (!entryData.offBlock || !entryData.onBlock || !(entryData.offBlock instanceof Date) || !(entryData.onBlock instanceof Date)) {
            alert("Error", "Both off block and on block times must be set.");
            return;
        }

        if (entryData.offBlock.getTime() === entryData.onBlock.getTime()) return alert("Error", "Off block time cannot be the same as on block time.");
        if (entryData.offBlock >= entryData.onBlock) return alert("Error", "Off block time must be before on block time.");

        if (entryData.offBlock.getFullYear() !== entryData.onBlock.getFullYear()) return alert("Error", "Off block and on block times must be in the same year.");

        // Day + Night time must be less than or equal to total flight time
        const totalFlightTime = timeDifference(entryData.offBlock, entryData.onBlock);
        const dayTime = Number(entryData.dayTime) || 0;
        const nightTime = Number(entryData.nightTime) || 0;
        if (dayTime + nightTime > totalFlightTime) {
            return alert("Error", "Day and Night time cannot exceed total flight time.");
        }

        // You can only have single engine or multi engine, not both
        const sepTotal = Number(entryData.sepVfr) || 0 + Number(entryData.sepIfr) || 0;
        const meTotal = Number(entryData.meVfr) || 0 + Number(entryData.meIfr) || 0;
        if (sepTotal > 0 && meTotal > 0) {
            return alert("Error", "You can only have Single Engine or Multi Engine time, not both.");
        }

        if (sepTotal > totalFlightTime || meTotal > totalFlightTime) {
            return alert("Error", "Single Engine or Multi Engine time cannot exceed total flight time.");
        }

    }

    return (
        <>
            <Splash uppertext="Manual Input" title="Logbook"/>

            <div className="container mx-auto max-w-6xl p-4 lg:px-0">
                <div className="ring-2 ring-white/25 rounded-lg p-4 mb-4 space-x-4">
                    <Button 
                        styleType="small" 
                        type="button" 
                        onClick={() => navigate(-1)}
                        text={<><Undo2 className="h-4 w-4 inline-block" strokeWidth={2}/> <span>Go Back</span></>}
                    />

                    <Button 
                        styleType="small" 
                        type="button" 
                        onClick={checkData}
                        text={<><SearchCheck className="h-4 w-4 inline-block" strokeWidth={2}/> <span>Validate</span></>}
                    />
                </div>
                <div className="ring-2 ring-white/25 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-4">
                            <h3 className="font-medium text-white/75">
                                Information
                            </h3>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Aircraft Registration
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                type="text"
                                maxLength={8}
                                defaultValue={queryData.acftReg || ""}
                                onChange={(e) => {
                                    e.target.value = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
                                    e.target.value = e.target.value.toUpperCase();
                                    setEntryData({ ...entryData, aircraftRegistration: e.target.value });
                                }}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Aircraft Type
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                type="text"
                                minLength={3}
                                maxLength={4}
                                defaultValue={queryData.acftType || ""}
                                onChange={(e) => {
                                    e.currentTarget.value = e.currentTarget.value
                                    .toUpperCase()
                                    .replace(/[^A-Z0-9]/g, "");
                                    setEntryData({ ...entryData, aircraftType: e.currentTarget.value });
                                }}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Include in Flight Time 
                                <span title="Include this flight in the total flight time count">
                                    <InfoIcon className="h-4 w-4 inline-block text-white/75 cursor-help ml-1" strokeWidth={2} />
                                </span>
                            </label>
                            <select
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-3 py-2 focus:outline-none focus:ring-white/50"
                                defaultValue={"Y"}
                                onChange={(e) => {
                                    setEntryData({ ...entryData, includeInFt: (e.target as HTMLSelectElement).value === "Y" });
                                }}
                            >
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                FSTD 
                                <span title="Flight Simulator Training Device">
                                    <InfoIcon className="h-4 w-4 inline-block text-white/75 cursor-help ml-1" strokeWidth={2}/>
                                </span>
                            </label>
                            <select
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-3 py-2 focus:outline-none focus:ring-white/50"
                                defaultValue={"N"}
                                onInput={(e) => {
                                    setFstd((e.target as HTMLInputElement).value === "Y");
                                }}
                            >
                                <option value="Y">Yes</option>
                                <option value="N">No</option>
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">offblock</label>
                            <input
                                type="datetime-local"
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 scheme-dark"
                                onInput={(e) => {
                                    const value = (e.target as HTMLInputElement).value;
                                    setEntryData({ ...entryData, offBlock: applyUTC(value) });
                                }}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Departure
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                type="text"
                                defaultValue={queryData.depAd || ""}
                                minLength={4}
                                maxLength={4}
                                onChange={(e) => {
                                    e.target.value  = e.target.value.toUpperCase();
                                    setEntryData({ ...entryData, depAd: e.target.value });
                                }}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Arrival
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                type="text"
                                defaultValue={queryData.arrAd || ""}
                                minLength={4}
                                maxLength={4}
                                onChange={(e) => {
                                    e.target.value = e.target.value.toUpperCase();
                                    setEntryData({ ...entryData, arrAd: e.target.value });
                                }}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">onblock</label>
                            <input
                                type="datetime-local"
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 scheme-dark"
                                onInput={(e) => {
                                    const value = (e.target as HTMLInputElement).value;
                                    setEntryData({ ...entryData, onBlock: applyUTC(value) });
                                }}
                            />
                        </div>

                        <div className="lg:col-span-4">
                            <hr className="border-white/25 my-2 border-1 rounded-lg" />
                            <h3 className="font-medium text-white/75">
                                Time
                            </h3>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Pilot in Command
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 scheme-dark"
                                type="time"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, picTime: parseTimeInput(e.currentTarget.value) });
                                }}
                            />
                        </div> 

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Day
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 scheme-dark"
                                type="time"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, dayTime: parseTimeInput(e.currentTarget.value) });
                                }}
                            />
                        </div> 

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Night
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 scheme-dark"
                                type="time"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, nightTime: parseTimeInput(e.currentTarget.value) });
                                }}
                            />
                        </div> 

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Dual
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 scheme-dark"
                                type="time"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, dualTime: parseTimeInput(e.currentTarget.value) });
                                }}
                            />
                        </div> 

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Copilot
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 scheme-dark"
                                type="time"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, copilotTime: parseTimeInput(e.currentTarget.value) });
                                }}
                            />
                        </div> 
                        
                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Multipilot
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 scheme-dark"
                                type="time"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, multiPilotTime: parseTimeInput(e.currentTarget.value) });
                                }}
                            />
                        </div> 

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Instructor
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 scheme-dark"
                                type="time"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, instructorTime: parseTimeInput(e.currentTarget.value) });
                                }}
                            />
                        </div> 

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                FSTD Instructor 
                                <span title="Flight Simulator Training Device Instructor">
                                    <InfoIcon className="h-4 w-4 inline-block text-white/75 cursor-help ml-1" strokeWidth={2}/>
                                </span>
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 scheme-dark"
                                type="time"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, simInstructorTime: parseTimeInput(e.currentTarget.value) });
                                }}
                            />
                        </div> 

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Single Engine VFR
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 scheme-dark"
                                type="time"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, sepVfr: parseTimeInput(e.currentTarget.value) });
                                }}
                            />
                        </div> 

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Single Engine IFR
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 scheme-dark"
                                type="time"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, sepIfr: parseTimeInput(e.currentTarget.value) });
                                }}
                            />
                        </div> 

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Multi Engine VFR
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 scheme-dark"
                                type="time"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, meVfr: parseTimeInput(e.currentTarget.value) });
                                }}
                            />
                        </div> 

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Multi Engine IFR
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 scheme-dark"
                                type="time"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, meIfr: parseTimeInput(e.currentTarget.value) });
                                }}
                            />
                        </div> 

                        <div className="lg:col-span-4">
                            <hr className="border-white/25 my-2 border-1 rounded-lg" />
                            <h3 className="font-medium text-white/75">
                                Details
                            </h3>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Landings (Day)
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                type="number"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, landDay: parseInt(e.currentTarget.value) || 0 });
                                }}
                            />
                        </div> 

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Landings (Night)
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                type="number"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, landNight: parseInt(e.currentTarget.value) || 0 });
                                }}
                            />
                        </div> 

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                PIC Name
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                type="text"
                                onChange={(e) => {
                                    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                    setEntryData({ ...entryData, picName: e.target.value });
                                }}
                            />
                        </div> 

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Crew
                            </label>
                            <div
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 relative"
                            >
                                { crew && crew.length > 0 ? (
                                    crew.map((m: User, i) => {
                                    const fullName = m?.firstName
                                        ? `${m.firstName} ${m.lastName ?? ""}`
                                        : `@${m?.username}`;

                                    return (
                                        <div
                                        className={`relative inline-block hover:mr-2 ${
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
                                                    className="h-5 w-5 rounded-full inline-block ring-2 ring-neutral-600"
                                                />
                                                </Link>

                                                <div className="
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
                                                    z-10 shadow-xs">
                                                    <ProfileCard data={{
                                                        profilePictureUrl: m?.profilePictureUrl ?? '',
                                                        firstName: m?.firstName ?? null,
                                                        lastName: m?.lastName ?? '',
                                                        username: m?.username ?? null,
                                                        location: m?.location ?? null,
                                                        publicProfile: m?.publicProfile ?? false,
                                                        bio: m?.bio ?? null,
                                                        organizationId: m?.organizationId ?? '',
                                                        organizationRole: m?.organizationRole ?? '',
                                                        organization: m?.organization
                                                    }}/>
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
                                    onClick={() => setDisplayCrewDialog(!displayCrewDialog)}
                                >
                                    <Plus className="h-4 w-4 inline-block text-white cursor-pointer lg:mr-1" strokeWidth={2}/>
                                    <span className="text-xs hidden lg:inline-block">Add Crew</span>
                                </span>
                            </div>
                            
                        </div> 

                        <div className="flex flex-col lg:col-span-4">
                            <label className="text-sm text-white/75 mb-1">
                                Remarks
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                type="text"
                                onInput={(e) => {
                                    setEntryData({ ...entryData, remarks: e.currentTarget.value });
                                }}
                            />
                        </div> 
                    </div>

                    <div className="flex flex-row justify-end space-x-4 mt-4" id="button-row">      
                        <Button 
                        styleType="small" 
                        type="button" 
                        onClick={handleSubmit}
                        text={<><Plus className="h-4 w-4 inline-block" strokeWidth={2}/> <span>Submit</span></>}/>
                    </div>
                </div>
            </div>

            <Footer />

            {displayCrewDialog && (
                <div className="fixed inset-0 bg-black/50 z-3000 flex items-center justify-center">
                    <div className="bg-secondary p-4 rounded-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Edit flight crew</h2>
                        <ul>
                            {crew?.map((member, index) => (
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
                                onClick={() => setDisplayCrewDialog(!displayCrewDialog)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
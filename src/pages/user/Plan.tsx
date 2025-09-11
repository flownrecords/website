import { useState } from "react";

import Button from "../../components/general/Button";
import Splash from "../../components/general/Splash";
import Footer from "../../components/general/Footer";
import { useAuth } from "../../components/auth/AuthContext";
import { FolderInput, Undo2 } from "lucide-react";
import api, { ENDPOINTS } from "../../lib/api";
import { useNavigate } from "react-router";
import useAlert from "../../components/alert/useAlert";
import { parseDate, truncateString } from "../../lib/utils";

type SubmitPlan = {
    depAd: string | undefined;
    arrAd: string | undefined;
    route: string | undefined;
    alternate: string | undefined;
    cruiseLevel: string | undefined;
    cruiseSpeed: string | undefined;
    fuelPlan: string | undefined;
    etd: Date | undefined;
    eta: Date | undefined;
    remarks: string | undefined;
    weather: string | undefined;
    logbookEntryId: Number |  undefined;
}

export default function Plan() {

    const { user } = useAuth();
    const navigate = useNavigate();
    const alert = useAlert();

    const [speedType, setSpeedType] = useState("N");
    const [levelType, setLevelType] = useState("A");
    const [fuelType, setFuelType] = useState("L");

    const availableSpeedTypes = ["N", "K", "M"];
    const availableLevelTypes = ["A", "F", "S", "M"];
    const availableFuelTypes = ["L", "G", "K"];

    const entries = user?.logbookEntries?.filter((entry) => entry.plan === null).sort((a, b) => (new Date(b.date ?? 0).getTime()) - (new Date(a.date ?? 0).getTime())) || [];
    const queryEntry = new URLSearchParams(window.location.search).get("entry");
    const preSelectedEntry = queryEntry ? Number(queryEntry) : undefined;
    const [selectedEntry, setSelectedEntry] = useState(preSelectedEntry ?? 0);

    const [plan, updatePlan] = useState<SubmitPlan>({
        depAd: undefined,
        arrAd: undefined,
        route: undefined,
        alternate: undefined,
        cruiseLevel: undefined,
        cruiseSpeed: undefined,
        fuelPlan: undefined,
        etd: undefined,
        eta: undefined,
        remarks: undefined,
        weather: undefined,
        logbookEntryId: preSelectedEntry ?? 0,
    });

    function submitPlan() {
        console.log(plan);
        api.post(ENDPOINTS.USER.ADD_PLAN, plan, {
            requireAuth: true,
            navigate,
        })
        .then(async (response) => {
            if(response.meta.status === 200) {
                alert("Success", "Flight plan submitted successfully.");
                await new Promise(resolve => setTimeout(resolve, 1000));
                navigate(`/me/logbook/${selectedEntry}`);
            }
        })
        .catch((error) => {
            alert("Error", "There was an error submitting your flight plan. Please try again.");
            console.error("Error submitting plan:", error);
        });
    }

    const flightPlans = user?.logbookEntries?.filter((entry) => entry.plan);

    return (
        <>
            <Splash uppertext="Logbook" title="Flight Plan" />

            <div className="container mx-auto max-w-6xl p-4 xl:px-0">
                <div className="ring-2 ring-white/25 rounded-lg p-4">
                    <div className="grid lg:grid-cols-4 gap-4">
                        <Button
                            styleType="small"
                            text={
                                <>
                                    <Undo2 className="h-4 w-4 inline-block" strokeWidth={2} />
                                    <span className="ml-2">Go Back</span>
                                </>
                            }
                            to="/me"
                        />
                        <Button
                            styleType="small"
                            text={
                                <>
                                    <FolderInput className="h-4 w-4 inline-block mr-2" />
                                    Submit
                                </>
                            }
                            onClick={submitPlan}
                        />
                    </div>
                </div>

                <div className="ring-2 ring-white/25 rounded-lg p-4 mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col lg:col-span-4">
                            <label className="text-sm text-white/75 mb-1">
                                Logbook Entry
                            </label>
                            <select
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 lg:w-full"
                                value={selectedEntry}
                                onChange={(e) => {
                                    setSelectedEntry(Number(e.target.value));
                                    updatePlan((prev) => ({
                                        ...prev,
                                        logbookEntryId: Number(e.target.value),
                                    }));
                                }}
                            >
                                <option value="">Select entry...</option>

                                {entries?.map((entry) => (
                                    <option key={entry.id} value={entry.id}>
                                        {entry.aircraftRegistration} - {entry.offBlock ? new Date(entry.offBlock).toLocaleString("en-GB", { dateStyle: "short"}) : "Unknown"} {entry.depAd && entry.arrAd ? `- ${entry.depAd} to ${entry.arrAd}` : ""}
                                    </option>
                                ))}

                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Departure (ICAO)
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                type="text"
                                maxLength={4}
                                onChange={(e) => {
                                    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z/ ]/g, "") ;
                                    updatePlan((prev) => ({
                                        ...prev,
                                        depAd: e.target.value,
                                    }));
                                }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">ETD</label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                type="datetime-local"
                                style={{
                                    colorScheme: "dark",
                                }}
                                onChange={(e) => {
                                    updatePlan((prev) => ({
                                        ...prev,
                                        etd: new Date(e.target.value),
                                    }));
                                }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Cruise Speed
                            </label>
                            <div className="relative">
                                <span className="absolute left-0 h-full px-4 rounded-l-lg border-r-2 border-white/25 flex items-center justify-center cursor-pointer"
                                onClick={() => {
                                    availableSpeedTypes.indexOf(speedType) + 1 >= availableSpeedTypes.length ? setSpeedType(availableSpeedTypes[0]) : setSpeedType(availableSpeedTypes[availableSpeedTypes.indexOf(speedType) + 1]);
                                }}>
                                    <span className="w-4 text-center">{speedType}</span>
                                </span>

                                <input
                                    className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full text-right"
                                    type="text"
                                    maxLength={speedType === "M" ? 3 : 4}
                                    onChange={(e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, "");

                                        let digits = e.target.value;
                                        let formatted: string;
                                        if (speedType === "M") {
                                            formatted = `M${digits.padStart(3, "0")}`;
                                        } else {
                                        // pad to 4 digits
                                            formatted = `${speedType}${digits.padStart(4, "0")}`;
                                        }

                                        updatePlan((prev) => ({
                                            ...prev,
                                            cruiseSpeed: formatted,
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Cruise Altitude
                            </label>
                            <div className="relative">
                                <span className="absolute left-0 h-full px-4 rounded-l-lg border-r-2 border-white/25 flex items-center justify-center cursor-pointer"
                                onClick={() => {
                                    availableLevelTypes.indexOf(levelType) + 1 >= availableLevelTypes.length ? 
                                    setLevelType(availableLevelTypes[0]) : 
                                    setLevelType(availableLevelTypes[availableLevelTypes.indexOf(levelType) + 1]);
                                }}>
                                    <span className="w-4 text-center">{levelType}</span>
                                </span>

                                <input
                                    className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full text-right"
                                    type="text"
                                    maxLength={3}
                                    onInput={(e) => {
                                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");

                                        let digits = e.currentTarget.value;
                                        let formatted: string;
                                        if (levelType === "M") {
                                            formatted = `${levelType}${digits.padStart(4, "0")}`;
                                        } else {
                                            formatted = `${levelType}${digits.padStart(3, "0")}`;
                                        }

                                        updatePlan((prev) => ({
                                            ...prev,
                                            cruiseLevel: formatted,
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col lg:col-span-4">
                            <label className="text-sm text-white/75 mb-1">Route</label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                type="text"
                                onChange={(e) => {
                                    e.target.value = e.target.value
                                    .toUpperCase()
                                    .replace(/[^A-Z0-9/ ]/g, "")   // allow only A-Z, 0-9, / and space
                                    .replace(/\s{2,}/g, " ");      // collapse multiple spaces into one

                                    updatePlan((prev) => ({
                                        ...prev,
                                        route: e.target.value,
                                    }));
                                }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Destination (ICAO)
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                type="text"
                                maxLength={4}
                                onChange={(e) => {
                                    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z/]/g, "");
                                    updatePlan((prev) => ({
                                        ...prev,
                                        arrAd: e.target.value,
                                    }));
                                }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">ETA</label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 accent-accent"
                                type="datetime-local"
                                style={{
                                    colorScheme: "dark",
                                }}
                                onChange={(e) => {
                                    updatePlan((prev) => ({
                                        ...prev,
                                        eta: new Date(e.target.value),
                                    }));
                                }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Alternate (ICAO)
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                type="text"
                                maxLength={4}
                                onChange={(e) => {
                                    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z/]/g, "");
                                    updatePlan((prev) => ({
                                        ...prev,
                                        alternate: e.target.value,
                                    }));
                                }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">
                                Expected Fuel
                            </label>
                            <div className="relative">
                                <span className="absolute left-0 h-full px-4 rounded-l-lg border-r-2 border-white/25 flex items-center justify-center cursor-pointer"
                                onClick={() => {
                                    availableFuelTypes.indexOf(fuelType) + 1 >= availableFuelTypes.length ? setFuelType(availableFuelTypes[0]) : setFuelType(availableFuelTypes[availableFuelTypes.indexOf(fuelType) + 1]);
                                }}>
                                    <span className="w-6 text-center">{fuelType}</span>
                                </span>

                                <input
                                    className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full text-right"
                                    type="text"
                                    maxLength={7}
                                    onChange={(e) => {
                                        e.target.value =  e.target.value.replace(/[^0-9.,]/g, "").replace(/([.,]).*?\1/g, "$1");
                                        updatePlan((prev) => ({
                                            ...prev,
                                            fuelPlan: `${e.target.value} ${fuelType}`,
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col lg:col-span-4">
                            <label className="text-sm text-white/75 mb-1">
                                Remarks
                            </label>
                            <input
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                type="text"
                                maxLength={512}
                                onChange={(e) => {
                                    e.target.value = e.target.value
                                    .toUpperCase()
                                    .replace(/[^A-Z0-9/ ]/g, "")   // allow only A-Z, 0-9, / and space
                                    .replace(/\s{2,}/g, " "); 

                                    updatePlan((prev) => ({
                                        ...prev,
                                        remarks: e.target.value,
                                    }));
                                }}
                            />
                        </div>
                        <div className="flex flex-col lg:col-span-4">
                            <label className="text-sm text-white/75 mb-1">
                                Weather
                            </label>
                            <input
                                disabled={true}
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 opacity-25"
                                type="text"
                                maxLength={512}
                                onChange={(e) => {
                                    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9/ -]/g, "");
                                    updatePlan((prev) => ({
                                        ...prev,
                                        weather: e.target.value,
                                    }));
                                }}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="ring-2 ring-white/25 rounded-lg p-4 mt-4">
                    <h3 className="font-semibold text-white/75 mb-2">
                        Filed Flight Plans
                    </h3>
                    <div className="flex justify-between md:grid md:grid-cols-6 pb-2 px-4">
                            <span>Saved</span>

                            <span className="hidden md:block"> Registration </span>
                            <span className="block md:hidden"> Reg. </span>

                            <span className="hidden md:block"> Departure </span>
                            <span className="block md:hidden"> Dep. </span>

                            <span className="hidden md:block"> Arrival </span>
                            <span className="block md:hidden"> Arr. </span>

                            <span className="hidden md:block"> Route </span>

                        </div>
                        {
                            flightPlans?.sort((a, b) => ((a.plan?.createdAt as Date) > (b.plan?.createdAt as Date) ? -1 : 1))?.map((entry, index) => {
                                return <>
                                <div key={index} className={`
                                    flex justify-between md:grid md:grid-cols-6 py-4 px-4 items-center
                                    transition-all duration-150
                                    ${index % 2 === 0 ? "bg-primary hover:bg-primary/75" : "bg-gradient-to-br to-neutral-900 from-neutral-800 hover:from-neutral-800/75"} 
                                    rounded-lg cursor-pointer
                                    `}
                                    onClick={() => {
                                        navigate(`/me/logbook/${entry.id}`);
                                    }}
                                    > 
                                        <span className="text-xs md:text-sm text-white/50 hidden">
                                            {parseDate(entry.plan?.createdAt, false)}
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 md:block">
                                            {parseDate(entry.plan?.createdAt, true)}
                                        </span>

                                        <span className="text-xs md:text-sm text-white/50 ml-1">
                                            { entry.aircraftRegistration ?? "N/A" }
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 ml-1">
                                            { entry.plan?.depAd ?? entry.depAd ?? "N/A" }
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 ml-1">
                                            { entry.plan?.arrAd ?? entry.arrAd ?? "N/A" }
                                        </span>
                                        <span className="text-xs md:text-sm text-white/50 ml-1 hidden md:inline-block">
                                            { truncateString(entry.plan?.route ?? "", 16) ?? "N/A" }
                                        </span>
                                        <span className="hidden md:flex md:justify-end">
                                            <Button
                                                to={`/me/logbook/${entry.id}`}
                                                text="View"
                                                styleType="small"
                                                className="text-sm"
                                            />
                                        </span>
                                    </div>
                                </>
                            })
                        }
                </div>
            </div>

            <Footer />
        </>
    );
}

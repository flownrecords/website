import { useState } from "react";
import Splash from "../../components/general/Splash";

import Step1Guide1 from "../../assets/guides/guide_11.jpg";
import Step2Guide1 from "../../assets/guides/guide_12.jpg";
import Step3Guide1 from "../../assets/guides/guide_13.jpg";
import Step4Guide1 from "../../assets/guides/guide_14.jpg";

import Step1Guide2 from "../../assets/guides/guide_21.jpg";
import Step2Guide2 from "../../assets/guides/guide_22.jpg";
import Step3Guide2 from "../../assets/guides/guide_23.jpg";
import Step4Guide2 from "../../assets/guides/guide_24.jpg";
import Step5Guide2 from "../../assets/guides/guide_25.jpg";
import Step6Guide2 from "../../assets/guides/guide_26.jpg";

import { Link } from "react-router-dom";
import Footer from "../../components/general/Footer";
import { truncateString } from "../../lib/utils";

export default function Guides() {
    const [guidesOnDisplay, setGuidesOnDisplay] = useState<string[]>([]);

    const toggleGuide = (guide: string) => {
        if (guidesOnDisplay.includes(guide)) {
            setGuidesOnDisplay(guidesOnDisplay.filter((g) => g !== guide));
        } else {
            setGuidesOnDisplay([guide]);
        }
    };

    const stepStyle =
        "bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 rounded-lg ring-2 ring-white/25";

    const guides = [
        {
            id: "flightlogger",
            shortTitle: "Import FlightLogger logbook",
            title: "How to upload your FlightLogger logbook into FlownRecords",
            content: (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className={"flex flex-col " + stepStyle}>
                            <h3 className="text-lg font-semibold text-white">Step 1</h3>
                            <p className="text-white/50">
                                On your FlightLogger main page, click on your profile and then
                                "Logbook".
                            </p>
                            <img
                                src={Step1Guide1}
                                className="object-cover rounded-lg mt-2"
                                draggable="false"
                            />
                        </div>
                        <div className={"flex flex-col " + stepStyle}>
                            <h3 className="text-lg font-semibold text-white">Step 2</h3>
                            <p className="text-white/50">
                                At the "Logbook" page, select the timeframe you want to retrieve
                                your report from.
                            </p>
                            <img
                                src={Step2Guide1}
                                className="object-cover rounded-lg mt-2"
                                draggable="false"
                            />
                        </div>
                        <div className={"flex flex-col " + stepStyle}>
                            <h3 className="text-lg font-semibold text-white">Step 3</h3>
                            <p className="text-white/50">
                                Then click on the "Export" button and select the "CSV (Excel)"
                                format to get your report.
                            </p>
                            <img
                                src={Step3Guide1}
                                className="object-cover rounded-lg mt-2"
                                draggable="false"
                            />
                        </div>
                        <div className={"flex flex-col " + stepStyle}>
                            <h3 className="text-lg font-semibold text-white">Step 4</h3>
                            <p className="text-white/50">
                                At{" "}
                                <Link to="/me/logbook" className="text-accent font-medium">
                                    flownrecords.live/logbook
                                </Link>
                                , click on "Add Entry" and select "FlightLogger" as source, upload
                                your file and submit.
                            </p>
                            <img
                                src={Step4Guide1}
                                className="object-cover rounded-lg mt-2"
                                draggable="false"
                            />
                        </div>
                    </div>
                </>
            ),
        },
        {
            id: "airnavradar",
            shortTitle: "Import AirNav flight recording",
            title: "How to upload flight data from AirNav Radar to a logbook entry",
            content: (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className={"flex flex-col " + stepStyle}>
                            <h3 className="text-lg font-semibold text-white">Step 1</h3>
                            <p className="text-white/50">
                                On your FlightLogger main page, go to "My program".
                            </p>
                            <img
                                src={Step1Guide2}
                                className="object-cover rounded-lg mt-2"
                                draggable="false"
                            />
                        </div>
                        <div className={"flex flex-col " + stepStyle}>
                            <h3 className="text-lg font-semibold text-white">Step 2</h3>
                            <p className="text-white/50">
                                Select the flight you want to retrieve track data from.
                            </p>
                            <img
                                src={Step2Guide2}
                                className="object-cover rounded-lg mt-2"
                                draggable="false"
                            />
                        </div>
                        <div className={"flex flex-col " + stepStyle}>
                            <h3 className="text-lg font-semibold text-white">Step 3</h3>
                            <p className="text-white/50">At the lesson page, go to "Flight".</p>
                            <img
                                src={Step3Guide2}
                                className="object-cover rounded-lg mt-2"
                                draggable="false"
                            />
                        </div>
                        <div className={"flex flex-col " + stepStyle}>
                            <h3 className="text-lg font-semibold text-white">Step 4</h3>
                            <p className="text-white/50">
                                At "Flight Tracking" section, download the recording you want.
                            </p>
                            <img
                                src={Step4Guide2}
                                className="object-cover rounded-lg mt-2"
                                draggable="false"
                            />
                        </div>
                        <div className={"flex flex-col " + stepStyle}>
                            <h3 className="text-lg font-semibold text-white">Step 5</h3>
                            <p className="text-white/50">
                                On the logbook entry page, select "Add Flight Record".
                            </p>
                            <img
                                src={Step5Guide2}
                                className="object-cover rounded-lg mt-2"
                                draggable="false"
                            />
                        </div>
                        <div className={"flex flex-col " + stepStyle}>
                            <h3 className="text-lg font-semibold text-white">Step 6</h3>
                            <p className="text-white/50">
                                Select "AirNav Radar", upload the KML file then submit.
                            </p>
                            <img
                                src={Step6Guide2}
                                className="object-cover rounded-lg mt-2"
                                draggable="false"
                            />
                        </div>
                    </div>
                </>
            ),
        },
        {
            id: "logbookreport",
            title: "How to export your FlownRecords logbook",
        },
    ];

    return (
        <>
            <Splash uppertext="Introduction Guide" />

            <div className="container mx-auto max-w-6xl p-4 xl:px-0 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="ring-2 ring-white/25 rounded-lg p-4 min-h-auto lg:min-h-56">
                        <h1 className="font-semibold text-white/75">Available Guides</h1>
                        <div className="flex flex-col gap-2 mt-2 bg-secondary p-2 rounded-lg ring-2 ring-white/25">
                            {guides.map((guide) => {
                                return (
                                    <span
                                        className="cursor-pointer decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150"
                                        onClick={() => toggleGuide(guide.id)}
                                    >
                                        {truncateString(
                                            guide.shortTitle ? guide.shortTitle : guide.title,
                                            56,
                                        )}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                    <div className="ring-2 ring-white/25 rounded-lg p-4 col-span-1 lg:col-span-3">
                        {guidesOnDisplay.map((guide) => {
                            const foundGuide = guides.find((g) => g.id === guide);
                            if (!foundGuide || !foundGuide.content)
                                return (
                                    <div>
                                        <h1 className="font-semibold text-white mb-4">
                                            {foundGuide?.title
                                                ? foundGuide?.title
                                                : "Untitled Guide"}
                                        </h1>
                                        <span className="text-white/25">
                                            No content available for this guide.
                                        </span>
                                    </div>
                                );

                            return (
                                <div>
                                    <h1 className="font-semibold text-white mb-4">
                                        {foundGuide.title}
                                    </h1>
                                    <div>{foundGuide.content}</div>
                                </div>
                            );
                        })}
                        {guidesOnDisplay.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <h1 className="font-semibold text-white mb-4">No guide selected</h1>
                                <span className="text-white/25">
                                    Select a guide from the left to see its content.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}

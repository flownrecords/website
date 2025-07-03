import { Link } from "react-router-dom";
import Splash from "../../components/general/Splash";

export default function Home() {
    let highlightTimeout: ReturnType<typeof setTimeout> | null = null;

    function highlight() {
        const button = document.getElementById("get-started-button") as HTMLButtonElement;
        if (!button) return;

        button.classList.remove("highlight");

        void button.offsetWidth;

        button.classList.add("highlight");

        if (highlightTimeout) {
            clearTimeout(highlightTimeout);
        }

        highlightTimeout = setTimeout(() => {
            button.classList.remove("highlight");
            highlightTimeout = null;
        }, 6 * 1000);
    }

    return (
        <>
            <Splash/>

            <div className="flex gap-6 p-10 justify-center">
                <div
                onClick={highlight} 
                title="Personalize your dashboard and manage your pilot logbook all in one place."
                className="relative w-72 h-64 md:h-80 bg-gradient-to-br from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-900 rounded-lg p-2 md:p-6 text-white overflow-hidden ring-2 ring-white/25 transition duration-500">
                    <div className="text-lg md:text-2xl font-semibold z-10 relative">Create Your Profile</div>
                    <div className="absolute text-[14rem] md:text-[18rem] h-[16rem] md:h-[20rem] font-bold text-white/5 bottom-2 left-4">1</div>
                </div>

                <div 
                onClick={highlight} 
                title="Import logs from FlightLogger and other sources."
                className="relative w-72 h-64 md:h-80 bg-gradient-to-br from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-900 rounded-lg p-2 md:p-6 text-white overflow-hidden ring-2 ring-white/25 transition duration-500">
                    <div className="text-lg md:text-2xl font-semibold z-10 relative">Upload Your Flights</div>
                    <div className="absolute text-[14rem] md:text-[18rem] h-[16rem] md:h-[20rem] font-bold text-white/5 bottom-2 left-4">2</div>
                </div>

                <div 
                onClick={highlight} 
                title="Dive into charts, trends, and milestones. Visualize your flight experience."
                className="relative w-72 h-64 md:h-80 bg-gradient-to-br from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-900 rounded-lg p-2 md:p-6 text-white overflow-hidden ring-2 ring-white/25 transition duration-500">
                    <div className="text-lg md:text-2xl font-semibold z-10 relative">See Your Progress</div>
                    <div className="absolute text-[14rem] md:text-[18rem] h-[16rem] md:h-[20rem] font-bold text-white/5 bottom-2 left-4">3</div>
                </div>
            </div>

            <div className="flex flex-col items-center mt-2 md:mt-10 mb-8">
                <Link to="/getstarted">
                    <button
                    id="get-started-button" 
                    className="cursor-pointer bg-gradient-to-t from-neutral-900 to-neutral-800 hover:opacity-75 text-white font-semibold py-2 px-4 rounded-lg ring-2 ring-white/25 transition duration-150">
                        Get Started
                    </button>
                </Link>
            </div>
        </>
    )
}
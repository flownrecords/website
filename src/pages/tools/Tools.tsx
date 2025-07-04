import { Link } from "react-router-dom"
import Splash from "../../components/general/Splash";

export default function Tools() {
    return (
        <>
            <Splash uppertext="Tools"/>

            <div className="container mx-auto max-w-6xl p-4 lg:px-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <Link to="/planner" className="rounded-lg overflow-hidden ring-2 ring-white/25 hover:opacity-75 transition-all duration-150">
                        <img src="https://placehold.co/1920x720" className="lg:max-h-64"/>
                        <div className="p-4">
                            <h1 className="font-semibold text-white text-xl flex items-center">
                                Flight Planner <span className="text-xs ring-1 ring-accent bg-accent/25 py-0.5 px-2 rounded-xl ml-2">WIP</span>
                            </h1>
                            <p className="text-white/50 text-md">
                                A tool to help you plan your flights, including route planning, fuel calculations, and more.
                            </p>
                        </div>
                    </Link>

                    <Link to="/questions" className="rounded-lg overflow-hidden ring-2 ring-white/25 hover:opacity-75 transition-all duration-150">
                        <img src="https://placehold.co/1920x720" className="lg:max-h-64"/>
                        <div className="p-4">
                            <h1 className="font-semibold text-white text-xl flex items-center">
                                Questions Database <span className="text-xs ring-1 ring-accent bg-accent/25 py-0.5 px-2 rounded-xl ml-2">WIP</span>
                            </h1>
                            <p className="text-white/50 text-md">
                                A comprehensive database of questions and answers to help you prepare for your flight tests and exams.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}
import { Link } from "react-router-dom";
import Splash from "../../components/general/Splash";

export default function Home() {
    return (
        <>
            <Splash/>

            <div className="flex gap-6 p-10 justify-center">
                <div className="relative w-72 h-64 md:h-80 bg-gradient-to-br from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-900 rounded-lg p-2 md:p-6 text-white overflow-hidden ring-2 ring-white/25 transition duration-500">
                    <div className="text-lg md:text-2xl font-semibold z-10 relative">Setup Your Account</div>
                    <div className="absolute text-[14rem] md:text-[18rem] h-[16rem] md:h-[20rem] font-bold text-white/5 bottom-2 left-4">1</div>
                </div>

                <div className="relative w-72 h-64 md:h-80 bg-gradient-to-br from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-900 rounded-lg p-2 md:p-6 text-white overflow-hidden ring-2 ring-white/25 transition duration-500">
                    <div className="text-lg md:text-2xl font-semibold z-10 relative">Import Your Data</div>
                    <div className="absolute text-[14rem] md:text-[18rem] h-[16rem] md:h-[20rem] font-bold text-white/5 bottom-2 left-4">2</div>
                </div>

                <div className="relative w-72 h-64 md:h-80 bg-gradient-to-br from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-900 rounded-lg p-2 md:p-6 text-white overflow-hidden ring-2 ring-white/25 transition duration-500">
                    <div className="text-lg md:text-2xl font-semibold z-10 relative">Visualize it</div>
                    <div className="absolute text-[14rem] md:text-[18rem] h-[16rem] md:h-[20rem] font-bold text-white/5 bottom-2 left-4">3</div>
                </div>
            </div>

            <div className="flex flex-col items-center mt-2 md:mt-10 mb-8">
                <Link to="/register">
                    <button className="cursor-pointer bg-gradient-to-t from-neutral-900 to-neutral-800 hover:opacity-75 text-white font-semibold py-2 px-4 rounded-lg ring-2 ring-white/25 transition duration-150">
                        Get Started
                    </button>
                </Link>
            </div>
        </>
    )
}
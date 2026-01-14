import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";

import Icon from "../../../assets/images/icon.png";
import { AlignRight, Bell, Book, BookOpenText, LogOut, Play } from "lucide-react";
import Notifications from "./Notifications";

export default function Navbar() {
    const [mobileMenu, toggleMobileMenu] = useState(false);
 
    const { user, logout } = useAuth();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    

    return (
        <>
            <nav className="bg-secondary px-4 py-2 m-4 rounded-lg ring-2 ring-white/25 relative z-50">
                <div className="hidden md:flex container mx-auto justify-between items-center">
                    {/* ... (Logo and Main Links - Unchanged) ... */}
                    <div className="flex space-x-4 items-center">
                        <Link to="/" className="text-lg font-semibold flex justify-center items-center space-x-2">
                            <img src={Icon} alt="Flown Records" className="h-6" draggable="false" />{" "}
                            <span>Flown Records</span>
                        </Link>
                        <ul className="flex space-x-6 mx-10">
                            <li><Link to={user ? "/me" : "/getstarted"} className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">Get started</Link></li>
                            <li><Link to="/guides" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">Guides</Link></li>
                            <li><Link to="/about" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">About Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <ul className="flex space-x-6 items-center">
                            {/* Notification Bell Wrapper */}
                            <Notifications />

                            {/* User Profile & Auth (Unchanged) */}
                            {user ? (
                                <>
                                    <li className="flex items-center">
                                        <Link to="/me" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150 capitalize flex items-center">
                                            <img src={user?.profilePictureUrl ?? "https://placehold.co/512x512"} draggable="false" className="rounded-full h-5 w-5 mx-2 object-cover" alt="User profile icon" />
                                            {user?.firstName ?? `@${user.username}`}
                                        </Link>
                                    </li>
                                    <li className="flex items-center">
                                        <button onClick={logout} className="decoration-second-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150 cursor-pointer">Logout</button>
                                    </li>
                                </>
                            ) : (
                                <li className="flex items-center">
                                    <Link to="/login" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-15">Login</Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Mobile Menu (Kept as is) */}
                <div className="flex md:hidden container mx-auto justify-between items-center">
                    <Link to="/" className="text-lg font-semibold">
                        <img src={Icon} alt="Flown Records Logo" className="h-6 w-6 inline-block" />
                    </Link>
                    <button className="cursor-pointer text-white focus:outline-none hover:opacity-75 transition duration-150" onClick={() => toggleMobileMenu(!mobileMenu)}>
                        <AlignRight className={`h-6 w-6 ${mobileMenu ? "ring-2 ring-white/25 rounded-lg p-1" : ""} transition-all duration-300`} />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Content (Unchanged) */}
            {mobileMenu && (
                <div className="block md:hidden p-4 m-4 bg-secondary rounded-lg ring-2 ring-white/25">
                     <ul className="container mx-auto flex flex-col space-y-4">
                        <li>
                            <Link to={user ? "/me" : "/getstarted"} className="flex items-center decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">
                                {
                                    user ? 
                                        <>
                                            <img src={user?.profilePictureUrl ?? "https://placehold.co/512x512"} draggable="false" className="rounded-full h-4 w-4 mr-2 object-cover" alt="User profile icon" />
                                            {user?.firstName ?? `@${user?.username}`}
                                        </> : 
                                        <>
                                            <Play className="h-4 w-4 mr-2" />
                                            Get Started
                                        </>
                                }
                            </Link>
                        </li>
                        <li>
                            <Link to="/guides" className="flex items-center decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">
                                <BookOpenText className="h-4 w-4 mr-2" />
                                Guides
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className="flex items-center decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">
                                <Book className="h-4 w-4 mr-2" />
                                About Us
                            </Link>
                        </li>
                        <li>
                             <Link to="/notifications" className="flex items-center decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">
                                <Bell className="h-4 w-4 mr-2" />
                                Notifications
                            </Link>
                        </li>
                        {
                            user ? 
                            <>
                                <li>
                                    <button onClick={logout} className="flex items-center decoration-second-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </button>
                                </li>
                            </> : <></>
                        }
                     </ul>
                </div>
            )}
        </>
    );
}
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

import Icon from "../../assets/images/icon.png";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
    const [mobileMenu, toggleMobileMenu] = useState(false);
    const [toolsOpen, setToolsOpen] = useState(false);

    const { user, logout } = useAuth();

    return (
        <>
            <nav className="bg-secondary px-4 py-2 m-4 rounded-lg ring-2 ring-white/25">
                <div className="hidden md:flex container mx-auto justify-between items-center">
                    <div className="flex space-x-4 items-center">
                        <Link to="/" className="text-lg font-semibold">
                            Flown Records
                        </Link>

                        <ul className="flex space-x-6 mx-10">
                            <li>
                                <Link
                                    to={user ? "/me" : "/getstarted"}
                                    className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150"
                                >
                                    Get started
                                </Link>
                            </li>
                            <li
                                className="relative hidden"
                                onMouseEnter={() => setToolsOpen(true)}
                                onMouseLeave={() => setToolsOpen(false)}
                            >
                                <Link
                                    to="/tools"
                                    className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150 inline-flex items-center"
                                >
                                    Tools <ChevronDown className="ml-1 mt-0.5 h-4 w-4" />
                                </Link>

                                {toolsOpen && (
                                    <ul className="absolute top-full left-0 w-48 bg-secondary shadow-xl rounded-lg ring-2 ring-neutral-600 z-50 overflow-hidden p-4 space-y-2">
                                        <li>
                                            <Link
                                                to="/questions"
                                                className="flex items-center decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150"
                                            >
                                                Question Database
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/planner"
                                                className="flex items-center decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150"
                                            >
                                                Flight Planner
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150"
                                >
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        {user ? (
                            <ul className="flex space-x-6">
                                <li>
                                    <Link
                                        to="/me"
                                        className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150 capitalize flex items-center"
                                    >
                                        <img
                                            src={
                                                user?.profilePictureUrl ??
                                                "https://placehold.co/512x512"
                                            }
                                            draggable="false"
                                            className="rounded-full h-5 w-5 mx-2 object-cover"
                                            alt="User profile icon"
                                        />
                                        {user?.firstName ?? `@${user.username}`}
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={logout}
                                        className="decoration-second-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150 cursor-pointer"
                                    >
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        ) : (
                            <ul className="flex space-x-4">
                                <li>
                                    <Link
                                        to="/login"
                                        className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150"
                                    >
                                        Login
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>

                <div className="flex md:hidden container mx-auto justify-between items-center">
                    <Link to="/" className="text-lg font-semibold">
                        <img src={Icon} alt="Flown Records Logo" className="h-6 w-6 inline-block" />
                    </Link>

                    <button
                        className="cursor-pointer text-white focus:outline-none hover:opacity-75 transition duration-150"
                        onClick={() => toggleMobileMenu(!mobileMenu)}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16m-7 6h7"
                            />
                        </svg>
                    </button>
                </div>
            </nav>

            {mobileMenu && (
                <div className="block md:hidden p-4 m-4 bg-secondary rounded-lg ring-2 ring-white/25">
                    <ul className="container mx-auto flex flex-col space-y-4">
                        <li>
                            <Link
                                to="/getstarted"
                                className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150"
                            >
                                Get started
                            </Link>
                        </li>
                        <li className="hidden">
                            <Link
                                to="/tools"
                                className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150"
                            >
                                Tools
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/about"
                                className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150"
                            >
                                About Us
                            </Link>
                        </li>
                        {user ? (
                            <li>
                                <Link
                                    to="/me"
                                    className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150 capitalize flex items-center"
                                >
                                    {user?.profilePictureUrl && (
                                        <img
                                            src={user.profilePictureUrl}
                                            draggable="false"
                                            className="rounded-full h-5 w-5 mr-2 object-cover"
                                        />
                                    )}
                                    {user?.firstName ?? `@${user.username}`}
                                </Link>
                            </li>
                        ) : (
                            <li>
                                <Link
                                    to="/login"
                                    className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150"
                                >
                                    Login
                                </Link>
                            </li>
                        )}
                        {user && (
                            <li>
                                <button
                                    onClick={logout}
                                    className="decoration-second-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150 cursor-pointer"
                                >
                                    Logout
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </>
    );
}

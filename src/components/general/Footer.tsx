import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <>
            <footer className="bg-secondary p-4 mt-30 w-full block lg:hidden">
                <div className="container mx-auto">
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">Flown Records</h2>
                        <p className="text-sm text-white/25">
                            © {new Date().getFullYear()} Flown Records. All rights reserved.
                        </p>

                        <div className="flex flex-row space-x-4 mt-4">
                            <a
                                href="https://github.com/flownrecords"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg
                                    className="h-6 w-6"
                                    role="img"
                                    viewBox="0 0 24 24"
                                    fill="#fff"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <title>GitHub</title>
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                            </a>
                            <img
                                className="rounded-sm"
                                src="https://img.shields.io/github/package-json/v/flownrecords/website?style=flat-square&color=313ED8"
                                draggable="false"
                                alt="Github Repository Version"
                            />
                        </div>
                    </div>
                </div>
            </footer>

            <footer className="bg-secondary py-10 mt-30 px-4 hidden lg:block">
                <div className="container mx-auto">
                    <div className="grid grid-cols-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-2">Flown Records</h2>
                            <p className="text-sm text-white/25">
                                © {new Date().getFullYear()} Flown Records. All rights reserved.
                            </p>

                            <div className="flex flex-row space-x-4 mt-4">
                                <a
                                    href="https://github.com/flownrecords"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        role="img"
                                        viewBox="0 0 24 24"
                                        fill="#fff"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <title>GitHub</title>
                                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                    </svg>
                                </a>
                                <img
                                    className="rounded-sm"
                                    src="https://img.shields.io/github/package-json/v/flownrecords/website?style=flat-square&color=313ED8"
                                    draggable="false"
                                    alt="Github Repository Version"
                                />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-2 h-8">Links</h2>
                            <ul className="text-md text-white/25 transition-all duration-150">
                                <li>
                                    <Link to="/privacy" className="hover:text-white">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="hover:text-white">
                                        Terms of Service
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/about" className="hover:text-white">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="hover:text-white">
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-2 h-8"></h2>
                            <ul className="text-md text-white/25 transition-all duration-150">
                                <li>
                                    <Link to="/organizations" className="hover:text-white">
                                        Organizations
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/navdata" className="hover:text-white">
                                        Navdata
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="https://github.com/flownrecords/website/issues/new/choose"
                                        target="_blank"
                                        className="hover:text-white"
                                    >
                                        Report Issue
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="https://github.com/sponsors/jurgenjacobsen"
                                        className="hover:text-white"
                                    >
                                        Sponsor
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-2 h-8"></h2>
                            <ul className="text-md text-white/25 transition-all duration-150">
                                <li>
                                    <Link
                                        to="/faq"
                                        className="hover:text-white"
                                        title="Frequently Asked Questions"
                                    >
                                        FAQ
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/downloads"
                                        className="hover:text-white"
                                        title="Frequently Asked Questions"
                                    >
                                        Downloads
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}

import { useState, useRef, useEffect } from "react";

import Splash from "../../components/general/Splash";
import { Link, useNavigate } from "react-router-dom";
import useAlert from "../../components/alert/useAlert";
import { useAuth } from "../../components/auth/AuthContext";
import Footer from "../../components/general/Footer";
import api, { ENDPOINTS } from "../../lib/api";

type Role = {
    id: string;
    label: string;
};

type Organization = {
    id: string;
    name: string;
    logo?: string;
};

export default function Register() {
    const { login, user } = useAuth();
    const alert = useAlert();
    const navigate = useNavigate();

    const [termsAccepted, setTermsAccepted] = useState(false);

    const name = useRef<HTMLInputElement>(null);
    const username = useRef<HTMLInputElement>(null);
    const email = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);
    const role = useRef<HTMLSelectElement>(null);
    const organization = useRef<HTMLSelectElement>(null);
    const terms = useRef<HTMLInputElement>(null);

    const roles: Role[] = [
        { id: "PILOT", label: "Pilot" },
        { id: "OTHER", label: "Other" },
        { id: "STUDENT", label: "Student Pilot" },
        { id: "GUEST", label: "Guest" },
        { id: "CFI", label: "Chief Flight Instructor" },
        { id: "CTKI", label: "Chief Theoretical Knowledge Instructor" },
        { id: "SM", label: "Safety Manager" },
        { id: "OPS", label: "Operations" },
        { id: "FI", label: "Flight Instructor" },
        { id: "TKI", label: "Theoretical Knowledge Instructor" },
        { id: "MAIN", label: "Maintenance" },
        { id: "OFFICE", label: "Office" },
        { id: "SUPERVISOR", label: "Supervisor" },
        { id: "ADMIN", label: "Administrator" },
        { id: "MANAGER", label: "Manager" },
    ];

    const [organizations, setOrganizations] = useState<Organization[]>([
        { id: "none", name: "None" },
    ]);

    useEffect(() => {
        if (user) navigate("/me");

        api.get(ENDPOINTS.ORGS.LIST).then((res) => {
            setOrganizations([{ id: "none", name: "None" }, ...res]);
        });

        const handleChange = () => {
            setTermsAccepted(terms.current?.checked ?? false);
        };

        const el = terms.current;
        el?.addEventListener("change", handleChange);
        return () => el?.removeEventListener("change", handleChange);
    }, [user]);

    async function signUp() {
        if (
            !name.current ||
            !username.current ||
            !email.current ||
            !password.current ||
            !role.current
        ) {
            alert("Error", "Please fill in all fields.");
            return;
        }

        if (!termsAccepted) {
            alert("Error", "You must accept the terms and conditions.");
            return;
        }

        const formData = {
            name: name.current.value,
            username: username.current.value,
            email: email.current.value,
            password: password.current.value,
            role: role.current.value,
            organization:
                !organization.current?.value || organization.current?.value === "none"
                    ? undefined
                    : organization.current?.value,
        };

        if (!formData.name || !formData.username || !formData.email || !formData.password) {
            return;
        }

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        if (!isValidEmail) return;

        if (formData.password.length < 8 || formData.password.length > 18) return;

        api.post(ENDPOINTS.USER.SIGNUP, formData, {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                const token = response.accessToken;
                if (!token) {
                    return alert(
                        "Error",
                        "An error occurred while creating your account. Please try again later. [1]",
                    );
                }

                if (response.meta.status === 200) {
                    login(token);
                    return navigate("/me");
                } else {
                    return alert(
                        "Error",
                        "An error occurred while creating your account. Please try again later. [2]",
                    );
                }
            })
            .catch((error) => {
                console.error("Error sending registration data:", error);
                alert(
                    "Error",
                    "An error occurred while submitting your registration. Please try again later. [3]",
                );
            });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        signUp();
    }

    return (
        <>
            <Splash />

            <div className="container mx-auto max-w-4xl p-4 lg:px-0">
                <form
                    className="grid grid-cols-1 xl:grid-cols-2 gap-4"
                    autoComplete="off"
                    spellCheck="false"
                    autoCorrect="off"
                    autoCapitalize="off"
                    onSubmit={handleSubmit}
                >
                    <div>
                        <label className="inline-block text-sm text-white/75 mb-1">name</label>
                        <input
                            autoComplete="new-name"
                            ref={name}
                            className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full"
                            type="text"
                            required
                        />
                    </div>

                    <div>
                        <label className="inline-block text-sm text-white/75 mb-1">username</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                                @
                            </span>
                            <input
                                autoComplete="new-username"
                                ref={username}
                                type="text"
                                required
                                max={14}
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 pl-10 w-full focus:outline-none focus:ring-white/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="inline-block text-sm text-white/75 mb-1">email</label>
                        <input
                            autoComplete="new-email"
                            ref={email}
                            className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full"
                            type="email"
                            required
                        />
                    </div>

                    <div>
                        <label className="inline-block text-sm text-white/75 mb-1">password</label>
                        <input
                            autoComplete="new-password"
                            ref={password}
                            className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full"
                            type="password"
                            minLength={8}
                            maxLength={18}
                            required
                        />
                    </div>

                    <hr className="col-span-1 lg:col-span-2 mt-2 h-0 border-t-2 border-white/25 rounded-sm" />

                    <div>
                        <label className="inline-block text-sm text-white/75 mb-1">
                            organization
                        </label>
                        <select
                            ref={organization}
                            className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full"
                            required
                        >
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id}>
                                    {org.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="inline-block text-sm text-white/75 mb-1">role</label>
                        <select
                            ref={role}
                            className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full"
                            required
                        >
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-1 lg:col-span-2 flex justify-start lg:justify-end items-center space-x-2">
                        <div className="flex items-center cursor-pointer relative">
                            <input
                                ref={terms}
                                type="checkbox"
                                id="terms"
                                required
                                className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded border border-white/25 checked:bg-second-accent/25 checked:border-second-accent"
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
                        <label htmlFor="terms" className="text-sm text-white/75">
                            I agree to the{" "}
                            <Link to="#" className="text-second-accent">
                                terms and conditions
                            </Link>
                        </label>
                    </div>

                    <div className="col-span-1 lg:col-span-2 block lg:flex lg:justify-end">
                        <button
                            type="submit"
                            className={`
                        ${!termsAccepted ? "opacity-50 cursor-default hover:opacity-50" : "cursor-pointer hover:opacity-75"}
                            inline-block
                            bg-gradient-to-t 
                            from-neutral-900 to-neutral-800 
                            transition duration-150
                            text-white
                            py-2 px-6 
                            rounded-md text-center
                            ring-2 ring-white/25
                            w-full lg:w-auto
                        `}
                            disabled={!termsAccepted}
                        >
                            Create my account
                        </button>
                    </div>
                </form>
            </div>

            <Footer />
        </>
    );
}

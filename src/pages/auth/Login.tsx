import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import Button from "../../components/general/Button";
import Splash from "../../components/general/Splash";
import useAlert from "../../components/alert/useAlert";
import { useAuth } from "../../components/auth/AuthContext";
import Footer from "../../components/general/Footer";

export default function Login() {
    const API = import.meta.env.VITE_API_URL;

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const alert = useAlert();
    const navigate = useNavigate();

    const { login } = useAuth();

    useEffect(() => {
        autoLogin();
    }, []);

    async function autoLogin() {
        const token = localStorage.getItem("accessToken");
        if (!token) return console.log("No access token found, skipping auto-login.");
        try {
            const request = await axios
                .get(API + "/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .catch((e) => {
                    if (e.response?.status === 401) {
                        console.log("Unauthorized access, token may be invalid.");
                        localStorage.removeItem("accessToken");
                        return;
                    }
                });

            if (request) {
                login(token);
                return navigate("/me");
            }
        } catch (e) {
            console.error("Error during auto-login:", e);
            alert(
                "Error",
                "An error occurred while trying to log in automatically. Please try again later.",
            );
            return;
        }
    }

    function isEmail(input: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); // prevent default form reload

        if (!identifier || !password) {
            return alert("Error", "Please fill in both fields.");
        }

        const loginType = isEmail(identifier) ? "email" : "username";
        const url = API + `/auth/signin?type=${loginType}`;

        const payload = { identifier, password };

        axios
            .post(url, payload)
            .then((response) => {
                if (response.status === 200) {
                    const token = response.data.accessToken;
                    if (!token) {
                        alert("Login failed", "No token received.");
                        return;
                    }

                    login(token);
                    return navigate("/me");
                } else {
                    alert("Login Failed", response.data.message);
                }
            })
            .catch((error) => {
                if (error.response?.status === 400) {
                    console.error("Bad request:", error);
                    return alert("Error", "Invalid email or password. Please try again.");
                }
                console.error("Login error:", error);
                alert("Error", "An error occurred while trying to log in.");
            });
    }

    return (
        <>
            <Splash uppertext="Login into" />

            <div className="container mx-auto max-w-4xl p-4 lg:px-0">
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                    autoComplete="off"
                    spellCheck="false"
                    autoCorrect="off"
                    autoCapitalize="off"
                >
                    <div className="flex flex-col">
                        <label className="text-sm text-white/75 mb-1">email / username</label>
                        <input
                            type="text"
                            autoComplete="identifier"
                            className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm text-white/75 mb-1">password</label>
                        <input
                            type="password"
                            autoComplete="current-password"
                            className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <Button text="Login" type="submit" />
                        <Button text="Create an account" to="/getstarted" />
                    </div>
                </form>

                <div className="my-4">
                    Forgot your password?{" "}
                    <Link
                        to="#"
                        className="text-accent font-semibold hover:underline hover:opacity-75 transition-all duration-150"
                    >
                        Click here
                    </Link>
                </div>
            </div>

            <br/><br/>
            <Footer />
        </>
    );
}

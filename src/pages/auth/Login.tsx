import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/general/Button";
import Splash from "../../components/general/Splash";
import useAlert from "../../components/alert/useAlert";
import { useAuth } from "../../components/auth/AuthContext";
import Footer from "../../components/general/Footer";
import api, { ENDPOINTS } from "../../lib/api";

export default function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const alert = useAlert();
    const navigate = useNavigate();

    const { login, user } = useAuth();

    useEffect(() => {
        if (user) navigate("/me");
    }, [user]);

    function isEmail(input: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!identifier || !password) {
            return alert("Error", "Please fill in both fields.");
        }

        const loginType = isEmail(identifier) ? "email" : "username";
        const payload = { identifier, password };

        api.post(ENDPOINTS.USER.SIGNIN, payload, {
            requireAuth: false,
            navigate,
            params: {
                type: loginType,
            },
        })
            .then((response) => {
                if (response.meta.status === 200) {
                    const token = response.accessToken;
                    if (!token) {
                        alert("Login failed", "No token received.");
                        return;
                    }

                    login(token);
                    return navigate("/me");
                } else {
                    alert("Login Failed", response.message);
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
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-24"
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

            <br />
            <br />
            <Footer />
        </>
    );
}

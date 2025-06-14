import { useRef } from "react";
import { Link } from "react-router-dom";

import Button from "../../components/general/Button";
import Splash from "../../components/general/Splash";
import useAlert from "../../components/alert/useAlert";

export default function Login() {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const alert = useAlert();

    function signIn() {
        if(!emailRef?.current?.value || !passwordRef?.current?.value) {
            console.error("Email or password input reference is null.");
            alert("Error", "Please fill in both email and password fields.");
            return;
        }
    }

    return (
        <>
            <Splash uppertext="Login into"/>
            
            <div className="container mx-auto lg:max-w-[50%]">
                <form 
                className="grid grid-cols-1 md:grid-cols-2 gap-4 " 
                onSubmit={signIn} 
                autoComplete="off" spellCheck="false" autoCorrect="off" autoCapitalize="off">
                    <div className="flex flex-col">
				        <label className="text-sm text-white/75 mb-1">email</label>
                        <input
                            className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                            ref={emailRef}
                            type="email"
                        />
			        </div>

                    <div className="flex flex-col">
                        <label className="text-sm text-white/75 mb-1">password</label>
                        <input
                            className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                            ref={passwordRef}
                            type="password"
                            minLength={8}
                            maxLength={18}
                        />
                    </div>
                </form>

                <div className="my-4">
                    Forgot your password? <Link to="#" className="text-accent font-semibold hover:underline hover:opacity-75 transition-all duration-150">Click here</Link>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <Button text="Create an account"/>
                    <Button text="Login" to="#" onClick={signIn}/>
                </div>
            </div>
        </>
    )
}
import { useState, useEffect } from "react"
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import ErrorAlert from "../components/ErrorAlert"

export default function Register() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    let [username, setUsername] = useState("");
    let [email, setEmail] = useState("");
    let [name, setName] = useState("");
    let [password, setPassword] = useState("");
    let [confirmPass, setConfirmPass] = useState("");
    const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB'));

    useEffect(() => {
        const tick = setInterval(() => setTime(new Date().toLocaleTimeString('en-GB')), 1000);
        return () => clearInterval(tick);
    }, []);

    const handleSubmit = async (evt) => {
        setError("");
        evt.preventDefault();
        setIsLoading(true);
        try {

            if (!username || !password || !email || !confirmPass || !name) {
                throw new Error("All the info is required");
            }

            if (password != confirmPass) {
                throw new Error("Passwords dont match");
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error("invalid email address");
            }

            const body = {
                username,
                password,
                email,
                name,
            }

            const response = await axios.post("/api/auth/register", body);
            console.log(response.data);
            localStorage.setItem('username', response.data.username)
            navigate('/dashboard');

        } catch (err) {
            if (err.response) {
                setError(err.response.data.message)
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleUsernameChange = (evt) => { setError(""); setUsername(evt.target.value); }
    const handleNameChange = (evt) => { setError(""); setName(evt.target.value); }
    const handleEmailChange = (evt) => { setError(""); setEmail(evt.target.value); }
    const handleConfirmPassChange = (evt) => { setError(""); setConfirmPass(evt.target.value); }
    const handlePasswordChange = (evt) => { setError(""); setPassword(evt.target.value); }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center px-6 py-12">

            {error && <ErrorAlert error={error} onClose={() => setError("")} />}

            {/* Max width container */}
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#A8FF3E] font-mono text-2xl">▣</span>
                        <h1 className="text-3xl font-black tracking-tighter text-[#A8FF3E] font-mono">
                            DEVLOG.EXE
                        </h1>
                    </div>
                    <p className="text-[#C0CAAF] font-mono text-xs tracking-widest uppercase">
                        System_Protocol: Register_New_User
                    </p>
                </div>

                {/* Card */}
                <div className="bg-[#1C1B1B] border-l-4 border-[#A8FF3E] p-8 relative overflow-hidden">

                    {/* Terminal watermark */}
                    <div className="absolute top-4 right-4 text-[#A8FF3E] opacity-5 text-8xl pointer-events-none select-none font-mono">
                        &gt;_
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                        {/* Username */}
                        <div>
                            <label className="block font-mono text-[10px] text-[#C0CAAF] tracking-[0.2em] uppercase mb-3">
                                &gt; INIT_USERNAME
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={handleUsernameChange}
                                disabled={error !== "" || isLoading}
                                placeholder="ENTER_ID"
                                className="w-full bg-transparent border-0 border-b-2 border-[#414A35] focus:border-[#A8FF3E] focus:outline-none text-[#E5E2E1] font-mono text-sm py-2 placeholder:text-[#414A35] placeholder:text-xs transition-colors disabled:opacity-40"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block font-mono text-[10px] text-[#C0CAAF] tracking-[0.2em] uppercase mb-3">
                                &gt; INIT_EMAIL_NODE
                            </label>
                            <input
                                type="text"
                                name="email"
                                value={email}
                                onChange={handleEmailChange}
                                disabled={error !== "" || isLoading}
                                placeholder="USER@NETWORK.EXE"
                                className="w-full bg-transparent border-0 border-b-2 border-[#414A35] focus:border-[#A8FF3E] focus:outline-none text-[#E5E2E1] font-mono text-sm py-2 placeholder:text-[#414A35] placeholder:text-xs transition-colors disabled:opacity-40"
                            />
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block font-mono text-[10px] text-[#C0CAAF] tracking-[0.2em] uppercase mb-3">
                                &gt; INIT_DISPLAY_NAME
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={handleNameChange}
                                disabled={error !== "" || isLoading}
                                placeholder="FULL_NAME"
                                className="w-full bg-transparent border-0 border-b-2 border-[#414A35] focus:border-[#A8FF3E] focus:outline-none text-[#E5E2E1] font-mono text-sm py-2 placeholder:text-[#414A35] placeholder:text-xs transition-colors disabled:opacity-40"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block font-mono text-[10px] text-[#C0CAAF] tracking-[0.2em] uppercase mb-3">
                                &gt; INIT_PASSWORD
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={handlePasswordChange}
                                disabled={error !== "" || isLoading}
                                placeholder="••••••••"
                                className="w-full bg-transparent border-0 border-b-2 border-[#414A35] focus:border-[#4AF0FF] focus:outline-none text-[#E5E2E1] font-mono text-sm py-2 placeholder:text-[#414A35] transition-colors disabled:opacity-40"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block font-mono text-[10px] text-[#C0CAAF] tracking-[0.2em] uppercase mb-3">
                                &gt; CONFIRM_PASSWORD
                            </label>
                            <input
                                type="password"
                                name="confirmPass"
                                value={confirmPass}
                                onChange={handleConfirmPassChange}
                                disabled={error !== "" || isLoading}
                                placeholder="••••••••"
                                className="w-full bg-transparent border-0 border-b-2 border-[#414A35] focus:border-[#4AF0FF] focus:outline-none text-[#E5E2E1] font-mono text-sm py-2 placeholder:text-[#414A35] transition-colors disabled:opacity-40"
                            />
                        </div>

                        {/* Submit button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={error !== "" || isLoading}
                                className="w-full bg-[#A8FF3E] hover:bg-[#89dc12] text-[#0F2000] font-mono font-black py-4 tracking-[0.2em] uppercase text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "[ REGISTERING... ]" : "REGISTER_NEW_USER →"}
                            </button>
                        </div>

                    </form>
                </div>

                {/* Footer links */}
                <div className="mt-6 flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
                    <button
                        onClick={() => navigate("/login")}
                        className="text-[#C0CAAF] opacity-60 hover:text-[#A8FF3E] hover:opacity-100 transition-colors"
                    >
                        &lt; BACK TO LOGIN
                    </button>
                    <span className="text-[#C0CAAF] opacity-30">v2.0.4 // UNBORN.SYS</span>
                </div>

                {/* Status bar */}
                <div className="mt-4 flex justify-between text-[9px] font-mono text-[#C0CAAF] opacity-30">
                    <span>LOCAL_TIME: {time}</span>
                    <span>SYSTEM_STATUS: OPERATIONAL_</span>
                </div>

            </div>
        </div>
    )
}
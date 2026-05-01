import { useState, useEffect } from "react"
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import ErrorAlert from "../components/ErrorAlert"
import SuccessAlert from "../components/SuccessAlert"

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");
    let [identifier, setIdentifier] = useState("");
    let [password, setPassword] = useState("");
    const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB'));

    const dismissSuccess = () => {
        setSuccessMessage("");
        navigate(location.pathname, { replace: true });
    };

    useEffect(() => {
        const tick = setInterval(() => setTime(new Date().toLocaleTimeString('en-GB')), 1000);
        return () => clearInterval(tick);
    }, []);

    const handleSubmit = async (evt) => {
        setError("");
        evt.preventDefault();
        setIsLoading(true);
        try {
            if (!identifier || !password) throw new Error("identifier and password are required");
            const response = await axios.post("/api/auth/login", { identifier, password });
            localStorage.setItem('username', response.data.username)
            navigate('/dashboard', { state: { successMessage: "AUTHENTICATION_SUCCESSFUL" } });
        } catch (err) {
            setError(err.response ? err.response.data.message : err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setError("");
            setIsLoading(true);
            try {
                const response = await axios.post("/api/auth/google", { access_token: tokenResponse.access_token });
                localStorage.setItem('username', response.data.username);
                navigate('/dashboard', { state: { successMessage: "AUTHENTICATION_SUCCESSFUL" } });
            } catch (err) {
                setError(err.response ? err.response.data.message : "Google Authentication failed");
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => setError("Google Authentication failed")
    });

    const handleIdentifierChange = (evt) => { setError(""); setIdentifier(evt.target.value); }
    const handlePasswordChange = (evt) => { setError(""); setPassword(evt.target.value); }

    return (
        // Full screen black, flex centered
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center px-6">

            {successMessage && <SuccessAlert message={successMessage} onClose={dismissSuccess} />}
            {error && <ErrorAlert error={error} onClose={() => setError("")} />}

            {/* Max width container, left aligned */}
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#A8FF3E] font-mono text-2xl">▣</span>
                        <h1 className="text-3xl font-black tracking-tighter text-[#A8FF3E] font-mono">
                            DEVJRNL.EXE
                        </h1>
                    </div>
                    <p className="text-[#C0CAAF] font-mono text-xs tracking-widest uppercase">
                        Kernel Authorization Required
                    </p>
                </div>

                {/* Card — left green border, dark bg */}
                <div className="bg-[#1C1B1B] border-l-4 border-[#A8FF3E] p-8 relative overflow-hidden">

                    {/* Shield watermark */}
                    <div className="absolute top-4 right-4 text-[#A8FF3E] opacity-5 text-8xl pointer-events-none select-none">
                        ⛨
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">

                        {/* Username field */}
                        <div>
                            <label className="block font-mono text-[10px] text-[#C0CAAF] tracking-[0.2em] uppercase mb-3">
                                &gt; IDENT_USER
                            </label>
                            <input
                                type="text"
                                name="identifier"
                                value={identifier}
                                onChange={handleIdentifierChange}
                                disabled={error !== "" || isLoading}
                                placeholder="USERNAME_OR_EMAIL"
                                className="w-full bg-transparent border-0 border-b-2 border-[#414A35] focus:border-[#A8FF3E] focus:outline-none text-[#E5E2E1] font-mono text-sm py-2 placeholder:text-[#414A35] placeholder:text-xs transition-colors disabled:opacity-40"
                            />
                        </div>

                        {/* Password field */}
                        <div>
                            <label className="block font-mono text-[10px] text-[#C0CAAF] tracking-[0.2em] uppercase mb-3">
                                &gt; ACCESS_KEY
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

                        {/* Submit button */}
                        <div className="pt-2 flex flex-col gap-4">
                            <button
                                type="submit"
                                disabled={error !== "" || isLoading}
                                className="w-full bg-[#A8FF3E] hover:bg-[#89dc12] text-[#0F2000] font-mono font-black py-4 tracking-[0.2em] uppercase text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "[ AUTHENTICATING... ]" : "[ EXECUTE_LOGIN ] →"}
                            </button>
                            
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-[1px] bg-[#414A35] flex-1"></div>
                                <span className="text-[#C0CAAF] text-[10px] tracking-widest uppercase font-mono">OR</span>
                                <div className="h-[1px] bg-[#414A35] flex-1"></div>
                            </div>

                            <div className="flex justify-center mt-2 opacity-90 hover:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={() => loginWithGoogle()}
                                    disabled={error !== "" || isLoading}
                                    className="w-full bg-[#111111] border border-[#A8FF3E] hover:bg-[#A8FF3E] hover:text-[#0a0a0a] text-[#A8FF3E] font-mono font-bold py-3 tracking-[0.2em] uppercase text-xs transition-colors flex justify-center items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    [ LOGIN_WITH_GOOGLE ]
                                </button>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer links */}
                <div className="mt-6 flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
                    <button
                        onClick={() => navigate("/forgot-password")}
                        className="text-[#C0CAAF] opacity-60 hover:text-[#A8FF3E] hover:opacity-100 transition-colors"
                    >
                        &gt; RECOVER_CREDENTIALS
                    </button>
                    <button
                        onClick={() => navigate("/register")}
                        className="text-[#C0CAAF] opacity-60 hover:text-[#A8FF3E] hover:opacity-100 transition-colors"
                    >
                        &gt; CREATE_ACCOUNT
                    </button>
                </div>

                {/* Status bar */}
                <div className="mt-4 flex justify-between text-[9px] font-mono text-[#C0CAAF] opacity-30">
                    <span>LOCAL_TIME: {time}</span>
                    <span>SYSTEM_STATUS: STABLE_</span>
                </div>

            </div>
        </div>
    )
}
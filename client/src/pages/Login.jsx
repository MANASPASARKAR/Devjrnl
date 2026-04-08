import { useState } from "react"
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import ErrorAlert from "../components/ErrorAlert"

export default function Login() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    let [identifier, setIdentifier] = useState("");
    let [password, setPassword] = useState("");

    const handleSubmit = async (evt) => {
        setError("");
        evt.preventDefault();
        setIsLoading(true);
        try {
            if (!identifier || !password) throw new Error("identifier and password are required");
            const response = await axios.post("/api/auth/login", { identifier, password });
            localStorage.setItem('username', response.data.username)
            navigate('/dashboard');
        } catch (err) {
            setError(err.response ? err.response.data.message : err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleIdentifierChange = (evt) => { setError(""); setIdentifier(evt.target.value); }
    const handlePasswordChange = (evt) => { setError(""); setPassword(evt.target.value); }

    return (
        // Full screen black, flex centered
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center px-6">

            {error && <ErrorAlert error={error} onClose={() => setError("")} />}

            {/* Max width container, left aligned */}
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
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={error !== "" || isLoading}
                                className="w-full bg-[#A8FF3E] hover:bg-[#89dc12] text-[#0F2000] font-mono font-black py-4 tracking-[0.2em] uppercase text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "[ AUTHENTICATING... ]" : "[ EXECUTE_LOGIN ] →"}
                            </button>
                        </div>

                    </form>
                </div>

                {/* Footer links */}
                <div className="mt-6 flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
                    <span className="text-[#C0CAAF] opacity-60">&gt; RECOVER_CREDENTIALS</span>
                    <button
                        onClick={() => navigate("/register")}
                        className="text-[#C0CAAF] opacity-60 hover:text-[#A8FF3E] hover:opacity-100 transition-colors"
                    >
                        &gt; CREATE_ACCOUNT
                    </button>
                </div>

                {/* Status bar */}
                <div className="mt-4 flex justify-between text-[9px] font-mono text-[#C0CAAF] opacity-30">
                    <span>LOCAL_TIME: {new Date().toLocaleTimeString('en-GB')}</span>
                    <span>SYSTEM_STATUS: STABLE_</span>
                </div>

            </div>
        </div>
    )
}
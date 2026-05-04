import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import SuccessAlert from "../components/SuccessAlert";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState("idle"); // idle, loading, success, error
    const [message, setMessage] = useState("");
    
    const navigate = useNavigate();
    const { token } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setStatus("error");
            setMessage("Password must be at least 8 characters");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to reset password");
            }

            setStatus("success");
            setMessage("CREDENTIALS_UPDATED_SUCCESSFULLY");
            
            // Redirect to login after a brief moment
            setTimeout(() => {
                navigate("/login", { state: { successMessage: "PASSWORD_UPDATED_SUCCESSFULLY_PLEASE_LOGIN" } });
            }, 2000);

        } catch (err) {
            setStatus("error");
            setMessage(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-mono flex flex-col justify-center items-center p-4">
            
            {status === "error" && <ErrorAlert error={message} onClose={() => setStatus("idle")} />}
            {status === "success" && <SuccessAlert message={message} onClose={() => setStatus("idle")} />}

            <div className="w-full max-w-md bg-[#111111] border border-[#222] p-8 shadow-2xl relative overflow-hidden">
                {/* Decorative top bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#111111] via-[#A8FF3E] to-[#111111]"></div>
                
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#A8FF3E] font-mono text-2xl">▣</span>
                        <h1 className="text-2xl font-black tracking-tighter text-[#A8FF3E] font-mono">
                            CREDENTIAL_UPDATE.EXE
                        </h1>
                    </div>
                    <p className="text-[#C0CAAF] font-mono text-xs tracking-widest uppercase">
                        // SECURE PASSWORD RESET PROTOCOL
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-[#C0CAAF] tracking-widest uppercase font-bold">
                            NEW_PASSPHRASE
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={status === "loading" || status === "success"}
                            className="bg-[#0a0a0a] border border-[#333] text-white p-3 focus:outline-none focus:border-[#A8FF3E] transition-colors placeholder:text-gray-700 font-mono tracking-widest text-lg disabled:opacity-50"
                            placeholder="********"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-[#C0CAAF] tracking-widest uppercase font-bold">
                            CONFIRM_NEW_PASSPHRASE
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={status === "loading" || status === "success"}
                            className="bg-[#0a0a0a] border border-[#333] text-white p-3 focus:outline-none focus:border-[#A8FF3E] transition-colors placeholder:text-gray-700 font-mono tracking-widest text-lg disabled:opacity-50"
                            placeholder="********"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading" || status === "success"}
                        className="mt-4 py-3 bg-[#A8FF3E] text-[#0a0a0a] font-black text-xs tracking-[0.2em] uppercase hover:bg-[#89dc12] transition-colors disabled:opacity-50 flex justify-center items-center gap-2 relative overflow-hidden group"
                    >
                        <span className="relative z-10">{status === "loading" ? "UPDATING..." : "CONFIRM_NEW_CREDENTIALS"}</span>
                        <div className="absolute inset-0 h-full w-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    </button>
                </form>
            </div>
            
            <div className="mt-8 text-center text-[10px] text-gray-600 tracking-[0.2em] uppercase">
                TOKEN_VERIFIED // END-TO-END ENCRYPTION ACTIVE
            </div>
        </div>
    );
}

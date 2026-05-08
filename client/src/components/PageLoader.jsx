/**
 * PageLoader — only renders after a 1-second delay so fast loads never flash it.
 * Usage:
 *   const [showLoader, setShowLoader] = useState(false);
 *   useEffect(() => { const t = setTimeout(() => setShowLoader(true), 1000); return () => clearTimeout(t); }, []);
 *   if (loading && showLoader) return <PageLoader />;
 */

export default function PageLoader({ label = "LOADING" }) {
    return (
        <div
            className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center"
            style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "100% 40px",
            }}
        >
            {/* Logo / wordmark */}
            <p className="text-[#39ff14] text-xs tracking-[0.4em] uppercase mb-10 opacity-60">
                DEVJRNL_
            </p>

            {/* Main label with blinking cursor */}
            <div className="flex items-center gap-2 mb-8">
                <span className="text-white font-mono font-black text-2xl tracking-widest uppercase">
                    {label}
                </span>
                <span
                    className="inline-block w-[2px] h-6 bg-[#39ff14]"
                    style={{ animation: "blink 1s step-end infinite" }}
                />
            </div>

            {/* Animated progress bar */}
            <div className="w-64 h-[2px] bg-[#1a1a1a] overflow-hidden">
                <div
                    className="h-full bg-[#39ff14]"
                    style={{ animation: "progressScan 1.6s ease-in-out infinite" }}
                />
            </div>

            {/* Subtle status line */}
            <p className="text-gray-700 text-[10px] tracking-[0.3em] uppercase mt-6 font-mono">
                &gt; FETCHING DATA...
            </p>

            <style>{`
                @keyframes progressScan {
                    0%   { transform: translateX(-100%); width: 60%; }
                    50%  { transform: translateX(80%);   width: 60%; }
                    100% { transform: translateX(200%);  width: 60%; }
                }
            `}</style>
        </div>
    );
}

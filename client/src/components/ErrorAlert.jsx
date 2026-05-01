export default function ErrorAlert({ error, onClose }) {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#2A0A0A] border-b-2 border-[#FF4444] flex items-center justify-between px-4 py-3 font-mono">

            {/* Left: badge + message */}
            <div className="flex items-center gap-4 min-w-0">
                <span className="shrink-0 bg-[#FF4444] text-[#2A0A0A] text-[10px] font-black tracking-[0.15em] px-2 py-1 uppercase">
                    [ SYSTEM_CRITICAL ]
                </span>
                <span className="text-[#FF4444] text-[11px] tracking-[0.12em] uppercase truncate">
                    {error.toUpperCase()}
                </span>
            </div>

            {/* Right: ESC */}
            <div className="flex items-center shrink-0 ml-4">
                <button
                    onClick={onClose}
                    className="border border-[#FF4444] text-[#FF4444] text-[10px] font-black tracking-widest px-3 py-1 hover:bg-[#FF4444] hover:text-[#2A0A0A] transition-colors uppercase"
                >
                    [ ESC ]
                </button>
            </div>
        </div>
    )
}
export default function ErrorAlert({ error, onClose }) {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#0F1A00] border-b-2 border-[#A8FF3E] flex items-center justify-between px-4 py-3 font-mono">

            {/* Left: badge + message */}
            <div className="flex items-center gap-4 min-w-0">
                <span className="shrink-0 bg-[#A8FF3E] text-[#0F2000] text-[10px] font-black tracking-[0.15em] px-2 py-1 uppercase">
                    [ SYSTEM_CRITICAL ]
                </span>
                <span className="text-[#A8FF3E] text-[11px] tracking-[0.12em] uppercase truncate">
                    {error.toUpperCase()}
                </span>
            </div>

            {/* Right: ESC */}
            <div className="flex items-center shrink-0 ml-4">
                <button
                    onClick={onClose}
                    className="border border-[#A8FF3E] text-[#A8FF3E] text-[10px] font-black tracking-widest px-3 py-1 hover:bg-[#A8FF3E] hover:text-[#0F2000] transition-colors uppercase"
                >
                    [ ESC ]
                </button>
            </div>
        </div>
    )
}
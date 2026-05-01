export default function Footer() {
    return (
        <footer className="w-full bg-[#0a0a0a] border-t border-[#1e1e1e] px-6 py-5 font-mono">
            <div className="flex items-start justify-between">

                {/* Left side */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[#A8FF3E] font-black text-sm tracking-tight">DEVJRNL</span>
                        <span className="text-[#414A35] text-[10px] tracking-widest">// V1.0.0-STABLE</span>
                    </div>
                    <span className="text-[#C0CAAF] text-[10px] tracking-[0.15em] opacity-60 uppercase">
                        Built by Manas Pasarkar
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[#A8FF3E] text-[8px]">■</span>
                        <span className="text-[#A8FF3E] text-[10px] tracking-[0.15em] uppercase">
                            SYSTEM_STATUS: OPERATIONAL
                        </span>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end gap-2">
                    {/* Links */}
                    <div className="flex items-center gap-5">
                        <a
                            href="https://github.com/MANASPASARKAR"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[#C0CAAF] text-[10px] tracking-widest uppercase opacity-60 hover:opacity-100 hover:text-[#A8FF3E] transition-colors"
                        >
                            <i className="fa-brands fa-github text-xs"></i>
                            GITHUB
                        </a>
                        <a
                            href="https://www.linkedin.com/in/manas-pasarkar-807400309/"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[#C0CAAF] text-[10px] tracking-widest uppercase opacity-60 hover:opacity-100 hover:text-[#A8FF3E] transition-colors"
                        >
                            <i className="fa-brands fa-linkedin text-xs"></i>
                            LINKEDIN
                        </a>
                        <a
                            href="https://github.com/MANASPASARKAR/devjrnl"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[#C0CAAF] text-[10px] tracking-widest uppercase opacity-60 hover:opacity-100 hover:text-[#A8FF3E] transition-colors"
                        >
                            <i className="fa-solid fa-code text-xs"></i>
                            SOURCE
                        </a>
                    </div>

                    {/* Copyright */}
                    <span className="text-[#C0CAAF] text-[10px] tracking-widest opacity-40">
                        © 2026 <span className="text-[#C0CAAF] opacity-80 font-bold">Devjrnl</span>
                    </span>
                </div>

            </div>
        </footer>
    )
}
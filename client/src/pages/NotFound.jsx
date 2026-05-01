import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full bg-[#111111] text-gray-200 font-mono flex flex-col justify-between">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col justify-center px-8 md:px-24 max-w-7xl mx-auto w-full pt-12 md:pt-0">
                {/* Path indicator */}
                <div className="text-[#00e5ff] text-xs font-bold tracking-widest uppercase mb-12">
                    SYSTEM // ROOT // ERRORS // 0404
                </div>

                {/* 404 Heading */}
                <div className="flex items-end mb-16">
                    <h1 className="text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter text-white">
                        404
                    </h1>
                    <div className="w-24 md:w-32 h-6 md:h-8 bg-white mb-8 md:mb-12 ml-4 animate-pulse" />
                </div>

                {/* Error Console block */}
                <div className="border-l-2 border-[#00e5ff] pl-6 mb-20 space-y-4">
                    <p className="text-[#ff5252] text-sm md:text-base font-bold tracking-widest uppercase">
                        // ERROR: FILE_NOT_FOUND
                    </p>
                    <p className="text-gray-400 text-sm md:text-base">
                        &gt; grep: /path/to/page: No such file or directory
                    </p>
                    <p className="text-gray-500 italic text-sm md:text-base">
                        "The ghost in the machine has wandered into the void."
                    </p>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-[#222] md:border-t-0">
                    {/* Diagnostics */}
                    <div className="bg-[#0a0a0a] p-8 border-b md:border-b-0 md:border-r border-[#222]">
                        <h3 className="text-[#00e5ff] text-[10px] font-bold tracking-widest uppercase mb-4">DIAGNOSTICS</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            The requested URI does not exist within the current volume. The pointer has reached an EOF unexpectedly.
                        </p>
                    </div>

                    {/* Recovery Status */}
                    <div className="bg-[#151515] p-8 border-b md:border-b-0 md:border-r border-[#222]">
                        <h3 className="text-[#ffd700] text-[10px] font-bold tracking-widest uppercase mb-4">RECOVERY_STATUS</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Auto-recovery failed. Manual intervention required. Redirect to core module suggested to maintain system uptime.
                        </p>
                    </div>

                    {/* Action Required */}
                    <div className="bg-[#1a1a1a] p-8 flex flex-col justify-center">
                        <h3 className="text-white text-[10px] font-bold tracking-widest uppercase mb-6">ACTION_REQUIRED</h3>
                        <button
                            onClick={() => navigate("/")}
                            className="bg-[#39ff14] text-[#0f2000] px-6 py-4 text-xs font-black tracking-widest uppercase flex items-center justify-between hover:bg-[#89dc12] transition-colors"
                        >
                            RETURN_TO_BASE
                            <span className="text-lg leading-none">&rarr;</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Terminal Footer */}
            <footer className="border-t border-[#333] bg-[#0a0a0a] py-3 px-6 flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-500">
                <div>SYSTEM STATUS: OPTIMAL // V1.0.4</div>
                <div className="flex gap-6">
                    <span>STREAK: 14D</span>
                    <span>LATENCY: 22MS</span>
                    <span className="text-[#00e5ff] font-bold">LOG_LEVEL: VERBOSE</span>
                </div>
            </footer>
        </div>
    );
}

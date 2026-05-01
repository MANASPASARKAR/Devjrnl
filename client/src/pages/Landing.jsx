import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("username")) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const greenBtn = "transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,255,62,0.5)]";

    return (
        <div
            className="w-full overflow-x-hidden bg-[#0a0a0a] text-[#e5e2e1] font-mono"
            style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "100% 40px"
            }}
        >
            <nav className="bg-[#0a0a0a] border-b border-[#1e1e1e]">
                <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
                    <div className="text-[#A8FF3E] font-black text-3xl tracking-tighter">
                        DEVJRNL_
                    </div>
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-xs font-bold text-gray-400 hover:text-[#A8FF3E] tracking-widest uppercase transition-colors"
                        >
                            LOGIN
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className={`px-5 py-2 text-xs font-black tracking-widest uppercase bg-[#A8FF3E] text-[#0F2000] ${greenBtn}`}
                        >
                            GET STARTED
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <main className="px-6 pt-24 pb-12 max-w-5xl mx-auto text-center flex flex-col items-center">
                <p className="text-[#A8FF3E] text-xs tracking-[0.3em] uppercase mb-6">
                    &gt; DEVJRNL // v1.0.0
                </p>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none mb-8">
                    Log it.<br />
                    Track it.<br />
                    <span className="text-[#A8FF3E]">Own it.</span>
                </h1>

                <p className="text-gray-400 text-base max-w-xl mx-auto mb-12 leading-relaxed">
                    devjrnl isn't a blog. It's a <span className="text-white font-bold">technical ledger</span>. Track the evolution of your thought process, the dead ends you encountered, and the architectural decisions that shaped your software.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate("/register")}
                        className={`px-8 py-3 text-xs font-black tracking-[0.15em] uppercase bg-[#A8FF3E] text-[#0F2000] ${greenBtn}`}
                    >
                        INITIALIZE LEDGER
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        className="px-8 py-3 text-xs font-black tracking-[0.15em] uppercase border border-[#2a2a2a] text-gray-400 hover:border-[#A8FF3E] hover:text-[#A8FF3E] transition-colors"
                    >
                        ACCESS TERMINAL
                    </button>
                </div>
            </main>

            {/* Features */}
            <section className="px-6 py-20 max-w-5xl mx-auto text-center">
                <p className="text-[#A8FF3E] text-[10px] tracking-[0.3em] uppercase mb-12">
                    &gt; FEATURES
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#1e1e1e]">
                    <div className="p-8 border-b md:border-b-0 md:border-r border-[#1e1e1e] hover:bg-[#141414] transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-4 h-4 text-[#A8FF3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-[#A8FF3E] text-[10px] tracking-widest uppercase">01</span>
                        </div>
                        <h3 className="text-white text-base font-bold mb-3 tracking-tight">Streak Tracking</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Build momentum. Your daily streak is tracked and visualized — keep the chain alive.
                        </p>
                    </div>

                    <div className="p-8 border-b md:border-b-0 md:border-r border-[#1e1e1e] hover:bg-[#141414] transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-4 h-4 text-[#A8FF3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            <span className="text-[#A8FF3E] text-[10px] tracking-widest uppercase">02</span>
                        </div>
                        <h3 className="text-white text-base font-bold mb-3 tracking-tight">Code-First Entries</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Write entries with native code block rendering. Tag by language, framework, or topic.
                        </p>
                    </div>

                    <div className="p-8 hover:bg-[#141414] transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-4 h-4 text-[#A8FF3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="text-[#A8FF3E] text-[10px] tracking-widest uppercase">03</span>
                        </div>
                        <h3 className="text-white text-base font-bold mb-3 tracking-tight">Smart Search</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Filter and search across all logs by content, tags, or date. Nothing gets lost.
                        </p>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <div className="px-6 pb-6 max-w-5xl mx-auto">
                <div className="border border-[#1e1e1e] border-l-4 border-l-[#A8FF3E] bg-[#0d0d0d] p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <p className="text-[#A8FF3E] text-[10px] tracking-[0.3em] uppercase mb-2">&gt; START_NOW</p>
                        <h2 className="text-white text-2xl font-black tracking-tight">Your development journal<br />starts today.</h2>
                    </div>
                    <button
                        onClick={() => navigate("/register")}
                        className={`shrink-0 px-8 py-3 text-xs font-black tracking-[0.15em] uppercase bg-[#A8FF3E] text-[#0F2000] ${greenBtn}`}
                    >
                        CREATE ACCOUNT
                    </button>
                </div>
            </div>

        </div>
    );
}

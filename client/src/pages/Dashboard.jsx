import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "../api/axios"
import ErrorAlert from "../components/ErrorAlert"
import SuccessAlert from "../components/SuccessAlert"
import ReactMarkdown from "react-markdown"
import PageLoader from "../components/PageLoader"

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoader, setShowLoader] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [username, setUsername] = useState("USER");
    const [tooltip, setTooltip] = useState(null); // { date, count, x, y }
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");

    const dismissSuccess = () => {
        setSuccessMessage("");
        navigate(location.pathname, { replace: true });
    };

    // ── Heatmap helpers ──────────────────────────────────────────────────────
    function buildWeeks(heatmapData) {
        const weeks = [];
        const year = new Date().getFullYear();
        const endOfYear = new Date(year, 11, 31); // Dec 31
        const startOfYear = new Date(year, 0, 1);
        const start = new Date(startOfYear);
        start.setDate(start.getDate() - start.getDay()); // back to Sunday
        let current = new Date(start);
        let week = [];
        while (current <= endOfYear) {
            const key = current.toISOString().split('T')[0];
            week.push({ date: key, count: (heatmapData && heatmapData[key]) || 0 });
            if (week.length === 7) { weeks.push(week); week = []; }
            current.setDate(current.getDate() + 1);
        }
        if (week.length > 0) weeks.push(week);
        return weeks;
    }

    function getColor(count) {
        if (count === 0) return '#1c1b1b';
        if (count === 1) return '#2e5000';
        if (count === 2) return '#39ff14';
        return '#4af0ff';
    }

    function getMonthLabels(weeks) {
        const currentYear = new Date().getFullYear();
        const labels = [];
        weeks.forEach((week, i) => {
            const d = new Date(week[0].date);
            // Skip months from the previous year (partial Dec before Jan 1)
            if (d.getFullYear() < currentYear) return;
            const prevMonth = i > 0 ? new Date(weeks[i - 1][0].date).getMonth() : -1;
            if (d.getMonth() !== prevMonth) {
                labels.push({ index: i, label: d.toLocaleString('default', { month: 'short' }) });
            }
        });
        return labels;
    }
    // ────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        // Only show the loader if fetch takes longer than 1 second
        const loaderTimer = setTimeout(() => setShowLoader(true), 1000);

        const fetchDashboard = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard`);
                setDashboardData(response.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setFetchError(true);
            } finally {
                clearTimeout(loaderTimer);
                setLoading(false);
            }
        };
        fetchDashboard();

        const storedUser = localStorage.getItem("username");
        if (storedUser) {
            setUsername(storedUser.toUpperCase());
        }

        return () => clearTimeout(loaderTimer);
    }, [])

    const redirectToLogs = () => {
        navigate('/logs');
    }

    // While fetching — show loader only after 1s has passed
    if (loading) {
        return showLoader ? <PageLoader /> : <div className="min-h-screen bg-[#0a0a0a]" />;
    }

    // Fetch completed but failed
    if (fetchError || !dashboardData) {
        return (
            <div className="min-h-screen bg-[#0a0a0a]">
                <ErrorAlert error="500 Internal Server Error" onClose={() => navigate('/logs')} />
            </div>
        );
    }

    const formatDate = (raw) =>
        raw ? new Date(raw).toISOString().replace("T", " ").slice(0, 19) + "Z" : "—";

    return (
        <>
            <div
                className="min-h-screen w-full bg-[#0a0a0a] text-gray-200 font-mono p-4 flex flex-col items-center relative"
                style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
                    backgroundSize: "100% 40px"
                }}
            >
                {successMessage && <SuccessAlert message={successMessage} onClose={dismissSuccess} />}

                <div className="w-full max-w-6xl px-6 py-8">

                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-white text-5xl md:text-6xl font-black tracking-tighter leading-none mb-4">
                            DASHBOARD_
                        </h1>
                        <div className="text-[#39ff14] text-[10px] md:text-[11px] tracking-[0.2em] uppercase opacity-80">
                            [SYSTEM_STATUS: ACTIVE // USER: {username}]
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Current Streak */}
                        <div className="bg-[#141414] border border-[#1f1f1f] border-l-4 border-l-[#39ff14] p-6 flex flex-col justify-between h-36">
                            <div className="flex justify-between items-start">
                                <p className="text-[#39ff14] text-[10px] tracking-widest uppercase">CURRENT STREAK</p>
                                <svg className="w-4 h-4 text-[#39ff14]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-[#39ff14] text-5xl font-black tracking-tighter leading-none">{dashboardData.currentStreak || 0}</span>
                                <span className="text-gray-500 text-xs tracking-widest ml-2">DAYS</span>
                            </div>
                        </div>

                        {/* Longest Streak */}
                        <div className="bg-[#141414] border border-[#1f1f1f] border-l-4 border-l-[#ffb300] p-6 flex flex-col justify-between h-36">
                            <div>
                                <p className="text-[#ffb300] text-[10px] tracking-widest uppercase mb-4">LONGEST STREAK</p>
                                <span className="text-white text-4xl font-black tracking-tighter leading-none">{dashboardData.longestStreak || 0}</span>
                            </div>
                            <div className="text-gray-600 text-[9px] tracking-widest uppercase mt-4 flex items-center gap-1">
                                <span className="text-[#ffb300]">&gt;</span> PEAK EFFICIENCY
                            </div>
                        </div>

                        {/* Total Logs */}
                        <div className="bg-[#141414] border border-[#1f1f1f] border-l-4 border-l-[#4af0ff] p-6 flex flex-col justify-between h-36">
                            <div>
                                <p className="text-[#4af0ff] text-[10px] tracking-widest uppercase mb-4">TOTAL LOGS</p>
                                <span className="text-white text-4xl font-black tracking-tighter leading-none">{dashboardData.totalLogs || 0}</span>
                            </div>
                            <div className="text-gray-600 text-[9px] tracking-widest uppercase mt-4 flex items-center gap-1">
                                <span className="text-[#4af0ff]">&gt;</span> CORE DATABASE
                            </div>
                        </div>

                        {/* Logs This Week */}
                        <div className="bg-[#141414] border border-[#1f1f1f] border-l-4 border-l-[#39ff14] p-6 flex flex-col justify-between h-36">
                            <div>
                                <p className="text-[#39ff14] text-[10px] tracking-widest uppercase mb-4">LOGS THIS WEEK</p>
                                <span className="text-white text-4xl font-black tracking-tighter leading-none">{dashboardData.logsThisWeek || 0}</span>
                            </div>
                            <div className="text-gray-600 text-[9px] tracking-widest uppercase mt-4 flex items-center gap-1">
                                <span className="text-[#39ff14]">&gt;</span> RECENT ACTIVITY
                            </div>
                        </div>

                        {/* Active Days */}
                        <div className="bg-[#141414] border border-[#1f1f1f] border-l-4 border-l-[#4af0ff] p-6 flex flex-col justify-between h-36">
                            <div>
                                <p className="text-[#4af0ff] text-[10px] tracking-widest uppercase mb-4">ACTIVE DAYS</p>
                                <span className="text-white text-4xl font-black tracking-tighter leading-none">
                                    {dashboardData.activeDaysThisWeek || 0}/7
                                </span>
                            </div>
                            <div className="text-gray-600 text-[9px] tracking-widest uppercase mt-4 flex items-center gap-1">
                                <span className="text-[#4af0ff]">&gt;</span> WEEKLY CONSISTENCY
                            </div>
                        </div>

                        {/* Avg. Complexity */}
                        <div className="bg-[#141414] border border-[#1f1f1f] border-l-4 border-l-[#ffb300] p-6 flex flex-col justify-between h-36">
                            <div>
                                <p className="text-[#ffb300] text-[10px] tracking-widest uppercase mb-4">AVG. COMPLEXITY</p>
                                <span className="text-white text-4xl font-black tracking-tighter leading-none">N/A</span>
                            </div>
                            <div className="text-gray-600 text-[9px] tracking-widest uppercase mt-4 flex items-center gap-1">
                                <span className="text-[#ffb300]">&gt;</span> METRICS UNAVAILABLE
                            </div>
                        </div>
                    </div>

                    {/* AI Weekly Overview */}
                    <div className="border border-[#1f1f1f] bg-[#0d0d0d] p-6 mb-12">
                        <div className="flex items-center justify-between mb-4 border-b border-[#1f1f1f] pb-3">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#4af0ff]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <h2 className="text-white font-bold tracking-widest uppercase text-sm">AI_WEEKLY_OVERVIEW</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-gray-600 text-[9px] tracking-widest uppercase">
                                    {dashboardData.insightNextRefresh
                                        ? (() => {
                                            const days = Math.ceil((new Date(dashboardData.insightNextRefresh) - Date.now()) / 86400000);
                                            return days > 0 ? `next refresh in ${days}d` : `refresh due`;
                                        })()
                                        : `refreshes every 7 days`}
                                </span>
                                <span className="text-[#4af0ff] border border-[#4af0ff] bg-[#4af0ff]/10 px-2 py-0.5 text-[8px] tracking-[0.2em] uppercase">
                                    GEMMA_3_12B
                                </span>
                            </div>
                        </div>

                        {dashboardData.weeklyInsight ? (
                            <div>
                                <p className="text-[10px] text-[#4af0ff] tracking-[0.3em] uppercase mb-4">
                                    &gt; ANALYSIS_OUTPUT
                                </p>
                                <div className="text-gray-300 text-sm leading-relaxed prose prose-invert max-w-none prose-h3:text-[#39ff14] prose-h3:font-black prose-h3:text-sm prose-h3:tracking-widest prose-h3:uppercase prose-h3:mb-3 prose-h3:mt-8 prose-h3:border-b prose-h3:border-[#1f1f1f] prose-h3:pb-1 prose-li:my-1.5 prose-ul:my-3 prose-strong:text-[#4af0ff]">
                                    <ReactMarkdown>
                                        {dashboardData.weeklyInsight}
                                    </ReactMarkdown>
                                </div>
                                {dashboardData.insightGeneratedAt && (
                                    <div className="mt-5 border-t border-[#1f1f1f] pt-3 flex flex-col sm:flex-row sm:justify-between gap-1">
                                        <p className="text-gray-600 text-[9px] tracking-widest uppercase">
                                            {(() => {
                                                const start = dashboardData.insightPeriodStart
                                                    ? new Date(dashboardData.insightPeriodStart)
                                                    : new Date(new Date(dashboardData.insightGeneratedAt).getTime() - 7 * 24 * 60 * 60 * 1000);
                                                const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
                                                const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
                                                return `> REPORT COVERS: ${fmt(start)} — ${fmt(end)}`;
                                            })()}
                                        </p>
                                        {dashboardData.insightNextRefresh && (
                                            <p className="text-[#39ff14] text-[9px] tracking-widest uppercase">
                                                {`> NEXT REPORT: ${new Date(dashboardData.insightNextRefresh).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}`}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="min-h-[80px] flex items-center justify-center">
                                <p className="text-gray-600 text-xs tracking-widest uppercase">
                                {dashboardData.insightStatus === "not_enough_logs"
                                    ? `// MINIMUM 3 LOGS REQUIRED THIS WEEK — CURRENT: ${dashboardData.weekLogsCount || 0}/3`
                                    : dashboardData.insightStatus === "generation_failed"
                                    ? "// INSIGHT GENERATION FAILED — WILL RETRY NEXT REFRESH"
                                    : dashboardData.insightStatus === "not_yet_due"
                                    ? `// FIRST INSIGHT UNLOCKS ${dashboardData.insightNextRefresh ? new Date(dashboardData.insightNextRefresh).toDateString().toUpperCase() : "AFTER 7 DAYS"}`
                                    : "// MINIMUM 3 LOGS REQUIRED THIS WEEK TO GENERATE INSIGHT"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Contribution Matrix */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white font-bold tracking-widest uppercase text-sm">CONTRIBUTION_MATRIX</h2>
                            <div className="flex items-center gap-2 text-[9px] text-gray-500 tracking-widest uppercase">
                                <span>LESS</span>
                                <div className="flex gap-1">
                                    <div className="w-2.5 h-2.5" style={{ background: '#1c1b1b' }} />
                                    <div className="w-2.5 h-2.5" style={{ background: '#2e5000' }} />
                                    <div className="w-2.5 h-2.5" style={{ background: '#39ff14' }} />
                                    <div className="w-2.5 h-2.5" style={{ background: '#4af0ff' }} />
                                </div>
                                <span>MORE</span>
                            </div>
                        </div>

                        {/* Month labels + grid */}
                        {(() => {
                            const weeks = buildWeeks(dashboardData.heatmapData || {});
                            const monthLabels = getMonthLabels(weeks);
                            const GAP = 3; // px between cells
                            return (
                                <div className="w-full">
                                    {/* Month labels row — percentage positioned */}
                                    <div className="relative h-5 mb-1 w-full">
                                        {monthLabels.map(({ index, label }) => (
                                            <span
                                                key={label}
                                                className="absolute text-[9px] text-gray-500 tracking-widest uppercase"
                                                style={{ left: `${(index / weeks.length) * 100}%` }}
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                    {/* Full-width CSS grid */}
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: `repeat(${weeks.length}, 1fr)`,
                                            gap: GAP,
                                        }}
                                    >
                                        {weeks.map((week, wi) => (
                                            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                                                {week.map((day, di) => (
                                                    <div
                                                        key={di}
                                                        style={{ background: getColor(day.count), aspectRatio: '1 / 1', width: '100%' }}
                                                        className="cursor-default"
                                                        onMouseEnter={(e) => setTooltip({ date: day.date, count: day.count, x: e.clientX, y: e.clientY })}
                                                        onMouseLeave={() => setTooltip(null)}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Recent History */}
                    <div className="mb-12">
                        <h2 className="text-white font-bold tracking-widest uppercase text-sm mb-4">RECENT_HISTORY</h2>

                        <div className="flex flex-col gap-4">
                            {dashboardData.recentLogs && dashboardData.recentLogs.length > 0 ? (
                                dashboardData.recentLogs.map((log, index) => {
                                    const colors = ['#4af0ff', '#39ff14', '#ffb300'];
                                    const leftBorderColor = colors[index % colors.length];

                                    return (
                                        <div
                                            key={log._id}
                                            className="bg-[#141414] border border-[#1f1f1f] p-5 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                                            style={{ borderLeftWidth: '3px', borderLeftColor: leftBorderColor }}
                                            onClick={() => navigate(`/logs/${log._id}`)}
                                        >
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 overflow-hidden">
                                                <div className="flex-1 min-w-0 w-full">
                                                    <div className="flex gap-2 items-center mb-1">
                                                        <p className="text-[#39ff14] text-[10px] tracking-widest uppercase">
                                                            [{formatDate(log.date)}]
                                                        </p>
                                                        {log.images && log.images.length > 0 && (
                                                            <span className="text-[10px] text-[#39ff14] tracking-widest flex items-center gap-1 opacity-80" title={`${log.images.length} attachments`}>
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                                                {log.images.length}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-white text-base font-bold tracking-wide mb-1 truncate">
                                                        {log.title}
                                                    </h3>
                                                    <p className="text-gray-500 text-xs truncate">
                                                        {log.content.substring(0, 120)}...
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2 shrink-0">
                                                    {log.tags && log.tags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-0.5 text-[9px] tracking-widest uppercase border border-[#2a2a2a] text-gray-400"
                                                        >
                                                            [{tag}]
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-[#141414] border border-[#1f1f1f] border-l-4 border-l-[#1f1f1f] p-6 text-center">
                                    <p className="text-gray-600 text-xs tracking-widest uppercase">No recent logs found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* View All Logs Button */}
                    <div>
                        <button
                            onClick={redirectToLogs}
                            className="transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,255,62,0.5)] px-8 py-3 bg-[#39ff14] text-[#0f2000] text-xs font-black tracking-[0.2em] uppercase hover:bg-[#89dc12] transition-colors"
                        >
                            VIEW_ALL_LOGS
                        </button>
                    </div>

                </div>
            </div>
            {/* Heatmap tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 bg-[#1e1e1e] border border-[#39ff14] text-[#39ff14] text-[10px] font-mono px-3 py-1.5 pointer-events-none whitespace-nowrap"
                    style={{ top: tooltip.y - 44, left: tooltip.x + 10 }}
                >
                    {tooltip.date} — {tooltip.count} log{tooltip.count !== 1 ? 's' : ''}
                </div>
            )}
        </>
    )
}

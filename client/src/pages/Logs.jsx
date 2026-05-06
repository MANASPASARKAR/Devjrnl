import { useEffect, useState } from "react"
import axios from "../api/axios";
import TAGS from "../constants/tags"
import ErrorAlert from "../components/ErrorAlert"
import SuccessAlert from "../components/SuccessAlert"
import { useNavigate, useLocation } from "react-router-dom"

function formatDate(raw) {
    if (!raw) return "—";
    return new Date(raw).toISOString().replace("T", " ").slice(0, 19);
}

export default function Logs() {
    const navigate = useNavigate();
    const location = useLocation();
    let [logs, setLogs]               = useState([]);
    let [search, setSearch]           = useState("");
    let [searched, setSearched]       = useState(false);
    let [selectedTags, setSelectedTags] = useState([]);
    let [showAllTags, setShowAllTags] = useState(false);
    let [showAllLogs, setShowAllLogs] = useState(false);
    let [error, setError]             = useState("");
    let [loading, setLoading]         = useState(true);
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");

    const dismissSuccess = () => {
        setSuccessMessage("");
        navigate(location.pathname, { replace: true });
    };

    const isFiltering = search !== "" || selectedTags.length > 0;

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/logs`, {
                    params: {
                        search: search || undefined,
                        tags: selectedTags.length > 0 ? selectedTags.join(",") : undefined,
                    }
                });
                setLogs(response.data);
                if (response.data.length === 0 && isFiltering) {
                    setError("No results for this search.");
                } else {
                    setError("");
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setSearched(false);
                setLoading(false);
            }
        };
        fetchLogs();
    }, [searched]);

    const handleChange    = (e) => setSearch(e.target.value);
    const handleSubmit    = (e) => { e.preventDefault(); setSearched(true); };
    const handleTagSelect = (tag) =>
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );

    const displayTags = showAllTags ? TAGS : TAGS.slice(0, 7);
    const displayLogs = showAllLogs ? logs : logs.slice(0, 4);

    return (
        <div className="min-h-screen w-full bg-[#0e0e0e] text-gray-200 font-mono" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "100% 40px" }}>
        {successMessage && <SuccessAlert message={successMessage} onClose={dismissSuccess} />}
        <div className="max-w-5xl mx-auto px-8 py-10">

            {/* ── Title ── */}
            <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-8">
                SYSTEM_LOGS
            </h1>

            {/* ── Search bar ── */}
            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 border border-[#2a2a2a] bg-[#141414] px-4 py-2 mb-5 rounded-sm"
            >
                <span className="text-[#39ff14] text-sm select-none">&gt;</span>
                <input
                    type="text"
                    placeholder="grep --filter logs..."
                    value={search}
                    onChange={handleChange}
                    disabled={!!error}
                    className="flex-1 bg-transparent text-gray-300 text-sm outline-none placeholder-gray-600 disabled:opacity-40"
                />
                <button
                    type="submit"
                    disabled={!!error}
                    className="text-xs text-gray-500 hover:text-[#39ff14] transition-colors uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    run
                </button>
            </form>

            {/* ── Tag filters ── */}
            <div className="flex flex-wrap gap-2 mb-8">
                <button
                    onClick={() => { setSelectedTags([]); setSearched(true); }}
                    disabled={!!error}
                    className={`px-3 py-0.5 text-xs rounded-sm border tracking-wider uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                        ${selectedTags.length === 0
                            ? "bg-[#39ff14] text-black border-[#39ff14]"
                            : "border-[#2a2a2a] text-gray-500 hover:border-gray-500 hover:text-gray-300"}`}
                >
                    [ALL_LOGS]
                </button>

                {displayTags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => handleTagSelect(tag)}
                        disabled={!!error}
                        className={`px-3 py-0.5 text-xs rounded-sm border tracking-wider uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                            ${selectedTags.includes(tag)
                                ? "bg-[#39ff14] text-black border-[#39ff14]"
                                : "border-[#2a2a2a] text-gray-500 hover:border-gray-500 hover:text-gray-300"}`}
                    >
                        [{tag}]
                    </button>
                ))}

                {!showAllTags && TAGS.length > 7 && (
                    <button
                        onClick={() => setShowAllTags(true)}
                        disabled={!!error}
                        className="px-3 py-0.5 text-xs border border-dashed border-[#2a2a2a] text-gray-600 hover:text-gray-400 tracking-wider uppercase transition-colors rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        +more
                    </button>
                )}

                {showAllTags &&
                <button
                    onClick={() => setShowAllTags(false)}
                    disabled={!!error}
                    className="px-3 py-0.5 text-xs border border-dashed border-[#2a2a2a] text-gray-600 hover:text-gray-400 tracking-wider uppercase transition-colors rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        - less
                </button>}
            </div>

            {/* ── Error ── */}
            {error && (
                <ErrorAlert error={error} onClose={() => setError("")} />
            )}

            {/* ── Log cards / Empty states ── */}
            {!loading && logs.length === 0 && !isFiltering ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <span className="text-5xl">📭</span>
                    <p className="text-[#39ff14] text-sm tracking-widest uppercase">// no logs yet</p>
                    <p className="text-gray-600 text-xs tracking-wider">start writing to see your logs here</p>
                    <button
                        disabled={!!error}
                        onClick={() => navigate('/createlog')}
                        className="mt-4 px-6 py-2 text-xs tracking-widest uppercase border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors"
                    >
                        + CREATE_LOG
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {displayLogs.map((log) => (
                        <div
                            key={log._id || log.title}
                            onClick={() => navigate(`/logs/${log._id}`)}
                            className="relative bg-[#141414] border border-[#1f1f1f] border-l-4 border-l-[#39ff14] px-5 py-4 rounded-sm hover:border-[#2e2e2e] transition-colors group cursor-pointer"
                        >
                            {/* Top row: date + tags */}
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[11px] text-gray-600 tracking-widest">
                                    {formatDate(log.date)}
                                </span>
                                
                                {log.images && log.images.length > 0 && (
                                    <span className="text-[10px] text-[#39ff14] tracking-widest flex items-center gap-1 opacity-80" title={`${log.images.length} attachments`}>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                        {log.images.length}
                                    </span>
                                )}

                                {/* Tags — top-right */}
                                <div className="ml-auto flex gap-2">
                                    {(log.tags || []).map((t) => (
                                        <span key={t} className="text-[10px] border border-[#2a2a2a] text-gray-500 px-2 py-0.5 rounded-sm tracking-wider uppercase">
                                            [{t}]
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-white text-base font-bold mb-2 group-hover:text-[#39ff14] transition-colors">
                                {log.title}
                            </h2>

                            {/* Content */}
                            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                                {log.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Divider + Load more ── */}
            {logs.length > 3 && (
                <>
                    <div className="border-t border-[#1f1f1f] my-8" />
                    <div className="flex justify-center">
                        {!showAllLogs ? (
                            <button
                                onClick={() => setShowAllLogs(true)}
                                disabled={!!error}
                                className="flex items-center gap-3 border border-[#2a2a2a] text-gray-500 text-xs tracking-widest uppercase px-8 py-3 hover:border-[#39ff14] hover:text-[#39ff14] transition-colors rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                LOAD_MORE_LOGS
                                <span className="text-lg leading-none">⌄</span>
                            </button>
                        ) : (
                            <p className="text-gray-600 text-xs tracking-widest uppercase">— end of logs —</p>
                        )}
                    </div>
                </>
            )}
        </div>
        </div>
    );
}
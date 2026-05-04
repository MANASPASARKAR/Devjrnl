import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import SuccessAlert from "../components/SuccessAlert";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Log() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [log, setLog]                   = useState(null);
    const [error, setError]               = useState("");
    const [loading, setLoading]           = useState(true);
    const [deleting, setDeleting]         = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");

    const dismissSuccess = () => {
        setSuccessMessage("");
        navigate(location.pathname, { replace: true });
    };

    useEffect(() => {
        const fetchLog = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/logs/${id}`);
                setLog(res.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Failed to load log.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchLog();
    }, [id]);

    const handleDelete = async () => {
        if (!confirmDelete) { setConfirmDelete(true); return; }
        setDeleting(true);
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/logs/${id}`);
            navigate("/logs", { state: { successMessage: "LOG_PURGED_SUCCESSFULLY" } });
        } catch (err) {
            setError(err.response?.data?.message || "Delete failed.");
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    const formatDate = (raw) =>
        raw ? new Date(raw).toISOString().replace("T", " ").slice(0, 19) + " UTC" : "—";

    if (loading) return (
        <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
            <p className="text-[#39ff14] font-mono tracking-widest animate-pulse">// LOADING...</p>
        </div>
    );

    const crumbs = ["JOURNAL", ...(log?.tags?.slice(0, 2).map(t => t.toUpperCase()) ?? [])];

    return (
        <div className="min-h-screen w-full bg-[#0e0e0e] text-gray-200 font-mono">
            {successMessage && <SuccessAlert message={successMessage} onClose={dismissSuccess} />}
            {error && <ErrorAlert error={error} onClose={() => setError("")} />}
            <div className="fixed left-0 top-0 w-1 h-full bg-[#39ff14] opacity-80" />

            <div className="max-w-3xl mx-auto px-10 py-14">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[11px] text-gray-500 tracking-widest uppercase mb-8">
                    {crumbs.map((c, i) => (
                        <span key={i} className="flex items-center gap-2">
                            {i > 0 && <span className="text-gray-700">/</span>}
                            <span
                                className={i === 0 ? "hover:text-[#39ff14] cursor-pointer transition-colors" : "text-gray-400"}
                                onClick={i === 0 ? () => navigate("/logs") : undefined}
                            >
                                {c}
                            </span>
                        </span>
                    ))}
                </nav>

                {/* Title */}
                <h1 className="text-2xl font-black text-white tracking-tight leading-snug mb-4 break-words">
                    {log?.title}
                </h1>

                {/* Date */}
                <div className="flex items-center gap-2 text-[11px] text-gray-500 tracking-widest mb-8">
                    <svg className="w-3.5 h-3.5 text-[#39ff14] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {formatDate(log?.date)}
                </div>

                <div className="w-10 h-px bg-[#39ff14] mb-8" />

                {/* Content */}
                <div className="bg-[#141414] border border-[#1f1f1f] rounded-sm px-7 py-7 mb-8 text-gray-300 text-sm leading-relaxed prose prose-invert max-w-none prose-a:text-[#39ff14] hover:prose-a:text-[#39ff14]/80 prose-pre:bg-[#111] prose-pre:border prose-pre:border-[#1f1f1f] prose-pre:p-0 break-words overflow-hidden">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || "");
                                return !inline && match ? (
                                    <div className="my-5 border border-[#1f1f1f] rounded-sm overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2 bg-[#181818] border-b border-[#1f1f1f]">
                                            <span className="text-[10px] text-gray-500 tracking-widest uppercase">{match[1]}</span>
                                            <div className="flex gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                                                <span className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                                            </div>
                                        </div>
                                        <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{ margin: 0, background: "#111", padding: "1rem" }}
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, "")}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <code className="bg-[#1f1f1f] text-[#39ff14] px-1.5 py-0.5 rounded-sm font-mono text-[13px]" {...props}>
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {log?.content || ""}
                    </ReactMarkdown>
                </div>

                {/* Tags */}
                {log?.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-10">
                        {log.tags.map(tag => (
                            <span key={tag} className="text-[11px] border border-[#2a2a2a] text-gray-400 px-3 py-1 tracking-widest uppercase rounded-sm hover:border-[#39ff14] hover:text-[#39ff14] transition-colors">
                                [{tag}]
                            </span>
                        ))}
                    </div>
                )}

                {/* Images */}
                {log?.images?.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[#39ff14] text-[8px]">■</span>
                            <span className="text-gray-500 text-[10px] tracking-[0.2em] uppercase">
                                ATTACHMENTS_
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {log.images.map((img, i) => (
                                <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block border border-[#2a2a2a] p-1 bg-[#111111] hover:border-[#39ff14] transition-colors group">
                                    <img src={img} alt={`Attachment ${i + 1}`} className="h-32 w-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button
                        id="edit-log-btn"
                        onClick={() => navigate(`/logs/${id}/edit`)}
                        disabled={!!error}
                        className="flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-all duration-200 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        EDIT_ENTRY
                    </button>

                    <button
                        id="delete-log-btn"
                        onClick={handleDelete}
                        disabled={deleting || !!error}
                        className={`flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase border transition-all duration-200 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed
                            ${confirmDelete
                                ? "border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                                : "border-[#3a1a1a] text-red-500/70 hover:border-red-500 hover:text-red-400"}`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        {confirmDelete ? "CONFIRM_PURGE" : "PURGE_DATA"}
                    </button>

                    {confirmDelete && (
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="text-xs text-gray-600 hover:text-gray-400 tracking-widest uppercase transition-colors"
                        >
                            [CANCEL]
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import TAGS from "../constants/tags";
import ErrorAlert from "../components/ErrorAlert";

export default function EditLog() {
    const { id }   = useParams();
    const navigate = useNavigate();

    // — state placeholders (you fill the logic) —
    const [title, setTitle]               = useState("");
    const [content, setContent]           = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [showAllTags, setShowAllTags]   = useState(false);
    const [error, setError]               = useState("");
    const [isLoading, setIsLoading]       = useState(false);

    useEffect(() => {
        const fetchLog = async () => {
            try {
                const response = await axios.get(`/api/logs/${id}`);
                setTitle(response.data.title);
                setContent(response.data.content);
                setSelectedTags(response.data.tags);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load log.");
            }
        };
        fetchLog();
    }, []);

    const handleTagSelect = (tag) =>
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );

    const displayTags = showAllTags ? TAGS : TAGS.slice(0, 10);
    
    // stub handlers — you implement these
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.put(`/api/logs/${id}`, {
                title,
                content,
                tags: selectedTags,
            });
            navigate(`/logs/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save.");
        } finally {
            setIsLoading(false);
        }
    };
    const handleDiscard = () => navigate(`/logs/${id}`);

    return (
        <div className="min-h-screen bg-[#0a0a0a] font-mono p-4 flex flex-col">
            <div className="flex-1 border border-[#1e1e1e] flex flex-col px-6 py-6">

                {error && <ErrorAlert error={error} onClose={() => setError("")} />}

                {/* ── Header ── */}
                <div className="mb-2">
                    <h1 className="text-4xl font-black tracking-tight leading-tight">
                        <span className="text-white">EDIT_LOG // </span>
                        <span className="text-[#A8FF3E]">ID: {id?.slice(0, 16)}…</span>
                    </h1>
                    <div className="w-10 h-0.5 bg-[#A8FF3E] mt-3" />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-0 mt-6">

                    {/* ── Title ── */}
                    <div className="mb-5">
                        <label className="block text-[#A8FF3E] text-[10px] tracking-[0.2em] uppercase mb-2 opacity-80">
                            &gt; TITLE:
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={!!error || isLoading}
                            placeholder="ENTER_TITLE..."
                            maxLength={100}
                            className="w-full bg-transparent text-white text-xl font-black tracking-tight border-b border-[#A8FF3E] pb-2 focus:outline-none placeholder:text-[#2a2a2a] disabled:opacity-40 caret-[#A8FF3E]"
                        />
                    </div>

                    {/* ── Tags ── */}
                    <div className="mb-5">
                        <label className="block text-[#A8FF3E] text-[10px] tracking-[0.2em] uppercase mb-3 opacity-80">
                            &gt; TAGS:
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {displayTags.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    disabled={!!error || isLoading}
                                    onClick={() => handleTagSelect(tag)}
                                    className={`px-3 py-1 text-[10px] tracking-widest uppercase border transition-colors disabled:opacity-40
                                        ${selectedTags.includes(tag)
                                            ? "border-[#A8FF3E] text-[#A8FF3E] bg-[#A8FF3E15]"
                                            : "border-[#2a2a2a] text-[#555] hover:border-[#555] hover:text-[#999]"
                                        }`}
                                >
                                    [{tag.replace(/ /g, "_").toUpperCase()}]
                                </button>
                            ))}
                            {!showAllTags && TAGS.length > 10 && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllTags(true)}
                                    disabled={!!error || isLoading}
                                    className="px-3 py-1 text-[10px] tracking-widest uppercase border border-dashed border-[#2a2a2a] text-[#414A35] hover:border-[#A8FF3E] hover:text-[#A8FF3E] transition-colors disabled:opacity-40"
                                >
                                    +
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Editor ── */}
                    <div className="flex-1 border border-[#1e1e1e] bg-[#0d0d0d] flex flex-col mb-0">

                        {/* top bar */}
                        <div className="flex justify-between items-center px-4 py-1.5 border-b border-[#1e1e1e]">
                            <span className="text-[#2a2a2a] text-[9px] tracking-widest uppercase">
                                SRC/JOURNAL/LOGS/{id?.slice(-8).toUpperCase()}.MD
                            </span>
                            <span className="text-[#2a2a2a] text-[9px] tracking-widest">
                                UTF-8 // LF
                            </span>
                        </div>

                        {/* line numbers + textarea */}
                        <div className="flex flex-1 min-h-[280px]">
                            <div className="flex flex-col items-end px-3 pt-3 select-none min-w-[40px] border-r border-[#1a1a1a]">
                                {(content || " ").split("\n").map((_, i) => (
                                    <span key={i} className="text-[#2a2a2a] text-[11px] leading-6">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                ))}
                            </div>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                disabled={!!error || isLoading}
                                placeholder="// start editing..."
                                className="flex-1 bg-transparent text-[#A8FF3E] text-[13px] leading-6 pt-3 px-4 pb-3 resize-none focus:outline-none placeholder:text-[#1e2e1e] disabled:opacity-40 caret-[#A8FF3E] italic"
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    {/* ── Bottom actions ── */}
                    <div className="flex border border-t-0 border-[#1e1e1e]">
                        <button
                            type="submit"
                            disabled={!!error || isLoading}
                            className="flex-1 py-4 text-sm font-black tracking-[0.2em] uppercase bg-[#A8FF3E] text-[#0F2000] hover:bg-[#89dc12] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "SAVING..." : "SAVE_CHANGES"}
                        </button>
                        <button
                            type="button"
                            onClick={handleDiscard}
                            disabled={!!error || isLoading}
                            className="flex-1 py-4 text-sm font-black tracking-[0.2em] uppercase bg-[#111] text-[#555] border-l border-[#1e1e1e] hover:text-[#999] hover:bg-[#161616] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            DISCARD_LOCAL
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
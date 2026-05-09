import { useEffect, useState } from "react"
import axios from "../api/axios"
import TAGS from "../constants/tags"
import { useNavigate } from "react-router-dom"
import ErrorAlert from "../components/ErrorAlert"
import MDEditor from "@uiw/react-md-editor"
import { DAILY_LOG_LIMIT_ERROR, hasReachedDailyLogLimit } from "../utils/logLimits"
import PageLoader from "../components/PageLoader"
import useDelayedLoader from "../utils/useDelayedLoader"

export default function CreateLog() {
    const navigate = useNavigate();
    let [title, setTitle] = useState("");
    let [selectedTags, setSelectedTags] = useState([]);
    let [content, setContent] = useState("");
    let [showAllTags, setShowAllTags] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [dailyLimitReached, setDailyLimitReached] = useState(false);

    const [images, setImages] = useState([]);
    const { loading, setLoading, showLoader } = useDelayedLoader();

    useEffect(() => {
        const checkDailyLimit = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/logs`);
                if (hasReachedDailyLogLimit(response.data || [])) {
                    setDailyLimitReached(true);
                    setError(DAILY_LOG_LIMIT_ERROR);
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        checkDailyLimit();
    }, []);

    const handleTagSelect = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 3) {
            setError("MAXIMUM_3_IMAGES_ALLOWED");
            return;
        }
        setImages([...images, ...files]);
    }

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    }

    const showMoreTags = () => setShowAllTags(true);
    const discardCreation = () => { setTitle(""); setSelectedTags([]); setContent(""); setShowAllTags(false); setImages([]); }

    const handleSubmit = async (evt) => {
        evt.preventDefault();
        if (dailyLimitReached) {
            setError(DAILY_LOG_LIMIT_ERROR);
            return;
        }

        setIsLoading(true);
        try {
            if (!title) throw new Error("title is required");
            if (!content) throw new Error("content is required");
            
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("tags", JSON.stringify(selectedTags));
            images.forEach(img => formData.append("images", img));

            await axios.post(`${import.meta.env.VITE_API_URL}/api/logs/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/logs', { state: { successMessage: "LOG_STORED_SUCCESSFULLY" } });
        } catch (err) {
            setError(err.response ? err.response.data.message : err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
    const complexity = wordCount < 50 ? "LOW" : wordCount < 150 ? "MED" : "HIGH";
    const today = new Date().toISOString().split('T')[0];
    const displayTags = showAllTags ? TAGS : TAGS.slice(0, 10);
    const formDisabled = dailyLimitReached || error !== "" || isLoading;

    if (loading) return showLoader ? <PageLoader label="LOADING ENTRY" /> : <div className="min-h-screen bg-[#0a0a0a]" />;

    return (
        <div className="min-h-screen bg-[#0a0a0a] font-mono p-4 flex flex-col">
        <div className="flex-1 border border-[#6B21A8] shadow-[0_0_30px_#6B21A840] flex flex-col px-6 py-6">

            {error && <ErrorAlert error={error} onClose={() => setError("")} />}

            {/* Header */}
            <div className="flex items-end justify-between mb-6">
                <div>
                    <p className="text-[#A8FF3E] text-[10px] tracking-[0.2em] uppercase mb-1 opacity-70">
                        SYSTEM_V2.0 // INPUT_MODE
                    </p>
                    <h1 className="text-white text-5xl font-black tracking-tighter leading-none">
                        NEW_ENTRY
                    </h1>
                </div>
                <div className="flex items-center gap-2 text-[#4AF0FF] text-[11px] tracking-widest">
                    <i className="fa-regular fa-calendar text-xs"></i>
                    <span>&gt; DATE: <span className="text-[#4AF0FF]">{today}</span></span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-0">

                {/* Title input row */}
                <div className="flex items-center gap-3 py-3 border-b border-[#1e1e1e] mb-4">
                    <span className="text-[#A8FF3E] text-[11px] tracking-[0.2em] uppercase font-bold shrink-0">TITLE:</span>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={formDisabled}
                        placeholder="ENTER_ENTRY_NAME..."
                        maxLength={100}
                        className="flex-1 bg-transparent text-[#4AF0FF] text-xl font-black tracking-tight focus:outline-none placeholder:text-[#1a3a3a] disabled:opacity-40 caret-[#4AF0FF]"
                    />
                </div>

                {/* Editor area */}
                <div className="border border-[#1e1e1e] bg-[#0d0d0d] flex-1 flex flex-col">

                    {/* Editor top bar */}
                    <div className="flex justify-between items-center px-4 py-1.5 border-b border-[#1e1e1e]">
                        <span className="text-[#414A35] text-[9px] tracking-widest uppercase">
                            SRC/JOURNAL/LOGS/CURRENT.MD
                        </span>
                        <span className="text-[#414A35] text-[9px] tracking-widest">
                            UTF-8 // LF
                        </span>
                    </div>

                    {/* Editor body */}
                    <div className="flex-1 overflow-auto custom-md-editor-wrapper">
                        <MDEditor
                            value={content}
                            onChange={(val) => {
                                const newWordCount = (val || "").trim() === "" ? 0 : (val || "").trim().split(/\s+/).length;
                                if (newWordCount > 800) {
                                    setError("WORD_LIMIT_EXCEEDED");
                                    return;
                                }
                                setContent(val || "");
                            }}
                            preview="edit"
                            height={400}
                            textareaProps={{
                                disabled: formDisabled,
                                placeholder: "INIT LOG: Start writing your entry here (Markdown supported)..."
                            }}
                            className="bg-transparent"
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                boxShadow: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Classifiers */}
                <div className="border-x border-b border-[#1e1e1e] bg-[#0d0d0d] px-4 py-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[#A8FF3E] text-[8px]">■</span>
                        <span className="text-[#C0CAAF] text-[10px] tracking-[0.2em] uppercase opacity-60">
                            CLASSIFIERS
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {displayTags.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                disabled={formDisabled}
                                onClick={() => handleTagSelect(tag)}
                                className={`px-3 py-1 text-[10px] tracking-widest uppercase border transition-colors disabled:opacity-40
                                    ${selectedTags.includes(tag)
                                        ? 'border-[#A8FF3E] text-[#A8FF3E] bg-[#A8FF3E10]'
                                        : 'border-[#2a2a2a] text-[#C0CAAF] opacity-50 hover:opacity-100 hover:border-[#414A35]'
                                    }`}
                            >
                                [{tag.replace(/ /g, "_").toUpperCase()}]
                            </button>
                        ))}
                        {!showAllTags && (
                            <button
                                type="button"
                                onClick={showMoreTags}
                                disabled={formDisabled}
                                className="px-3 py-1 text-[10px] tracking-widest uppercase border border-dashed border-[#2a2a2a] text-[#414A35] hover:border-[#A8FF3E] hover:text-[#A8FF3E] transition-colors"
                            >
                                + MORE
                            </button>
                        )}
                    </div>
                </div>

                {/* Images */}
                <div className="border-x border-b border-[#1e1e1e] bg-[#0d0d0d] px-4 py-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[#A8FF3E] text-[8px]">■</span>
                        <span className="text-[#C0CAAF] text-[10px] tracking-[0.2em] uppercase opacity-60">
                            ATTACHMENTS [MAX_3]
                        </span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        {images.length > 0 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {images.map((img, i) => (
                                    <div key={i} className="relative border border-[#2a2a2a] p-1 bg-[#111111] group">
                                        <img src={URL.createObjectURL(img)} alt="preview" className="h-20 w-auto object-cover opacity-80" />
                                        <button 
                                            type="button" 
                                            onClick={() => removeImage(i)}
                                            disabled={formDisabled}
                                            className="absolute top-2 right-2 bg-[#111111] text-[#FF4444] text-[10px] w-5 h-5 flex items-center justify-center border border-[#FF4444] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {images.length < 3 && (
                            <label className="cursor-pointer border border-dashed border-[#2a2a2a] text-[#C0CAAF] opacity-50 hover:opacity-100 hover:border-[#A8FF3E] hover:text-[#A8FF3E] transition-colors py-3 flex justify-center items-center text-[10px] tracking-widest uppercase">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    multiple 
                                    onChange={handleImageChange} 
                                    className="hidden" 
                                    disabled={formDisabled}
                                />
                                + [ UPLOAD_IMAGE_DATA ]
                            </label>
                        )}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-x border-b border-[#1e1e1e] bg-[#0a0a0a] px-4 py-3 flex items-center justify-between">
                    {/* Meta info */}
                    <div className="flex gap-6">
                        <div>
                            <p className="text-[#414A35] text-[9px] tracking-widest uppercase">WORDS</p>
                            <p className="text-[#A8FF3E] text-[12px] font-bold">{String(wordCount).padStart(4, "0")}</p>
                        </div>
                        <div>
                            <p className="text-[#414A35] text-[9px] tracking-widest uppercase">COMPLEXITY</p>
                            <p className="text-[#A8FF3E] text-[12px] font-bold">{complexity}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            disabled={formDisabled}
                            onClick={discardCreation}
                            className="px-6 py-2 text-[11px] tracking-widest uppercase border border-[#2a2a2a] text-[#C0CAAF] hover:border-[#C0CAAF] transition-colors disabled:opacity-40"
                        >
                            DISCARD_LOCAL
                        </button>
                        <button
                            type="submit"
                            disabled={formDisabled}
                            className="px-6 py-2 text-[11px] tracking-widest uppercase bg-[#A8FF3E] text-[#0F2000] font-black hover:bg-[#89dc12] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "COMMITTING..." : "COMMIT LOG"}
                        </button>
                    </div>
                </div>

            </form>
        </div>
        </div>
    )
}

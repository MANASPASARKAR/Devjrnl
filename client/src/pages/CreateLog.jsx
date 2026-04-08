import { useState } from "react"
import axios from "axios"
import TAGS from "../../../server/constants/tags"
import { useNavigate } from "react-router-dom"
import ErrorAlert from "../components/ErrorAlert"


export default function CreateLog () {
    const navigate = useNavigate();
    let [selectedTags, setSelectedTags] = useState([]);
    let [content, setContent] = useState("");
    let [showAllTags, setShowAllTags] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter(t => t !== tag))  // remove it
    } else {
        setSelectedTags([...selectedTags, tag])  // add it
    }
}

    const HandleContentChange = (evt) => {
        setContent(evt.target.value);
    }

    const showMoreTags = () => {
        setShowAllTags(true)
    }

    const discardCreation = () => {
        setSelectedTags([]);
        setContent("");
        setShowAllTags(false);
    }

    const handleSubmit = async (evt) => {
        evt.preventDefault();
        setIsLoading(true);
        try {

            if(!content) {
                throw new Error("content is required");
            }

        let body = {
            content: content,
            tags: selectedTags,
        }

        const response = await axios.post("/api/logs/", body);
        navigate('/dashboard');
        
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message)
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        } 

    } 

    return (
        <div>
            {error && <ErrorAlert error={error} onClose={() => setError("")} />}
            <p>system_v2.0 // INPUT MODE</p>
            <h1>NEW_ENTRY</h1>
            <div><span>DATE: {new Date().toISOString().split('T')[0]}</span></div>

            <form onSubmit={handleSubmit}>
                <textarea disabled={error !== "" || isLoading} name="content" placeholder="Write here" value={content} onChange={HandleContentChange}></textarea>

                {showAllTags? TAGS.map(tag => <button type="button" key={tag} disabled={error !== "" || isLoading} onClick={() => handleTagSelect(tag)} className={selectedTags.includes(tag) ? "tag-active" : "tag-inactive"} >{tag}</button>) : TAGS.slice(0, 8).map(tag => <button key={tag} type="button" disabled={error !== "" || isLoading} onClick={() => handleTagSelect(tag)} className={selectedTags.includes(tag) ? "tag-active" : "tag-inactive"} >{tag}</button>)}
                {!showAllTags && <button type="button" disabled={error !== ""} onClick={showMoreTags}>Show all tags</button>}
                <button type="button" disabled={error !== "" || isLoading} onClick={discardCreation}>DISCARD_LOCAL</button>
                <button disabled={error !== "" || isLoading} type="submit">COMMIT_LOG</button>
            </form>

        </div>
    )

}
export default function ErrorAlert({ error, onClose }) {
    return (
        <div>
            <div>
                <span>[SYSTEM_CRITICAL]</span>
                <span>{error}</span>
            </div>

            <div>
                <button onClick={onClose}>[ESC]</button>
            </div>
        </div>
    )
}
import { useState } from "react"
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import ErrorAlert from "../components/ErrorAlert"

export default function Register() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    let [username, setUsername] = useState("");
    let [email, setEmail] = useState("");
    let [name, setName] = useState("");
    let [password, setPassword] = useState("");
    let [confirmPass, setConfirmPass] = useState("");

    const handleSubmit = async (evt) => {
        setError("");
        evt.preventDefault();
        setIsLoading(true);
        try {

            if (!username || !password || !email || !confirmPass || !name) {
                throw new Error("All the info is required");
            }

            if (password != confirmPass) {
                throw new Error("Passwords dont match");
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error("invalid email address");
            }

            const body = {
                username,
                password,
                email,
                name,
            }

            const response = await axios.post("/api/auth/register", body);
            console.log(response.data);
            localStorage.setItem('username', response.data.username)
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

    const handleUsernameChange = (evt) => {
        setError("");
        setUsername(evt.target.value);
    }

    const handleNameChange = (evt) => {
        setError("");
        setName(evt.target.value);
    }

    const handleEmailChange = (evt) => {
        setError("");
        setEmail(evt.target.value);
    }

    const handleConfirmPassChange = (evt) => {
        setError("");
        setConfirmPass(evt.target.value);
    }

    const handlePasswordChange = (evt) => {
        setError("");
        setPassword(evt.target.value);
    }

    const goToLogin = (evt) => {
        navigate("/login");
    }

    return (
        <>
            {error && <ErrorAlert error={error} onClose={() => setError("")} />}
            <form onSubmit={handleSubmit}>

                <label htmlFor="username">INIT_USERNAME</label>
                <input type="text" disabled={error !== ""} placeholder="USERNAME" name="username" value={username} onChange={handleUsernameChange} />

                <label htmlFor="email">INIT_EMAIL</label>
                <input type="text" disabled={error !== ""} placeholder="EMAIL" name="email" value={email} onChange={handleEmailChange} />

                <label htmlFor="name">INIT_NAME</label>
                <input type="text" disabled={error !== ""} placeholder="NAME" name="name" value={name} onChange={handleNameChange} />

                <label htmlFor="password">INIT_PASSWORD</label>
                <input type="password" disabled={error !== ""} placeholder="ENTER_PASSWORD" name="password" value={password} onChange={handlePasswordChange} />

                <label htmlFor="confirmPass">CONFIRM_INIT_PASSWORD</label>
                <input type="password" disabled={error !== ""} placeholder="CONFIRM_PASSWORD" name="confirmPass" value={confirmPass} onChange={handleConfirmPassChange} />

                {(isLoading || (error !== "")) ? <button disabled>REGISTER_NEW_USER</button> : <button>REGISTER_NEW_USER</button>}

            </form>

            <hr></hr>

            <button onClick={goToLogin}>Back To Login</button>
        </>
    )
}
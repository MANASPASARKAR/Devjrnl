import { useState } from "react"
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import ErrorAlert from "../components/ErrorAlert"

export default function Login() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    let [identifier, setIdentifier] = useState("");
    let [password, setPassword] = useState("");

    const handleSubmit = async (evt) => {
        setError("");
        evt.preventDefault();
        setIsLoading(true);
        try {

            if (!identifier || !password) {
                throw new Error("identifier and password are required");
            }

            const body = {
                identifier,
                password
            }

            const response = await axios.post("/api/auth/login", body);
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

    const handleIdentifierChange = (evt) => {
        setError("");
        setIdentifier(evt.target.value);
    }

    const handlePasswordChange = (evt) => {
        setError("");
        setPassword(evt.target.value);
    }

    const goToRegister = (evt) => {
        navigate("/register")
    }

    return (
        <>
            {error && <ErrorAlert error={error} onClose={() => setError("")} />}
            <form onSubmit={handleSubmit}>

                <label  htmlFor="identifier">IDENTIFY_USER</label>
                <input type="text" disabled={error !== "" || isLoading} placeholder="USERNAME_OR_EMAIL" name="identifier" value={identifier} onChange={handleIdentifierChange} />

                <label htmlFor="password">ACCESS_KEY</label>
                <input type="password" disabled={error !== "" || isLoading} placeholder="ENTER_PASSWORD" name="password" value={password} onChange={handlePasswordChange} />
                <button  disabled={error !== "" || isLoading} >[EXECUTE_LOGIN]</button> 
            </form>

            <hr></hr>
 
            <p>New User?</p>
            <button onClick={goToRegister}>CREATE_ACCOUNT</button>
        </>
    )
}
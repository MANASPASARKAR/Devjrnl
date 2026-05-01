import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = !!localStorage.getItem('username');

    const SignOut = async () => {
        await axios.post("/api/auth/logout");
        localStorage.removeItem('username');
        navigate('/login');
    }

    const navLinks = [
        { label: 'LOG', path: '/logs' },
        { label: 'DASHBOARD', path: '/dashboard' },
        { label: 'CREATE', path: '/createlog' },
    ];

    const linkClass = (path) => {
        const isActive = location.pathname === path;
        return `relative px-5 h-12 text-[11px] tracking-[0.2em] uppercase transition-all
            ${isActive
                ? 'text-[#A8FF3E] underline underline-offset-12 decoration-[#A8FF3E]'
                : 'text-[#C0CAAF] opacity-60 hover:opacity-100 hover:text-[#A8FF3E] hover:underline hover:underline-offset-12 hover:decoration-[#A8FF3E]'
            }`;
    };

    const rightBtnClass = "text-[#C0CAAF] text-[11px] tracking-[0.2em] uppercase opacity-60 hover:opacity-100 hover:text-[#A8FF3E] hover:underline hover:underline-offset-12 hover:decoration-[#A8FF3E] h-12 px-3 transition-all";

    return (
        <nav className="w-full bg-[#0a0a0a] border-b border-[#1e1e1e] flex items-center justify-between px-6 h-12 font-mono">

            {/* Logo */}
            <span
                className="text-[#A8FF3E] font-black text-lg tracking-tight cursor-pointer select-none"
                onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
            >
                Devjrnl
            </span>

            {/* Center — only show nav links when logged in */}
            <div className="flex items-center">
                {isLoggedIn && navLinks.map(({ label, path }) => (
                    <button key={path} onClick={() => navigate(path)} className={linkClass(path)}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Right — LOGOUT when in, LOGIN + REGISTER when out */}
            <div className="flex items-center">
                {isLoggedIn ? (
                    <button onClick={SignOut} className={rightBtnClass}>LOGOUT</button>
                ) : (
                    <>
                        <button onClick={() => navigate('/login')} className={rightBtnClass}>LOGIN</button>
                        <button onClick={() => navigate('/register')} className={rightBtnClass}>REGISTER</button>
                    </>
                )}
            </div>

        </nav>
    )
}
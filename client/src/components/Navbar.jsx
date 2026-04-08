import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

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

    return (
        <nav className="w-full bg-[#0a0a0a] border-b border-[#1e1e1e] flex items-center justify-between px-6 h-12 font-mono">

            {/* Logo */}
            <span
                className="text-[#A8FF3E] font-black text-lg tracking-tight cursor-pointer select-none"
                onClick={() => navigate('/dashboard')}
            >
                DevLog
            </span>

            {/* Center links */}
            <div className="flex items-center">
                {navLinks.map(({ label, path }) => {
                    const isActive = location.pathname === path;
                    return (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className={`
                                relative px-5 h-12 text-[11px] tracking-[0.2em] uppercase transition-all
                                ${isActive
                                    ? 'text-[#A8FF3E] underline underline-offset-12 decoration-[#A8FF3E]'
                                    : 'text-[#C0CAAF] opacity-60 hover:opacity-100 hover:text-[#A8FF3E] hover:border-l-2 hover:border-[#A8FF3E]'
                                }
                            `}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Right: Logout */}
            <button
                onClick={SignOut}
                className="text-[#C0CAAF] text-[11px] tracking-[0.2em] uppercase opacity-60 hover:opacity-100 hover:text-[#A8FF3E] hover:border-l-2 hover:border-[#A8FF3E] h-12 px-3 transition-all"
            >
                LOGOUT
            </button>

        </nav>
    )
}
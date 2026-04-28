import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function Dashboard() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            const response = await axios.get("/api/dashboard");
            setDashboardData(response.data);
        };
        fetchDashboard();
    }, [])

    const redirectToLogs = () => {
        navigate('/logs');
    }

    if (!dashboardData) return <p>Loading...</p>;

    return (
        <div>
            <h1>Dashboard</h1>
            <h1>current streak: {dashboardData.currentStreak}</h1>
            <h1>longest streak: {dashboardData.longestStreak}</h1>
            <h1>total logs: {dashboardData.totalLogs}</h1>
            <h1>Logs This Week: {dashboardData.logsThisWeek}</h1>

            heatmap
            weekly summary

            <h1>recent history:</h1>
            {dashboardData.recentLogs.map((log) => (
                <div key={log._id}>
                    <h3>{log.title}</h3>
                    <h3>{new Date(log.date).toLocaleDateString()}</h3>
                    <h2>{log.content}</h2>
                    <h3>{log.tags.join(", ")}</h3>
                </div>
            ))}
            <button onClick={redirectToLogs}>view_All_Logs</button>
        </div>
    )
}
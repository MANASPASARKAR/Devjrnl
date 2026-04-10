import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"
import Logs from "./pages/Logs";
import CreateLog from "./pages/CreateLog"
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function AppLayout() {
  const location = useLocation();
  const hideNav = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/createlog" element={<CreateLog />} />
      </Routes>
      <Footer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App

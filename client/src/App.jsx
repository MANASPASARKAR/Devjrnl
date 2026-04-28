import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"
import Logs from "./pages/Logs";
import Log from "./pages/Log";
import CreateLog from "./pages/CreateLog"
import EditLog from "./pages/EditLog"
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

function AppLayout() {
  const location = useLocation();
  const hideNav = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        <Route path="/logs/:id" element={<ProtectedRoute><Log /></ProtectedRoute>} />
        <Route path="/createlog" element={<ProtectedRoute><CreateLog /></ProtectedRoute>} />
        <Route path="/logs/:id/edit" element={<ProtectedRoute><EditLog /></ProtectedRoute>} />
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

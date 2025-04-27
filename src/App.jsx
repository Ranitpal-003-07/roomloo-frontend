import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import PGs from "./pages/PGs";
import Roommate from "./pages/Roommate";
import Update from "./pages/Update";
import Login from "./pages/Auth";
import Profile from "./pages/Profile";
import Onboarding from "./pages/onboarding";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Subscription from "./pages/Subscription";
import { useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import Chat from './pages/Chat';

function App() {
  const { loading, user:currentUser } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="app-container">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/pgs" element={<PGs />} />
              <Route path="/roommate" element={<Roommate />} />
              <Route path="/update" element={<Update />} />
              <Route path="/subscription" element={<Subscription />} />
            </Route>
          </Routes>

          {/* Only show chat if user is logged in */}
          {currentUser && <Chat />}
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

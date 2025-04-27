import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext"; // Import Auth Context
import "../styles/Navbar.css";
import { useNavigate, NavLink } from "react-router-dom";




function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth(); // Get user & logout function
  
  const navigate = useNavigate(); // Initialize navigate

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from AuthContext
      navigate("/auth", { replace: true }); // Navigate to auth page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };  // Check if user is a PG owner based on the isPgOwner property
  const isPgOwner = user?.isPgOwner === true;
  
  
  return (
    <nav className="navbar">
      <div className="logo">Roomloo</div>
      {/* Normal Navbar (Visible on larger screens) */}
      <div className="nav-links-container">
        <div className="nav-links">
          <NavLink to="/" className="nav-item">Home</NavLink>
          <NavLink to="/pgs" className="nav-item">PGs</NavLink>
          
          {/* Conditionally show Roommate or Dashboard based on isPgOwner property */}
          {user && (
            isPgOwner ? 
            <NavLink to="/dashboard" className="nav-item">Dashboard</NavLink> : 
            <NavLink to="/roommate" className="nav-item">Roommate</NavLink>
          )}
          
          {!user && <NavLink to="/roommate" className="nav-item">Roommate</NavLink>}
          <NavLink to="/update" className="nav-item">Update</NavLink>
        </div>
        <div className="auth-section">
          {user ? (
            // Show Profile Icon if User is Logged In
            <div className="profile-container" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <FaUserCircle className="profile-icon" />
              {isProfileOpen && (
                <div className="profile-dropdown">
                  <NavLink to="/profile" className="dropdown-item">Profile</NavLink>
                  {isPgOwner && <NavLink to="/dashboard" className="dropdown-item">Dashboard</NavLink>}
                  <button className="dropdown-item logout-btn" onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            // Show Login Button if No User
            <NavLink to="/auth" className="login-btn">LogIn/SignUp</NavLink>
          )}
        </div>
      </div>
      {/* Hamburger Menu (For Mobile) */}
      <div className="hamburger-menu">
        <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
          &#9776;
        </div>
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
          <NavLink to="/" className="nav-item" onClick={() => setIsOpen(false)}>Home</NavLink>
          <NavLink to="/pgs" className="nav-item" onClick={() => setIsOpen(false)}>PGs</NavLink>
          
          {/* Conditionally show Roommate or Dashboard based on isPgOwner property */}
          {user && (
            isPgOwner ? 
            <NavLink to="/dashboard" className="nav-item" onClick={() => setIsOpen(false)}>Dashboard</NavLink> : 
            <NavLink to="/roommate" className="nav-item" onClick={() => setIsOpen(false)}>Roommate</NavLink>
          )}
          
          {!user && <NavLink to="/roommate" className="nav-item" onClick={() => setIsOpen(false)}>Roommate</NavLink>}
          <NavLink to="/update" className="nav-item" onClick={() => setIsOpen(false)}>Update</NavLink>
         
          <div className="auth-section">
            {user ? (
              // Show Profile Icon if User is Logged In
              <div className="profile-container" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <FaUserCircle className="profile-icon" />
                {isProfileOpen && (
                  <div className="profile-dropdown">
                    <NavLink to="/profile" className="dropdown-item">Profile</NavLink>
                    {isPgOwner && <NavLink to="/dashboard" className="dropdown-item">Dashboard</NavLink>}
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              // Show Login Button if No User
              <NavLink to="/auth" className="login-btn" onClick={() => setIsOpen(false)}>LogIn/SignUp</NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
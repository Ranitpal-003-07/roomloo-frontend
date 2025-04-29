import { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Auth.css";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isPgOwner, setIsPgOwner] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const checkUserExistsAndRedirect = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      navigate("/profile");
    } else {
      navigate("/onboarding");
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;

        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          email: user.email,
          isPgOwner,
          createdAt: new Date(),
          onboardingComplete: isPgOwner,
        });

        navigate(isPgOwner ? "/profile" : "/onboarding");
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;
        await checkUserExistsAndRedirect(user);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          isPgOwner,
          createdAt: new Date(),
          onboardingComplete: isPgOwner,
        });
        navigate(isPgOwner ? "/profile" : "/onboarding");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="bdy">
      <div className={`container ${isSignUp ? "active" : ""}`}>
        {/* Sign Up Form */}
        <div className="form-container sign-up">
          <form onSubmit={handleAuth}>
            <h1>Create Account</h1>
            <div className="social-icons">
              <a
                href="#"
                className="icon"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoogleSignIn();
                }}
              >
                <i className="fab fa-google-plus-g"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your email for registration</span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
              <input
                type="checkbox"
                id="pgOwnerSignup"
                checked={isPgOwner}
                onChange={(e) => setIsPgOwner(e.target.checked)}
              />
              <label htmlFor="pgOwnerSignup" style={{ marginLeft: "8px" }}>
                PG Owner?
              </label>
            </div>
            <button type="submit" className="btn1">
              Sign Up
            </button>
            <div className="hidden2">
              <p>Already have an account?</p>
              <button
                type="button"
                className="switch-btn"
                onClick={() => setIsSignUp(false)}
              >
                Switch to Sign In
              </button>
            </div>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in">
          <form onSubmit={handleAuth}>
            <h1>Sign In</h1>
            <div className="social-icons">
              <a
                href="#"
                className="icon"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoogleSignIn();
                }}
              >
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your email password</span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <a href="#">Forgot Your Password?</a>
            
            <button type="submit" className="btn1">
              Sign In
            </button>
            <div className="hidden2">
              <p>Don't have an account?</p>
              <button
                type="button"
                className="switch-btn"
                onClick={() => setIsSignUp(true)}
              >
                Switch to Sign Up
              </button>
            </div>
          </form>
        </div>

        {/* Toggle Section */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all site features</p>
              <button className="hidden1" onClick={() => setIsSignUp(false)}>
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all site features</p>
              <button className="hidden1" onClick={() => setIsSignUp(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
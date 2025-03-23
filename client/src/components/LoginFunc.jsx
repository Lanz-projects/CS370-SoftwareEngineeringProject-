import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { useState } from "react";
import { app } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import styles from './loginFunc.module.css'

function Login() {
  const [loginError, setLoginError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const navigate = useNavigate();

  const HandleGoogleLogin = async () => {
    setLoginError("");
    setSuccessMessage("");
    setIsProcessing(true);

    try {
      googleProvider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, googleProvider);
      if (!result.user || !result.user.email) {
        throw new Error("Authentication failed. Please try again.");
      }

      const user = result.user;
      const emailDomain = user.email.split("@")[1];

      if (emailDomain !== "truman.edu") {
        await signOut(auth); // Sign out if not allowed
        setLoginError("Only @truman.edu emails are allowed.");
        return;
      }

      setSuccessMessage("Google Login successful! Redirecting...");
      navigate("/dashboard");
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        setLoginError("Login cancelled. Please try again.");
      } else if (error.code === "auth/network-request-failed") {
        setLoginError("Network error. Check your connection and try again.");
      } else {
        setLoginError(error.message || "An unexpected error occurred.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`container d-flex justify-content-center align-items-center vh-100`}>
      <div className={`card p-4 shadow-lg ${styles.cardContainer}`}>
        <h2 className="text-center mb-4">Login</h2>
        <form>
          <button 
            type="button" 
            className="btn btn-danger w-100" 
            onClick={HandleGoogleLogin}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Login with Google"}
          </button>
          {loginError && <p className="text-danger mt-2">{loginError}</p>}
          {successMessage && <p className="text-success mt-2">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;

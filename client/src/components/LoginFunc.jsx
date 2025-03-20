import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { app } from "../firebase";
import styles from "./loginFunc.module.css"; // Import custom styles

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const navigate = useNavigate();

  const HandleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setSuccessMessage("");

    try {
      // Handles the given user info (email and password) and sends it to Firebase 
      await signInWithEmailAndPassword(auth, email, password); 
      setSuccessMessage("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1000); // Redirect after 1 seconds
    } catch (error) {
      setLoginError(error.message);
    }
  };

  const HandleGoogleLogin = async () => {
    setLoginError("");
    setSuccessMessage("");

    try {
      // Allows you to select the account 
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      // Shows the google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get email domain
      const emailDomain = user.email.split('@')[1];
      
      // Checks if the account has ~@truman.edu and 
      // does not allow anything else
      if (emailDomain !== "truman.edu") {
        await signOut(auth);
        setLoginError("Only @truman.edu emails are allowed.");
        return;
      }
      setSuccessMessage("Google Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1000); // Redirect after 1 seconds
    } catch (error) {
      setLoginError(error.message);
    }
  };

  return (
    <div className = {`container d-flex justify-content-center align-items-center vh-100`}>
      <div className = {`card p-4 shadow-lg ${styles.cardContainer}`}>
        <h2 className = "text-center mb-4">Login</h2>
        <form onSubmit = {HandleLogin}>
          <button type = "button" className = "btn btn-danger w-100" onClick = {HandleGoogleLogin}>
            Login with Google
          </button>
          {loginError && <p className = "text-danger mt-2">{loginError}</p>}
          {successMessage && <p className = "text-success mt-2">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;
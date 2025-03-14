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
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get email domain
      const emailDomain = user.email.split('@')[1];
      
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
          <div className = "mb-3">
            <label className = "form-label">Email</label>
            <input 
              type = "email" 
              className = "form-control" 
              value = {email} 
              onChange = {(e) => setEmail(e.target.value)} 
              placeholder = "Enter your email" 
            />
          </div>
          <div className = "mb-3">
            <label className = "form-label">Password</label>
            <input 
              type = "password" 
              className = "form-control" 
              value = {password} 
              onChange = {(e) => setPassword(e.target.value)} 
              placeholder = "Enter your password" 
            />
          </div>
          <button type = "submit" className = "btn btn-primary w-100">Login</button>
          <p className = "text-center my-2">OR</p>
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
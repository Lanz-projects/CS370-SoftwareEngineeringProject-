import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useState } from "react";
import { app } from "../firebase";
import styles from "./registration.module.css";


function Registration() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@truman\.edu$/;
    return emailRegex.test(email);
  };

  // Validate password length
  const isValidPassword = (password) => password.length >= 8;

  const HandleSignup = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setSignUpError("Invalid email. Only @truman.edu domain is allowed.");
      return;
    }
    if (!isValidPassword(password)) {
      setSignUpError("Password must be at least 8 characters long.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccessMessage("Signup successful! You are now logged in.");
      setSignUpError("");
    } catch (error) {
      setSignUpError(error.message);
    }
  };

  const HandleGoogleSignup = async () => {
    setSignUpError("");
    setSuccessMessage("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const emailDomain = result.user.email.split('@')[1];
      if (emailDomain !== "truman.edu") {
        await auth.signOut();
        setSignUpError("Only @truman.edu email domain is allowed.");
        return;
      }
      setSuccessMessage("Google signup successful! You are now logged in.");
    } catch (error) {
      setSignUpError(error.message);
    }
  };

  return (
    <div className={`container d-flex justify-content-center align-items-center vh-100`}> {/* Center content */}
      <div className={`card p-4 shadow-lg ${styles.cardContainer}`}> {/* Styled card */}
        <h2 className="text-center mb-4">Sign Up</h2>
        <form onSubmit={HandleSignup}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email" 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password" 
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Sign Up</button>
          <p className="text-center my-2">OR</p>
          <button type="button" className="btn btn-danger w-100 mt-2" onClick={HandleGoogleSignup}>
            Sign up with Google
          </button>
          {signUpError && <p className="text-danger mt-2">{signUpError}</p>}
          {successMessage && <p className="text-success mt-2">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
}

export default Registration;

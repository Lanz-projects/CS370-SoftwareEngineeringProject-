import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { useState } from "react";
import { app } from "../firebase.js";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  const HandleLogin = async (e) => {
    e.preventDefault();
    setLoginError(""); 
    setSuccessMessage("");

    try {
      // Handles the given user info (email and password) and sends it to Firebase 
      await signInWithEmailAndPassword(auth, email, password); 
      setSuccessMessage("Login successful! Redirecting...");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.log(error);
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
        await signOut(auth); // Sign out if not allowed
        setLoginError("Only @truman.edu emails are allowed.");
        return;
      }
  
      setSuccessMessage("Google Login successful! Redirecting...");
    } 
    catch (error) {
      console.log(error);
      setLoginError(error.message);
    }
  };

  return (
    <div>
      <form onSubmit={HandleLogin}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Enter your email" 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Enter your password" 
        />
        <button type="submit">Login</button>

        <p>OR</p>

        <button type="button" onClick={HandleGoogleLogin}>
          Login with Google
        </button>

        {loginError && <p style={{ color: "red" }}>{loginError}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      </form>
    </div>
  );
}

export default Login;

import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useState } from "react";
import { app } from "../firebase";

function Registration() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@truman\.edu$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    return password.length >= 8;
  };

  const HandleSignup = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page

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
      console.log("Signup Done");
      setSuccessMessage("Signup successful! You can now log in.");
      setSignUpError(""); // Clear errors when the signup is valid
    } catch (error) {
      console.log(error);
      setSignUpError(error.message);
    }
  };

  const HandleGoogleSignup = async () => {
    setSignUpError("");
    setSuccessMessage("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if the user’s email is from @truman.edu
      const emailDomain = user.email.split('@')[1];
      if (emailDomain !== "truman.edu") {
        await auth.signOut(); // Sign out if not allowed
        setSignUpError("Only @truman.edu email domain is allowed.");
        return;
      }

      setSuccessMessage("Google signup successful! You can now log in.");
    } catch (error) {
      console.log(error);
      setSignUpError(error.message);
    }
  };

  return (
    <div>
      <form onSubmit={HandleSignup}>
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
        <button type="submit">SignUp</button>
        
        {/* Google Sign-up Button */}
        <button type="button" onClick={HandleGoogleSignup}>
          Sign up with Google
        </button>

        {signUpError && <p style={{ color: "red" }}>{signUpError}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      </form>
    </div>
  );
}

export default Registration;

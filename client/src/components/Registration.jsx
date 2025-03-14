import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useState } from "react";
import { app } from "../firebase";
import styles from "./registration.module.css";

function Registration() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (!isValidEmail(email) || !isValidPassword(password)) {
        setSignUpError("Invalid email or password.");
        return;
    }

    setIsProcessing(true);

    try { 
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();

        // Send token to backend
        await fetch('http://localhost:5000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, email }),
        });

        setSuccessMessage("Signup successful!");
        setSignUpError("");
    } catch (error) {
        setSignUpError(error.message);
    } finally {
        setIsProcessing(false);
    }
  };

  const HandleGoogleSignup = async () => {
    setIsProcessing(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const emailDomain = result.user.email.split('@')[1];
      const email = result.user.email;

      if (emailDomain !== "truman.edu") {
        await auth.signOut();
        setSignUpError("Only @truman.edu email domain is allowed.");
        return;
      }

      const token = await result.user.getIdToken();

      const signupResponse = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });

      const signupData = await signupResponse.json();

      if (signupData.error) {
        setSignUpError(signupData.error);
        return;
      }

      setSuccessMessage("Google signup successful!");
      setSignUpError("");  

    } catch (error) {
      setSignUpError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`container d-flex justify-content-center align-items-center vh-100`}>
      <div className={`card p-4 shadow-lg ${styles.cardContainer}`}>
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
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={isProcessing}
          >
            Sign Up
          </button>
          <p className="text-center my-2">OR</p>
          <button 
            type="button" 
            className="btn btn-danger w-100 mt-2"
            onClick={HandleGoogleSignup}
            disabled={isProcessing}
          >
            Sign up with Google
          </button>
          {signUpError && <p className="text-danger mt-2">{signUpError}</p>}
          {successMessage && <p className="text-success mt-2">{successMessage}</p>}
        </form>

        {/* Note on linking accounts */}
        <div className="mt-4">
          <p><strong>Note:</strong> 
            <ul>
              <li>
                If you sign up using the email/password method and then sign up with Google using the same email, your accounts will be linked. 
                You will only be able to log in with Google after linking the accounts.
              </li>
              <li>
                You can only use ~@truman.edu when signing up.
              </li>
            </ul>
            </p>
        </div>
      </div>
    </div>
  );
}

export default Registration;

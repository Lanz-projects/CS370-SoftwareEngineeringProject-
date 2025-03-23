import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useState } from "react";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";
import styles from "./registration.module.css";

function Registration() {
  const [signUpError, setSignUpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  // This is used to stop the user from clicking signup button more than once until
  // the response from the server is recieved
  const [isProcessing, setIsProcessing] = useState(false); 

  const navigate = useNavigate();
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  const HandleGoogleSignup = async () => {
    setIsProcessing(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Breaks up the domain of the email
      const emailDomain = result.user.email.split('@')[1];
      const email = result.user.email;

      // Checks the email domain
      if (emailDomain !== "truman.edu") {
        await auth.signOut();
        setSignUpError("Only @truman.edu email domain is allowed.");
        return;
      }

      // Recieves the token from firebase
      // This is the "key" to get user info from Firebase
      const token = await result.user.getIdToken();

      // Uses this to send information to backend to create a user in the database
      const signupResponse = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });

      // This is the response from the backend after doing the POST request
      const signupData = await signupResponse.json();

      if (signupData.error) {
        setSignUpError(signupData.error);
        return;
      }

      setSuccessMessage("Google signup successful!");
      setTimeout(() => navigate('/dashboard'), 1000) // Redirect after 1 second
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
        <form>
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
        {/* Information when signing up */}
        <div className="mt-4">
          <div><strong>Note:</strong> 
            <ul>
              <li>
                To preserve the accessibility and security of this application, the signup process is limited to only ~@truman.edu emails. Please sign up using your truman email to access this application.
              </li>
            </ul>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;

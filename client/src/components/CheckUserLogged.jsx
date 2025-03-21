import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";

function CheckUserLogged() {
  const [user, setUser] = useState(null); // Used to track user authentication status

  useEffect(() => {
    const auth = getAuth(app);

    const check = auth.onAuthStateChanged(async (currentUser) => {
      const tokenExpiration = localStorage.getItem("tokenExpiration");
      const currentTime = new Date().getTime();

      // Check if the token is expired
      // If it is expired remove it
      if (tokenExpiration && currentTime > tokenExpiration) {
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiration");
        setUser(null);
        return;
      }

      if (currentUser) {
        // If user is logged in, get the ID token
        const token = await currentUser.getIdToken(); // Get Firebase ID token
        // Store token and expiration time in localStorage
        localStorage.setItem("token", token);
        const expirationTime = new Date().getTime() + 3600000; // Token expires in 1 hour
        localStorage.setItem("tokenExpiration", expirationTime);

        setUser(currentUser); 
      } else {
        // If no user is logged in, clear token from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiration");
        setUser(null); 
      }
    });

    // Stop the listener
    return () => check();
  }, []);

  return user;
}

export default CheckUserLogged;

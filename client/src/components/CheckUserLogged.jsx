import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { app } from "../firebase"; 

function CheckUserLogged() {
  const [user, setUser] = useState(null); // Used to track user authentication status

  useEffect(() => {
    const auth = getAuth(app);
    const check = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser); // Update user state when auth status changes
    });

    // Stops the listener from listening after use
    return () => check();
  }, []);

  return user;
}

export default CheckUserLogged;

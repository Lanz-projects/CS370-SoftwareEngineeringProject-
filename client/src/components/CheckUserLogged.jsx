import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";

function CheckUserLogged() {
  // Undefined to differentiate between loading and null (not logged in)
  const [user, setUser] = useState(undefined); 
  
  useEffect(() => {
    const auth = getAuth(app);

    const check = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiration");
        setUser(null);
        return;
      }

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

      // Fetch and store the token if valid
      const token = await currentUser.getIdToken();
      const expirationTime = currentTime + 3600000; // 1 hour expiration
      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpiration", expirationTime);

      setUser(currentUser);
    });

    return () => check();
  }, []);

  return user;
}

export default CheckUserLogged;

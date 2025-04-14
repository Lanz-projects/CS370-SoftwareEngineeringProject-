import { getAuth, signOut } from "firebase/auth"; 
import { app } from "../firebase"; 

const auth = getAuth(app);

export const handleLogout = async (navigate) => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");

    //alert("Logged Out");

    if (typeof navigate === "function") {
      navigate("/"); 
    } else {
      console.error("Navigate function is missing or invalid.");
    }
  } catch (error) {
    console.error("Logout error:", error);
    alert("Failed to log out. Please try again.");
  }
};

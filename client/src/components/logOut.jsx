import { getAuth, signOut } from "firebase/auth"; 
import { app } from "../firebase"; 

const auth = getAuth(app);

export const handleLogout = async (navigate) => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
    setTimeout(() => navigate("/"), 1000); // Redirect after 1 second
    alert("Logged Out");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

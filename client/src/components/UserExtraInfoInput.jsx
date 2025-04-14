import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckUserLogged from "./CheckUserLogged";
import ProfieFormInfoPopup from "./ProfieFormInfoPopup"; 

function UserExtraInfoInput() {
  const [name, setName] = useState("");
  const [contactInfos, setContactInfos] = useState([]);
  const [contactType, setContactType] = useState("phone");
  const [platform, setPlatform] = useState("");
  const [value, setValue] = useState("");
  const [nameError, setNameError] = useState(""); 
  const [emailError, setEmailError] = useState(""); 
  const [notification, setNotification] = useState({ message: "", type: "" });

  const user = CheckUserLogged();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user === null) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  const validateName = (name) => {
    const regex = /^[a-zA-Z\s]*$/; 
    if (!name.match(regex)) {
      setNameError("Name must only contain letters and spaces.");
      return false;
    }
    if (name.length > 50) {
      setNameError("Name cannot exceed 50 characters.");
      return false;
    }
    setNameError(""); 
    return true;
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!email.match(regex)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError(""); 
    return true;
  };

  const handleDeleteContactInfo = (index) => {
    setContactInfos(contactInfos.filter((_, i) => i !== index));
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  const handleAddContactAndSubmit = async () => {
    // If there's a value to add, add it first
    if (value.trim()) {
      if (contactType === "social" && !platform.trim()) {
        showNotification("Please select a social media platform", "error");
        return;
      }

      if (contactType === "email" && !validateEmail(value)) {
        return; 
      }

      const newContactInfo = { type: contactType, value };

      if (contactType === "social") {
        newContactInfo.platform = platform;
      } else {
        delete newContactInfo.platform;
      }

      // Add the new contact info
      setContactInfos(prevContactInfos => [...prevContactInfos, newContactInfo]);
      setContactType("phone");
      setValue("");
      setPlatform("");
    }

    // Then handle the form submission
    if (!token) {
      showNotification("Your session has expired. Please log in again.", "error");
      navigate('/login');
      return;
    }

    if (!validateName(name)) return; 

    try {
      const response = await fetch("http://localhost:5000/api/update-user-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name, 
          contactInfos: value.trim() 
            ? [...contactInfos, { type: contactType, value, ...(contactType === "social" ? { platform } : {}) }]
            : contactInfos 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showNotification("Your profile has been successfully updated!");
      } else {
        showNotification(`Unable to update profile: ${data.error}`, "error");
      }
    } catch (error) {
      console.error("Error updating user info:", error);
      showNotification("We couldn't connect to the server. Please try again later.", "error");
    }
  };

  const handleExit = () => {
    navigate('/profile');
  };

  return (
    <div className="container mt-4 position-relative">
      <h2>Setup Your Profile</h2>
      
      <ProfieFormInfoPopup />
      
      {notification.message && (
        <div className={`alert ${notification.type === "error" ? "alert-danger" : "alert-success"} alert-dismissible fade show`} role="alert">
          {notification.message}
          <button type="button" className="btn-close" onClick={() => setNotification({ message: "", type: "" })} aria-label="Close"></button>
        </div>
      )}
      
      <div>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Name:</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            id="username"
            autoComplete="off"
          />
          {nameError && <div className="text-danger">{nameError}</div>} 
        </div>

        <div className="mb-3">
          <label htmlFor="contactType" className="form-label">Contact Type:</label>
          <select
            className="form-select"
            value={contactType}
            onChange={(e) => setContactType(e.target.value)}
            id="contactType"
          >
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="social">Social</option>
            <option value="other">Other</option>
          </select>
        </div>

        {contactType === "social" && (
          <div className="mb-3">
            <label htmlFor="socialPlatform" className="form-label">Social Platform:</label>
            <select
              className="form-select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              id="socialPlatform"
            >
              <option value="">Select a Platform</option>
              {["Twitter", "Instagram", "Snapchat", "TikTok", "GroupMe",
                "Discord", "WhatsApp", "Messenger", "Facebook", "Other"].map((plat) => (
                <option key={plat} value={plat}>{plat}</option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="contactval" className="form-label">Contact Value:</label>
          <input
            type="text"
            className="form-control"
            value={value}
            onChange={(e) => setValue(contactType === "phone" ? e.target.value.replace(/\D/g, "") : e.target.value)}
            id="contactval"
            autoComplete="off"
            maxLength={contactType === "phone" ? 16 : undefined}
            placeholder={contactType === "phone" ? "Enter phone number" : "Enter contact info"}
          />
          {emailError && <div className="text-danger">{emailError}</div>} 
        </div>

        <div className="mt-4">
          <h4>Added Contact Info:</h4>
          <ul>
            {contactInfos.map((contact, index) => (
              <li key={index}>
                {contact.type} - {contact.value} {contact.platform && `(${contact.platform})`}
                <button type="button" className="btn btn-danger btn-sm ms-2" onClick={() => handleDeleteContactInfo(index)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="d-flex gap-2 mt-3">
          <button type="button" className="btn btn-primary" onClick={handleAddContactAndSubmit}>
            Add Contact & Save
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleExit}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserExtraInfoInput;
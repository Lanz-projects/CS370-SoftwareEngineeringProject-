import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckUserLogged from "./CheckUserLogged";
import ProfieFormInfoPopup from "./ProfieFormInfoPopup"; 

function UserProfileUpdate() {
  const [name, setName] = useState("");
  const [contactInfos, setContactInfos] = useState([]);
  const [contactType, setContactType] = useState("phone");
  const [platform, setPlatform] = useState("");
  const [value, setValue] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    platform: "",
    value: ""
  });
  const [notification, setNotification] = useState({ message: "", type: "" });

  const user = CheckUserLogged();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user === null) {
      navigate("/login");
    } else {
      fetchUserData();
    }
  }, [user, navigate]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setName(data.user.name || "");
        setContactInfos(data.user.contactInfo || []);
      } else {
        showNotification(`We couldn't load your profile data: ${data.error}`, "error");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      showNotification("We're having trouble connecting to the server. Please try again later.", "error");
    }
  };

  const validateName = (name) => {
    if (!name.trim()) {
      setErrors(prev => ({ ...prev, name: "Name is required" }));
      return false;
    }
    
    const regex = /^[a-zA-Z\s]*$/;
    if (!name.match(regex)) {
      setErrors(prev => ({ ...prev, name: "Name must only contain letters and spaces." }));
      return false;
    }
    
    if (name.length > 50) {
      setErrors(prev => ({ ...prev, name: "Name cannot exceed 50 characters." }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, name: "" }));
    return true;
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, value: "Email is required" }));
      return false;
    }
    
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!email.match(regex)) {
      setErrors(prev => ({ ...prev, value: "Please enter a valid email address." }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, value: "" }));
    return true;
  };

  const validateContactValue = (value) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, value: `${contactType === "phone" ? "Phone number" : "Contact value"} is required` }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, value: "" }));
    return true;
  };

  const validatePlatform = (platform) => {
    if (contactType === "social" && !platform.trim()) {
      setErrors(prev => ({ ...prev, platform: "Platform is required" }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, platform: "" }));
    return true;
  };

  const handleDeleteContactInfo = (index) => {
    if (contactInfos.length === 1) {
      showNotification("At least one contact method is required", "error");
      return;
    }

    setContactInfos(contactInfos.filter((_, i) => i !== index));
  };

  const handleAddContactAndUpdate = async () => {
    // Validate name first
    if (!validateName(name)) return;
    
    // Check if we need to add a new contact
    let updatedContacts = [...contactInfos];
    
    if (value.trim()) {
      // Validate contact inputs if there's a value to add
      let isValid = true;
      
      if (contactType === "social" && !validatePlatform(platform)) {
        isValid = false;
      }
      
      if (contactType === "email") {
        if (!validateEmail(value)) {
          isValid = false;
        }
      } else if (!validateContactValue(value)) {
        isValid = false;
      }
      
      if (!isValid) return;
      
      // Add the new contact info
      const newContactInfo = { type: contactType, value };
      if (contactType === "social") {
        newContactInfo.platform = platform;
      }
      
      updatedContacts = [...contactInfos, newContactInfo];
    }
    
    // Validate that we have at least one contact
    if (updatedContacts.length === 0) {
      showNotification("At least one contact method is required", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name, 
          contactInfo: updatedContacts
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showNotification("Your profile has been successfully updated!");
        // Update the state to show the new contacts
        setContactInfos(updatedContacts);
        // Clear form inputs
        if (value.trim()) {
          setContactType("phone");
          setValue("");
          setPlatform("");
        }
      } else {
        showNotification(`Unable to update profile: ${data.error}`, "error");
      }
    } catch (error) {
      console.error("Error updating user info:", error);
      showNotification("We couldn't connect to the server. Please try again later.", "error");
    }
  };

  const handleExit = () => {
    navigate("/profile");
  };

  return (
    <div className="container mt-4 position-relative">
      <h2>Update Your Profile</h2>
      
      {/* Add the InfoPopup component */}
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
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            id="username"
            autoComplete="off"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
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
              className={`form-select ${errors.platform ? 'is-invalid' : ''}`}
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
            {errors.platform && <div className="invalid-feedback">{errors.platform}</div>}
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="contactval" className="form-label">Contact Value:</label>
          <input
            type="text"
            className={`form-control ${errors.value ? 'is-invalid' : ''}`}
            value={value}
            onChange={(e) => setValue(contactType === "phone" ? e.target.value.replace(/\D/g, "") : e.target.value)}
            id="contactval"
            autoComplete="off"
            maxLength={contactType === "phone" ? 16 : undefined}
            placeholder={contactType === "phone" ? "Enter phone number" : "Enter contact info"}
          />
          {errors.value && <div className="invalid-feedback">{errors.value}</div>}
        </div>

        <div className="mt-4">
          <h4>Added Contact Info:</h4>
          {contactInfos.length > 0 ? (
            <ul className="list-group">
              {contactInfos.map((contact, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    <strong>{contact.type}</strong> - {contact.value} {contact.platform && `(${contact.platform})`}
                  </span>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteContactInfo(index)}>Delete</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-danger">No contact information added. At least one contact method is required.</p>
          )}
        </div>

        <div className="d-flex gap-2 mt-3">
          <button type="button" className="btn btn-primary" onClick={handleAddContactAndUpdate}>
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

export default UserProfileUpdate;
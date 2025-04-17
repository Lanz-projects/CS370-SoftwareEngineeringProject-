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
  const [errors, setErrors] = useState({
    name: "",
    platform: "",
    value: ""
  });
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [profileSaved, setProfileSaved] = useState(false);

  const user = CheckUserLogged();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user === null) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (user === undefined) {
    return <div className="container mt-5 text-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">Loading your profile...</p>
    </div>;
  }

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
    
    if (name.length > 30) {
      setErrors(prev => ({ ...prev, name: "Name cannot exceed 30 characters." }));
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
    setContactInfos(contactInfos.filter((_, i) => i !== index));
    setProfileSaved(false); // Always reset when contacts change
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  const validateForm = () => {
    // Validate name
    if (!validateName(name)) return false;
    
    // Make sure at least one contact is added
    if (contactInfos.length === 0 && !value.trim()) {
      showNotification("Please add at least one contact method", "error");
      return false;
    }
    
    return true;
  };

  const handleAddContactAndSubmit = async () => {
    // If there's a value to add, validate and add it
    let isValid = true;
    let updatedContacts = [...contactInfos];
    
    if (value.trim()) {
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

      const newContactInfo = { type: contactType, value };
      if (contactType === "social") {
        newContactInfo.platform = platform;
      }

      // Add the new contact info
      updatedContacts = [...contactInfos, newContactInfo];
      setContactInfos(updatedContacts);
    }

    // Validate the entire form
    if (!validateForm()) return;
    
    // Check if we have at least one contact method
    if (updatedContacts.length === 0) {
      showNotification("Please add at least one contact method", "error");
      return;
    }

    // Handle the form submission
    if (!token) {
      showNotification("Your session has expired. Please log in again.", "error");
      navigate('/login');
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/update-user-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name, 
          contactInfos: updatedContacts
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showNotification("Your profile has been successfully updated!");
        setProfileSaved(true);
        // Clear form fields after successful submission
        setValue("");
        setContactType("phone");
        setPlatform("");
      } else {
        showNotification(`Unable to update profile: ${data.error}`, "error");
        setProfileSaved(false);
      }
    } catch (error) {
      console.error("Error updating user info:", error);
      showNotification("We couldn't connect to the server. Please try again later.", "error");
      setProfileSaved(false);
    }
  };

  const handleExit = () => {
    if (profileSaved) {
      navigate('/profile');
    } else {
      showNotification("Please complete and save your profile before exiting", "error");
    }
  };

  const addContact = () => {
    if (value.trim()) {
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

      const newContactInfo = { type: contactType, value };
      if (contactType === "social") {
        newContactInfo.platform = platform;
      }

      setContactInfos(prev => [...prev, newContactInfo]);
      setValue("");
      setPlatform("");
      setContactType("phone");
      setProfileSaved(false);
    }
  };

  return (
    <div className="container mt-4 position-relative">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Setup Your Profile</h2>
        </div>
        <div className="card-body">
          <ProfieFormInfoPopup />
          
          {notification.message && (
            <div className={`alert ${notification.type === "error" ? "alert-danger" : "alert-success"} alert-dismissible fade show`} role="alert">
              {notification.message}
              <button type="button" className="btn-close" onClick={() => setNotification({ message: "", type: "" })} aria-label="Close"></button>
            </div>
          )}
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="username" className="form-label">Name: <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setProfileSaved(false);
                }}
                required
                id="username"
                autoComplete="off"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="col-md-6 mb-3">
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
              <div className="col-md-6 mb-3">
                <label htmlFor="socialPlatform" className="form-label">Social Platform: <span className="text-danger">*</span></label>
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

            <div className="col-md-6 mb-3">
              <label htmlFor="contactval" className="form-label">Contact Value: <span className="text-danger">*</span></label>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control ${errors.value ? 'is-invalid' : ''}`}
                  value={value}
                  onChange={(e) => {
                    setValue(contactType === "phone" ? e.target.value.replace(/\D/g, "") : e.target.value);
                    setProfileSaved(false); // Reset profile saved state when creating new contact
                  }}
                  id="contactval"
                  autoComplete="off"
                  maxLength={contactType === "phone" ? 16 : undefined}
                  placeholder={contactType === "phone" ? "Enter phone number" : "Enter contact info"}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addContact();
                    }
                  }}
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={addContact}
                >
                  Add
                </button>
              </div>
              {errors.value && <div className="invalid-feedback d-block">{errors.value}</div>}
            </div>
          </div>

          <div className="alert alert-info">
            <i className="bi bi-info-circle-fill me-2"></i>
            You must complete your profile before you can exit. Please add your name and at least one contact method, then click "Save Profile".
          </div>

          <div className="mt-4">
            <h4>Added Contact Info: <span className="text-danger">*</span></h4>
            {contactInfos.length > 0 ? (
              <ul className="list-group">
                {contactInfos.map((contact, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                      <strong>{contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}</strong> - {contact.value} 
                      {contact.platform && ` (${contact.platform})`}
                    </span>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteContactInfo(index)}>
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-danger">No contact information added yet. Please add at least one contact method.</p>
            )}
          </div>

          <div className="d-flex gap-2 mt-4">
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleAddContactAndSubmit}
              disabled={profileSaved && contactInfos.length > 0 && name.trim() !== "" ? true : false}
            >
              <i className="bi bi-save"></i> {profileSaved ? "Profile Saved" : "Save Profile"}
            </button>
            <button 
              type="button" 
              className={`btn ${profileSaved ? "btn-success" : "btn-secondary"}`} 
              onClick={handleExit}
            >
              <i className={profileSaved ? "bi bi-check-circle" : "bi bi-x-circle"}></i> Exit
            </button>
          </div>
          
          {!profileSaved && (
            <div className="mt-3 text-danger">
              <small><i className="bi bi-exclamation-circle"></i> You must save your profile before you can exit.</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserExtraInfoInput;
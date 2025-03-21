import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckUserLogged from "./CheckUserLogged";

/*
  TODO:
  Add form validation for each thing
*/

function UserExtraInfoInput() {
  const [name, setName] = useState("");
  const [contactInfos, setContactInfos] = useState([]); // Store multiple contact info
  const [contactType, setContactType] = useState("phone");
  const [platform, setPlatform] = useState("");
  const [value, setValue] = useState("");

  const user = CheckUserLogged();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const contactPlatforms = [
    "Twitter", "Instagram", "Snapchat", "TikTok", "GroupMe",
    "Discord", "WhatsApp", "Messenger", "Facebook", "Other"
  ];

  const handleAddContactInfo = () => {
    // Add the current contact info to the list
    const newContactInfo = { type: contactType, value };
    if (contactType === "social") {
      newContactInfo.platform = platform;
    }

    setContactInfos([...contactInfos, newContactInfo]);
    setContactType("phone");
    setValue("");
    setPlatform("");
  };

  const handleDeleteContactInfo = (index) => {
    // Remove contact info at the specified index
    const updatedContactInfos = contactInfos.filter((_, i) => i !== index);
    setContactInfos(updatedContactInfos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("User not logged in.");
      navigate('/login');
      return;
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/update-user-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, contactInfos }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        navigate('/profile');
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error updating user info:", error);
      alert("Failed to update user info.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Setup Your Profile</h2>
      <form onSubmit={handleSubmit}>
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
        </div>

        {/* Multiple contact info */}
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
              {contactPlatforms.map((plat) => (
                <option key={plat} value={plat}>
                  {plat}
                </option>
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
            onChange={(e) => {
              
              if (contactType === "phone") {
                // Allow only numbers
                const onlyNumbers = e.target.value.replace(/\D/g, "");
                setValue(onlyNumbers);
              } else {
                setValue(e.target.value);
              }
            }}
            id="contactval"
            autoComplete="off"
            maxLength={contactType === "phone" ? 16 : undefined}
            pattern={contactType === "phone" ? "[0-9]*" : undefined}
            placeholder={contactType === "phone" ? "Enter phone number" : "Enter contact info"}
          />
        </div>

        {/* Add contact info button */}
        <button type="button" className="btn btn-secondary" onClick={handleAddContactInfo}>
          Add Contact Info
        </button>

        {/* Display added contact infos */}
        <div className="mt-4">
          <h4>Added Contact Info:</h4>
          <ul>
            {contactInfos.map((contact, index) => (
              <li key={index}>
                {contact.type} - {contact.value} {contact.platform && `(${contact.platform})`}
                <button
                  type="button"
                  className="btn btn-danger btn-sm ml-3"
                  onClick={() => handleDeleteContactInfo(index)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="btn btn-primary mt-3">Save</button>
      </form>
    </div>
  );
}

export default UserExtraInfoInput;

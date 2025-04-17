import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckUserLogged from "./CheckUserLogged";

function VehicleFormInput() {
  const commonColors = ["Black", "White", "Silver", "Gray", "Blue", "Red", "Green", "Yellow", "Other"];
  const commonMakes = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes", "Volkswagen", "Other"];

  const [color, setColor] = useState(commonColors[0]);
  const [customColor, setCustomColor] = useState("");
  const [make, setMake] = useState(commonMakes[0]);
  const [customMake, setCustomMake] = useState("");
  const [model, setModel] = useState("");
  const [errors, setErrors] = useState({
    color: "",
    customColor: "",
    make: "",
    customMake: "",
    model: ""
  });
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [vehicleSaved, setVehicleSaved] = useState(false);

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

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  const validateInput = () => {
    let isValid = true;
    const newErrors = {
      color: "",
      customColor: "",
      make: "",
      customMake: "",
      model: ""
    };
    
    // Check model field
    if (!model.trim()) {
      newErrors.model = "Model is required";
      isValid = false;
    }
    
    // Check customColor if "Other" is selected
    if (color === "Other" && !customColor.trim()) {
      newErrors.customColor = "Custom color is required when 'Other' is selected";
      isValid = false;
    }
    
    // Check customMake if "Other" is selected
    if (make === "Other" && !customMake.trim()) {
      newErrors.customMake = "Custom make is required when 'Other' is selected";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      showNotification("Authentication token missing. Please log in again.", "error");
      navigate("/login");
      return;
    }

    if (!validateInput()) return;

    const selectedColor = color === "Other" ? customColor : color;
    const selectedMake = make === "Other" ? customMake : make;

    try {
      const response = await fetch("http://localhost:5000/api/add-vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userid: user.uid, color: selectedColor, make: selectedMake, model }),
      });

      const data = await response.json();
      if (response.ok) {
        showNotification("Vehicle added successfully!");
        setVehicleSaved(true);
      } else {
        showNotification("Error: " + data.error, "error");
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      showNotification("Failed to add vehicle. Please try again later.", "error");
    }
  };

  const handleExit = () => {
    if (vehicleSaved) {
      navigate('/profile');
    } else {
      showNotification("Please save your vehicle information before exiting", "error");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Add Vehicle</h2>
        </div>
        <div className="card-body">
          {notification.message && (
            <div className={`alert ${notification.type === "error" ? "alert-danger" : "alert-success"} alert-dismissible fade show`} role="alert">
              {notification.message}
              <button type="button" className="btn-close" onClick={() => setNotification({ message: "", type: "" })} aria-label="Close"></button>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="color" className="form-label">Color: <span className="text-danger">*</span></label>
                <select 
                  id="color" 
                  name="color" 
                  className="form-select" 
                  value={color} 
                  onChange={(e) => {
                    setColor(e.target.value);
                    setVehicleSaved(false);
                  }} 
                  required
                >
                  {commonColors.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                {color === "Other" && (
                  <div className="mt-2">
                    <input
                      id="customColor"
                      name="customColor"
                      type="text"
                      className={`form-control ${errors.customColor ? 'is-invalid' : ''}`}
                      placeholder="Enter custom color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setVehicleSaved(false);
                      }}
                      required
                    />
                    {errors.customColor && <div className="invalid-feedback">{errors.customColor}</div>}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="make" className="form-label">Make: <span className="text-danger">*</span></label>
                <select 
                  id="make" 
                  name="make" 
                  className="form-select" 
                  value={make} 
                  onChange={(e) => {
                    setMake(e.target.value);
                    setVehicleSaved(false);
                  }} 
                  required
                >
                  {commonMakes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {make === "Other" && (
                  <div className="mt-2">
                    <input
                      id="customMake"
                      name="customMake"
                      type="text"
                      className={`form-control ${errors.customMake ? 'is-invalid' : ''}`}
                      placeholder="Enter custom make"
                      value={customMake}
                      onChange={(e) => {
                        setCustomMake(e.target.value);
                        setVehicleSaved(false);
                      }}
                      required
                    />
                    {errors.customMake && <div className="invalid-feedback">{errors.customMake}</div>}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="model" className="form-label">Model: <span className="text-danger">*</span></label>
                <input
                  id="model"
                  name="model"
                  type="text"
                  className={`form-control ${errors.model ? 'is-invalid' : ''}`}
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setVehicleSaved(false);
                  }}
                  required
                />
                {errors.model && <div className="invalid-feedback">{errors.model}</div>}
              </div>
            </div>

            <div className="alert alert-info">
              <i className="bi bi-info-circle-fill me-2"></i>
              You must save your vehicle information before you can exit. Please fill out all required fields and click "Save Vehicle".
            </div>

            <div className="d-flex gap-2 mt-4">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={vehicleSaved}
              >
                <i className="bi bi-save"></i> {vehicleSaved ? "Vehicle Saved" : "Save Vehicle"}
              </button>
              <button 
                type="button" 
                className={`btn ${vehicleSaved ? "btn-success" : "btn-secondary"}`}
                onClick={handleExit}
              >
                <i className={vehicleSaved ? "bi bi-check-circle" : "bi bi-x-circle"}></i> Exit
              </button>
            </div>
            
            {!vehicleSaved && (
              <div className="mt-3 text-danger">
                <small><i className="bi bi-exclamation-circle"></i> You must save your vehicle information before you can exit.</small>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default VehicleFormInput;
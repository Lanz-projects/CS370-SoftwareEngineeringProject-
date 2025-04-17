import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckUserLogged from "./CheckUserLogged";

function UpdateVehicleForm() {
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
  const [initialData, setInitialData] = useState({
    color: "",
    customColor: "",
    make: "",
    customMake: "",
    model: ""
  });
  const [dataChanged, setDataChanged] = useState(false);
  
  const user = CheckUserLogged();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user === null) {
      navigate("/login");
    } else {
      fetchVehicleData();
    }
  }, [user, navigate]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  const fetchVehicleData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/vehicles", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.length > 0) {
        const vehicle = data[0]; 
        const vehicleColor = commonColors.includes(vehicle.color) ? vehicle.color : "Other";
        const vehicleCustomColor = commonColors.includes(vehicle.color) ? "" : vehicle.color;
        const vehicleMake = commonMakes.includes(vehicle.make) ? vehicle.make : "Other";
        const vehicleCustomMake = commonMakes.includes(vehicle.make) ? "" : vehicle.make;

        setColor(vehicleColor);
        setCustomColor(vehicleCustomColor);
        setMake(vehicleMake);
        setCustomMake(vehicleCustomMake);
        setModel(vehicle.model);

        // Save initial data for comparison
        setInitialData({
          color: vehicleColor,
          customColor: vehicleCustomColor,
          make: vehicleMake,
          customMake: vehicleCustomMake,
          model: vehicle.model
        });

        // Vehicle is considered saved initially since we're loading from the server
        setVehicleSaved(true);
        setDataChanged(false);
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
      showNotification("Unable to fetch vehicle data. Please try again later.", "error");
    }
  };

  // Check if data has changed whenever form values change
  useEffect(() => {
    const currentData = { color, customColor, make, customMake, model };
    const hasChanged = JSON.stringify(currentData) !== JSON.stringify(initialData);
    setDataChanged(hasChanged);
    
    // If data changed, vehicle is no longer considered saved
    if (hasChanged) {
      setVehicleSaved(false);
    }
  }, [color, customColor, make, customMake, model, initialData]);

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
    
    // Check color and customColor if "Other" is selected
    if (color === "Other" && !customColor.trim()) {
      newErrors.customColor = "Custom color is required when 'Other' is selected";
      isValid = false;
    }
    
    // Check make and customMake if "Other" is selected
    if (make === "Other" && !customMake.trim()) {
      newErrors.customMake = "Custom make is required when 'Other' is selected";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleUpdate = async (e) => {
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
      const response = await fetch("http://localhost:5000/api/update-vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ color: selectedColor, make: selectedMake, model }),
      });

      const data = await response.json();
      if (response.ok) {
        showNotification("Vehicle updated successfully!");
        setVehicleSaved(true);
        setDataChanged(false);
        
        // Update the initial data with the new values
        setInitialData({
          color,
          customColor,
          make,
          customMake,
          model
        });
      } else {
        showNotification("Error: " + data.error, "error");
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      showNotification("Failed to update vehicle. Please try again later.", "error");
    }
  };

  const handleExit = () => {
    if (!dataChanged || vehicleSaved) {
      navigate('/profile');
    } else {
      showNotification("Please save your changes before exiting", "error");
    }
  };

  if (user === undefined) {
    return <div className="container mt-5 text-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">Loading your vehicle information...</p>
    </div>;
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Update Vehicle</h2>
        </div>
        <div className="card-body">
          {notification.message && (
            <div className={`alert ${notification.type === "error" ? "alert-danger" : "alert-success"} alert-dismissible fade show`} role="alert">
              {notification.message}
              <button type="button" className="btn-close" onClick={() => setNotification({ message: "", type: "" })} aria-label="Close"></button>
            </div>
          )}
          
          <form onSubmit={handleUpdate}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="color" className="form-label">Color: <span className="text-danger">*</span></label>
                <select 
                  id="color" 
                  className="form-select" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                >
                  {commonColors.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                {color === "Other" && (
                  <div className="mt-2">
                    <input 
                      type="text" 
                      className={`form-control ${errors.customColor ? 'is-invalid' : ''}`} 
                      placeholder="Enter custom color" 
                      value={customColor} 
                      onChange={(e) => setCustomColor(e.target.value)} 
                    />
                    {errors.customColor && <div className="invalid-feedback">{errors.customColor}</div>}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="make" className="form-label">Make: <span className="text-danger">*</span></label>
                <select 
                  id="make" 
                  className="form-select" 
                  value={make} 
                  onChange={(e) => setMake(e.target.value)}
                >
                  {commonMakes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {make === "Other" && (
                  <div className="mt-2">
                    <input 
                      type="text" 
                      className={`form-control ${errors.customMake ? 'is-invalid' : ''}`} 
                      placeholder="Enter custom make" 
                      value={customMake} 
                      onChange={(e) => setCustomMake(e.target.value)} 
                    />
                    {errors.customMake && <div className="invalid-feedback">{errors.customMake}</div>}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="model" className="form-label">Model: <span className="text-danger">*</span></label>
                <input 
                  id="model" 
                  type="text" 
                  className={`form-control ${errors.model ? 'is-invalid' : ''}`} 
                  value={model} 
                  onChange={(e) => setModel(e.target.value)} 
                />
                {errors.model && <div className="invalid-feedback">{errors.model}</div>}
              </div>
            </div>

            {dataChanged && (
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                You have unsaved changes. Please save your updates before exiting.
              </div>
            )}

            <div className="d-flex gap-2 mt-4">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={!dataChanged}
              >
                <i className="bi bi-save"></i> {vehicleSaved ? "Vehicle Saved" : "Save Changes"}
              </button>
              <button 
                type="button" 
                className={`btn ${!dataChanged || vehicleSaved ? "btn-success" : "btn-secondary"}`} 
                onClick={handleExit}
              >
                <i className={!dataChanged || vehicleSaved ? "bi bi-check-circle" : "bi bi-x-circle"}></i> Exit
              </button>
            </div>
            
            {dataChanged && !vehicleSaved && (
              <div className="mt-3 text-danger">
                <small><i className="bi bi-exclamation-circle"></i> You must save your changes before you can exit.</small>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateVehicleForm;
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
        setColor(commonColors.includes(vehicle.color) ? vehicle.color : "Other");
        setCustomColor(commonColors.includes(vehicle.color) ? "" : vehicle.color);
        setMake(commonMakes.includes(vehicle.make) ? vehicle.make : "Other");
        setCustomMake(commonMakes.includes(vehicle.make) ? "" : vehicle.make);
        setModel(vehicle.model);
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
      showNotification("Unable to fetch vehicle data. Please try again later.", "error");
    }
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
      const response = await fetch("http://localhost:5000/api/add-vehicle", {
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
      } else {
        showNotification("Error: " + data.error, "error");
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      showNotification("Failed to update vehicle. Please try again later.", "error");
    }
  };

  const handleExit = () => {
    navigate('/profile');
  };

  return (
    <div className="container mt-4">
      <h2>Update Vehicle</h2>
      
      {notification.message && (
        <div className={`alert ${notification.type === "error" ? "alert-danger" : "alert-success"} alert-dismissible fade show`} role="alert">
          {notification.message}
          <button type="button" className="btn-close" onClick={() => setNotification({ message: "", type: "" })} aria-label="Close"></button>
        </div>
      )}
      
      <form onSubmit={handleUpdate}>
        <div className="mb-3">
          <label htmlFor="color" className="form-label">Color:</label>
          <select id="color" className="form-select" value={color} onChange={(e) => setColor(e.target.value)}>
            {commonColors.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          {color === "Other" && (
            <>
              <input 
                type="text" 
                className={`form-control mt-2 ${errors.customColor ? 'is-invalid' : ''}`} 
                placeholder="Enter custom color" 
                value={customColor} 
                onChange={(e) => setCustomColor(e.target.value)} 
              />
              {errors.customColor && <div className="invalid-feedback">{errors.customColor}</div>}
            </>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="make" className="form-label">Make:</label>
          <select id="make" className="form-select" value={make} onChange={(e) => setMake(e.target.value)}>
            {commonMakes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {make === "Other" && (
            <>
              <input 
                type="text" 
                className={`form-control mt-2 ${errors.customMake ? 'is-invalid' : ''}`} 
                placeholder="Enter custom make" 
                value={customMake} 
                onChange={(e) => setCustomMake(e.target.value)} 
              />
              {errors.customMake && <div className="invalid-feedback">{errors.customMake}</div>}
            </>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="model" className="form-label">Model:</label>
          <input 
            id="model" 
            type="text" 
            className={`form-control ${errors.model ? 'is-invalid' : ''}`} 
            value={model} 
            onChange={(e) => setModel(e.target.value)} 
          />
          {errors.model && <div className="invalid-feedback">{errors.model}</div>}
        </div>

        <div className="d-flex gap-2 mt-3">
          <button type="submit" className="btn btn-primary">Update Vehicle</button>
          <button type="button" className="btn btn-secondary" onClick={handleExit}>Exit</button>
        </div>
      </form>
    </div>
  );
}

export default UpdateVehicleForm;
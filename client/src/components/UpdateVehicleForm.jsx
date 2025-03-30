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
  const [error, setError] = useState("");
  
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
    }
  };

  const validateInput = () => {
    const selectedColor = color === "Other" ? customColor : color;
    const selectedMake = make === "Other" ? customMake : make;
    
    if (!selectedColor.trim() || !selectedMake.trim() || !model.trim()) {
      setError("All fields are required.");
      return false;
    }
    setError("");
    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

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
        alert("Vehicle updated successfully!");
        navigate("/profile");
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Failed to update vehicle.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Update Vehicle</h2>
      <form onSubmit={handleUpdate}>
        <div className="mb-3">
          <label htmlFor="color" className="form-label">Color:</label>
          <select id="color" className="form-select" value={color} onChange={(e) => setColor(e.target.value)}>
            {commonColors.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          {color === "Other" && (
            <input type="text" className="form-control mt-2" placeholder="Enter custom color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} />
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
            <input type="text" className="form-control mt-2" placeholder="Enter custom make" value={customMake} onChange={(e) => setCustomMake(e.target.value)} />
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="model" className="form-label">Model:</label>
          <input id="model" type="text" className="form-control" value={model} onChange={(e) => setModel(e.target.value)} required />
        </div>

        {error && <div className="text-danger">{error}</div>}

        <button type="submit" className="btn btn-primary mt-3">Update Vehicle</button>
      </form>
    </div>
  );
}

export default UpdateVehicleForm;

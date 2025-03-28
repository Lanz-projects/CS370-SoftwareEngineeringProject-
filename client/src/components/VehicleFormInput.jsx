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
  const [error, setError] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Authentication token missing. Please log in again.");
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
        alert("Vehicle added successfully!");
        navigate("/profile");
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("Failed to add vehicle.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add Vehicle</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="color" className="form-label">Color:</label>
          <select id="color" name="color" className="form-select" value={color} onChange={(e) => setColor(e.target.value)} required>
            {commonColors.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          {color === "Other" && (
            <input
              id="customColor"
              name="customColor"
              type="text"
              className="form-control mt-2"
              placeholder="Enter custom color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              required
            />
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="make" className="form-label">Make:</label>
          <select id="make" name="make" className="form-select" value={make} onChange={(e) => setMake(e.target.value)} required>
            {commonMakes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {make === "Other" && (
            <input
              id="customMake"
              name="customMake"
              type="text"
              className="form-control mt-2"
              placeholder="Enter custom make"
              value={customMake}
              onChange={(e) => setCustomMake(e.target.value)}
              required
            />
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="model" className="form-label">Model:</label>
          <input
            id="model"
            name="model"
            type="text"
            className="form-control"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
        </div>

        {error && <div className="text-danger">{error}</div>}

        <button type="submit" className="btn btn-primary mt-3">Save Vehicle</button>
      </form>
    </div>
  );
}

export default VehicleFormInput;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Redirect after deletion
import "bootstrap/dist/css/bootstrap.min.css";

const ProfileLayout = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // React Router navigation

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          setUserInfo(data.user);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleDelete = async () => {
    try {
      const response = await fetch("/api/delete-user", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Clear local storage and redirect
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiration");
        navigate("/"); // Redirect to homepage
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Deletion error:", error);
      alert("Failed to delete account.");
    }
  };

  const handleProfileAction = () => {
    if (userInfo.completedUserProfile) {
      updateProfile();
    } else {
      finishProfile();
    }
  };

  const updateProfile = () => {
    navigate('/updateprofile');
  };

  const finishProfile = () => {
    navigate("/extra-userinfo-form");
  };

  const handleVehicleAction = () => {
    if (userInfo.vehicle) {
      updateVehicle();
    } else {
      addVehicle();
    }
  };

  const updateVehicle = () => {
    navigate('/updatevehicle');
  };

  const addVehicle = () => {
    navigate("/vehicleform");
  };

  if (loading) return <div className="text-center mt-4">Loading...</div>;
  if (error) return <div className="text-danger text-center mt-4">{error}</div>;

  const containerStyle = {
    maxWidth: "500px",
    margin: "40px auto",
    padding: "30px",
    backgroundColor: "#fff",
    borderRadius: "20px",
    boxShadow: "0 0 20px rgba(128, 0, 128, 0.1)",
    fontFamily: "Segoe UI, sans-serif",
  };

  const titleStyle = {
    textAlign: "center",
    color: "#6a1b9a", // Purple color
    marginBottom: "25px",
    fontSize: "1.8rem",
  };

  const infoBoxStyle = {
    padding: "15px 20px",
    borderRadius: "12px",
    backgroundColor: "#f3e5f5",
    border: "1px solid #d1c4e9",
    color: "#4a148c",
    marginBottom: "15px",
  };

  const labelStyle = {
    fontWeight: "600",
    marginBottom: "5px",
    color: "#6a1b9a", // Purple color for labels
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Your Profile</h2>

      <div style={infoBoxStyle}>
        <div style={labelStyle}>Name</div>
        <div>{userInfo.name}</div>
      </div>

      <div style={infoBoxStyle}>
        <div style={labelStyle}>Email</div>
        <div>{userInfo.email}</div>
      </div>

      <div style={infoBoxStyle}>
        <div style={labelStyle}>Contact</div>
        {userInfo.contactInfo && userInfo.contactInfo.length > 0 ? (
          <ul>
            {userInfo.contactInfo.map((info, index) => (
              <li key={index}>
                <strong>{info.type}:</strong> {info.value}
              </li>
            ))}
          </ul>
        ) : (
          <p>No contact information available</p>
        )}
      </div>

      <div style={infoBoxStyle}>
        <div style={labelStyle}>Vehicle Info</div>
        <div>
          {userInfo.vehicle
            ? `${userInfo.vehicle.make} ${userInfo.vehicle.model}`
            : "No vehicle assigned"}
        </div>
      </div>

      <div style={infoBoxStyle}>
        <div style={labelStyle}>Profile Completion</div>
        <div>{userInfo.completedUserProfile ? "Completed" : "Incomplete"}</div>
      </div>
      <div style={infoBoxStyle}>
        <div style={labelStyle}>Accepted User Agreement</div>
        <div>{userInfo.acceptedUserAgreement ? "Yes" : "No"}</div>
      </div>
      <div style={infoBoxStyle}>
        <div style={labelStyle}>Account Created On</div>
        <div>{new Date(userInfo.createdAt).toLocaleDateString()}</div>
      </div>

      {/* Profile Action Buttons */}
      <div className="d-flex flex-column align-items-end gap-3 mt-4">
        <button
          className="btn btn-primary w-100 py-2 shadow-sm"
          onClick={handleProfileAction}
        >
          {userInfo.completedUserProfile ? "Update Profile" : "Finish Profile"}
        </button>
        <button
          className="btn btn-secondary w-100 py-2 shadow-sm"
          onClick={handleVehicleAction}
        >
          {userInfo.vehicle ? "Update Vehicle" : "Add a Vehicle"}
        </button>
        <button
          className="btn btn-info w-100 py-2 shadow-sm"
          onClick={() => navigate("/terms-and-conditions")}
        >
          Read User Agreement
        </button>
        <button
          className="btn btn-danger w-100 py-2 shadow-sm"
          onClick={() => setShowModal(true)}
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{ background: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-danger">Confirm Deletion</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete your account? This action cannot
                be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;

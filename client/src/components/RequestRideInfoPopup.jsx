// RequestRideInfoPopup.jsx
import { useState } from "react";

function RequestRideInfoPopup() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      {/* Info button */}
      <button
        type="button"
        onClick={() => setShowPopup(true)}
        aria-label="Information"
        style={{
          position: "absolute",
          right: "10px",
          top: "5px",
          fontSize: "1.2rem",
          background: "none",
          border: "none",
          color: "#17a2b8",
          cursor: "pointer",
        }}
      >
        ℹ️
      </button>

      {/* Modal popup */}
      {showPopup && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">How to Use This Form</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPopup(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <h5>Ride Request Guide</h5>
                <p>
                  This form allows you to request a ride by providing your
                  destination and arrival details.
                </p>

                <h6>Instructions:</h6>
                <ul>
                  <li>
                    <strong>Your Name:</strong> Enter your full name using only
                    letters and spaces.
                  </li>
                  <li>
                    <strong>Destination:</strong> Enter your destination address
                    or location name.
                    <ul>
                      <li>
                        Click "Find Location" to verify your destination address.
                      </li>
                      <li>
                        You must verify your location before submitting the form.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Arrival Date:</strong> Select when you need to arrive.
                    <ul>
                      <li>Must be today or a future date.</li>
                      <li>Cannot be more than 3 months in advance.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Arrival Time:</strong> Enter the time you need to
                    arrive.
                    <ul>
                      <li>
                        If requesting for today, the time must be in the future.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Notes:</strong> Include any relevant information about
                    your ride request (optional, max 200 characters).
                  </li>
                  <li>
                    <strong>Wants:</strong> Specify any special requests or
                    accommodations you need (optional, max 200 characters).
                  </li>
                </ul>

                <h6>To submit your request:</h6>
                <ol>
                  <li>Fill out all required fields.</li>
                  <li>
                    Make sure your location is verified by clicking "Find
                    Location".
                  </li>
                  <li>
                    Review your information for accuracy.
                  </li>
                  <li>
                    Click "Submit Request" to send your ride request.
                  </li>
                </ol>

                <div className="alert alert-info">
                  <strong>Note:</strong> Once submitted, your ride request will be
                  visible to everyone. You'll be notified
                  when someone accepts your request.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowPopup(false)}
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showPopup && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowPopup(false)}
        ></div>
      )}
    </>
  );
}

export default RequestRideInfoPopup;
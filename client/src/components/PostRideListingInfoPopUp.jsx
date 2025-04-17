// PostRideListingInfoPopup.jsx
import { useState } from "react";

function PostRideListingInfoPopup() {
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
                <h5>Ride Offering Guide</h5>
                <p>
                  This form allows you to post a ride offering by providing your
                  destination and details about the ride you're providing.
                </p>

                <h6>Instructions:</h6>
                <ul>
                  <li>
                    <strong>Your Name:</strong> Enter your full name using only
                    letters and spaces.
                  </li>
                  <li>
                    <strong>Destination:</strong> Enter the destination address
                    or location where you're heading.
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
                    <strong>Departure Date:</strong> Select when you plan to arrive
                    at the destination.
                    <ul>
                      <li>Must be today or a future date.</li>
                      <li>Cannot be more than 3 months in advance.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Departure Time:</strong> Enter the time you expect to
                    arrive at the destination.
                    <ul>
                      <li>
                        If offering a ride for today, the time must be in the future.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Available Seats:</strong> Enter the number of 
                    passengers you can accommodate (between 1 and 15).
                  </li>
                  <li>
                    <strong>Notes:</strong> Include any relevant information about
                    your ride offering (optional, max 200 characters).
                    <ul>
                      <li>Consider mentioning any stops along the way or other important details.</li>
                    </ul>
                  </li>
                </ul>

                <h6>Requirements:</h6>
                <ul>
                  <li>
                    <strong>Vehicle Registration:</strong> You must have a vehicle 
                    registered in your account before posting a ride offering.
                    <ul>
                      <li>
                        If you haven't registered a vehicle yet, you'll be prompted 
                        to do so when you try to post an offering.
                      </li>
                    </ul>
                  </li>
                </ul>

                <h6>To submit your offering:</h6>
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
                    Click "Post Offering" to publish your ride.
                  </li>
                </ol>

                <div className="alert alert-info">
                  <strong>Note:</strong> Once posted, your ride offering will be
                  visible to people looking for rides. You'll be notified when
                  someone requests a seat in your vehicle.
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

export default PostRideListingInfoPopup;
// InfoPopup.jsx
import { useState } from "react";

function ProfieFormInfoPopup() {
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
          top: "10px",
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
                <h5 className="modal-title">How to Use This Page</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPopup(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <h5>Profile Information Guide</h5>
                <p>
                  This page allows you to set up or update your profile
                  information.
                </p>

                <h6>Instructions:</h6>
                <ul>
                  <li>
                    <strong>Name:</strong> Enter your full name using only
                    letters and spaces. Maximum 50 characters.
                  </li>
                  <li>
                    <strong>Contact Information:</strong> You must add at least
                    one contact method.
                  </li>
                  <li>
                    <strong>Contact Types:</strong>
                    <ul>
                      <li>
                        <strong>Phone:</strong> Numbers only, no spaces or
                        symbols.
                      </li>
                      <li>
                        <strong>Email:</strong> Must be in valid format
                        (example@domain.com).
                      </li>
                      <li>
                        <strong>Social:</strong> Select a platform and enter
                        your username or ID.
                      </li>
                      <li>
                        <strong>Other:</strong> Any other contact method you
                        wish to include.
                      </li>
                    </ul>
                  </li>
                </ul>

                <h6>To add a contact method:</h6>
                <ol>
                  <li>Select the contact type from the dropdown</li>
                  <li>For social media, select the platform</li>
                  <li>Enter the contact value</li>
                  <li>
                    Click "Add Contact & Save" to add and save your profile
                  </li>
                </ol>

                <h6>Managing contact methods:</h6>
                <ul>
                  <li>
                    All your added contact methods appear in the list below the
                    form
                  </li>
                  <li>
                    To remove a contact method, click the "Delete" button next
                    to it
                  </li>
                  <li>At least one contact method is required</li>
                </ul>
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

export default ProfieFormInfoPopup;

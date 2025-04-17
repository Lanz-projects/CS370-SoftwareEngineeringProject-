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
              <div className="modal-header text-white">
                <h5 className="modal-title">Profile Setup Guide</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPopup(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <h5>Complete Your Profile</h5>
                <p>
                  You must complete your profile before you can access all features.
                  This information helps other users contact you.
                </p>

                <h6>Required Information:</h6>
                <ul>
                  <li>
                    <strong>Name:</strong> Enter your full name using only
                    letters and spaces (maximum 30 characters).
                  </li>
                  <li>
                    <strong>Contact Information:</strong> You must add at least
                    one contact method before you can exit.
                  </li>
                </ul>

                <h6>Contact Types:</h6>
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
                    <strong>Social:</strong> Select a platform (Twitter, Instagram, etc.)
                    and enter your username or ID.
                  </li>
                  <li>
                    <strong>Other:</strong> Any other contact method you
                    wish to include.
                  </li>
                </ul>

                <h6>To add a contact method:</h6>
                <ol>
                  <li>Select the contact type from the dropdown</li>
                  <li>For social media, select the specific platform</li>
                  <li>Enter the contact value</li>
                  <li>Click "Add" to add it to your list</li>
                  <li>Click "Save Profile" when you're done</li>
                </ol>

                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Important:</strong> You must save your profile before you can exit. 
                  Ensure you have added your name and at least one contact method.
                </div>

                <h6>Managing contact methods:</h6>
                <ul>
                  <li>
                    View all your contact methods in the list below the form
                  </li>
                  <li>
                    Remove any contact method by clicking the "Delete" button
                  </li>
                  <li>
                    Make sure to maintain at least one contact method
                  </li>
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
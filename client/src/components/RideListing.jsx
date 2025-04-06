import Navigationbar from "../components/Navigationbar";
import RideListingLayout from "../components/RideListingsLayout.jsx";

const RideListing = () => {
  return (
    <div>
      <Navigationbar />

      {/* Filter Button UI */}
      <div style={{ padding: "1rem", display: "flex", justifyContent: "flex-end" }}>
        <button
          style={{
            padding: "8px 16px",
            backgroundColor: "#eee",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ☰ Filter
        </button>
      </div>

      <RideListingLayout />
    </div>
  );
};

export default RideListing;

import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navigationbar from "../components/Navigationbar";
import DashboardLayout from "../components/DashboardLayout";

const Dashboard = () => {
  const [recentPosts, setRecentPosts] = useState([]); // State to hold recent posts

  return (
    <div>
      <Navigationbar />
      <DashboardLayout />
      <div className="container-fluid d-flex vh-100 p-0">
        {/* Recent Listings Section (50%) */}
        <div className="col-lg-6 col-md-6 bg-light text-black p-4 rounded-3 text-center">
          <h3 className="mb-4">Recent Listings</h3>
          <ul className="list-unstyled">
            <li className="mb-3">
              <div className="border p-3 rounded-3">
                <h5>Ride to X Destination</h5>
                <p>Looking for a ride to X. Let me know if you're heading that way!</p>
              </div>
            </li>
            <li className="mb-3">
              <div className="border p-3 rounded-3">
                <h5>Going to Y Place</h5>
                <p>I'm planning to go to Y place. Anyone interested in joining?</p>
              </div>
            </li>
            {/* Add more listings dynamically here */}
          </ul>
        </div>

        {/* Your Recent Posts Section (50%) */}
        <div className="col-lg-6 col-md-6 bg-white text-black p-4 rounded-3 text-center">
          <h3 className="mb-4">Your Recent Posts</h3>
          {recentPosts.length > 0 ? (
            <ul className="list-unstyled">
              {recentPosts.map((post, index) => (
                <li key={index} className="mb-3">
                  <div className="border p-3 rounded-3">
                    <h5>{post.title}</h5>
                    <p>{post.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>There are no posts.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
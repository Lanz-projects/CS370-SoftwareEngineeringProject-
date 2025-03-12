import { Link } from "react-router-dom"

function Navigationbar() {
  return(
    <div className="top-nav-bar">
      <nav>
        <ul>
          <li><Link to="/">Homepage</Link></li>
          <li><Link to="/signup">Signup</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/profile">profile</Link></li>
          <li><Link to="/dashboard">dashboard</Link></li>
          <li><Link to="/ridelistings">Ridelisting</Link></li>
          <li><Link to="/settings">settings</Link></li>
          <li><Link to="/notifications">notifications</Link></li>
        </ul>
      </nav>
    </div>
  )
}

export default Navigationbar
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import CheckUserLogged from "./CheckUserLogged"; 
import { handleLogout } from "./logOut"; 
import styles from "./Navigationbar.module.css"; 
// import { useEffect } from "react"; // Used for checking if user is logged in

function Navigationbar() {
  const user = CheckUserLogged(); 
  const navigate = useNavigate(); 

  /*
  // Log user info to the console for testing
  useEffect(() => {
    if (user) {
      console.log("User is logged in:", user); // Log user info if logged in
    } else {
      console.log("No user is logged in");
    }
  }, [user]); // The effect runs whenever 'user' changes
  */

  return (
    <Navbar className={styles.customNavbar} expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/" className={styles.customBrand}>
          Truman Ride-Share
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className={styles.customeNavLinkContainer}>
            {/* Always show Homepage link */}
            <Nav.Link as={Link} to="/" className={styles.customNavLink}>Homepage</Nav.Link>

            {/* If user is not logged in, show Signup and Login */}
            {!user && (
              <>
                <Nav.Link as={Link} to="/signup" className={styles.customNavLink}>Signup</Nav.Link>
                <Nav.Link as={Link} to="/login" className={styles.customNavLink}>Login</Nav.Link>
              </>
            )}

            {/* If user is logged in, show additional links and Logout */}
            {user && (
              <>
                <Nav.Link as={Link} to="/profile" className={styles.customNavLink}>Profile</Nav.Link>
                <Nav.Link as={Link} to="/dashboard" className={styles.customNavLink}>Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/ridelistings" className={styles.customNavLink}>Ridelisting</Nav.Link>
                <Nav.Link as={Link} to="/settings" className={styles.customNavLink}>Settings</Nav.Link>
                <Nav.Link as={Link} to="/notifications" className={styles.customNavLink}>Notifications</Nav.Link>
                <Nav.Link onClick={() => handleLogout(navigate)} className={styles.customNavLink}>Logout</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigationbar;

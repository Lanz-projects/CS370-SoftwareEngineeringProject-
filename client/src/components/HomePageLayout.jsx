import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./HomePageLayout.module.css";

function HomePageLayout(){
  const navigate = useNavigate();

  return (
    <Container className={styles.homeContainer}>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className={styles.infoCard}>
            <Card.Body>
              <Card.Title className={styles.cardTitle}>Welcome to Truman Ride-Share!</Card.Title>
              <Card.Text className={styles.cardText}>
                We, as a group for this software engineering class, propose a new online web application integrated into Truman State’s domain. Our application will allow Truman students to coordinate ride-shares with ease, providing a much-needed service to our community. 
                <br />
                <br />
                <strong>Why This Matters:</strong> International students often struggle to find rides to the grocery store or airport, and parents in the Truman Facebook group seek carpools for their children. Our app provides a secure, simple way to coordinate transportation needs.
              </Card.Text>
              <Button variant="primary" className={styles.getStartedButton} onClick={(e) => navigate("/terms-and-conditions")}>Website Terms & Service</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="justify-content-center mt-4">
        <Col md={10}>
          <Card className={styles.solutionCard}>
            <Card.Body>
              <Card.Title className={styles.cardTitle}>Our Solution</Card.Title>
                <div>
                  <ul>
                    <li>Secure login and sign-up system</li>
                    <li>User profile page with vehicle information</li>
                    <li>Simple dashboard and ride request functions</li>
                    <li>Interactive map to view available rides</li>
                    <li>Automated notifications for ride updates</li>
                  </ul>
                </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePageLayout;

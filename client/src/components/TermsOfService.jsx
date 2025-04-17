import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import styles from './TermsOfService.module.css';

function TermsOfService(){
  return (
    <Container className={styles.termsContainer}>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className={styles.termsCard}>
            <Card.Body>
              <Card.Title className={styles.cardTitle}>User Agreement</Card.Title>
              
              <h5>1. Introduction</h5>
              <p className={styles.cardText}>
                By using this web app, you agree to the following terms and conditions. This agreement outlines the rights and responsibilities of both the users and the platform. If you do not agree with any part of this agreement, please refrain from using the app.
              </p>

              <h5>2. Purpose</h5>
              <p className={styles.cardText}>
                This web app provides a ride-share service to the Truman State community, facilitating the offering and requesting of rides within Kirksville and surrounding areas. The app also includes features for notifications, profile management, and basic settings modifications.
              </p>

              <h5>3. Limitation of Liability</h5>
              <p className={styles.cardText}>
                The platform, its creators, and administrators are not responsible for any damages, injuries, losses, payments, or inconveniences arising from the use of this web app. The platform does not guarantee the accuracy, reliability, or safety of any ride offers or requests posted on the app. Users are solely responsible for ensuring that the rides they offer or request are safe, legal, and in accordance with local laws.
              </p>

              <h5>4. No Responsibility Outside the App</h5>
              <p className={styles.cardText}>
                The platform is not responsible for any actions, events, or interactions that occur outside of the web app. This includes, but is not limited to, transportation issues, disagreements between users, or any other events that happen during the physical ride or after users have communicated through the platform. The web app is only responsible for facilitating the ride-sharing process within the platform itself.
              </p>

              <h5>5. Third-Party Services</h5>
              <p className={styles.cardText}>
                The web app uses third-party services, such as Google Authentication through Firebase, for user authentication and account management. By using these services, you agree to the terms and conditions of the respective third-party providers. We are not responsible for any issues related to these services.
              </p>

              <h5>6. Features and Availability</h5>
              <p className={styles.cardText}>
                While the app aims to provide a comprehensive ride-share service, certain features, such as chat rooms or package transportation, are not guaranteed and may not be implemented. The app will be deployed with the core functionality of offering and requesting rides, and we do not plan to add extra features after the initial deployment unless specified.
              </p>

              <h5>7. User Responsibilities</h5>
              <p className={styles.cardText}>
                You are responsible for providing accurate information when posting offers or requests for rides. You must ensure that your actions comply with local laws, regulations, and safety guidelines. You are responsible for any communication, agreements, or arrangements made with other users through the app. Any inappropriate behavior, misuse of the platform, or violation of the terms and conditions may result in the suspension or termination of your account.
              </p>

              <h5>8. Modifications to the Agreement</h5>
              <p className={styles.cardText}>
                The platform reserves the right to update or modify this agreement at any time. Any changes will be reflected in the updated version of this agreement. It is your responsibility to review this document periodically for any updates.
              </p>

              <h5>9. No Guarantee of Service</h5>
              <p className={styles.cardText}>
                We do not guarantee that the app will always be available or free of errors. We reserve the right to suspend or discontinue the app at any time without notice.
              </p>

              <h5>10. Termination</h5>
              <p className={styles.cardText}>
                The platform reserves the right to terminate or suspend any user account that violates this agreement or engages in inappropriate behavior.
              </p>
            </Card.Body>
          </Card>

          <div className="text-center mt-3">
            <Button variant="primary" href="/" className={styles.returnButton}>Home</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default TermsOfService;
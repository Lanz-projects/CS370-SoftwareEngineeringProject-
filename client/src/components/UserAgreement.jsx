import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";

function UserAgreementPopup({ show, handleAccept }) {
  const [isChecked, setIsChecked] = useState(false); // Captures the state of checkbox

  return (
    // This is the popup of the User Agreement
    <Modal show={show} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>User Agreement</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          1. Introduction <br/>
          By using this web app, you agree to the following terms and conditions. This agreement outlines the rights and responsibilities of both the users and the platform. If you do not agree with any part of this agreement, please refrain from using the app.   <br/><br/>
          2. Purpose 
          This web app provides a ride-share service to the Truman State community, facilitating the offering and requesting of rides within Kirksville and surrounding areas. The app also includes features for notifications, profile management, and basic settings modifications.  <br/><br/>
          3. Limitation of Liability
          The platform, its creators, and administrators are not responsible for any damages, injuries, losses, or inconveniences arising from the use of this web app. The platform does not guarantee the accuracy, reliability, or safety of any ride offers or requests posted on the app. Users are solely responsible for ensuring that the rides they offer or request are safe, legal, and in accordance with local laws. <br/><br/>
          4. No Responsibility Outside the App
          The platform is not responsible for any actions, events, or interactions that occur outside of the web app. This includes, but is not limited to, transportation issues, disagreements between users, or any other events that happen during the physical ride or after users have communicated through the platform. The web app is only responsible for facilitating the ride-sharing process within the platform itself. <br/><br/>
          5. Third-Party Services

          The web app uses third-party services, such as Google Authentication through Firebase, for user authentication and account management. By using these services, you agree to the terms and conditions of the respective third-party providers. We are not responsible for any issues related to these services. <br/><br/>
          6. Features and Availability
          While the app aims to provide a comprehensive ride-share service, certain features, such as chat rooms or package transportation, are not guaranteed and may not be implemented. The app will be deployed with the core functionality of offering and requesting rides, and we do not plan to add extra features after the initial deployment unless specified. <br/><br/>
          7. User Responsibilities
          You are responsible for providing accurate information when posting offers or requests for rides.
          You must ensure that your actions comply with local laws, regulations, and safety guidelines.
          You are responsible for any communication, agreements, or arrangements made with other users through the app.
          Any inappropriate behavior, misuse of the platform, or violation of the terms and conditions may result in the suspension or termination of your account. <br/><br/>
          8. Modifications to the Agreement
          The platform reserves the right to update or modify this agreement at any time. Any changes will be reflected in the updated version of this agreement. It is your responsibility to review this document periodically for any updates. <br/><br/>
          9. No Guarantee of Service

          We do not guarantee that the app will always be available or free of errors. We reserve the right to suspend or discontinue the app at any time without notice. <br/><br/>
          10. Termination
          The platform reserves the right to terminate or suspend any user account that violates this agreement or engages in inappropriate behavior.
        </p>
        <Form.Group controlId="agreementCheckbox">
          <Form.Check 
            type="checkbox" 
            label="I agree to the terms and conditions"
            onChange={(e) => setIsChecked(e.target.checked)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleAccept} disabled={!isChecked}>
          Accept
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UserAgreementPopup;

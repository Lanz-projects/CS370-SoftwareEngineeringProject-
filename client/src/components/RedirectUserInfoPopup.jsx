import { Modal, Button } from "react-bootstrap"; 

function RedirectUserInfoPopup ({ show, onConfirm, onSkip }) {
  return (
    <Modal show={show} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Complete Your Setup</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          To access ride-share features, you need to complete the next step.  
          If you <em>decide to do this later, you won't be able to use any ride-share features</em>.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onConfirm}>
          Go to Next Page
        </Button>
        <Button variant="secondary" onClick={onSkip}>
          Do It Later
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RedirectUserInfoPopup;
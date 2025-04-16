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
          You will be redirected to complete your profile. Afterwords, you will be 
          able to use most features. If you decide to offer a post, <em>please register your
          vehicle in the profile page.</em>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onConfirm}>
          Go to Next Page
        </Button>
        {/*
        <Button variant="secondary" onClick={onSkip}>
          Do It Later
        </Button>
        */} 
      </Modal.Footer>
    </Modal>
  );
}

export default RedirectUserInfoPopup;
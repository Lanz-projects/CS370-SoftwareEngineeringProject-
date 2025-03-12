import Registration from "../components/Registration"; 
import Navigationbar from "../components/Navigationbar";
function Signup() {
  return(
    <div>
      <Navigationbar></Navigationbar>
      <h1>This is the signup page</h1>
      <Registration></Registration>
    </div>
  );
}

export default Signup;
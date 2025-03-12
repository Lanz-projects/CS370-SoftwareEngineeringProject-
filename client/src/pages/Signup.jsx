import Registration from "../components/Registration"; 
import Navigationbar from "../components/Navigationbar";

function Signup() {
  return(
    <div>
      <Navigationbar />
      <h1>This is the Signup page</h1>
      <Registration />
    </div>
  );
}

export default Signup;

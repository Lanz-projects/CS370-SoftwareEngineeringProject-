import LoginFunc from "../components/LoginFunc";
import Navigationbar from "../components/Navigationbar";

function Login() {
  return(
    <div>
      <Navigationbar></Navigationbar>
      <h1>This is the Login page</h1>
      <LoginFunc></LoginFunc>
    </div>
  );
}

export default Login;
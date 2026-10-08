import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();

    if (username === "admin" && password === "1234") {
      localStorage.setItem("loggedIn", "true");

      navigate("/dashboard");
    } else {
      alert("Invalid username or password");
    }
  }

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-header">
          <h1>Library Management System</h1>
          <p>Administrator Login</p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Username</label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>

        </form>

        <p className="login-footer">
          Library Management System
        </p>

      </div>

    </div>
  );
}

export default Login;
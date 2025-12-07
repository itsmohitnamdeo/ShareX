import React, { useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setRegister] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (isRegister && name.trim().length < 3) {
      errs.name = "Name must be at least 3 characters";
    }
    if (!emailRegex.test(email)) {
      errs.email = "Please enter a valid email";
    }
    if (!passwordRegex.test(password)) {
      errs.password =
        "Password must be 8+ chars, include uppercase, lowercase, number, and special char";
    }
    return errs;
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      const path = isRegister ? "/auth/register" : "/auth/login";
      const body = isRegister ? { name, email, password } : { email, password };
      const { data } = await API.post(path, body);

      if (isRegister) {
        setMessage("Registered successfully! Please login.");
        setRegister(false);
        setName("");
        setEmail("");
        setPassword("");
      } else {
        sessionStorage.setItem("token", data.token);
        onLogin(data.token);
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="login-container">
      <h1 className="brand">ShareX</h1>
      <div className="login-card">
        <h2 className="login-title">{isRegister ? "Create Account" : "Welcome Back"}</h2>

        {message && <div className="login-message">{message}</div>}

        <form onSubmit={submit} className="login-form">
          {isRegister && (
            <>
              <input
                className="login-input"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </>
          )}

          <input
            className="login-input"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="error">{errors.email}</span>}

          <input
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
          {errors.password && <span className="error">{errors.password}</span>}

          <button type="submit" className="login-button">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <button onClick={() => setRegister(!isRegister)} className="toggle-btn">
          {isRegister ? "Already have an account? Login" : "Create an account"}
        </button>
      </div>
    </div>
  );
}

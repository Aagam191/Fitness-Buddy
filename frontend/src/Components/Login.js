import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../user.css";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const result = await login(formData.username.trim(), formData.password);
      if (result.success) {
        showSuccess("Login successful! Welcome back.");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        showError(result.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login failed!", error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed! Please check your credentials.";
      showError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="login-page">
      <div className="image-section"></div>
      <div className="form-section">
        <div className="login-body">
          <h2 className="login-header">Login</h2>
          <hr className="horizontal-line" />
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                className="input"
                id="username"
                name="username"
                aria-label="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <svg
                className="input-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20 22h-2v-2a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v2H4v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2zm-8-9a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
              </svg>
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password (6-10 characters)"
                className="input"
                maxLength={10}
                minLength={6}
                id="password"
                name="password"
                aria-label="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <svg
                className="input-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18 8h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h2V7a6 6 0 1 1 12 0v1zM5 10v10h14V10H5zm6 3h2v4h-2v-4zm3-5V7a3 3 0 0 0-6 0v1h6z" />
              </svg>
            </div>
            <button className="submit" type="submit" disabled={submitting}>
              {submitting ? "Logging In..." : "Submit"}
            </button>
            <div className="login-footer">
              <Link to="/signup" className="new-user">
                New to MyFit?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

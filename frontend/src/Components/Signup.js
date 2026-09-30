import React, { useState } from "react";
import "../user.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password1: "",
    password2: "",
    isPremiumUser: false,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (formData.password1 !== formData.password2) {
      showError("Passwords don't match");
      return;
    }

    const valid_data = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password1,
      isPremiumUser: false,
    };

    try {
      setSubmitting(true);
      const result = await register(valid_data);
      if (result.success) {
        showSuccess("Registration successful! Welcome to MyFit.");
        setFormData({
          username: "",
          email: "",
          password1: "",
          password2: "",
          isPremiumUser: false,
        });
        setTimeout(() => {
          navigate("/");
        }, 1200);
      } else {
        showError(result.message || "Registration failed");
      }
    } catch (error) {
      console.error("There was an error!", error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please try again.";
      showError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="login-page">
        <div className="image-section"></div>

        <div className="form-section">
          <div className="login-body">
            <h2 className="login-header">Signup</h2>
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
                  type="email"
                  placeholder="Email address"
                  className="input"
                  id="email"
                  name="email"
                  aria-label="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <svg
                  className="input-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Create password (6-10 characters)"
                  className="input"
                  maxLength={10}
                  minLength={6}
                  id="password1"
                  name="password1"
                  aria-label="Password"
                  value={formData.password1}
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
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Re-enter password"
                  className="input"
                  maxLength={10}
                  minLength={6}
                  id="password2"
                  name="password2"
                  aria-label="Confirm Password"
                  value={formData.password2}
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
                {submitting ? "Creating Account..." : "Submit"}
              </button>
              <div className="login-footer">
                <Link to="/login" className="new-user">
                  Already have an account?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

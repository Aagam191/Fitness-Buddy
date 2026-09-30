import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HomeIcon,
  CompassIcon,
  SparklesIcon,
  CalculatorIcon,
  UtensilsIcon,
  ActivityIcon,
  DumbbellIcon,
  LayoutDashboardIcon,
  LogInIcon,
  LogoutIcon,
  ZapIcon,
} from "./Icons";

export default function Navbar() {
  const { user, logout, isPremiumUser } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor window scroll for subtle header shadow adjustment
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Helper to determine if a route is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`nav-backdrop ${mobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      <header className={`header ${isScrolled ? "header-scrolled" : ""}`}>
        <Link to="/" className="logo" onClick={closeMobileMenu} aria-label="MyFit Home">
          <span className="logo-badge" aria-hidden="true">
            <ZapIcon size={17} color="#ffffff" />
          </span>
          <span className="logo-text">
            <span className="logo-accent">MY</span>FIT
          </span>
        </Link>

        <button
          id="menu-btn"
          className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"}`}
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="main-navbar"
          type="button"
        />

        <nav id="main-navbar" className={`navbar1 ${mobileMenuOpen ? "active" : ""}`}>
          <ul>
            <li>
              <Link
                to="/"
                className={isActive("/") ? "active" : ""}
                aria-current={isActive("/") ? "page" : undefined}
                onClick={closeMobileMenu}
              >
                <HomeIcon size={15} className="nav-icon" aria-hidden="true" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/directory"
                className={isActive("/directory") || isActive("/exercises") ? "active" : ""}
                aria-current={isActive("/directory") ? "page" : undefined}
                onClick={closeMobileMenu}
              >
                <CompassIcon size={15} className="nav-icon" aria-hidden="true" />
                <span>Directory</span>
              </Link>
            </li>
            <li>
              <Link
                to="/programs"
                className={isActive("/programs") ? "active" : ""}
                aria-current={isActive("/programs") ? "page" : undefined}
                onClick={closeMobileMenu}
              >
                <SparklesIcon size={15} className="nav-icon" aria-hidden="true" />
                <span>Programs</span>
              </Link>
            </li>
            <li>
              <Link
                to="/calculate_bmi"
                className={isActive("/calculate_bmi") ? "active" : ""}
                aria-current={isActive("/calculate_bmi") ? "page" : undefined}
                onClick={closeMobileMenu}
              >
                <CalculatorIcon size={15} className="nav-icon" aria-hidden="true" />
                <span>BMI Calculator</span>
              </Link>
            </li>
            <li>
              <Link
                to="/predict"
                className={isActive("/predict") ? "active" : ""}
                aria-current={isActive("/predict") ? "page" : undefined}
                onClick={closeMobileMenu}
              >
                <UtensilsIcon size={15} className="nav-icon" aria-hidden="true" />
                <span>Diet</span>
              </Link>
            </li>

            {user && (
              <>
                <li>
                  <Link
                    to="/heatmap"
                    className={isActive("/heatmap") ? "active" : ""}
                    aria-current={isActive("/heatmap") ? "page" : undefined}
                    onClick={closeMobileMenu}
                  >
                    <ActivityIcon size={15} className="nav-icon" aria-hidden="true" />
                    <span>Heatmap</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/workouts"
                    className={isActive("/workouts") ? "active" : ""}
                    aria-current={isActive("/workouts") ? "page" : undefined}
                    onClick={closeMobileMenu}
                  >
                    <DumbbellIcon size={15} className="nav-icon" aria-hidden="true" />
                    <span>Workouts</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className={isActive("/dashboard") ? "active" : ""}
                    aria-current={isActive("/dashboard") ? "page" : undefined}
                    onClick={closeMobileMenu}
                  >
                    <LayoutDashboardIcon size={15} className="nav-icon" aria-hidden="true" />
                    <span>Dashboard</span>
                  </Link>
                </li>
              </>
            )}

            {user ? (
              <li className="nav-auth-item">
                <Link
                  to="/dashboard"
                  className="nav-user-pill"
                  onClick={closeMobileMenu}
                  aria-label="View user profile"
                >
                  <span className="nav-avatar-circle" aria-hidden="true">
                    {(user.username || "A")[0].toUpperCase()}
                  </span>
                  <span className="nav-username">{user.username}</span>
                  {isPremiumUser && <span className="nav-pro-badge">PRO</span>}
                </Link>
                <button
                  type="button"
                  className="nav-logout-btn"
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  aria-label="Logout from account"
                >
                  <LogoutIcon size={15} className="nav-logout-icon" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </li>
            ) : (
              <li className="nav-auth-item">
                <Link
                  to="/login"
                  className={`login-btn-nav ${isActive("/login") ? "active" : ""}`}
                  onClick={closeMobileMenu}
                >
                  <LogInIcon size={15} className="nav-login-icon" aria-hidden="true" />
                  <span>Login</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </header>
    </>
  );
}


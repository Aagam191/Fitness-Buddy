import React from 'react';
import { Link } from 'react-router-dom';
import {
  ZapIcon,
  ChevronRightIcon,
  MapPinIcon,
  MailIcon,
  PhoneIcon,
  TwitterIcon,
  LinkedinIcon,
  InstagramIcon,
  FacebookIcon,
} from './Icons';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col">
            <Link to="/" className="footer-logo d-inline-flex align-items-center mb-3">
              <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#ffffff', letterSpacing: '0.1rem' }}>
                MY<span style={{ color: '#ff0000' }}>FIT</span>
              </span>
            </Link>
            <p className="footer-desc">
              Precision biomechanical atlas, AI-powered nutritional schedules, and progressive overload tracking built for high-performing athletes.
            </p>
          </div>

          {/* Core Navigation */}
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link className="footer-link-item" to="/">
                  <ChevronRightIcon size={14} className="text-danger" /> Home
                </Link>
              </li>
              <li>
                <Link className="footer-link-item" to="/directory">
                  <ChevronRightIcon size={14} className="text-danger" /> Exercise Directory
                </Link>
              </li>
              <li>
                <Link className="footer-link-item" to="/programs">
                  <ChevronRightIcon size={14} className="text-danger" /> 8-Week Programs
                </Link>
              </li>
              <li>
                <Link className="footer-link-item" to="/calculate_bmi">
                  <ChevronRightIcon size={14} className="text-danger" /> BMI Calculator
                </Link>
              </li>
              <li>
                <Link className="footer-link-item" to="/predict">
                  <ChevronRightIcon size={14} className="text-danger" /> AI Diet Protocols
                </Link>
              </li>
            </ul>
          </div>

          {/* Performance Tools */}
          <div className="footer-col">
            <h3>Athlete Tools</h3>
            <ul className="footer-links">
              <li>
                <Link className="footer-link-item" to="/workouts">
                  <ChevronRightIcon size={14} className="text-danger" /> Workout Logger
                </Link>
              </li>
              <li>
                <Link className="footer-link-item" to="/heatmap">
                  <ChevronRightIcon size={14} className="text-danger" /> Biomechanical Heatmap
                </Link>
              </li>
              <li>
                <Link className="footer-link-item" to="/dashboard">
                  <ChevronRightIcon size={14} className="text-danger" /> Athlete Dashboard
                </Link>
              </li>
              <li>
                <Link className="footer-link-item" to="/payment">
                  <ChevronRightIcon size={14} className="text-danger" /> Pro Membership
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="footer-col">
            <h3>Athlete Center</h3>
            <div className="contact-info-list mb-3">
              <div className="contact-item">
                <MapPinIcon size={18} className="contact-icon text-danger" />
                <span>Athlete Performance Center</span>
              </div>
              <div className="contact-item">
                <MailIcon size={18} className="contact-icon text-danger" />
                <span>support@myfit.app</span>
              </div>
              <div className="contact-item">
                <PhoneIcon size={18} className="contact-icon text-danger" />
                <span>+91 90765 34789</span>
              </div>
            </div>

            <div className="social-share-group mt-3">
              <a href="https://facebook.com/" className="social-btn" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookIcon size={18} />
              </a>
              <a href="https://twitter.com/" className="social-btn" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <TwitterIcon size={18} />
              </a>
              <a href="https://linkedin.com/" className="social-btn" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <LinkedinIcon size={18} />
              </a>
              <a href="https://instagram.com/" className="social-btn" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-copyright-bar">
          <p className="m-0">
            &copy; {new Date().getFullYear()} <strong className="text-white">MyFit</strong>. All rights reserved.
          </p>
          <div className="d-flex gap-3">
            <Link to="/about" className="footer-link-item" style={{ fontSize: '1.3rem' }}>About Platform</Link>
            <span>•</span>
            <Link to="/directory" className="footer-link-item" style={{ fontSize: '1.3rem' }}>Kinematic Library</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

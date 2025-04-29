import React from "react";
import "../styles/Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookSquare, faTwitterSquare, faInstagramSquare } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>INFO</h3>
          <ul>
            <li><a href="#">Formats</a></li>
            <li><a href="#">Compression</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Status</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>RESOURCES</h3>
          <ul>
            <li><a href="#">Developer API</a></li>
            <li><a href="#">Tools</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>COMPANY</h3>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Sustainability</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Subscribe to our email newsletter</h3>
          <form className="newsletter-form">
            <input type="email" placeholder="Your email" className="newsletter-input" />
            <button type="submit" className="newsletter-button">SUBSCRIBE</button>
          </form>

          <h3>Follow us</h3>
          <div className="social-icons">
            <a href="#" className="facebook"><FontAwesomeIcon icon={faFacebookSquare} size="2x" /></a>
            <a href="#" className="twitter"><FontAwesomeIcon icon={faTwitterSquare} size="2x" /></a>
            <a href="#" className="instagram"><FontAwesomeIcon icon={faInstagramSquare} size="2x" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
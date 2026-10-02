import { useState, useEffect } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <a href="#" className="logo">
          Drave<span>X</span>
        </a>
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="nav-actions">
          <a href="#/login" className="btn-nav-login">
            Log In
          </a>
          <a href="#/register" className="btn-nav">
            <i className="fab fa-whatsapp"></i> Start Free Trial
          </a>
        </div>
      </div>
    </nav>
  );
}

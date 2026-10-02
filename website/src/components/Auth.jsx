import { useState } from "react";
import "./Auth.css";

export default function Auth({ initialMode = "register", onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    fullName: "",
    phone: "",
    email: "",
    password: "",
    agreed: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="auth-page">
      <header className="auth-nav">
        <a
          href="#"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            if (onBack) onBack();
            else window.location.hash = "";
          }}
        >
          Drave<span>X</span>
        </a>
        <button
          type="button"
          className="btn-back"
          onClick={() => {
            if (onBack) onBack();
            else window.location.hash = "";
          }}
        >
          <i className="fas fa-arrow-left"></i> Back to Home
        </button>
      </header>

      <main className="auth-container">
        <div className="auth-card">
          {submitted ? (
            <div className="auth-success">
              <div className="success-icon-wrap">
                <i className="fas fa-check"></i>
              </div>
              <h3>
                {mode === "register" ? "Welcome to DraveX!" : "Welcome back!"}
              </h3>
              <p>
                {mode === "register"
                  ? `Your 7-day free trial has been activated for ${
                      formData.businessName || "your business"
                    }.`
                  : "You are logged in successfully."}
              </p>

              {mode === "register" && (
                <div className="auth-trial-info">
                  <div>
                    <i className="fas fa-calendar-check"></i>
                    <span>Free Trial Period: <strong>7 Days Active</strong></span>
                  </div>
                  <div>
                    <i className="fab fa-whatsapp"></i>
                    <span>
                      WhatsApp:{" "}
                      <strong>
                        +234 {formData.phone || "your connected number"}
                      </strong>
                    </span>
                  </div>
                  <div>
                    <i className="fas fa-shield-alt"></i>
                    <span>No credit card required during trial</span>
                  </div>
                </div>
              )}

              <a
                href={`https://wa.me/2348103921586?text=${encodeURIComponent(
                  mode === "register"
                    ? `Hi DraveX, I just signed up for the free trial for ${formData.businessName} (+234${formData.phone})!`
                    : "Hi DraveX, I am logging in to my account."
                )}`}
                className="btn-auth-submit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-whatsapp"></i> Connect WhatsApp Now
              </a>

              <div style={{ marginTop: "16px" }}>
                <button
                  type="button"
                  className="btn-back"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    if (onBack) onBack();
                    else window.location.hash = "";
                  }}
                >
                  Return to Home
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-header">
                {mode === "register" ? (
                  <>
                    <div className="auth-badge">
                      <i className="fas fa-bolt"></i> 7-Day Free Trial
                    </div>
                    <h2>Start Your Free Trial</h2>
                    <p>No credit card required. Setup in less than 2 minutes.</p>
                  </>
                ) : (
                  <>
                    <div className="auth-badge">
                      <i className="fas fa-lock"></i> Client Portal
                    </div>
                    <h2>Sign In to DraveX</h2>
                    <p>Manage your bot, orders, and WhatsApp settings.</p>
                  </>
                )}
              </div>

              {/* Segmented Switcher */}
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab-btn ${mode === "register" ? "active" : ""}`}
                  onClick={() => setMode("register")}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
                  onClick={() => setMode("login")}
                >
                  Log In
                </button>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                {mode === "register" ? (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Your Name</label>
                        <div className="input-wrapper">
                          <i className="fas fa-user prefix-icon"></i>
                          <input
                            type="text"
                            name="fullName"
                            placeholder="e.g. Tunde Ade"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Business Name</label>
                        <div className="input-wrapper">
                          <i className="fas fa-store prefix-icon"></i>
                          <input
                            type="text"
                            name="businessName"
                            placeholder="e.g. Glow & Grace Wears"
                            value={formData.businessName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>WhatsApp Number (for bot connection)</label>
                      <div className="input-wrapper input-with-phone">
                        <i className="fab fa-whatsapp prefix-icon"></i>
                        <span className="phone-prefix-tag">🇳🇬 +234</span>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="8012345678"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Email Address</label>
                      <div className="input-wrapper">
                        <i className="fas fa-envelope prefix-icon"></i>
                        <input
                          type="email"
                          name="email"
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Create Password</label>
                      <div className="input-wrapper">
                        <i className="fas fa-lock prefix-icon"></i>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="At least 6 characters"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="toggle-pw"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label="Toggle password visibility"
                        >
                          <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="form-options">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="agreed"
                          checked={formData.agreed}
                          onChange={handleChange}
                          required
                        />
                        <span>I agree to DraveX Terms & Privacy</span>
                      </label>
                    </div>

                    <button type="submit" className="btn-auth-submit">
                      <span>Start 7-Day Free Trial</span>
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Email or WhatsApp Number</label>
                      <div className="input-wrapper">
                        <i className="fas fa-envelope prefix-icon"></i>
                        <input
                          type="text"
                          name="email"
                          placeholder="you@company.com or 080..."
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>
                        <span>Password</span>
                        <a
                          href="https://wa.me/2348103921586?text=Hi%2C%20I%20need%20help%20resetting%20my%20DraveX%20password"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="forgot-link"
                        >
                          Forgot?
                        </a>
                      </label>
                      <div className="input-wrapper">
                        <i className="fas fa-lock prefix-icon"></i>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <button
                          type="button"
                          className="toggle-pw"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label="Toggle password visibility"
                        >
                          <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="form-options">
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span>Keep me logged in</span>
                      </label>
                    </div>

                    <button type="submit" className="btn-auth-submit">
                      <span>Log In to Account</span>
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </>
                )}
              </form>

              <div className="auth-switch-prompt">
                {mode === "register" ? (
                  <span>
                    Already have an account?
                    <button type="button" onClick={() => setMode("login")}>
                      Log In
                    </button>
                  </span>
                ) : (
                  <span>
                    Don't have an account yet?
                    <button type="button" onClick={() => setMode("register")}>
                      Start Free Trial
                    </button>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

import "./Hero.css";

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-content">
        <h1>
          Run your business<br />
          on <span className="gradient-text">WhatsApp</span>
        </h1>
        <p className="hero-sub">
          DraveX is your AI-powered sales assistant that takes orders, answers customers,
          and tracks inventory — automatically, 24/7.
        </p>
        <div className="hero-btns">
          <a href="#/register" className="btn-primary">
            <i className="fab fa-whatsapp"></i> Start Free Trial
          </a>
          <a href="#how" className="btn-secondary">
            See how it works <i className="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>

      <div className="hero-visual">
        <div className="chat-mock">
          <div className="chat-header">
            <div className="chat-avatar">🤖</div>
            <div>
              <div className="chat-name">DraveX Bot</div>
              <div className="chat-status">● Online</div>
            </div>
          </div>
          <div className="chat-messages">
            <div className="msg msg-out">Hi, what jollof rice do you have? 🍛</div>
            <div className="msg msg-in">
              We have Party Jollof (₦2,500) and Small Chops Combo (₦4,000). What would you like?
            </div>
            <div className="msg msg-out">Give me 2 Party Jollof please</div>
            <div className="typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from "react";
import "./Features.css";

const features = [
  {
    icon: "fas fa-robot",
    title: "AI Sales Assistant",
    desc: "Answers questions, showcases products, and closes orders — even at 3am while you sleep.",
  },
  {
    icon: "fas fa-comments",
    title: "Understands Pidgin",
    desc: "Customers can chat naturally. DraveX understands Nigerian English, Pidgin and slang fluently.",
  },
  {
    icon: "fas fa-box-open",
    title: "Smart Ordering",
    desc: "Automatically collects customer name, address and order details. You just fulfill and deliver.",
  },
  {
    icon: "fas fa-bell",
    title: "Instant Alerts",
    desc: "Get notified on WhatsApp the second a new order comes in — no dashboard needed.",
  },
  {
    icon: "fas fa-warehouse",
    title: "Inventory Tracking",
    desc: "Stock automatically decreases with every order. You will always know exactly what is available.",
  },
  {
    icon: "fas fa-mobile-alt",
    title: "Phone-First Design",
    desc: "No complicated software. Everything runs through WhatsApp — the app you already use daily.",
  },
];

export default function Features() {
  const refs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-head reveal" ref={(el) => (refs.current[6] = el)}>
          <span className="section-label">Features</span>
          <h2 className="section-title">
            Everything you need to<br />sell on WhatsApp
          </h2>
          <p className="section-sub">Powerful automation. Zero tech skills required.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={i}
              className="glass-card reveal"
              ref={(el) => (refs.current[i] = el)}
            >
              <div className="feature-icon">
                <i className={f.icon}></i>
              </div>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from "react";
import "./Pricing.css";

const plans = [
  {
    name: "Starter",
    price: "₦10,000",
    period: "/ month",
    badge: null,
    featured: true,
    features: [
      "Unlimited orders",
      "AI product replies",
      "Inventory tracking",
      "Order notifications",
      "Setup assistance",
    ],
    cta: "Start Free Trial",
    link: "#/register",
  },
];

export default function Pricing() {
  const refs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 120);
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
    <section id="pricing" className="pricing-section">
      <div className="container">
        <div className="section-head reveal" ref={(el) => (refs.current[2] = el)}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">Simple, honest pricing</h2>
          <p className="section-sub">Start small. Scale as your business grows.</p>
        </div>
        <div className="pricing-grid">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`pricing-card reveal ${p.featured ? "featured" : ""}`}
              ref={(el) => (refs.current[i] = el)}
            >
              {p.badge && <div className="plan-badge">{p.badge}</div>}
              <div className="plan-name">{p.name}</div>
              <div className="plan-price">
                {p.price} <span>{p.period}</span>
              </div>
              <ul className="plan-features">
                {p.features.map((f, j) => (
                  <li key={j}>
                    <i className="fas fa-check-circle"></i> {f}
                  </li>
                ))}
              </ul>
              <a
                href={p.link}
                className={`btn-plan ${p.featured ? "btn-plan-primary" : "btn-plan-secondary"}`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


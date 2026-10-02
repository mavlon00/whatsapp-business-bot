import { useEffect, useRef } from "react";
import "./HowItWorks.css";

const steps = [
  { num: "01", title: "Tell us what you sell", desc: "Share your product list and prices. We handle the rest — no technical skills needed." },
  { num: "02", title: "We set up your bot", desc: "Our team configures your AI assistant and connects it to a dedicated WhatsApp number." },
  { num: "03", title: "Customers message", desc: "They chat the bot like a normal number. It replies instantly, handles objections, and closes sales." },
  { num: "04", title: "You get orders", desc: "Alerts come straight to your phone. You fulfill. DraveX handles everything before that." },
];

export default function HowItWorks() {
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
    <section id="how" className="how-section">
      <div className="container">
        <div className="section-head reveal" ref={(el) => (refs.current[4] = el)}>
          <span className="section-label">Process</span>
          <h2 className="section-title">Live in minutes,<br />not weeks</h2>
          <p className="section-sub">We handle all the setup. You just tell us what you sell.</p>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={i} className="glass-card reveal" ref={(el) => (refs.current[i] = el)}>
              <span className="step-num">{s.num}</span>
              <div className="step-title">{s.title}</div>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

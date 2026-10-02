import { useEffect, useRef } from "react";
import "./Stats.css";

const stats = [
  { number: "24/7", label: "Always-on AI responses" },
  { number: "<2s", label: "Average reply time" },
  { number: "0%", label: "Missed customer messages" },
  { number: "₦0", label: "Extra staff needed" },
];

export default function Stats() {
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
    <section id="stats" className="stats-section">
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="reveal" ref={(el) => (refs.current[i] = el)}>
            <span className="stat-number">{s.number}</span>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

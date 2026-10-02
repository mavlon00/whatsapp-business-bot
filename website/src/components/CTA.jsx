import { useEffect, useRef } from "react";
import "./CTA.css";

export default function CTA() {
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
    <section id="contact" className="cta-section">
      <div className="cta-content">
        <h2 className="cta-title reveal" ref={(el) => (refs.current[0] = el)}>
          Stop missing orders.<br />Start growing today.
        </h2>
        <p className="cta-sub reveal" ref={(el) => (refs.current[1] = el)}>
          Message us on WhatsApp and we will have your AI sales assistant live within 24 hours.
        </p>
        <a
          href="https://wa.me/2348103921586?text=Hi%2C%20I%20want%20to%20start%20using%20DraveX"
          className="btn-cta reveal"
          ref={(el) => (refs.current[2] = el)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-whatsapp"></i> Chat on WhatsApp
        </a>
      </div>
    </section>
  );
}

import { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import Auth from "./components/Auth";

function App() {
  const [route, setRoute] = useState(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#/login")) return "login";
    if (hash.startsWith("#/register") || hash.startsWith("#/signup") || hash.startsWith("#/auth")) return "register";
    return "home";
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#/login")) {
        setRoute("login");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (hash.startsWith("#/register") || hash.startsWith("#/signup") || hash.startsWith("#/auth")) {
        setRoute("register");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setRoute("home");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateTo = (mode) => {
    if (mode === "home") {
      window.location.hash = "";
    } else {
      window.location.hash = `#/${mode}`;
    }
  };

  return (
    <>
      {/* Ambient background orbs */}
      <div className="orb-field">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {route === "register" || route === "login" ? (
        <Auth initialMode={route} onBack={() => navigateTo("home")} />
      ) : (
        <>
          <Navbar />
          <Hero />
          <Features />
          <HowItWorks />
          <Pricing />
          <CTA />
          <Footer />
        </>
      )}
    </>
  );
}

export default App;


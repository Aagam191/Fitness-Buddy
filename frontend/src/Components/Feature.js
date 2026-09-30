import React from "react";
import { Link } from "react-router-dom";
import "../style1.css";
import { motion } from "framer-motion";
import { CheckCircleIcon, ZapIcon, ChevronRightIcon } from "./Icons";

const tiers = [
  {
    name: "ELITE",
    badge: "ALL-ACCESS VIP",
    price: "$29",
    period: "/ month",
    subtitle: "Complete elite gym & in-person experience",
    image: "/images/feature1.jpg",
    features: [
      "Unlimited access to all ELITE & PRO gym centers",
      "At-center group classes with master trainers",
      "Personalized 1-on-1 coach assessment",
      "Full digital library & dual-angle biomechanics",
      "Tailored AI diet protocols & macro tracking",
    ],
    isPopular: false,
    color: "#ff3333",
  },
  {
    name: "PRO",
    badge: "MOST POPULAR",
    price: "$19",
    period: "/ month",
    subtitle: "Ideal for committed strength athletes",
    image: "/images/feature2.png",
    features: [
      "Unlimited access to all PRO gym facilities",
      "2 Sessions/month at ELITE gyms & group classes",
      "Full 8-week periodized training programs",
      "Interactive 3D muscle heatmap & recovery tracking",
      "Complete exercise directory with dual-angle videos",
    ],
    isPopular: true,
    color: "#ff0000",
  },
  {
    name: "HOME",
    badge: "STARTER & DIGITAL",
    price: "$9",
    period: "/ month",
    subtitle: "Train anytime, anywhere at your pace",
    image: "/images/feature3.jpg",
    features: [
      "Complete at-home dumbbell & bodyweight workouts",
      "Goal-based HIIT, strength, and mobility sessions",
      "Full access to exercise library & form guides",
      "Standard BMI & calorie energy expenditure calculator",
      "Community support & milestone badges",
    ],
    isPopular: false,
    color: "#ff6666",
  },
];

export default function Feature() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 45 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="membership-tiers" id="features">
      <motion.div
        className="section-header text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span
          className="protocol-badge mb-3"
          style={{
            background: "rgba(255, 0, 0, 0.12)",
            color: "#ff4d4d",
            border: "1px solid rgba(255, 0, 0, 0.35)",
            padding: "0.6rem 1.8rem",
            borderRadius: "9999px",
            fontSize: "1.3rem",
            fontWeight: "800",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <ZapIcon size={14} className="text-danger" /> CHOOSE YOUR TIER
        </span>
        <h2 className="section-main-title">FLEXIBLE MEMBERSHIP PLANS</h2>
        <p className="section-sub-desc">
          Select the training tier that matches your ambitions. Upgrade, downgrade, or cancel anytime.
        </p>
      </motion.div>

      <motion.div
        className="tier-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {tiers.map((tier, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ y: -8 }}
            className={`tier-card ${tier.isPopular ? "tier-popular" : ""}`}
          >
            {tier.badge && (
              <div className={`tier-badge-pill ${tier.isPopular ? "popular" : ""}`}>
                {tier.badge}
              </div>
            )}
            <div className="image-container">
              <img
                src={tier.image}
                alt={`${tier.name} tier workout preview`}
                className="tier-image"
                loading="lazy"
              />
            </div>
            <div className="tier-content">
              <div className="tier-header-info">
                <h3 className="tier-title" style={{ color: tier.color }}>{tier.name}</h3>
                <p className="tier-subtitle-text">{tier.subtitle}</p>
                <div className="tier-price-box">
                  <span className="tier-price-val">{tier.price}</span>
                  <span className="tier-period-val">{tier.period}</span>
                </div>
              </div>

              <div className="tier-divider" />

              <p className="access-text">Includes Everything In:</p>
              <ul className="tier-features-list">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="d-flex align-items-center gap-2">
                    <CheckCircleIcon size={16} className="text-danger flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="button-container">
                <Link to="/signup" className="btn-try">
                  Try For Free
                </Link>
                <Link
                  to="/payment"
                  state={{ tier: tier.name.toLowerCase() }}
                  className="btn-learn d-inline-flex align-items-center justify-content-center gap-1"
                >
                  Upgrade Now <ChevronRightIcon size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
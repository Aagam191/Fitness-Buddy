import React from "react";
import "../style1.css";

const tiers = [
  {
    name: "ELITE",
    image: "/images/feature1.jpg",
    features: [
      "At-center group classes",
      "All ELITE & PRO gyms",
      "At-home live workouts",
    ],
    color: "var(--red)",
  },
  {
    name: "PRO",
    image: "/images/feature2.png",
    features: [
      "All PRO gyms",
      "2 Sessions/month at ELITE gyms & group classes",
      "At-home live workouts",
    ],
    color: "var(--red)",
  },
  {
    name: "HOME",
    image: "/images/feature3.jpg",
    features: [
      "At home workouts",
      "Celebrity Workouts",
      "Goal-based Workouts and Meditation Sessions",
    ],
    color: "var(--red)",
  },
];

export default function Feature() {
  return (
    <section className="membership-tiers">
      <div className="tier-container">
        {tiers.map((tier, index) => (
          <div key={index} className="tier-card">
            <div className="image-container">
              <img
                src={tier.image}
                alt={`${tier.name} workout`}
                className="tier-image"
              />
            </div>
            <div className="tier-content">
              <h2 style={{ color: tier.color }}>{tier.name}</h2>
              <p className="access-text">Unlimited Access To</p>
              <ul>
                {tier.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <div className="button-container">
                <button className="btn-try">TRY FOR FREE</button>
                <button className="btn-learn">LEARN MORE</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
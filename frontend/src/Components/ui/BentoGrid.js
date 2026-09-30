import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export function BentoGrid({ className = '', children }) {
  return (
    <div
      className={`bento-grid-container ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '2rem',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  colSpan = 12,
  title,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = '#ff0000',
  children,
  className = '',
  delay = 0,
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className={`bento-card ${className}`}
      style={{
        gridColumn: `span ${colSpan}`,
        position: 'relative',
        background: '#111111',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '2.8rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Interactive Radial Spotlight Gradient following cursor */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.35s ease',
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 0, 0, 0.12), transparent 70%)`,
        }}
      />

      {/* Top Accent Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.6), transparent)',
          opacity: isHovered ? 1 : 0.3,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Card Header */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          {badge && (
            <span
              style={{
                fontSize: '1.2rem',
                fontWeight: '800',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '0.4rem 1.2rem',
                borderRadius: '20px',
                background: `${badgeColor}18`,
                color: badgeColor,
                border: `1px solid ${badgeColor}40`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {Icon && <Icon size={14} />} {badge}
            </span>
          )}
        </div>

        {title && (
          <h3
            style={{
              fontSize: '2.4rem',
              fontWeight: '900',
              color: '#ffffff',
              marginBottom: '0.8rem',
              letterSpacing: '-0.02rem',
            }}
          >
            {title}
          </h3>
        )}

        {subtitle && (
          <p
            style={{
              fontSize: '1.45rem',
              color: '#cbd5e1',
              lineHeight: '1.6',
              marginBottom: '1.8rem',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Card Body / Visual Content */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto' }}>
        {children}
      </div>
    </motion.div>
  );
}

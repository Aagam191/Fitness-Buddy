import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BentoGrid, BentoCard } from './ui/BentoGrid';
import {
  ActivityIcon,
  ZapIcon,
  FlameIcon,
  CheckCircleIcon,
  DumbbellIcon,
  ScaleIcon,
  ClockIcon,
  ChevronRightIcon,
} from './Icons';

export default function BentoShowcase() {
  const [heatmapMetric, setHeatmapMetric] = useState('recovery'); // 'recovery' | 'volume'
  const [activeTab, setActiveTab] = useState('ppl'); // 'ppl' | 'upperlower' | 'fullbody'

  return (
    <section
      className="bento-showcase-section"
      id="intelligence"
      style={{
        background: '#070707',
        padding: '12rem 9%',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255, 0, 0, 0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(80px)',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="protocol-badge mb-3"
            style={{
              background: 'rgba(255, 0, 0, 0.12)',
              color: '#ff4d4d',
              border: '1px solid rgba(255, 0, 0, 0.35)',
              padding: '0.6rem 1.8rem',
              borderRadius: '9999px',
              fontSize: '1.3rem',
              fontWeight: '800',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <ZapIcon size={14} className="text-danger" /> NEXT-GEN ATHLETE INTELLIGENCE
          </span>
          <h2
            style={{
              fontSize: '4.2rem',
              fontWeight: '900',
              color: '#ffffff',
              letterSpacing: '-0.03rem',
              marginTop: '1rem',
              marginBottom: '1.4rem',
            }}
          >
            Engineered for <span style={{ color: '#ff0000' }}>Peak Human Performance</span>
          </h2>
          <p
            style={{
              fontSize: '1.7rem',
              color: '#94a3b8',
              maxWidth: '720px',
              margin: '0 auto',
              lineHeight: '1.7',
            }}
          >
            Combine real-time physiological recovery tracking, periodized strength protocols, and precision macronutrient partitioning into a unified biomechanical ecosystem.
          </p>
        </motion.div>

        {/* Bento Grid Architecture */}
        <BentoGrid>
          {/* Card 1: 3D Muscle Recovery Heatmap (Span 7) */}
          <BentoCard
            colSpan={7}
            title="Biomechanical Recovery & Volume Heatmap"
            subtitle="Real-time 48–72h supercompensation tracking across 15 anatomical kinematic chains with 1080p audit card export."
            icon={ActivityIcon}
            badge="TELEMETRY ENGINE"
            badgeColor="#ff0000"
            delay={0.1}
          >
            <div
              style={{
                background: '#0d0d0d',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '2rem',
              }}
            >
              {/* Interactive Mode Switcher */}
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHeatmapMetric('recovery')}
                    className={`custom-toggle-pill px-3 py-1 ${heatmapMetric === 'recovery' ? 'active' : ''}`}
                    style={{ fontSize: '1.25rem' }}
                  >
                    <ZapIcon size={12} /> Recovery %
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeatmapMetric('volume')}
                    className={`custom-toggle-pill px-3 py-1 ${heatmapMetric === 'volume' ? 'active' : ''}`}
                    style={{ fontSize: '1.25rem' }}
                  >
                    <FlameIcon size={12} /> Volume (kg)
                  </button>
                </div>
                <span style={{ fontSize: '1.3rem', color: '#00ff88', fontWeight: '800' }}>
                  ⚡ 94% SYSTEM READY
                </span>
              </div>

              {/* Muscle Telemetry Bars */}
              <div className="d-flex flex-column gap-3 mt-3">
                {[
                  { name: 'Pectorals (Chest)', pct: heatmapMetric === 'recovery' ? 92 : 85, val: '5,600 kg', status: 'READY', color: '#00ff88' },
                  { name: 'Quadriceps (Legs)', pct: heatmapMetric === 'recovery' ? 48 : 95, val: '7,200 kg', status: 'FATIGUED', color: '#ff0000' },
                  { name: 'Latissimus Dorsi', pct: heatmapMetric === 'recovery' ? 76 : 60, val: '4,100 kg', status: 'RECOVERING', color: '#f59e0b' },
                  { name: 'Deltoids & Arms', pct: heatmapMetric === 'recovery' ? 96 : 40, val: '2,800 kg', status: 'READY', color: '#00ff88' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="d-flex justify-content-between text-white mb-1" style={{ fontSize: '1.35rem' }}>
                      <span className="fw-bold">{item.name}</span>
                      <span style={{ color: item.color, fontWeight: '800' }}>
                        {heatmapMetric === 'recovery' ? `${item.pct}% • ${item.status}` : item.val}
                      </span>
                    </div>
                    <div
                      style={{
                        background: '#1a1a1a',
                        height: '8px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: idx * 0.15 }}
                        style={{
                          height: '100%',
                          background: item.color,
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                <span className="text-muted" style={{ fontSize: '1.3rem' }}>
                  15 Major Muscle Groups Monitored
                </span>
                <Link to="/heatmap" className="text-danger fw-bold text-decoration-none d-inline-flex align-items-center gap-1" style={{ fontSize: '1.4rem' }}>
                  Launch Heatmap <ChevronRightIcon size={14} />
                </Link>
              </div>
            </div>
          </BentoCard>

          {/* Card 2: Curated 8-Week Periodization (Span 5) */}
          <BentoCard
            colSpan={5}
            title="8-Week Periodized Protocols"
            subtitle="Undulating progressive overload waves with pre-filled workout tracker sets and target RPEs."
            icon={DumbbellIcon}
            badge="PERIODIZATION"
            badgeColor="#ff5e00"
            delay={0.2}
          >
            <div
              style={{
                background: '#0d0d0d',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '2rem',
              }}
            >
              {/* Program Tab Switcher */}
              <div className="d-flex gap-2 mb-3">
                {[
                  { id: 'ppl', label: 'PPL Hypertrophy (6d)' },
                  { id: 'upperlower', label: 'Strength & Power (4d)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`custom-toggle-pill px-3 py-1 ${activeTab === tab.id ? 'active' : ''}`}
                    style={{ fontSize: '1.25rem', flex: 1 }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Phase Progression Timeline */}
              <div className="d-flex flex-column gap-2 mt-3">
                {[
                  { phase: 'Weeks 1–2', name: 'Neuromuscular Adaptation', rpe: 'RPE 7.0', tag: 'FREE PREVIEW' },
                  { phase: 'Weeks 3–4', name: 'Hypertrophic Volume Overload', rpe: 'RPE 8.0', tag: 'PRO' },
                  { phase: 'Weeks 5–6', name: 'Peak Tension & Mechanical Stress', rpe: 'RPE 9.0', tag: 'PRO' },
                  { phase: 'Weeks 7–8', name: 'Deload & Supercompensation', rpe: 'RPE 6.5', tag: 'PRO' },
                ].map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 d-flex justify-content-between align-items-center"
                    style={{
                      background: idx === 0 ? 'rgba(255, 0, 0, 0.08)' : '#141414',
                      border: idx === 0 ? '1px solid rgba(255, 0, 0, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                    }}
                  >
                    <div>
                      <span className="text-danger fw-bold d-block" style={{ fontSize: '1.2rem' }}>{p.phase}</span>
                      <span className="text-white fw-bold" style={{ fontSize: '1.35rem' }}>{p.name}</span>
                    </div>
                    <span
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: '800',
                        padding: '0.2rem 0.8rem',
                        borderRadius: '4px',
                        background: idx === 0 ? '#10b981' : '#333333',
                        color: '#ffffff',
                      }}
                    >
                      {p.tag}
                    </span>
                  </div>
                ))}
              </div>

              <Link to="/programs" className="btn1 w-100 text-center mt-4" style={{ padding: '0.9rem' }}>
                Explore 8-Week Curriculum →
              </Link>
            </div>
          </BentoCard>

          {/* Card 3: Precision AI Caloric & Macro Engine (Span 4) */}
          <BentoCard
            colSpan={4}
            title="Caloric & Macro Partitioning"
            subtitle="Precision BMR/TDEE calculation linked to automated diet protocols."
            icon={ScaleIcon}
            badge="DIET ENGINE"
            badgeColor="#10b981"
            delay={0.3}
          >
            <div
              style={{
                background: '#0d0d0d',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.3rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Daily Energy Baseline
              </div>
              <div style={{ fontSize: '3.6rem', fontWeight: '900', color: '#ff0000', margin: '0.4rem 0' }}>
                2,650 <span style={{ fontSize: '1.6rem', color: '#ffffff' }}>kcal/day</span>
              </div>

              {/* Macro Bar */}
              <div
                style={{
                  display: 'flex',
                  height: '14px',
                  borderRadius: '7px',
                  overflow: 'hidden',
                  margin: '1.5rem 0',
                }}
              >
                <div style={{ width: '40%', background: '#ef4444' }} title="Protein 40%" />
                <div style={{ width: '35%', background: '#3b82f6' }} title="Carbs 35%" />
                <div style={{ width: '25%', background: '#f59e0b' }} title="Fats 25%" />
              </div>

              <div className="d-flex justify-content-between" style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                <span style={{ color: '#ef4444' }}>🥩 Protein 40%</span>
                <span style={{ color: '#3b82f6' }}>🍚 Carbs 35%</span>
                <span style={{ color: '#f59e0b' }}>🥑 Fats 25%</span>
              </div>

              <Link to="/calculate_bmi" className="btn-outline-custom w-100 text-center mt-4" style={{ padding: '0.8rem' }}>
                Calibrate Your Macros
              </Link>
            </div>
          </BentoCard>

          {/* Card 4: Smart Rest Interval & 1RM Estimator (Span 4) */}
          <BentoCard
            colSpan={4}
            title="Rest Timer & 1RM Calculator"
            subtitle="Integrated Brzycki/Epley 1-Rep Max estimations with sound-cued interval clocks."
            icon={ClockIcon}
            badge="WORKOUT ENGINE"
            badgeColor="#3b82f6"
            delay={0.4}
          >
            <div
              style={{
                background: '#0d0d0d',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.3rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Active Interval Timer
              </div>
              <div
                style={{
                  fontSize: '3.6rem',
                  fontFamily: 'monospace',
                  fontWeight: '900',
                  color: '#ffffff',
                  margin: '0.4rem 0',
                }}
              >
                01:30 <span style={{ fontSize: '1.4rem', color: '#ff0000' }}>REST</span>
              </div>

              <div className="d-flex justify-content-center gap-2 my-3">
                {['30s', '1m', '1.5m', '2m', '3m'].map((t, idx) => (
                  <span
                    key={idx}
                    className="custom-toggle-pill px-2 py-1"
                    style={{ fontSize: '1.2rem', background: idx === 2 ? '#ff0000' : '#181818' }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <Link to="/workouts" className="btn-outline-custom w-100 text-center mt-3" style={{ padding: '0.8rem' }}>
                Open Workout Logger
              </Link>
            </div>
          </BentoCard>

          {/* Card 5: Dual-Angle Exercise Directory (Span 4) */}
          <BentoCard
            colSpan={4}
            title="3D Muscle Directory"
            subtitle="Over 500+ biomechanically mapped exercises with dual-angle video form guides."
            icon={CheckCircleIcon}
            badge="EXERCISE VAULT"
            badgeColor="#a855f7"
            delay={0.5}
          >
            <div
              style={{
                background: '#0d0d0d',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.3rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Biomechanical Video Vault
              </div>
              <div style={{ fontSize: '3.6rem', fontWeight: '900', color: '#a855f7', margin: '0.4rem 0' }}>
                500+ <span style={{ fontSize: '1.6rem', color: '#ffffff' }}>Guides</span>
              </div>

              <p style={{ fontSize: '1.35rem', color: '#cbd5e1', margin: '1rem 0' }}>
                Anterior &amp; Posterior execution angles with isolation cues for zero joint impingement.
              </p>

              <Link to="/directory" className="btn1 w-100 text-center mt-3" style={{ padding: '0.8rem' }}>
                Explore 3D Body Map
              </Link>
            </div>
          </BentoCard>
        </BentoGrid>
      </div>
    </section>
  );
}

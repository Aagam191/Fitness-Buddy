import React from 'react';
import { Link } from 'react-router-dom';
import '../style1.css';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ChevronRightIcon, ZapIcon, ActivityIcon, DumbbellIcon, ScaleIcon } from './Icons';

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="about" id="about">
      <div className="about-grid container">
        {/* Left Col: Interactive Image Card with Framer Motion Hover Tilt */}
        <motion.div
          className="about-image-col"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
        >
          <div className="about-image-wrapper">
            <img src="/images/about-img.jpg" alt="MyFit Training and Fitness" className="about-img" />
            <motion.div
              className="about-image-badge"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span className="badge-highlight">100%</span>
              <span className="badge-text">Science-Backed Biomechanics</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Col: About Content & Animated Feature Grid */}
        <motion.div
          className="about-content-col"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <motion.span className="section-eyebrow" variants={itemVariants}>
            <ZapIcon size={14} className="me-2 text-danger" /> ABOUT MYFIT
          </motion.span>

          <motion.h2 className="about-main-title" variants={itemVariants}>
            Every day is a chance to become stronger
          </motion.h2>

          <motion.p className="about-description" variants={itemVariants}>
            MyFit combines biomechanical exercise mapping, tailored nutrition protocols,
            and progressive overload tracking to help athletes and fitness enthusiasts achieve
            sustainable, science-backed results.
          </motion.p>

          <motion.div className="about-feature-grid" variants={containerVariants}>
            <motion.div className="about-feature-card" variants={itemVariants} whileHover={{ y: -4 }}>
              <div className="feature-icon-title">
                <CheckCircleIcon size={18} className="text-danger flex-shrink-0" />
                <h4>Exercise Directory</h4>
              </div>
              <p>Interactive anatomical body map with dual-angle video execution guides.</p>
            </motion.div>

            <motion.div className="about-feature-card" variants={itemVariants} whileHover={{ y: -4 }}>
              <div className="feature-icon-title">
                <ActivityIcon size={18} className="text-danger flex-shrink-0" />
                <h4>AI Diet Protocols</h4>
              </div>
              <p>Tailored caloric partitioning and customized macronutrient schedules.</p>
            </motion.div>

            <motion.div className="about-feature-card" variants={itemVariants} whileHover={{ y: -4 }}>
              <div className="feature-icon-title">
                <ScaleIcon size={18} className="text-danger flex-shrink-0" />
                <h4>Biometric Assessment</h4>
              </div>
              <p>Precise BMR, TDEE, and BMI energy expenditure calculations.</p>
            </motion.div>

            <motion.div className="about-feature-card" variants={itemVariants} whileHover={{ y: -4 }}>
              <div className="feature-icon-title">
                <DumbbellIcon size={18} className="text-danger flex-shrink-0" />
                <h4>Progressive Overload</h4>
              </div>
              <p>Real-time volume load tracking, 1RM estimations, and rest interval timers.</p>
            </motion.div>
          </motion.div>

          <motion.div className="about-cta-wrapper" variants={itemVariants}>
            <Link to="/directory" className="btn1 d-inline-flex align-items-center gap-2">
              Explore Directory <ChevronRightIcon size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

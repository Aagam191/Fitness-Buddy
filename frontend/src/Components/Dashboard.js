import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  DumbbellIcon,
  DnaIcon,
  ZapIcon,
  ActivityIcon,
  CompassIcon,
  ScaleIcon,
  UtensilsIcon,
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  CheckIcon,
  ChevronRightIcon,
} from './Icons';

export default function Dashboard() {
  const { isAuthenticated, user, isPremiumUser } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;
    setLoading(true);

    api
      .get('/app/dashboard/')
      .then((res) => {
        if (isMounted) {
          setStats(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching dashboard stats:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="dashboard-container d-flex align-items-center justify-content-center">
        <div className="auth-box text-center p-5">
          <span className="section-tag mb-2">MYFIT PORTAL</span>
          <h2 className="text-white mt-2 mb-3">Authentication Required</h2>
          <p className="text-muted mb-4 fs-5">
            Please log in to your MyFit account to view your athlete metrics and workout history.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Link to="/login" className="btn1">
              Log In
            </Link>
            <Link to="/signup" className="btn-outline-custom">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const profile = stats?.profile;
  const workoutSummary = stats?.workout_summary || {
    total_workouts: 0,
    total_sets: 0,
    last_30_days_workouts: 0,
  };
  const recentWorkouts = stats?.recent_workouts || [];
  const latestDiet = stats?.latest_diet_plan;

  const getBmiCategory = (bmi) => {
    if (!bmi) return 'Not Calculated';
    const val = parseFloat(bmi);
    if (val < 18.5) return 'Underweight';
    if (val < 25) return 'Normal Weight';
    if (val < 30) return 'Overweight';
    return 'Obese Range';
  };

  return (
    <div className="dashboard-container">
      <div className="container py-5">
        {/* Unclustered Spacious Header matching project theme */}
        <div className="dashboard-hero-card p-5 mb-5">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
            <div>
              <span className="section-tag">ATHLETE PORTAL</span>
              <h1 className="hero-heading">Welcome back, {user?.username}!</h1>
              <p className="hero-subtext">
                Track your fitness journey, progressive overload, and personalized nutrition protocols.
              </p>
            </div>

            <div className="d-flex gap-3 align-items-center flex-wrap">
              <Link to="/programs" className="btn-outline-custom d-inline-flex align-items-center gap-1">
                <DumbbellIcon size={14} /> Curated Programs
              </Link>
              <Link to="/heatmap" className="btn-outline-custom d-inline-flex align-items-center gap-1">
                <DnaIcon size={14} /> Athlete Heatmap
              </Link>
              {!isPremiumUser && (
                <Link to="/payment" className="btn-outline-custom d-inline-flex align-items-center gap-1">
                  <ZapIcon size={14} className="text-danger" /> Upgrade to Premium
                </Link>
              )}
              <Link to="/workouts" className="btn1 d-inline-flex align-items-center gap-1">
                <PlusIcon size={14} /> Log Workout
              </Link>
            </div>
          </div>
        </div>


        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading metrics...</span>
            </div>
            <p className="text-light mt-3 fs-5">Loading your analytics...</p>
          </div>
        ) : (
          <>
            {/* 3 Spacious High-Impact Metric Cards matching Calculate_BMI results style */}
            <div className="row g-4 mb-5">
              {/* BMI Card */}
              <div className="col-12 col-md-4">
                <div className="metric-panel p-4 h-100">
                  <span className="metric-header-label">BODY MASS INDEX</span>
                  <div className="metric-main-value my-2">
                    {profile?.bmi ? parseFloat(profile.bmi).toFixed(1) : '--'}
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="metric-status-pill">
                      {getBmiCategory(profile?.bmi)}
                    </span>
                  </div>
                  <p className="metric-detail-note m-0">
                    {profile?.height ? `${profile.height} cm • ${profile.weight} kg` : (
                      <Link to="/calculate_bmi" className="text-danger text-decoration-none fw-bold">
                        Calculate in BMI Tool →
                      </Link>
                    )}
                  </p>
                </div>
              </div>

              {/* BMR Card */}
              <div className="col-12 col-md-4">
                <div className="metric-panel p-4 h-100">
                  <span className="metric-header-label">DAILY CALORIE BASELINE (BMR)</span>
                  <div className="metric-main-value text-danger my-2">
                    {profile?.bmr ? Math.round(profile.bmr) : '--'}
                    <span className="metric-unit-text ms-2">kcal/day</span>
                  </div>
                  <p className="metric-detail-note m-0 mt-3">
                    Basal metabolic expenditure required at complete rest.
                  </p>
                </div>
              </div>

              {/* Workouts Card */}
              <div className="col-12 col-md-4">
                <div className="metric-panel p-4 h-100">
                  <span className="metric-header-label">TRAINING SESSIONS</span>
                  <div className="metric-main-value my-2">
                    {workoutSummary.total_workouts}
                    <span className="metric-unit-text ms-2">completed</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="metric-status-pill">
                      {workoutSummary.total_sets} Sets Total
                    </span>
                  </div>
                  <p className="metric-detail-note m-0">
                    {workoutSummary.last_30_days_workouts} sessions recorded in last 30 days.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Feature Navigation Row */}
            <div className="feature-links-bar p-3 mb-5 d-flex justify-content-around align-items-center flex-wrap gap-2">
              <Link to="/programs" className="feature-nav-item d-inline-flex align-items-center gap-2">
                <DumbbellIcon size={16} /> Curated 8-Week Programs
              </Link>
              <Link to="/heatmap" className="feature-nav-item d-inline-flex align-items-center gap-2">
                <DnaIcon size={16} /> Athlete Heatmap &amp; Recovery
              </Link>
              <Link to="/workouts" className="feature-nav-item d-inline-flex align-items-center gap-2">
                <ActivityIcon size={16} /> Workout Engine
              </Link>
              <Link to="/directory" className="feature-nav-item d-inline-flex align-items-center gap-2">
                <CompassIcon size={16} /> 3D Muscle Directory
              </Link>
              <Link to="/calculate_bmi" className="feature-nav-item d-inline-flex align-items-center gap-2">
                <ScaleIcon size={16} /> BMI Calculator
              </Link>
              <Link to="/predict" className="feature-nav-item d-inline-flex align-items-center gap-2">
                <UtensilsIcon size={16} /> Diet Engine
              </Link>
            </div>

            {/* Curated Programs & Athlete Heatmap Spotlight Cards */}
            <div className="row g-4 mb-5">
              <div className="col-12 col-md-6">
                <div className="panel-box p-4 h-100 d-flex flex-column justify-content-between" style={{ borderLeft: '4px solid #ff0000' }}>
                  <div>
                    <span className="section-tag mb-2">PERIODIZATION PROTOCOL</span>
                    <h3 className="text-white mt-2 mb-3" style={{ fontSize: '2.4rem', fontWeight: '800' }}>Curated 8-Week Programs</h3>
                    <p className="mb-4" style={{ fontSize: '1.5rem', lineHeight: '1.7', color: '#cbd5e1' }}>
                      Follow structured 8-week undulating periodization splits (Hypertrophy Surge, Athletic Strength, Metabolic Shred) with pre-filled workout tracking.
                    </p>
                  </div>
                  <Link to="/programs" className="btn1 text-center">
                    Explore Curated Protocols →
                  </Link>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="panel-box p-4 h-100 d-flex flex-column justify-content-between" style={{ borderLeft: '4px solid #00ff88' }}>
                  <div>
                    <span className="section-tag mb-2" style={{ color: '#00ff88', background: 'rgba(0,255,136,0.1)' }}>BIOMECHANICAL AUDIT</span>
                    <h3 className="text-white mt-2 mb-3" style={{ fontSize: '2.4rem', fontWeight: '800' }}>Athlete Muscle Heatmap</h3>
                    <p className="mb-4" style={{ fontSize: '1.5rem', lineHeight: '1.7', color: '#cbd5e1' }}>
                      Monitor real-time supercompensation readiness ($0-100\%$) and 7-day tonnage across 15 anatomical zones, exportable as 1080p audit cards.
                    </p>
                  </div>
                  <Link to="/heatmap" className="btn1 text-center" style={{ background: '#1c1c1c', border: '1px solid #333' }}>
                    View Recovery Heatmap →
                  </Link>
                </div>
              </div>
            </div>


            {/* Middle Section: Clean Workouts & Clean Diet Plan */}
            <div className="row g-4">
              {/* Recent Workouts */}
              <div className="col-12 col-lg-7">
                <div className="panel-box p-4 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                    <h3 className="panel-heading m-0">Recent Workouts</h3>
                    <Link to="/workouts" className="text-danger text-decoration-none fw-bold" style={{ fontSize: '1.5rem' }}>
                      Open Engine →
                    </Link>
                  </div>

                  {recentWorkouts.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="mb-4" style={{ fontSize: '1.6rem', color: '#94a3b8' }}>No workouts logged yet.</p>
                      <Link to="/workouts" className="btn1">
                        Record First Workout
                      </Link>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {recentWorkouts.map((w) => (
                        <div key={w.id} className="workout-log-row p-3">
                          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                              <h4 className="workout-log-title text-white mb-2" style={{ fontSize: '1.9rem', fontWeight: '800' }}>{w.title}</h4>
                              <span className="d-inline-flex align-items-center gap-2" style={{ fontSize: '1.45rem', color: '#94a3b8' }}>
                                <CalendarIcon size={16} /> {w.date} • <ClockIcon size={16} /> {w.duration_minutes} minutes
                              </span>
                            </div>
                            <span className="sets-count-badge">
                              {w.sets ? w.sets.length : 0} Sets
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Saved Diet Plan */}
              <div className="col-12 col-lg-5">
                <div className="panel-box p-4 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                    <h3 className="panel-heading m-0">Saved Diet Plan</h3>
                    <Link to="/calculate_bmi" className="text-danger text-decoration-none fw-bold" style={{ fontSize: '1.5rem' }}>
                      Recalculate →
                    </Link>
                  </div>

                  {latestDiet ? (
                    <div>
                      <div className="calorie-target-display p-4 mb-3 text-center">
                        <span className="text-uppercase fw-bold d-block" style={{ fontSize: '1.4rem', color: '#94a3b8', letterSpacing: '1px' }}>
                          Target Daily Calories
                        </span>
                        <div className="fw-bold text-danger mt-2" style={{ fontSize: '3.6rem', lineHeight: '1.1' }}>
                          {Math.round(latestDiet.total_calories)} <span className="text-white" style={{ fontSize: '1.8rem' }}>kcal</span>
                        </div>
                      </div>

                      {latestDiet.plan_data && (
                        <div className="diet-preview-list d-flex flex-column gap-2">
                          {Object.entries(latestDiet.plan_data).slice(0, 4).map(([meal, item]) => (
                            <div key={meal} className="diet-preview-item p-3 px-4 d-flex justify-content-between align-items-center">
                              <span className="text-danger text-capitalize fw-bold" style={{ fontSize: '1.5rem' }}>{meal}</span>
                              <span className="text-white text-end text-truncate ms-2" style={{ maxWidth: '65%', fontSize: '1.45rem' }}>
                                {String(item)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <p className="mb-4" style={{ fontSize: '1.6rem', color: '#94a3b8' }}>No saved diet recommendation.</p>
                      <Link to="/calculate_bmi" className="btn-outline-custom">
                        Calculate Diet Protocol
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .dashboard-container {
          background-color: var(--black, #000000);
          color: var(--white, #ffffff);
          min-height: 100vh;
          padding-top: 85px;
          padding-bottom: 70px;
          font-family: 'Nunito', sans-serif;
        }

        .dashboard-hero-card {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-left: 5px solid var(--red, #f00);
          border-radius: 8px;
        }

        .section-tag {
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--red, #f00);
          text-transform: uppercase;
        }

        .hero-heading {
          font-size: 3.8rem;
          font-weight: 900;
          color: var(--white, #ffffff);
          margin-top: 0.5rem;
          letter-spacing: 0.5px;
        }

        .hero-subtext {
          font-size: 1.6rem;
          color: var(--light-white, #aaaaaa);
          margin: 0;
          max-width: 650px;
          line-height: 1.6;
        }

        .metric-panel,
        .panel-box,
        .auth-box {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .metric-panel {
          border-top: 3px solid var(--red, #f00);
          transition: transform 0.2s ease;
        }

        .metric-panel:hover {
          transform: translateY(-3px);
        }

        .metric-header-label {
          font-size: 1.3rem;
          font-weight: 700;
          color: #888888;
          letter-spacing: 1px;
        }

        .metric-main-value {
          font-size: 4rem;
          font-weight: 900;
          line-height: 1.1;
          color: #ffffff;
        }

        .metric-unit-text {
          font-size: 1.6rem;
          font-weight: 600;
          color: #888888;
        }

        .metric-status-pill {
          background: rgba(255, 0, 0, 0.15);
          color: var(--red, #f00);
          border: 1px solid rgba(255, 0, 0, 0.3);
          border-radius: 4px;
          padding: 0.3rem 0.8rem;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .metric-detail-note {
          font-size: 1.4rem;
          color: #888888;
        }

        .feature-links-bar {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
        }

        .feature-nav-item {
          color: #ffffff !important;
          text-decoration: none !important;
          font-size: 1.5rem;
          font-weight: 700;
          padding: 0.8rem 1.6rem;
          border-radius: 6px;
          background: #181818;
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.2s ease;
        }

        .feature-nav-item:hover {
          background: var(--red, #f00);
          color: #ffffff !important;
        }

        .panel-heading {
          font-size: 2.2rem;
          font-weight: 800;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .workout-log-row {
          background: #181818;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-left: 4px solid var(--red, #f00);
          border-radius: 6px;
        }

        .workout-log-title {
          font-size: 1.8rem;
          font-weight: 700;
        }

        .sets-count-badge {
          background: rgba(255, 0, 0, 0.15);
          color: var(--red, #f00);
          border: 1px solid rgba(255, 0, 0, 0.3);
          padding: 0.3rem 1rem;
          border-radius: 4px;
          font-size: 1.3rem;
          font-weight: 700;
        }

        .calorie-target-display {
          background: rgba(255, 0, 0, 0.08);
          border: 1px solid rgba(255, 0, 0, 0.2);
          border-radius: 6px;
        }

        .diet-preview-item {
          background: #181818;
          border-radius: 4px;
        }

        .btn1 {
          display: inline-block;
          padding: 1.1rem 3rem;
          background: linear-gradient(130deg, var(--red, #f00) 93%, transparent 90%);
          color: var(--white, #ffffff) !important;
          font-size: 1.6rem;
          font-weight: 800;
          text-decoration: none !important;
          cursor: pointer;
          border: none;
        }

        .btn1:hover {
          transform: scale(1.05);
        }

        .btn-outline-custom {
          display: inline-block;
          padding: 0.9rem 2.4rem;
          background: transparent;
          color: var(--white, #ffffff) !important;
          border: 2px solid var(--red, #f00);
          font-size: 1.5rem;
          font-weight: 700;
          text-decoration: none !important;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .btn-outline-custom:hover {
          background: var(--red, #f00);
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  ZapIcon,
  LockIcon,
  UnlockIcon,
  ClockIcon,
  PlayIcon,
  VideoIcon,
  XIcon,
  CheckIcon,
  SparklesIcon,
} from './Icons';

export default function TrainingPrograms() {
  const { isAuthenticated, isPremiumUser, user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();

  const [programs, setPrograms] = useState([]);
  const [activeEnrollment, setActiveEnrollment] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [videoModalExercise, setVideoModalExercise] = useState(null);

  // Fetch catalog & active enrollment
  const loadData = async () => {
    try {
      setLoading(true);
      const [programsRes, activeRes] = await Promise.all([
        api.get('/app/programs/'),
        isAuthenticated ? api.get('/app/programs/active/').catch(() => ({ data: null })) : Promise.resolve({ data: null }),
      ]);
      setPrograms(programsRes.data || []);
      setActiveEnrollment(activeRes.data || null);
    } catch (err) {
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  // Open program detail modal / drawer
  const handleOpenProgram = async (slug) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/app/programs/${slug}/`);
      setSelectedProgram(res.data);
      setSelectedWeek(1);
    } catch (err) {
      console.error('Error loading program detail:', err);
      showError('Failed to load program details.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Enroll in program
  const handleEnroll = async (slug) => {
    if (!isAuthenticated) {
      showInfo('Please log in to enroll in curated programs.');
      navigate('/login');
      return;
    }

    try {
      await api.post(`/app/programs/${slug}/enroll/`);
      showSuccess('Enrolled in program! Your 8-week journey begins now.');
      loadData();
      if (selectedProgram && selectedProgram.slug === slug) {
        handleOpenProgram(slug);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to enroll in program.';
      showError(errorMsg);
      if (errorMsg.includes('Premium')) {
        navigate('/payment');
      }
    }
  };

  // Send day exercises directly into WorkoutLogger.js
  const handleStartWorkout = (day, weekNumber) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const setsToLog = (day.exercises || []).map((ex, idx) => ({
      exercise_name: ex.exercise_name,
      set_number: idx + 1,
      reps: parseInt(ex.target_reps) || 10,
      weight_kg: 0,
      target_sets: ex.target_sets,
      target_rpe: ex.target_rpe,
      cue: ex.coaching_cue,
    }));

    navigate('/workouts', {
      state: {
        fromProgram: true,
        programDayId: day.id,
        workoutTitle: `${selectedProgram?.title || 'Program'} - W${weekNumber}D${day.day_number}: ${day.title}`,
        duration: day.estimated_duration_min || 45,
        prefilledSets: setsToLog,
      },
    });
  };

  return (
    <div className="programs-container">
      <div className="container py-5">
        {/* Hero Banner */}
        <div className="programs-hero-card p-5 mb-5">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
            <div>
              <span className="section-tag mb-2">MYFIT PRO PROTOCOLS</span>
              <h1 className="hero-heading">Curated 8-Week Training Programs</h1>
              <p className="hero-subtext">
                Scientifically periodized training splits engineered for progressive overload, hypertrophy, and athletic power.
              </p>
            </div>
            <div className="d-flex gap-3 align-items-center flex-wrap">
              {!isPremiumUser && (
                <Link to="/payment" className="btn-outline-custom d-inline-flex align-items-center gap-1">
                  <ZapIcon size={14} className="text-danger" /> Unlock All 8-Week Protocols
                </Link>
              )}
              <Link to="/workouts" className="btn1">
                Workout Tracker
              </Link>
            </div>
          </div>
        </div>

        {/* Active Enrollment Card (if enrolled) */}
        {activeEnrollment && (
          <div className="active-enrollment-card p-4 mb-5">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <span className="badge-active-pill">CURRENT ACTIVE PROTOCOL</span>
                <h3 className="text-white mt-2 mb-1">{activeEnrollment.program?.title}</h3>
                <p className="text-muted mb-0">
                  Week {activeEnrollment.current_week} of {activeEnrollment.program?.duration_weeks} • {activeEnrollment.completed_count} of {activeEnrollment.total_days} Sessions Completed ({activeEnrollment.progress_pct}%)
                </p>
              </div>

              <div className="d-flex gap-3 align-items-center">
                <button
                  className="btn1"
                  onClick={() => handleOpenProgram(activeEnrollment.program?.slug)}
                >
                  View Active Schedule
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="program-progress-track mt-4">
              <div
                className="program-progress-fill"
                style={{ width: `${activeEnrollment.progress_pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Programs Grid */}
        <div className="row g-4">
          {programs.map((prog) => (
            <div key={prog.slug} className="col-lg-4 col-md-6">
              <div className="program-card h-100 d-flex flex-column justify-content-between">
                <div>
                  <div
                    className="program-card-header p-4"
                    style={{ background: prog.banner_gradient }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge-goal">{prog.goal}</span>
                      {prog.is_premium && (
                        <span className={`badge-tier ${prog.is_unlocked ? 'unlocked' : 'locked'} d-inline-flex align-items-center gap-1`}>
                          {prog.is_unlocked ? (
                            <>
                              <CheckIcon size={12} /> UNLOCKED
                            </>
                          ) : (
                            <>
                              <LockIcon size={12} /> PRO ONLY
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white mb-1">{prog.title}</h3>
                    <p className="text-muted-light small mb-0">{prog.subtitle}</p>
                  </div>

                  <div className="p-4">
                    <p className="program-desc mb-4">{prog.description}</p>
                    <div className="program-meta-grid">
                      <div className="meta-box">
                        <span className="meta-label">FREQUENCY</span>
                        <span className="meta-val">{prog.days_per_week} Days / Wk</span>
                      </div>
                      <div className="meta-box">
                        <span className="meta-label">DURATION</span>
                        <span className="meta-val">{prog.duration_weeks} Weeks</span>
                      </div>
                      <div className="meta-box">
                        <span className="meta-label">LEVEL</span>
                        <span className="meta-val">{prog.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    className="btn1 w-100 mb-2"
                    onClick={() => handleOpenProgram(prog.slug)}
                  >
                    View Curriculum & Schedule
                  </button>
                  {(!activeEnrollment || activeEnrollment.program?.slug !== prog.slug) && (
                    <button
                      className="btn-outline-custom w-100"
                      onClick={() => handleEnroll(prog.slug)}
                    >
                      Enroll in this Program
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Program Detailed Drawer / Modal */}
        {selectedProgram && (
          <div className="program-modal-backdrop" onClick={() => setSelectedProgram(null)}>
            <div className="program-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-banner p-4 d-flex justify-content-between align-items-center">
                <div>
                  <span className="section-tag">{selectedProgram.goal}</span>
                  <h2 className="text-white mt-1 mb-0">{selectedProgram.title}</h2>
                  <p className="text-muted mb-0 small">8-Week Undulating Periodization Architecture</p>
                </div>
                <button
                  className="btn-close-modal"
                  onClick={() => setSelectedProgram(null)}
                >
                  <XIcon size={16} />
                </button>
              </div>

              {/* Week Navigation Tabs */}
              <div className="week-tabs-container px-4 pt-3">
                <div className="week-tabs-scroll d-flex gap-2">
                  {(selectedProgram.weeks || []).map((week) => (
                    <button
                      key={week.week_number}
                      className={`week-tab-btn ${selectedWeek === week.week_number ? 'active' : ''} ${week.is_locked ? 'locked' : ''} d-inline-flex align-items-center gap-1`}
                      onClick={() => setSelectedWeek(week.week_number)}
                    >
                      Week {week.week_number}
                      {week.is_locked && <LockIcon size={12} className="ms-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Week Detail */}
              {(() => {
                const currentWeekData = (selectedProgram.weeks || []).find(
                  (w) => w.week_number === selectedWeek
                );

                if (!currentWeekData) return null;

                if (currentWeekData.is_locked) {
                  return (
                    <div className="locked-week-banner text-center p-5 m-4">
                      <div className="lock-icon mb-3 text-warning">
                        <LockIcon size={36} />
                      </div>
                      <h3 className="text-white mb-2">Week {selectedWeek} is Locked</h3>
                      <p className="text-muted mb-4 fs-5" style={{ maxWidth: 500, margin: '0 auto' }}>
                        Weeks 2 through 8 are part of the full 8-week periodized protocol reserved for MyFit Premium members.
                      </p>
                      <Link to="/payment" className="btn1 d-inline-flex align-items-center gap-2">
                        <ZapIcon size={16} /> Upgrade to Unlock Complete 8-Week Protocol
                      </Link>
                    </div>
                  );
                }

                return (
                  <div className="p-4">
                    {/* Phase Focus Card */}
                    <div className="phase-focus-card p-3 mb-4">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                          <span className="phase-title-tag">{currentWeekData.phase_title}</span>
                          <p className="text-muted mb-0 small mt-1">{currentWeekData.focus_summary}</p>
                        </div>
                        <span className="badge-rpe">{currentWeekData.target_rpe}</span>
                      </div>
                    </div>

                    {/* Days List */}
                    <div className="days-list d-flex flex-column gap-3">
                      {(currentWeekData.days || []).map((day) => (
                        <div key={day.id} className="day-card p-4">
                          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                            <div>
                              <span className="day-number-badge">Day {day.day_number}</span>
                              <h4 className="text-white d-inline-block ms-2 mb-0">{day.title}</h4>
                            </div>
                            <div className="d-flex gap-2 align-items-center">
                              <span className="duration-pill d-inline-flex align-items-center gap-1">
                                <ClockIcon size={12} /> {day.estimated_duration_min} min
                              </span>
                              {!day.is_rest_day && (
                                <button
                                  className="btn-start-session d-inline-flex align-items-center gap-1"
                                  onClick={() => handleStartWorkout(day, selectedWeek)}
                                >
                                  <PlayIcon size={12} /> Load into Workout Tracker
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="warmup-text mb-3">
                            <strong className="text-danger">Warm-up:</strong> {day.warmup_notes}
                          </p>

                          {day.is_rest_day ? (
                            <div className="rest-day-banner p-3 text-center">
                              <span className="text-success d-inline-flex align-items-center gap-2">
                                <SparklesIcon size={16} /> Active Recovery &amp; Muscular Supercompensation
                              </span>
                              <p className="text-muted small mb-0 mt-1">Focus on 8 hours of sleep, 3L hydration, and mobility drills.</p>
                            </div>
                          ) : (
                            <div className="table-responsive">
                              <table className="table table-dark table-hover exercise-table mb-0">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Exercise</th>
                                    <th>Target Sets</th>
                                    <th>Target Reps</th>
                                    <th>Target RPE</th>
                                    <th>Rest</th>
                                    <th>Coaching Cue</th>
                                    <th>Demo</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(day.exercises || []).map((ex) => (
                                    <tr key={ex.id}>
                                      <td>{ex.order}</td>
                                      <td className="fw-bold text-white">{ex.exercise_name}</td>
                                      <td><span className="badge-sets">{ex.target_sets} sets</span></td>
                                      <td>{ex.target_reps}</td>
                                      <td><span className="badge-rpe-sm">@{ex.target_rpe}</span></td>
                                      <td>{ex.rest_seconds}s</td>
                                      <td className="small text-muted">{ex.coaching_cue || 'Controlled tempo'}</td>
                                      <td>
                                        {ex.video_front ? (
                                          <button
                                            className="btn-video-preview d-inline-flex align-items-center gap-1"
                                            onClick={() => setVideoModalExercise(ex)}
                                            title="View Exercise Video"
                                          >
                                            <VideoIcon size={12} /> Demo
                                          </button>
                                        ) : (
                                          <span className="text-muted">-</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Video Demo Modal */}
        {videoModalExercise && (
          <div className="video-modal-backdrop" onClick={() => setVideoModalExercise(null)}>
            <div className="video-modal-box p-4" onClick={(e) => e.stopPropagation()}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-white mb-0">{videoModalExercise.exercise_name}</h4>
                <button className="btn-close-modal" onClick={() => setVideoModalExercise(null)}>
                  <XIcon size={16} />
                </button>
              </div>
              <div className="video-wrapper">
                <video
                  src={videoModalExercise.video_front}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-100 rounded"
                  style={{ maxHeight: '450px', background: '#000' }}
                />
              </div>
              {videoModalExercise.coaching_cue && (
                <div className="cue-box mt-3 p-3 rounded" style={{ background: '#1c1c1c' }}>
                  <span className="text-danger fw-bold small">COACHING CUE:</span>
                  <p className="text-white mb-0 small mt-1">{videoModalExercise.coaching_cue}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scoped CSS matching project's dark red/charcoal theme */}
      <style>{`
        .programs-container {
          background-color: #000000;
          min-height: 100vh;
          padding-top: 80px;
          padding-bottom: 80px;
          color: #ffffff;
        }

        .programs-hero-card {
          background: #111111;
          border: 1px solid #222222;
          border-left: 4px solid #ff0000;
          border-radius: 12px;
        }

        .section-tag {
          display: inline-block;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #ff3333;
          background: rgba(255, 0, 0, 0.12);
          border: 1px solid rgba(255, 0, 0, 0.35);
          padding: 0.6rem 1.6rem;
          border-radius: 9999px;
          text-transform: uppercase;
        }

        .hero-heading {
          font-size: 3.2rem;
          font-weight: 900;
          color: #ffffff;
          margin-top: 12px;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }

        .hero-subtext {
          font-size: 1.55rem;
          color: #cbd5e1;
          max-width: 700px;
          line-height: 1.6;
          margin-bottom: 0;
        }

        .btn1 {
          background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
          color: #ffffff !important;
          font-weight: 700;
          font-size: 1.5rem;
          padding: 1.2rem 2.6rem;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.25s ease;
          box-shadow: 0 4px 15px rgba(255, 0, 0, 0.35);
        }

        .btn1:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(255, 0, 0, 0.55);
        }

        .btn-outline-custom {
          background: transparent;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.25);
          font-weight: 700;
          font-size: 1.45rem;
          padding: 1.1rem 2.4rem;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-outline-custom:hover {
          border-color: #ff0000;
          color: #ff0000 !important;
          background: rgba(255, 0, 0, 0.08);
        }

        .active-enrollment-card {
          background: #141414;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
        }

        .badge-active-pill {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 0.5rem 1.2rem;
          border-radius: 9999px;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .program-progress-track {
          background: #222222;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
        }

        .program-progress-fill {
          background: linear-gradient(90deg, #ff0000, #ff4444);
          height: 100%;
          border-radius: 4px;
          transition: width 0.4s ease;
        }

        .program-card {
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .program-card:hover {
          border-color: #ff0000;
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(255, 0, 0, 0.2);
        }

        .badge-goal {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-size: 1.25rem;
          font-weight: 700;
          padding: 0.5rem 1.2rem;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .badge-tier {
          font-size: 1.2rem;
          font-weight: 800;
          padding: 0.5rem 1.2rem;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }

        .badge-tier.locked {
          background: rgba(255, 0, 0, 0.18);
          color: #ff4d4d;
          border: 1px solid rgba(255, 0, 0, 0.4);
        }

        .badge-tier.unlocked {
          background: rgba(16, 185, 129, 0.18);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }

        .text-muted-light {
          color: #cbd5e1;
          font-size: 1.35rem;
        }

        .program-desc {
          color: #cbd5e1;
          font-size: 1.45rem;
          line-height: 1.6;
        }

        .program-meta-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          background: #0e0e0e;
          padding: 1.4rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .meta-box {
          text-align: center;
        }

        .meta-label {
          display: block;
          font-size: 1.15rem;
          color: #ff4d4d;
          font-weight: 800;
          margin-bottom: 4px;
          letter-spacing: 0.8px;
        }

        .meta-val {
          display: block;
          font-size: 1.45rem;
          color: #ffffff;
          font-weight: 800;
        }

        /* Modal Styles */
        .program-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .program-modal-box {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          max-width: 1050px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header-banner {
          background: #141414;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .btn-close-modal {
          background: #222222;
          border: none;
          color: #ffffff;
          font-size: 1.6rem;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }

        .btn-close-modal:hover {
          background: #ff0000;
        }

        .week-tabs-scroll {
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .week-tab-btn {
          background: #1c1c1c;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          padding: 1rem 1.8rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1.35rem;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .week-tab-btn.active {
          background: #ff0000;
          color: #ffffff;
          border-color: #ff0000;
          box-shadow: 0 4px 12px rgba(255, 0, 0, 0.4);
        }

        .phase-focus-card {
          background: #161616;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
        }

        .phase-title-tag {
          font-size: 1.45rem;
          font-weight: 800;
          color: #ffffff;
        }

        .badge-rpe {
          background: #282828;
          color: #ff4d4d;
          font-weight: 700;
          font-size: 1.25rem;
          padding: 0.5rem 1.2rem;
          border-radius: 6px;
        }

        .day-card {
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
        }

        .day-number-badge {
          background: #ff0000;
          color: #ffffff;
          font-size: 1.25rem;
          font-weight: 800;
          padding: 0.4rem 1rem;
          border-radius: 6px;
        }

        .duration-pill {
          background: #222222;
          color: #cbd5e1;
          font-size: 1.25rem;
          padding: 0.4rem 1rem;
          border-radius: 6px;
        }

        .btn-start-session {
          background: #ff0000;
          border: none;
          color: #ffffff;
          font-weight: 700;
          font-size: 1.35rem;
          padding: 0.8rem 1.8rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-start-session:hover {
          background: #cc0000;
          transform: translateY(-1px);
        }

        .warmup-text {
          font-size: 1.35rem;
          color: #cbd5e1;
        }

        .exercise-table th {
          background: #1b1b1b;
          color: #cbd5e1;
          font-size: 1.25rem;
          text-transform: uppercase;
          border-color: rgba(255, 255, 255, 0.08);
          font-weight: 700;
          padding: 1rem;
        }

        .exercise-table td {
          border-color: rgba(255, 255, 255, 0.06);
          vertical-align: middle;
          font-size: 1.4rem;
          color: #ffffff;
          padding: 1rem;
        }

        .badge-sets {
          background: #222222;
          color: #ffffff;
          padding: 0.4rem 1rem;
          border-radius: 6px;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .badge-rpe-sm {
          background: rgba(255, 0, 0, 0.15);
          color: #ff4444;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .btn-video-preview {
          background: #242424;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-size: 1.25rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-video-preview:hover {
          border-color: #ff0000;
          color: #ff0000;
        }

        .video-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .video-modal-box {
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          max-width: 650px;
          width: 100%;
        }

        .locked-week-banner {
          background: #141414;
          border: 1px dashed rgba(255, 255, 255, 0.2);
          border-radius: 12px;
        }

        .lock-icon {
          font-size: 2.5rem;
          display: block;
        }
      `}</style>
    </div>
  );
}

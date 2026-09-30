import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  ClockIcon,
  FlameIcon,
  PlusIcon,
  MinusIcon,
  RepeatIcon,
  CalendarIcon,
  TrashIcon,
  ZapIcon,
  CheckIcon,
  PlayIcon,
  PauseIcon,
  XIcon,
} from './Icons';

const POPULAR_EXERCISES = [
  'Barbell Bench Press',
  'Incline Dumbbell Press',
  'Barbell Back Squat',
  'Romanian Deadlift',
  'Barbell Conventional Deadlift',
  'Barbell Bent Over Row',
  'Overhead Shoulder Press',
  'Dumbbell Lateral Raise',
  'Lat Pulldown',
  'Pull-ups',
  'Bicep Barbell Curl',
  'Dumbbell Hammer Curl',
  'Triceps Rope Pushdown',
  'Incline Skull Crushers',
  'Leg Press',
  'Leg Extensions',
  'Standing Calf Raises',
  'Hanging Leg Raises',
];

export default function WorkoutLogger() {
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(45);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sets, setSets] = useState([
    { exercise_name: 'Barbell Bench Press', set_number: 1, reps: 10, weight_kg: 60, completed: false },
    { exercise_name: 'Barbell Bench Press', set_number: 2, reps: 8, weight_kg: 70, completed: false },
  ]);

  const [activeTab, setActiveTab] = useState('log'); // 'log' | 'history'
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);

  // Rest Timer State
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerAlert, setTimerAlert] = useState(false);
  const timerRef = useRef(null);

  const fetchWorkouts = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/app/workouts/');
      setWorkouts(res.data || []);
    } catch (err) {
      console.error('Error fetching workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();

  useEffect(() => {
    fetchWorkouts();
  }, [isAuthenticated]);

  useEffect(() => {
    if (location.state?.fromProgram) {
      if (location.state.workoutTitle) setTitle(location.state.workoutTitle);
      if (location.state.duration) setDuration(location.state.duration);
      if (location.state.prefilledSets && location.state.prefilledSets.length > 0) {
        setSets(
          location.state.prefilledSets.map((s, idx) => ({
            exercise_name: s.exercise_name,
            set_number: idx + 1,
            reps: s.reps || 10,
            weight_kg: s.weight_kg || 0,
            completed: false,
          }))
        );
      }
      showInfo('Loaded exercises from curated training program!');
    }
  }, [location.state]);

  // Rest Timer Countdown Interval
  useEffect(() => {
    if (isTimerRunning && timerRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            setTimerAlert(true);
            setTimeout(() => setTimerAlert(false), 5000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timerRemaining]);

  const startRestTimer = (seconds = timerSeconds) => {
    setTimerSeconds(seconds);
    setTimerRemaining(seconds);
    setIsTimerRunning(true);
    setTimerAlert(false);
  };

  const pauseRestTimer = () => {
    setIsTimerRunning(false);
  };

  const resetRestTimer = () => {
    setIsTimerRunning(false);
    setTimerRemaining(0);
    setTimerAlert(false);
  };

  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        exercise_name: lastSet ? lastSet.exercise_name : '',
        set_number: sets.length + 1,
        reps: lastSet ? lastSet.reps : 10,
        weight_kg: lastSet ? lastSet.weight_kg : 0,
        completed: false,
      },
    ]);
  };

  const handleDuplicateLastSet = () => {
    const lastSet = sets[sets.length - 1];
    if (!lastSet) return handleAddSet();
    setSets([
      ...sets,
      {
        exercise_name: lastSet.exercise_name,
        set_number: sets.length + 1,
        reps: lastSet.reps,
        weight_kg: lastSet.weight_kg,
        completed: false,
      },
    ]);
  };

  const handleRemoveSet = (index) => {
    if (sets.length <= 1) return;
    const updated = sets.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      set_number: idx + 1,
    }));
    setSets(updated);
  };

  const handleSetChange = (index, field, value) => {
    const updated = [...sets];
    updated[index][field] = value;
    setSets(updated);
  };

  const handleToggleSetComplete = (index) => {
    const updated = [...sets];
    const isNowComplete = !updated[index].completed;
    updated[index].completed = isNowComplete;
    setSets(updated);

    if (isNowComplete) {
      showSuccess(`Set ${updated[index].set_number} logged! Rest timer started.`);
      startRestTimer(timerSeconds);
    }
  };

  const handleRepeatWorkout = (workout) => {
    setTitle(`${workout.title} (Repeat)`);
    setDuration(workout.duration_minutes || 45);
    if (workout.sets && workout.sets.length > 0) {
      setSets(
        workout.sets.map((s, idx) => ({
          exercise_name: s.exercise_name,
          set_number: idx + 1,
          reps: s.reps || 10,
          weight_kg: s.weight_kg || 0,
          completed: false,
        }))
      );
    }
    setActiveTab('log');
    showInfo(`Loaded exercises from "${workout.title}" into active session.`);
  };

  // Live Metrics
  const totalVolumeKg = sets.reduce((sum, s) => {
    const r = parseInt(s.reps, 10) || 0;
    const w = parseFloat(s.weight_kg) || 0;
    return sum + (r * w);
  }, 0);

  const completedSetsCount = sets.filter((s) => s.completed).length;

  // Brzycki 1RM Estimator: Weight * (36 / (37 - Reps)) or Epley: Weight * (1 + Reps/30)
  const calculate1RM = (weight, reps) => {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps, 10) || 0;
    if (w <= 0 || r <= 0) return 0;
    if (r === 1) return w;
    return Math.round(w * (1 + r / 30));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showError('Please enter a workout title (e.g. Chest & Triceps Push)');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title,
        duration_minutes: parseInt(duration, 10) || 45,
        notes,
        date,
        sets: sets.map((s) => ({
          exercise_name: s.exercise_name.trim() || 'Exercise',
          set_number: s.set_number,
          reps: parseInt(s.reps, 10) || 1,
          weight_kg: parseFloat(s.weight_kg) || 0,
        })),
      };

      await api.post('/app/workouts/', payload);

      if (location.state?.programDayId) {
        try {
          await api.post('/app/programs/complete-day/', { day_id: location.state.programDayId });
        } catch (progErr) {
          console.log('Error advancing program day:', progErr);
        }
      }

      showSuccess('Workout session saved successfully!');
      setTitle('');
      setNotes('');
      setSets([{ exercise_name: '', set_number: 1, reps: 10, weight_kg: 0, completed: false }]);
      setActiveTab('history');
      fetchWorkouts();

    } catch (err) {
      console.error('Error saving workout:', err);
      showError('Failed to save workout. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout log?')) return;
    try {
      await api.delete(`/app/workouts/${id}/`);
      showInfo('Workout log deleted');
      setWorkouts(workouts.filter((w) => w.id !== id));
    } catch (err) {
      console.error('Error deleting workout:', err);
      showError('Failed to delete workout');
    }
  };

  const filteredWorkouts = workouts.filter((w) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const titleMatch = w.title?.toLowerCase().includes(q);
    const exerciseMatch = w.sets?.some((s) => s.exercise_name?.toLowerCase().includes(q));
    return titleMatch || exerciseMatch;
  });

  if (!isAuthenticated) {
    return (
      <div className="workout-logger-container d-flex align-items-center justify-content-center">
        <div className="auth-box text-center p-5">
          <span className="section-tag mb-2">MYFIT ENGINE</span>
          <h2 className="text-white mt-2 mb-3">Authentication Required</h2>
          <p className="text-muted mb-4 fs-5">
            Please log in to your MyFit account to log training sessions and track progressive overload.
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

  return (
    <div className="workout-logger-container">
      <div className="container py-5">
        {/* Header Ribbon with Live Tabs */}
        <div className="workout-hero-card p-4 p-md-5 mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
            <div>
              <span className="section-tag">TRAINING TRACKER</span>
              <h1 className="hero-heading">Workout Engine</h1>
              <p className="hero-subtext">
                Record progressive overload, track lifting volume in real-time, and manage gym rest intervals.
              </p>
            </div>

            <div className="tab-pill-bar">
              <button
                type="button"
                className={`tab-pill-btn ${activeTab === 'log' ? 'active' : ''}`}
                onClick={() => setActiveTab('log')}
              >
                + Record Session
              </button>
              <button
                type="button"
                className={`tab-pill-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                Lifting History ({workouts.length})
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Live Logging Interface */}
        {activeTab === 'log' && (
          <div className="workout-form-panel p-4 p-md-5">
            {/* Live Metrics & Rest Timer Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25 flex-wrap gap-3">
              <div>
                <h2 className="form-section-title m-0">Active Workout Session</h2>
                <span className="text-muted small">
                  Completed: <strong className="text-white">{completedSetsCount}</strong> of <strong className="text-white">{sets.length}</strong> sets
                </span>
              </div>

              {/* Session Metrics Bar */}
              <div className="d-flex gap-2 align-items-center flex-wrap">
                <div className="live-stat-badge">
                  <span className="text-muted me-2">SESSION VOLUME:</span>
                  <span className="text-danger fw-bold fs-5">{totalVolumeKg.toLocaleString()} kg</span>
                </div>
              </div>
            </div>

            {/* Built-in Interactive Gym Rest Timer Widget */}
            <div className={`rest-timer-bar p-3 mb-4 rounded ${timerAlert ? 'timer-alert-pulse' : ''}`}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                  <ClockIcon size={24} className="text-danger" />
                  <div>
                    <span className="text-muted small fw-bold d-block" style={{ letterSpacing: '1px' }}>
                      GYM REST TIMER {timerAlert && <span className="badge bg-danger ms-2"><FlameIcon size={12} className="me-1" /> REST OVER — NEXT SET!</span>}
                    </span>
                    <span className="text-white fw-bold" style={{ fontSize: '2.4rem', fontFamily: 'monospace' }}>
                      {timerRemaining > 0
                        ? `${Math.floor(timerRemaining / 60)}:${(timerRemaining % 60).toString().padStart(2, '0')}`
                        : `${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}`}
                    </span>
                  </div>
                </div>

                {/* Quick Interval Preset Buttons */}
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  {[30, 60, 90, 120, 180].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      className={`custom-toggle-pill px-3 py-1 ${timerSeconds === sec ? 'active' : ''}`}
                      style={{ fontSize: '1.35rem' }}
                      onClick={() => startRestTimer(sec)}
                    >
                      {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                    </button>
                  ))}

                  {isTimerRunning ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-warning fw-bold px-3 py-2 d-inline-flex align-items-center gap-1"
                      style={{ fontSize: '1.3rem' }}
                      onClick={pauseRestTimer}
                    >
                      <PauseIcon size={14} /> Pause
                    </button>
                  ) : timerRemaining > 0 ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-success fw-bold px-3 py-2 d-inline-flex align-items-center gap-1"
                      style={{ fontSize: '1.3rem' }}
                      onClick={() => setIsTimerRunning(true)}
                    >
                      <PlayIcon size={14} /> Resume
                    </button>
                  ) : null}

                  {timerRemaining > 0 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger px-2 py-2 d-inline-flex align-items-center"
                      style={{ fontSize: '1.2rem' }}
                      onClick={resetRestTimer}
                      title="Reset Timer"
                    >
                      <XIcon size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Session Overview Inputs */}
              <div className="row g-4 mb-4">
                <div className="col-12 col-md-6">
                  <label className="field-label mb-2">Session Title / Focus</label>
                  <input
                    type="text"
                    className="custom-field-input"
                    placeholder="e.g. Chest & Triceps Push"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <label className="field-label mb-2">Duration (Minutes)</label>
                  <input
                    type="number"
                    className="custom-field-input"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="5"
                    max="300"
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <label className="field-label mb-2">Session Date</label>
                  <input
                    type="date"
                    className="custom-field-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Suggestions datalist */}
              <datalist id="exercise-suggestions">
                {POPULAR_EXERCISES.map((ex) => (
                  <option key={ex} value={ex} />
                ))}
              </datalist>

              {/* Sets Section */}
              <div className="sets-container mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h3 className="sets-heading m-0">Exercise Sets ({sets.length})</h3>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn-outline-custom"
                      onClick={handleDuplicateLastSet}
                    >
                      + Duplicate Set
                    </button>
                    <button
                      type="button"
                      className="btn-add-set"
                      onClick={handleAddSet}
                    >
                      + Add Set
                    </button>
                  </div>
                </div>

                {/* Clean, spacious set rows */}
                <div className="d-flex flex-column gap-3">
                  {sets.map((set, idx) => {
                    const est1RM = calculate1RM(set.weight_kg, set.reps);
                    return (
                      <div
                        key={idx}
                        className={`set-card-row p-3 rounded ${set.completed ? 'set-completed' : ''}`}
                      >
                        <div className="row g-3 align-items-center">
                          {/* Set Number & Checkmark */}
                          <div className="col-12 col-md-2 d-flex align-items-center gap-2">
                            <button
                              type="button"
                              className={`set-check-btn ${set.completed ? 'completed' : ''}`}
                              onClick={() => handleToggleSetComplete(idx)}
                              title={set.completed ? 'Completed' : 'Mark set completed'}
                            >
                              {set.completed ? '✓' : '○'}
                            </button>
                            <span className="set-number-badge">SET #{set.set_number}</span>
                          </div>

                          {/* Exercise Name Input */}
                          <div className="col-12 col-md-4">
                            <label className="text-muted small mb-1 d-md-none">Exercise</label>
                            <input
                              type="text"
                              list="exercise-suggestions"
                              className="custom-field-input"
                              placeholder="Exercise Name (e.g. Barbell Bench Press)"
                              value={set.exercise_name}
                              onChange={(e) =>
                                handleSetChange(idx, 'exercise_name', e.target.value)
                              }
                              required
                            />
                          </div>

                          {/* Reps Input with Steppers */}
                          <div className="col-6 col-md-2">
                            <label className="text-muted small mb-1 d-md-none">Reps</label>
                            <div className="stepper-control-group">
                              <button
                                type="button"
                                className="stepper-btn"
                                onClick={() => handleSetChange(idx, 'reps', Math.max(1, (parseInt(set.reps, 10) || 1) - 1))}
                                aria-label="Decrease Reps"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                className="stepper-input"
                                placeholder="Reps"
                                value={set.reps}
                                onChange={(e) =>
                                  handleSetChange(idx, 'reps', e.target.value)
                                }
                                min="1"
                                required
                              />
                              <button
                                type="button"
                                className="stepper-btn"
                                onClick={() => handleSetChange(idx, 'reps', (parseInt(set.reps, 10) || 0) + 1)}
                                aria-label="Increase Reps"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Weight (kg) Input with 1RM pill */}
                          <div className="col-6 col-md-3">
                            <label className="text-muted small mb-1 d-md-none">Weight (kg)</label>
                            <div className="stepper-control-group">
                              <button
                                type="button"
                                className="stepper-btn"
                                onClick={() => handleSetChange(idx, 'weight_kg', Math.max(0, (parseFloat(set.weight_kg) || 0) - 2.5))}
                                aria-label="Decrease Weight"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                step="0.5"
                                className="stepper-input"
                                placeholder="Weight (kg)"
                                value={set.weight_kg}
                                onChange={(e) =>
                                  handleSetChange(idx, 'weight_kg', e.target.value)
                                }
                                min="0"
                              />
                              <button
                                type="button"
                                className="stepper-btn"
                                onClick={() => handleSetChange(idx, 'weight_kg', (parseFloat(set.weight_kg) || 0) + 2.5)}
                                aria-label="Increase Weight"
                              >
                                +
                              </button>
                            </div>
                            {est1RM > 0 && (
                              <span className="text-muted small d-block mt-1 text-center" style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                                Est. 1RM: <strong className="text-danger">{est1RM} kg</strong>
                              </span>
                            )}
                          </div>

                          {/* Remove Action */}
                          <div className="col-12 col-md-1 text-center">
                            <button
                              type="button"
                              className="remove-set-action-btn"
                              onClick={() => handleRemoveSet(idx)}
                              disabled={sets.length <= 1}
                              title="Remove set"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-5">
                <label className="field-label mb-2">Session Notes (Optional)</label>
                <textarea
                  className="custom-field-input"
                  rows="3"
                  placeholder="Notes on fatigue, energy, or technique adjustments..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <span className="text-muted fs-6">
                  {sets.length} sets planned • {totalVolumeKg.toLocaleString()} kg total volume
                </span>
                <button
                  type="submit"
                  className="btn1"
                  disabled={submitting}
                >
                  {submitting ? 'Saving Session...' : 'Save Workout Session'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Workout History with Expandable Cards */}
        {activeTab === 'history' && (
          <div className="workout-history-panel">
            {/* Search Bar */}
            <div className="search-filter-card p-3 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
              <input
                type="text"
                className="custom-field-input flex-grow-1"
                style={{ maxWidth: '450px' }}
                placeholder="Search workouts or exercise name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="text-muted fs-6">
                Showing {filteredWorkouts.length} of {workouts.length} recorded workouts
              </span>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Loading logs...</span>
                </div>
                <p className="text-light mt-3 fs-5">Loading your workout logs...</p>
              </div>
            ) : filteredWorkouts.length === 0 ? (
              <div className="empty-history-panel text-center p-5">
                <h3 className="text-white mb-2">No workouts recorded</h3>
                <p className="text-muted fs-5 mb-4">
                  {searchTerm
                    ? `No logged sessions matched "${searchTerm}".`
                    : 'Start tracking your workouts to monitor progressive overload.'}
                </p>
                <button
                  className="btn1"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveTab('log');
                  }}
                >
                  Record Your First Workout
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {filteredWorkouts.map((w) => {
                  const sessionVolume = (w.sets || []).reduce(
                    (acc, s) => acc + (s.reps || 0) * (s.weight_kg || 0),
                    0
                  );
                  const isExpanded = expandedWorkoutId === w.id;

                  return (
                    <div key={w.id} className="col-12 col-lg-6">
                      <div className="history-session-card p-4 h-100 d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h3 className="history-card-title text-white mb-1">{w.title}</h3>
                              <span className="text-muted fs-6 d-inline-flex align-items-center gap-2">
                                <CalendarIcon size={14} /> {w.date} • <ClockIcon size={14} /> {w.duration_minutes} minutes
                              </span>
                            </div>
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                                style={{ fontSize: '1.2rem', fontWeight: '700' }}
                                onClick={() => handleRepeatWorkout(w)}
                                title="Repeat this workout"
                              >
                                <RepeatIcon size={12} /> Repeat
                              </button>
                              <button
                                type="button"
                                className="delete-workout-btn"
                                onClick={() => handleDeleteWorkout(w.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="d-flex gap-2 flex-wrap mb-3">
                            <span className="volume-pill d-inline-flex align-items-center gap-1">
                              <ZapIcon size={12} className="text-danger" /> {sessionVolume.toLocaleString()} kg Volume
                            </span>
                            <span className="sets-pill">
                              {w.sets ? w.sets.length : 0} Sets Logged
                            </span>
                          </div>

                          {w.notes && (
                            <p className="text-muted small fst-italic mb-3">
                              "{w.notes}"
                            </p>
                          )}

                          {/* Sets Accordion */}
                          <div className="history-sets-box p-3">
                            <ul className="list-unstyled mb-0">
                              {(isExpanded ? w.sets : (w.sets || []).slice(0, 4)).map((s, idx) => {
                                const est1RM = calculate1RM(s.weight_kg, s.reps);
                                return (
                                  <li
                                    key={s.id || idx}
                                    className="d-flex justify-content-between align-items-center text-white fs-6 py-2 border-bottom border-secondary border-opacity-25"
                                  >
                                    <span className="text-truncate me-2">
                                      <span className="text-danger fw-bold me-2">
                                        #{s.set_number || idx + 1}
                                      </span>
                                      {s.exercise_name}
                                    </span>
                                    <span className="text-muted fw-semibold" style={{ whiteSpace: 'nowrap' }}>
                                      {s.reps} reps @ {s.weight_kg} kg {est1RM > 0 && <small className="text-danger ms-1">({est1RM} 1RM)</small>}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>

                            {w.sets && w.sets.length > 4 && (
                              <div className="text-center mt-2">
                                <button
                                  type="button"
                                  className="btn btn-link btn-sm text-danger text-decoration-none p-0"
                                  style={{ fontSize: '1.25rem', fontWeight: '700' }}
                                  onClick={() => setExpandedWorkoutId(isExpanded ? null : w.id)}
                                >
                                  {isExpanded ? '▲ Show Less' : `▼ Show All ${w.sets.length} Sets`}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .workout-logger-container {
          background-color: var(--black, #000000);
          color: var(--white, #ffffff);
          min-height: 100vh;
          padding-top: 85px;
          padding-bottom: 70px;
          font-family: 'Nunito', sans-serif;
        }

        .workout-hero-card {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-left: 5px solid var(--red, #f00);
          border-radius: 12px;
        }

        .section-tag {
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--red, #f00);
          text-transform: uppercase;
        }

        .hero-heading {
          font-size: 3.6rem;
          font-weight: 900;
          color: var(--white, #ffffff);
          margin-top: 0.5rem;
          letter-spacing: 0.5px;
        }

        .hero-subtext {
          font-size: 1.55rem;
          color: var(--light-white, #aaaaaa);
          margin: 0;
          max-width: 650px;
          line-height: 1.6;
        }

        .tab-pill-bar {
          background: #181818;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 4px;
          display: flex;
          gap: 4px;
        }

        .tab-pill-btn {
          background: transparent;
          color: #aaaaaa;
          border: none;
          font-weight: 700;
          padding: 0.8rem 1.8rem;
          border-radius: 6px;
          font-size: 1.4rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-pill-btn.active {
          background: var(--red, #f00);
          color: #ffffff;
        }

        .tab-pill-btn:hover:not(.active) {
          color: #ffffff;
        }

        .workout-form-panel,
        .history-session-card,
        .search-filter-card,
        .empty-history-panel,
        .auth-box {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .form-section-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #ffffff;
          text-transform: uppercase;
        }

        .live-stat-badge {
          background: #181818;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.6rem 1.4rem;
          border-radius: 8px;
        }

        .rest-timer-bar {
          background: #161616;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-left: 4px solid #ff0000;
          transition: all 0.3s ease;
        }

        .timer-alert-pulse {
          animation: pulseRed 1s infinite alternate;
          border-color: #ff0000 !important;
        }

        @keyframes pulseRed {
          0% { box-shadow: 0 0 10px rgba(255,0,0,0.4); background-color: #1a1111; }
          100% { box-shadow: 0 0 25px rgba(255,0,0,0.85); background-color: #2a1111; }
        }

        .field-label {
          font-size: 1.4rem;
          font-weight: 700;
          color: #ffffff;
          display: block;
        }

        .custom-field-input {
          width: 100%;
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          padding: 1.2rem 1.6rem;
          border-radius: 8px;
          font-size: 1.5rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .custom-field-input:focus {
          border-color: var(--red, #f00);
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.25);
        }

        .stepper-control-group {
          display: flex;
          align-items: stretch;
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          overflow: hidden;
          height: 48px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .stepper-control-group:focus-within {
          border-color: var(--red, #f00);
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.25);
        }

        .stepper-btn {
          background: #252525;
          color: #ffffff;
          border: none;
          width: 38px;
          min-width: 38px;
          font-size: 1.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
          padding: 0;
        }

        .stepper-btn:hover {
          background: var(--red, #f00);
          color: #ffffff;
        }

        .stepper-btn:active {
          transform: scale(0.94);
        }

        .stepper-input {
          flex: 1;
          min-width: 0;
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 1.6rem;
          font-weight: 700;
          text-align: center;
          outline: none;
          padding: 0 0.4rem;
        }

        .stepper-input::-webkit-inner-spin-button,
        .stepper-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .stepper-input[type=number] {
          -moz-appearance: textfield;
        }

        .sets-heading {
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffffff;
          text-transform: uppercase;
        }

        .btn-add-set {
          background: var(--red, #f00);
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
          padding: 0.9rem 2rem;
          font-size: 1.4rem;
          transition: all 0.2s ease;
        }

        .btn-add-set:hover {
          background: #cc0000;
          transform: translateY(-1px);
        }

        .set-card-row {
          background: #181818;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-left: 4px solid var(--red, #f00);
          transition: all 0.2s ease;
        }

        .set-card-row.set-completed {
          background: rgba(16, 185, 129, 0.05);
          border-left-color: #10b981;
        }

        .set-check-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.4);
          background: transparent;
          color: #ffffff;
          font-size: 1.4rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .set-check-btn.completed {
          background: #10b981;
          border-color: #10b981;
          color: #ffffff;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
        }

        .set-number-badge {
          color: var(--red, #f00);
          font-weight: 900;
          font-size: 1.35rem;
          letter-spacing: 1px;
        }

        .remove-set-action-btn {
          background: transparent;
          border: none;
          color: #666666;
          font-size: 1.8rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .remove-set-action-btn:hover:not(:disabled) {
          color: var(--red, #f00);
        }

        .history-session-card {
          border-left: 4px solid var(--red, #f00);
        }

        .history-card-title {
          font-size: 2rem;
          font-weight: 800;
        }

        .delete-workout-btn {
          background: transparent;
          border: 1px solid rgba(255, 0, 0, 0.5);
          color: var(--red, #f00);
          padding: 0.4rem 1rem;
          border-radius: 4px;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .delete-workout-btn:hover {
          background: var(--red, #f00);
          color: #ffffff;
        }

        .volume-pill {
          background: rgba(255, 0, 0, 0.15);
          color: var(--red, #f00);
          border: 1px solid rgba(255, 0, 0, 0.3);
          font-size: 1.2rem;
          font-weight: 700;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
        }

        .sets-pill {
          background: #181818;
          color: #cccccc;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 1.2rem;
          font-weight: 600;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
        }

        .history-sets-box {
          background: #141414;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .btn1 {
          display: inline-block;
          padding: 1.2rem 3rem;
          background: linear-gradient(135deg, var(--red, #f00) 0%, #cc0000 100%);
          color: var(--white, #ffffff) !important;
          font-size: 1.6rem;
          font-weight: 800;
          text-decoration: none !important;
          cursor: pointer;
          border: none;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(255, 0, 0, 0.35);
          transition: transform 0.2s ease, box-shadow 0.25s ease;
        }

        .btn1:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(255, 0, 0, 0.55);
        }

        .btn-outline-custom {
          display: inline-block;
          padding: 0.9rem 2.2rem;
          background: transparent;
          color: var(--white, #ffffff) !important;
          border: 2px solid var(--red, #f00);
          font-size: 1.5rem;
          font-weight: 700;
          text-decoration: none !important;
          border-radius: 6px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .btn-outline-custom:hover {
          background: var(--red, #f00);
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}

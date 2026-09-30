import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { MUSCLE_DISPLAY_NAMES } from './BodyVectors';
import {
  SaveIcon,
  PrintIcon,
  CheckIcon,
  ZapIcon,
  FlameIcon,
  DnaIcon,
  ActivityIcon,
  InfoIcon,
} from './Icons';

const DEFAULT_SAMPLE_DATA = {
  username: 'Demo Athlete',
  is_premium: false,
  overall_readiness_score: 86,
  total_volume_7d_kg: 18450.0,
  assessment_date: new Date().toISOString().split('T')[0],
  coaching_note: 'Demo Mode: Pectorals and Triceps are experiencing acute fatigue from recent training. Quads, Hamstrings, and Lats are primed for progressive overload today.',
  muscles: {
    chest: { name: 'Chest', recovery_pct: 42, status: 'FATIGUED', volume_7d_kg: 5600, sets_7d: 12, last_trained_hours: 14 },
    shoulders: { name: 'Shoulders', recovery_pct: 68, status: 'RECOVERING', volume_7d_kg: 2400, sets_7d: 8, last_trained_hours: 28 },
    biceps: { name: 'Biceps', recovery_pct: 88, status: 'READY', volume_7d_kg: 1800, sets_7d: 6, last_trained_hours: 52 },
    triceps: { name: 'Triceps', recovery_pct: 45, status: 'FATIGUED', volume_7d_kg: 3200, sets_7d: 10, last_trained_hours: 14 },
    forearms: { name: 'Forearms', recovery_pct: 95, status: 'READY', volume_7d_kg: 800, sets_7d: 4, last_trained_hours: 68 },
    abs: { name: 'Abs', recovery_pct: 90, status: 'READY', volume_7d_kg: 400, sets_7d: 4, last_trained_hours: 72 },
    obliques: { name: 'Obliques', recovery_pct: 100, status: 'READY', volume_7d_kg: 0, sets_7d: 0, last_trained_hours: null },
    quads: { name: 'Quads', recovery_pct: 92, status: 'READY', volume_7d_kg: 7200, sets_7d: 14, last_trained_hours: 70 },
    hamstrings: { name: 'Hamstrings', recovery_pct: 94, status: 'READY', volume_7d_kg: 4800, sets_7d: 10, last_trained_hours: 72 },
    glutes: { name: 'Glutes', recovery_pct: 91, status: 'READY', volume_7d_kg: 3600, sets_7d: 8, last_trained_hours: 70 },
    calves: { name: 'Calves', recovery_pct: 100, status: 'READY', volume_7d_kg: 1200, sets_7d: 5, last_trained_hours: 80 },
    lats: { name: 'Lats', recovery_pct: 90, status: 'READY', volume_7d_kg: 5200, sets_7d: 12, last_trained_hours: 65 },
    lowerback: { name: 'Lower Back', recovery_pct: 85, status: 'READY', volume_7d_kg: 3400, sets_7d: 6, last_trained_hours: 65 },
    traps: { name: 'Traps', recovery_pct: 95, status: 'READY', volume_7d_kg: 1500, sets_7d: 4, last_trained_hours: 70 },
    traps_middle: { name: 'Middle Traps', recovery_pct: 92, status: 'READY', volume_7d_kg: 2100, sets_7d: 6, last_trained_hours: 65 },
  }
};

export default function AthleteHeatmap() {
  const { isAuthenticated, isPremiumUser, user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();

  const [heatmapData, setHeatmapData] = useState(DEFAULT_SAMPLE_DATA);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('recovery'); // 'recovery' | 'volume'
  const [hoveredMuscle, setHoveredMuscle] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const frontSvgRef = useRef(null);
  const backSvgRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setHeatmapData(DEFAULT_SAMPLE_DATA);
      return;
    }
    setLoading(true);
    api
      .get('/app/athlete-heatmap/')
      .then((res) => {
        setHeatmapData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching athlete heatmap:', err);
        setHeatmapData(DEFAULT_SAMPLE_DATA);
        setLoading(false);
      });
  }, [isAuthenticated]);


  const muscles = heatmapData?.muscles || {};
  const readiness = heatmapData?.overall_readiness_score ?? 100;
  const totalVolume = heatmapData?.total_volume_7d_kg ?? 0;
  const assessmentDate = heatmapData?.assessment_date || new Date().toISOString().split('T')[0];

  // Determine fill color for each muscle group based on active view mode
  const getMuscleColor = (muscleKey) => {
    // Normalize aliases
    const key = muscleKey === 'abdominals' ? 'abs' : (muscleKey === 'traps_middle' ? 'traps_middle' : muscleKey);
    const data = muscles[key];
    if (!data) return '#1a1a1a';

    if (viewMode === 'recovery') {
      const rec = data.recovery_pct ?? 100;
      if (rec >= 80) return '#00ff88'; // Ready (Emerald)
      if (rec >= 50) return '#f59e0b'; // Recovering (Amber)
      return '#ff0000'; // Fatigued (Crimson)
    } else {
      const vol = data.volume_7d_kg || 0;
      if (vol === 0) return '#1a1a1a';
      if (vol < 2000) return '#852222';
      if (vol < 5000) return '#c42626';
      if (vol < 10000) return '#ff1a1a';
      return '#ff4d4d';
    }
  };

  // Export 1080p High-Res Athlete Report Card (PNG)
  const handleDownloadReport = async () => {
    if (!isPremiumUser) {
      showInfo('High-res downloadable athlete audit cards require MyFit Premium.');
      navigate('/payment');
      return;
    }

    try {
      setGeneratingReport(true);
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      // 1. Charcoal Texture Background
      ctx.fillStyle = '#0c0c0c';
      ctx.fillRect(0, 0, 1920, 1080);

      // Subtle red gradient ambient accent
      const radGrad = ctx.createRadialGradient(960, 540, 50, 960, 540, 900);
      radGrad.addColorStop(0, 'rgba(255, 0, 0, 0.04)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, 1920, 1080);

      // Border accents
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, 1860, 1020);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(30, 30);
      ctx.lineTo(250, 30);
      ctx.stroke();

      // 2. Header
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 20px "Nunito", sans-serif';
      ctx.fillText('MYFIT ATHLETE PERFORMANCE INTELLIGENCE', 70, 90);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 48px "Nunito", sans-serif';
      ctx.fillText('BIOMECHANICAL RECOVERY & VOLUME AUDIT', 70, 150);

      ctx.fillStyle = '#888888';
      ctx.font = '22px "Nunito", sans-serif';
      ctx.fillText(`Athlete: ${user?.username?.toUpperCase()}  •  Assessment Date: ${assessmentDate}  •  Status: ${isPremiumUser ? 'PRO ATHLETE' : 'FREE TIER'}`, 70, 190);

      // 3. KPI Stat Cards
      // Readiness Card
      ctx.fillStyle = '#141414';
      ctx.fillRect(70, 240, 340, 140);
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 1;
      ctx.strokeRect(70, 240, 340, 140);
      ctx.fillStyle = '#aaaaaa';
      ctx.font = 'bold 16px "Nunito", sans-serif';
      ctx.fillText('OVERALL READINESS INDEX', 95, 280);
      ctx.fillStyle = readiness >= 80 ? '#00ff88' : (readiness >= 50 ? '#f59e0b' : '#ff0000');
      ctx.font = '800 48px "Nunito", sans-serif';
      ctx.fillText(`${readiness} / 100`, 95, 345);

      // Volume Card
      ctx.fillStyle = '#141414';
      ctx.fillRect(440, 240, 340, 140);
      ctx.strokeRect(440, 240, 340, 140);
      ctx.fillStyle = '#aaaaaa';
      ctx.font = 'bold 16px "Nunito", sans-serif';
      ctx.fillText('7-DAY TONNAGE LOAD', 465, 280);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 48px "Nunito", sans-serif';
      ctx.fillText(`${totalVolume.toLocaleString()} kg`, 465, 345);

      // 4. Recommendation Box
      ctx.fillStyle = '#141414';
      ctx.fillRect(70, 410, 710, 120);
      ctx.strokeStyle = '#2a2a2a';
      ctx.strokeRect(70, 410, 710, 120);
      ctx.fillStyle = '#ff4d4d';
      ctx.font = 'bold 16px "Nunito", sans-serif';
      ctx.fillText('PHYSIOLOGICAL TAKEAWAY:', 95, 445);
      ctx.fillStyle = '#dddddd';
      ctx.font = '18px "Nunito", sans-serif';
      const note = heatmapData?.coaching_note || 'Musculoskeletal system balanced and ready for progressive overload.';
      ctx.fillText(note.length > 75 ? note.substring(0, 75) + '...' : note, 95, 485);

      // 5. Muscle Summary Table on Left
      ctx.fillStyle = '#111111';
      ctx.fillRect(70, 560, 710, 440);
      ctx.strokeStyle = '#222222';
      ctx.strokeRect(70, 560, 710, 440);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Nunito", sans-serif';
      ctx.fillText('ANATOMICAL STATUS BREAKDOWN', 95, 600);

      ctx.fillStyle = '#888888';
      ctx.font = 'bold 15px "Nunito", sans-serif';
      ctx.fillText('MUSCLE GROUP', 95, 640);
      ctx.fillText('RECOVERY', 350, 640);
      ctx.fillText('7D VOLUME', 490, 640);
      ctx.fillText('STATUS', 650, 640);

      const tableMuscles = ['chest', 'quads', 'lats', 'shoulders', 'hamstrings', 'biceps', 'triceps', 'abs'];
      tableMuscles.forEach((mKey, idx) => {
        const y = 675 + (idx * 40);
        const m = muscles[mKey] || { recovery_pct: 100, volume_7d_kg: 0, status: 'READY' };
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Nunito", sans-serif';
        ctx.fillText(mKey.toUpperCase(), 95, y);

        ctx.fillStyle = m.recovery_pct >= 80 ? '#00ff88' : (m.recovery_pct >= 50 ? '#f59e0b' : '#ff0000');
        ctx.fillText(`${m.recovery_pct}%`, 350, y);

        ctx.fillStyle = '#cccccc';
        ctx.fillText(`${Math.round(m.volume_7d_kg).toLocaleString()} kg`, 490, y);

        ctx.fillStyle = m.status === 'READY' ? '#00ff88' : (m.status === 'RECOVERING' ? '#f59e0b' : '#ff0000');
        ctx.font = 'bold 14px "Nunito", sans-serif';
        ctx.fillText(m.status, 650, y);
      });

      // 6. Draw Anterior & Posterior SVG Body Maps
      const drawSvgToCanvas = (svgElement, targetX, targetY, targetW, targetH) => {
        return new Promise((resolve) => {
          if (!svgElement) return resolve();
          const svgString = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, targetX, targetY, targetW, targetH);
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = url;
        });
      };

      // Titles for diagrams
      ctx.fillStyle = '#aaaaaa';
      ctx.font = 'bold 22px "Nunito", sans-serif';
      ctx.fillText('ANTERIOR (FRONT)', 1000, 200);
      ctx.fillText('POSTERIOR (BACK)', 1480, 200);

      await drawSvgToCanvas(frontSvgRef.current, 860, 220, 480, 780);
      await drawSvgToCanvas(backSvgRef.current, 1340, 220, 480, 780);

      // Watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = 'bold 16px "Nunito", sans-serif';
      ctx.fillText('VERIFIED ATHLETE AUDIT  •  MYFIT PERFORMANCE PROTOCOL', 720, 1040);

      // Trigger Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.download = `MyFit_Athlete_Heatmap_${user?.username}_${assessmentDate}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        showSuccess('High-resolution athlete heatmap report card downloaded!');
        setGeneratingReport(false);
      }, 'image/png');
    } catch (err) {
      console.error('Error generating report:', err);
      showError('Failed to generate report card.');
      setGeneratingReport(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <div className="card p-5" style={{ background: '#111', color: '#fff', border: '1px solid #333', maxWidth: '600px', margin: '40px auto', borderRadius: '12px' }}>
          <h2 className="mb-3 text-white">Authentication Required</h2>
          <p className="text-secondary mb-4">Please log in to view your athlete muscle heatmap and biomechanical recovery status.</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/login" className="btn1">Log In</Link>
            <Link to="/signup" className="btn-outline-custom">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="heatmap-container">
      <div className="container py-5">
        {/* Hero Header */}
        <div className="heatmap-hero-card p-5 mb-5">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
            <div>
              <span className="section-tag mb-2">BIOMECHANICAL INTELLIGENCE</span>
              <h1 className="hero-heading">Athlete Muscle Heatmap & Recovery</h1>
              <p className="hero-subtext">
                Real-time biological recovery scores ($0-100\%$) and 7-day volume density across all 15 major anatomical kinematic chains.
              </p>
            </div>
            <div className="d-flex gap-3 align-items-center flex-wrap">
              <button
                className="btn1 d-inline-flex align-items-center gap-2"
                onClick={handleDownloadReport}
                disabled={generatingReport}
              >
                <SaveIcon size={16} />
                {generatingReport ? 'Generating Report...' : 'Download Report (1080p PNG)'}
              </button>
              <button
                className="btn-outline-custom d-inline-flex align-items-center gap-2"
                onClick={() => window.print()}
              >
                <PrintIcon size={16} /> Print / PDF
              </button>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & KPI Ribbon */}
        <div className="row g-4 mb-5">
          <div className="col-lg-4 col-md-6">
            <div className="kpi-card p-4">
              <span className="kpi-label">BIOMECHANICAL READINESS</span>
              <div className="d-flex align-items-baseline gap-3 mt-2">
                <span className={`kpi-score-val ${readiness >= 80 ? 'text-success' : readiness >= 50 ? 'text-warning' : 'text-danger'}`}>
                  {readiness}%
                </span>
                <span className="kpi-badge d-inline-flex align-items-center gap-1">
                  {readiness >= 80 ? (
                    <>
                      <CheckIcon size={12} className="text-success" /> PRIMED TO TRAIN
                    </>
                  ) : readiness >= 50 ? (
                    <>
                      <ZapIcon size={12} className="text-warning" /> ACTIVE RECOVERY
                    </>
                  ) : (
                    <>
                      <InfoIcon size={12} className="text-danger" /> ACUTE FATIGUE
                    </>
                  )}
                </span>
              </div>
              <p className="kpi-subtext mt-2 mb-0">Systemic supercompensation score calculated across 15 anatomical zones.</p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="kpi-card p-4">
              <span className="kpi-label">7-DAY TONNAGE ACCUMULATION</span>
              <div className="d-flex align-items-baseline gap-3 mt-2">
                <span className="kpi-score-val text-white">{totalVolume.toLocaleString()}</span>
                <span className="fs-5 text-muted">kg lifted</span>
              </div>
              <p className="kpi-subtext mt-2 mb-0">Total mechanical load ($reps \times weight$) logged in workout sessions.</p>
            </div>
          </div>

          <div className="col-lg-4 col-md-12">
            <div className="kpi-card p-4 d-flex flex-column justify-content-between">
              <div>
                <span className="kpi-label">DISPLAY HEATMAP MODE</span>
                <div className="view-mode-pill-group mt-3 d-flex gap-2">
                  <button
                    className={`mode-pill ${viewMode === 'recovery' ? 'active' : ''} d-inline-flex align-items-center justify-content-center gap-1`}
                    onClick={() => setViewMode('recovery')}
                  >
                    <ZapIcon size={14} /> Recovery %
                  </button>
                  <button
                    className={`mode-pill ${viewMode === 'volume' ? 'active' : ''} d-inline-flex align-items-center justify-content-center gap-1`}
                    onClick={() => setViewMode('volume')}
                  >
                    <FlameIcon size={14} /> Volume Load (kg)
                  </button>
                </div>
              </div>

              {/* Legend Indicator */}
              <div className="heatmap-legend mt-3 pt-3 border-top border-secondary">
                {viewMode === 'recovery' ? (
                  <div className="d-flex justify-content-between small text-muted">
                    <span><span className="legend-dot bg-success" /> 80-100% Ready</span>
                    <span><span className="legend-dot bg-warning" /> 50-79% Rebuilding</span>
                    <span><span className="legend-dot bg-danger" /> &lt;50% Fatigued</span>
                  </div>
                ) : (
                  <div className="d-flex justify-content-between small text-muted">
                    <span><span className="legend-dot" style={{ background: '#1c1c1c' }} /> 0 kg</span>
                    <span><span className="legend-dot" style={{ background: '#852222' }} /> 2k kg</span>
                    <span><span className="legend-dot" style={{ background: '#ff1a1a' }} /> 6k+ kg</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dual Anatomical Body Maps */}
        <div className="heatmap-viewport-card p-5 mb-5">
          <div className="text-center mb-4">
            <span className="section-tag mb-1">INTERACTIVE KINEMATIC MODEL</span>
            <h2 className="text-white">Hover over any muscle group for biometric inspection</h2>
          </div>

          <div className="row justify-content-center g-5">
            {/* Front / Anterior Map */}
            <div className="col-lg-5 col-md-6 text-center">
              <h4 className="body-view-title mb-4">ANTERIOR (FRONT VIEW)</h4>
              <div className="svg-wrapper">
                <svg
                  ref={frontSvgRef}
                  width="100%"
                  height="650"
                  viewBox="0 0 672 1200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="body-vector-svg"
                >
                  {/* Chest */}
                  <g
                    className="muscle-path"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMuscle('chest')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path
                      d="M277.532 219.782C277.578 219.768 277.624 219.754 277.67 219.74H277.66L277.85 219.68C282.69 218.25 291.6 215.63 307.32 217.12C334.48 219.71 334.79 236.91 334.79 237.64V287.27C334.79 297.21 331.34 306.75 325.08 314.13C318.19 322.23 309.8 328.48 300.15 332.7C300.141 332.703 300.129 332.708 300.115 332.713C300.082 332.727 300.036 332.746 299.98 332.76C298.18 333.44 296.71 334.01 295.37 334.57C295.35 334.58 295.32 334.6 295.32 334.6H295.29C288.29 337.01 281.02 338.18 273.77 338.18C255.58 338.18 237.53 330.82 224.21 317.22C224.14 317.16 224.08 317.1 224.03 317.03L223.98 316.98C223.932 316.928 223.885 316.876 223.838 316.825C223.679 316.653 223.527 316.488 223.38 316.31C223.32 316.23 223.26 316.18 223.21 316.14C223.16 316.11 223.12 316.08 223.09 316.05C222.13 315.02 221.16 313.92 220.2 312.75C213.51 304.62 205.11 295.9 190.2 295.44C190 295.43 189.83 295.28 189.79 295.08C189.75 294.88 189.86 294.68 190.05 294.6C192.28 293.66 194.23 292.63 195.85 291.53C209.29 282.42 219.75 270.14 224.78 264.23C229.196 259.042 232.486 254.704 235.386 250.879L235.59 250.61L236 250.06L236.02 250.034C242.629 241.268 246.991 235.483 257.72 228.68C264.15 224.59 271.91 221.64 275.96 220.25C276 220.23 276.05 220.22 276.11 220.2L276.69 220.02C276.75 219.99 276.79 219.97 276.85 219.97C276.869 219.964 276.887 219.958 276.906 219.954C276.917 219.951 276.929 219.95 276.94 219.95C276.953 219.947 276.967 219.941 276.982 219.936C277.013 219.924 277.049 219.91 277.09 219.91C277.236 219.872 277.382 219.827 277.532 219.782Z"
                      fill={getMuscleColor('chest')}
                    />
                    <path
                      d="M372.63 332.76C372.54 332.74 372.44 332.69 372.44 332.69H372.42C362.8 328.48 354.41 322.23 347.51 314.13C341.26 306.77 337.82 297.23 337.82 287.27V237.61C337.81 237.61 337.77 232.46 342.02 227.28C346.71 221.57 354.54 218.15 365.29 217.13C380.986 215.63 389.895 218.259 394.676 219.669L394.68 219.67L394.95 219.75C395.15 219.82 395.35 219.88 395.54 219.93C395.58 219.93 395.63 219.95 395.69 219.97C395.7 219.97 395.79 220 395.79 220C395.83 220.01 395.87 220.02 395.92 220.04C395.94 220.05 396.03 220.08 396.05 220.08C396.16 220.12 396.26 220.15 396.37 220.18L396.51 220.23C396.547 220.241 396.582 220.253 396.616 220.265C396.677 220.287 396.737 220.307 396.8 220.32C400.85 221.72 408.53 224.66 414.88 228.7C425.617 235.498 429.988 241.297 436.595 250.063L436.6 250.07L437.03 250.64C439.98 254.53 443.32 258.93 447.88 264.29C452.95 270.24 463.4 282.49 476.75 291.54C478.37 292.64 480.32 293.67 482.55 294.61C482.74 294.69 482.85 294.89 482.81 295.09C482.78 295.3 482.6 295.45 482.4 295.45C467.48 295.9 459.09 304.62 452.39 312.76C451.52 313.84 450.6 314.86 449.5 316.06C449.5 316.07 449.48 316.09 449.48 316.09C449.47 316.1 449.455 316.112 449.44 316.125C449.425 316.137 449.41 316.15 449.4 316.16C449.34 316.2 449.3 316.23 449.25 316.3L449.03 316.55C448.98 316.603 448.931 316.657 448.882 316.71C448.784 316.817 448.687 316.923 448.58 317.03C448.59 317.04 448.51 317.12 448.44 317.19C435.13 330.8 417.05 338.17 398.85 338.17C391.6 338.17 384.32 337 377.32 334.58H377.28C377.276 334.576 377.271 334.574 377.266 334.572C377.257 334.57 377.246 334.57 377.24 334.57C375.57 333.88 373.9 333.24 372.63 332.76Z"
                      fill={getMuscleColor('chest')}
                    />
                  </g>

                  {/* Shoulders */}
                  <g
                    className="muscle-path"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMuscle('shoulders')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path
                      d="M152.89 303.71C152.83 303.75 152.75 303.77 152.68 303.77H152.66C152.56 303.77 152.47 303.74 152.39 303.68C152.26 303.57 152.19 303.39 152.24 303.22C157.74 282.4 160.82 274.86 162.86 269.87L162.897 269.778C163.919 267.242 164.719 265.259 165.46 262.65C171.07 244.34 184.75 221.38 218.1 216C218.85 215.87 219.39 215.77 219.69 215.7L220.14 215.58C220.467 215.498 220.837 215.404 221.242 215.301C221.728 215.178 222.262 215.042 222.83 214.9C223.469 214.73 224.088 214.571 224.706 214.411L224.71 214.41L225.77 214.14C225.81 214.13 225.84 214.13 225.88 214.13C243.5 210.59 262.01 215.16 271.47 218.2C271.64 218.25 271.77 218.42 271.77 218.6C271.78 218.79 271.66 218.95 271.49 219.02C267.45 220.55 261.53 223.08 256.28 226.42C245.175 233.477 240.444 239.724 233.899 248.368L233.89 248.38C230.84 252.44 227.43 256.97 222.68 262.54L222.658 262.566C217.699 268.376 207.4 280.443 194.34 289.32C190.84 291.69 184.95 293.94 177.31 295.83H177.29C177.24 295.85 177.18 295.86 177.14 295.86C173.74 296.25 170.23 296.96 166.75 297.97C166.733 297.974 166.717 297.977 166.703 297.981C166.604 298.003 166.551 298.015 166.49 298.05C163.47 298.93 160.58 299.99 157.83 301.22C156.1 302.01 154.44 302.84 152.89 303.71Z"
                      fill={getMuscleColor('shoulders')}
                    />
                    <path
                      d="M400.85 218.61C400.85 218.43 400.97 218.27 401.15 218.21L401.14 218.23C410.58 215.19 429.07 210.61 446.76 214.17C447.006 214.234 447.249 214.295 447.49 214.357C447.858 214.451 448.222 214.544 448.59 214.64L449.77 214.94L450.317 215.078C451.36 215.34 452.27 215.569 452.91 215.74C453.2 215.8 453.74 215.91 454.49 216.03C487.82 221.4 501.51 244.33 507.13 262.62C507.872 265.301 508.673 267.288 509.678 269.78L509.71 269.86C511.77 274.9 514.86 282.46 520.36 303.24C520.41 303.41 520.35 303.59 520.21 303.7C520.13 303.76 520.03 303.79 519.94 303.79C519.87 303.79 519.8 303.77 519.73 303.73C518.16 302.85 516.5 302.01 514.78 301.24C507.02 297.76 499.95 296.39 495.38 295.86C487.71 293.99 481.81 291.74 478.26 289.32C465.161 280.424 454.873 268.349 449.914 262.528L449.89 262.5C445.03 256.78 441.4 251.97 438.76 248.45L438.65 248.31C432.13 239.69 427.42 233.47 416.34 226.43C411.09 223.11 405.17 220.57 401.13 219.03C400.96 218.96 400.85 218.79 400.85 218.61Z"
                      fill={getMuscleColor('shoulders')}
                    />
                  </g>

                  {/* Biceps */}
                  <g
                    className="muscle-path"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMuscle('biceps')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path
                      d="M207.71 345.02C207.68 345.12 207.61 345.21 207.52 345.26V345.25C207.32 345.37 207.15 345.57 207.04 345.84C202.959 355.849 196 362.113 191.389 366.264L191.36 366.29C190.73 366.85 190.16 367.36 189.67 367.84C187.7 369.66 179.78 379.71 167.95 395.4C155.59 410.5 143.93 415.86 135.1 415.86C131.98 415.86 129.22 415.19 126.91 414.05C117.4 409.37 105.33 392.91 131.34 335.25C131.34 335.24 131.42 335.08 131.42 335.08C140.01 318.85 144.88 313.74 147.79 310.69L148.08 310.39C148.53 309.92 148.94 309.48 149.32 309.03C149.35 309 149.38 308.97 149.41 308.95C152.39 306.96 155.59 305.18 158.94 303.68C161.66 302.46 164.46 301.43 167.25 300.62C167.39 300.59 167.47 300.57 167.53 300.54C170.77 299.61 174.06 298.94 177.38 298.53C177.54 298.53 177.65 298.52 177.76 298.49C179.544 298.291 180.92 298.24 181.741 298.21L181.75 298.21C190.1 297.96 197.98 297.73 203.74 302.43C213.92 310.71 210.92 329.3 209.79 336.29L209.36 336.24L209.79 336.31C209.32 339.25 208.62 342.18 207.71 345.02Z"
                      fill={getMuscleColor('biceps')}
                    />
                    <path
                      d="M541.2 335.1C567.3 392.89 555.23 409.38 545.71 414.07L545.73 414.08C543.41 415.23 540.64 415.9 537.52 415.9C528.73 415.9 517.12 410.57 504.8 395.57C504.77 395.54 504.75 395.51 504.74 395.48C492.87 379.77 484.95 369.71 482.96 367.86C482.46 367.4 481.9 366.89 481.28 366.34C476.66 362.2 469.7 355.93 465.59 345.87C465.48 345.61 465.3 345.39 465.08 345.25C464.99 345.2 464.93 345.12 464.9 345.02C463.99 342.17 463.29 339.25 462.83 336.34L462.828 336.326C461.696 329.296 458.707 310.725 468.88 302.45C474.656 297.743 482.529 297.98 490.852 298.23L490.87 298.23C491.7 298.26 493.08 298.32 494.81 298.5C494.931 298.524 495.029 298.53 495.117 298.535C495.175 298.539 495.228 298.542 495.28 298.55C498.49 298.94 501.77 299.61 505.04 300.53C505.19 300.59 505.25 300.61 505.32 300.62C508.17 301.44 510.97 302.47 513.69 303.69C517.04 305.19 520.25 306.97 523.22 308.96L523.235 308.971C523.268 308.995 523.293 309.014 523.31 309.04C523.61 309.39 523.92 309.73 524.25 310.08C524.44 310.28 524.639 310.499 524.839 310.719L524.84 310.72L524.862 310.743C527.755 313.766 532.612 318.841 541.2 335.1Z"
                      fill={getMuscleColor('biceps')}
                    />
                  </g>

                  {/* Abs / Abdominals */}
                  <g
                    className="muscle-path"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMuscle('abs')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path
                      d="M384.32 490.61C386.41 457.79 388.65 408.87 388.74 397.67C388.79 392.09 388.67 389.6 388.58 387.74L388.56 387.35C388.5 385.83 388.44 384.62 388.54 382.23C388.56 381.7 388.59 381.18 388.62 380.71C388.64 380.58 388.64 380.45 388.64 380.34C388.68 379.72 388.71 379.12 388.76 378.55L388.81 378.04C388.83 377.82 388.84 377.62 388.88 377.39C389.59 370 391.12 365.02 392.36 361.01L392.47 360.64C393.98 355.77 394.81 353.08 393.26 349.6C391.24 345.04 385.88 341.08 376.39 337.12C376.36 337.11 376.32 337.1 376.29 337.09C376.29 337.09 376.29 337.09 376.26 337.07C374.72 336.53 373.1 335.9 371.46 335.19C371.42 335.17 371.39 335.16 371.33 335.14C360.54 331.16 346.9 328.38 340.97 332.51C338.84 334 337.8 336.3 337.8 339.54C337.8 340.28 337.2 340.88 336.42 340.89C336.33 340.86 336.19 340.85 336.1 340.89C335.36 340.89 334.76 340.29 334.76 339.55C334.76 336.32 333.72 334.02 331.57 332.52C329.69 331.21 321.97 327.54 301.28 335.13L301.18 335.17L301.1 335.2C299.5 335.9 297.87 336.54 296.23 337.1H296.21C296.21 337.1 296.17 337.12 296.16 337.13C286.67 341.09 281.31 345.05 279.31 349.61C277.75 353.12 278.59 355.82 280.11 360.73C281.31 364.54 282.95 369.77 283.7 377.43C283.83 378.3 283.91 379.28 283.93 380.4C283.94 380.48 283.94 380.57 283.94 380.7C283.98 381.21 284.01 381.72 284.03 382.25C284.13 384.82 284.09 386.01 283.99 387.8C283.9 389.62 283.78 392.11 283.83 397.69C283.94 409.23 286.19 458.22 288.25 490.63C291.6 543.3 323.93 583.5 336.14 583.49C336.19 583.51 336.25 583.51 336.31 583.51C336.36 583.51 336.41 583.51 336.45 583.49C348.6 583.49 380.92 543.3 384.28 490.62L384.32 490.61Z"
                      fill={getMuscleColor('abs')}
                    />
                  </g>

                  {/* Quads */}
                  <g
                    className="muscle-path"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMuscle('quads')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path
                      d="M458.96 792.3L458.82 793.02L458.79 793.01C455.7 808.78 452.78 823.66 445.26 827.39C442.18 828.92 438.37 828.54 433.62 826.22C431.52 825.19 429.7 825.03 428.21 825.74C425.2 827.18 424.21 831.51 422.96 837L422.956 837.018C420.807 846.414 418.372 857.06 405.71 857.28H405.44C382.64 857.28 375.34 806.56 375.27 806.05C375.26 805.98 375.25 805.92 375.23 805.87C375.2 805.81 375.2 805.76 375.2 805.7C374.55 800.89 373.79 796.12 372.95 791.53V791.38L372.91 791.22C372.88 791.05 372.85 790.88 372.8 790.71C372.43 788.68 372.02 786.51 371.48 783.85L371.42 783.55C371.35 783.23 371.28 782.88 371.22 782.54C365.63 751.25 368.5 747.76 374.79 740.12L374.795 740.114C381.265 732.274 391.032 720.439 399.45 674.95C401.737 662.572 403.351 647.89 405.06 632.351L405.09 632.08L405.118 631.827C409.996 587.785 415.522 537.892 437.54 522.52C437.67 522.43 437.83 522.42 437.97 522.48C438.11 522.54 438.21 522.67 438.23 522.82C441.22 545.99 444.31 565.51 446.09 572.56L446.19 572.92C446.314 573.364 446.463 573.935 446.634 574.597L446.7 574.85C455.6 608.45 474.81 695.9 461.05 782.05V782.07C460.31 785.48 459.62 788.95 458.96 792.3Z"
                      fill={getMuscleColor('quads')}
                    />
                    <path
                      d="M267.5 632.08C269.12 646.92 270.81 662.26 273.14 674.95H273.13C281.55 720.45 291.32 732.28 297.79 740.11L297.797 740.118C304.082 747.742 306.958 751.231 301.36 782.54C301.31 782.87 301.24 783.2 301.17 783.53C301.16 783.64 301.14 783.72 301.12 783.79C300.72 785.77 300.33 787.75 299.99 789.7L299.83 790.45C299.77 790.74 299.71 791.04 299.65 791.34C299.64 791.42 299.62 791.52 299.62 791.61C298.77 796.32 298.02 801.04 297.38 805.7C297.38 805.737 297.376 805.774 297.368 805.809C297.364 805.831 297.358 805.851 297.35 805.87C297.343 805.9 297.335 805.94 297.324 805.996C297.32 806.015 297.315 806.037 297.31 806.06C297.3 806.18 295.46 819.01 290.79 831.76C284.68 848.46 276.5 857.28 267.14 857.28H266.89C254.226 857.06 251.792 846.43 249.643 837.044L249.64 837.03L249.6 836.85C248.35 831.44 247.36 827.16 244.37 825.74C242.85 825.03 241.03 825.19 238.96 826.22C234.2 828.54 230.39 828.92 227.31 827.39C219.791 823.661 216.871 808.785 213.782 793.048L213.78 793.04L213.71 792.69L213.601 792.139C212.925 788.731 212.229 785.223 211.48 781.76C197.85 695.79 217.02 608.42 225.89 574.84C226.06 574.22 226.2 573.68 226.32 573.23L226.5 572.55C228.28 565.52 231.37 546.01 234.36 522.84C234.38 522.69 234.48 522.56 234.62 522.5C234.76 522.44 234.93 522.45 235.05 522.54C257.069 537.892 262.594 587.78 267.473 631.824L267.48 631.89L267.5 632.08Z"
                      fill={getMuscleColor('quads')}
                    />
                  </g>

                  {/* Calves (Front) */}
                  <g
                    className="muscle-path"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMuscle('calves')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path
                      d="M213.13 880.79C213.65 879.35 214.06 878.18 214.36 877.22C219.58 878.81 222.24 881.96 226.36 889.29C225.671 901.305 223.421 919.666 221.458 935.675C220.998 939.426 220.554 943.049 220.15 946.43C218.66 958.9 213.28 974.49 201.61 983.81C201.488 983.915 201.362 984.013 201.237 984.104C201.147 984.169 201.058 984.231 200.97 984.29C196.03 928.87 208.12 894.82 213.13 880.79Z"
                      fill={getMuscleColor('calves')}
                    />
                    <path
                      d="M446.26 889.29C450.38 881.96 453.04 878.82 458.26 877.22C458.57 878.18 458.97 879.35 459.49 880.79C464.49 894.82 476.59 928.87 471.65 984.29C471.44 984.15 471.22 983.99 471.01 983.81C459.34 974.48 453.96 958.9 452.47 946.43C452.066 943.049 451.622 939.427 451.162 935.676C449.199 919.667 446.949 901.305 446.26 889.29Z"
                      fill={getMuscleColor('calves')}
                    />
                  </g>
                </svg>
              </div>
            </div>

            {/* Back / Posterior Map */}
            <div className="col-lg-5 col-md-6 text-center">
              <h4 className="body-view-title mb-4">POSTERIOR (BACK VIEW)</h4>
              <div className="svg-wrapper">
                <svg
                  ref={backSvgRef}
                  width="100%"
                  height="650"
                  viewBox="0 0 673 1200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="body-vector-svg"
                >
                  {/* Traps */}
                  <g
                    className="muscle-path"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMuscle('traps')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path
                      d="M420.952 210.328C405.051 212.672 395.736 222.047 390.569 227.728C390.186 228.129 389.855 228.495 389.524 228.861L389.036 229.401C389.036 229.401 388.984 229.471 388.966 229.488C382.362 236.79 377.317 235.884 365.153 233.679C356.274 232.059 344.102 229.872 325.595 229.872C307.088 229.872 294.916 232.059 286.037 233.679C273.873 235.884 268.846 236.79 262.241 229.488C262.224 229.471 262.189 229.436 262.172 229.401L261.666 228.861C261.353 228.513 261.021 228.147 260.673 227.763L260.638 227.728L260.534 227.624C255.358 221.925 246.07 212.637 230.255 210.328L230.412 210.224C233.575 208.263 237.905 205.579 240.946 204.177C242.889 203.288 247.446 201.397 252.247 199.358C257.188 197.293 262.555 195.045 266.502 193.329C266.519 193.329 266.519 193.311 266.537 193.311C266.572 193.311 266.589 193.311 266.624 193.294C285.88 188.031 306.426 189.068 317.466 189.608C318.651 189.678 319.705 189.73 320.663 189.765C323.931 189.904 327.268 189.904 330.553 189.765C331.494 189.73 332.566 189.678 333.751 189.608C344.773 189.068 365.319 188.022 384.592 193.294H384.662C388.609 195.01 393.994 197.293 398.951 199.358C403.77 201.388 408.301 203.288 410.27 204.177C413.311 205.588 417.641 208.263 420.787 210.224C420.839 210.258 420.909 210.293 420.961 210.328H420.952Z"
                      fill={getMuscleColor('traps')}
                    />
                  </g>

                  {/* Lats */}
                  <g
                    className="muscle-path"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMuscle('lats')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path
                      d="M454.007 309.662L454.036 309.519L454.028 309.502L454.04 309.443C456.729 296.531 459.508 283.182 453.627 279.328H453.609C449.07 277.219 444.591 274.51 440.4 270.998C433.569 265.282 426.947 260.141 420.517 255.166L420.163 254.892C410.325 247.256 400.986 240.007 391.902 231.388L391.676 231.649C371.514 269.107 359.228 298.619 351.09 320.263C349.887 323.513 348.763 326.571 347.718 329.472C347.648 329.647 347.596 329.804 347.544 329.978C337.009 362.469 344.485 385.22 371.148 436.079C378.223 449.549 377.63 463.543 377.107 475.88L377.107 475.901C376.515 490.495 376.042 502.153 388.199 507.971H388.217C388.905 508.267 389.567 508.546 390.212 508.86L390.578 509.017C402.89 514.009 420.517 524.683 429.517 537.282C424.115 514.41 420.412 471.994 420.621 459.116C420.626 458.736 420.63 458.345 420.633 457.943C420.64 456.943 420.644 455.872 420.656 454.716C420.708 440.313 420.83 413.494 432.41 395.083C443.781 377.012 451.527 343.501 452.607 338.578C449.301 332.278 451.587 321.294 454.007 309.662Z"
                      fill={getMuscleColor('lats')}
                    />
                    <path
                      d="M274.079 475.804C273.574 463.489 273.003 449.532 280.042 436.096L280.051 436.113C306.714 385.254 314.207 362.495 303.655 330.013C303.603 329.838 303.551 329.682 303.481 329.507C302.435 326.606 301.311 323.547 300.109 320.297C291.971 298.671 279.703 269.16 259.558 231.719L259.296 231.423C250.185 240.076 240.808 247.348 230.918 255.018L230.682 255.201C224.269 260.168 217.63 265.317 210.816 271.033C206.608 274.562 202.094 277.298 197.537 279.398C197.52 279.398 197.502 279.415 197.485 279.432C191.734 283.362 194.496 296.657 197.171 309.535L197.171 309.537C199.611 321.212 201.92 332.269 198.6 338.595C199.698 343.509 207.444 377.02 218.815 395.1C230.361 413.462 230.49 440.205 230.56 454.639L230.56 454.733C230.56 456.354 230.578 457.809 230.595 459.134C230.787 472.012 227.084 514.428 221.681 537.3C230.804 524.552 248.745 513.765 261.048 508.842C261.089 508.822 261.13 508.801 261.175 508.784C261.206 508.773 261.238 508.762 261.274 508.755C261.806 508.494 262.363 508.25 262.938 508.023C262.938 508.023 262.944 508.018 262.951 508.013C262.958 508.009 262.965 508.006 262.973 508.006C275.18 502.168 274.694 490.536 274.085 475.962L274.079 475.804Z"
                      fill={getMuscleColor('lats')}
                    />
                  </g>

                  {/* Triceps */}
                  <g
                    className="muscle-path"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMuscle('triceps')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path
                      d="M542.641 384.976C545.908 385.951 549.629 387.032 550.814 385.812H550.805C551.52 385.063 552.225 382.771 550.492 375.801C549.564 373.453 548.981 371.145 548.428 368.955L548.357 368.673C548.339 368.621 548.322 368.551 548.322 368.499C548.292 368.424 548.275 368.336 548.259 368.257L548.252 368.22C547.555 365.414 546.867 362.757 545.49 360.343C541.534 353.434 536.023 341.446 535.046 339.322C534.971 339.158 534.922 339.053 534.904 339.013C534.869 338.944 534.834 338.857 534.817 338.769C527.419 312.865 506.472 294.167 505.688 293.469H505.671L505.584 293.382L505.575 293.375C504.632 292.632 497.737 287.195 490.911 286.813C490.6 286.792 490.256 286.778 489.888 286.762C489.627 286.751 489.354 286.74 489.072 286.725L488.989 286.722C482.834 286.442 471.391 285.922 459.491 281.698C461.944 288.605 459.673 299.515 457.454 310.171L457.443 310.225L457.44 310.242C455.175 321.102 452.836 332.324 455.892 337.358L455.927 337.393V337.41L456.415 338.159C464.091 350.28 484.533 382.449 492.479 390.604C494.44 392.617 496.086 394.377 497.707 396.163C513.321 410.244 519.699 411.917 522.322 410.854C525.293 409.643 525.659 403.413 525.973 397.941C526.304 392.051 526.635 386.483 529.989 384.4C533.449 382.266 538.119 383.634 542.641 384.976Z"
                      fill={getMuscleColor('triceps')}
                    />
                    <path
                      d="M195.254 337.454L195.289 337.401H195.28C198.373 332.374 196.021 321.117 193.747 310.234C191.525 299.561 189.251 288.625 191.717 281.707C179.816 285.931 168.374 286.451 162.219 286.73L162.135 286.734C161.847 286.749 161.573 286.76 161.311 286.771C160.946 286.787 160.604 286.801 160.279 286.821C153.413 287.205 146.512 292.677 145.624 293.391L145.537 293.478H145.519C144.761 294.14 123.78 312.865 116.374 338.778C116.356 338.865 116.321 338.952 116.286 339.022C116.042 339.58 109.961 352.911 105.717 360.352C104.332 362.774 103.635 365.432 102.938 368.229L102.93 368.266C102.915 368.345 102.898 368.433 102.868 368.508C102.868 368.56 102.851 368.63 102.833 368.682L102.806 368.79C102.266 370.98 101.694 373.295 100.751 375.652L100.733 375.687C98.9558 382.762 99.6703 385.054 100.385 385.821C101.587 387.032 105.29 385.96 108.558 384.984C113.071 383.642 117.75 382.274 121.227 384.409C124.565 386.482 124.892 392.006 125.238 397.864L125.244 397.949L125.246 397.995C125.559 403.456 125.914 409.646 128.894 410.862C131.508 411.934 137.886 410.235 153.492 396.172C155.104 394.386 156.759 392.626 158.72 390.613C166.675 382.457 187.099 350.28 194.784 338.168L195.254 337.454Z"
                      fill={getMuscleColor('triceps')}
                    />
                  </g>

                  {/* Lower Back */}
                  <g
                    className="muscle-path"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMuscle('lowerback')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path
                      d="M378.772 505.052C366.957 502.464 351.674 502.97 340.251 511.465C332.897 516.937 327.982 524.988 325.595 535.522C323.216 524.988 318.311 516.946 310.957 511.465C299.534 502.961 284.26 502.464 272.436 505.052C278.465 497.576 278.012 486.885 277.542 475.75C277.036 463.856 276.479 450.351 283.101 437.717C303.472 398.873 312.891 375.574 311.471 351.9C316.237 364.656 319.557 370.581 325.586 370.581C331.616 370.581 334.936 364.656 339.684 351.918C338.29 375.591 347.718 398.864 368.072 437.717C374.694 450.351 374.136 463.856 373.631 475.75C373.178 486.894 372.725 497.585 378.754 505.052H378.772Z"
                      fill={getMuscleColor('lowerback')}
                    />
                  </g>

                  {/* Glutes */}
                  <g
                    className="muscle-path"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMuscle('glutes')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path
                      d="M323.861 612.416V552.278H323.852C323.852 534.442 318.807 521.651 308.866 514.245C297.12 505.497 280.731 506.019 269.325 509.444C267.539 509.975 265.875 510.568 264.324 511.195C264.306 511.212 264.289 511.212 264.271 511.23C263.688 511.474 263.113 511.718 262.555 511.979C262.513 511.993 262.471 512.01 262.43 512.028C262.367 512.056 262.304 512.087 262.241 512.119C247.46 519.096 244.128 531.268 239.391 548.575L239.146 549.472C237.961 553.809 236.736 558.295 235.196 563.082C227.232 587.976 227.929 607.493 237.261 621.138C248.344 637.336 268.489 640.238 276.627 640.743C277.106 640.778 277.583 640.808 278.06 640.839C278.537 640.869 279.014 640.9 279.493 640.935H279.737C280.609 641.022 281.541 641.074 282.5 641.126H282.569C282.7 641.134 282.835 641.142 282.971 641.149C283.143 641.159 283.318 641.169 283.493 641.179L283.671 641.187C285.028 641.254 286.438 641.324 287.841 641.457C287.893 641.457 287.963 641.475 288.015 641.475C299.647 642.12 310.147 641.823 316.594 635.794C321.5 631.219 323.861 623.578 323.861 612.416Z"
                      fill={getMuscleColor('glutes')}
                    />
                    <path
                      d="M374.572 640.743C382.719 640.238 402.864 637.336 413.956 621.138H413.947C423.279 607.493 423.976 587.976 416.012 563.082C414.386 558.023 413.095 553.317 411.849 548.774L411.821 548.671C407.098 531.305 403.761 519.107 388.949 512.119C388.844 512.066 388.74 512.014 388.635 511.979C388.086 511.718 387.511 511.474 386.919 511.23C386.901 511.212 386.884 511.212 386.866 511.195C385.324 510.576 383.651 509.984 381.865 509.444C370.468 506.019 354.087 505.505 342.324 514.245C332.374 521.651 327.338 534.442 327.338 552.278V612.416C327.338 623.578 329.716 631.219 334.604 635.794C341.087 641.858 351.682 642.12 363.384 641.458C363.419 641.458 363.454 641.453 363.489 641.449C363.524 641.444 363.558 641.44 363.593 641.44C364.929 641.323 366.257 641.254 367.546 641.187L368.708 641.126C368.874 641.118 369.039 641.105 369.205 641.091C369.37 641.078 369.536 641.065 369.701 641.057C369.953 641.039 370.195 641.025 370.441 641.012C370.671 640.999 370.903 640.986 371.148 640.97C371.215 640.961 371.283 640.957 371.348 640.953C371.418 640.948 371.486 640.944 371.548 640.935H371.705C372.185 640.9 372.663 640.869 373.141 640.839C373.617 640.808 374.094 640.778 374.572 640.743Z"
                      fill={getMuscleColor('glutes')}
                    />
                  </g>

                  {/* Hamstrings */}
                  <g
                    className="muscle-path"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMuscle('hamstrings')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path
                      d="M445.184 807.888C446.787 801.789 448.155 795.533 449.322 789.172L449.314 789.164C465.006 703.905 443.772 599.686 435.564 575.803C431.113 562.86 431.356 559.172 431.634 554.931L431.635 554.927C431.641 554.821 431.647 554.715 431.654 554.609C431.719 553.54 431.787 552.428 431.739 551.049V550.997C430.38 539.609 417.432 527.898 403.996 519.743C409.562 527.112 412.133 536.561 415.172 547.736L415.175 547.747L415.363 548.427C416.558 552.771 417.791 557.25 419.314 562.019C427.627 587.984 426.773 608.53 416.814 623.099C404.85 640.569 383.416 643.679 374.764 644.219C373.509 644.289 372.245 644.376 371.008 644.464C370.834 644.481 370.642 644.498 370.468 644.498C370.113 644.534 369.758 644.553 369.397 644.573C369.227 644.582 369.056 644.592 368.882 644.603C367.201 644.725 365.536 644.829 363.881 644.917H363.741C360.352 645.23 357.163 645.927 355.464 647.853C354.279 649.186 353.808 651.103 354 653.726C355.307 670.633 351.554 677.779 347.922 684.695L347.913 684.71C343.332 693.446 339.007 701.693 345.766 730.951C347.108 735.909 348.458 740.718 349.8 745.484C353.852 759.896 357.764 773.855 361.171 790.227C361.572 790.488 361.851 790.906 361.92 791.394C369.135 840.38 376.863 860.368 388.6 860.368C401.827 860.368 402.576 837.165 403.012 823.311C403.291 814.275 403.413 810.537 406.088 810.067C408.423 809.683 410.296 811.452 417.458 829.497C423.226 844.039 427.557 845.799 429.604 845.538C435.294 844.858 440.592 830.569 444.434 814.807C444.469 812.376 444.713 810.075 445.184 807.888Z"
                      fill={getMuscleColor('hamstrings')}
                    />
                    <path
                      d="M305.441 730.959C305.441 730.925 305.459 730.855 305.459 730.855L305.45 730.864C312.159 701.683 307.855 693.44 303.28 684.719L303.277 684.712C299.645 677.796 295.892 670.65 297.181 653.743C297.382 651.12 296.902 649.212 295.717 647.87C294.01 645.945 290.847 645.265 287.475 644.951C287.37 644.934 287.283 644.934 287.178 644.934C285.61 644.847 284.016 644.742 282.412 644.62H282.273C281.445 644.568 280.626 644.533 279.842 644.464C279.797 644.464 279.756 644.459 279.716 644.454C279.678 644.45 279.64 644.446 279.598 644.446C279.24 644.423 278.882 644.397 278.525 644.372C277.823 644.322 277.122 644.272 276.418 644.237C267.757 643.697 246.322 640.586 234.385 623.116C224.409 608.548 223.555 588.002 231.867 562.037C233.488 557.009 234.769 552.321 236.006 547.764L236.024 547.696C239.075 536.547 241.654 527.117 247.202 519.76C233.679 527.968 220.662 539.748 219.425 551.206V551.258C219.409 552.525 219.476 553.566 219.54 554.563C219.548 554.691 219.556 554.818 219.564 554.944L219.567 554.985C219.827 559.211 220.055 562.915 215.634 575.821C206.825 601.49 182.96 719.911 206.006 807.827C206.494 810.049 206.738 812.367 206.773 814.815C210.616 830.578 215.922 844.867 221.585 845.547C223.65 845.808 227.964 844.057 233.732 829.506C240.894 811.47 242.793 809.692 245.102 810.075C247.777 810.546 247.899 814.282 248.195 823.314L248.196 823.319C248.631 837.173 249.363 860.377 262.59 860.377C274.318 860.377 282.055 840.389 289.287 791.403C289.357 790.915 289.636 790.497 290.019 790.253C293.443 773.863 297.355 759.922 301.407 745.493C302.749 740.727 304.099 735.917 305.441 730.959Z"
                      fill={getMuscleColor('hamstrings')}
                    />
                  </g>

                  {/* Calves (Back) */}
                  <g
                    className="muscle-path"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMuscle('calves')}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  >
                    <path
                      d="M450.943 1016.66C463.752 1015.89 466.915 989.158 468.309 963.036L468.317 963.027C467.899 937.576 462.619 919.766 457.835 904.884C457.801 904.788 457.77 904.696 457.74 904.605C457.709 904.513 457.679 904.422 457.644 904.326C457.563 904.067 457.48 903.807 457.396 903.547C457.262 903.133 457.127 902.72 456.999 902.313C456.197 900.17 455.073 898.192 453.505 897.774C450.203 896.868 444.461 902.427 439.424 907.35L439.406 907.367C431.691 914.874 422.959 923.369 415.437 917.779C410.314 913.972 404.371 913.057 399.535 915.348C394.081 917.936 390.744 924.314 390.36 932.836C390.308 933.672 389.698 934.352 388.896 934.474C384.583 975.931 384.88 989.21 387.799 998.786C387.816 998.821 387.816 998.838 387.816 998.873C396.814 1022.4 406.325 1020.43 409.465 1019.79L409.477 1019.78C417.458 1018.11 418.565 1007.21 419.454 998.455C420.159 991.38 420.735 985.803 424.908 985.455C428.187 985.161 430.435 989.771 433.835 996.744L433.909 996.895C437.961 1005.25 443.502 1016.66 450.56 1016.66H450.943Z"
                      fill={getMuscleColor('calves')}
                    />
                    <path
                      d="M263.496 998.655C263.496 998.62 263.531 998.568 263.531 998.568L263.54 998.577C266.354 989.001 266.633 975.618 262.337 934.491C261.536 934.387 260.908 933.707 260.873 932.853C260.49 924.332 257.135 917.954 251.681 915.366C246.854 913.065 240.903 913.989 235.797 917.797C228.286 923.378 219.569 914.916 211.844 907.418L211.792 907.367L211.729 907.306C206.7 902.407 201.017 896.871 197.711 897.791C196.248 898.192 195.158 899.97 194.357 901.965L194.305 902.122C194.043 902.941 193.764 903.768 193.485 904.622C188.667 919.557 183.317 937.445 182.899 963.027V963.149C184.31 989.236 187.491 1015.9 200.264 1016.67C207.514 1017.08 213.177 1005.43 217.316 996.904L217.404 996.722C220.779 989.766 223.026 985.135 226.317 985.464C230.463 985.81 231.034 991.337 231.761 998.366L231.771 998.464L231.777 998.517C232.665 1007.27 233.765 1018.13 241.73 1019.79L241.746 1019.8C244.907 1020.44 254.423 1022.4 263.409 998.812C263.416 998.798 263.42 998.786 263.425 998.776C263.432 998.76 263.441 998.746 263.461 998.725C263.461 998.708 263.479 998.69 263.479 998.69L263.496 998.655Z"
                      fill={getMuscleColor('calves')}
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Floating Hover Info Card */}
          {hoveredMuscle && (
            <div className="hovered-muscle-panel p-4 mt-4 mx-auto">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <span className="text-danger fw-bold small text-uppercase">ANATOMICAL GROUP</span>
                  <h3 className="text-white mb-0">{MUSCLE_DISPLAY_NAMES[hoveredMuscle] || hoveredMuscle.toUpperCase()}</h3>
                </div>
                {muscles[hoveredMuscle] && (
                  <div className="d-flex gap-4 align-items-center">
                    <div>
                      <span className="small text-muted d-block">RECOVERY READY</span>
                      <span className={`fs-4 fw-bold ${muscles[hoveredMuscle].recovery_pct >= 80 ? 'text-success' : muscles[hoveredMuscle].recovery_pct >= 50 ? 'text-warning' : 'text-danger'}`}>
                        {muscles[hoveredMuscle].recovery_pct}%
                      </span>
                    </div>
                    <div>
                      <span className="small text-muted d-block">7D VOLUME</span>
                      <span className="fs-4 fw-bold text-white">{Math.round(muscles[hoveredMuscle].volume_7d_kg || 0).toLocaleString()} kg</span>
                    </div>
                    <div>
                      <span className="small text-muted d-block">SETS LOGGED</span>
                      <span className="fs-4 fw-bold text-white">{muscles[hoveredMuscle].sets_7d || 0} sets</span>
                    </div>
                    <span className={`badge-status-lg ${muscles[hoveredMuscle].status.toLowerCase()}`}>
                      {muscles[hoveredMuscle].status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Muscle Table Breakdown */}
        <div className="breakdown-card p-4">
          <h3 className="text-white mb-4">Complete 15-Zone Musculoskeletal Audit</h3>
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0">
              <thead>
                <tr>
                  <th>Muscle Group</th>
                  <th>Recovery Readiness</th>
                  <th>7-Day Volume</th>
                  <th>Total Sets</th>
                  <th>Last Trained</th>
                  <th>Biomechanical Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(muscles).map((mKey) => {
                  const item = muscles[mKey];
                  return (
                    <tr key={mKey}>
                      <td className="fw-bold text-white">
                        {MUSCLE_DISPLAY_NAMES[mKey] || item.name}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="table-progress-bar">
                            <div
                              className="table-progress-fill"
                              style={{
                                width: `${item.recovery_pct}%`,
                                background: item.recovery_pct >= 80 ? '#00ff88' : item.recovery_pct >= 50 ? '#f59e0b' : '#ff0000',
                              }}
                            />
                          </div>
                          <span className="fw-bold">{item.recovery_pct}%</span>
                        </div>
                      </td>
                      <td>{Math.round(item.volume_7d_kg).toLocaleString()} kg</td>
                      <td>{item.sets_7d} sets</td>
                      <td className="text-muted">
                        {item.last_trained_hours !== null ? `${item.last_trained_hours}h ago` : 'Fully rested'}
                      </td>
                      <td>
                        <span className={`status-pill ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Scoped CSS */}
      <style>{`
        .heatmap-container {
          background-color: #000000;
          min-height: 100vh;
          padding-top: 80px;
          padding-bottom: 80px;
          color: #ffffff;
          font-family: 'Nunito', sans-serif;
        }

        .heatmap-hero-card {
          background: #111111;
          border: 1px solid #222222;
          border-left: 5px solid #ff0000;
          border-radius: 12px;
        }

        .section-tag {
          display: inline-block;
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: #ff0000;
          background: rgba(255, 0, 0, 0.08);
          padding: 0.5rem 1.4rem;
          border-radius: 6px;
        }

        .hero-heading {
          font-size: 3.4rem;
          font-weight: 900;
          color: #ffffff;
          margin-top: 12px;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }

        .hero-subtext {
          font-size: 1.6rem;
          color: #cbd5e1;
          max-width: 750px;
          line-height: 1.7;
          margin-bottom: 0;
        }

        .btn1 {
          background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
          color: #ffffff !important;
          font-weight: 700;
          font-size: 1.45rem;
          padding: 1.1rem 2.2rem;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(255, 0, 0, 0.35);
        }

        .btn1:hover {
          background: linear-gradient(135deg, #ff1a1a 0%, #e60000 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 0, 0, 0.55);
        }

        .btn-outline-custom {
          background: #181818;
          color: #ffffff !important;
          border: 1px solid #333333;
          font-weight: 700;
          font-size: 1.45rem;
          padding: 1.1rem 2.2rem;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-outline-custom:hover {
          border-color: #ff0000;
          color: #ff0000 !important;
          background: #222222;
        }

        .kpi-card {
          background: #121212;
          border: 1px solid #242424;
          border-radius: 12px;
          height: 100%;
        }

        .kpi-label {
          font-size: 1.35rem;
          color: #94a3b8;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .kpi-score-val {
          font-size: 3.8rem;
          font-weight: 900;
        }

        .kpi-badge {
          background: #202020;
          padding: 0.5rem 1.2rem;
          border-radius: 6px;
          font-size: 1.25rem;
          font-weight: 800;
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .kpi-subtext {
          color: #94a3b8;
          font-size: 1.4rem;
          line-height: 1.6;
        }

        .mode-pill {
          background: #181818;
          border: 1px solid #333333;
          color: #cbd5e1;
          padding: 1rem 1.8rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1.4rem;
          cursor: pointer;
          flex: 1;
          transition: all 0.2s ease;
        }

        .mode-pill:hover {
          background: #252525;
          color: #ffffff;
          border-color: #555555;
        }

        .mode-pill.active {
          background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
          color: #ffffff;
          border-color: #ff0000;
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.45);
        }

        .heatmap-legend span {
          font-size: 1.35rem;
          color: #cbd5e1;
          font-weight: 600;
        }

        .legend-dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
          vertical-align: middle;
        }

        .coach-note-box {
          background: #141414;
          border: 1px solid #2a2a2a;
          border-left: 5px solid #ff0000;
          border-radius: 12px;
        }

        .coach-icon {
          font-size: 2.4rem;
        }

        .heatmap-viewport-card {
          background: #111111;
          border: 1px solid #222222;
          border-radius: 12px;
        }

        .heatmap-viewport-card h2 {
          font-size: 2.8rem;
          font-weight: 800;
        }

        .body-view-title {
          font-size: 1.7rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 1px;
        }

        .body-vector-svg {
          filter: drop-shadow(0 0 15px rgba(0, 0, 0, 0.9));
        }

        .muscle-path path {
          transition: fill 0.25s ease, filter 0.25s ease;
        }

        .muscle-path:hover path {
          filter: brightness(1.3) drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
        }

        .hovered-muscle-panel {
          background: #1a1a1a;
          border: 1px solid #ff0000;
          border-radius: 10px;
          max-width: 900px;
          animation: fadeIn 0.2s ease-in-out;
        }

        .hovered-muscle-panel h3 {
          font-size: 2.4rem;
          font-weight: 800;
        }

        .hovered-muscle-panel span {
          font-size: 1.4rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .badge-status-lg {
          padding: 0.6rem 1.8rem;
          border-radius: 20px;
          font-weight: 800;
          font-size: 1.35rem;
          letter-spacing: 1px;
        }

        .badge-status-lg.ready {
          background: rgba(0, 255, 136, 0.15);
          color: #00ff88;
        }

        .badge-status-lg.recovering {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .badge-status-lg.fatigued {
          background: rgba(255, 0, 0, 0.15);
          color: #ff0000;
        }

        .breakdown-card {
          background: #141414;
          border: 1px solid #242424;
          border-radius: 12px;
        }

        .breakdown-card h3 {
          font-size: 2.4rem;
          font-weight: 800;
        }

        .table thead th {
          font-size: 1.45rem;
          color: #94a3b8;
          font-weight: 800;
          padding: 1.4rem 1.2rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .table tbody td {
          font-size: 1.5rem;
          padding: 1.4rem 1.2rem;
          vertical-align: middle;
          color: #e2e8f0;
        }

        .table-progress-bar {
          background: #242424;
          width: 110px;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
        }

        .table-progress-fill {
          height: 100%;
          border-radius: 4px;
        }

        .status-pill {
          font-size: 1.3rem;
          font-weight: 800;
          padding: 0.5rem 1.4rem;
          border-radius: 12px;
        }

        .status-pill.ready {
          background: rgba(0, 255, 136, 0.15);
          color: #00ff88;
        }

        .status-pill.recovering {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .status-pill.fatigued {
          background: rgba(255, 0, 0, 0.15);
          color: #ff0000;
        }

        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .heatmap-hero-card, .btn1, .btn-outline-custom, .navbar1, .header {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

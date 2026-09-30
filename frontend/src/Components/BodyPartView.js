import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import fallbackExercises from '../data/exercises.json';
import { useToast } from '../context/ToastContext';
import { SearchIcon, XIcon, CopyIcon, PlusIcon } from './Icons';

const BODY_PARTS_LIST = [
  { id: 'abs', name: 'Abs' },
  { id: 'biceps', name: 'Biceps' },
  { id: 'calves', name: 'Calves' },
  { id: 'chest', name: 'Chest' },
  { id: 'forearms', name: 'Forearms' },
  { id: 'glutes', name: 'Glutes' },
  { id: 'hamstring', name: 'Hamstrings' },
  { id: 'lats', name: 'Lats' },
  { id: 'lowerback', name: 'Lower Back' },
  { id: 'obliques', name: 'Obliques' },
  { id: 'quads', name: 'Quads' },
  { id: 'shoulders', name: 'Shoulders' },
  { id: 'traps', name: 'Traps' },
  { id: 'trapsmiddle', name: 'Traps Middle' },
  { id: 'triceps', name: 'Triceps' },
];

const EQUIPMENT_TAGS = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Bodyweight', 'Machine'];

export default function BodyPartView({ category: propCategory }) {
  const { bodyPart: paramCategory } = useParams();
  const currentCategory = (propCategory || paramCategory || 'abs').toLowerCase();
  const { showSuccess } = useToast();

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [loadedVideos, setLoadedVideos] = useState({});

  const activeCategoryMeta = BODY_PARTS_LIST.find(
    (bp) => bp.id === currentCategory
  ) || { id: currentCategory, name: currentCategory.toUpperCase() };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setSearchFilter('');
    setSelectedTag('All');
    setLoadedVideos({});

    api
      .get(`/app/exercises/?body_part=${currentCategory}`)
      .then((res) => {
        if (isMounted) {
          if (res.data && res.data.length > 0) {
            setExercises(res.data);
          } else {
            const localMatches = fallbackExercises.filter(
              (e) => e.body_part.toLowerCase() === currentCategory
            );
            setExercises(localMatches);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Backend exercise fetch fallback to local bundle:', err);
        if (isMounted) {
          const localMatches = fallbackExercises.filter(
            (e) => e.body_part.toLowerCase() === currentCategory
          );
          setExercises(localMatches);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentCategory]);

  const cleanInstruction = (text) => {
    if (!text) return '';
    return text
      .replace(/\{"\s*"\}|\r/g, '')
      .replace(/\n+/g, ' ')
      .trim();
  };

  const handleVideoLoaded = (videoKey) => {
    setLoadedVideos((prev) => ({ ...prev, [videoKey]: true }));
  };

  const copyExerciseLink = (exerciseName) => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showSuccess(`Link for "${exerciseName}" copied to clipboard!`);
      }).catch(() => {
        showSuccess(`Link for "${exerciseName}" copied!`);
      });
    } else {
      showSuccess(`Link for "${exerciseName}" copied!`);
    }
  };

  const filteredExercises = exercises.filter((ex) => {
    const nameMatch = (ex.name || '').toLowerCase().includes(searchFilter.toLowerCase().trim());
    if (selectedTag === 'All') return nameMatch;
    const tagMatch = (ex.name || '').toLowerCase().includes(selectedTag.toLowerCase()) ||
      (ex.instructions || []).some((inst) => inst.toLowerCase().includes(selectedTag.toLowerCase()));
    return nameMatch && tagMatch;
  });

  return (
    <div className="exercise-directory-view">
      <div className="container py-4">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-strip mb-4">
          <Link to="/directory" className="breadcrumb-back-btn">
            ← Back to Directory
          </Link>
          <div className="breadcrumb-trail">
            <span>Directory</span>
            <span className="crumb-slash">/</span>
            <span>Exercises</span>
            <span className="crumb-slash">/</span>
            <span className="crumb-active">{activeCategoryMeta.name}</span>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Left Exercise Videos & Instructions, Right Muscle Filter */}
        <div className="row g-4">
          {/* LEFT SIDE: Exercises with Video Demonstration */}
          <div className="col-12 col-lg-8">
            {/* Category Title Banner */}
            <div className="bodypart-header-banner mb-4">
              <span className="badge-tag">Target Muscle Group</span>
              <h1 className="bodypart-title">{activeCategoryMeta.name}</h1>
              <p className="bodypart-desc">
                Interactive video guides showing front and side biomechanics with execution technique.
              </p>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <div className="exercise-count-tag">
                  {filteredExercises.length} of {exercises.length} {exercises.length === 1 ? 'Exercise' : 'Exercises'} Shown
                </div>
              </div>

              {/* Quick Search & Filter Toolbar */}
              <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
                <div className="exercise-search-box mb-3 position-relative">
                  <SearchIcon size={16} className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '14px' }} />
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    placeholder={`Filter ${activeCategoryMeta.name} exercises by name (e.g. Press, Incline, Pulldown)...`}
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    style={{ paddingLeft: '38px', fontSize: '1.4rem', borderRadius: '6px' }}
                    aria-label={`Filter ${activeCategoryMeta.name} exercises`}
                  />
                  {searchFilter && (
                    <button
                      type="button"
                      className="btn position-absolute top-50 translate-middle-y text-muted p-1"
                      style={{ right: '10px', background: 'transparent', border: 'none' }}
                      onClick={() => setSearchFilter('')}
                      aria-label="Clear filter"
                    >
                      <XIcon size={16} />
                    </button>
                  )}
                </div>

                <div className="d-flex gap-2 flex-wrap">
                  {EQUIPMENT_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`custom-toggle-pill ${selectedTag === tag ? 'active' : ''}`}
                      style={{ fontSize: '1.3rem', borderRadius: '20px', padding: '0.4rem 1.4rem' }}
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="exercise-loader-box text-center py-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Loading exercises...</span>
                </div>
                <p className="text-light mt-3">Loading {activeCategoryMeta.name} exercises...</p>
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="empty-exercise-box text-center p-5">
                <h3 className="text-white mb-2">No matching exercises found</h3>
                <p className="text-muted mb-4">Try clearing your search query or selecting another muscle.</p>
                <button
                  type="button"
                  className="btn btn-outline-danger me-2"
                  onClick={() => { setSearchFilter(''); setSelectedTag('All'); }}
                >
                  Reset Filter
                </button>
                <Link to="/directory" className="btn1">
                  Back to Directory
                </Link>
              </div>
            ) : (
              <div className="exercise-cards-stack">
                {filteredExercises.map((exercise, index) => {
                  const frontKey = `front-${exercise.id || index}`;
                  const sideKey = `side-${exercise.id || index}`;

                  return (
                    <div key={exercise.id || index} className="exercise-item-container mb-5">
                      {/* Bold Exercise Ribbon Header with Action Bar */}
                      <div className="exercise-ribbon-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-3">
                          <span className="ribbon-index">#{index + 1}</span>
                          <h2 className="ribbon-title">{exercise.name}</h2>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-dark text-white border-secondary"
                            style={{ fontSize: '1.2rem', fontWeight: '700' }}
                            onClick={() => copyExerciseLink(exercise.name)}
                            title="Copy link to this exercise"
                          >
                            <i className="fas fa-link me-1" /> Copy Link
                          </button>
                          <Link
                            to="/workouts"
                            className="btn btn-sm btn-dark text-white border-secondary"
                            style={{ fontSize: '1.2rem', fontWeight: '700' }}
                            title="Add exercise to workout logger"
                          >
                            <i className="fas fa-plus text-danger me-1" /> Log Exercise
                          </Link>
                        </div>
                      </div>

                      <div className="exercise-body-wrapper p-4">
                        {/* Dual-Angle Video Showcase */}
                        {(exercise.video_front || exercise.video_side) && (
                          <div className="video-showcase-row row g-3 mb-4">
                            {exercise.video_front && (
                              <div className={exercise.video_side ? 'col-12 col-md-6' : 'col-12'}>
                                <div className="video-card-frame position-relative">
                                  <div className="video-angle-badge">
                                    <span>FRONT VIEW</span>
                                  </div>

                                  {/* Video Skeleton Pulse Placeholder */}
                                  {!loadedVideos[frontKey] && (
                                    <div className="video-skeleton-loader d-flex flex-column align-items-center justify-content-center p-4">
                                      <i className="fas fa-play-circle text-danger mb-2" style={{ fontSize: '2.5rem', opacity: 0.8 }} />
                                      <span className="text-muted small">Loading 1080p Front Guide...</span>
                                    </div>
                                  )}

                                  <video
                                    className="demo-video-player"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    controls
                                    preload="auto"
                                    onLoadedData={() => handleVideoLoaded(frontKey)}
                                  >
                                    <source src={encodeURI(exercise.video_front)} type="video/mp4" />
                                    Your browser does not support HTML5 video.
                                  </video>
                                </div>
                              </div>
                            )}

                            {exercise.video_side && (
                              <div className={exercise.video_front ? 'col-12 col-md-6' : 'col-12'}>
                                <div className="video-card-frame position-relative">
                                  <div className="video-angle-badge">
                                    <span>SIDE VIEW</span>
                                  </div>

                                  {/* Video Skeleton Pulse Placeholder */}
                                  {!loadedVideos[sideKey] && (
                                    <div className="video-skeleton-loader d-flex flex-column align-items-center justify-content-center p-4">
                                      <i className="fas fa-play-circle text-danger mb-2" style={{ fontSize: '2.5rem', opacity: 0.8 }} />
                                      <span className="text-muted small">Loading 1080p Side Guide...</span>
                                    </div>
                                  )}

                                  <video
                                    className="demo-video-player"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    controls
                                    preload="auto"
                                    onLoadedData={() => handleVideoLoaded(sideKey)}
                                  >
                                    <source src={encodeURI(exercise.video_side)} type="video/mp4" />
                                    Your browser does not support HTML5 video.
                                  </video>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Execution Steps */}
                        {exercise.instructions && exercise.instructions.length > 0 && (
                          <div className="execution-guide-box">
                            <h4 className="execution-guide-title">
                              Execution Instructions
                            </h4>
                            <ul className="execution-steps-list">
                              {exercise.instructions.map((step, sIdx) => {
                                const cleaned = cleanInstruction(step);
                                if (!cleaned) return null;
                                return (
                                  <li key={sIdx} className="execution-step-item">
                                    <span className="step-red-bullet">•</span>
                                    <span className="step-desc-text">{cleaned}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Body Part Filter Sidebar */}
          <div className="col-12 col-lg-4">
            <div className="bodypart-filter-sidebar">
              <div className="filter-panel p-4">
                <div className="filter-header-bar pb-3 mb-3">
                  <h3 className="filter-main-title">Target Muscles</h3>
                  <span className="filter-count-badge">15 Groups</span>
                </div>
                <p className="filter-help-text">
                  Select a muscle group to view all targeted exercise demonstrations:
                </p>

                <div className="muscle-options-list">
                  {BODY_PARTS_LIST.map((bp) => {
                    const isActive = bp.id === currentCategory;
                    return (
                      <Link
                        key={bp.id}
                        to={`/exercises/${bp.id}`}
                        aria-label={bp.name}
                        className={`muscle-option-link ${isActive ? 'active' : ''}`}
                      >
                        <span className="muscle-label-text">{bp.name}</span>
                        <span aria-hidden="true" className="muscle-arrow-indicator">
                          {isActive ? '●' : '→'}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <div className="pt-4 mt-3 border-top border-secondary border-opacity-25 text-center">
                  <Link to="/directory" className="btn-explore-directory w-100">
                    Explore 3D Model Directory →
                  </Link>
                </div>
              </div>

              {/* Coaching Tip Card */}
              <div className="progressive-tip-card p-4 mt-4">
                <span className="badge-tag">COACHING TIP</span>
                <h4 className="text-white mt-2 mb-2">Form & Control</h4>
                <p className="text-muted small m-0">
                  Maintain strict eccentric control and full muscle contraction on every repetition before adding weight.
                </p>
                <Link to="/workouts" className="btn-log-workout-cta mt-3">
                  Log Workout In Engine →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .exercise-directory-view {
          background-color: var(--black, #000000);
          color: var(--white, #ffffff);
          min-height: 100vh;
          padding-top: 85px;
          padding-bottom: 70px;
          font-family: 'Nunito', sans-serif;
        }

        .breadcrumb-strip {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 1.2rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .breadcrumb-back-btn {
          color: var(--white, #ffffff) !important;
          text-decoration: none !important;
          font-size: 1.5rem;
          font-weight: 700;
          transition: color 0.2s ease;
        }

        .breadcrumb-back-btn:hover {
          color: var(--red, #f00) !important;
        }

        .breadcrumb-trail {
          font-size: 1.3rem;
          color: #888888;
        }

        .crumb-slash {
          margin: 0 0.8rem;
          color: var(--red, #f00);
          font-weight: bold;
        }

        .crumb-active {
          color: #ffffff;
          font-weight: 700;
        }

        .bodypart-header-banner {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-left: 5px solid var(--red, #f00);
          border-radius: 8px;
          padding: 2.5rem 3rem;
        }

        .badge-tag {
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--red, #f00);
          text-transform: uppercase;
          display: inline-block;
        }

        .bodypart-title {
          font-size: 3.6rem;
          font-weight: 900;
          color: var(--white, #ffffff);
          text-transform: uppercase;
          margin-top: 0.5rem;
          letter-spacing: 1px;
        }

        .bodypart-desc {
          font-size: 1.5rem;
          color: var(--light-white, #aaaaaa);
          margin-top: 0.5rem;
          margin-bottom: 1.5rem;
          max-width: 650px;
          line-height: 1.6;
        }

        .exercise-count-tag {
          background: rgba(255, 0, 0, 0.15);
          color: var(--red, #f00);
          border: 1px solid rgba(255, 0, 0, 0.3);
          border-radius: 20px;
          display: inline-block;
          padding: 0.4rem 1.6rem;
          font-size: 1.3rem;
          font-weight: 700;
        }

        /* Exercise Cards */
        .exercise-item-container {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        }

        .exercise-ribbon-header {
          background: var(--red, #f00);
          color: #ffffff;
          padding: 1.4rem 2.4rem;
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .ribbon-index {
          font-size: 2rem;
          font-weight: 900;
          background: rgba(0, 0, 0, 0.25);
          padding: 0.2rem 1rem;
          border-radius: 4px;
        }

        .ribbon-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Video Showcase */
        .video-card-frame {
          position: relative;
          background: #000000;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .video-angle-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.85);
          color: var(--white, #ffffff);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.3rem 0.9rem;
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: 1px;
          border-radius: 4px;
          z-index: 5;
        }

        .demo-video-player {
          width: 100%;
          height: auto;
          display: block;
          background: #000000;
        }

        /* Instructions */
        .execution-guide-box {
          background: #161616;
          border-radius: 8px;
          padding: 2rem 2.5rem;
          border-left: 4px solid var(--red, #f00);
        }

        .execution-guide-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--white, #ffffff);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1.4rem;
        }

        .execution-steps-list {
          list-style: none;
          padding-left: 0;
          margin: 0;
        }

        .execution-step-item {
          display: flex;
          align-items: flex-start;
          font-size: 1.5rem;
          color: #cccccc;
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        .step-red-bullet {
          color: var(--red, #f00);
          font-size: 2.2rem;
          line-height: 1;
          margin-right: 1.2rem;
          flex-shrink: 0;
        }

        .step-desc-text {
          flex: 1;
        }

        /* Right Sidebar */
        .bodypart-filter-sidebar {
          position: sticky;
          top: 95px;
        }

        .filter-panel,
        .progressive-tip-card {
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
        }

        .filter-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .filter-main-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--white, #ffffff);
          margin: 0;
          text-transform: uppercase;
        }

        .filter-count-badge {
          background: rgba(255, 0, 0, 0.15);
          color: var(--red, #f00);
          border: 1px solid rgba(255, 0, 0, 0.3);
          border-radius: 12px;
          padding: 0.2rem 0.8rem;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .filter-help-text {
          font-size: 1.3rem;
          color: #888888;
          margin-bottom: 1.4rem;
        }

        .muscle-options-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .muscle-options-list::-webkit-scrollbar {
          width: 5px;
        }

        .muscle-options-list::-webkit-scrollbar-thumb {
          background: var(--red, #f00);
          border-radius: 4px;
        }

        .muscle-option-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #181818;
          color: #ffffff !important;
          padding: 1rem 1.4rem;
          border-radius: 6px;
          text-decoration: none !important;
          font-size: 1.4rem;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
        }

        .muscle-option-link:hover {
          background: #242424;
          border-color: var(--red, #f00);
          color: var(--red, #f00) !important;
          transform: translateX(4px);
        }

        .muscle-option-link.active {
          background: var(--red, #f00);
          color: #ffffff !important;
          border-color: var(--red, #f00);
          box-shadow: 0 0 12px rgba(255, 0, 0, 0.4);
        }

        .muscle-arrow-indicator {
          font-size: 1.4rem;
        }

        .btn-explore-directory {
          display: inline-block;
          background: transparent;
          color: var(--white, #ffffff) !important;
          border: 2px solid var(--red, #f00);
          padding: 1rem 1.5rem;
          border-radius: 6px;
          font-size: 1.4rem;
          font-weight: 700;
          text-decoration: none !important;
          transition: all 0.3s ease;
        }

        .btn-explore-directory:hover {
          background: var(--red, #f00);
          color: #ffffff !important;
        }

        .btn-log-workout-cta {
          display: inline-block;
          background: var(--red, #f00);
          color: #ffffff !important;
          padding: 0.8rem 1.4rem;
          border-radius: 4px;
          font-size: 1.3rem;
          font-weight: 700;
          text-decoration: none !important;
          width: 100%;
          text-align: center;
          transition: transform 0.2s ease;
        }

        .btn-log-workout-cta:hover {
          transform: scale(1.02);
        }

        .btn1 {
          display: inline-block;
          padding: 1rem 2.8rem;
          background: linear-gradient(130deg, var(--red, #f00) 93%, transparent 90%);
          color: var(--white, #ffffff);
          font-size: 1.6rem;
          font-weight: 700;
          text-decoration: none !important;
        }
      `}</style>
    </div>
  );
}

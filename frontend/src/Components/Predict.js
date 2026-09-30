import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api, { fetchPrediction } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  UtensilsIcon,
  TargetIcon,
  CoffeeIcon,
  SunIcon,
  MoonIcon,
  SaveIcon,
  CheckIcon,
  PrintIcon,
  RefreshCwIcon,
} from "./Icons";

const Predict = () => {
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchDietPrediction = async () => {
      setLoading(true);
      setError(null);

      const bmi = localStorage.getItem("bmi");
      const bmr = localStorage.getItem("bmr");
      const calories = localStorage.getItem("calories");
      const vegOnly = localStorage.getItem("vegOnly");
      const goalType = localStorage.getItem("goalType") || "maintenance";

      if (!bmi || !bmr || !calories) {
        setError("Missing required data. Please calculate your BMI first.");
        setLoading(false);
        return;
      }

      if (!isAuthenticated && !localStorage.getItem("access_token")) {
        setError("Please login first to view your customized diet plan.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetchPrediction({
          BMI: parseFloat(bmi),
          BMR: parseFloat(bmr),
          Total_Calories: parseFloat(calories),
          veg_only: vegOnly === "true",
          goal: goalType,
        });
        setOutput(response.data);
      } catch (err) {
        const errMsg =
          err.response?.status === 401
            ? "Session expired or not logged in. Please log in again."
            : err.response?.data?.error || err.message || "Failed to fetch diet plan.";
        setError("Error: " + errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchDietPrediction();
  }, [isAuthenticated]);

  const handleSaveToDashboard = async () => {
    if (!isAuthenticated) {
      showError("Please log in to save your diet plan to your Athlete Dashboard.");
      return;
    }
    try {
      setSaveStatus("saving");
      await api.post("/app/diet-history/", {
        bmi: parseFloat(localStorage.getItem("bmi") || 0),
        bmr: parseFloat(localStorage.getItem("bmr") || 0),
        total_calories: parseFloat(localStorage.getItem("calories") || 0),
        plan_data: output,
      });
      setSaveStatus("saved");
      showSuccess("Diet plan successfully saved to your Athlete Dashboard!");
    } catch (err) {
      console.error("Error saving diet plan:", err);
      setSaveStatus("error");
      showError("Failed to save diet plan. Please try again.");
    }
  };

  const handlePrintProtocol = () => {
    window.print();
  };

  return (
    <div className="predict-container">
      <div className="content-wrapper">
        {/* Header Breadcrumb & Title */}
        <div className="text-center mb-4 d-flex flex-column align-items-center">
          <span className="protocol-badge mb-3">
            <UtensilsIcon size={14} className="me-2 text-danger" /> Precision AI Nutrition Protocol
          </span>
          <h1 className="main-title m-0">
            <span className="text-white">YOUR PERSONALIZED </span>
            <span className="text-danger">DIET PLAN</span>
          </h1>
          <p className="predict-subdesc mt-2 mx-auto">
            Tailored caloric and macronutrient partition engineered for your biometric profile and training goals.
          </p>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "80px",
              marginBottom: "80px",
            }}
          >
            <div
              style={{
                border: "8px solid rgba(255, 255, 255, 0.2)",
                borderTop: "8px solid #ff0000",
                borderRadius: "50%",
                width: "80px",
                height: "80px",
                animation: "spin 1s linear infinite",
              }}
            />
            <p
              style={{
                marginTop: "16px",
                color: "#ffffff",
                fontSize: "1.8rem",
                fontWeight: "700",
              }}
            >
              Generating AI Nutrition Schedule...
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="error-card p-4 text-center rounded mb-4" style={{ backgroundColor: "#181818", border: "1px solid rgba(255, 0, 0, 0.4)" }}>
            <p className="error-message m-0" style={{ color: "#ff4444", fontSize: "1.55rem", fontWeight: "600" }}>{error}</p>
            <div className="mt-3">
              <Link
                to="/calculate_bmi"
                className="btn btn-danger btn-lg px-4"
                style={{ fontSize: "1.4rem", fontWeight: "700", borderRadius: "8px" }}
              >
                Go to Biometric &amp; BMI Calculator →
              </Link>
            </div>
          </div>
        )}

        {/* Generated Diet Protocol Dashboard */}
        {output && (
          <div className="diet-plan">
            {/* Macro Overview Panel */}
            {output.macros && (
              <div className="macro-overview-panel p-4 mb-4 rounded" style={{ backgroundColor: "#161616", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <span className="text-danger small font-monospace fw-bold" style={{ fontSize: "1.2rem", letterSpacing: "1px" }}>
                      AI MACRONUTRIENT OPTIMIZATION
                    </span>
                    <h2 className="text-white m-0" style={{ fontSize: "2.2rem", fontWeight: "800" }}>
                      Target Nutritional Breakdown
                    </h2>
                  </div>
                  {output.goal && (
                    <span className="badge bg-danger px-3 py-2" style={{ fontSize: "1.3rem", fontWeight: "700" }}>
                      <TargetIcon size={14} className="me-1" /> Goal: {output.goal.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Macro Distribution Stacked Progress Bar */}
                <div className="macro-bar-container my-3">
                  <div
                    style={{
                      display: "flex",
                      height: "18px",
                      borderRadius: "9px",
                      overflow: "hidden",
                      backgroundColor: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      style={{
                        width: `${output.macros.protein_pct || 30}%`,
                        backgroundColor: "#ef4444",
                        transition: "width 0.6s ease",
                      }}
                      title={`Protein: ${output.macros.protein_pct}%`}
                    />
                    <div
                      style={{
                        width: `${output.macros.carbs_pct || 45}%`,
                        backgroundColor: "#3b82f6",
                        transition: "width 0.6s ease",
                      }}
                      title={`Carbohydrates: ${output.macros.carbs_pct}%`}
                    />
                    <div
                      style={{
                        width: `${output.macros.fats_pct || 25}%`,
                        backgroundColor: "#f59e0b",
                        transition: "width 0.6s ease",
                      }}
                      title={`Healthy Fats: ${output.macros.fats_pct}%`}
                    />
                  </div>
                  <div className="d-flex justify-content-between text-muted mt-2" style={{ fontSize: "1.15rem", fontWeight: "600" }}>
                    <span style={{ color: "#ef4444" }}>● Protein ({output.macros.protein_pct || 30}%)</span>
                    <span style={{ color: "#3b82f6" }}>● Carbs ({output.macros.carbs_pct || 45}%)</span>
                    <span style={{ color: "#f59e0b" }}>● Fats ({output.macros.fats_pct || 25}%)</span>
                  </div>
                </div>

                {/* Macro Metric Cards */}
                <div className="macro-metrics-row mt-4">
                  <div className="macro-metric-card">
                    <span className="macro-label">Daily Calories</span>
                    <span className="macro-number text-white">
                      {output.macros.calories} <small>kcal</small>
                    </span>
                    <span className="macro-subtext">{output["Food Type"] || "Custom"} Schedule</span>
                  </div>

                  <div className="macro-metric-card protein-card">
                    <span className="macro-label text-danger">Protein Target</span>
                    <span className="macro-number text-danger">
                      {output.macros.protein_g} <small>g</small>
                    </span>
                    <span className="macro-subtext">{output.macros.protein_pct}% of total energy</span>
                  </div>

                  <div className="macro-metric-card carbs-card">
                    <span className="macro-label" style={{ color: "#3b82f6" }}>Carbohydrates</span>
                    <span className="macro-number text-white">
                      {output.macros.carbs_g} <small>g</small>
                    </span>
                    <span className="macro-subtext">{output.macros.carbs_pct}% of total energy</span>
                  </div>

                  <div className="macro-metric-card fats-card">
                    <span className="macro-label" style={{ color: "#f59e0b" }}>Healthy Fats</span>
                    <span className="macro-number text-white">
                      {output.macros.fats_g} <small>g</small>
                    </span>
                    <span className="macro-subtext">{output.macros.fats_pct}% of total energy</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rotational Meal Schedules */}
            <div className="diet-days">
              {/* Diet Day 1 */}
              <div className="diet-day">
                <h2>
                  Diet Rotation A <span>(Repeat for 3 days)</span>
                </h2>
                <div className="meals">
                  <div className="meal">
                    <img
                      src="/images/breakfast1.png"
                      alt="Breakfast"
                      className="meal-icon"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%23ef4444'%3E%3Cpath d='M18 4h-12c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2zm-6 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z'/%3E%3C/svg%3E";
                      }}
                    />
                    <div className="meal-content-col">
                      <h3 className="d-flex align-items-center gap-2">
                        <CoffeeIcon size={18} className="text-warning" /> Breakfast
                      </h3>
                      <p className="meal-name">{output["Breakfast 1"]}</p>
                      {output.meal_details?.["Breakfast 1"] && (
                        <div className="meal-nutri-tags">
                          <span className="tag-cal">{output.meal_details["Breakfast 1"].calories} kcal</span>
                          <span className="tag-pro">{output.meal_details["Breakfast 1"].protein_g}g Protein</span>
                          <span className="tag-carb">{output.meal_details["Breakfast 1"].carbs_g}g Carbs</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="meal">
                    <img
                      src="/images/lunch1.png"
                      alt="Lunch"
                      className="meal-icon"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%233b82f6'%3E%3Cpath d='M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm1 14h-2v-2h2v2zm0-4h-2v-6h2v6z'/%3E%3C/svg%3E";
                      }}
                    />
                    <div className="meal-content-col">
                      <h3 className="d-flex align-items-center gap-2">
                        <SunIcon size={18} className="text-primary" /> Lunch
                      </h3>
                      <p className="meal-name">{output["Lunch 1"]}</p>
                      {output.meal_details?.["Lunch 1"] && (
                        <div className="meal-nutri-tags">
                          <span className="tag-cal">{output.meal_details["Lunch 1"].calories} kcal</span>
                          <span className="tag-pro">{output.meal_details["Lunch 1"].protein_g}g Protein</span>
                          <span className="tag-carb">{output.meal_details["Lunch 1"].carbs_g}g Carbs</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="meal">
                    <img
                      src="/images/dinner1.png"
                      alt="Dinner"
                      className="meal-icon"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%23f59e0b'%3E%3Cpath d='M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm1 14h-2v-2h2v2zm0-4h-2v-6h2v6z'/%3E%3C/svg%3E";
                      }}
                    />
                    <div className="meal-content-col">
                      <h3 className="d-flex align-items-center gap-2">
                        <MoonIcon size={18} className="text-danger" /> Dinner
                      </h3>
                      <p className="meal-name">{output["Dinner 1"]}</p>
                      {output.meal_details?.["Dinner 1"] && (
                        <div className="meal-nutri-tags">
                          <span className="tag-cal">{output.meal_details["Dinner 1"].calories} kcal</span>
                          <span className="tag-pro">{output.meal_details["Dinner 1"].protein_g}g Protein</span>
                          <span className="tag-carb">{output.meal_details["Dinner 1"].carbs_g}g Carbs</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Diet Day 2 */}
              <div className="diet-day">
                <h2>
                  Diet Rotation B <span>(Repeat for 3 days)</span>
                </h2>
                <div className="meals">
                  <div className="meal">
                    <img
                      src="/images/breakfast2.png"
                      alt="Breakfast"
                      className="meal-icon"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%23ef4444'%3E%3Cpath d='M18 4h-12c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2zm-6 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z'/%3E%3C/svg%3E";
                      }}
                    />
                    <div className="meal-content-col">
                      <h3 className="d-flex align-items-center gap-2">
                        <CoffeeIcon size={18} className="text-warning" /> Breakfast
                      </h3>
                      <p className="meal-name">{output["Breakfast 2"]}</p>
                      {output.meal_details?.["Breakfast 2"] && (
                        <div className="meal-nutri-tags">
                          <span className="tag-cal">{output.meal_details["Breakfast 2"].calories} kcal</span>
                          <span className="tag-pro">{output.meal_details["Breakfast 2"].protein_g}g Protein</span>
                          <span className="tag-carb">{output.meal_details["Breakfast 2"].carbs_g}g Carbs</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="meal">
                    <img
                      src="/images/lunch2.png"
                      alt="Lunch"
                      className="meal-icon"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%233b82f6'%3E%3Cpath d='M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm1 14h-2v-2h2v2zm0-4h-2v-6h2v6z'/%3E%3C/svg%3E";
                      }}
                    />
                    <div className="meal-content-col">
                      <h3 className="d-flex align-items-center gap-2">
                        <SunIcon size={18} className="text-primary" /> Lunch
                      </h3>
                      <p className="meal-name">{output["Lunch 2"]}</p>
                      {output.meal_details?.["Lunch 2"] && (
                        <div className="meal-nutri-tags">
                          <span className="tag-cal">{output.meal_details["Lunch 2"].calories} kcal</span>
                          <span className="tag-pro">{output.meal_details["Lunch 2"].protein_g}g Protein</span>
                          <span className="tag-carb">{output.meal_details["Lunch 2"].carbs_g}g Carbs</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="meal">
                    <img
                      src="/images/dinner2.png"
                      alt="Dinner"
                      className="meal-icon"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%23f59e0b'%3E%3Cpath d='M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm1 14h-2v-2h2v2zm0-4h-2v-6h2v6z'/%3E%3C/svg%3E";
                      }}
                    />
                    <div className="meal-content-col">
                      <h3 className="d-flex align-items-center gap-2">
                        <MoonIcon size={18} className="text-danger" /> Dinner
                      </h3>
                      <p className="meal-name">{output["Dinner 2"]}</p>
                      {output.meal_details?.["Dinner 2"] && (
                        <div className="meal-nutri-tags">
                          <span className="tag-cal">{output.meal_details["Dinner 2"].calories} kcal</span>
                          <span className="tag-pro">{output.meal_details["Dinner 2"].protein_g}g Protein</span>
                          <span className="tag-carb">{output.meal_details["Dinner 2"].carbs_g}g Carbs</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nutrition Protocol Summary */}
            <div className="summary-container">
              <div className="summary-item">
                <h2>Diet Type</h2>
                <p>{output["Food Type"]}</p>
              </div>
              <div className="summary-item">
                <h2>Target Energy</h2>
                <p>{output["Total Calories"]} kcal</p>
              </div>
              {output.macros?.fiber_g && (
                <div className="summary-item">
                  <h2>Dietary Fiber</h2>
                  <p>{output.macros.fiber_g} g</p>
                </div>
              )}
            </div>

            {/* Action Tools Toolbar */}
            <div className="diet-action-footer mt-4 pt-3 border-top border-secondary border-opacity-25 text-center">
              <div className="d-flex justify-content-center gap-3 flex-wrap mb-2">
                <button
                  className="save-diet-btn d-inline-flex align-items-center gap-2"
                  onClick={handleSaveToDashboard}
                  disabled={saveStatus === "saving"}
                >
                  {saveStatus === "saved" ? (
                    <>
                      <CheckIcon size={16} /> Plan Saved to Dashboard
                    </>
                  ) : saveStatus === "saving" ? (
                    "Saving..."
                  ) : (
                    <>
                      <SaveIcon size={16} /> Save to Dashboard
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-light px-4 py-3 fw-bold d-inline-flex align-items-center gap-2"
                  style={{ fontSize: "1.45rem", borderRadius: "8px" }}
                  onClick={handlePrintProtocol}
                >
                  <PrintIcon size={16} /> Print / Export PDF
                </button>

                <Link
                  to="/calculate_bmi"
                  className="btn btn-outline-secondary px-4 py-3 fw-bold text-white d-inline-flex align-items-center gap-2"
                  style={{ fontSize: "1.45rem", borderRadius: "8px" }}
                >
                  <RefreshCwIcon size={16} /> Recalculate
                </Link>
              </div>
              <p className="diet-action-hint text-muted small mt-2">
                Permanently stores this personalized nutrition schedule in your Athlete Dashboard
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .predict-container {
          background-color: #070707;
          color: #ffffff;
          font-family: "Nunito", sans-serif;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .content-wrapper {
          position: relative;
          z-index: 2;
          padding: 95px 24px 60px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .protocol-badge {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          width: fit-content !important;
          max-width: fit-content !important;
          margin-left: auto !important;
          margin-right: auto !important;
          background: rgba(255, 0, 0, 0.12);
          color: #ff4d4d;
          border: 1px solid rgba(255, 0, 0, 0.35);
          padding: 0.6rem 1.8rem;
          border-radius: 9999px;
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .main-title {
          font-size: 3.2rem;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 900;
        }

        .predict-subdesc {
          color: #cbd5e1;
          font-size: 1.55rem;
          line-height: 1.6;
          max-width: 650px;
        }

        .diet-plan {
          background-color: rgba(17, 17, 17, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 4px solid #ff0000;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.85);
        }

        .macro-metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }

        .macro-metric-card {
          background-color: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 18px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
        }

        .macro-metric-card.protein-card {
          border-color: rgba(255, 0, 0, 0.4);
          background-color: rgba(255, 0, 0, 0.06);
        }

        .macro-label {
          font-size: 1.25rem;
          font-weight: 700;
          color: #888888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .macro-number {
          font-size: 2.4rem;
          font-weight: 800;
          line-height: 1.2;
        }

        .macro-number small {
          font-size: 1.3rem;
          color: #888888;
          font-weight: 600;
        }

        .macro-subtext {
          font-size: 1.2rem;
          color: #aaaaaa;
          margin-top: 4px;
        }

        .diet-days {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .diet-day {
          background-color: #161616;
          padding: 22px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .diet-day h2 {
          color: #ff0000;
          font-size: 2rem;
          margin-bottom: 18px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 2px solid rgba(255, 0, 0, 0.35);
          padding-bottom: 8px;
          font-weight: 800;
        }

        .diet-day h2 span {
          font-size: 1.25rem;
          color: #888888;
          display: block;
          margin-top: 4px;
          text-transform: none;
          letter-spacing: normal;
          font-weight: 500;
        }

        .meals {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .meal {
          display: flex;
          align-items: center;
          gap: 16px;
          background-color: #1c1c1c;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .meal:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 0, 0, 0.3);
        }

        .meal-icon {
          width: 52px;
          height: 52px;
          border-radius: 8px;
          object-fit: cover;
          background-color: #111111;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 4px;
          flex-shrink: 0;
        }

        .meal-content-col {
          flex: 1;
        }

        .meal h3 {
          font-size: 1.55rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 4px 0;
        }

        .meal-name {
          font-size: 1.45rem;
          color: #dddddd;
          margin: 0 0 6px 0;
          font-weight: 600;
        }

        .meal-nutri-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .meal-nutri-tags span {
          font-size: 1.15rem;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 700;
        }

        .tag-cal {
          background-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .tag-pro {
          background-color: rgba(239, 68, 68, 0.18);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .tag-carb {
          background-color: rgba(59, 130, 246, 0.18);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .summary-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          background-color: #161616;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          text-align: center;
        }

        .summary-item h2 {
          font-size: 1.3rem;
          color: #ff0000;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .summary-item p {
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }

        .save-diet-btn {
          background: linear-gradient(135deg, #ff0000 0%, #b30000 100%);
          color: #ffffff;
          border: none;
          padding: 1.2rem 2.8rem;
          border-radius: 8px;
          font-size: 1.55rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.25s ease;
          box-shadow: 0 4px 15px rgba(255, 0, 0, 0.35);
        }

        .save-diet-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(255, 0, 0, 0.55);
        }

        .save-diet-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .background-image, .diet-action-footer, .header {
            display: none !important;
          }
          .content-wrapper {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .diet-plan, .macro-overview-panel, .diet-day, .meal, .summary-container {
            background-color: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #cccccc !important;
            box-shadow: none !important;
          }
          .main-title, .diet-day h2, .summary-item h2 {
            color: #000000 !important;
          }
          .text-white, .meal h3, .meal-name, .summary-item p {
            color: #000000 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Predict;

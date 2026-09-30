import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ZapIcon, TrendingDownIcon, ScaleIcon, TrendingUpIcon, UtensilsIcon } from "./Icons";

export default function Calculate_BMI() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activityLevel, setActivityLevel] = useState("1.375");
  const [bmi, setBmi] = useState(null);
  const [bmr, setBmr] = useState(null);
  const [tdee, setTdee] = useState(null);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [weightGoal, setWeightGoal] = useState("");
  const [goalType, setGoalType] = useState("loss");
  const [calories, setCalories] = useState(null);
  const [vegOnly, setVegOnly] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      showLoginAlert();
    }
  }, [authLoading, isAuthenticated]);

  const showLoginAlert = () => {
    const shouldLogin = window.confirm(
      "You need to login to use this functionality. Would you like to go to the login page?"
    );
    if (shouldLogin) {
      navigate("/login");
    } else {
      navigate("/");
    }
  };

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "150px",
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
            marginTop: "14px",
            color: "#ffffff",
            fontSize: "1.8rem",
            fontWeight: "700",
          }}
        >
          Loading Metabolic Engine...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  function handleVegOnlyChange(e) {
    setVegOnly(e.target.checked);
  }

  function calculateBMI(e) {
    e.preventDefault();

    if (!height || !weight) {
      setMessage("Please enter height and weight.");
      showError("Please enter your height and weight.");
      return;
    }
    if (!gender) {
      setMessage("Please select your gender.");
      showError("Please select your gender.");
      return;
    }

    const cm = parseFloat(height) / 100;
    const kg = parseFloat(weight);
    const bmiValue = parseFloat((kg / (cm * cm)).toFixed(1));

    setBmi(bmiValue);

    let categoryValue = "";
    if (bmiValue < 18.5) {
      categoryValue = "Underweight";
    } else if (bmiValue < 25) {
      categoryValue = "Healthy";
    } else if (bmiValue < 30) {
      categoryValue = "Overweight";
    } else {
      categoryValue = "Obese";
    }

    setCategory(categoryValue);

    // Calculate BMR (Mifflin-St Jeor Formula)
    const ageVal = parseFloat(age) || 25;
    let bmrValue = 0;
    if (gender === "male") {
      bmrValue = 10 * kg + 6.25 * parseFloat(height) - 5 * ageVal + 5;
    } else {
      bmrValue = 10 * kg + 6.25 * parseFloat(height) - 5 * ageVal - 161;
    }

    const calculatedBmr = parseFloat(bmrValue.toFixed(0));
    setBmr(calculatedBmr);

    const calculatedTdee = parseFloat((calculatedBmr * parseFloat(activityLevel)).toFixed(0));
    setTdee(calculatedTdee);

    // Default goal based on category
    let initialGoal = "maintenance";
    if (categoryValue === "Overweight" || categoryValue === "Obese") {
      initialGoal = "loss";
    } else if (categoryValue === "Underweight") {
      initialGoal = "gain";
    }
    setGoalType(initialGoal);
    applyCalorieGoal(initialGoal, calculatedTdee, weightGoal);

    setMessage("");
    showSuccess("Biometric profile and metabolic energy calculated!");
  }

  function applyCalorieGoal(selectedGoal, baseTdee, deltaKg) {
    const activeTdee = baseTdee || tdee;
    if (!activeTdee) return;

    let targetCal = activeTdee;
    const delta = parseFloat(deltaKg) || 0;

    if (selectedGoal === "loss") {
      const deficit = delta > 0 ? Math.min(Math.max((delta * 7700) / 30, 400), 1000) : 500;
      targetCal = activeTdee - deficit;
    } else if (selectedGoal === "gain") {
      const surplus = delta > 0 ? Math.min(Math.max((delta * 7700) / 30, 300), 800) : 400;
      targetCal = activeTdee + surplus;
    } else {
      targetCal = activeTdee;
    }

    setCalories(Math.round(targetCal));
  }

  function handleGoalSelect(type) {
    setGoalType(type);
    applyCalorieGoal(type, tdee, weightGoal);
  }

  function handleWeightGoalChange(e) {
    const val = e.target.value;
    setWeightGoal(val);
    applyCalorieGoal(goalType, tdee, val);
  }

  // Calculate position percentage along the BMI spectrum (12 to 40)
  const getBmiPositionPercent = () => {
    if (!bmi) return 0;
    const clamped = Math.min(Math.max(bmi, 12), 40);
    return ((clamped - 12) / (40 - 12)) * 100;
  };

  // Macro Projections
  const getMacroProjections = () => {
    if (!calories || !weight) return null;
    const kg = parseFloat(weight);
    // Protein: ~2.0g/kg for cutting/gain, ~1.6g/kg for maintenance
    const proteinFactor = goalType === "loss" ? 2.2 : goalType === "gain" ? 2.0 : 1.8;
    const proteinG = Math.round(kg * proteinFactor);
    const proteinCal = proteinG * 4;

    // Fats: ~25% of total calories
    const fatsCal = calories * 0.25;
    const fatsG = Math.round(fatsCal / 9);

    // Remainder Carbs
    const carbsCal = Math.max(calories - (proteinCal + fatsCal), 0);
    const carbsG = Math.round(carbsCal / 4);

    return {
      proteinG,
      proteinPct: Math.round((proteinCal / calories) * 100),
      carbsG,
      carbsPct: Math.round((carbsCal / calories) * 100),
      fatsG,
      fatsPct: Math.round((fatsCal / calories) * 100),
    };
  };

  const macros = getMacroProjections();

  return (
    <div className="bmi-calculator-container">
      <div className="bmi-calculator-card">
        {/* Header & Protocol Badge */}
        <div className="text-center mb-4 d-flex flex-column align-items-center">
          <span className="protocol-badge mb-3">
            <ZapIcon size={14} className="me-2 text-danger" /> Biometric &amp; Metabolic Assessment
          </span>
          <h1 className="bmi-calculator-title m-0">
            <span className="text-red">AI MACRO </span>
            <span className="text-white">&amp; METABOLIC PLANNER</span>
          </h1>
          <p className="bmi-calculator-subdesc mt-2 mx-auto">
            Calculate precision Basal Metabolic Rate (BMR), Body Mass Index (BMI), and energy expenditure to calibrate your customized macro nutrition schedule.
          </p>
        </div>

        {/* Biometric Input Form */}
        <form onSubmit={calculateBMI} className="bmi-calculator-form">
          <div className="input-group">
            <input
              type="number"
              placeholder="Height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="bmi-input"
              required
              min="80"
              max="260"
            />
            <span className="input-label">Cm</span>
          </div>

          <div className="input-group">
            <input
              type="number"
              placeholder="Weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="bmi-input"
              required
              min="30"
              max="300"
            />
            <span className="input-label">Kg</span>
          </div>

          <div className="input-group">
            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="bmi-input"
              required
              min="12"
              max="100"
            />
            <span className="input-label">Years</span>
          </div>

          <div className="input-group">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="bmi-select"
              aria-label="Gender"
              required
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="input-group" style={{ gridColumn: "span 2" }}>
            <label className="form-label text-muted small fw-bold mb-1" style={{ fontSize: "1.2rem" }}>
              Daily Activity &amp; Training Level:
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="bmi-select"
              aria-label="Daily Activity & Training Level"
            >
              <option value="1.2">Sedentary (Desk job, minimal exercise)</option>
              <option value="1.375">Light Activity (1–3 training sessions / week)</option>
              <option value="1.55">Moderate Activity (3–5 training sessions / week)</option>
              <option value="1.725">High Intensity (6–7 heavy training sessions / week)</option>
              <option value="1.9">Elite / Athlete (2x daily workouts or physical job)</option>
            </select>
          </div>

          {/* Dietary Preference Filter */}
          <div className="radio-group" style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
            <label className="radio-label">
              <input
                type="radio"
                id="nonVeg"
                name="mealType"
                checked={!vegOnly}
                onChange={() => setVegOnly(false)}
              />
              <span className="radio-custom" />
              Omnivore (Standard Protein Protocol)
            </label>
            <label className="radio-label">
              <input
                type="radio"
                id="vegOnly"
                name="mealType"
                checked={vegOnly}
                onChange={handleVegOnlyChange}
              />
              <span className="radio-custom" />
              Plant-Based / Vegetarian Only
            </label>
          </div>

          <button type="submit" className="bmi-submit-button">
            Calculate Now →
          </button>
        </form>

        {message && <p className="bmi-message">{message}</p>}

        {/* Biometric Analysis Dashboard */}
        {bmr && (
          <div className="results-container">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary border-opacity-25 flex-wrap gap-2">
              <h2 className="results-title m-0">BIOMETRIC ASSESSMENT</h2>
              <span
                className="badge px-3 py-2"
                style={{
                  backgroundColor:
                    category === "Healthy"
                      ? "rgba(16, 185, 129, 0.2)"
                      : category === "Underweight"
                      ? "rgba(59, 130, 246, 0.2)"
                      : category === "Overweight"
                      ? "rgba(245, 158, 11, 0.2)"
                      : "rgba(239, 68, 68, 0.2)",
                  color:
                    category === "Healthy"
                      ? "#10b981"
                      : category === "Underweight"
                      ? "#3b82f6"
                      : category === "Overweight"
                      ? "#f59e0b"
                      : "#ef4444",
                  fontSize: "1.35rem",
                  fontWeight: "700",
                  border: "1px solid currentColor",
                }}
              >
                Category: {category}
              </span>
            </div>

            {/* Interactive BMI Spectrum Gauge */}
            <div className="bmi-gauge-card p-3 mb-4 rounded" style={{ backgroundColor: "#181818", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="d-flex justify-content-between text-muted small mb-1" style={{ fontSize: "1.2rem", fontWeight: "600" }}>
                <span>BMI Spectrum Meter</span>
                <span>Current: <strong className="text-white">{bmi} kg/m²</strong></span>
              </div>

              {/* Spectrum Progress Bar */}
              <div
                className="position-relative my-3"
                style={{
                  height: "16px",
                  borderRadius: "8px",
                  background: "linear-gradient(90deg, #3b82f6 0%, #3b82f6 23.2%, #10b981 23.2%, #10b981 46.4%, #f59e0b 46.4%, #f59e0b 64.3%, #ef4444 64.3%, #ef4444 100%)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6)",
                }}
              >
                {/* Pointer Needle */}
                <div
                  style={{
                    position: "absolute",
                    left: `${getBmiPositionPercent()}%`,
                    top: "-6px",
                    transform: "translateX(-50%)",
                    width: "14px",
                    height: "28px",
                    backgroundColor: "#ffffff",
                    borderRadius: "4px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.9), 0 0 8px #ff0000",
                    border: "2px solid #ff0000",
                    transition: "left 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>

              {/* Gauge Scale Labels */}
              <div className="d-flex justify-content-between text-muted" style={{ fontSize: "1.1rem" }}>
                <span style={{ color: "#3b82f6" }}>&lt; 18.5 Underweight</span>
                <span style={{ color: "#10b981" }}>18.5 – 24.9 Normal</span>
                <span style={{ color: "#f59e0b" }}>25.0 – 29.9 Overweight</span>
                <span style={{ color: "#ef4444" }}>30.0+ Obese</span>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="results-grid mb-4">
              <div className="result-item">
                <h3 className="result-label">BMI Score</h3>
                <p className="result-value m-0">{bmi} <small style={{ fontSize: "1.3rem", color: "#888" }}>kg/m²</small></p>
              </div>

              <div className="result-item">
                <h3 className="result-label">Basal Metabolic Rate</h3>
                <p className="result-value m-0">{bmr} <small style={{ fontSize: "1.3rem", color: "#888" }}>kcal/day</small></p>
              </div>

              <div className="result-item">
                <h3 className="result-label">Daily Energy (TDEE)</h3>
                <p className="result-value m-0">{tdee} <small style={{ fontSize: "1.3rem", color: "#888" }}>kcal/day</small></p>
              </div>
            </div>

            {/* Goal Calibration Cards */}
            <div className="goal-calibration-section pt-3 border-top border-secondary border-opacity-25">
              <h3 className="text-white mb-3" style={{ fontSize: "1.8rem", fontWeight: "700" }}>
                Select Nutrition &amp; Performance Goal:
              </h3>

              <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                  <div
                    className={`goal-card p-3 rounded text-center cursor-pointer ${goalType === "loss" ? "active-goal" : ""}`}
                    onClick={() => handleGoalSelect("loss")}
                    style={{
                      backgroundColor: goalType === "loss" ? "rgba(255, 0, 0, 0.18)" : "#1a1a1a",
                      border: goalType === "loss" ? "2px solid #ff0000" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: goalType === "loss" ? "0 0 16px rgba(255,0,0,0.35)" : "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div className="mb-2 text-danger">
                      <TrendingDownIcon size={28} />
                    </div>
                    <h4 className="text-white mt-2 mb-1" style={{ fontSize: "1.6rem", fontWeight: "700" }}>Fat Loss</h4>
                    <p className="text-muted m-0" style={{ fontSize: "1.25rem" }}>Caloric deficit for lean definition</p>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div
                    className={`goal-card p-3 rounded text-center cursor-pointer ${goalType === "maintenance" ? "active-goal" : ""}`}
                    onClick={() => handleGoalSelect("maintenance")}
                    style={{
                      backgroundColor: goalType === "maintenance" ? "rgba(255, 0, 0, 0.18)" : "#1a1a1a",
                      border: goalType === "maintenance" ? "2px solid #ff0000" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: goalType === "maintenance" ? "0 0 16px rgba(255,0,0,0.35)" : "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div className="mb-2 text-warning">
                      <ScaleIcon size={28} />
                    </div>
                    <h4 className="text-white mt-2 mb-1" style={{ fontSize: "1.6rem", fontWeight: "700" }}>Maintenance</h4>
                    <p className="text-muted m-0" style={{ fontSize: "1.25rem" }}>Body recomposition &amp; performance</p>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div
                    className={`goal-card p-3 rounded text-center cursor-pointer ${goalType === "gain" ? "active-goal" : ""}`}
                    onClick={() => handleGoalSelect("gain")}
                    style={{
                      backgroundColor: goalType === "gain" ? "rgba(255, 0, 0, 0.18)" : "#1a1a1a",
                      border: goalType === "gain" ? "2px solid #ff0000" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: goalType === "gain" ? "0 0 16px rgba(255,0,0,0.35)" : "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div className="mb-2 text-success">
                      <TrendingUpIcon size={28} />
                    </div>
                    <h4 className="text-white mt-2 mb-1" style={{ fontSize: "1.6rem", fontWeight: "700" }}>Muscle Gain</h4>
                    <p className="text-muted m-0" style={{ fontSize: "1.25rem" }}>Lean mass hypertrophy surplus</p>
                  </div>
                </div>
              </div>

              {/* Optional Target Weight Goal Input */}
              <div className="mb-4">
                <label className="text-muted small mb-1" style={{ fontSize: "1.3rem" }}>
                  Target Weight Delta (Optional target kg to {goalType === "gain" ? "gain" : "lose"}):
                </label>
                <input
                  type="number"
                  placeholder={`Weight Goal (${goalType === "gain" ? "gain" : "loss"} in kg)`}
                  value={weightGoal}
                  onChange={handleWeightGoalChange}
                  className="weight-goal-input"
                  min="0"
                  max="50"
                />
              </div>

              {/* Projected Calories & Macro Split */}
              {calories && (
                <div className="adjusted-plan p-4 rounded mb-4" style={{ backgroundColor: "#181818", border: "1px solid rgba(255,0,0,0.3)" }}>
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div>
                      <span className="text-danger small font-monospace fw-bold" style={{ fontSize: "1.2rem", letterSpacing: "1px" }}>
                        CALIBRATED ENERGY TARGET
                      </span>
                      <h4 className="text-white m-0" style={{ fontSize: "2.2rem", fontWeight: "800" }}>
                        {calories} <span style={{ fontSize: "1.4rem", color: "#888" }}>kcal / day</span>
                      </h4>
                    </div>
                    <span className="badge bg-danger px-3 py-2" style={{ fontSize: "1.3rem" }}>
                      Target: {goalType.toUpperCase()}
                    </span>
                  </div>

                  {macros && (
                    <div className="macro-preview-grid mt-3">
                      <div className="row g-2 text-center">
                        <div className="col-4">
                          <div className="p-2 rounded" style={{ backgroundColor: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
                            <div style={{ color: "#ef4444", fontSize: "1.15rem", fontWeight: "700" }}>PROTEIN</div>
                            <div className="text-white fw-bold" style={{ fontSize: "1.8rem" }}>{macros.proteinG}g</div>
                            <div className="text-muted small">{macros.proteinPct}% energy</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="p-2 rounded" style={{ backgroundColor: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)" }}>
                            <div style={{ color: "#3b82f6", fontSize: "1.15rem", fontWeight: "700" }}>CARBS</div>
                            <div className="text-white fw-bold" style={{ fontSize: "1.8rem" }}>{macros.carbsG}g</div>
                            <div className="text-muted small">{macros.carbsPct}% energy</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="p-2 rounded" style={{ backgroundColor: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" }}>
                            <div style={{ color: "#f59e0b", fontSize: "1.15rem", fontWeight: "700" }}>FATS</div>
                            <div className="text-white fw-bold" style={{ fontSize: "1.8rem" }}>{macros.fatsG}g</div>
                            <div className="text-muted small">{macros.fatsPct}% energy</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-3 text-center border-top border-secondary border-opacity-25">
                    <Link
                      to="/predict"
                      className="weight-goal-button w-100 justify-content-center"
                      style={{ padding: "1.4rem", fontSize: "1.6rem" }}
                      onClick={() => {
                        localStorage.setItem("bmi", bmi);
                        localStorage.setItem("bmr", bmr);
                        localStorage.setItem("calories", calories);
                        localStorage.setItem("vegOnly", vegOnly);
                        localStorage.setItem("goalType", goalType || "maintenance");
                        localStorage.setItem("height", height);
                        localStorage.setItem("weight", weight);
                      }}
                    >
                      Get your customised diet Plan →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }

        .bmi-calculator-container {
          min-height: 100vh;
          background-color: var(--black, #000000);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 85px 2rem 5rem 2rem;
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .bmi-calculator-card {
          width: 100%;
          max-width: 90rem;
          background-color: #111111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 4px solid var(--red, #ff0000);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.85);
          padding: 3.5rem;
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
        .bmi-calculator-title {
          font-size: 3rem;
          font-weight: 900;
          text-align: center;
          margin-bottom: 1rem;
          letter-spacing: 0.5px;
        }
        .bmi-calculator-subdesc {
          color: #cbd5e1;
          font-size: 1.55rem;
          line-height: 1.6;
          max-width: 650px;
        }
        .text-white {
          color: #ffffff;
          font-size: inherit;
        }
        .text-gray {
          color: #ffffff;
          font-size: inherit;
        }
        .text-red {
          color: var(--red, #ff0000);
          font-size: inherit;
        }
        .bmi-calculator-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.8rem;
        }
        .input-group {
          position: relative;
        }
        .bmi-input,
        .bmi-select {
          width: 100%;
          background-color: #141414;
          color: #ffffff;
          padding: 1.3rem 1.6rem;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 8px;
          font-size: 1.55rem;
          font-family: inherit;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .bmi-input:focus,
        .bmi-select:focus {
          outline: none;
          border-color: #ff0000;
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
        }
        .input-label {
          position: absolute;
          right: 1.6rem;
          top: 50%;
          transform: translateY(-50%);
          color: #cbd5e1;
          font-size: 1.4rem;
          font-weight: 700;
          pointer-events: none;
        }
        .bmi-submit-button {
          grid-column: span 2;
          background: linear-gradient(135deg, #ff0000 0%, #b30000 100%);
          color: var(--white, #ffffff);
          padding: 1.4rem;
          border: none;
          border-radius: 8px;
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.25s ease;
          box-shadow: 0 4px 15px rgba(255, 0, 0, 0.35);
        }
        .bmi-submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(255, 0, 0, 0.55);
        }
        .bmi-message {
          color: #ff4444;
          text-align: center;
          margin-top: 1.5rem;
          font-size: 1.4rem;
          font-weight: 600;
        }
        .results-container {
          margin-top: 3.5rem;
          background-color: #141414;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 2.5rem;
          border-radius: 10px;
        }
        .results-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--red, #ff0000);
          text-align: left;
          letter-spacing: 0.5px;
        }
        .results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1.6rem;
        }
        .result-item {
          background-color: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 1.8rem;
          border-radius: 8px;
        }
        .result-label {
          font-size: 1.2rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #ff3333;
          margin-bottom: 0.6rem;
        }
        .result-value {
          font-size: 2.4rem;
          font-weight: 800;
          color: #ffffff;
        }
        .weight-goal-input {
          width: 100%;
          background-color: #161616;
          color: #ffffff;
          padding: 1.2rem 1.6rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          font-size: 1.5rem;
          font-family: 'Nunito', sans-serif;
        }
        .weight-goal-button {
          background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
          color: #ffffff;
          padding: 1.2rem 2.4rem;
          border: none;
          border-radius: 8px;
          font-size: 1.5rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.25s ease;
          box-shadow: 0 4px 15px rgba(255, 0, 0, 0.35);
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }
        .weight-goal-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(255, 0, 0, 0.55);
          color: #ffffff;
        }
        .radio-group {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        .radio-label {
          display: flex;
          align-items: center;
          color: var(--white, #ffffff);
          font-size: 1.45rem;
          font-weight: 600;
          cursor: pointer;
        }
        .radio-label input[type="radio"] {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }
        .radio-custom {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          margin-right: 8px;
          display: inline-block;
          position: relative;
        }
        .radio-label input[type="radio"]:checked + .radio-custom {
          border-color: var(--red, #ff0000);
        }
        .radio-label input[type="radio"]:checked + .radio-custom::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--red, #ff0000);
        }

        @media (max-width: 767px) {
          .bmi-calculator-card {
            padding: 2rem;
          }
          .bmi-calculator-form {
            grid-template-columns: 1fr;
          }
          .bmi-submit-button {
            grid-column: span 1;
          }
          .results-grid {
            grid-template-columns: 1fr;
          }
          .bmi-calculator-title {
            font-size: 2.2rem;
          }
          .text-gray, .text-red {
            font-size: 2.2rem;
          }
        }
      `}</style>
    </div>
  );
}

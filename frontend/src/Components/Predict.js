import React, { useState, useEffect } from "react";
import axios from "axios";

const Predict = () => {
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      setError(null);

      const bmi = localStorage.getItem("bmi");
      const bmr = localStorage.getItem("bmr");
      const calories = localStorage.getItem("calories");
      const vegOnly = localStorage.getItem("vegOnly");

      if (!bmi || !bmr || !calories) {
        setError("Missing required data. Please calculate your BMI first.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          "https://my-fit-backend-2.onrender.com/app/predict/",
          {
            BMI: parseFloat(bmi),
            BMR: parseFloat(bmr),
            Total_Calories: parseFloat(calories),
            veg_only: vegOnly === "true",
          }
        );
        setOutput(response.data);
      } catch (error) {
        setError("Error: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, []);

  return (
    <div className="predict-container">
      <br />
      <br />
      <div className="background-image"></div>
      <div className="content-wrapper">
        <h1 className="main-title">Your Personalized Diet Plan</h1>
        {loading && (
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
            ></div>
            <p
              style={{
                marginTop: "10px",
                color: "white",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              Loading...
            </p>
            <style>
              {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
            </style>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        {output && (
          <div className="diet-plan">
            <div className="diet-days">
              <div className="diet-day">
                <h2>
                  Diet 1 <span>(Repeat for 3 days)</span>
                </h2>
                <div className="meals">
                  <div className="meal">
                    <img
                      src="/images/breakfast1.png"
                      alt="Breakfast"
                      className="meal-icon"
                    />
                    <div>
                      <h3>Breakfast</h3>
                      <p>{output["Breakfast 1"]}</p>
                    </div>
                  </div>
                  <div className="meal">
                    <img
                      src="/images/lunch1.png"
                      alt="Lunch"
                      className="meal-icon"
                    />
                    <div>
                      <h3>Lunch</h3>
                      <p>{output["Lunch 1"]}</p>
                    </div>
                  </div>
                  <div className="meal">
                    <img
                      src="/images/dinner1.png"
                      alt="Dinner"
                      className="meal-icon"
                    />
                    <div>
                      <h3>Dinner</h3>
                      <p>{output["Dinner 1"]}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="diet-day">
                <h2>
                  Diet 2 <span>(Repeat for 3 days)</span>
                </h2>
                <div className="meals">
                  <div className="meal">
                    <img
                      src="/images/breakfast2.png"
                      alt="Breakfast"
                      className="meal-icon"
                    />
                    <div>
                      <h3>Breakfast</h3>
                      <p>{output["Breakfast 2"]}</p>
                    </div>
                  </div>
                  <div className="meal">
                    <img
                      src="/images/lunch2.png"
                      alt="Lunch"
                      className="meal-icon"
                    />
                    <div>
                      <h3>Lunch</h3>
                      <p>{output["Lunch 2"]}</p>
                    </div>
                  </div>
                  <div className="meal">
                    <img
                      src="/images/dinner2.png"
                      alt="Dinner"
                      className="meal-icon"
                    />
                    <div>
                      <h3>Dinner</h3>
                      <p>{output["Dinner 2"]}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="summary-container">
              <div className="summary-item">
                <h2>Food Type:</h2>
                <p>{output["Food Type"]}</p>
              </div>
              <div className="summary-item">
                <h2>Total Daily Calories</h2>
                <p>{output["Total Calories"]}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .predict-container {
          background-color: #000000;
          color: #ffffff;
          font-family: "Nunito", sans-serif;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .background-image {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("/images/home-bg-3.jpg");
          background-size: cover;
          background-position: center;
          opacity: 0.2;
          z-index: 1;
        }

        .content-wrapper {
          position: relative;
          z-index: 2;
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .main-title {
          font-size: 30px;
          text-align: center;
          margin-bottom: 40px;
          color: #ff0000;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 700;
        }

        .error-message {
          color: #ff0000;
          font-size: 16px;
          text-align: center;
          background-color: rgba(255, 0, 0, 0.1);
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }

        .diet-plan {
          background-color: rgba(0, 0, 0, 0.7);
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.2);
        }

        .diet-days {
          display: flex;
          flex-wrap: wrap;
          gap: 30px;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .diet-day {
          flex: 1 1 calc(50% - 15px);
          background-color: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid rgba(255, 0, 0, 0.2);
        }

        .diet-day h2 {
          color: #ff0000;
          font-size: 24px;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 2px solid #ff0000;
          padding-bottom: 10px;
        }

        .diet-day h2 span {
          font-size: 14px;
          color: #ffffff;
          display: block;
          margin-top: 5px;
          text-transform: none;
          letter-spacing: normal;
        }

        .meals {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .meal {
          display: flex;
          align-items: center;
          gap: 15px;
          background-color: rgba(255, 255, 255, 0.03);
          padding: 15px;
          border-radius: 5px;
          transition: all 0.3s ease;
        }

        .meal:hover {
          background-color: rgba(255, 255, 255, 0.07);
          transform: translateY(-2px);
        }

        .meal-icon {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 50%;
        }

        .meal h3 {
          color: #ff0000;
          font-size: 18px;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .meal p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

        .summary-container {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-top: 30px;
        }

        .summary-item {
          flex: 1;
          background-color: rgba(255, 0, 0, 0.1);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        .summary-item h2 {
          color: #ff0000;
          font-size: 20px;
          margin-bottom: 10px;
        }

        .summary-item p {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
        }

        @media (max-width: 768px) {
          .diet-days {
            flex-direction: column;
          }

          .diet-day {
            flex: 1 1 100%;
          }

          .main-title {
            font-size: 28px;
          }

          .diet-day h2 {
            font-size: 20px;
          }

          .meal h3 {
            font-size: 16px;
          }

          .meal p {
            font-size: 12px;
          }

          .summary-container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Predict;

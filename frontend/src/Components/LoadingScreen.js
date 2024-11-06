import React from "react";

const LoadingScreen = () => {
  const styles = {
    container: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, var(--black) 0%, var(--red) 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    card: {
      background: "rgba(17, 17, 17, 0.8)",
      backdropFilter: "blur(10px)",
      padding: "40px",
      borderRadius: "16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "24px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      width: "90%",
      maxWidth: "400px",
    },
    spinner: {
      width: "60px",
      height: "60px",
      border: "3px solid rgba(255, 255, 255, 0.1)",
      borderTop: "3px solid var(--red)",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "var(--white)",
      margin: 0,
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
      textAlign: "center",
    },
    message: {
      color: "var(--light-white)",
      textAlign: "center",
      margin: 0,
      fontSize: "16px",
      lineHeight: "1.5",
    },
    progressContainer: {
      width: "100%",
      height: "6px",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: "999px",
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      background: "linear-gradient(90deg, var(--red) 0%, #ff6b6b 100%)",
      width: "75%",
      animation: "loading 2s ease-in-out infinite",
      boxShadow: "0 0 10px rgba(255, 0, 0, 0.5)",
    },
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes loading {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(25%); }
      100% { transform: translateX(-100%); }
    }
    @media (max-width: 480px) {
      .loading-card {
        padding: 0px;
        gap: 20px;
      }
      .loading-title {
        font-size: 24px;
      }
      .loading-message {
        font-size: 14px;
      }
      .loading-spinner {
        width: 50px;
        height: 30px;
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        <div style={styles.card} className="loading-card">
          <div style={styles.spinner} className="loading-spinner" />
          <h2 style={styles.title} className="loading-title">
            Loading MyFit
          </h2>
          <p style={styles.message} className="loading-message">
            Please wait while we prepare everything for you...
          </p>
          <div style={styles.progressContainer}>
            <div style={styles.progressBar} />
          </div>
        </div>
      </div>
    </>
  );
};

export default LoadingScreen;

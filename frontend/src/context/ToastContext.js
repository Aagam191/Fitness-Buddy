import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((message, duration) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, removeToast }}>
      {children}
      <div className="myfit-toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`myfit-toast-card toast-${toast.type}`}
            role="alert"
          >
            <div className="toast-icon-box">
              {toast.type === 'success' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff3333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
              {toast.type === 'error' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff3333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              )}
              {toast.type === 'info' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              )}
            </div>
            <div className="toast-content-body">
              <span className="toast-type-label">
                {toast.type === 'success' ? 'SUCCESS' : toast.type === 'error' ? 'ATTENTION' : 'NOTICE'}
              </span>
              <p className="toast-message-text m-0">{toast.message}</p>
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              ×
            </button>
            <div className="toast-countdown-bar" />
          </div>
        ))}
      </div>

      <style>{`
        .myfit-toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 999999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
          max-width: 420px;
          width: calc(100% - 48px);
        }

        .myfit-toast-card {
          pointer-events: auto;
          position: relative;
          overflow: hidden;
          background: #141414;
          color: #ffffff;
          border-radius: 10px;
          padding: 14px 18px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-left: 5px solid #ff0000;
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.85), 0 0 20px rgba(255, 0, 0, 0.18);
          display: flex;
          align-items: center;
          gap: 14px;
          animation: toastSlideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .myfit-toast-card.toast-success {
          border-left: 5px solid #ff0000;
        }

        .myfit-toast-card.toast-error {
          border-left: 5px solid #ff2222;
          background: #181212;
        }

        .myfit-toast-card.toast-info {
          border-left: 5px solid #ffffff;
        }

        .toast-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 0, 0, 0.15);
          border: 1px solid rgba(255, 0, 0, 0.3);
          flex-shrink: 0;
        }

        .toast-content-body {
          flex: 1;
          min-width: 0;
        }

        .toast-type-label {
          font-size: 11px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 1.2px !important;
          color: #ff3333 !important;
          display: block;
          margin-bottom: 2px;
          line-height: 1.2;
        }

        .myfit-toast-card.toast-info .toast-type-label {
          color: #ffffff !important;
        }

        .toast-message-text {
          font-size: 14px !important;
          color: #f3f3f3 !important;
          line-height: 1.4 !important;
          font-weight: 600 !important;
          word-break: break-word;
          margin: 0 !important;
        }

        .toast-close-btn {
          background: transparent !important;
          border: none !important;
          color: #777777 !important;
          font-size: 22px !important;
          line-height: 1 !important;
          cursor: pointer !important;
          padding: 0 4px !important;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toast-close-btn:hover {
          color: #ffffff !important;
        }

        .toast-countdown-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          width: 100%;
          background: #ff0000;
          animation: toastProgress 3.5s linear forwards;
        }

        .myfit-toast-card.toast-info .toast-countdown-bar {
          background: #ffffff;
        }

        @keyframes toastSlideInRight {
          from {
            transform: translateX(115%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes toastProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
      showSuccess: () => {},
      showError: () => {},
      showInfo: () => {},
      removeToast: () => {},
    };
  }
  return context;
};

export default ToastContext;

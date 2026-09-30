import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import { createPaymentOrder, verifyPayment as verifyPaymentApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { CheckCircleIcon, ZapIcon, ShieldCheckIcon, SparklesIcon, LockIcon } from "./Icons";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

const PLAN_OPTIONS = {
  home: {
    id: "home",
    name: "Home Starter",
    price: 799,
    formattedPrice: "₹799",
    period: "/ month",
    badge: "STARTER & DIGITAL",
    description: "At-home workout catalog, bodyweight & dumbbell tracking, standard calorie metrics.",
    features: [
      "Complete at-home dumbbell & bodyweight workouts",
      "Goal-based HIIT, strength, and mobility sessions",
      "Full access to exercise library & form guides",
      "Standard BMI & calorie energy expenditure calculator",
      "Community support & milestone badges",
    ],
  },
  pro: {
    id: "pro",
    name: "Athlete Pro",
    price: 1499,
    formattedPrice: "₹1,499",
    period: "/ month",
    badge: "MOST POPULAR",
    description: "Full 8-week periodized programs, 3D interactive muscle heatmap, and dual-angle biomechanics.",
    features: [
      "Full 8-week periodized training programs",
      "Interactive 3D muscle heatmap & recovery tracking",
      "Unlimited workout history & volume analytics",
      "Complete exercise directory with dual-angle videos",
      "AI Customized Diet Recommendations",
    ],
  },
  elite: {
    id: "elite",
    name: "VIP Elite",
    price: 2499,
    formattedPrice: "₹2,499",
    period: "/ month",
    badge: "ALL-ACCESS VIP",
    description: "Complete elite gym center access, master trainer workshops, and personalized 1-on-1 assessment.",
    features: [
      "Unlimited access to all ELITE & PRO gym centers",
      "At-center group classes with master trainers",
      "Personalized 1-on-1 coach assessment",
      "Full digital library & dual-angle biomechanics",
      "Tailored AI diet protocols & macro tracking",
      "Priority VIP support & concierge booking",
    ],
  },
  lifetime: {
    id: "lifetime",
    name: "Athlete Lifetime All-Access",
    price: 2000,
    formattedPrice: "₹2,000",
    period: "/ one-time",
    badge: "BEST VALUE",
    description: "One-time payment for perpetual access to all current and upcoming athlete intelligence modules.",
    features: [
      "Perpetual lifetime access to all platform modules",
      "3D Biomechanical Athlete Heatmap & recovery tracker",
      "All 8-week periodized programs & future releases",
      "AI Customized Diet Recommendations & macro plans",
      "Unlimited workout logging & PDF progress exports",
    ],
  },
};

const CheckoutForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, setPremium } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const requestedTier = (location.state?.tier || searchParams.get("tier"))?.toLowerCase();
  const initialPlan = PLAN_OPTIONS[requestedTier] ? requestedTier : "lifetime";

  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlan = PLAN_OPTIONS[selectedPlanId] || PLAN_OPTIONS.lifetime;

  useEffect(() => {
    if (requestedTier && PLAN_OPTIONS[requestedTier]) {
      setSelectedPlanId(requestedTier);
    }
  }, [requestedTier]);

  useEffect(() => {
    const loadRazorpayScript = () => {
      const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
      if (existingScript) {
        setIsRazorpayLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => {
        setIsRazorpayLoaded(true);
      };
      script.onerror = () => {
        showError("Failed to load Razorpay payment SDK. Please check your internet connection.");
      };
      document.body.appendChild(script);
    };

    if (!window.Razorpay) {
      loadRazorpayScript();
    } else {
      setIsRazorpayLoaded(true);
    }
  }, []);

  const createOrder = async (amount) => {
    try {
      const response = await createPaymentOrder(amount);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  const verifyPayment = async (paymentDetails) => {
    try {
      const response = await verifyPaymentApi(paymentDetails);
      return response.data.verified;
    } catch (error) {
      console.error("Error verifying payment:", error);
      return false;
    }
  };

  const handleCheckout = async (e) => {
    if (e) e.preventDefault();

    if (!isAuthenticated) {
      showInfo("Please sign in or create an account to activate your membership.");
      navigate(`/login?next=${encodeURIComponent(`/payment?tier=${selectedPlanId}`)}`);
      return;
    }

    if (!isRazorpayLoaded) {
      showInfo("Razorpay is initializing. Please try again in a moment.");
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = await createOrder(selectedPlan.price);

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "MYFIT PRO",
        description: `${selectedPlan.name} Membership`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            const isVerified = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (isVerified) {
              setPremium(true);
              showSuccess("Payment verified successfully! Welcome to MYFIT Pro.");
              setTimeout(() => {
                navigate("/dashboard");
              }, 1200);
            } else {
              showError("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            showError("An error occurred while confirming your payment.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.username || localStorage.getItem("username") || "Athlete",
          email: user?.email || localStorage.getItem("email") || "",
        },
        theme: {
          color: "#ff0000",
          backdrop_color: "rgba(0, 0, 0, 0.85)",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        showError(response.error.description || "Payment failed. Please try another method.");
        setIsProcessing(false);
      });
      paymentObject.open();
    } catch (error) {
      console.error("Error in checkout process:", error);
      const errorDetail = error.response?.data?.error || "Could not initiate payment. Please try again.";
      showError(errorDetail);
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-checkout-page py-5 px-3" style={{ minHeight: "90vh", background: "#080808" }}>
      <div className="container" style={{ maxWidth: "880px", paddingTop: "40px" }}>
        <header className="text-center mb-5">
          <span
            className="protocol-badge mb-3 d-inline-flex align-items-center gap-2"
            style={{
              background: "rgba(255, 0, 0, 0.12)",
              color: "#ff4d4d",
              border: "1px solid rgba(255, 0, 0, 0.35)",
              padding: "0.5rem 1.6rem",
              borderRadius: "9999px",
              fontSize: "1.2rem",
              fontWeight: "800",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            <ZapIcon size={14} className="text-danger" /> SECURE RAZORPAY CHECKOUT
          </span>
          <h1 className="hero-heading mt-2" style={{ fontSize: "3.2rem", fontWeight: "900", color: "#fff" }}>
            Unlock Athlete Intelligence
          </h1>
          <p className="hero-subtext" style={{ color: "#aaa", fontSize: "1.5rem" }}>
            Select your membership plan. Instant activation upon successful payment verification.
          </p>
        </header>

        {!isAuthenticated && (
          <div
            className="alert p-4 mb-5 d-flex align-items-center justify-content-between flex-wrap gap-3"
            style={{
              backgroundColor: "rgba(255, 170, 0, 0.08)",
              border: "1px solid rgba(255, 170, 0, 0.3)",
              borderRadius: "10px",
              color: "#ffca28",
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <LockIcon size={22} className="text-warning flex-shrink-0" />
              <div>
                <strong style={{ fontSize: "1.5rem" }}>Guest Checkout Notice</strong>
                <p className="mb-0 text-muted" style={{ fontSize: "1.3rem" }}>
                  Please sign in or register so your PRO membership links to your personal profile.
                </p>
              </div>
            </div>
            <Link
              to={`/login?next=${encodeURIComponent(`/payment?tier=${selectedPlanId}`)}`}
              className="btn btn-outline-warning"
              style={{ fontSize: "1.3rem", fontWeight: "700", padding: "0.6rem 1.4rem" }}
            >
              Sign In to Proceed →
            </Link>
          </div>
        )}

        {/* Plan Switcher Pills */}
        <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
          {Object.values(PLAN_OPTIONS).map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlanId(plan.id)}
              className="btn"
              style={{
                backgroundColor: selectedPlanId === plan.id ? "#ff0000" : "#181818",
                color: selectedPlanId === plan.id ? "#fff" : "#ccc",
                border: selectedPlanId === plan.id ? "1px solid #ff0000" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "30px",
                padding: "0.8rem 1.6rem",
                fontSize: "1.35rem",
                fontWeight: "700",
                transition: "all 0.2s ease",
              }}
            >
              {plan.name} ({plan.formattedPrice})
            </button>
          ))}
        </div>

        {/* Active Plan Pricing Card */}
        <div className="d-flex justify-content-center mb-5">
          <div
            className="pricing-card text-center p-5"
            style={{
              backgroundColor: "#141414",
              border: "1px solid rgba(255, 0, 0, 0.35)",
              borderTop: "5px solid #ff0000",
              borderRadius: "14px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 12px 40px rgba(0,0,0,0.85)",
            }}
          >
            {selectedPlan.badge && (
              <span
                className="badge mb-3 px-3 py-2"
                style={{
                  backgroundColor: "rgba(255, 0, 0, 0.2)",
                  color: "#ff4d4d",
                  border: "1px solid rgba(255, 0, 0, 0.4)",
                  borderRadius: "20px",
                  fontSize: "1.15rem",
                  fontWeight: "800",
                  letterSpacing: "1px",
                }}
              >
                {selectedPlan.badge}
              </span>
            )}
            <h2 className="text-white mb-2" style={{ fontSize: "2.4rem", fontWeight: "800" }}>
              {selectedPlan.name}
            </h2>
            <div className="my-3">
              <span style={{ fontSize: "4.5rem", fontWeight: "900", color: "#ff0000" }}>
                {selectedPlan.formattedPrice}
              </span>
              <span className="text-muted fs-4 ms-2">{selectedPlan.period}</span>
            </div>
            <p className="text-muted mb-4" style={{ fontSize: "1.35rem" }}>
              {selectedPlan.description}
            </p>

            <button
              className="btn1 w-100 d-inline-flex align-items-center justify-content-center gap-2"
              style={{
                padding: "1.4rem 2rem",
                fontSize: "1.6rem",
                fontWeight: "800",
                letterSpacing: "0.5px",
                opacity: isProcessing ? 0.7 : 1,
                cursor: isProcessing ? "not-allowed" : "pointer",
              }}
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Securing Order...
                </>
              ) : (
                <>
                  <SparklesIcon size={18} /> Pay {selectedPlan.formattedPrice} with Razorpay →
                </>
              )}
            </button>

            <div className="mt-4 pt-3 border-top border-secondary text-muted d-flex align-items-center justify-content-center gap-3" style={{ fontSize: "1.2rem" }}>
              <span className="d-inline-flex align-items-center gap-1">
                <ShieldCheckIcon size={14} className="text-danger" /> 256-Bit Encrypted
              </span>
              <span>•</span>
              <span>Instant Verification</span>
              <span>•</span>
              <span>UPI / Cards / NetBanking</span>
            </div>
          </div>
        </div>

        {/* Included Features Grid */}
        <div
          className="features-section mt-5 p-4 p-md-5"
          style={{
            backgroundColor: "#111",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h3 className="text-white text-center mb-4" style={{ fontSize: "2.2rem", fontWeight: "700" }}>
            Included with {selectedPlan.name}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {selectedPlan.features.map((feature, idx) => (
              <div key={idx} className="d-flex align-items-center text-light" style={{ fontSize: "1.4rem" }}>
                <CheckCircleIcon size={18} className="text-danger me-2 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;


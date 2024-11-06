import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_URL = "https://my-fit-backend-2.onrender.com"; // Adjust this to your Django server URL
const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

const CheckoutForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: localStorage.getItem("username"),
    email: localStorage.getItem("email"),

    totalAmount: "2000",
  });
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => {
        setIsRazorpayLoaded(true);
      };
      document.body.appendChild(script);
    };

    if (!window.Razorpay) {
      loadRazorpayScript();
    } else {
      setIsRazorpayLoaded(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const createOrder = async () => {
    try {
      const response = await axios.post(`${API_URL}/app/create-order/`, {
        amount: formData.totalAmount,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  const verifyPayment = async (paymentDetails) => {
    try {
      const username = localStorage.getItem("username");
      if (!username) {
        console.error("Username not found in localStorage");
        return false;
      }
      const updatedPaymentDetails = {
        ...paymentDetails,
        username: username,
      };
      const response = await axios.post(
        `${API_URL}/app/verify-payment/`,
        updatedPaymentDetails
      );
      return response.data.verified;
    } catch (error) {
      console.error("Error verifying payment:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isRazorpayLoaded) {
      alert("Razorpay is still loading. Please try again in a moment.");
      return;
    }
    try {
      const orderData = await createOrder();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MYFIT",
        description: "Test Transaction",
        order_id: orderData.order_id,
        handler: async function (response) {
          const isVerified = await verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (isVerified) {
            localStorage.setItem('isPremiumUser', true);
            console.log("Payment verified successfully");
            navigate("/predict");
            // Handle successful payment (e.g., show success message, redirect to order confirmation page)
          } else {
            console.error("Payment verification failed");
            // Handle verification failure
          }
        },
        prefill: {
          name: `${formData.fname} ${formData.lname}`,
          email: formData.email,
          contact: formData.mobile,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error in checkout process:", error);
      // Handle error (e.g., show error message to user)
    }
  };
  const styles = {
    container: {
      backgroundColor: "#000",
      color: "#fff",
      fontFamily: '"Nunito", sans-serif',
      padding: "40px",
      maxWidth: "800px",
      margin: "0 auto",
      boxSizing: "border-box",
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
    },
    title: {
      color: "#f00",
      fontSize: "33px",
      marginBottom: "10px",
      fontWeight: "bold",
    },
    subtitle: {
      fontSize: "18px",
      marginBottom: "20px",
      color: "#fff",
    },
    pricingContainer: {
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
    },
    pricingOption: {
      backgroundColor: "#1a1a2e",
      border: "1px solid #333",
      borderRadius: "8px",
      padding: "30px",
      width: "100%",
      maxWidth: "400px",
      marginBottom: "20px",
      textAlign: "center",
    },
    pricingTitle: {
      fontSize: "28px",
      marginBottom: "15px",
      color: "#fff",
    },
    price: {
      fontSize: "42px",
      fontWeight: "bold",
      color: "#f00",
      marginBottom: "15px",
    },
    description: {
      fontSize: "16px",
      marginBottom: "25px",
      color: "#aaa",
    },
    button: {
      backgroundColor: "#f00",
      color: "#fff",
      border: "none",
      padding: "15px 30px",
      fontSize: "18px",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "background-color 0.3s",
    },
    featuresContainer: {
      marginTop: "20px",
    },
    featuresTitle: {
      fontSize: "28px",
      marginBottom: "20px",
      textAlign: "center",
      color: "#fff",
    },
    featuresList: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    feature: {
      display: "flex",
      alignItems: "center",
      marginBottom: "15px",
      width: "28%",
      fontSize: "16px",
    },
    checkmark: {
      color: "#f00",
      marginRight: "10px",
      fontSize: "20px",
    },
  };

  return (
    <div style={styles.container}>
      <br /><br />
      <header style={styles.header}>
        <h1 style={styles.title}>TRACK YOUR WORKOUT</h1>
        <p style={styles.subtitle}>Your fitness journey starts here!</p>
      </header>
      <div style={styles.pricingContainer}>
        <div style={styles.pricingOption}>
          <h2 style={styles.pricingTitle}>Our Subscription</h2>
          <p style={styles.price}>₹2,000</p>
          <p style={styles.description}>One-time payment for lifetime access</p>
          <button style={styles.button} onClick={handleSubmit}>
            Get Lifetime Access
          </button>
        </div>
      </div>
      <div style={styles.featuresContainer}>
        <h2 style={styles.featuresTitle}>Features</h2>
        <div style={styles.featuresList}>
          <div style={styles.feature}>
            <span style={styles.checkmark}>✓</span> Complete Exercise Library
          </div>
          <div style={styles.feature}>
            <span style={styles.checkmark}>✓</span> Fitness Tools
          </div>
          <div style={styles.feature}>
            <span style={styles.checkmark}>✓</span> AI Generated Workouts
          </div>
          <div style={styles.feature}>
            <span style={styles.checkmark}>✓</span> Workout Tracking
          </div>
          <div style={styles.feature}>
            <span style={styles.checkmark}>✓</span> Workout Plans
          </div>
          <div style={styles.feature}>
            <span style={styles.checkmark}>✓</span> Routines
          </div>

        </div>
      </div>
    </div>
  );
};
export default CheckoutForm;

import { React, useState, useEffect } from "react";
import About from "./Components/About";
// import Navbar from './Components/Navbar';
import Home from "./Components/Home";
import Footer from "./Components/Footer";
import Calculate_BMI from "./Components/Calculate_BMI";
import { createGlobalStyle } from "styled-components";
import { BrowserRouter, Route, Routes, Link, Outlet } from "react-router-dom";
import Directory from "./Components/Directory";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import Feature from "./Components/Feature";
import Userdata from "./Components/Userdata";
import LoadingScreen from "./Components/LoadingScreen";
import "./user.css";
import Abs from "./Body-parts/Abs";
import Biceps from "./Body-parts/Biceps";
import Calves from "./Body-parts/Calves";
import Chest from "./Body-parts/Chest";
import Forearms from "./Body-parts/ForeArms";
import Glutes from "./Body-parts/Glutes";
import Hamstring from "./Body-parts/Hamstring";
import Lats from "./Body-parts/Lats";
import LowerBack from "./Body-parts/LowerBack";
import Obliques from "./Body-parts/Obliques";
import Quads from "./Body-parts/Quads";
import Shoulders from "./Body-parts/Shoulders";
import Traps from "./Body-parts/Traps";
import TrapsMiddle from "./Body-parts/TrapsMiddle";
import Triceps from "./Body-parts/Triceps";
import Payment from "./Components/Payment";
import CheckoutForm from "./Components/CheckoutForm";
import Predict from "./Components/Predict";

function App() {
  const GlobalStyle = createGlobalStyle`
:root {
  --red: #f00;
  --black: #000;
  --white: #fff;
  --light-white: #aaa;
  --light-bg: #111;
}

html {
  font-size: 60.5%;
  scroll-behavior: smooth;
  scroll-padding-top: 5rem;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 1rem;
  }

  &::-webkit-scrollbar-track {
    background: var(--black);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--red);
  }
}

body {
  background: var(--black);
}

section {
  padding: 5rem 9%;
}
  .swiper-pagination-bullet {
    height: 2rem;
    width: 2rem;
    background: var(--white);
    border-radius: 0;
  
    &.swiper-pagination-bullet-active {
      background: var(--red);
  }
}
/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  .container {
    max-width: 1140px;
  }
  
  .header {
    padding: 0 9%;
  }
  
  .home .slide .content1 {
    width: 60rem;
  }
}

/* Large devices (desktops, 992px to 1199px) */
@media (max-width: 1199.98px) {
  html {
    font-size: 60%;
  }

  .container {
    max-width: 960px;
  }

  .footer .box-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;
  }
}

/* Medium devices (tablets, 768px to 991px) */
@media (max-width: 991.98px) {
  html {
    font-size: 55%;
  }

  .container {
    max-width: 720px;
  }

  .header {
    padding: 0 4%;
  }

  .home .slide {
    padding: 2rem 5%;
  }

  .home .slide .content1 {
    width: 50rem;
  }

  .home .slide .content1 h3 {
    font-size: 4rem;
  }

  .about {
    gap: 4rem;
  }

  .footer .box-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .a-container {
    flex-wrap: wrap;
  }
}

/* Small devices (landscape phones, 576px to 767px) */
@media (max-width: 767.98px) {
  .container {
    max-width: 540px;
  }

  #menu-btn {
    display: inline-block;
  }

  .header .navbar1 {
    position: absolute;
    top: 99%;
    left: 0;
    right: 0;
    background: var(--black);
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
  }

  .header .navbar1.active {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }

  .header .navbar1 li {
    display: block;
    padding: 1.5rem;
    text-align: center;
  }

  .about .content1 .title {
    font-size: 3rem;
  }

  #features {
    height: auto;
    padding: 4rem 0;
  }

  .a-box {
    width: 100%;
    max-width: 300px;
    margin: 2rem auto;
  }

  .calculate__form {
    padding: 0 2rem;
  }
}

/* Extra small devices (portrait phones, less than 576px) */
@media (max-width: 575.98px) {
  html {
    font-size: 50%;
  }

  .container {
    width: 100%;
    padding: 0 1.5rem;
  }

  .header {
    padding: 1rem;
  }

  .home .slide .content1 {
    width: 100%;
    padding: 2rem;
  }

  .home .slide .content1 h3 {
    font-size: 3rem;
  }

  .footer .box-container {
    grid-template-columns: 1fr;
  }

  .calculate__input {
    font-size: 1.4rem;
    padding: 1.5rem 4rem 1.5rem 1.5rem;
  }

  .section__titles {
    font-size: 2rem;
    flex-direction: column;
    text-align: center;
  }

  .a-b-text h2 {
    font-size: 1.8rem;
  }

  .a-b-text p {
    font-size: 1.3rem;
  }
}

/* Height-based media queries */
@media (max-height: 600px) {
  #features {
    height: auto;
    min-height: 100vh;
  }

  .home .slide {
    min-height: 50vh;
  }
}


/* Navbar Base Styles */
.header {
  height: auto;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 9%;
  z-index: 1000;
  background: var(--black);

  .logo {
    font-weight: bolder;
    color: var(--white);
    font-size: 3rem;

    span {
      color: var(--red);
    }
  }

  .navbar1 Link:hover {
    background-color: var(--red);
    transition: 0.5s;
  }

  .navbar1 li {
    display: inline-block;
    padding: 1.5rem 2rem;
    font-size: 1.7rem;
    color: var(--white);
    /* &:hover {
      background-color: var(--red);
      transition: 0.5s;
    } */
  }
}


#menu-btn {
  font-size: 3rem;
  color: var(--white);
  cursor: pointer;
  display: none;
  transition: 0.3s ease;
}

/* Media Queries */
@media (max-width: 1200px) {
  .header {
    padding: 0 5%;
  }

  .header .navbar1 li {
    padding: 1.5rem 1.5rem;
  }
}

@media (max-width: 991px) {
  html {
    font-size: 55%;
  }

  .header {
    padding: 0 2%;
  }

  .header .navbar1 li {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 768px) {
  #menu-btn {
    display: block;
  }


  .header {
    padding: 2rem;
  }

  .header .navbar1 {
    position: absolute;
    top: 99%;
    left: 300px;
    right: 0;
    background: var(--black);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
    transition: 0.3s ease;
    display: flex;
    flex-direction: column; /* Ensure vertical alignment */
    align-items: center; /* Center items inside the navbar */
  }

  .header .navbar1.active {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }

  .header .navbar1 li {
    display: block;
    width: 100%; /* Full width for each item */
    padding: 1.5rem;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header .navbar1 li:last-child {
    border-bottom: none;
  }

  .header .navbar1 li a {
    display: block;
    font-size: 2rem;
    width: 100%; /* Full width for text */
    padding: 1.5rem 0;
  }

  .header .navbar1 li a:hover {
    background-color: var(--red);
    color: var(--white);
  }
}

@media (max-width: 576px) {
  .header {
    padding: 1.5rem;
  }

  .header .logo {
    font-size: 2.5rem;
  }

  #menu-btn {
    font-size: 2.5rem;
  }

  .header .navbar1 li a {
    font-size: 1.8rem;
    width: 100%; /* Full width to maintain consistent alignment */
  }

  .header .navbar1 li {
    padding: 1.5rem; /* Adjust padding for better alignment */
    text-align: center; /* Ensure center alignment */
  }
}

@media (max-width: 450px) {
  html {
    font-size: 50%;
  }

  .header {
    padding: 1rem;
  }

  .header .navbar1 li {
    padding: 1.2rem;
    text-align: center; /* Make sure text is centered */
  }
}

`;
  const [user, setData] = useState(null);
  const [username, setUsername] = useState(null);
  // Load user details from localStorage when the app is initialized
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const name = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    const isPremiumUser = localStorage.getItem("ispremiumuser");
    setUsername(localStorage.getItem("username"));
    if (token && name) {
      setData({ username, email, isPremiumUser });
    }
  }, []);

  const handleLogout = () => {
    // Clear localStorage and reset user state
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("ispremiumuser");
    setData(null);
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First, handle the loading timer
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Then, set up the menu functionality that will work after loading
    const menuBtn = document.querySelector("#menu-btn");
    const navbar = document.querySelector(".navbar1");

    const handleMenuClick = () => {
      menuBtn?.classList.toggle("active");
      navbar?.classList.toggle("active");
    };

    const handleOutsideClick = (e) => {
      if (!menuBtn?.contains(e.target) && !navbar?.contains(e.target)) {
        menuBtn?.classList.remove("active");
        navbar?.classList.remove("active");
      }
    };

    // Only add menu event listeners after loading is complete
    if (!isLoading && menuBtn) {
      menuBtn.addEventListener("click", handleMenuClick);
      document.addEventListener("click", handleOutsideClick);
    }

    // Cleanup function
    return () => {
      clearTimeout(loadingTimer);
      if (menuBtn) {
        menuBtn.removeEventListener("click", handleMenuClick);
        document.removeEventListener("click", handleOutsideClick);
      }
    };
  }, [isLoading]); // Add isLoading as a dependency

  if (isLoading) {
    return <LoadingScreen />;
  } // Runs when loading state changes
  return (
    <div className="App">
      <GlobalStyle />
      <BrowserRouter>
        <div className="App">
          <GlobalStyle />
          <Routes>
            <Route
              exact
              path="/"
              element={
                <>
                  <Home />
                  <About />
                  <Feature /> <Footer />
                </>
              }
            />
            <Route path="about" element={<About />} />
            <Route
              path="directory"
              element={
                <>
                  <Directory />
                  <Footer />
                </>
              }
            />

            <Route path="login" element={<Login setData={setData} />} />

            <Route path="signup" element={<Signup />} />
            <Route path="userform" element={<Userdata />} />

            <Route path="abs" element={<Abs />} />
            <Route path="biceps" element={<Biceps />} />
            <Route path="calves" element={<Calves />} />
            <Route path="chest" element={<Chest />} />
            <Route path="forearms" element={<Forearms />} />
            <Route path="glutes" element={<Glutes />} />
            <Route path="hamstring" element={<Hamstring />} />
            <Route path="lats" element={<Lats />} />
            <Route path="lowerback" element={<LowerBack />} />
            <Route path="obliques" element={<Obliques />} />
            <Route path="quads" element={<Quads />} />
            <Route path="shoulders" element={<Shoulders />} />
            <Route path="traps" element={<Traps />} />
            <Route path="trapsmiddle" element={<TrapsMiddle />} />
            <Route path="triceps" element={<Triceps />} />
            <Route path="payment" element={<CheckoutForm />} />

            <Route path="calculate_bmi" element={<Calculate_BMI />} />
            <Route path="predict" element={<Predict />} />
          </Routes>
          <header className="header">
            <a href="/" className="logo">
              <span>MY</span>FIT
            </a>

            <div id="menu-btn" className="fas fa-bars">
              {" "}
            </div>
            <nav className="navbar1">
              {/* <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/directory">Directory</Link>
              <Link to="/diet">Diet</Link>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link> */}
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/directory">Directory</Link>
                </li>
                <li>
                  <Link to="/calculate_bmi">BMI Calculator</Link>
                </li>
                <li>
                  <Link to="/predict">Diet</Link>
                </li>

                {/* <li><Link to="/fetchuser">User</Link></li> */}
                {user ? (
                  <>
                    <li>
                      <Link to="/" onClick={handleLogout}>
                        Logout
                      </Link>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link to="/login" className="page-link">
                      login
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </header>
          <nav className="navbar1"></nav>
          <Outlet /> {/* If using nested routes, otherwise remove this */}
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;

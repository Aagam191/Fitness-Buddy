import { React, useState, useEffect } from "react";
import About from "./Components/About";
import Navbar from "./Components/Navbar";
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
import "./style1.css";
import "./user.css";
import BodyPartView from "./Components/BodyPartView";
import WorkoutLogger from "./Components/WorkoutLogger";
import Dashboard from "./Components/Dashboard";
import CheckoutForm from "./Components/CheckoutForm";
import Predict from "./Components/Predict";
import TrainingPrograms from "./Components/TrainingPrograms";
import AthleteHeatmap from "./Components/AthleteHeatmap";
import BentoShowcase from "./Components/BentoShowcase";
import ScrollProgress from "./Components/ui/ScrollProgress";


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
  .home .slide {
    min-height: 50vh;
  }
}


/* Media Queries */
@media (max-width: 991px) {
  html {
    font-size: 55%;
  }
}

@media (max-width: 450px) {
  html {
    font-size: 50%;
  }
}

`;

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(loadingTimer);
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <div className="App">
        <GlobalStyle />
        <Navbar />

        <Routes>
            <Route
              exact
              path="/"
              element={
                <>
                  <ScrollProgress />
                  <Home />
                  <BentoShowcase />
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

            <Route path="login" element={<Login />} />

            <Route path="signup" element={<Signup />} />
            <Route path="userform" element={<Userdata />} />

            {/* Modern Phase 3 & 4 Routes */}
            <Route path="exercises/:bodyPart" element={<BodyPartView />} />
            <Route path="workouts" element={<WorkoutLogger />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Backwards-compatible Muscle Group Routes */}
            <Route path="abs" element={<BodyPartView category="abs" />} />
            <Route path="biceps" element={<BodyPartView category="biceps" />} />
            <Route path="calves" element={<BodyPartView category="calves" />} />
            <Route path="chest" element={<BodyPartView category="chest" />} />
            <Route path="forearms" element={<BodyPartView category="forearms" />} />
            <Route path="glutes" element={<BodyPartView category="glutes" />} />
            <Route path="hamstring" element={<BodyPartView category="hamstring" />} />
            <Route path="lats" element={<BodyPartView category="lats" />} />
            <Route path="lowerback" element={<BodyPartView category="lowerback" />} />
            <Route path="obliques" element={<BodyPartView category="obliques" />} />
            <Route path="quads" element={<BodyPartView category="quads" />} />
            <Route path="shoulders" element={<BodyPartView category="shoulders" />} />
            <Route path="traps" element={<BodyPartView category="traps" />} />
            <Route path="trapsmiddle" element={<BodyPartView category="trapsmiddle" />} />
            <Route path="triceps" element={<BodyPartView category="triceps" />} />
            <Route path="payment" element={<CheckoutForm />} />

            <Route path="calculate_bmi" element={<Calculate_BMI />} />
            <Route path="predict" element={<Predict />} />
            <Route path="programs" element={<TrainingPrograms />} />
            <Route path="heatmap" element={<AthleteHeatmap />} />
          </Routes>
          <Outlet />
        </div>
      </BrowserRouter>
  );
}

export default App;

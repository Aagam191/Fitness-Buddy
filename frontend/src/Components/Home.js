import React from "react";
import "../style1.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules"; // Correct path for Autoplay and Pagination
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay"; // Optional but recommended for autoplay styles

export default function Home() {
  return (
    <section className="home" id="home">
      <Swiper
        modules={[Pagination, Autoplay]} // Use the imported modules
        pagination={{ clickable: true }}
        loop={true} // Enable looping
        autoplay={{
          delay: 2000, // Set delay for 2 seconds
          disableOnInteraction: false, // Keep autoplay running after user interaction
        }}
        className="home-slider"
      >
        <SwiperSlide
          className="slide"
          style={{ background: "url('/images/home-bg-1.jpg') no-repeat" }}
        >
          <div className="content1">
            <span>be strong, be fit</span>
            <h3>Make yourself stronger than your excuses.</h3>
            <a href="/" className="btn1">
              get started
            </a>
          </div>
        </SwiperSlide>

        <SwiperSlide
          className="slide"
          style={{ background: "url('/images/home-bg-4.jpg') no-repeat" }}
        >
          <div className="content1">
            <span>be strong, be fit</span>
            <h3>Make yourself stronger than your excuses.</h3>
            <a href="/" className="btn1">
              get started
            </a>
          </div>
        </SwiperSlide>

        <SwiperSlide
          className="slide"
          style={{ background: "url('/images/home-bg-3.jpg') no-repeat" }}
        >
          <div className="content1">
            <span>be strong, be fit</span>
            <h3>Make yourself stronger than your excuses.</h3>
            <a href="/" className="btn1">
              get started
            </a>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>
  );
}

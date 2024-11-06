# MyFit : Personal Gym Assistant

## Overview

**MyFit** is a personalized gym assistant designed to provide users with tailored workout suggestions and dietary recommendations based on body part, fitness goals, and personal metrics. This full-stack application leverages advanced data processing with a Random Forest Classifier model, React for a dynamic frontend, and Django for a robust backend, creating an interactive, data-driven fitness platform.

## Features

- **Interactive Exercise Directory:**
    -  Visual, SVG-based directory displaying over 20+ specific body parts.
    -  Users can click on any body part (chest, shoulders, legs, etc.) to view targeted exercises.
- **BMI & BMR Calculator:**
    -  Calculates BMI and BMR based on user’s height, weight, age, gender, and exercise level.
    -  Provides personalized calorie intake guidance for weight gain or loss goals.
    -  User data is stored securely in PostgreSQL, allowing consistent access and updates.
- **Premium Diet:**
    -  Custom diet plan suggestions based on Random Forest ML model and individual BMI/BMR data.
    -  Users can access tailored diet recommendations for a structured 6-day diet plan.
    -  Integration with Razorpay for secure, lifetime premium access purchases.
- **User Authentication:**
    - Sign-up and login functionality ensures secure access to BMI calculations and premium diet features.

## Technologies Used
- **Frontend**: React, Tailwind CSS
- **Backend**: Django, REST API
- **Machine Learning**: Random Forest Classifier
- **Database**: PostgreSQL (hosted on NEON)
- **Payment Gateway**: Razorpay (testing environment)

## Deployed Project:
[Deployed project of MyFit](https://my-fit-janki.vercel.app/)

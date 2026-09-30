# Project Context: MyFit — Personal Gym Assistant

> **Purpose**: This document enables a future LLM to fully understand the project without re-reading every file.

---

## Machine-Friendly Summary (YAML)

```yaml
project:
  name: MyFit (Fitness-Buddy)
  purpose: Gym assistant — exercise directory, BMI/BMR calculator, ML diet recommendations, Razorpay premium payment
  status: Deployed; functional with several bugs and security issues

stack:
  frontend: React 18.3.1, React Router v6, Axios, Bootstrap 5, styled-components, Swiper 11
  backend: Django 5.1.2, DRF 3.15.2, djangorestframework-simplejwt 5.3.1
  database: PostgreSQL on Neon (DATABASE_URL env var); db.sqlite3 also in repo (local dev only)
  authentication: JWT via simplejwt; tokens stored in browser localStorage
  ml: scikit-learn 1.5.1, Random Forest, joblib, pandas, numpy
  payment: Razorpay (test environment)
  testing: React Testing Library (broken), Django test runner (empty)
  deployment:
    frontend: Vercel — https://my-fit-janki.vercel.app/
    backend: Render — https://my-fit-backend-2.onrender.com

architecture:
  pattern: Monorepo, /frontend (CRA React SPA) + /backend (Django)
  frontend_structure: Flat /src/Components + /src/Body-parts; all routes in App.js
  backend_structure: Single Django project (backend/) + one app (app/); all logic in app/views.py
  data_flow: |
    React → Axios → Django DRF → PostgreSQL
    Auth state: localStorage; inter-component data: localStorage (bmi/bmr/calories/vegOnly)

features:
  - name: User Registration; status: WORKING; location: Signup.js, views.py::signup_view
  - name: User Login/JWT; status: PARTIALLY WORKING (username input bug); location: Login.js, views.py::login_view
  - name: Exercise Directory SVG; status: WORKING; location: Directory.js + Body-parts/*.js
  - name: BMI/BMR Calculator; status: PARTIALLY WORKING (diet link broken); location: Calculate_BMI.js
  - name: ML Diet Recommendation; status: WORKING; location: Predict.js, ml_utils.py
  - name: Razorpay Premium; status: PARTIALLY WORKING (test mode, localStorage key bug); location: CheckoutForm.js
  - name: User Details Storage; status: BROKEN (localhost:8000); location: Userdata.js
  - name: Payment.js old form; status: DEAD CODE (hardcoded secrets); location: Payment.js

critical_files:
  - path: frontend/src/App.js; purpose: Root routes, global CSS, auth state, navbar
  - path: frontend/src/Components/Calculate_BMI.js; purpose: BMI/BMR calculator, feeds localStorage
  - path: frontend/src/Components/Predict.js; purpose: Reads localStorage, calls /app/predict/
  - path: frontend/src/Components/CheckoutForm.js; purpose: Razorpay payment flow
  - path: frontend/src/Components/Directory.js; purpose: 139KB SVG body-map
  - path: backend/app/views.py; purpose: ALL API endpoints
  - path: backend/app/models.py; purpose: User + User_details models
  - path: backend/app/ml_utils.py; purpose: DietRecommendationModel class
  - path: backend/backend/settings.py; purpose: Django config, env var consumption

known_bugs:
  - issue: Diet plan link /diet doesn't exist (should be /predict); severity: HIGH; location: Calculate_BMI.js:376
  - issue: Login username input bound to formData.email; severity: MEDIUM; location: Login.js:74
  - issue: localStorage key 'isPremiumUser' vs 'ispremiumuser' mismatch; severity: HIGH; locations: Login.js:40, App.js:437
  - issue: Logout removes 'token' key but stored key is 'access_token'; severity: MEDIUM; location: App.js:446
  - issue: Userdata.js posts to localhost:8000 in production; severity: HIGH; location: Userdata.js:30
  - issue: Razorpay test key_secret hardcoded in Payment.js frontend; severity: CRITICAL; location: Payment.js:41-42

technical_debt:
  - issue: Backend URL hardcoded in every component (no .env); location: all components
  - issue: No global state manager; auth via localStorage + prop drilling; location: App.js
  - issue: DietRecommendationModel loaded from disk on every request (no caching); location: ml_utils.py
  - issue: Directory.js is 139KB single file with all SVG paths; location: Directory.js
  - issue: User_details has no FK to User (linked by username string); location: models.py
  - issue: All API endpoints lack authentication/permission checks; location: views.py
  - issue: CORS_ALLOW_ALL_ORIGINS=True in production; location: settings.py
  - issue: Tailwind CSS installed but never used; location: package.json

external_services:
  - name: Neon; purpose: PostgreSQL hosting
  - name: Render; purpose: Django backend hosting (free tier, cold starts)
  - name: Vercel; purpose: React frontend hosting
  - name: Razorpay; purpose: Indian payment gateway (test environment)

run_commands:
  install_frontend: cd frontend && npm install
  install_backend: cd backend && pip install -r requirements.txt  # NOTE: requirements.txt is UTF-16 encoded
  fix_encoding: iconv -f UTF-16 -t UTF-8 requirements.txt > req.txt && pip install -r req.txt
  dev_frontend: cd frontend && npm start
  dev_backend: cd backend && python manage.py runserver
  migrate: cd backend && python manage.py migrate
  prod_backend: gunicorn backend.wsgi:application
  tests_frontend: cd frontend && npm test   # BROKEN - CRA boilerplate test
  tests_backend: cd backend && python manage.py test  # EMPTY - no tests written
```

---

## 1. Project Overview

**MyFit** (GitHub: Fitness-Buddy) is a full-stack web application and personalized gym assistant.

- **Deployed frontend**: https://my-fit-janki.vercel.app/
- **Deployed backend**: https://my-fit-backend-2.onrender.com

**What it does**:
1. Shows a clickable SVG body map; users click a muscle to see exercise demos
2. Calculates BMI, BMR, and daily calorie targets from user inputs
3. Uses a Random Forest ML model to generate a personalized 6-day meal plan
4. Charges a one-time ₹2,000 Razorpay payment to unlock the diet feature (premium)

---

## 2. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | 18.3.1 |
| Routing | React Router DOM | 6.26.1 (in devDependencies) |
| HTTP | Axios | 1.7.7 |
| CSS-in-JS | styled-components | 6.1.12 |
| UI | Bootstrap | 5.3.3 |
| Slider | Swiper | 11.1.9 |
| Backend | Django | 5.1.2 |
| REST | DRF | 3.15.2 |
| JWT | simplejwt | 5.3.1 |
| CORS | django-cors-headers | 4.5.0 |
| Static | Whitenoise | 6.7.0 |
| ML | scikit-learn | 1.5.1 |
| ML data | pandas / numpy | 2.2.2 / 2.1.0 |
| Model IO | joblib | 1.4.2 |
| Payment | razorpay SDK | 1.4.2 |
| WSGI | gunicorn | 23.0.0 |
| Database | PostgreSQL (Neon) | — |
| DB driver | psycopg2 | 2.9.10 |
| Env config | django-environ | 0.11.2 |

---

## 3. Repository Structure

```
Fitness-Buddy/
├── README.md
├── frontend/                           CRA React SPA
│   ├── package.json
│   ├── vercel.json                     SPA fallback routing (/* → /index.html)
│   ├── postcss.config.js               Tailwind config (Tailwind installed but NOT used)
│   ├── public/
│   │   ├── index.html
│   │   ├── images/                     14 static images (home BGs, meal icons)
│   │   └── exercise videos/            62 MP4 exercise demo videos
│   └── src/
│       ├── index.js                    React entry point
│       ├── App.js                      ROOT: router, global CSS, navbar, auth state
│       ├── App.test.js                 BROKEN: CRA boilerplate test (never updated)
│       ├── index.css                   Minimal global reset
│       ├── style1.css                  Main stylesheet (home, about, footer)
│       ├── user.css                    Login/signup styles
│       ├── profile.css                 DEAD CSS (not imported anywhere)
│       ├── DietPage.css                DEAD CSS (not imported anywhere)
│       ├── swiper-bundle.min.*         DEAD vendored Swiper (npm version used instead)
│       ├── Components/
│       │   ├── Home.js                 Hero carousel (Swiper, 3 slides, auto-play 2s)
│       │   ├── About.js                About section (lorem ipsum placeholder text)
│       │   ├── Feature.js              Membership tier cards (ELITE/PRO/HOME) — display only
│       │   ├── Footer.js               Footer with quick links and contact
│       │   ├── LoadingScreen.js        2-second animated splash screen
│       │   ├── Login.js                Login form → POST /app/login/ → JWT to localStorage
│       │   ├── Signup.js               Register form → POST /app/register/
│       │   ├── Userdata.js             BROKEN: posts to localhost:8000 (not routed in prod)
│       │   ├── Directory.js            LARGE (139KB): Interactive SVG body map
│       │   ├── Calculate_BMI.js        BMI/BMR/calorie calculator (auth-gated via localStorage)
│       │   ├── Predict.js              Reads localStorage → POST /app/predict/ → 6-day diet
│       │   ├── CheckoutForm.js         Active Razorpay payment flow → sets isPremiumUser
│       │   ├── Payment.js              DEAD CODE: old form with hardcoded Razorpay secrets
│       │   └── form.js                 DEAD: empty stub
│       └── Body-parts/
│           ├── BodyPart.css            Shared styles for all body-part pages
│           ├── styles.js               Styled-component bullet list item
│           ├── Abs.js                  Crunches + Leg Raise (4 videos)
│           ├── Biceps.js               Barbell Curl + Dumbbell Curl (4 videos)
│           ├── Calves.js               Calves Raises + Seated Raises (4 videos)
│           ├── Chest.js                Incline Bench Press + Push Up (4 videos)
│           ├── ForeArms.js             Wrist Curl + Wrist Extension (4 videos)
│           ├── Glutes.js               Hip Thrust + Squat (4 videos)
│           ├── Hamstring.js            Leg Curl + Stiff Leg DL (4 videos)
│           ├── Lats.js                 Chin Ups + Dumbbell Row (4 videos)
│           ├── LowerBack.js            Barbell + Machine Extension (4 videos)
│           ├── Obliques.js             Russian Twist + Side Plank (4 videos)
│           ├── Quads.js                Squat + Split Squat (4 videos)
│           ├── Shoulders.js            Overhead Press + Seated Press (4 videos)
│           ├── Traps.js                Seated Shrug + Silverback Shrug (4 videos)
│           ├── TrapsMiddle.js          Barbell Deadlift + Pullup (4 videos)
│           └── Triceps.js              Bench Dips + Cable Pushdown (4 videos)
└── backend/
    ├── manage.py
    ├── requirements.txt                UTF-16 encoded — use iconv to decode
    ├── db.sqlite3                      LOCAL DEV ONLY — not used in production
    ├── backend/                        Django project package
    │   ├── settings.py                 All config; reads .env file
    │   ├── urls.py                     Root URLs: /admin/, /app/, /, /health/
    │   ├── views.py                    welcome_view + health_check
    │   ├── wsgi.py
    │   └── asgi.py
    └── app/                            Single Django app
        ├── models.py                   User (AbstractUser + isPremiumUser) + User_details
        ├── views.py                    ALL API endpoints (9 views)
        ├── serializers.py              3 serializers (UserSerializer unused in views)
        ├── urls.py                     7 URL patterns
        ├── admin.py                    Admin for User + User_details
        ├── tests.py                    EMPTY
        ├── migrations/0001_initial.py  Creates User + User_details tables
        └── ml_models/
            ├── diet_recommendation_model3.joblib  7 RF classifiers in a list
            ├── label_encoders3.joblib             LabelEncoders for meal categories
            └── updated_fitness_diet_dataset1.csv  Training data for fuzzy matching (147KB)
```

---

## 4. Architecture Overview

```
Browser (React SPA — Vercel)
  ↓  Axios HTTP/JSON (URL hardcoded: https://my-fit-backend-2.onrender.com)
Django REST Framework (Render/Gunicorn)
  ↓  Django ORM
PostgreSQL (Neon)
```

**Auth flow**: localStorage → App.js (no Context, no Redux)

**Inter-component data**: `Calculate_BMI.js` writes `bmi/bmr/calories/vegOnly` to localStorage; `Predict.js` reads them.

**CRITICAL**: No server-side auth on any endpoint. All API endpoints publicly accessible.

---

## 5. All URL Routes

### Frontend Routes (React Router)

| Path | Component | Auth Required |
|---|---|---|
| `/` | Home + About + Feature + Footer | No |
| `/directory` | Directory + Footer | No |
| `/login` | Login | No |
| `/signup` | Signup | No |
| `/userform` | Userdata (BROKEN) | No |
| `/calculate_bmi` | Calculate_BMI | Yes (client-side redirect) |
| `/predict` | Predict | No |
| `/payment` | CheckoutForm | No |
| `/abs` through `/triceps` (16 routes) | Body-part pages | No |
| `/about` | About | No |

**MISSING ROUTE**: `/diet` — linked from `Calculate_BMI.js:376` but not defined. Causes blank page.

### Backend API Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | None | Welcome/health |
| GET | `/health/` | None | Health check for UptimeRobot |
| POST | `/app/register/` | None | Create user account |
| POST | `/app/login/` | None | Login, returns JWT |
| POST | `/app/user_details/` | None | Store user metrics |
| POST | `/app/fetch_user_details/` | None | Get user metrics by username |
| POST | `/app/create-order/` | None | Create Razorpay order |
| POST | `/app/verify-payment/` | None | Verify payment, set premium |
| POST | `/app/predict/` | None | ML diet recommendation |

---

## 6. Database Architecture

### Models

**`app.User`** (Django table: `app_user`):
- Extends `AbstractUser`
- Extra field: `isPremiumUser: BooleanField(default=False)`
- Custom `UserManager` with `create_user` and `create_superuser`

**`app.User_details`** (Django table: `app_user_details`):
- `id` (BigAutoField PK)
- `username` (CharField — **NOT a FK to User**)
- `height` (IntegerField, cm)
- `weight` (IntegerField, kg)
- `age` (IntegerField)
- `gender` (CharField)
- `bmi` (DecimalField, decimal_places=2, max_digits=1000)
- `bmr` (DecimalField, decimal_places=2, max_digits=1000)
- `food_type` (CharField)

**Referential integrity gap**: `User_details.username` is a plain string, not a FK. Deleting a `User` does NOT cascade to their details.

### Migrations

One migration: `0001_initial.py` (created 2024-09-19). Creates both tables.

### Data That Does NOT Exist in DB

- Exercises (hardcoded in components)
- Workout plans, sessions, sets, reps
- Diet plan history (computed on-demand, never saved)
- Goals, measurements, progress, nutrition logs

---

## 7. Authentication & Authorization

### Auth Flow

```
Signup: POST /app/register/ {username, email, password}
  → User.objects.create_user()
  → RefreshToken.for_user(user)
  → Returns: {access_token, refresh_token}
  → Frontend: stores to localStorage

Login: POST /app/login/ {username, password}
  → authenticate(request, username, password)
  → RefreshToken.for_user(user)
  → Returns: {status, username, email, isPremiumUser, access_token, refresh_token}
  → Frontend: stores all to localStorage
```

### JWT Config

- Library: `djangorestframework-simplejwt`
- No custom JWT settings in `settings.py` → uses defaults
- Access token TTL: **5 minutes** (simplejwt default)
- Refresh token TTL: **1 day** (simplejwt default)
- **Token refresh NOT implemented on frontend** — users silently logged out after 5 min

### localStorage Keys (Frontend)

| Key | Set by | Read by | Notes |
|---|---|---|---|
| `access_token` | Login.js | App.js, Calculate_BMI.js | JWT |
| `refresh_token` | Login.js | Nowhere (unused) | Never used for refresh |
| `username` | Login.js | Multiple components | |
| `email` | Login.js | CheckoutForm.js | |
| `isPremiumUser` | Login.js, CheckoutForm.js | App.js reads `ispremiumuser` | **CASE BUG** |
| `bmi` | Calculate_BMI.js | Predict.js | Inter-component data |
| `bmr` | Calculate_BMI.js | Predict.js | |
| `calories` | Calculate_BMI.js | Predict.js | |
| `vegOnly` | Calculate_BMI.js | Predict.js | |

---

## 8. API Details

### POST /app/register/
```json
Request: { "username": "john", "email": "j@e.com", "password": "secret", "isPremiumUser": false }
Response 200: { "status": "success", "message": "...", "access_token": "...", "refresh_token": "..." }
Response 400: { "status": "error/exception_message", "message": "..." }
```

### POST /app/login/
```json
Request: { "username": "john", "password": "secret" }
Response 200: { "status": "success", "username": "john", "email": "j@e.com", "isPremiumUser": false, "access_token": "...", "refresh_token": "..." }
Response 401: { "status": "error", "message": "Invalid credentials" }
```

### POST /app/predict/
```json
Request: { "BMI": 25.0, "BMR": 1800.0, "Total_Calories": 2300.0, "veg_only": false }
Response 200: {
  "Breakfast 1": "Oats with Milk",
  "Breakfast 2": "Banana",
  "Lunch 1": "Brown Rice with Dal",
  "Lunch 2": "Green Salad",
  "Dinner 1": "Grilled Chicken",
  "Dinner 2": "Mixed Vegetables",
  "Food Type": "Non-Veg",
  "Total Calories": 2250.5
}
Response 400: { "error": "missing field description" }
```

### POST /app/create-order/
```json
Request: { "amount": "2000" }
Response 200: { "order_id": "order_xxx", "amount": "2000", "currency": "INR", "key": "rzp_test_..." }
```

### POST /app/verify-payment/
```json
Request: { "razorpay_payment_id": "...", "razorpay_order_id": "...", "razorpay_signature": "...", "username": "john" }
Response 200: { "verified": true }
Response 400: { "verified": false }
```

---

## 9. ML Diet Recommendation System

**Location**: `backend/app/ml_utils.py`, `backend/app/ml_models/`

**Class**: `DietRecommendationModel`

**Process**:
1. Loads `diet_recommendation_model3.joblib` — a list of 7 scikit-learn Random Forest classifiers:
   `[rf_breakfast1, rf_breakfast2, rf_lunch1, rf_lunch2, rf_dinner1, rf_dinner2, rf_foodtype]`
2. Loads `label_encoders3.joblib` — dict of LabelEncoders keyed by meal slot name
3. Loads `updated_fitness_diet_dataset1.csv` — 147KB training dataset for fuzzy matching
4. Input features: `BMI`, `BMR`, `Total_Calories`
5. Each classifier predicts the encoded meal label for its slot
6. If `veg_only=True`, filters dataset to vegetarian rows before matching
7. Finds the dataset row with minimum sum of absolute differences from predicted encodings
8. Decodes the closest match back to food names
9. Returns 6 meal items + food type + total calories

**PERFORMANCE BUG**: The model is instantiated fresh on every request, loading all 3 files from disk each time. Fix: cache as module-level singleton.

---

## 10. Feature Inventory & Status

### ✅ WORKING

| Feature | Key Files |
|---|---|
| 2-sec loading splash | `LoadingScreen.js`, `App.js` |
| Home image carousel | `Home.js` (Swiper, 3 slides, 2s autoplay) |
| About section | `About.js` (lorem ipsum content) |
| Membership tier cards | `Feature.js` (display only, buttons non-functional) |
| Footer | `Footer.js` |
| SVG body map exercise directory | `Directory.js` |
| 16 body-part exercise detail pages | `Body-parts/*.js` (2 exercises, 4 videos each) |
| User registration | `Signup.js` → `/app/register/` |
| Diet ML recommendation | `Predict.js` → `/app/predict/` → `ml_utils.py` |

### ⚠️ PARTIALLY WORKING

| Feature | Problem | Fix |
|---|---|---|
| User login | Username input binds to `formData.email` | Change `value={formData.email}` to `value={formData.username}` in Login.js:74 |
| BMI/BMR calculator | Diet plan link goes to `/diet` (missing route) | Change `to="/diet"` to `to="/predict"` in Calculate_BMI.js:376 |
| Logout | Removes `token` key but stored as `access_token` | Fix `removeItem("token")` → `removeItem("access_token")` in App.js:446 |
| Razorpay premium | Test mode only; localStorage key case mismatch | Standardise `isPremiumUser` vs `ispremiumuser` |

### ❌ BROKEN / ABSENT

| Feature | Status | Notes |
|---|---|---|
| User details form | BROKEN | Userdata.js posts to localhost:8000 |
| Token refresh | ABSENT | 5-min JWT expires silently |
| Server-side premium gate | ABSENT | /app/predict/ is public |
| Password reset | ABSENT | Not implemented |
| Profile page | ABSENT | Not implemented |
| Dashboard/Analytics | ABSENT | Not implemented |
| Workout tracking | ABSENT | Listed in marketing but not built |
| Social features | ABSENT | Not planned |

---

## 11. Known Bugs (with Fixes)

### BUG-001 [HIGH] — Diet link broken
- **File**: `Calculate_BMI.js:376`
- **Problem**: `<Link to="/diet">` — route `/diet` does not exist
- **Fix**: Change to `to="/predict"`

### BUG-002 [HIGH] — Premium status lost on refresh
- **Files**: `Login.js:40` stores `isPremiumUser`, `App.js:437` reads `ispremiumuser`
- **Fix**: Standardise key to lowercase `ispremiumuser` everywhere

### BUG-003 [MEDIUM] — Login username input bound to email state
- **File**: `Login.js:74`
- **Problem**: `value={formData.email}` on username field
- **Fix**: Change to `value={formData.username}`

### BUG-004 [MEDIUM] — Logout doesn't clear JWT
- **File**: `App.js:446`
- **Problem**: `localStorage.removeItem("token")` but key is `access_token`
- **Fix**: Change to `removeItem("access_token")`

### BUG-005 [HIGH] — Userdata.js production URL
- **File**: `Userdata.js:30`
- **Problem**: `axios.post('http://localhost:8000/user_details/', ...)` — fails in production
- **Note**: Component not routed currently (dormant bug)

### BUG-006 [CRITICAL/SECURITY] — Razorpay secret in frontend
- **File**: `Payment.js:41-42`
- **Problem**: Razorpay test `key_secret` hardcoded in client-side JavaScript
- **Fix**: Delete `Payment.js` (it is dead code) or remove the secret value

### BUG-007 [LOW] — Broken test
- **File**: `App.test.js`
- **Problem**: Looks for "learn react" text (CRA boilerplate) — always fails
- **Fix**: Rewrite or delete

### BUG-008 [LOW] — Duplicate navbar element
- **File**: `App.js:598`
- **Problem**: Empty `<nav className="navbar1"></nav>` after the header
- **Fix**: Remove the empty nav element

---

## 12. Technical Debt

### TD-001 — Hardcoded backend URL
All components use literal `"https://my-fit-backend-2.onrender.com"`.
**Files**: `Login.js`, `Signup.js`, `Predict.js`, `CheckoutForm.js`
**Fix**: Create `frontend/.env` with `REACT_APP_API_URL=https://my-fit-backend-2.onrender.com`

### TD-002 — No API client abstraction
Each component calls Axios directly. No interceptors, no auth token injection, no error handling.
**Fix**: Create `frontend/src/services/api.js` with Axios instance

### TD-003 — No state management
Auth reconstructed from localStorage on every component mount. `user` and `username` are duplicated states.
**Fix**: React Context or Zustand for auth state

### TD-004 — CSS chaos
400+ lines of CSS defined as styled-components `GlobalStyle` inside `App` function. Plus inline styles, `<style jsx>` blocks, and 4 separate CSS files. No design system.

### TD-005 — Directory.js is 139KB
All SVG coordinate data inline in JSX. Unmaintainable and slow to load.
**Fix**: Extract SVG data to separate JSON/SVG file

### TD-006 — ML model not cached
`DietRecommendationModel` instantiated on every request (loads 3 files from disk).
**Fix**: Module-level singleton in `ml_utils.py`

### TD-007 — User_details lacks FK to User
`username` string links records with no referential integrity.
**Fix**: Add `ForeignKey(User, on_delete=models.CASCADE)` and migrate

### TD-008 — Tailwind installed but unused
Added to `devDependencies` and configured but zero utility classes used anywhere.

### TD-009 — No rate limiting
Login endpoint has no throttling — susceptible to brute force.

### TD-010 — Vendored Swiper duplicates npm package
Both `swiper-bundle.min.css/js` files in `src/` AND npm `swiper` installed. Only npm version is imported.

---

## 13. Security Findings

### SEC-001 [CRITICAL] — Razorpay secret in frontend source
`Payment.js:42` — `key_secret` hardcoded. Dead code but secret is in repo.

### SEC-002 [HIGH] — All API endpoints unauthenticated
`/app/predict/`, `/app/create-order/`, `/app/verify-payment/`, `/app/fetch_user_details/` require no JWT.

### SEC-003 [HIGH] — Anyone can set any user as premium
`VerifyPaymentView` accepts `username` in request body and sets that user as premium after payment verification. No check that the paying user is the one being upgraded.

### SEC-004 [MEDIUM] — CORS allows all origins
`CORS_ALLOW_ALL_ORIGINS = True` in `settings.py`. Should be restricted to Vercel domain.

### SEC-005 [MEDIUM] — No login rate limiting
Brute force attack is possible on `/app/login/`.

### SEC-006 [MEDIUM] — CSRF exempt on auth endpoints
`@csrf_exempt` on `signup_view`, `login_view`. Acceptable for JWT-based REST but combined with wide CORS broadens attack surface.

### SEC-007 [LOW-MEDIUM] — JWTs in localStorage
Vulnerable to XSS. HttpOnly cookies would be more secure.

### SEC-008 [LOW] — Diet prediction not gated server-side
`/app/predict/` is fully public. Premium is only a frontend UI concept.

---

## 14. Performance Findings

### PERF-001 — ML model loads from disk on every request
3 files loaded per prediction request (45KB + 1.4KB + 147KB). Fix: module-level singleton.

### PERF-002 — Render free tier cold starts
Backend sleeps after 15 min idle. First request takes 30-60s. Health endpoint exists for UptimeRobot.

### PERF-003 — Huge static images
`about-img.jpg` = 12MB, `home-bg-1.jpg` = 4.5MB, `home-bg-2.jpg` = 11.6MB. No compression, no WebP, no lazy loading.

### PERF-004 — 62 MP4 exercise videos auto-play
All videos on a body-part page auto-play on load. No lazy loading or poster images.

### PERF-005 — Directory.js is 139KB JS
Single large file takes time to parse on low-end devices.

---

## 15. Dead / Unused Code

| File | Reason |
|---|---|
| `Payment.js` | Imported in App.js but no route — dead code with hardcoded secrets |
| `form.js` | No imports, no content |
| `Userdata.js` | Routed at `/userform` but broken (localhost:8000) |
| `profile.css` | Not imported anywhere |
| `DietPage.css` | Not imported anywhere |
| `swiper-bundle.min.css/js` | Vendored; npm Swiper used instead |
| `backend/app/tests.py` | Empty file |
| `serializers.py::UserSerializer` | Defined but never used in views |
| `serializers.py::LoginSerializer` | Defined but never used in views |

---

## 16. External Services

| Service | Purpose | Notes |
|---|---|---|
| Neon | PostgreSQL hosting | Serverless, connected via DATABASE_URL |
| Render | Django backend hosting | Free tier — cold starts after idle |
| Vercel | React frontend hosting | vercel.json configured for SPA routing |
| Razorpay | Payment gateway | Test environment (`rzp_test_` keys) |

---

## 17. Environment Variables

**Backend** (`.env` file required in `backend/`):

| Variable | Purpose |
|---|---|
| `DJANGO_SECRET_KEY` | Django signing key — keep secret |
| `DEBUG` | Boolean, set False in production |
| `DATABASE_URL` | Full PostgreSQL connection URL |
| `RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Razorpay private key — NEVER in frontend |

**Frontend**: No `.env` file exists. All URLs hardcoded. Create `frontend/.env` with `REACT_APP_API_URL=...` to fix TD-001.

---

## 18. Build & Run Instructions

### Frontend (Development)
```bash
cd frontend
npm install
npm start    # runs on http://localhost:3000
# NOTE: API calls go to https://my-fit-backend-2.onrender.com (hardcoded)
# To use local backend, find/replace the URL in all components
```

### Frontend (Production)
```bash
cd frontend
npm run build   # outputs to frontend/build/
# Deploy build/ to Vercel
```

### Backend (Development)
```bash
cd backend
# Create .env file with variables from Section 17
# Fix requirements.txt encoding if needed:
iconv -f UTF-16 -t UTF-8 requirements.txt > req_utf8.txt
pip install -r req_utf8.txt
python manage.py migrate   # runs 0001_initial.py
python manage.py runserver
```

### Backend (Production)
```bash
gunicorn backend.wsgi:application
# Render.com handles this automatically
```

---

## 19. Development Conventions (Observed)

### Frontend
- Components: PascalCase filenames matching export name
- Styling: No single approach — mix of GlobalStyle, inline styles, `<style jsx>`, external CSS
- API calls: Axios directly in component handlers (no service layer)
- State: All local `useState` — no shared state solution

### Backend
- Function views: `snake_case`, decorated with `@csrf_exempt` or `@api_view`
- Class views: PascalCase, extend `APIView`
- No `_description` on models (not required by Django)
- No consistent use of serializers for auth views (raw `json.loads`)

---

## 20. Important Dependencies (Versions)

### Frontend

```json
{
  "react": "^18.3.1",
  "axios": "^1.7.7",
  "bootstrap": "^5.3.3",
  "styled-components": "^6.1.12",
  "swiper": "^11.1.9",
  "react-scripts": "5.0.1",
  "react-router-dom": "^6.26.1",  (devDependencies)
  "tailwindcss": "^3.4.14"        (devDependencies — not used)
}
```

### Backend (key packages)

```
Django==5.1.2
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.5.0
scikit-learn==1.5.1
joblib==1.4.2
pandas==2.2.2
numpy==2.1.0
razorpay==1.4.2
psycopg2==2.9.10
gunicorn==23.0.0
whitenoise==6.7.0
django-environ==0.11.2
```

---

## 21. Future Development Considerations

1. **Fix BUG-001 first** (diet link) — it breaks the most visible user journey
2. **Centralise API URL** before adding any new API features
3. **ML model caching** before any traffic increase
4. **Server-side premium gate** before taking Razorpay live
5. **Token refresh** before any authenticated API features
6. **User_details FK migration** before building profile features
7. **Do NOT retrain the ML model** without updating both `.joblib` files atomically — they must stay in sync
8. **Exercise content** is hardcoded — build an `Exercise` model if you need admin-editable content
9. **Workout tracking** features (listed in premium marketing) are completely absent — largest gap

### Recommended Priority Order for Fixes

1. BUG-001: Fix `/diet` → `/predict` link
2. BUG-002 + BUG-004: Fix localStorage key case inconsistency + logout
3. BUG-003: Fix login username input binding
4. SEC-001: Remove `Payment.js` (dead code with secrets)
5. TD-001: Centralise backend URL to `.env`
6. TD-006: Cache ML model at startup
7. SEC-002: Add `IsAuthenticated` to predict endpoint
8. SEC-004: Restrict CORS to Vercel domain
9. SEC-005: Add login rate throttling
10. Build workout tracking features

---

*Document generated: 2026-09-23 | Repository: Aagam191/Fitness-Buddy | App: MyFit*

---

## 22. npm Dependency Audit Results

**Command run**: `cd frontend && npm audit`
**Date**: 2026-09-23

### Summary

```
90 vulnerabilities total
  18 low
  21 moderate
  46 high
  5 critical
```

### Notable Vulnerabilities

| Package | Issue | Severity |
|---|---|---|
| `axios` 1.7.7 | SSRF via `no_proxy` IP alias bypass ([GHSA-m7pr-hjqh-92cm](https://github.com/advisories/GHSA-m7pr-hjqh-92cm)) | HIGH |
| `axios` 1.7.7 | Prototype pollution / credential injection in HTTP adapter ([GHSA-q8qp-cvcw-x6jj](https://github.com/advisories/GHSA-q8qp-cvcw-x6jj)) | HIGH |
| `ws` (webpack-dev-server) | Memory exhaustion DoS from tiny fragments ([GHSA-96hv-2xvq-fx4p](https://github.com/advisories/GHSA-96hv-2xvq-fx4p)) | — |
| `yaml` (postcss-load-config) | Stack overflow via deeply nested YAML ([GHSA-48c2-rrv3-qjmp](https://github.com/advisories/GHSA-48c2-rrv3-qjmp)) | MODERATE |
| `@tootallnate/once` | Incorrect control flow scoping ([GHSA-vpq2-c234-7xj6](https://github.com/advisories/GHSA-vpq2-c234-7xj6)) | MODERATE |

### Notes

- Most of the 90 vulnerabilities are transitive — they originate from `react-scripts` (CRA's build toolchain), which is a known issue with Create React App. CRA is no longer actively maintained and its dependency tree has accumulated many advisories. These primarily affect the **build-time dev server**, not the production bundle served to users.
- The **Axios vulnerability** (SSRF + prototype pollution) is in the runtime dependency directly used by the application for all API calls. This should be upgraded.
- Run `npm audit fix` to fix non-breaking issues. Some fixes require `--force` (breaking changes). **Do not run `--force` without understanding the impact** — it may upgrade `react-scripts` or Axios in breaking ways.
- Long-term fix: Migrate from Create React App to Vite (actively maintained, much smaller dependency tree).

---

## 23. Phase 1 & Phase 2 Architecture & Modernization Log

### Phase 1: Stabilization & Fixes (Completed)
- **Dead Code Cleaned**: Removed obsolete `Payment.js` (with hardcoded secrets), `form.js`, `profile.css`, `DietPage.css`, and duplicate swiper assets.
- **Route /diet Fix**: Fixed route link in `Calculate_BMI.js` to `/predict`.
- **API Client Centralized**: Created `frontend/src/services/api.js` with Axios interceptors attaching JWT Bearer tokens and dynamic `VITE_API_BASE_URL`.
- **Secret & Payment Security**: Removed Razorpay secret key from client side. `VerifyPaymentView` strictly uses `request.user` to upgrade premium status instead of arbitrary body strings.
- **Model In-Memory Caching**: Refactored `ml_utils.py` into a thread-safe singleton cache so `DietRecommendationModel` is only loaded once, eliminating disk I/O per request.
- **Backend Permissions**: Secured protected endpoints (`/app/order/`, `/app/verify/`, `/app/user/`, `/app/predict/`) with DRF `IsAuthenticated`.
- **Database Relations**: Added nullable foreign key `user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)` to `User_details` (migration `0002_user_details_user.py`).

### Phase 2: Build Modernization & 3-Tier Architecture (Completed)
- **Vite Build Tooling**:
  - Replaced Create React App (`react-scripts`) with **Vite 5.4**.
  - Production build drops from CRA minutes to **2.2 seconds** (`npm run build`).
  - Added custom JSX loader for `.js` files using `transformWithEsbuild`.
  - Configured dev and preview servers to port **3001** (`npm run dev`).
  - Added `tailwind.config.js` and updated PostCSS configs.
- **AuthContext State Management**:
  - Created `frontend/src/context/AuthContext.js` (`AuthProvider`, `useAuth()`).
  - Centralized login, registration, logout, and token synchronization across `App.js`, `Login.js`, `Signup.js`, `Calculate_BMI.js`, `Predict.js`, and `CheckoutForm.js`.
  - Prop drilling (`data`, `setData`) completely eradicated.
- **Backend 3-Tier Domain Service Layer**:
  - Structured `backend/app/services/`:
    - `AuthService`: User registration, authentication, and JWT token issuance.
    - `DietService`: Diet plan calculation and ML model execution.
    - `PaymentService`: Razorpay order creation and payment signature verification + entitlement.
    - `ProfileService`: User fitness metrics persistence and retrieval.
  - Slimmed `backend/app/views.py` into thin controllers delegating exclusively to domain services.
- **Test Automation**:
  - Modernized frontend test runner with **Vitest + jsdom** (`npm test`): **7 / 7 tests passing in < 2s**.
  - Django test suite (`./venv/bin/python manage.py test app`): **13 / 13 tests passing**.

### Phase 3: Content Dynamicization & UI Consolidation (Completed)
- **Database-Backed Exercise Catalog**:
  - Created `Exercise` model with body part indexing, video paths, execution cues, and difficulty ratings.
  - Built `ExerciseService` (`get_exercises_by_body_part`, `get_all_exercises`) and `GET /app/exercises/` endpoint.
  - Extracted 31 exercises from the monolithic JSX pages and seeded into DB via `seed_exercises` management command.
  - Created offline fallback bundle `frontend/src/data/exercises.json`.
- **Dynamic Frontend Architecture (`<BodyPartView />`)**:
  - Replaced 15 duplicate components in `src/Body-parts/` with a unified, dynamic `<BodyPartView />` component.
  - Supports dynamic URL route `/exercises/:bodyPart` and backwards-compatible routes (`/abs`, `/biceps`, etc.).
  - Added horizontal muscle pills switcher for rapid switching between muscle groups without returning to Directory.
  - Deleted obsolete `frontend/src/Body-parts/` directory, saving 50KB+ bundle weight.
- **Webhook-Driven Payment Verification**:
  - Implemented `POST /app/payment/webhook/` with Razorpay HMAC-SHA256 signature verification.
  - Created `PaymentTransaction` model for audit trail of order IDs, payment IDs, amounts, and statuses.

### Phase 4: Product Expansion — Workouts & Analytics (Completed)
- **Workout Logging & Overload Engine**:
  - Created `WorkoutLog` and `WorkoutSet` models for relational exercise logging.
  - Implemented `WorkoutService` and REST endpoints: `GET /app/workouts/`, `POST /app/workouts/`, `DELETE /app/workouts/<id>/`.
  - Built interactive `<WorkoutLogger />` component (`/workouts`) with dynamic multi-set builder and session history.
- **Athlete Progress Dashboard & Diet History**:
  - Created `DietPlanHistory` model preserving generated diet recommendations.
  - Implemented `AnalyticsService` and `GET /app/dashboard/` returning profile BMI/BMR trends, lifting stats, and diet records.
  - Built modern `<Dashboard />` component (`/dashboard`) with visual stat cards, membership status badge, and quick actions.
  - Enhanced `<Predict />` with one-click "Save Diet Plan to Dashboard" integration.
- **Full Verification**:
  - Django test suite: **17 / 17 tests passing**.
  - Vitest test suite: **12 / 12 tests passing**.
  - Vite production build: **1.67s** compile time with zero errors.




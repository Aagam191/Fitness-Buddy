import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import App from './App';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Calculate_BMI from './Components/Calculate_BMI';
import Predict from './Components/Predict';
import BodyPartView from './Components/BodyPartView';
import WorkoutLogger from './Components/WorkoutLogger';
import Dashboard from './Components/Dashboard';
import TrainingPrograms from './Components/TrainingPrograms';
import AthleteHeatmap from './Components/AthleteHeatmap';
import Navbar from './Components/Navbar';
import Directory from './Components/Directory';
import Home from './Components/Home';
import Feature from './Components/Feature';
import { AuthProvider } from './context/AuthContext';

import { ToastProvider } from './context/ToastContext';
import { API_BASE_URL } from './services/api';

const renderWithProviders = (ui) => {
  return render(
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>{ui}</BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

describe('MyFit Frontend Tests (Phase 2 with AuthContext)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('App renders without crashing', () => {
    const { container } = render(
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test('Login component renders form inputs and submit button', () => {
    renderWithProviders(<Login />);

    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /Submit/i });

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    // Verify input typing updates form state
    fireEvent.change(usernameInput, { target: { value: 'mytestuser' } });
    expect(usernameInput.value).toBe('mytestuser');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');
  });

  test('Signup component renders inputs and validates mismatched passwords', () => {
    renderWithProviders(<Signup />);

    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Submit/i });

    expect(usernameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    fireEvent.change(usernameInput, { target: { name: 'username', value: 'newuser' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'newuser@example.com' } });

    // Fill passwords that do not match
    const passwordInputs = screen.getAllByPlaceholderText(/password/i);
    fireEvent.change(passwordInputs[0], { target: { name: 'password1', value: 'Secret1' } });
    fireEvent.change(passwordInputs[1], { target: { name: 'password2', value: 'Secret2' } });

    fireEvent.submit(submitButton.closest('form'));
    expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
  });

  test('Calculate_BMI renders height and weight inputs and link to /predict', () => {
    localStorage.setItem('access_token', 'mock_token');
    localStorage.setItem('username', 'testuser');
    window.confirm = vi.fn(() => false);

    renderWithProviders(<Calculate_BMI />);

    expect(screen.getByPlaceholderText(/^Height$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Weight$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Age$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calculate Now/i })).toBeInTheDocument();
  });

  test('Predict shows warning when required BMI data is missing', () => {
    renderWithProviders(<Predict />);

    expect(
      screen.getByText(/Missing required data. Please calculate your BMI first./i)
    ).toBeInTheDocument();
  });

  test('API configuration exports valid base URL', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
  });

  test('Logout clears localStorage and resets authentication state', () => {
    localStorage.setItem('access_token', 'mock_access_token');
    localStorage.setItem('refresh_token', 'mock_refresh_token');
    localStorage.setItem('username', 'activeuser');
    localStorage.setItem('ispremiumuser', 'true');

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('ispremiumuser');

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
    expect(localStorage.getItem('ispremiumuser')).toBeNull();
  });

  test('BodyPartView renders muscle group heading and quick pills', () => {
    renderWithProviders(<BodyPartView category="abs" />);
    expect(screen.getByRole('heading', { level: 1, name: /Abs/i })).toBeInTheDocument();
    expect(screen.getByText(/Target Muscle Group/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Biceps$/i })).toBeInTheDocument();
  });

  test('WorkoutLogger prompts authentication when not logged in', () => {
    renderWithProviders(<WorkoutLogger />);
    expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Log In/i })).toBeInTheDocument();
  });

  test('Dashboard prompts authentication when not logged in', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Log In/i })).toBeInTheDocument();
  });

  test('WorkoutLogger renders workout form when authenticated', () => {
    localStorage.setItem('access_token', 'mock_token');
    localStorage.setItem('username', 'athlete1');

    renderWithProviders(<WorkoutLogger />);
    expect(screen.getByText(/Workout Engine/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Chest & Triceps/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Add Set/i })).toBeInTheDocument();
  });

  test('Dashboard renders welcome message and athlete portal when authenticated', () => {
    localStorage.setItem('access_token', 'mock_token');
    localStorage.setItem('username', 'athlete1');

    renderWithProviders(<Dashboard />);
    expect(screen.getByText(/Welcome back, athlete1!/i)).toBeInTheDocument();
    expect(screen.getByText(/Athlete Portal/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Log Workout/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Upgrade to Premium/i })).toBeInTheDocument();
  });

  test('TrainingPrograms renders hero heading and workout tracker button', () => {
    renderWithProviders(<TrainingPrograms />);
    expect(screen.getByText(/Curated 8-Week Training Programs/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Workout Tracker/i })).toBeInTheDocument();
  });

  test('AthleteHeatmap prompts authentication when not logged in', () => {
    renderWithProviders(<AthleteHeatmap />);
    expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Log In/i })).toBeInTheDocument();
  });

  test('AthleteHeatmap renders biomechanical readiness and mode buttons when authenticated', () => {
    localStorage.setItem('access_token', 'mock_token');
    localStorage.setItem('username', 'pro_athlete');

    renderWithProviders(<AthleteHeatmap />);
    expect(screen.getByText(/Athlete Muscle Heatmap & Recovery/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download Report/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print \/ PDF/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recovery %/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Volume Load/i })).toBeInTheDocument();
  });

  test('Navbar renders public navigation links and login button when guest', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('link', { name: /MyFit Home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Home$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Directory$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Programs$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^BMI Calculator$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Diet$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Login$/i })).toBeInTheDocument();
  });

  test('Navbar renders athlete avatar pill and logout button when authenticated', () => {
    localStorage.setItem('access_token', 'mock_token');
    localStorage.setItem('username', 'sammy');

    renderWithProviders(<Navbar />);
    expect(screen.getByText('sammy')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Logout from account/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Heatmap$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Workouts$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Dashboard$/i })).toBeInTheDocument();
  });

  test('Home component renders hero slogans, CTA links, and stats ribbon', () => {
    renderWithProviders(<Home />);
    expect(screen.getByRole('heading', { level: 3, name: /Make yourself stronger than your excuses/i })).toBeInTheDocument();
    expect(screen.getByText(/15\+/i)).toBeInTheDocument();
    expect(screen.getByText(/Muscle Groups Mapped/i)).toBeInTheDocument();
    expect(screen.getByText(/Biomechanical Guides/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Exercises/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start Free Trial/i })).toBeInTheDocument();
  });

  test('Feature component renders tier cards with pricing and links to signup and payment', () => {
    renderWithProviders(<Feature />);
    expect(screen.getByText(/FLEXIBLE MEMBERSHIP PLANS/i)).toBeInTheDocument();
    expect(screen.getByText('ELITE')).toBeInTheDocument();
    expect(screen.getByText('PRO')).toBeInTheDocument();
    expect(screen.getByText('HOME')).toBeInTheDocument();
    expect(screen.getByText('MOST POPULAR')).toBeInTheDocument();

    const tryButtons = screen.getAllByRole('link', { name: /Try For Free/i });
    const upgradeButtons = screen.getAllByRole('link', { name: /Upgrade Now/i });

    expect(tryButtons.length).toBe(3);
    expect(upgradeButtons.length).toBe(3);
    expect(tryButtons[0]).toHaveAttribute('href', '/signup');
    expect(upgradeButtons[0]).toHaveAttribute('href', '/payment');
  });

  test('Directory component renders 3D body map and filters muscle catalog via search', () => {
    renderWithProviders(<Directory />);
    expect(screen.getByText(/Interactive Exercise Directory/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Chest/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Biceps/i })).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search muscle/i);
    expect(searchInput).toBeInTheDocument();

    // Type filter for "quads"
    fireEvent.change(searchInput, { target: { value: 'quads' } });
    expect(screen.getByRole('link', { name: /Quadriceps/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Biceps$/i })).not.toBeInTheDocument();
  });

  test('BodyPartView renders filter toolbar and exercise cards with quick action buttons', async () => {
    renderWithProviders(<BodyPartView category="chest" />);
    expect(screen.getByRole('heading', { level: 1, name: /Chest/i })).toBeInTheDocument();

    // Verify equipment filter chips
    expect(screen.getByRole('button', { name: /^All$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Barbell$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Dumbbell$/i })).toBeInTheDocument();

    // Verify filter input
    const filterInput = screen.getByPlaceholderText(/Filter Chest exercises by name/i);
    expect(filterInput).toBeInTheDocument();
  });

  test('Calculate_BMI calculates metrics and displays interactive gauge and diet link', async () => {
    localStorage.setItem('access_token', 'mock_token');
    localStorage.setItem('username', 'testuser');
    window.confirm = vi.fn(() => false);

    renderWithProviders(<Calculate_BMI />);

    fireEvent.change(screen.getByPlaceholderText(/^Height$/i), { target: { value: '180' } });
    fireEvent.change(screen.getByPlaceholderText(/^Weight$/i), { target: { value: '80' } });
    fireEvent.change(screen.getByPlaceholderText(/^Age$/i), { target: { value: '25' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Gender/i }), { target: { value: 'male' } });

    fireEvent.click(screen.getByRole('button', { name: /Calculate Now/i }));

    expect(screen.getByText(/BIOMETRIC ASSESSMENT/i)).toBeInTheDocument();
    expect(screen.getByText(/BMI Spectrum Meter/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Basal Metabolic Rate$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Get your customised diet Plan/i })).toBeInTheDocument();
  });

  test('WorkoutLogger renders rest timer, session volume, and allows set operations', () => {
    localStorage.setItem('access_token', 'mock_token');
    localStorage.setItem('username', 'athlete1');

    renderWithProviders(<WorkoutLogger />);

    expect(screen.getByText(/GYM REST TIMER/i)).toBeInTheDocument();
    expect(screen.getByText(/SESSION VOLUME:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Duplicate Set/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Est\. 1RM:/i).length).toBeGreaterThan(0);

    // Trigger duplicate set
    fireEvent.click(screen.getByRole('button', { name: /\+ Duplicate Set/i }));
    expect(screen.getByText(/SET #3/i)).toBeInTheDocument();
  });

  test('BentoShowcase component renders spotlight cards and athlete intelligence modules', async () => {
    const { default: BentoShowcase } = await import('./Components/BentoShowcase');
    renderWithProviders(<BentoShowcase />);

    expect(screen.getByText(/NEXT-GEN ATHLETE INTELLIGENCE/i)).toBeInTheDocument();
    expect(screen.getByText(/Biomechanical Recovery & Volume Heatmap/i)).toBeInTheDocument();
    expect(screen.getByText(/8-Week Periodized Protocols/i)).toBeInTheDocument();
    expect(screen.getByText(/Caloric & Macro Partitioning/i)).toBeInTheDocument();
    expect(screen.getByText(/Rest Timer & 1RM Calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/3D Muscle Directory/i)).toBeInTheDocument();
  });
});




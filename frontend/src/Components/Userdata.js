import React, { useState } from 'react';
import { saveUserDetails } from '../services/api';
import { useToast } from '../context/ToastContext';

const CreateUser = () => {
  const { showSuccess, showError } = useToast();
  const [userData, setUserData] = useState({
    username: '',
    height: '',
    weight: '',
    age: '',
    gender: 'male',
    bmi: '',
    bmr: '',
    food_type: 'Veg'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUsername = localStorage.getItem('username') || '';
    const payload = {
      ...userData,
      username: currentUsername
    };
    try {
      setSubmitting(true);
      const response = await saveUserDetails(payload);
      showSuccess('User details saved successfully!');
    } catch (error) {
      console.error('There was an error creating the user:', error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to save user details';
      showError('Error: ' + errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-5 px-3" style={{ minHeight: '100vh', backgroundColor: '#000000', paddingTop: '100px' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <div
          className="p-5"
          style={{
            backgroundColor: '#111111',
            border: '1px solid rgba(255,255,255,0.08)',
            borderLeft: '5px solid #ff0000',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
          }}
        >
          <span className="badge-tag mb-2">ATHLETE PROFILE</span>
          <h1 className="hero-heading mt-2 mb-4" style={{ fontSize: '2.6rem' }}>
            Set User Metrics
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={userData.height}
                  onChange={handleChange}
                  placeholder="e.g. 175"
                  className="form-control"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={userData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 70"
                  className="form-control"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  name="age"
                  value={userData.age}
                  onChange={handleChange}
                  placeholder="e.g. 24"
                  className="form-control"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  value={userData.gender}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">BMI</label>
                <input
                  type="number"
                  name="bmi"
                  value={userData.bmi}
                  onChange={handleChange}
                  placeholder="Calculated BMI"
                  className="form-control"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">BMR (kcal/day)</label>
                <input
                  type="number"
                  name="bmr"
                  value={userData.bmr}
                  onChange={handleChange}
                  placeholder="Calculated BMR"
                  className="form-control"
                />
              </div>

              <div className="col-12">
                <label className="form-label">Dietary Preference</label>
                <select
                  name="food_type"
                  value={userData.food_type}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="Veg">Vegetarian</option>
                  <option value="Non-veg">Non-Vegetarian</option>
                </select>
              </div>

              <div className="col-12 mt-4">
                <button
                  type="submit"
                  className="btn1 w-100"
                  disabled={submitting}
                  style={{ padding: '1.2rem', fontSize: '1.6rem' }}
                >
                  {submitting ? 'Saving Metrics...' : 'Save Profile Metrics →'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;

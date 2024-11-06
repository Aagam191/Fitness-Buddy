import axios from 'axios';
import { useState } from 'react';

const CreateUser = () => {
  const [userData, setUserData] = useState({
    username: '',
    height: '',
    weight: '',
    age: '',
    gender: '',
    bmi: '',
    bmr: '',
    food_type: ''
  });

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       setUserData({
        ...userData , 
        username : localStorage.getItem('username')
       })  
      const response = await axios.post('http://localhost:8000/user_details/', userData);
      console.log('User created successfully:', response.data);
    } catch (error) {
      console.error('There was an error creating the user:', error);
    }
  };

  return (
    <div style={{color:"white"}}>
    <br/><br/><br/><br/><br/><br/>
    <form onSubmit={handleSubmit}>
      {/* <input type="text" name="username" value={userData.username} onChange={handleChange} placeholder="Username" /> */}
      <input type="number" name="height" value={userData.height} onChange={handleChange} placeholder="Height" />
      <input type="number" name="weight" value={userData.weight} onChange={handleChange} placeholder="Weight" />
      <input type="number" name="age" value={userData.age} onChange={handleChange} placeholder="Age" />
      <input type="text" name="gender" value={userData.gender} onChange={handleChange} placeholder="Gender" />
      <input type="number" name="bmi" value={userData.bmi} onChange={handleChange} placeholder="BMI" />
      <input type="number" name="bmr" value={userData.bmr} onChange={handleChange} placeholder="BMR" />
      {/* <label htmlFor='Veg' >Veg</label>  <input type="radio" name="food_type" value="Veg" id='Veg' onChange={handleChange} />
      <label htmlFor='Non-veg' >Non-veg</label> <input type="radio" name="food_type" value="Non-veg" id='Non-veg' onChange={handleChange} /> */}
      <input type='text' name='food_type' value={userData.food_type} placeholder='Food Type' onChange={handleChange} />
      {/* <label>
        Premium User:
        <input type="checkbox" name="is_premium" checked={userData.is_premium} onChange={(e) => setUserData({...userData, is_premium: e.target.checked})} />
      </label> */}
      <button type="submit">Create User</button>
    </form>
    </div>
  );
};

export default CreateUser;

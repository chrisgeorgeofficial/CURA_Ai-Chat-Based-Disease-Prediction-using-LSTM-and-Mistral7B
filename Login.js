import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      console.log('API Response:', response.data); // Log the response here
      const { token, name, userId } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('name', name);
      localStorage.setItem('userId', userId);
      navigate('/User');
    } catch (error) {
      console.log('Error:', error.response ? error.response.data : error.message);
      alert('Login failed');
    }
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#eef2f3',
  };

  const formStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: '30px',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  };

  const inputStyle = {
    width: '90%',
    padding: '12px',
    margin: '12px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    color: '#333',
  };

  const buttonStyle = {
    width: '90%',
    padding: '12px',
    marginTop: '20px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#4caf50',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  };

  const headingStyle = {
    fontSize: '24px',
    color: '#333',
    marginBottom: '20px',
  };

  const footerStyle = {
    marginTop: '15px',
    fontSize: '14px',
    color: '#666',
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={headingStyle}>Log In</h2>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Log In
        </button>
        <div style={footerStyle}>
          Don't have an account? <a href="/signup" style={{ color: '#007bff', textDecoration: 'none' }}>Sign Up</a>
        </div>
      </form>
    </div>
  );
};

export default Login;

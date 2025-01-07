import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/signup', formData);
      alert('Signup successful!');
      navigate('/Login');
    } catch (error) {
      alert('Signup failed');
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
        <h2 style={headingStyle}>Sign Up</h2>
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          style={inputStyle}
        />
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
          Sign Up
        </button>
        <div style={footerStyle}>
          Already have an account? <a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Log In</a>
        </div>
      </form>
    </div>
  );
};

export default Signup;

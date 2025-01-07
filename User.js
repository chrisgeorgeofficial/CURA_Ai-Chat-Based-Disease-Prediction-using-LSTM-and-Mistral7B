import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserPage = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [userFeedbacks, setUserFeedbacks] = useState([]);

  const userName = localStorage.getItem('name') || 'User';
  const userId = localStorage.getItem('userId');
  const initials = userName.slice(0, 2).toUpperCase();

  // Fetch user feedbacks on component load
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/feedbacks/${userId}`);
        setUserFeedbacks(response.data.feedbacks || []);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };

    if (userId) fetchFeedbacks();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleMenuClick = (option) => {
    setShowMenu(false);
    if (option === 'Logout') {
      handleLogout();
    } else if (option === 'My Feedbacks') {
      alert(JSON.stringify(userFeedbacks, null, 2)); // Example alert to show feedbacks
    } else {
      alert(`Navigating to ${option}...`);
    }
  };

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      alert('Feedback cannot be empty');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/feedback', {
        userId,
        feedback,
      });
      console.log('Feedback submission response:', response.data);
      alert('Your feedback has been submitted!');
      setFeedback('');
      setUserFeedbacks((prev) => [...prev, feedback]); // Update feedbacks locally
    } catch (error) {
      console.error('Error submitting feedback:', error.response || error.message);
      alert('Failed to submit feedback');
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9fafc',
    position: 'relative',
    padding: '20px',
  };

  const headerStyle = {
    fontSize: '20px',
    color: '#2c3e50',
    marginBottom: '20px',
  };

  const textAreaStyle = {
    width: '300px',
    height: '80px',
    marginBottom: '10px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    resize: 'none',
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#3498db',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  const buttonHoverStyle = {
    backgroundColor: '#2980b9',
  };

  const circleStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#3498db',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    transition: 'background-color 0.3s ease',
  };

  const menuStyle = {
    position: 'absolute',
    top: '80px',
    right: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    zIndex: 1,
  };

  const menuItemStyle = {
    padding: '15px 20px',
    color: '#2c3e50',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '16px',
    borderBottom: '1px solid #ecf0f1',
    transition: 'background-color 0.3s ease',
  };

  const menuItemHoverStyle = {
    backgroundColor: '#ecf0f1',
  };

  const lastMenuItemStyle = {
    borderBottom: 'none',
  };

  const menuOptions = ['My Appointments', 'History', 'Schedule Appointment', 'My Feedbacks', 'Logout'];

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>Welcome, {userName}!</header>
      <textarea
        style={textAreaStyle}
        placeholder="How do you feel?"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <button
        style={buttonStyle}
        onClick={handleFeedbackSubmit}
        onMouseEnter={(e) => (e.target.style.backgroundColor = buttonHoverStyle.backgroundColor)}
        onMouseLeave={(e) => (e.target.style.backgroundColor = buttonStyle.backgroundColor)}
      >
        Enter
      </button>
      <div
        style={{
          ...circleStyle,
          ...(showMenu ? { backgroundColor: '#2980b9' } : {}),
        }}
        onClick={toggleMenu}
      >
        {initials}
      </div>
      {showMenu && (
        <div style={menuStyle}>
          {menuOptions.map((option, index) => (
            <div
              key={option}
              style={{
                ...menuItemStyle,
                ...(index === menuOptions.length - 1 ? lastMenuItemStyle : {}),
              }}
              onClick={() => handleMenuClick(option)}
              onMouseEnter={(e) => (e.target.style.backgroundColor = menuItemHoverStyle.backgroundColor)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '')}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPage;

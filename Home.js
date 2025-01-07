// client/src/components/Home.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using React Router

const Home = () => {
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleMouseEnter = (link) => {
    setHoveredLink(link);
  };

  const handleMouseLeave = () => {
    setHoveredLink(null);
  };

  return (
    <div style={styles.container}>
          <h1 style={styles.title}>Welcome to the CURA GPT</h1>
          <h2>Your perfect healthcare partner</h2>
      <div style={styles.links}>
        <Link
          to="/login"
          style={{
            ...styles.link,
            color: hoveredLink === 'login' ? '#0056b3' : '#007bff',
          }}
          onMouseEnter={() => handleMouseEnter('login')}
          onMouseLeave={handleMouseLeave}
        >
          Login
        </Link>
        <Link
          to="/signup"
          style={{
            ...styles.link,
            color: hoveredLink === 'signup' ? '#0056b3' : '#007bff',
          }}
          onMouseEnter={() => handleMouseEnter('signup')}
          onMouseLeave={handleMouseLeave}
        >
          Signup
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa', // Light background color
  },
  title: {
    fontSize: '2.5rem', // Large title font size
    color: '#333', // Dark text color
    marginBottom: '20px', // Space below the title
  },
  links: {
    display: 'flex',
    gap: '20px', // Space between links
  },
  link: {
    textDecoration: 'none', // No underline for links
    fontSize: '1.5rem', // Font size for links
    fontWeight: 'bold', // Bold text
    transition: 'color 0.3s ease', // Smooth transition for hover
  },
};

export default Home;

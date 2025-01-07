// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import User from './components/User';

const App = () => {
  return (
    <Router>
      <div style={styles.app}>
        <nav style={styles.nav}>
          <a href="/" style={styles.navLink}>Home</a>
          <a href="/login" style={styles.navLink}>Login</a>
          <a href="/signup" style={styles.navLink}>Signup</a>
          
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </div>
    </Router>
  );
};

const styles = {
  app: {
    textAlign: 'center',
  },
  nav: {
    margin: '20px',
  },
  navLink: {
    margin: '0 15px',
    textDecoration: 'none',
    color: '#333',
  },
};

export default App;

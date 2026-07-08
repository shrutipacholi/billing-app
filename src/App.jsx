import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import { getSessionUser } from './utils/auth';
import './App.css';

export default function App() {
  const [page, setPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if session user already exists
  useEffect(() => {
    const sessionUser = getSessionUser();
    if (sessionUser) {
      setCurrentUser(sessionUser);
      setPage('dashboard');
    } else {
      setPage('login');
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage('login');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-secondary)'
      }}>
        Loading BillCraft...
      </div>
    );
  }

  // Render Page Based on State
  switch (page) {
    case 'signup':
      return <SignUp onNavigate={setPage} onAuthSuccess={handleAuthSuccess} />;
    case 'dashboard':
      return <Dashboard user={currentUser} onLogout={handleLogout} />;
    case 'login':
    default:
      return <Login onNavigate={setPage} onAuthSuccess={handleAuthSuccess} />;
  }
}

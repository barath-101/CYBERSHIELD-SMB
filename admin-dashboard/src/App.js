import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Users from './pages/Users';
import Settings from './pages/Settings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0B61A4',
    },
    secondary: {
      main: '#19A974',
    },
    error: {
      main: '#E53E3E',
    },
    warning: {
      main: '#F6A623',
    },
    background: {
      default: '#F7FAFC',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/events" 
            element={
              isAuthenticated ? <Events onLogout={handleLogout} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/users" 
            element={
              isAuthenticated ? <Users onLogout={handleLogout} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/settings" 
            element={
              isAuthenticated ? <Settings onLogout={handleLogout} /> : <Navigate to="/login" />
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Listen for changes to admin_token in localStorage (e.g., when admin logs in via user login)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedToken = localStorage.getItem('admin_token');
      if (storedToken !== token) {
        setToken(storedToken);
      }
    };

    // Check for token changes periodically (for same-tab updates)
    const interval = setInterval(handleStorageChange, 500);
    
    // Also listen for storage events (for cross-tab updates)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAdminProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchAdminProfile = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAdmin(data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('admin_token', data.access_token);
        setToken(data.access_token);
        setAdmin(data.admin);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
  };

  const value = {
    admin,
    token,
    loading,
    isAuthenticated: !!admin,
    login,
    logout,
    BACKEND_URL
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

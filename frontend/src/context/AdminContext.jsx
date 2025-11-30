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
    let response;
    try {
      response = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
    } catch (error) {
      console.error('Admin login fetch error:', error);
      return { success: false, error: 'Unable to connect to server. Please check your connection.' };
    }

    try {
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('admin_token', data.access_token);
        setToken(data.access_token);
        setAdmin(data.admin);
        return { success: true };
      } else {
        const errorMessage = data.detail || 'Invalid credentials. Please try again.';
        return { success: false, error: errorMessage };
      }
    } catch (parseError) {
      console.error('Response parse error:', parseError);
      if (response.status === 404) {
        return { success: false, error: 'Admin email not found. Please check your email.' };
      } else if (response.status === 401) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      } else if (response.status >= 500) {
        return { success: false, error: 'Server error. Please try again later.' };
      }
      return { success: false, error: 'Invalid credentials. Please try again.' };
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

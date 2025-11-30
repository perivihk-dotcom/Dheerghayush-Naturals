import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('user_token'));
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    let response;
    try {
      response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
    } catch (error) {
      console.error('Login fetch error:', error);
      return { success: false, error: 'Unable to connect to server. Please check your connection.' };
    }

    try {
      const data = await response.json();

      if (response.ok) {
        // Check if user is an admin
        if (data.user && data.user.is_admin) {
          // Store admin token and redirect to admin panel
          localStorage.setItem('admin_token', data.access_token);
          return { success: true, isAdmin: true, redirectTo: '/admin/dashboard' };
        }
        
        localStorage.setItem('user_token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        return { success: true, isAdmin: false };
      } else {
        // Return specific error message from backend
        const errorMessage = data.detail || 'Invalid credentials. Please try again.';
        return { success: false, error: errorMessage };
      }
    } catch (parseError) {
      console.error('Response parse error:', parseError);
      // Fallback error messages based on status code
      if (response.status === 404) {
        return { success: false, error: 'Email not found. Please check your email or sign up.' };
      } else if (response.status === 401) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      } else if (response.status >= 500) {
        return { success: false, error: 'Server error. Please try again later.' };
      }
      return { success: false, error: 'Invalid credentials. Please try again.' };
    }
  };

  const signup = async (name, email, phone, password) => {
    let response;
    try {
      response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, password })
      });
    } catch (error) {
      console.error('Signup fetch error:', error);
      return { success: false, error: 'Unable to connect to server. Please check your connection.' };
    }

    try {
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user_token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        return { success: true };
      } else {
        const errorMessage = data.detail || 'Signup failed. Please try again.';
        return { success: false, error: errorMessage };
      }
    } catch (parseError) {
      console.error('Response parse error:', parseError);
      if (response.status === 400) {
        return { success: false, error: 'Email or phone number already registered.' };
      }
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    BACKEND_URL
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

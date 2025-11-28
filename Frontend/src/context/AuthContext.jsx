import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, setAuthToken, setUser as saveUser, getUser, logout as logoutUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Register new user
  const register = async (userData) => {
    setError(null);
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data.data;
      // Save token and user locally
      setAuthToken(token);
      saveUser(user);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Login user
  const login = async (credentials) => {
    setError(null);
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data.data;
      setAuthToken(token);
      saveUser(user);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout user
  const logout = () => {
    logoutUser();
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(updates);
      const updatedUser = response.data.data;
      
      saveUser(updatedUser);
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check for token in URL parameters (from OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      if (urlToken) {
        localStorage.setItem('token', urlToken);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await fetch('/auth/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.isAuthenticated) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (provider) => {
    // Redirect to OAuth provider
    window.location.href = `/auth/${provider}`;
  };

  const emailLogin = async (email, password) => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT token
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Email login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const emailRegister = async (email, password, firstName, lastName) => {
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          password, 
          first_name: firstName, 
          last_name: lastName 
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT token
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Email registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await fetch('/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const setUserRole = async (role) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/auth/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });

      if (response.ok) {
        // Update user state with new role
        setUser(prev => ({ ...prev, role }));
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.message || 'Failed to set role' };
      }
    } catch (error) {
      console.error('Set role error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      // Remove JWT token
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still remove token and clear state on error
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('/api/profile/basic', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data;
      } else {
        throw new Error('Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const updateSkillAssessment = async (skillData) => {
    try {
      const response = await fetch('/api/profile/skill-assessment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(skillData)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data;
      } else {
        throw new Error('Skill assessment update failed');
      }
    } catch (error) {
      console.error('Skill assessment error:', error);
      throw error;
    }
  };

  const updateVenueDetails = async (venueData) => {
    try {
      const response = await fetch('/api/profile/venue-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(venueData)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data;
      } else {
        throw new Error('Venue details update failed');
      }
    } catch (error) {
      console.error('Venue details error:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      const response = await fetch('/api/profile/complete-onboarding', {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data;
      } else {
        throw new Error('Onboarding completion failed');
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    emailLogin,
    emailRegister,
    setUserRole,
    adminLogin,
    logout,
    updateProfile,
    updateSkillAssessment,
    updateVenueDetails,
    completeOnboarding,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

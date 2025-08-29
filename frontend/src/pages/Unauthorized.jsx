import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { 
    message = 'You do not have permission to access this page.',
    requiredRole,
    userRole,
    missingPermissions,
    from 
  } = location.state || {};

  const handleGoBack = () => {
    if (from) {
      navigate(from.pathname, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'admin': 'Administrator',
      'venue_owner': 'Venue Owner',
      'player': 'Player'
    };
    return roleNames[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-6">
            <svg 
              className="h-6 w-6 text-red-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>

          {/* Error Message */}
          <div className="text-center text-sm text-gray-600 mb-6">
            <p className="mb-4">{message}</p>
            
            {/* Role Information */}
            {requiredRole && userRole && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-yellow-800">
                  <strong>Required Role:</strong> {getRoleDisplayName(requiredRole)}
                </p>
                <p className="text-yellow-800">
                  <strong>Your Role:</strong> {getRoleDisplayName(userRole)}
                </p>
              </div>
            )}

            {/* Missing Permissions */}
            {missingPermissions && missingPermissions.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-red-800 font-medium mb-2">Missing Permissions:</p>
                <ul className="text-red-700 text-xs list-disc list-inside">
                  {missingPermissions.map((permission, index) => (
                    <li key={index}>{permission.replace(/_/g, ' ').toUpperCase()}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* User Information */}
            {user && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                <p className="text-gray-700">
                  <strong>Logged in as:</strong> {user.email}
                </p>
                <p className="text-gray-700">
                  <strong>Role:</strong> {getRoleDisplayName(user.role)}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoBack}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Go Back
            </button>

            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Go to Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Logout and Login as Different User
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              If you believe this is an error, please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

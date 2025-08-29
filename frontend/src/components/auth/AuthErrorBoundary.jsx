import React from 'react';

/**
 * Production-grade error boundary for authentication-related errors
 * Provides comprehensive error handling with recovery options and security logging
 */
class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: `auth_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging and monitoring
    const errorDetails = {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorId: this.state.errorId
    };

    // Security event logging
    console.error('[AUTH_ERROR_BOUNDARY] Authentication error caught:', errorDetails);

    // In production, this would send to error monitoring service
    this.logErrorToService(errorDetails);

    this.setState({
      error,
      errorInfo
    });
  }

  logErrorToService = (errorDetails) => {
    // In production, send to error monitoring service (e.g., Sentry, LogRocket)
    // For development, we log to console for demonstration
    console.log('[ERROR_SERVICE] Logging authentication error:', errorDetails);
  };

  handleRetry = () => {
    // Clear error state and attempt to recover
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });

    // Reload the page to reset authentication state
    window.location.reload();
  };

  handleLogout = () => {
    // Clear all authentication data and redirect to login
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Clear any auth-related cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });

    // Redirect to login page
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
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

              {/* Error Title */}
              <h2 className="text-center text-2xl font-bold text-gray-900 mb-4">
                Authentication Error
              </h2>

              {/* Error Message */}
              <div className="text-center text-sm text-gray-600 mb-6">
                <p className="mb-4">
                  An unexpected error occurred with the authentication system. 
                  This has been logged for investigation.
                </p>
                
                {/* Error ID for support */}
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                  <p className="text-gray-700 text-xs">
                    <strong>Error ID:</strong> {this.state.errorId}
                  </p>
                  <p className="text-gray-700 text-xs">
                    <strong>Time:</strong> {new Date().toLocaleString()}
                  </p>
                </div>

                {/* Development error details */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="text-left bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    <summary className="cursor-pointer text-red-800 font-medium">
                      Development Error Details
                    </summary>
                    <pre className="text-xs text-red-700 mt-2 whitespace-pre-wrap">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </div>

              {/* Recovery Actions */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Retry
                </button>

                <button
                  onClick={this.handleLogout}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Logout and Login Again
                </button>

                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Go to Home Page
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  If this problem persists, please contact support with the Error ID above.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  Lock,
  AlertCircle,
  Mail,
  CheckCircle2 as CheckCircle,
  Clock,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import '../style/auth.css';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://foodbridgebangladesh-9ehu.onrender.com/api'
  : 'http://localhost:8080/api';

const ResetPasswordPage = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [stage, setStage] = useState('email'); // email, otp, password, success

  // Form data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // OTP timer
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Request OTP via email
  const requestOTP = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call API to request OTP
      const response = await fetch(`${API_URL}/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Move to OTP stage
        setStage('otp');
        // Start the timer
        setTimeLeft(120);
        setTimerActive(true);
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error requesting OTP:', err);
      setError('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call API to verify OTP
      const response = await fetch(`${API_URL}/verify-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Move to password reset stage
        setStage('password');
        setTimerActive(false); // Stop the timer
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async () => {
    // Validate passwords
    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 3) {
      setError('Please create a stronger password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call API to reset password
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Move to success stage
        setStage('success');
        // Set a timeout to redirect to login page
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;

    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;

    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;

    // Contains number
    if (/[0-9]/.test(password)) strength += 1;

    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return strength;
  };

  // Get password strength label and color
  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return { text: 'Very Weak', color: 'red' };
    if (passwordStrength === 1) return { text: 'Weak', color: 'red' };
    if (passwordStrength === 2) return { text: 'Fair', color: 'orange' };
    if (passwordStrength === 3) return { text: 'Good', color: 'yellow' };
    if (passwordStrength === 4) return { text: 'Strong', color: 'green' };
    if (passwordStrength === 5) return { text: 'Very Strong', color: 'green' };
  };

  // Render password strength bar
  const renderProgressBar = () => {
    const strengthInfo = getPasswordStrengthLabel();

    return (
      <div className="password-strength">
        <div className="strength-text" style={{ color: strengthInfo.color }}>
          {strengthInfo.text}
        </div>
        <div className="strength-bar">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`strength-segment ${passwordStrength >= level ? 'active' : ''}`}
              style={{ backgroundColor: passwordStrength >= level ? strengthInfo.color : 'gray' }}
            ></div>
          ))}
        </div>
      </div>
    );
  };

  // Resend OTP
  const resendOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Call API to resend OTP
      const response = await fetch(`${API_URL}/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Reset timer
        setTimeLeft(120);
        setTimerActive(true);
        setOtp(''); // Clear previous OTP
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update password strength when password changes
  useEffect(() => {
    if (password) {
      const strength = calculatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  // Timer countdown effect
  useEffect(() => {
    let interval;

    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setError('OTP expired. Please request a new one.');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    switch (stage) {
      case 'email':
        requestOTP();
        break;
      case 'otp':
        verifyOTP();
        break;
      case 'password':
        resetPassword();
        break;
      default:
        break;
    }
  };

  return (
    <div className={`auth-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>

      <div className="login-container">
        <div className="login-brand">
          <Heart size={32} color="#e11d48" fill="#e11d48" />
          <h2>FoodShare</h2>
        </div>

        <div className="login-header">
          <h1 className="login-title">
            {stage === 'email' && 'Reset Your Password'}
            {stage === 'otp' && 'Verify OTP'}
            {stage === 'password' && 'Create New Password'}
            {stage === 'success' && 'Password Reset Complete'}
          </h1>
          <p className="login-subtitle">
            {stage === 'email' && 'Enter your email address to receive a verification code'}
            {stage === 'otp' && 'Enter the 6-digit code sent to your email'}
            {stage === 'password' && 'Choose a strong password for your account'}
            {stage === 'success' && 'Your password has been reset successfully'}
          </p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {stage === 'success' ? (
          <div className="success-card">
            <div className="success-icon-container">
              <CheckCircle size={32} className="success-icon" />
            </div>
            <h3 className="success-title">Password Reset Successful</h3>
            <p className="success-description">Your password has been updated successfully.</p>
            <div className="success-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <p className="redirect-text">Redirecting to login page...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Email Stage */}
            {stage === 'email' && (
              <div className="input-group">
                <label htmlFor="email" className="input-label">
                  Email address
                </label>
                <div className="input-field-container">
                  <span className="input-icon"><Mail size={16} /></span>
                  <input
                    id="email"
                    type="email"
                    className="input-field with-icon"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* OTP Stage */}
            {stage === 'otp' && (
              <>
                <div className="input-group">
                  <label htmlFor="otp" className="input-label">
                    Verification Code
                  </label>
                  <div className="input-field-container">
                    <span className="input-icon"><Lock size={16} /></span>
                    <input
                      id="otp"
                      type="text"
                      className="input-field with-icon"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                      maxLength={6}
                      required
                    />
                  </div>

                  <div className="otp-timer">
                    <Clock size={16} />
                    <span>{formatTime(timeLeft)}</span>
                  </div>

                  {timeLeft === 0 && (
                    <button
                      type="button"
                      className="resend-otp-button"
                      onClick={resendOTP}
                      disabled={isLoading}
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <div className="email-display">
                  <Mail size={14} />
                  <span>Code sent to: {email}</span>
                  <button
                    type="button"
                    className="change-email-button"
                    onClick={() => {
                      setStage('email');
                      setTimerActive(false);
                    }}
                  >
                    Change
                  </button>
                </div>
              </>
            )}

            {/* New Password Stage */}
            {stage === 'password' && (
              <>
                <div className="input-group">
                  <label htmlFor="password" className="input-label">
                    New Password
                  </label>
                  <div className="input-field-container">
                    <span className="input-icon"><Lock size={16} /></span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="input-field with-icon"
                      placeholder="Create new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {password && renderProgressBar()}

                  <div className="password-requirements">
                    <div className={`requirement ${password.length >= 8 ? 'met' : ''}`}>
                      <span className="req-icon">✓</span>
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`requirement ${/[A-Z]/.test(password) ? 'met' : ''}`}>
                      <span className="req-icon">✓</span>
                      <span>At least 1 uppercase letter</span>
                    </div>
                    <div className={`requirement ${/[0-9]/.test(password) ? 'met' : ''}`}>
                      <span className="req-icon">✓</span>
                      <span>At least 1 number</span>
                    </div>
                    <div className={`requirement ${/[^A-Za-z0-9]/.test(password) ? 'met' : ''}`}>
                      <span className="req-icon">✓</span>
                      <span>At least 1 special character</span>
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="confirmPassword" className="input-label">
                    Confirm Password
                  </label>
                  <div className="input-field-container">
                    <span className="input-icon"><Lock size={16} /></span>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input-field with-icon"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {confirmPassword && password !== confirmPassword && (
                    <div className="password-mismatch">
                      <AlertCircle size={14} />
                      <span>Passwords do not match</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  {stage === 'email' && 'Send Verification Code'}
                  {stage === 'otp' && 'Verify Code'}
                  {stage === 'password' && 'Reset Password'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="back-to-login">
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, ArrowRight, User, Mail, Heart,
  AlertCircle, Shield, Lock, Calendar, Phone,
  MapPin, Info, Camera, Droplet, CreditCard,
  FileText, Verified, X, RefreshCw,
  RefreshCcw, CheckCircle2 as CheckCircle
} from 'lucide-react';

import '../style/Signup.css';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://foodbridgebangladesh-9ehu.onrender.com/api' 
    : 'http://localhost:8080/api';

const SignupPage = () => {

  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Form UI state
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Camera/Photo state
  const [cameraStream, setCameraStream] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Identification state
  const [selectedIdentificationType, setSelectedIdentificationType] = useState('nid');

  // Field validation state
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    phone: '',
    nationalId: ''
  });

  // Refs for camera and canvas
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraContainerRef = useRef(null);

  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    birthdate: '',
    bloodGroup: '',
    // Identification documents
    nationalId: '',
    passportNumber: '',
    birthCertificateNumber: '',
    // Address information
    address: '',
    addressDescription: '',
    // Photo
    userPhoto: null,
    userType: 'donor',
    bio: ''
  });

  // ==========================================
  // CAMERA FUNCTIONALITY
  // ==========================================

  /**
   * Initialize camera when needed
   */
  const initializeCamera = async () => {
    try {
      setCameraError('');
      const constraints = {
        video: {
          width: { ideal: 480 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraError('Camera access denied. Please grant camera permission.');
      setShowCamera(false); // Reset UI state if camera fails
    }
  };

  /**
   * Stop camera stream
   */
  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Function to handle successful registration
  const handleRegistrationSuccess = () => {
    setShowSuccessMessage(true);

    // Set a timeout to redirect after 4 seconds
    setTimeout(() => {
      navigate('/login');
    }, 4000);
  };

  /**
   * Take a photo using the webcam
   */
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob(blob => {
        // Create a URL for the blob
        const photoURL = URL.createObjectURL(blob);

        // Update form data with photo
        setFormData(prev => ({
          ...prev,
          userPhoto: {
            blob,
            url: photoURL
          }
        }));

        setPhotoTaken(true);
        setShowCamera(false); // Hide camera after photo is taken
        // Stop camera stream after photo is taken
        stopCameraStream();
      }, 'image/jpeg', 0.8);
    }
  };

  /**
   * Retake a photo
   */
  const retakePhoto = () => {
    if (formData.userPhoto) {
      URL.revokeObjectURL(formData.userPhoto.url);
      setFormData(prev => ({ ...prev, userPhoto: null }));
    }
    setPhotoTaken(false);
    setShowCamera(true); // Show camera for retaking
    // Explicitly reinitialize camera
    initializeCamera(); // Restart the camera
  };

  /**
   * Handle camera close
   */
  const handleCloseCamera = () => {
    stopCameraStream();
    setShowCamera(false);
  };

  // ==========================================
  // FORM VALIDATION
  // ==========================================

  /**
   * Validate identification documents
   */
  const validateIdentification = () => {
    const { nationalId, passportNumber, birthCertificateNumber } = formData;

    if (!nationalId && !passportNumber && !birthCertificateNumber) {
      setError('Please provide at least one form of identification (National ID, Passport, or Birth Certificate)');
      return false;
    }

    return true;
  };

  /**
   * Check if email is already registered
   */
  const checkEmailExists = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.exists) {
        setFieldErrors(prev => ({ ...prev, email: 'Email already registered' }));
        return true;
      } else {
        setFieldErrors(prev => ({ ...prev, email: '' }));
        return false;
      }
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  /**
   * Check if phone number is already registered
   */
  const checkPhoneExists = async (phone) => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-phone?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();

      if (data.exists) {
        setFieldErrors(prev => ({ ...prev, phone: 'Phone number already registered' }));
        return true;
      } else {
        setFieldErrors(prev => ({ ...prev, phone: '' }));
        return false;
      }
    } catch (error) {
      console.error('Error checking phone:', error);
      return false;
    }
  };

  /**
   * Check if national ID is already registered
   */
  const checkNationalIdExists = async (nationalId) => {
    if (!nationalId) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/check-national-id?nationalId=${encodeURIComponent(nationalId)}`);
      const data = await response.json();

      if (data.exists) {
        setFieldErrors(prev => ({ ...prev, nationalId: 'National ID already registered' }));
        return true;
      } else {
        setFieldErrors(prev => ({ ...prev, nationalId: '' }));
        return false;
      }
    } catch (error) {
      console.error('Error checking national ID:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submit button clicked"); // Debugging

    // Validate all fields at once
    let isValid = true;
    setError('');

    // Basic validations
    const { firstName, lastName, email, password, phone, birthdate,
      bloodGroup, address, addressDescription } = formData;

    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required personal information');
      isValid = false;
    } else if (passwordStrength < 3) {
      setError('Please create a stronger password');
      isValid = false;
    }

    if (!phone || !birthdate || !bloodGroup) {
      setError('Please fill in all required profile information');
      isValid = false;
    } else if (!validateIdentification()) {
      isValid = false;
    }

    if (!address || !addressDescription) {
      setError('Please provide your complete address information');
      isValid = false;
    }

    if (!formData.userPhoto) {
      setError('Please take a profile photo');
      isValid = false;
    }

    if (!isTermsAccepted) {
      setError('Please accept the terms and conditions to continue');
      isValid = false;
    }

    // Check for duplicate information
    const emailExists = await checkEmailExists(email);
    const phoneExists = await checkPhoneExists(phone);
    let nationalIdExists = false;

    if (formData.nationalId) {
      nationalIdExists = await checkNationalIdExists(formData.nationalId);
    }

    if (emailExists || phoneExists || nationalIdExists) {
      isValid = false;
    }

    console.log("Validation result:", isValid); // Debugging

    if (!isValid) return;

    setIsLoading(true);

    try {
      // Create FormData object for multipart form data
      const formDataToSend = new FormData();

      // Add all text fields to formData
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('birthdate', formData.birthdate);
      formDataToSend.append('bloodGroup', formData.bloodGroup);

      // Add identification fields if provided
      if (formData.nationalId) formDataToSend.append('nationalId', formData.nationalId);
      if (formData.passportNumber) formDataToSend.append('passportNumber', formData.passportNumber);
      if (formData.birthCertificateNumber) formDataToSend.append('birthCertificateNumber', formData.birthCertificateNumber);

      // Add address information
      formDataToSend.append('address', formData.address);
      formDataToSend.append('addressDescription', formData.addressDescription);

      // Add user type and bio
      formDataToSend.append('userType', formData.userType);
      if (formData.bio) formDataToSend.append('bio', formData.bio);

      // Add user photo - convert the blob to a file
      if (formData.userPhoto && formData.userPhoto.blob) {
        const photoFile = new File([formData.userPhoto.blob], 'profile-photo.jpg', { type: 'image/jpeg' });
        formDataToSend.append('userPhoto', photoFile);
      }

      // Debug the form data being sent
      const formDataObj = {};
      formDataToSend.forEach((value, key) => {
        formDataObj[key] = value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value;
      });
      console.log('Form data being sent:', formDataObj);

      console.log('Sending registration data to server...');

      // Send request to backend API
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        body: formDataToSend,
        // No Content-Type header, the browser will set it with the boundary parameter
      });

      console.log('Response status:', response.status);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          // Try to parse error message from JSON response
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, use response status text
          console.error('Error parsing error response:', parseError);
          errorMessage = `Registration failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // If response is ok, safely parse the JSON
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (jsonError) {
        console.error('Error parsing success response:', jsonError);
        throw new Error('Server response format error');
      }

      console.log('Registration successful:', data);

      // Show success message and set timeout for redirection
      handleRegistrationSuccess();

    } catch (error) {
      console.error('Full error details:', error);
      setError(error.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  // ==========================================
  // FORM INPUT HANDLING
  // ==========================================

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Password strength calculation
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }

    // Real-time validation for specific fields
    if (name === 'email' && value) {
      checkEmailExists(value);
    }

    if (name === 'phone' && value) {
      checkPhoneExists(value);
    }

    if (name === 'nationalId' && value) {
      checkNationalIdExists(value);
    }
  };

  /**
   * Calculate password strength
   */
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

  /**
   * Get password strength label and color
   */
  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return { text: 'Very Weak', color: 'red' };
    if (passwordStrength === 1) return { text: 'Weak', color: 'red' };
    if (passwordStrength === 2) return { text: 'Fair', color: 'orange' };
    if (passwordStrength === 3) return { text: 'Good', color: 'yellow' };
    if (passwordStrength === 4) return { text: 'Strong', color: 'green' };
    if (passwordStrength === 5) return { text: 'Very Strong', color: 'green' };
  };

  /**
   * Render password strength bar
   */
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

  // ==========================================
  // MOTIVATIONAL MESSAGES
  // ==========================================

  // Motivational messages for users
  const donorMessages = [
    "Your generosity can save someone from hunger today.",
    "Share your food, share your heart.",
    "Every meal shared is a life touched.",
    "Be the reason someone believes in kindness.",
    "Ending hunger starts with a single meal donation."
  ];

  const receiverMessages = [
    "Everyone deserves access to nutritious food.",
    "We're here to support you through difficult times.",
    "Your wellbeing matters to our community.",
    "Accepting help today means strength for tomorrow.",
    "You are not alone in this journey."
  ];

  // Get random message based on user type
  const getRandomMessage = () => {
    const messages = formData.userType === 'donor' ? donorMessages : receiverMessages;
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };

  // State for inspirational messages
  const [inspirationalMessage, setInspirationalMessage] = useState(getRandomMessage());
  const [secondaryMessage, setSecondaryMessage] = useState(
    formData.userType === 'donor'
      ? "Your contribution creates a safety net for families in need."
      : "FoodBridge ensures dignity and respect for everyone in our community."
  );

  // Refresh the inspirational message
  const refreshMessage = () => {
    setInspirationalMessage(getRandomMessage());
  };

  // Auto-rotate inspirational messages every 3 seconds
  useEffect(() => {
    const messageRotationInterval = setInterval(() => {
      setInspirationalMessage(getRandomMessage());

      // Also update secondary message
      setSecondaryMessage(
        formData.userType === 'donor'
          ? "Your contribution creates a safety net for families in need."
          : "FoodBridge ensures dignity and respect for everyone in our community."
      );
    }, 3000);

    return () => clearInterval(messageRotationInterval);
  }, [formData.userType]);

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================

  /**
   * Effect to handle camera initialization
   */
  useEffect(() => {
    if (showCamera && !photoTaken && !cameraStream) {
      initializeCamera();
    }

    return () => {
      // Only clean up if we're explicitly closing the camera
      if (!showCamera && cameraStream) {
        stopCameraStream();
      }
    };
  }, [showCamera, photoTaken, cameraStream]);

  useEffect(() => {
    console.log("Dark mode state:", darkMode);
  }, [darkMode]);

  // ==========================================
  // RENDER UI
  // ==========================================

  return (
    <div className={`elegant-signup-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="signup-inner">
        <div className="signup-header">
          <div className="brand">
            <div className="logo-container">
              <span className="logo-letter">F</span>
            </div>
            <div className="brand-text">
              <h1>FoodBridge</h1>
              <span className="brand-location">Bangladesh</span>
            </div>
          </div>
          <p className="slogan">Join our community and make a difference today</p>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {showSuccessMessage && (
          <div className="success-banner">
            <CheckCircle size={18} />
            <span>Registration successful! Redirecting to login page...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="elegant-form">
          {/* Compact camera section with inspirational messages */}
          <div className="photo-section-container">
            <div className="inspirational-column left">
              <div className="inspiration-bubble">
                <Heart size={20} className="inspiration-icon" />
                <p>{inspirationalMessage}</p>
              </div>
              <button
                type="button"
                className="refresh-message-btn"
                onClick={refreshMessage}
                title="See another message"
              >
                <RefreshCcw size={14} />
              </button>
            </div>

            <div className="camera-section-compact">
              <h2 className="camera-title">
                <User className="section-icon" size={20} />
                Profile Photo
              </h2>

              {cameraError && (
                <div className="camera-error">
                  <AlertCircle size={16} />
                  <span>{cameraError}</span>
                </div>
              )}

              {!showCamera && !photoTaken ? (
                <div className="photo-placeholder" onClick={() => setShowCamera(true)}>
                  <Camera size={30} />
                  <span>Click to take photo</span>
                </div>
              ) : null}

              {showCamera && !photoTaken ? (
                <div className="camera-container" ref={cameraContainerRef}>
                  <button
                    type="button"
                    className="close-camera-btn"
                    onClick={handleCloseCamera}
                    aria-label="Close camera"
                  >
                    <X size={18} />
                  </button>

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="camera-preview"
                  />

                  <div className="camera-controls">
                    <button
                      type="button"
                      className="take-photo-btn"
                      onClick={takePhoto}
                    >
                      <Camera size={18} />
                      <span>Capture</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {photoTaken && formData.userPhoto ? (
                <div className="photo-preview-container">
                  <div className="photo-preview">
                    <img src={formData.userPhoto.url} alt="Profile" />
                  </div>
                  <div className="photo-actions">
                    <div className="photo-confirmation">
                      <CheckCircle size={16} className="success-icon" />
                      <span>Photo captured</span>
                    </div>
                    <button
                      type="button"
                      className="retake-photo-btn"
                      onClick={retakePhoto}
                    >
                      <RefreshCw size={14} />
                      <span>Retake</span>
                    </button>
                  </div>
                </div>
              ) : null}

              <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            </div>

            <div className="inspirational-column right">
              <div className="inspiration-bubble">
                <Shield size={20} className="inspiration-icon" />
                <p>{secondaryMessage}</p>
              </div>
            </div>
          </div>

          <div className="form-content">
            <div className="form-panel left-panel">
              {/* Personal Information */}
              <div className="form-section">
                <h2 className="section-title">
                  <User className="section-icon" size={20} />
                  Personal Details
                </h2>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail className="field-icon" size={18} />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      required
                      className={fieldErrors.email ? 'error-input' : ''}
                    />
                  </div>
                  {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
                </div>

                <div className="form-field">
                  <label htmlFor="password">Create Password</label>
                  <div className="input-with-icon password-input">
                    <Lock className="field-icon" size={18} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {formData.password && renderProgressBar()}

                  <div className="password-requirements">
                    <div className={`requirement ${formData.password.length >= 8 ? 'met' : ''}`}>
                      <span className="req-icon">✓</span>
                      <span>8+ chars</span>
                    </div>
                    <div className={`requirement ${/[A-Z]/.test(formData.password) ? 'met' : ''}`}>
                      <span className="req-icon">✓</span>
                      <span>Uppercase</span>
                    </div>
                    <div className={`requirement ${/[0-9]/.test(formData.password) ? 'met' : ''}`}>
                      <span className="req-icon">✓</span>
                      <span>Number</span>
                    </div>
                    <div className={`requirement ${/[^A-Za-z0-9]/.test(formData.password) ? 'met' : ''}`}>
                      <span className="req-icon">✓</span>
                      <span>Special</span>
                    </div>
                  </div>
                </div>

                {/* Contact & User Type */}
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-with-icon">
                      <Phone className="field-icon" size={18} />
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        required
                        className={fieldErrors.phone ? 'error-input' : ''}
                      />
                    </div>
                    {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
                  </div>

                  <div className="form-field">
                    <label htmlFor="userType">Register as</label>
                    <div className="role-toggle">
                      <button
                        type="button"
                        className={`role-btn ${formData.userType === 'donor' ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, userType: 'donor' }))}
                      >
                        <Heart size={16} />
                        <span>Food Donor</span>
                      </button>
                      <button
                        type="button"
                        className={`role-btn ${formData.userType === 'receiver' ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, userType: 'receiver' }))}
                      >
                        <User size={16} />
                        <span>Food Receiver</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-panel right-panel">
              {/* Profile Details */}
              <div className="form-section">
                <h2 className="section-title">
                  <Shield className="section-icon" size={20} />
                  Additional Information
                </h2>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="birthdate">Date of Birth</label>
                    <div className="input-with-icon">
                      <Calendar className="field-icon" size={18} />
                      <input
                        id="birthdate"
                        type="date"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleChange}
                        max={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="bloodGroup">Blood Group</label>
                    <div className="input-with-icon">
                      <Droplet className="field-icon" size={18} />
                      <select
                        id="bloodGroup"
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select blood group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* Identification Documents */}
                <div className="id-section">
                  <label className="section-label">Identification Document</label>
                  <div className="id-selector">
                    <button
                      type="button"
                      className={`id-type-btn ${selectedIdentificationType === 'nid' ? 'active' : ''}`}
                      onClick={() => setSelectedIdentificationType('nid')}
                    >
                      <CreditCard size={16} />
                      <span>National ID</span>
                    </button>
                    <button
                      type="button"
                      className={`id-type-btn ${selectedIdentificationType === 'passport' ? 'active' : ''}`}
                      onClick={() => setSelectedIdentificationType('passport')}
                    >
                      <FileText size={16} />
                      <span>Passport</span>
                    </button>
                    <button
                      type="button"
                      className={`id-type-btn ${selectedIdentificationType === 'birth' ? 'active' : ''}`}
                      onClick={() => setSelectedIdentificationType('birth')}
                    >
                      <FileText size={16} />
                      <span>Birth Certificate</span>
                    </button>
                  </div>

                  {/* ID Input Fields */}
                  <div className="id-input-container">
                    {selectedIdentificationType === 'nid' && (
                      <div className="form-field">
                        <input
                          type="text"
                          name="nationalId"
                          value={formData.nationalId}
                          onChange={handleChange}
                          placeholder="National ID Number"
                          className={fieldErrors.nationalId ? 'error-input' : ''}
                        />
                        {fieldErrors.nationalId && <div className="field-error">{fieldErrors.nationalId}</div>}
                      </div>
                    )}

                    {selectedIdentificationType === 'passport' && (
                      <div className="form-field">
                        <input
                          type="text"
                          name="passportNumber"
                          value={formData.passportNumber}
                          onChange={handleChange}
                          placeholder="Passport Number"
                        />
                      </div>
                    )}

                    {selectedIdentificationType === 'birth' && (
                      <div className="form-field">
                        <input
                          type="text"
                          name="birthCertificateNumber"
                          value={formData.birthCertificateNumber}
                          onChange={handleChange}
                          placeholder="Birth Certificate Number"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div className="form-field">
                  <label htmlFor="address">Address</label>
                  <div className="input-with-icon">
                    <MapPin className="field-icon" size={18} />
                    <input
                      id="address"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Full Address"
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="addressDescription">Address Details</label>
                  <textarea
                    id="addressDescription"
                    name="addressDescription"
                    value={formData.addressDescription}
                    onChange={handleChange}
                    placeholder="Landmarks, building color, floor number, etc."
                    rows="2"
                    required
                  ></textarea>
                </div>

                <div className="form-field">
                  <label htmlFor="bio">Bio (Optional)</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself or your organization"
                    rows="2"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="form-footer">
            <div className="terms-container">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={isTermsAccepted}
                  onChange={() => setIsTermsAccepted(!isTermsAccepted)}
                  required
                />
                <span className="checkbox-text">
                  I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="login-link">
              Already have an account? <Link to="/login">Log in</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;

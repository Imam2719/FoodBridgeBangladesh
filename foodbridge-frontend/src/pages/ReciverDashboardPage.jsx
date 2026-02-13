import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

import {
  Search, MapPin, Clock, Star, Filter, ChevronDown, X, AlertCircle,
  Upload, PlusCircle, Map, Camera, Calendar, User, Info, Settings,
  FileText, CheckCircle, Coffee, Package, Globe, Moon,
  Facebook, Twitter, Instagram, Youtube, Heart, ArrowRight,
  Bell, Menu, ThumbsUp, MessageCircle, Gift, Sliders, RefreshCw,
  Bookmark, LogOut, Edit, UserPlus, Truck, ChevronRight, Utensils,
  Compass, Zap, Award, HelpCircle, ShoppingBag, Grid, List, Save,
  Mail, Eye, EyeOff, MoreHorizontal, Check, ExternalLink, Shield,
  Phone, Lock, BarChart, PieChart, ArrowLeft, Receipt, Leaf, Users,
  Flag, AlertTriangle, Send, AlertOctagon, ChevronLeft
} from 'lucide-react';

import '../style/ReciverDashBoard.css';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://foodbridgebangladesh-9ehu.onrender.com'
  : 'http://localhost:8080';

const ReceiverDashboard = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('available');
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [showFoodRequestForm, setShowFoodRequestForm] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [formAnimation, setFormAnimation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [savedFoods, setSavedFoods] = useState([]);
  const [isLoadingSavedItems, setIsLoadingSavedItems] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [pickupMethod, setPickupMethod] = useState('self');
  const [showPickupRequestModal, setShowPickupRequestModal] = useState(false);
  const [requestedMealCount, setRequestedMealCount] = useState(1);
  const [requestNote, setRequestNote] = useState('');
  const [selectedPickupFood, setSelectedPickupFood] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({});
  const [newProfilePhoto, setNewProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showSavedDonationsModal, setShowSavedDonationsModal] = useState(false);
  const [savedDonationsFormAnimation, setSavedDonationsFormAnimation] = useState(false);
  const [savedDonationsData, setSavedDonationsData] = useState([]);
  const [isLoadingSavedDonations, setIsLoadingSavedDonations] = useState(false);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [showAcceptedRequestModal, setShowAcceptedRequestModal] = useState(false);
  const [selectedAcceptedRequest, setSelectedAcceptedRequest] = useState(null);
  const [acceptedRequestNotifications, setAcceptedRequestNotifications] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableFoods, setAvailableFoods] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0
  });
  const [userProfile, setUserProfile] = useState(null);
  const getUserFromStorage = () => {
    const authUser = JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}');
    return {
      id: authUser.userId || 1,
      name: authUser.fullName || 'Guest User',
      email: authUser.email || 'user@example.com'
    };
  };
  const currentUser = getUserFromStorage();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDonationDetailsModal, setShowDonationDetailsModal] = useState(false);
  const [showAcceptedNotificationsModal, setShowAcceptedNotificationsModal] = useState(false);
  const [selectedAcceptedNotification, setSelectedAcceptedNotification] = useState(null);
  const [showOverviewModal, setShowOverviewModal] = useState(false);
  const [overviewFormAnimation, setOverviewFormAnimation] = useState(false);
  const [overviewStats, setOverviewStats] = useState({
    received: [],
    requested: [],
    summary: {
      totalReceived: 0,
      totalRequested: 0,
      pendingRequests: 0,
      acceptedRequests: 0,
      rejectedRequests: 0
    }
  });
  const [overviewFilter, setOverviewFilter] = useState('all');
  const [overviewTab, setOverviewTab] = useState('received');
  const [showHelpCenterModal, setShowHelpCenterModal] = useState(false);
  const [helpCenterAnimation, setHelpCenterAnimation] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState('about');
  const [emergencyForm, setEmergencyForm] = useState({
    title: '',
    description: '',
    location: '',
    category: 'meal',
    peopleCount: 1,
    image: null,
    urgency: 'high'
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFormAnimation, setReportFormAnimation] = useState(false);
  const [selectedFoodForReport, setSelectedFoodForReport] = useState(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showReportConfirmation, setShowReportConfirmation] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    reportReason: '',
    reportCategory: 'QUALITY_ISSUE',
    evidenceFile1: null,
    evidenceFile2: null
  });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const categoryContainerRef = useRef(null);
  const [actionScrollPosition, setActionScrollPosition] = useState(0);
  const [showActionLeftArrow, setShowActionLeftArrow] = useState(false);
  const [showActionRightArrow, setShowActionRightArrow] = useState(false);
  const [actionScrollProgress, setActionScrollProgress] = useState(0);
  const actionButtonsContainerRef = useRef(null);
  const [reportFormStep, setReportFormStep] = useState(1); 


  useEffect(() => {
    const container = categoryContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;

      // Update scroll position
      setScrollPosition(scrollLeft);

      // Update arrow visibility
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);

      // Update progress bar
      const progress = scrollWidth > clientWidth
        ? (scrollLeft / (scrollWidth - clientWidth)) * 100
        : 0;
      setScrollProgress(progress);
    };

    const handleResize = () => {
      handleScroll(); // Recalculate on resize
    };

    // Initial calculation
    handleScroll();

    // Add event listeners
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const container = actionButtonsContainerRef.current;
    if (!container) return;

    const handleActionScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;

      // Update scroll position
      setActionScrollPosition(scrollLeft);

      // Update arrow visibility (not needed now, but keep for progress bar)
      setShowActionLeftArrow(scrollLeft > 0);
      setShowActionRightArrow(scrollLeft < scrollWidth - clientWidth);

      // Update progress bar
      const progress = scrollWidth > clientWidth
        ? (scrollLeft / (scrollWidth - clientWidth)) * 100
        : 0;
      setActionScrollProgress(progress);

      // Update gradient indicators
      if (scrollLeft > 0) {
        container.classList.add('scrolled-left');
      } else {
        container.classList.remove('scrolled-left');
      }

      if (scrollLeft < scrollWidth - clientWidth) {
        container.classList.add('scrolled-right');
      } else {
        container.classList.remove('scrolled-right');
      }
    };

    const handleActionResize = () => {
      handleActionScroll();
    };

    // Initial calculation
    handleActionScroll();

    // Add event listeners
    container.addEventListener('scroll', handleActionScroll, { passive: true });
    window.addEventListener('resize', handleActionResize);

    return () => {
      container.removeEventListener('scroll', handleActionScroll);
      window.removeEventListener('resize', handleActionResize);
    };
  }, []);

  // Scroll functions
  const scrollLeft = () => {
    const container = categoryContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = categoryContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Action buttons scroll functions
  const scrollActionLeft = () => {
    const container = actionButtonsContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollActionRight = () => {
    const container = actionButtonsContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };


  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [actionTouchStart, setActionTouchStart] = useState(0);
  const [actionTouchEnd, setActionTouchEnd] = useState(0);
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      scrollRight();
    }
    if (isRightSwipe) {
      scrollLeft();
    }
  };
  // Action buttons touch handling
  const handleActionTouchStart = (e) => {
    setActionTouchStart(e.targetTouches[0].clientX);
  };

  const handleActionTouchMove = (e) => {
    setActionTouchEnd(e.targetTouches[0].clientX);
  };

  const handleActionTouchEnd = () => {
    if (!actionTouchStart || !actionTouchEnd) return;

    const distance = actionTouchStart - actionTouchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      scrollActionRight();
    }
    if (isRightSwipe) {
      scrollActionLeft();
    }
  };

  const openReportModal = (food) => {
    setSelectedFoodForReport(food);
    setReportFormData({
      reportReason: '',
      reportCategory: 'QUALITY_ISSUE',
      evidenceFile1: null,
      evidenceFile2: null
    });
    setShowReportModal(true);
    setTimeout(() => {
      setReportFormAnimation(true);
    }, 10);
  };
  const closeReportModal = () => {
    setReportFormAnimation(false);
    setTimeout(() => {
      setShowReportModal(false);
      setSelectedFoodForReport(null);
      setShowReportConfirmation(false);
      setReportFormData({
        reportReason: '',
        reportCategory: 'QUALITY_ISSUE',
        evidenceFile1: null,
        evidenceFile2: null
      });
    }, 300);
  };
  const handleReportFormChange = (field, value) => {
    setReportFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleEvidenceFileChange = (fileNumber, file) => {
    if (file && file.size > 10 * 1024 * 1024) {
      showErrorNotification('File size must be less than 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (file && !allowedTypes.includes(file.type)) {
      showErrorNotification('Invalid file type. Please upload images, PDF, or document files.');
      return;
    }
    setReportFormData(prev => ({
      ...prev,
      [`evidenceFile${fileNumber}`]: file
    }));
  };
  const showReportConfirmationDialog = () => {
    if (!reportFormData.reportReason.trim() || reportFormData.reportReason.length < 10) {
      showErrorNotification('Please provide a detailed reason (at least 10 characters)');
      return;
    }
    setShowReportConfirmation(true);
  };
  const submitFoodReport = async () => {
    if (!selectedFoodForReport || !reportFormData.reportReason.trim()) {
      showErrorNotification('Please provide a reason for reporting this food item');
      return;
    }
    if (reportFormData.reportReason.length < 10) {
      showErrorNotification('Report reason must be at least 10 characters long');
      return;
    }
    try {
      setIsSubmittingReport(true);

      const formData = new FormData();
      formData.append('foodDonationId', selectedFoodForReport.id);
      formData.append('reporterId', currentUser.id);
      formData.append('reporterEmail', currentUser.email);
      formData.append('reportReason', reportFormData.reportReason.trim());
      formData.append('reportCategory', reportFormData.reportCategory);
      formData.append('foodName', selectedFoodForReport.foodName || '');
      formData.append('foodDescription', selectedFoodForReport.description || '');
      formData.append('foodCategory', selectedFoodForReport.category || '');
      formData.append('foodQuantity', selectedFoodForReport.quantity || '');
      formData.append('foodExpiryDate', selectedFoodForReport.expiryDate || '');
      formData.append('foodLocation', selectedFoodForReport.location || '');
      if (selectedFoodForReport.imageData) {
        formData.append('foodImageBase64', selectedFoodForReport.imageData);
        formData.append('foodImageContentType', selectedFoodForReport.imageContentType || 'image/jpeg');
      }
      if (userProfile) {
        formData.append('reporterName', `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim());
        formData.append('reporterPhone', userProfile.phone || '');
      }
      if (reportFormData.evidenceFile1) {
        formData.append('evidenceFile1', reportFormData.evidenceFile1);
      }
      if (reportFormData.evidenceFile2) {
        formData.append('evidenceFile2', reportFormData.evidenceFile2);
      }
      const response = await axios.post(
        `${API_BASE_URL}/api/receiver/food-reports`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      if (response.data.success) {
        showSuccessNotification(
          `Food report submitted successfully! Report ID: ${response.data.reportId}. Our team will review it within 24-48 hours.`
        );
        closeReportModal();
        fetchAvailableFoodDonations();
      } else {
        showErrorNotification(response.data.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting food report:', error);
      if (error.response?.status === 409) {
        showErrorNotification('You have already reported this food item recently');
      } else if (error.response?.data?.message) {
        showErrorNotification(error.response.data.message);
      } else {
        showErrorNotification('Failed to submit report. Please try again.');
      }
    } finally {
      setIsSubmittingReport(false);
    }
  };
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchInputRef = useRef(null);
  const profileModalRef = useRef(null);
  const [formData, setFormData] = useState({
    priority: 'medium',
    foodTypes: [],
    recipients: ['donors'],
    peopleCount: 1,
    timeNeeded: 'today',
    specificDate: '',
    specificTime: '',
    location: '',
    deliveryPreference: 'pickup',
    notes: '',
    image: null
  });

  const fetchAcceptedRequestNotifications = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/receiver/notifications/accepted?receiverId=${currentUser.id}`
      );
      if (response.data && response.data.length > 0) {
        setAcceptedRequestNotifications(response.data);
        response.data.forEach(notification => {
          const notificationSeen = localStorage.getItem(`notification_${notification.id}`);
          if (!notificationSeen) {
            localStorage.setItem(`notification_${notification.id}`, 'true');
            const notificationElement = document.createElement('div');
            notificationElement.className = 'fixed top-4 right-4 z-[9999] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm transform transition-all duration-300 ease-out';
            notificationElement.style.opacity = '0';
            notificationElement.style.transform = 'translateY(-20px) scale(0.95)';

            const statusColor = notification.status === 'ACCEPTED' ? 'green' : 'red';
            const statusIcon = notification.status === 'ACCEPTED' ?
              `<svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>` :
              `<svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>`;

            notificationElement.innerHTML = `
  <div class="flex items-start space-x-3">
    <div class="flex-shrink-0 w-8 h-8 bg-${statusColor}-100 dark:bg-${statusColor}-900/50 rounded-full flex items-center justify-center">
      ${statusIcon}
    </div>
    <div class="flex-1">
      <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
        ${notification.status === 'ACCEPTED' ? 'Request Accepted!' : 'Request Update'}
      </p>
      <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
        Your food request for "${notification.foodName}" has been ${notification.status.toLowerCase()}.
      </p>
    </div>
    <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
      </svg>
    </button>
  </div>
`;

            document.body.appendChild(notificationElement);

            // Animate in
            setTimeout(() => {
              notificationElement.style.opacity = '1';
              notificationElement.style.transform = 'translateY(0) scale(1)';
            }, 100);

            // Auto dismiss
            setTimeout(() => {
              notificationElement.style.opacity = '0';
              notificationElement.style.transform = 'translateY(-20px) scale(0.95)';
              setTimeout(() => {
                if (notificationElement.parentElement) {
                  notificationElement.parentElement.removeChild(notificationElement);
                }
              }, 300);
            }, 5000);
            document.body.appendChild(notificationElement);
            setTimeout(() => {
              notificationElement.classList.add('fade-out');
              setTimeout(() => document.body.removeChild(notificationElement), 300);
            }, 3000);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching accepted request notifications:', error);
    }
  };

  const fetchRequestNotifications = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/receiver/notifications/requests?receiverId=${currentUser.id}`
      );
      if (response.data && response.data.length > 0) {
        setAcceptedRequestNotifications(response.data);
        response.data.forEach(notification => {
          const notificationSeen = localStorage.getItem(`notification_${notification.id}`);
          if (!notificationSeen) {
            localStorage.setItem(`notification_${notification.id}`, 'true');
            const notificationElement = document.createElement('div');
            notificationElement.className = 'notification-dropdown';
            const isAccepted = notification.status === 'ACCEPTED';
            const iconClass = isAccepted ? 'text-green-500' : 'text-red-500';
            const icon = isAccepted ? CheckCircle : AlertCircle;
            const message = isAccepted
              ? `Your food request for "${notification.foodName}" has been accepted!`
              : `Your food request for "${notification.foodName}" has been rejected.`;

            notificationElement.innerHTML = `
              <div class="flex items-center p-3">
                <${icon.name} class="h-5 w-5 mr-2 ${iconClass}" />
                <span>${message}</span>
              </div>
            `;
            document.body.appendChild(notificationElement);
            setTimeout(() => {
              notificationElement.classList.add('fade-out');
              setTimeout(() => document.body.removeChild(notificationElement), 300);
            }, 3000);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching request notifications:', error);
    }
  };
  const fetchSavedDonationIds = async () => {
    try {
      setIsLoadingSavedItems(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/receiver/saved-donations/ids?userId=${currentUser.id}`
      );
      if (response.data.success) {
        setSavedFoods(response.data.savedDonationIds);
        console.log('Loaded saved donation IDs:', response.data.savedDonationIds);
      }
    } catch (error) {
      console.error('Error fetching saved donation IDs:', error);
    } finally {
      setIsLoadingSavedItems(false);
    }
  };

  const showSaveNotification = (message, type = 'success') => {
    const notification = document.createElement('div');

    // Enhanced styling with better visibility
    const baseClasses = 'notification-popup-enhanced fixed top-20 right-4 z-[9999] rounded-xl shadow-2xl p-4 flex items-start w-96 max-w-[calc(100vw-2rem)] transform transition-all duration-500 ease-out backdrop-blur-sm';
    const typeStyles = {
      success: 'bg-white/95 dark:bg-gray-800/95 border-l-4 border-green-500 shadow-green-500/20',
      error: 'bg-white/95 dark:bg-gray-800/95 border-l-4 border-red-500 shadow-red-500/20'
    };

    notification.className = `${baseClasses} ${typeStyles[type]}`;
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%) scale(0.95)';
    notification.style.filter = 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))';

    const iconHTML = {
      success: `
      <div class="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mr-3">
        <svg class="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
      </div>`,
      error: `
      <div class="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mr-3">
        <svg class="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>
      </div>`
    };

    notification.innerHTML = `
    ${iconHTML[type]}
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-gray-900 dark:text-gray-100 leading-5">
        ${message}
      </p>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        ${type === 'success' ? 'Action completed successfully' : 'Please try again'}
      </p>
    </div>
    <button class="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onclick="this.parentElement.remove()">
      <svg class="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
      </svg>
    </button>
  `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0) scale(1)';
    }, 100);

    // Auto dismiss with fade out
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%) scale(0.95)';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.parentElement.removeChild(notification);
        }
      }, 500);
    }, 4000);
  };

  useEffect(() => {
    fetchRequestNotifications();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRequestNotifications();
      }
    };

    const handleFocus = () => {
      fetchRequestNotifications();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentUser?.userId]);

  const handleViewAcceptedRequestNotification = (notification) => {
    setSelectedAcceptedNotification(notification);
    setShowAcceptedNotificationsModal(true);
  };

  useEffect(() => {
    fetchAcceptedRequestNotifications();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAcceptedRequestNotifications();
      }
    };
    const handleFocus = () => {
      fetchAcceptedRequestNotifications();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    const notificationInterval = setInterval(fetchAcceptedRequestNotifications, 120000);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(notificationInterval);
    };
  }, [currentUser?.userId]);

  const fetchOverviewData = async () => {
    try {
      setIsLoading(true);
      const authUser = JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}');
      const userId = authUser.userId || currentUser.id;
      if (!userId) {
        console.error('User ID not found in authentication data');
        setIsLoading(false);
        return;
      }

      const requestsResponse = await axios.get(
        `${API_BASE_URL}/api/receiver/food/requests?receiverId=${userId}`
      );

      if (requestsResponse.data) {
        const requests = requestsResponse.data;
        const pendingRequests = requests.filter(req => req.status === "PENDING").length;
        const acceptedRequests = requests.filter(req => req.status === "ACCEPTED").length;
        const rejectedRequests = requests.filter(req => req.status === "REJECTED").length;
        const requestedItems = requests; // All requests
        const receivedItems = requests.filter(req => req.status === "ACCEPTED"); // Only accepted items
        setOverviewStats({
          requested: requestedItems,
          received: receivedItems,
          summary: {
            totalRequested: requests.length,
            pendingRequests: pendingRequests,
            acceptedRequests: acceptedRequests,
            rejectedRequests: rejectedRequests
          }
        });
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/receiver/food/active-requests?receiverId=${currentUser.id}`
      );

      if (response.data) {
        const accepted = response.data.filter(request => request.status === "ACCEPTED");
        setAcceptedRequests(accepted);
        const seenNotifications = JSON.parse(localStorage.getItem('seenRequestNotifications') || '[]');

        const newAcceptedRequests = accepted.filter(
          request => !seenNotifications.includes(request.id)
        );

        if (newAcceptedRequests.length > 0) {
          const newNotifications = newAcceptedRequests.map(request => ({
            id: `request-${request.id}`,
            type: 'success',
            message: `Your food request for "${request.foodName}" has been accepted!`,
            time: new Date(request.responseDate).toLocaleString(),
            read: false
          }));

          setAcceptedRequestNotifications(prevNotifications => [...newNotifications, ...prevNotifications]);
          localStorage.setItem(
            'seenRequestNotifications',
            JSON.stringify([...seenNotifications, ...newAcceptedRequests.map(r => r.id)])
          );
        }
      }
    } catch (error) {
      console.error('Error fetching food requests:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (currentUser.id) {
      fetchUserRequests();
      fetchSavedDonationIds(); // Load saved donations on mount
    }
  }, [currentUser.id]);
  const handleViewAcceptedRequest = (request) => {
    setSelectedAcceptedRequest(request);
    setShowAcceptedRequestModal(true);
  };

  const handleOpenOverviewModal = () => {
    setShowOverviewModal(true);
    setTimeout(() => {
      setOverviewFormAnimation(true);
    }, 10);
    fetchOverviewData();
  };
  const handleOverviewFilterChange = (filter) => {
    setOverviewFilter(filter);
    fetchOverviewData(filter);
  };

  const closeOverviewModal = () => {
    setOverviewFormAnimation(false);
    setTimeout(() => {
      setShowOverviewModal(false);
    }, 300);
  };

  const fetchSavedDonations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/receiver/saved-donations/active?userId=${currentUser.id}`
      );

      if (response.data.success) {
        return response.data.savedDonations;
      } else {
        console.error('Failed to fetch saved donations:', response.data.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching saved donations:', error);
      showSaveNotification('Error loading saved donations', 'error');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const showSavedDonationsOverview = async () => {
    const savedDonations = await fetchSavedDonations();
    const savedStats = {
      received: [],
      requested: [],
      saved: savedDonations, // Add saved donations
      summary: {
        totalSaved: savedDonations.length,
        totalRequested: overviewStats.summary.totalRequested,
        pendingRequests: overviewStats.summary.pendingRequests,
        acceptedRequests: overviewStats.summary.acceptedRequests,
        rejectedRequests: overviewStats.summary.rejectedRequests
      }
    };

    setOverviewStats(savedStats);
    setOverviewTab('saved'); // Switch to saved tab
    handleOpenOverviewModal();
  };
  const bloodGroupOptions = [
    "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser.id) return;

      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/receiver/profile/${currentUser.id}`);

        if (response.data.success) {
          setUserProfile(response.data.data);
          setProfileFormData(response.data.data);
        } else {
          console.error('Failed to load profile:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser.id]);

  useEffect(() => {
    if (showEmergencyForm || showFoodRequestForm || showProfileModal) {
      setTimeout(() => {
        setFormAnimation(true);
      }, 10);
    } else {
      setFormAnimation(false);
    }
  }, [showEmergencyForm, showFoodRequestForm, showProfileModal]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileModalRef.current && !profileModalRef.current.contains(event.target)) {
        if (!isEditingProfile) {
          closeModal('profile');
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditingProfile]);

  const fetchAvailableFoodDonations = async () => {
    try {
      setIsLoading(true);
      console.log('Sending request to:', `${API_BASE_URL}/api/receiver/food/available`);

      const response = await axios.get(`${API_BASE_URL}/api/receiver/food/available`, {
        params: {
          category: selectedCategory !== 'All' ? selectedCategory : null,
          page: pagination.currentPage,
          size: 10
        }
      });
      console.log('API Response Status:', response.status);
      console.log('Full API Response:', response.data);

      if (response.data.error) {
        console.error('Error from server:', response.data.error);
        setAvailableFoods([]);
        setPagination({
          currentPage: response.data.currentPage || 0,
          totalPages: response.data.totalPages || 1,
          totalItems: response.data.totalItems || 0
        });
        return;
      }

      let donationsArray = [];
      if (response.data && response.data.donations && Array.isArray(response.data.donations)) {
        donationsArray = response.data.donations;
        console.log('Found donations in response.data.donations');
      } else if (response.data && Array.isArray(response.data)) {
        donationsArray = response.data;
        console.log('Found donations array directly in response.data');
      } else {
        console.error('Unexpected response format:', response.data);
        console.log('Response data structure:', JSON.stringify(response.data, null, 2));
        donationsArray = [];
      }

      console.log('Donations count:', donationsArray.length);
      if (donationsArray.length > 0) {
        console.log('First donation example:', donationsArray[0]);
      }

      const transformedDonations = donationsArray.map(donation => {
        return {
          id: donation.id,
          foodName: donation.foodName || 'Unknown Food',
          description: donation.description || 'No description available',
          category: donation.category || 'Uncategorized',
          quantity: donation.quantity || 'Unknown quantity',
          expiryDate: donation.expiryDate || 'Unknown expiry',
          location: donation.location || 'Unknown location',
          dietaryInfo: donation.dietaryInfo || [],
          distance: donation.distance || 'N/A',
          imageData: donation.imageData || donation.imageUrl,
          imageContentType: donation.imageContentType || 'image/jpeg'
        };
      });

      console.log('Transformed donations:', transformedDonations);

      setAvailableFoods(transformedDonations);

      setPagination({
        currentPage: response.data.currentPage || 0,
        totalPages: response.data.totalPages || 1,  // Default to 1 page if not specified
        totalItems: response.data.totalItems || 0
      });
    } catch (error) {
      console.error('Error fetching food donations:', error);
      if (error.response) {
        console.error('Error Status:', error.response.status);
        console.error('Error Data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error Message:', error.message);
      }
      setAvailableFoods([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableFoodDonations();
  }, [selectedCategory, pagination.currentPage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showHelpCenterModal) {
      setTimeout(() => {
        setHelpCenterAnimation(true);
      }, 10);
    } else {
      setHelpCenterAnimation(false);
    }
  }, [showHelpCenterModal]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showEmergencyForm) {
          closeModal('emergency');
        }
        if (showFoodRequestForm) {
          closeModal('food');
        }
        if (showReportModal) {
          closeReportModal();
        }
        if (showHelpCenterModal) {  // Add this line
          closeHelpCenterModal();
        }
        if (showProfileMenu) {
          setShowProfileMenu(false);
        }
        if (showNotifications) {
          setShowNotifications(false);
        }
        if (showProfileModal && !isEditingProfile) {
          closeModal('profile');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEmergencyForm, showFoodRequestForm, showProfileMenu, showNotifications, showProfileModal, isEditingProfile, showHelpCenterModal]); // Add showHelpCenterModal to dependency array

  const openHelpCenterModal = () => {
    setShowHelpCenterModal(true);
    setShowProfileMenu(false); // Close profile menu if open
  };
  const closeHelpCenterModal = () => {
    setHelpCenterAnimation(false);
    setTimeout(() => {
      setShowHelpCenterModal(false);
      setActiveHelpTab('about');
    }, 300);
  };

  const openPickupRequestModal = (food) => {
    setSelectedPickupFood(food);
    setRequestedMealCount(1);
    setRequestNote('');
    setShowPickupRequestModal(true);
    setTimeout(() => {
      setFormAnimation(true);
    }, 10);
  };

  const submitPickupRequest = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/receiver/food/pickup/${selectedPickupFood.id}`,
        null,
        {
          params: {
            receiverId: currentUser.id,
            quantity: requestedMealCount,
            pickupMethod: pickupMethod,
            ...(requestNote && { note: requestNote })
          }
        }
      );

      if (response.data.success) {
        showSuccessNotification(`Request submitted! Queue position: #${response.data.queuePosition}`);
        closePickupRequestModal();
        fetchAvailableFoodDonations(); // Refresh the list
      }
    } catch (error) {
      console.error('Error submitting pickup request:', error);
      showErrorNotification(error.response?.data?.message || 'Failed to submit pickup request');
    } finally {
      setIsSubmitting(false);
    }
  };
  const closePickupRequestModal = () => {
    setFormAnimation(false);
    setTimeout(() => {
      setShowPickupRequestModal(false);
      setSelectedPickupFood(null);
    }, 300);
  };
  const renderPickupRequestModal = () => (
    <div
      className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      style={{ opacity: formAnimation ? 1 : 0 }}
      onClick={closePickupRequestModal}
    >
      <div
        className="modal-container bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col"
        style={{
          transform: formAnimation ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600 text-white sticky top-0 z-10">
          <div className="modal-title flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-semibold text-lg">Request Food Pickup</span>
          </div>
          <button
            onClick={closePickupRequestModal}
            className="modal-close-button p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {selectedPickupFood && (
          <div className="overflow-y-auto flex-grow" style={{ maxHeight: 'calc(90vh - 130px)' }}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="rounded-lg overflow-hidden h-48 bg-gray-100">
                    <img
                      src={selectedPickupFood.imageData
                        ? `data:${selectedPickupFood.imageContentType || 'image/jpeg'};base64,${selectedPickupFood.imageData}`
                        : "/api/placeholder/400/300"}
                      alt={selectedPickupFood.foodName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/400/300";
                      }}
                    />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{selectedPickupFood.foodName}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <span className="w-28 text-gray-600 font-medium">Category:</span>
                      <span className="text-gray-800">{selectedPickupFood.category}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-28 text-gray-600 font-medium">Quantity:</span>
                      <span className="text-gray-800">{selectedPickupFood.quantity}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-28 text-gray-600 font-medium">Expires:</span>
                      <span className="text-gray-800">{selectedPickupFood.expiryDate}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-28 text-gray-600 font-medium">Location:</span>
                      <span className="text-gray-800">{selectedPickupFood.location}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-28 text-gray-600 font-medium">Description:</span>
                      <span className="text-gray-800">{selectedPickupFood.description || 'No description available'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h4 className="font-medium text-gray-700 mb-4">Request Details</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How many meals do you need?*
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setRequestedMealCount(Math.max(1, requestedMealCount - 1))}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-l-lg border border-gray-300"
                    >
                      <span className="text-xl">−</span>
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={parseInt(selectedPickupFood.quantity) || 10}
                      value={requestedMealCount}
                      onChange={(e) => setRequestedMealCount(Math.min(parseInt(e.target.value) || 1, parseInt(selectedPickupFood.quantity) || 10))}
                      className="w-16 text-center py-2 border-t border-b border-gray-300 focus:outline-none focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => setRequestedMealCount(Math.min(requestedMealCount + 1, parseInt(selectedPickupFood.quantity) || 10))}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-r-lg border border-gray-300"
                    >
                      <span className="text-xl">+</span>
                    </button>
                    <span className="ml-3 text-sm text-gray-500">
                      (Max: {parseInt(selectedPickupFood.quantity) || 'Not specified'})
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How would you like to receive this food?*
                  </label>
                  <div className="flex space-x-4">
                    <label
                      className={`pickup-method-option flex-1 cursor-pointer ${pickupMethod === 'self' ? 'selected border-green-500' : 'border-gray-300'} 
                      border-2 rounded-lg p-4 transition-all`}
                    >
                      <input
                        type="radio"
                        name="pickupMethod"
                        value="self"
                        checked={pickupMethod === 'self'}
                        onChange={() => setPickupMethod('self')}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <User className="h-8 w-8 text-green-500 mr-3" />
                          <div>
                            <span className="font-semibold block">Self Pickup</span>
                            <span className="text-xs text-gray-500">I'll collect it myself</span>
                          </div>
                        </div>
                        {pickupMethod === 'self' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </div>
                    </label>

                    <label
                      className={`pickup-method-option flex-1 cursor-pointer ${pickupMethod === 'courier' ? 'selected border-blue-500' : 'border-gray-300'} 
                      border-2 rounded-lg p-4 transition-all`}
                    >
                      <input
                        type="radio"
                        name="pickupMethod"
                        value="courier"
                        checked={pickupMethod === 'courier'}
                        onChange={() => setPickupMethod('courier')}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Truck className="h-8 w-8 text-blue-500 mr-3" />
                          <div>
                            <span className="font-semibold block">Courier/Delivery</span>
                            <span className="text-xs text-gray-500">Request delivery</span>
                          </div>
                        </div>
                        {pickupMethod === 'courier' && <CheckCircle className="h-5 w-5 text-blue-500" />}
                      </div>
                    </label>
                  </div>
                  {pickupMethod === 'courier' && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center">
                      <AlertCircle className="h-11 w-11 text-yellow-500 mr-4" />
                      <p className="text-sm text-yellow-700">
                        Note:Delivery charge of this food parcel you have to pay among there service charge,Before send request Contact with donor.
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add a note (optional)
                  </label>
                  <textarea
                    rows="3"
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="Add any dietary restrictions, pickup preferences, or other important information and also mention why you need this food."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="modal-footer p-4 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white z-10">
          <button
            type="button"
            onClick={closePickupRequestModal}
            className="btn-secondary px-4 py-2 rounded-lg text-sm border border-gray-300 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submitPickupRequest}
            className="btn-primary px-4 py-2 rounded-lg text-white text-sm bg-green-500 hover:bg-green-600 flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-1.5" />
            <span>Confirm Request</span>
          </button>
        </div>
      </div>
    </div>
  );
  const renderRequestAcceptedNotification = (notification) => {
    return (
      <div className="notification-item accepted">
        <div className="notification-icon">
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
        <div className="notification-content">
          <h4 className="notification-title">Request Accepted!</h4>
          <p className="notification-message">
            Your request for "{notification.foodName}" has been accepted.
          </p>
          <button
            className="view-details-btn"
            onClick={() => handleViewAcceptedRequestNotification(notification)}
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  const renderAcceptedRequestDetailsModal = () => {
    if (!selectedAcceptedRequest) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2 className="modal-title">Accepted Request Details</h2>
            <button
              className="modal-close-btn"
              onClick={() => setSelectedAcceptedRequest(null)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="modal-body">
            <div className="request-details">
              <div className="detail-item">
                <span className="detail-label">Food Name:</span>
                <span className="detail-value">{selectedAcceptedRequest.foodName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value">{selectedAcceptedRequest.status}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Response Date:</span>
                <span className="detail-value">
                  {new Date(selectedAcceptedRequest.responseDate).toLocaleString()}
                </span>
              </div>
              {selectedAcceptedRequest.responseNote && (
                <div className="detail-item">
                  <span className="detail-label">Donor's Note:</span>
                  <span className="detail-value">{selectedAcceptedRequest.responseNote}</span>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn-secondary"
              onClick={() => setSelectedAcceptedRequest(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleOpenProfileModal = () => {
    setShowProfileModal(true);
    setShowProfileMenu(false);
    setIsEditingProfile(false);
    setProfileError('');
    setProfileSuccess('');
    setShowPasswordSection(false);

    if (userProfile) {
      setProfileFormData({ ...userProfile });
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const updateData = new FormData();
      Object.keys(profileFormData).forEach(key => {
        if (profileFormData[key] !== userProfile[key] &&
          key !== 'userPhotoBase64' &&
          key !== 'photoContentType' &&
          key !== 'email') {
          updateData.append(key, profileFormData[key]);
        }
      });
      if (newProfilePhoto) {
        updateData.append('userPhoto', newProfilePhoto);
      }
      if (showPasswordSection &&
        passwordFormData.currentPassword &&
        passwordFormData.newPassword &&
        passwordFormData.confirmPassword) {

        if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
          setProfileError('New passwords do not match');
          setIsLoading(false);
          return;
        }

        updateData.append('currentPassword', passwordFormData.currentPassword);
        updateData.append('newPassword', passwordFormData.newPassword);
      }
      if ([...updateData.entries()].length > 0) {
        const response = await axios.put(
          `${API_BASE_URL}/api/receiver/profile/update/${currentUser.id}`,
          updateData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (response.data.success) {
          const updatedProfile = await axios.get(`${API_BASE_URL}/api/receiver/profile/${currentUser.id}`);
          if (updatedProfile.data.success) {
            setUserProfile(updatedProfile.data.data);
            setProfileFormData(updatedProfile.data.data);
            setProfileSuccess('Profile updated successfully');
            setIsEditingProfile(false);
            setNewProfilePhoto(null);
            setPhotoPreview(null);
            setShowPasswordSection(false);
            setPasswordFormData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
          }
        } else {
          setProfileError(response.data.message || 'Failed to update profile');
        }
      } else {
        setProfileSuccess('No changes to save');
        setIsEditingProfile(false);
      }
    } catch (err) {
      setProfileError('An error occurred while updating your profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setProfileError('Please enter your password to confirm account deletion');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/receiver/profile/${currentUser.id}?password=${deletePassword}`
      );
      if (response.data.success) {
        localStorage.removeItem('authUser');
        sessionStorage.removeItem('authUser');
        setProfileSuccess('Your account has been successfully deleted');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setProfileError(response.data.message || 'Failed to delete account');
      }
    } catch (err) {
      setProfileError('An error occurred while deleting your account');
      console.error(err);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('authUser');
    sessionStorage.removeItem('authUser');
    const notification = document.createElement('div');
    notification.className = 'notification-dropdown';
    notification.innerHTML = '<div class="flex items-center p-3"><CheckCircle class="h-5 w-5 mr-2 text-green-500" /><span>Logged out successfully!</span></div>';
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(notification);
        navigate('/');
      }, 300);
    }, 1500);
  };
  const closeModal = (type) => {
    setFormAnimation(false);
    setTimeout(() => {
      if (type === 'emergency') {
        setShowEmergencyForm(false);
      } else if (type === 'food') {
        setShowFoodRequestForm(false);
      } else if (type === 'profile') {
        setShowProfileModal(false);
        setIsEditingProfile(false);
        setProfileError('');
        setProfileSuccess('');
        setShowPasswordSection(false);
        setShowDeleteConfirm(false);
      }
    }, 300);
  };
  const handleCancelProfileEdit = () => {
    setProfileFormData({ ...userProfile });
    setNewProfilePhoto(null);
    setPhotoPreview(null);
    setIsEditingProfile(false);
    setProfileError('');
    setProfileSuccess('');
    setShowPasswordSection(false);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleFormChange = (field, value) => {
    setEmergencyForm({
      ...emergencyForm,
      [field]: value
    });
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if user can make new request (rate limiting)
      const eligibilityResponse = await axios.get(
        `${API_BASE_URL}/api/receiver/emergency-requests/user/${currentUser.id}/can-request`
      );

      if (!eligibilityResponse.data.canMakeRequest) {
        showErrorNotification(eligibilityResponse.data.message || 'You have reached the daily limit for emergency requests');
        setIsSubmitting(false);
        return;
      }

      // Create FormData for multipart request
      const formData = new FormData();
      formData.append('userId', currentUser.id);
      formData.append('title', emergencyForm.title);
      formData.append('description', emergencyForm.description);
      formData.append('location', emergencyForm.location);
      formData.append('category', emergencyForm.category);
      formData.append('peopleCount', emergencyForm.peopleCount);
      formData.append('urgency', emergencyForm.urgency);

      // Add user information if available
      if (userProfile) {
        formData.append('requesterName', `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim());
        formData.append('requesterEmail', userProfile.email || currentUser.email);
        formData.append('requesterPhone', userProfile.phone || '');
      } else {
        formData.append('requesterName', currentUser.name);
        formData.append('requesterEmail', currentUser.email);
      }

      // Add image if provided
      if (emergencyForm.image) {
        formData.append('image', emergencyForm.image);
      }

      // Submit emergency request
      const response = await axios.post(
        `${API_BASE_URL}/api/receiver/emergency-requests`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        // Show success notification with additional details
        const successMessage = response.data.urgentAlert
          ? `${response.data.message}\n\n⚠️ ${response.data.urgentAlert}`
          : response.data.message;

        showSuccessNotification(successMessage);

        // Create detailed success notification
        const notification = document.createElement('div');
        notification.className = 'notification-dropdown fixed top-20 right-4 z-50 bg-white rounded-lg shadow-xl border-l-4 border-green-500 p-4 flex items-start w-96 transform transition-all duration-500 ease-in-out';
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';

        const urgentBadge = response.data.urgentAlert
          ? '<div class="mt-2 bg-red-100 border border-red-200 rounded p-2"><span class="text-red-700 text-xs font-medium">🚨 URGENT: Admin has been notified immediately</span></div>'
          : '';

        notification.innerHTML = `
        <div class="bg-green-100 p-2 rounded-full mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="font-medium text-gray-800 mb-1">Emergency Request Submitted!</h3>
          <div class="text-sm text-gray-600">
            <p class="mb-2">Your emergency food request has been submitted successfully.</p>
            <div class="bg-green-50 p-2 rounded text-sm">
              <p class="text-green-700 font-medium">Request Details:</p>
              <ul class="list-disc list-inside text-green-700 text-xs mt-1">
                <li>Request ID: ${response.data.requestId}</li>
                <li>Title: ${emergencyForm.title}</li>
                <li>Urgency: ${emergencyForm.urgency}</li>
                <li>People Count: ${emergencyForm.peopleCount}</li>
                <li>Category: ${emergencyForm.category}</li>
                <li>Priority Score: ${response.data.priorityScore}</li>
                <li>Status: ${response.data.status}</li>
              </ul>
            </div>
            ${urgentBadge}
            <p class="mt-2 text-gray-600 text-xs">You will receive email updates about your request status. Check your notifications regularly.</p>
          </div>
        </div>
        <button class="text-gray-400 hover:text-gray-600 ml-4" onclick="this.parentElement.remove()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      `;

        document.body.appendChild(notification);
        setTimeout(() => {
          notification.style.opacity = '1';
          notification.style.transform = 'translateX(0)';
        }, 100);
        setTimeout(() => {
          notification.style.opacity = '0';
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (notification.parentElement) {
              notification.parentElement.removeChild(notification);
            }
          }, 500);
        }, 8000);

        // Reset form and close modal
        setEmergencyForm({
          title: '',
          description: '',
          location: '',
          category: 'meal',
          peopleCount: 1,
          image: null,
          urgency: 'high'
        });
        closeModal('emergency');

        // Optionally refresh any emergency requests list if displayed
        // fetchUserEmergencyRequests();

      } else {
        showErrorNotification(response.data.message || 'Failed to submit emergency request');
      }
    } catch (error) {
      console.error('Error submitting emergency request:', error);

      let errorMessage = 'Failed to submit emergency request. Please try again.';

      if (error.response?.status === 429) {
        errorMessage = 'You have reached the daily limit for emergency requests. Please try again tomorrow.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showErrorNotification(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to fetch user's emergency requests
  const fetchUserEmergencyRequests = async (page = 0, size = 10) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/receiver/emergency-requests/user/${currentUser.id}`,
        {
          params: { page, size }
        }
      );

      if (response.data.success) {
        return response.data;
      } else {
        console.error('Failed to fetch emergency requests:', response.data.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching emergency requests:', error);
      return null;
    }
  };

  // Helper function to get user's active emergency requests
  const fetchActiveEmergencyRequests = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/receiver/emergency-requests/user/${currentUser.id}/active`
      );

      if (response.data.success) {
        return response.data.requests;
      } else {
        console.error('Failed to fetch active emergency requests:', response.data.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching active emergency requests:', error);
      return [];
    }
  };

  // Helper function to cancel emergency request
  const cancelEmergencyRequest = async (requestId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/receiver/emergency-requests/${requestId}/cancel`,
        null,
        {
          params: { userId: currentUser.id }
        }
      );

      if (response.data.success) {
        showSuccessNotification('Emergency request cancelled successfully');
        // Refresh the requests list
        fetchUserEmergencyRequests();
        return true;
      } else {
        showErrorNotification(response.data.message || 'Failed to cancel emergency request');
        return false;
      }
    } catch (error) {
      console.error('Error cancelling emergency request:', error);
      showErrorNotification('Failed to cancel emergency request');
      return false;
    }
  };

  const handleFoodRequestSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('userId', currentUser.id);
      formDataObj.append('priority', formData.priority);
      formDataObj.append('peopleCount', formData.peopleCount);
      formDataObj.append('timeNeeded', formData.timeNeeded);
      formDataObj.append('location', formData.location);
      formDataObj.append('deliveryPreference', formData.deliveryPreference);
      if (formData.foodTypes && formData.foodTypes.length > 0) {
        formData.foodTypes.forEach(type => {
          formDataObj.append('foodTypes', type);
        });
      } else {
        formDataObj.append('foodTypes', 'any'); // Default value
      }

      if (formData.recipients && formData.recipients.length > 0) {
        formData.recipients.forEach(recipient => {
          formDataObj.append('recipients', recipient);
        });
      } else {
        formDataObj.append('recipients', 'donors'); // Default value
      }
      if (formData.specificDate) formDataObj.append('specificDate', formData.specificDate);
      if (formData.specificTime) formDataObj.append('specificTime', formData.specificTime);
      if (formData.notes) formDataObj.append('notes', formData.notes);
      if (formData.image) formDataObj.append('image', formData.image);

      const response = await axios.post(
        `${API_BASE_URL}/api/receiver/food/request`,
        formDataObj,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      if (response.data.success) {
        showSuccessNotification();
        closeModal('food');
        setFormData({
          priority: 'medium',
          foodTypes: [],
          recipients: ['donors'],
          peopleCount: 1,
          timeNeeded: 'today',
          specificDate: '',
          specificTime: '',
          location: '',
          deliveryPreference: 'pickup',
          notes: '',
          image: null
        });
      }
    } catch (error) {
      console.error('Error submitting food request:', error);
      showErrorNotification(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSwitchToDonorDashboard = () => {
    handleOpenOverviewModal();
  };

  const toggleFavorite = (id) => {
    console.log(`Toggling favorite status for food item ${id}`);
  };

  const toggleSaveFood = async (id) => {
    try {
      const isSaved = savedFoods.includes(id);

      if (isSaved) {
        const response = await axios.delete(
          `${API_BASE_URL}/api/receiver/saved-donations/${id}?userId=${currentUser.id}`
        );

        if (response.data.success) {
          setSavedFoods(savedFoods.filter(itemId => itemId !== id));
          showSaveNotification('Food removed from saved items', 'success');
        } else {
          showSaveNotification(response.data.message || 'Failed to remove saved item', 'error');
        }
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/api/receiver/saved-donations/${id}?userId=${currentUser.id}`
        );
        if (response.data.success) {
          setSavedFoods([...savedFoods, id]);
          showSaveNotification('Food saved to your collection!', 'success');
        } else {
          showSaveNotification(response.data.message || 'Failed to save item', 'error');
        }
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
      const errorMessage = error.response?.data?.message || 'Error saving food item. Please try again.';
      showSaveNotification(errorMessage, 'error');
    }
  };
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleCategoryChange = (category) => {
    console.log('Category changed to:', category);
    setSelectedCategory(category);
    // Reset pagination when changing category
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && searchInputRef.current && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderAcceptedRequestsSection = () => (
    <div className="mt-6">
      <h4 className="font-medium text-gray-700 mb-3">Recently Accepted Requests</h4>
      {acceptedRequests.length > 0 ? (
        <div className="space-y-3">
          {acceptedRequests.slice(0, 3).map(request => (
            <div key={request.id} className="bg-white border border-green-100 rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-gray-800">{request.foodName}</h5>
                  <p className="text-sm text-gray-500">
                    Accepted on {new Date(request.responseDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Accepted
                </span>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => handleViewAcceptedRequest(request)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </button>
              </div>
            </div>
          ))}

          {acceptedRequests.length > 3 && (
            <button
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
              onClick={() => setOverviewTab('accepted')}
            >
              View All Accepted Requests
            </button>
          )}
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Package className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-gray-700 font-medium mb-1">No accepted requests</h3>
          <p className="text-gray-500 text-sm">
            Your accepted requests will appear here.
          </p>
        </div>
      )}
    </div>
  );
  const renderProfileModal = () => (
    <div
      className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      style={{ opacity: formAnimation ? 1 : 0 }}
      onClick={() => !isEditingProfile && closeModal('profile')}
    >
      <div
        ref={profileModalRef}
        className={`modal-container rounded-xl shadow-xl overflow-hidden w-full max-w-4xl max-h-[90vh] ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
          }`}
        style={{
          transform: formAnimation ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header sticky top-0 z-10 flex justify-between items-center p-4 bg-green-600 text-white">
          <div className="modal-title flex items-center">
            <User className="h-6 w-6 mr-2" />
            <span className="font-semibold text-lg">{isEditingProfile ? 'Edit Profile' : 'My Profile'}</span>
          </div>
          <button
            onClick={() => closeModal('profile')}
            className="modal-close-button p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div
          className="overflow-y-auto overflow-x-hidden"
          style={{
            maxHeight: 'calc(90vh - 72px)', /* 72px accounts for header height + potential footer */
            scrollbarWidth: 'thin',
            scrollbarColor: darkMode
              ? 'rgba(156, 163, 175, 0.5) rgba(55, 65, 81, 0.5)'
              : 'rgba(156, 163, 175, 0.5) rgba(229, 231, 235, 0.5)'
          }}
        >
          {profileError && (
            <div className={`p-4 mx-4 mt-4 rounded-lg flex items-center ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
              }`}>
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className={`p-4 mx-4 mt-4 rounded-lg flex items-center ${darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
              }`}>
              <Check className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Photo and Basic Info */}
              <div className="md:col-span-1">
                <div className="flex flex-col items-center">
                  {/* Profile Photo */}
                  <div className="relative mb-6">
                    <div className={`w-36 h-36 rounded-full overflow-hidden border-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : userProfile && userProfile.userPhotoBase64 ? (
                        <img
                          src={`data:${userProfile.photoContentType || 'image/jpeg'};base64,${userProfile.userPhotoBase64}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                          <User className={`w-20 h-20 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        </div>
                      )}
                    </div>
                    {isEditingProfile && (
                      <label htmlFor="profile-photo" className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition">
                        <Camera className="w-5 h-5 text-white" />
                        <input
                          type="file"
                          id="profile-photo"
                          className="hidden"
                          accept="image/*"
                          onChange={handleProfilePhotoChange}
                          disabled={isLoading}
                        />
                      </label>
                    )}
                  </div>
                  <h2 className={`text-xl font-semibold mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'User Name'}
                  </h2>
                  <p className="flex items-center mb-4 text-gray-500">
                    <Mail className="w-4 h-4 mr-1" />
                    {userProfile ? userProfile.email : 'user@example.com'}
                  </p>
                  <div className={`w-full rounded-lg p-4 mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                    <h3 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Phone className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {userProfile ? userProfile.phone : 'Not provided'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {userProfile ? userProfile.address : 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition"
                      disabled={isLoading}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="space-y-2 w-full">
                      <button
                        onClick={handleCancelProfileEdit}
                        className={`w-full px-4 py-2 rounded-lg flex items-center justify-center hover:bg-gray-300 transition ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700'
                          }`}
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className={`w-full px-4 py-2 rounded-lg flex items-center justify-center transition ${darkMode
                          ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                        disabled={isLoading}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Delete Account
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <form onSubmit={handleProfileSubmit}>
                  {/* Personal Information Section */}
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold border-b pb-2 mb-4 flex items-center ${darkMode
                      ? 'text-gray-100 border-gray-700'
                      : 'text-gray-800 border-gray-200'
                      }`}>
                      <User className="w-5 h-5 mr-2 text-blue-500" />
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          First Name
                        </label>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            name="firstName"
                            value={profileFormData.firstName || ''}
                            onChange={handleProfileInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'bg-white border-gray-300 text-gray-800'
                              }`}
                            disabled={isLoading}
                            required
                          />
                        ) : (
                          <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                            {userProfile?.firstName || 'Not provided'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Last Name
                        </label>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            name="lastName"
                            value={profileFormData.lastName || ''}
                            onChange={handleProfileInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'bg-white border-gray-300 text-gray-800'
                              }`}
                            disabled={isLoading}
                            required
                          />
                        ) : (
                          <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                            {userProfile?.lastName || 'Not provided'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Blood Group
                        </label>
                        {isEditingProfile ? (
                          <select
                            name="bloodGroup"
                            value={profileFormData.bloodGroup || ''}
                            onChange={handleProfileInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'bg-white border-gray-300 text-gray-800'
                              }`}
                            disabled={isLoading}
                          >
                            <option value="">Select Blood Group</option>
                            {bloodGroupOptions.map(group => (
                              <option key={group} value={group}>{group}</option>
                            ))}
                          </select>
                        ) : (
                          <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                            {userProfile?.bloodGroup || 'Not provided'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Date of Birth
                        </label>
                        {isEditingProfile ? (
                          <input
                            type="date"
                            name="birthdate"
                            value={profileFormData.birthdate || ''}
                            onChange={handleProfileInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'bg-white border-gray-300 text-gray-800'
                              }`}
                            disabled={isLoading}
                          />
                        ) : (
                          <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                            {userProfile?.birthdate || 'Not provided'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Phone Number
                        </label>
                        {isEditingProfile ? (
                          <input
                            type="tel"
                            name="phone"
                            value={profileFormData.phone || ''}
                            onChange={handleProfileInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'bg-white border-gray-300 text-gray-800'
                              }`}
                            disabled={isLoading}
                            required
                          />
                        ) : (
                          <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                            {userProfile?.phone || 'Not provided'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold border-b pb-2 mb-4 flex items-center ${darkMode
                      ? 'text-gray-100 border-gray-700'
                      : 'text-gray-800 border-gray-200'
                      }`}>
                      <MapPin className="w-5 h-5 mr-2 text-green-500" />
                      Address Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Address
                        </label>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            name="address"
                            value={profileFormData.address || ''}
                            onChange={handleProfileInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'bg-white border-gray-300 text-gray-800'
                              }`}
                            disabled={isLoading}
                            required
                          />
                        ) : (
                          <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                            {userProfile?.address || 'Not provided'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Address Description
                        </label>
                        {isEditingProfile ? (
                          <textarea
                            name="addressDescription"
                            value={profileFormData.addressDescription || ''}
                            onChange={handleProfileInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'bg-white border-gray-300 text-gray-800'
                              }`}
                            disabled={isLoading}
                            rows="3"
                          ></textarea>
                        ) : (
                          <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                            {userProfile?.addressDescription || 'Not provided'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold border-b pb-2 mb-4 flex items-center ${darkMode
                      ? 'text-gray-100 border-gray-700'
                      : 'text-gray-800 border-gray-200'
                      }`}>
                      <Shield className="w-5 h-5 mr-2 text-purple-500" />
                      Identification
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          National ID
                        </label>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            name="nationalId"
                            value={profileFormData.nationalId || ''}
                            onChange={handleProfileInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'bg-white border-gray-300 text-gray-800'
                              }`}
                            disabled={isLoading}
                          />
                        ) : (
                          <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                            {userProfile?.nationalId || 'Not provided'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Passport Number
                        </label>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            name="passportNumber"
                            value={profileFormData.passportNumber || ''}
                            onChange={handleProfileInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'bg-white border-gray-300 text-gray-800'
                              }`}
                            disabled={isLoading}
                          />
                        ) : (
                          <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                            {userProfile?.passportNumber || 'Not provided'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Birth Certificate
                        </label>
                        {isEditingProfile ? (
                          <input
                            type="text"
                            name="birthCertificateNumber"
                            value={profileFormData.birthCertificateNumber || ''}
                            onChange={handleProfileInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'bg-white border-gray-300 text-gray-800'
                              }`}
                            disabled={isLoading}
                          />
                        ) : (
                          <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                            {userProfile?.birthCertificateNumber || 'Not provided'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold border-b pb-2 mb-4 flex items-center ${darkMode
                      ? 'text-gray-100 border-gray-700'
                      : 'text-gray-800 border-gray-200'
                      }`}>
                      <Info className="w-5 h-5 mr-2 text-blue-500" />
                      About Me
                    </h3>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Bio
                      </label>
                      {isEditingProfile ? (
                        <textarea
                          name="bio"
                          value={profileFormData.bio || ''}
                          onChange={handleProfileInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-100'
                            : 'bg-white border-gray-300 text-gray-800'
                            }`}
                          disabled={isLoading}
                          rows="4"
                        ></textarea>
                      ) : (
                        <div className={`px-3 py-2 rounded-lg min-h-[100px] ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                          }`}>
                          {userProfile?.bio || 'No bio provided'}
                        </div>
                      )}
                    </div>
                  </div>
                  {isEditingProfile && (
                    <div className="mb-6">
                      <div className={`flex items-center justify-between border-b pb-2 mb-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                        <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'
                          }`}>
                          <Lock className="w-5 h-5 mr-2 text-red-500" />
                          Change Password
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowPasswordSection(!showPasswordSection)}
                          className={`text-sm hover:text-blue-700 ${darkMode ? 'text-blue-400' : 'text-blue-500'
                            }`}
                        >
                          {showPasswordSection ? 'Cancel' : 'Change Password'}
                        </button>
                      </div>
                      {showPasswordSection && (
                        <div className="space-y-4">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                              Current Password
                            </label>
                            <input
                              type="password"
                              name="currentPassword"
                              value={passwordFormData.currentPassword}
                              onChange={handlePasswordChange}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-100'
                                : 'bg-white border-gray-300 text-gray-800'
                                }`}
                              disabled={isLoading}
                              required={showPasswordSection}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                              New Password
                            </label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordFormData.newPassword}
                              onChange={handlePasswordChange}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-100'
                                : 'bg-white border-gray-300 text-gray-800'
                                }`}
                              disabled={isLoading}
                              required={showPasswordSection}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordFormData.confirmPassword}
                              onChange={handlePasswordChange}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-100'
                                : 'bg-white border-gray-300 text-gray-800'
                                }`}
                              disabled={isLoading}
                              required={showPasswordSection}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
        {isEditingProfile && (
          <div className={`sticky bottom-0 w-full p-4 border-t z-10 flex justify-end ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            <button
              onClick={handleProfileSubmit}
              className="px-6 py-2 bg-green-500 text-white rounded-lg flex items-center hover:bg-green-600 transition"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black bg-opacity-70">
          <div className={`rounded-lg p-6 w-full max-w-md ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
            }`}>
            <h3 className="text-xl font-bold text-red-600 mb-4">Delete Account</h3>
            <p className={darkMode ? 'text-gray-300 mb-4' : 'text-gray-700 mb-4'}>
              Are you sure you want to delete your account? This action cannot be undone, and all your data will be permanently removed.
            </p>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-800'
                  }`}
                disabled={isLoading}
                placeholder="Your current password"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 rounded-lg transition ${darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center"
                disabled={isLoading || !deletePassword}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  const renderProfileMenu = () => (
    <div
      ref={profileMenuRef}
      className={`profile-dropdown fixed top-20 right-4 z-50 w-[350px] rounded-xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      style={{
        display: showProfileMenu ? 'block' : 'none',
        maxHeight: 'calc(100vh - 150px)',
        boxShadow: darkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
    >
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white relative flex items-center">
        <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden mr-4 flex-shrink-0">
          {userProfile && userProfile.userPhotoBase64 ? (
            <img
              src={`data:${userProfile.photoContentType || 'image/jpeg'};base64,${userProfile.userPhotoBase64}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-full h-full text-white/50 p-3" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">
            {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : currentUser.name}
          </h3>
          <p className="text-sm opacity-80 truncate mb-3">
            {userProfile ? userProfile.email : currentUser.email}
          </p>
        </div>
        <button
          onClick={() => setShowProfileMenu(false)}
          className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4 space-y-1">
        <div className={`text-xs uppercase px-4 mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ACCOUNT</div>
        <button
          onClick={handleOpenProfileModal}
          className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${darkMode
            ? 'hover:bg-gray-700 text-gray-200'
            : 'hover:bg-gray-100 text-gray-700'
            }`}
        >
          <User className="h-5 w-5 text-blue-500 mr-3" />
          <span>My Profile</span>
        </button>

        <div className={`text-xs uppercase px-4 mt-4 mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>SUPPORT</div>
        <button
          onClick={openHelpCenterModal}  // Add this onClick handler
          className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${darkMode
            ? 'hover:bg-gray-700 text-gray-200'
            : 'hover:bg-gray-100 text-gray-700'
            }`}
        >
          <HelpCircle className="h-5 w-5 text-yellow-500 mr-3" />
          <span>Help Center</span>
        </button>
        <button
          onClick={handleLogout}
          className={`w-full text-left px-4 py-3 rounded-lg flex items-center text-red-600 ${darkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'
            }`}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  const renderEmergencyForm = () => (
    <div
      className="modal-overlay"
      style={{
        opacity: formAnimation ? 1 : 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
        transition: 'opacity 0.3s ease'
      }}
      onClick={() => closeModal('emergency')}
    >
      <div
        className="modal-container bg-white rounded-xl shadow-xl overflow-hidden max-w-2xl w-full"
        style={{
          transform: formAnimation ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex justify-between items-center p-4 border-b border-gray-200">
          <div className="modal-title flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="font-semibold text-lg">Emergency Food Alert</span>
          </div>
          <button
            onClick={() => closeModal('emergency')}
            className="modal-close-button p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="modal-content custom-scrollbar max-h-[70vh] overflow-y-auto p-6">
          <form onSubmit={handleEmergencySubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-lg">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Emergency Title*</label>
                  <input
                    type="text"
                    required
                    className="search-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={emergencyForm.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="e.g., Flood victims need meals"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Number of People*</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="search-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={emergencyForm.peopleCount}
                    onChange={(e) => handleFormChange('peopleCount', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description*</label>
                <textarea
                  className="search-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  required
                  value={emergencyForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Describe the emergency situation and food needs"
                ></textarea>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <Coffee className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-lg">Food Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Food Category*</label>
                  <select
                    className="search-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={emergencyForm.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    required
                  >
                    <option value="meal">Complete Meals</option>
                    <option value="water">Drinking Water</option>
                    <option value="dry">Dry Rations</option>
                    <option value="baby">Baby Food</option>
                    <option value="mixed">Mixed Food Items</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Urgency Level*</label>
                  <select
                    className="search-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={emergencyForm.urgency}
                    onChange={(e) => handleFormChange('urgency', e.target.value)}
                    required
                  >
                    <option value="critical">Critical - Need within hours</option>
                    <option value="high">High - Need today</option>
                    <option value="medium">Medium - Need within 24 hours</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold text-lg">Location</h3>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  className="search-input flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={emergencyForm.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  placeholder="Enter location or use current location"
                  required
                />
                <button
                  type="button"
                  className="btn-secondary px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                >
                  <MapPin className="h-5 w-5 text-blue-500" />
                </button>
              </div>
              <div className="border border-gray-300 rounded-lg h-48 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Map className="h-8 w-8 mx-auto mb-2" />
                  <p>Map preview will appear here</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <Camera className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold text-lg">Upload Image</h3>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition duration-300 cursor-pointer">
                <input
                  type="file"
                  id="image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFormChange('image', e.target.files[0])}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => closeModal('emergency')}
            className="btn-secondary px-4 py-2 rounded-lg text-sm border border-gray-300 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleEmergencySubmit}  // NEW HANDLER
            className="btn-primary px-4 py-2 rounded-lg text-white text-sm bg-red-500 hover:bg-red-600 flex items-center space-x-2"
            disabled={isSubmitting}
          >
            <AlertCircle className="h-4 w-4" />
            <span>Submit Emergency Alert</span>
          </button>
        </div>
      </div>
    </div>
  );

  const showSuccessNotification = () => {
    const notification = document.createElement('div');
    notification.className = 'notification-dropdown fixed top-20 right-4 z-50 bg-white rounded-lg shadow-xl border-l-4 border-green-500 p-4 flex items-start w-96 transform transition-all duration-500 ease-in-out';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';

    notification.innerHTML = `
      <div class="bg-green-100 p-2 rounded-full mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="font-medium text-gray-800 mb-1">Food Request Submitted Successfully!</h3>
        <div class="text-sm text-gray-600">
          <p>Your request has been submitted and will be reviewed by donors. Please check your notifications for updates.</p>
          <div class="mt-2 bg-green-50 p-2 rounded text-sm">
            <p class="text-green-700 font-medium">Request Details:</p>
            <ul class="list-disc list-inside text-green-700 text-xs mt-1">
              <li>Priority: ${formData.priority || 'Medium'}</li>
              <li>Food Types: ${formData.foodTypes?.join(', ') || 'Not specified'}</li>
              <li>People Count: ${formData.peopleCount || '1'}</li>
              <li>When Needed: ${formData.timeNeeded || 'Today'}</li>
              <li>Delivery: ${formData.deliveryPreference === 'pickup' ? 'Self Pickup' : 'Request Delivery'}</li>
            </ul>
          </div>
        </div>
      </div>
      <button class="text-gray-400 hover:text-gray-600 ml-4" onclick="this.parentElement.remove()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 8000);
  };

  const showErrorNotification = (errorMessage) => {
    const notification = document.createElement('div');
    notification.className = 'notification-dropdown fixed top-20 right-4 z-50 bg-white rounded-lg shadow-xl border-l-4 border-red-500 p-4 flex items-start w-96 transform transition-all duration-500 ease-in-out';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';

    notification.innerHTML = `
      <div class="bg-red-100 p-2 rounded-full mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="font-medium text-gray-800 mb-1">Food Request Failed</h3>
        <p class="text-sm text-gray-600">${errorMessage || 'There was an error submitting your food request. Please try again.'}</p>
      </div>
      <button class="text-gray-400 hover:text-gray-600 ml-4" onclick="this.parentElement.remove()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 8000);
  };

  const showDedicatedSavedDonationsModal = async () => {
    setShowSavedDonationsModal(true);
    setTimeout(() => {
      setSavedDonationsFormAnimation(true);
    }, 10);

    try {
      setIsLoadingSavedDonations(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/receiver/saved-donations/active?userId=${currentUser.id}`
      );

      if (response.data.success) {
        setSavedDonationsData(response.data.savedDonations);
      } else {
        console.error('Failed to fetch saved donations:', response.data.message);
        setSavedDonationsData([]);
      }
    } catch (error) {
      console.error('Error fetching saved donations:', error);
      showSaveNotification('Error loading saved donations', 'error');
      setSavedDonationsData([]);
    } finally {
      setIsLoadingSavedDonations(false);
    }
  };

  const closeSavedDonationsModal = () => {
    setSavedDonationsFormAnimation(false);
    setTimeout(() => {
      setShowSavedDonationsModal(false);
      setSavedDonationsData([]);
    }, 300);
  };

  const renderFoodRequestForm = () => (
    <div
      className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 dark:bg-opacity-80 z-50"
      style={{ opacity: formAnimation ? 1 : 0, transition: 'opacity 0.3s ease' }}
      onClick={() => closeModal('food')}
    >
      <div
        className={`modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-3xl w-full`}
        style={{
          transform: formAnimation ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-green-600 text-white">
          <div className="modal-title flex items-center">
            <PlusCircle className="h-5 w-5 mr-3" />
            <span className="font-bold text-xl">Request Food Assistance</span>
          </div>
          <button
            onClick={() => closeModal('food')}
            className="modal-close-button p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="modal-content custom-scrollbar max-h-[70vh] overflow-y-auto p-6 dark:text-gray-100">
          <form onSubmit={handleFoodRequestSubmit} className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-1">Request Priority</h3>
                <p className="text-amber-600 dark:text-amber-300 text-sm">Please indicate how urgently you need this food assistance. Higher priority requests will be highlighted to donors and admins.</p>
              </div>
            </div>
            <div className="priority-selection">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Request Priority</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: 'low', label: 'Low Priority',
                    activeLight: 'border-green-200 bg-green-50 text-green-700',
                    activeDark: 'dark:border-green-600 dark:bg-green-900/40 dark:text-green-300',
                    inactiveLight: 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                    inactiveDark: 'dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-gray-500'
                  },
                  {
                    id: 'medium', label: 'Medium Priority',
                    activeLight: 'border-blue-200 bg-blue-50 text-blue-700',
                    activeDark: 'dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
                    inactiveLight: 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                    inactiveDark: 'dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-gray-500'
                  },
                  {
                    id: 'high', label: 'High Priority',
                    activeLight: 'border-red-200 bg-red-50 text-red-700',
                    activeDark: 'dark:border-red-600 dark:bg-red-900/40 dark:text-red-300',
                    inactiveLight: 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                    inactiveDark: 'dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-gray-500'
                  }
                ].map((priority) => (
                  <label
                    key={priority.id}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${formData.priority === priority.id
                      ? `${priority.activeLight} ${priority.activeDark} shadow-sm`
                      : `${priority.inactiveLight} ${priority.inactiveDark}`
                      }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority.id}
                      checked={formData.priority === priority.id}
                      onChange={() => setFormData({ ...formData, priority: priority.id })}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{priority.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">What type of food assistance do you need?</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'meals', label: 'Ready Meals', icon: <Utensils className="h-5 w-5 mb-2 text-blue-500 dark:text-blue-400" /> },
                  { id: 'groceries', label: 'Groceries', icon: <ShoppingBag className="h-5 w-5 mb-2 text-green-500 dark:text-green-400" /> },
                  { id: 'bakery', label: 'Bakery Items', icon: <Coffee className="h-5 w-5 mb-2 text-amber-500 dark:text-amber-400" /> },
                  { id: 'vegetables', label: 'Vegetables', icon: <Leaf className="h-5 w-5 mb-2 text-green-600 dark:text-green-400" /> },
                  { id: 'cookingMaterial', label: 'Cooking Materials', icon: <Utensils className="h-5 w-5 mb-2 text-purple-500 dark:text-purple-400" /> },
                  { id: 'specialNeeds', label: 'Special Dietary', icon: <Heart className="h-5 w-5 mb-2 text-red-500 dark:text-red-400" /> },
                  { id: 'babyFood', label: 'Baby Food', icon: <Gift className="h-5 w-5 mb-2 text-pink-500 dark:text-pink-400" /> },
                  { id: 'emergencyKit', label: 'Emergency Kit', icon: <AlertCircle className="h-5 w-5 mb-2 text-red-500 dark:text-red-400" /> },
                  { id: 'other', label: 'Other Items', icon: <FileText className="h-5 w-5 mb-2 text-gray-500 dark:text-gray-400" /> },
                ].map((type) => (
                  <label
                    key={type.id}
                    className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-md flex flex-col items-center justify-center cursor-pointer text-center ${formData.foodTypes.includes(type.id)
                      ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-200'
                      }`}
                  >
                    <input
                      type="checkbox"
                      id={`type-${type.id}`}
                      checked={formData.foodTypes.includes(type.id)}
                      onChange={() => {
                        const newTypes = formData.foodTypes.includes(type.id)
                          ? formData.foodTypes.filter(id => id !== type.id)
                          : [...formData.foodTypes, type.id];
                        setFormData({ ...formData, foodTypes: newTypes });
                      }}
                      className="sr-only"
                    />
                    {type.icon}
                    <span className="block text-sm font-medium">{type.label}</span>

                    {formData.foodTypes.includes(type.id) && (
                      <div className="absolute top-2 right-2 bg-blue-500 dark:bg-blue-600 rounded-full p-1">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Send Request To:</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'donors', label: 'All Eligible Donors', description: 'Food donors in your area' },
                  { id: 'merchants', label: 'Food Merchants', description: 'Restaurants and stores with excess food' },
                  { id: 'admin', label: 'FoodBridge Admin', description: 'For custom assistance' },
                ].map((recipient) => (
                  <label
                    key={recipient.id}
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-md flex flex-col cursor-pointer ${formData.recipients.includes(recipient.id)
                      ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/40'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id={`recipient-${recipient.id}`}
                        checked={formData.recipients.includes(recipient.id)}
                        onChange={() => {
                          const newRecipients = formData.recipients.includes(recipient.id)
                            ? formData.recipients.filter(id => id !== recipient.id)
                            : [...formData.recipients, recipient.id];
                          setFormData({ ...formData, recipients: newRecipients });
                        }}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-500 text-blue-600 dark:text-blue-500 mt-1 mr-2"
                      />
                      <div>
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">{recipient.label}</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">{recipient.description}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">How many people need food?</label>
                <div className="flex items-center">
                  <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-l-lg border border-gray-300 dark:border-gray-600 border-r-0">
                    <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={formData.peopleCount}
                    onChange={(e) => setFormData({ ...formData, peopleCount: parseInt(e.target.value) })}
                    className="search-input flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500"
                    placeholder="Number of people"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">When do you need it?</label>
                <div className="relative">
                  <div className="flex">
                    <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-l-lg border border-gray-300 dark:border-gray-600 border-r-0">
                      <Clock className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </span>
                    <select
                      value={formData.timeNeeded}
                      onChange={(e) => setFormData({ ...formData, timeNeeded: e.target.value })}
                      className="search-input appearance-none flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 pr-10"
                      required
                    >
                      <option value="urgent">Urgently (within hours)</option>
                      <option value="today">Today</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="this-week">This week</option>
                      <option value="specific">Specific date & time</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {formData.timeNeeded === 'specific' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Specific Date</label>
                  <div className="flex">
                    <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-l-lg border border-gray-300 dark:border-gray-600 border-r-0">
                      <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </span>
                    <input
                      type="date"
                      value={formData.specificDate}
                      onChange={(e) => setFormData({ ...formData, specificDate: e.target.value })}
                      className="search-input flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500"
                      required={formData.timeNeeded === 'specific'}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Specific Time</label>
                  <div className="flex">
                    <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-l-lg border border-gray-300 dark:border-gray-600 border-r-0">
                      <Clock className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </span>
                    <input
                      type="time"
                      value={formData.specificTime}
                      onChange={(e) => setFormData({ ...formData, specificTime: e.target.value })}
                      className="search-input flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500"
                      required={formData.timeNeeded === 'specific'}
                    />
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Your Address
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(For pickup or delivery)</span>
              </label>
              <div className="flex">
                <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-l-lg border border-gray-300 dark:border-gray-600 border-r-0">
                  <MapPin className="h-4 w-4 text-red-500 dark:text-red-400" />
                </span>
                <textarea
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="search-input flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter your complete address including landmarks and area"
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Delivery Preference</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'pickup', label: 'Self Pickup', description: 'I can collect the food myself', icon: <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" /> },
                  { id: 'delivery', label: 'Request Delivery', description: 'I need food delivered to my location', icon: <Truck className="h-5 w-5 text-green-500 dark:text-green-400" /> }
                ].map((option) => (
                  <label
                    key={option.id}
                    className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${formData.deliveryPreference === option.id
                      ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/40'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                  >
                    <input
                      type="radio"
                      name="deliveryPreference"
                      value={option.id}
                      checked={formData.deliveryPreference === option.id}
                      onChange={() => setFormData({ ...formData, deliveryPreference: option.id })}
                      className="sr-only"
                    />
                    <div className="mr-3">
                      {option.icon}
                    </div>
                    <div>
                      <span className="block font-medium text-sm text-gray-800 dark:text-gray-200">{option.label}</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                    </div>
                    {formData.deliveryPreference === option.id && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Additional Notes
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(dietary restrictions, special needs, etc.)</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="search-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500"
                rows="3"
                placeholder="Please share any dietary restrictions, allergies, or special needs."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Add a Photo (Optional)
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Help donors understand your situation better</span>
              </label>
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById('request-image').click()}
              >
                <input
                  type="file"
                  id="request-image"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({ ...formData, image: e.target.files[0] });
                    }
                  }}
                />
                {formData.image ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="h-28 object-cover rounded-lg mb-2"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{formData.image.name}</span>
                    <button
                      type="button"
                      className="mt-2 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, image: null });
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-2">
                      <PlusCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload a photo</p>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
        <div className="modal-footer p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">

          <button
            onClick={(e) => {
              e.preventDefault();
              setIsSubmitting(true);

              handleFoodRequestSubmit(e)
                .then(() => {
                  showSuccessNotification();
                  closeModal('food');
                  setFormData({
                    priority: 'medium',
                    foodTypes: [],
                    recipients: ['donors'],
                    peopleCount: 1,
                    timeNeeded: 'today',
                    specificDate: '',
                    specificTime: '',
                    location: '',
                    deliveryPreference: 'pickup',
                    notes: '',
                    image: null
                  });
                })
                .catch(error => {
                  showErrorNotification(error.message || "Failed to submit request");
                })
                .finally(() => {
                  setIsSubmitting(false);
                });
            }}
            className="px-5 py-2 rounded-lg text-white text-sm bg-gradient-to-r from-rose-500 to-teal-500 hover:from-rose-600 hover:to-teal-600 transition shadow-md flex items-center space-x-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Submit Food Request</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="donation-grid mt-4">
      {availableFoods.map((food) => (
        <div key={food.id} className="donation-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="food-image-container">
            <img
              src={food.imageData
                ? `data:${food.imageContentType || 'image/jpeg'};base64,${food.imageData}`
                : "/api/placeholder/400/300"}
              alt={food.foodName}
              className="food-image"
              onError={(e) => {
                e.target.src = "/api/placeholder/400/300";
              }}
            />
          </div>
          <div className="card-content dark:border-gray-700">
            <div className="flex justify-between items-start">
              <h3 className="card-title text-gray-800 dark:text-gray-100">{food.foodName} {' (Total '}{food.quantity || 'No quantity available'}{' Meal)'}</h3>

              <div className="meta-item text-gray-600 dark:text-gray-400">
                <MapPin className="text-green-400" />
                <span>{food.location || 'N/A'}</span>
              </div>
            </div>
            <h3 className="card-description text-gray-600 dark:text-gray-300">{'Food Category: '}{food.category || 'No category available'}</h3>
            <h3 className="card-description text-gray-600 dark:text-gray-300">{'Food Description: '}{food.description || 'No description available'}</h3>
            <div className="meta-item text-gray-600 dark:text-gray-400">
              <span>Expires: {food.expiryDate ? String(food.expiryDate) : 'N/A'}</span>
            </div>

            <div className="card-actions border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => handleFoodRequest(food.id)}
                className="btn-request dark:bg-emerald-600 dark:hover:bg-emerald-700"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Request Pickup</span>
              </button>

              <button
                onClick={() => toggleSaveFood(food.id)}
                className={`btn-save ${savedFoods.includes(food.id) ? 'saved' : ''}`}
                title={savedFoods.includes(food.id) ? 'Remove from saved' : 'Save for later'}
              >
                <Bookmark className={`h-4 w-4 ${savedFoods.includes(food.id) ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => openReportModal(food)}
                className="btn-report bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                title="Report this food item"
              >
                <Flag className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-6 mt-8">
      {availableFoods.map((food) => (
        <div
          key={food.id}
          className="premium-donation-card group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700"
        >
          {/* Premium Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative flex flex-col md:flex-row">
            {/* Enhanced Image Section */}
            <div className="relative md:w-1/3 overflow-hidden">
              <div className="relative h-64 md:h-56 lg:h-64">
                <img
                  src={food.imageData
                    ? `data:${food.imageContentType || 'image/jpeg'};base64,${food.imageData}`
                    : "/api/placeholder/400/300"}
                  alt={food.foodName}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/400/300";
                  }}
                />
                {/* Image Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                {/* Enhanced Category Badge */}
                <div className="absolute top-4 right-4">
                  <span className="premium-badge px-3 py-1.5 text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-800 rounded-full shadow-lg border border-white/50">
                    {food.category}
                  </span>
                </div>

                {/* Food Type Indicator */}
                <div className="absolute top-4 left-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Content Section */}
            <div className="p-6 md:w-2/3 flex flex-col justify-between relative">
              <div className="flex-grow">
                {/* Enhanced Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                      {food.foodName}
                    </h3>
                    <div className="ml-4 flex items-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                        {food.quantity || 'N/A'} Meals
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Description */}
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                    {food.description || 'Fresh and delicious food ready for pickup.'}
                  </p>
                </div>

                {/* Enhanced Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  {/* Expiry Info */}
                  <div className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-800/50 rounded-lg flex items-center justify-center mr-3">
                      <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-orange-700 dark:text-orange-300">Expires</p>
                      <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">{food.expiryDate}</p>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-800/50 rounded-lg flex items-center justify-center mr-3">
                      <Utensils className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-700 dark:text-green-300">Location</p>
                      <p className="text-sm font-semibold text-green-800 dark:text-green-200 truncate">{food.location}</p>
                    </div>
                  </div>

                  {/* Quantity Info */}
                  <div className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-800/50 rounded-lg flex items-center justify-center mr-3">
                      <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Available</p>
                      <p className="text-sm font-semibold text-purple-800 dark:text-purple-200">{food.quantity} Portions</p>
                    </div>
                  </div>

                  {/* Dietary Tags */}
                  <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Dietary Info</p>
                      <div className="flex flex-wrap gap-1">
                        {food.dietaryInfo && food.dietaryInfo.length > 0 ? (
                          food.dietaryInfo.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded-md"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-blue-600 dark:text-blue-400">Standard</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                {/* Primary Action Button */}
                <button
                  onClick={() => handleFoodRequest(food.id)}
                  className="premium-btn-primary flex-1 group relative overflow-hidden px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Request Pickup</span>
                  </div>
                </button>

                {/* Secondary Action Buttons */}
                <div className="flex gap-3">
                  {/* Save Button */}
                  <button
                    onClick={() => toggleSaveFood(food.id)}
                    className={`premium-btn-secondary relative overflow-hidden px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${savedFoods.includes(food.id)
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg hover:shadow-xl hover:from-yellow-500 hover:to-yellow-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-md hover:shadow-lg'
                      }`}
                    title={savedFoods.includes(food.id) ? 'Remove from saved' : 'Save for later'}
                  >
                    <Bookmark className={`h-5 w-5 ${savedFoods.includes(food.id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* Report Button */}
                  <button
                    onClick={() => openReportModal(food)}
                    className="premium-btn-danger relative overflow-hidden px-4 py-3 rounded-xl font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/30 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                    title="Report this food item"
                  >
                    <Flag className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Premium Status Indicator */}
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Hover Effect Border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 dark:group-hover:border-blue-700 transition-colors duration-500 pointer-events-none"></div>
        </div>
      ))}
    </div>
  );

  const renderReportModal = () => {
    if (!showReportModal || !selectedFoodForReport) return null;

    const reportCategories = [
      { value: 'QUALITY_ISSUE', label: 'Food Quality Issue', icon: AlertTriangle, color: 'orange' },
      { value: 'SAFETY_CONCERN', label: 'Safety Concern', icon: Shield, color: 'red' },
      { value: 'FRAUD', label: 'Fraudulent Listing', icon: AlertTriangle, color: 'red' }, // Changed from ExclamationTriangle
      { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content', icon: AlertOctagon, color: 'purple' },
      { value: 'OTHER', label: 'Other Issue', icon: Info, color: 'gray' }
    ];

    return (
      <div
        className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        style={{ opacity: reportFormAnimation ? 1 : 0 }}
        onClick={closeReportModal}
      >
        <div
          className={`modal-container rounded-xl shadow-xl overflow-hidden w-full max-w-4xl max-h-[90vh] ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}
          style={{
            transform: reportFormAnimation ? 'scale(1)' : 'scale(0.95)',
            transition: 'transform 0.3s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header sticky top-0 z-10 flex justify-between items-center p-4 bg-red-600 text-white">
            <div className="modal-title flex items-center">
              <Flag className="h-6 w-6 mr-2" />
              <span className="font-semibold text-lg">Report Food Item</span>
            </div>
            <button
              onClick={closeReportModal}
              className="modal-close-button p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
              disabled={isSubmittingReport}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Food Item Information
              </h3>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="rounded-lg overflow-hidden h-48 bg-gray-100 dark:bg-gray-700">
                    <img
                      src={selectedFoodForReport.imageData
                        ? `data:${selectedFoodForReport.imageContentType || 'image/jpeg'};base64,${selectedFoodForReport.imageData}`
                        : "/api/placeholder/400/300"}
                      alt={selectedFoodForReport.foodName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/400/300";
                      }}
                    />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Food Name
                      </label>
                      <p className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        {selectedFoodForReport.foodName}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Category
                      </label>
                      <p className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        {selectedFoodForReport.category}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Quantity
                      </label>
                      <p className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        {selectedFoodForReport.quantity}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Expiry Date
                      </label>
                      <p className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        {selectedFoodForReport.expiryDate}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Location
                      </label>
                      <p className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        {selectedFoodForReport.location}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Description
                      </label>
                      <p className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        {selectedFoodForReport.description || 'No description available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Report Details
              </h3>
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Report Category *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {reportCategories.map((category) => {
                    const IconComponent = category.icon;
                    const isSelected = reportFormData.reportCategory === category.value;

                    return (
                      <label
                        key={category.value}
                        className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${isSelected
                          ? `border-${category.color}-500 bg-${category.color}-50 dark:bg-${category.color}-900/40`
                          : `border-gray-200 dark:border-gray-600 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'}`
                          }`}
                      >
                        <input
                          type="radio"
                          name="reportCategory"
                          value={category.value}
                          checked={isSelected}
                          onChange={(e) => handleReportFormChange('reportCategory', e.target.value)}
                          className="sr-only"
                        />
                        <div className="mr-3">
                          <IconComponent className={`h-6 w-6 text-${category.color}-500`} />
                        </div>
                        <div>
                          <span className={`block font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {category.label}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <Check className={`h-4 w-4 text-${category.color}-500`} />
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reason for Reporting *
                  <span className="text-xs text-gray-500 ml-2">
                    ({reportFormData.reportReason.length}/1000 characters, minimum 10)
                  </span>
                </label>
                <textarea
                  value={reportFormData.reportReason}
                  onChange={(e) => handleReportFormChange('reportReason', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  rows="5"
                  placeholder="Please provide detailed information about why you are reporting this food item. Include specific issues, concerns, or problems you have encountered."
                  maxLength="1000"
                  disabled={isSubmittingReport}
                  required
                />
                <div className={`mt-1 text-xs ${reportFormData.reportReason.length < 10
                  ? 'text-red-500'
                  : reportFormData.reportReason.length > 900
                    ? 'text-yellow-500'
                    : 'text-gray-500'
                  }`}>
                  {reportFormData.reportReason.length < 10 && 'At least 10 characters required'}
                  {reportFormData.reportReason.length >= 10 && reportFormData.reportReason.length <= 900 && 'Good length'}
                  {reportFormData.reportReason.length > 900 && 'Approaching character limit'}
                </div>
              </div>
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Supporting Evidence (Optional)
                  <span className="text-xs text-gray-500 ml-2">Upload images, documents, or files to support your report</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Evidence File 1
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${darkMode
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                        }`}
                      onClick={() => document.getElementById('evidenceFile1').click()}
                    >
                      <input
                        type="file"
                        id="evidenceFile1"
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={(e) => handleEvidenceFileChange(1, e.target.files[0])}
                        disabled={isSubmittingReport}
                      />
                      {reportFormData.evidenceFile1 ? (
                        <div className="flex flex-col items-center">
                          <FileText className="h-8 w-8 text-blue-500 mb-2" />
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {reportFormData.evidenceFile1.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(reportFormData.evidenceFile1.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                          <button
                            type="button"
                            className="mt-2 text-xs text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReportFormChange('evidenceFile1', null);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Click to upload file
                          </p>
                          <p className="text-xs text-gray-500">
                            Images, PDF, Documents (Max 10MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Evidence File 2
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${darkMode
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                        }`}
                      onClick={() => document.getElementById('evidenceFile2').click()}
                    >
                      <input
                        type="file"
                        id="evidenceFile2"
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={(e) => handleEvidenceFileChange(2, e.target.files[0])}
                        disabled={isSubmittingReport}
                      />
                      {reportFormData.evidenceFile2 ? (
                        <div className="flex flex-col items-center">
                          <FileText className="h-8 w-8 text-blue-500 mb-2" />
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {reportFormData.evidenceFile2.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(reportFormData.evidenceFile2.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                          <button
                            type="button"
                            className="mt-2 text-xs text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReportFormChange('evidenceFile2', null);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Click to upload file
                          </p>
                          <p className="text-xs text-gray-500">
                            Images, PDF, Documents (Max 10MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-lg border-l-4 border-yellow-500 ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'
                }`}>
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className={`font-semibold text-yellow-700 dark:text-yellow-300 mb-1`}>
                      Important Notice
                    </h4>
                    <p className={`text-sm text-yellow-600 dark:text-yellow-400`}>
                      False reports may result in account suspension. Please only report legitimate concerns about food quality, safety, or fraudulent listings. Our team will review your report within 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`sticky bottom-0 w-full p-4 border-t z-10 flex justify-end ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            <div className="flex space-x-3">
              <button
                onClick={closeReportModal}
                className={`px-4 py-2 rounded-lg transition ${darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                disabled={isSubmittingReport}
              >
                Cancel
              </button>

              <button
                onClick={showReportConfirmationDialog}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center"
                disabled={isSubmittingReport || !reportFormData.reportReason.trim() || reportFormData.reportReason.length < 10}
              >
                <Flag className="h-4 w-4 mr-2" />
                Submit Report
              </button>
            </div>
          </div>
          {showReportConfirmation && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
              <div className={`rounded-lg p-6 w-full max-w-md ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
                }`}>
                <h3 className="text-xl font-bold text-red-600 mb-4">Confirm Report Submission</h3>
                <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Are you sure you want to submit this report? This action cannot be undone, and false reports may result in account restrictions.
                </p>

                <div className={`mb-4 p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Report Category: {reportCategories.find(cat => cat.value === reportFormData.reportCategory)?.label}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Reason: {reportFormData.reportReason.substring(0, 100)}{reportFormData.reportReason.length > 100 ? '...' : ''}
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowReportConfirmation(false)}
                    className={`px-4 py-2 rounded-lg transition ${darkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    disabled={isSubmittingReport}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={submitFoodReport}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center"
                    disabled={isSubmittingReport}
                  >
                    {isSubmittingReport ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Confirm & Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleViewDetails = async (donationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/receiver/food/${donationId}`);
      setSelectedDonation(response.data);
      setShowDonationDetailsModal(true);
    } catch (error) {
      console.error('Error fetching donation details:', error);
    }
  };

  const handleFoodRequest = (donationId) => {
    const food = availableFoods.find(food => food.id === donationId);
    if (food) {
      openPickupRequestModal(food);
    }
  };

  const renderAcceptedNotificationsModal = () => {
    if (!showAcceptedNotificationsModal) return null;
    const acceptedNotifications = acceptedRequestNotifications.filter(
      notification => notification.status === 'ACCEPTED'
    );
    const rejectedNotifications = acceptedRequestNotifications.filter(
      notification => notification.status === 'REJECTED'
    );
    return (
      <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="notifications-modal bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="notifications-header bg-blue-600 dark:bg-blue-700 p-4 flex justify-between items-center text-white">
            <div className="flex items-center">
              <Bell className="h-6 w-6 mr-3" />
              <h2 className="text-xl font-bold">Food Request Notifications</h2>
            </div>
            <button
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
              onClick={() => setShowAcceptedNotificationsModal(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 py-3 font-semibold flex items-center justify-center transition-all duration-300 ${overviewTab === 'accepted'
                ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-b-2 border-green-500'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              onClick={() => setOverviewTab('accepted')}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Accepted Requests ({acceptedNotifications.length})
            </button>
            <button
              className={`flex-1 py-3 font-semibold flex items-center justify-center transition-all duration-300 ${overviewTab === 'rejected'
                ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-b-2 border-red-500'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              onClick={() => setOverviewTab('rejected')}
            >
              <AlertCircle className="h-5 w-5 mr-2" />
              Rejected Requests ({rejectedNotifications.length})
            </button>
          </div>
          <div className="notifications-body flex-grow overflow-y-auto p-4 bg-white dark:bg-gray-800">
            {acceptedRequestNotifications.length === 0 ? (
              <div className="empty-notifications text-center py-12">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
                  <Package className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-800 dark:text-gray-100 text-xl font-semibold mb-2">No Notifications</p>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Your food request notifications will appear here when donors respond to your requests.
                </p>
              </div>
            ) : (
              <div className="notifications-list space-y-4">
                {overviewTab === 'accepted' && acceptedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="notification-item bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500 mr-3" />
                        <h4 className="text-green-800 dark:text-green-400 font-bold text-lg">Request Accepted</h4>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(notification.responseDate).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="notification-content">
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        Your request for <span className="font-bold text-green-700 dark:text-green-400">{notification.foodName}</span> has been accepted.
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full">
                          Quantity: {notification.quantity} meals
                        </span>
                        <button
                          onClick={() => handleViewAcceptedRequestNotification(notification)}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-semibold text-sm flex items-center"
                        >
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {overviewTab === 'rejected' && rejectedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="notification-item bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500 mr-3" />
                        <h4 className="text-red-800 dark:text-red-400 font-bold text-lg">Request Rejected</h4>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(notification.responseDate).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="notification-content">
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        Your request for <span className="font-bold text-red-700 dark:text-red-400">{notification.foodName}</span> has been rejected.
                      </p>
                      {notification.responseNote && (
                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 rounded-lg mb-3">
                          <div className="flex items-start mb-1">
                            <Info className="h-5 w-5 text-red-600 dark:text-red-500 mr-2 mt-0.5" />
                            <span className="font-semibold text-red-800 dark:text-red-400">Donor's Note</span>
                          </div>
                          <p className="text-red-700 dark:text-red-300 text-sm">{notification.responseNote}</p>
                        </div>
                      )}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleViewAcceptedRequestNotification(notification)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold text-sm flex items-center"
                        >
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer bg-gray-100 dark:bg-gray-750 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Bell className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
              Total Notifications: {acceptedRequestNotifications.length}
            </div>
            <button
              onClick={() => setShowAcceptedNotificationsModal(false)}
              className="px-5 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition flex items-center shadow-md"
            >
              <Check className="h-4 w-4 mr-2" />
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  const renderSelectedNotificationDetailModal = () => {
    if (!selectedAcceptedNotification) return null;

    const isAccepted = selectedAcceptedNotification.status === 'ACCEPTED';
    const statusColor = isAccepted
      ? 'bg-green-50 border-green-100 text-green-800'
      : 'bg-red-50 border-red-100 text-red-800';
    const statusBadge = isAccepted ? 'Accepted' : 'Rejected';
    const StatusIcon = isAccepted ? CheckCircle : AlertCircle;

    return (
      <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="notification-detail-modal bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className={`modal-header p-4 border-b ${isAccepted
            ? 'border-green-100 bg-green-50'
            : 'border-red-100 bg-red-50'} 
            flex justify-between items-center`}
          >
            <div className="flex items-center">
              <StatusIcon className={`h-6 w-6 mr-3 ${isAccepted
                ? 'text-green-600'
                : 'text-red-600'}`}
              />
              <h2 className={`text-xl font-bold ${isAccepted
                ? 'text-green-800'
                : 'text-red-800'}`}
              >
                Request {statusBadge}
              </h2>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto p-6">
            {/* Status Banner */}
            <div className={`rounded-lg p-4 mb-6 ${statusColor} border flex items-center`}>
              <StatusIcon className={`h-6 w-6 mr-3 ${isAccepted
                ? 'text-green-600'
                : 'text-red-600'}`}
              />
              <div>
                <h3 className="font-semibold">
                  {isAccepted
                    ? 'Your food request has been accepted!'
                    : 'Your food request has been rejected.'}
                </h3>
                <p className="text-sm mt-1">
                  {isAccepted
                    ? 'The donor has approved your request. You can proceed with pickup.'
                    : 'Unfortunately, the donor could not fulfill your request at this time.'}
                </p>
              </div>
            </div>
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3 border-b pb-2 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-500" />
                Food Item Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Food Name</p>
                  <p className="font-medium">
                    {selectedAcceptedNotification.foodName || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pickup Location</p>
                  <p className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                    {selectedAcceptedNotification.pickupLocation || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Response Date</p>
                  <p className="font-medium">
                    {new Date(selectedAcceptedNotification.responseDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pickup Method</p>
                  <p className="font-medium flex items-center">
                    {selectedAcceptedNotification.pickupMethod === 'courier' ? (
                      <>
                        <Truck className="h-4 w-4 mr-2 text-blue-500" />
                        Courier Delivery
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 mr-2 text-green-500" />
                        Self Pickup
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Receiver Card */}
              <div className={`rounded-xl p-5 ${isAccepted
                ? 'bg-blue-50 border-blue-100'
                : 'bg-gray-50 border-gray-100'} border`}
              >
                <div className="flex items-center mb-4">
                  <User className={`h-6 w-6 mr-3 ${isAccepted
                    ? 'text-blue-500'
                    : 'text-gray-500'}`}
                  />
                  <h3 className={`text-lg font-semibold ${isAccepted
                    ? 'text-blue-800'
                    : 'text-gray-800'}`}
                  >
                    Recipient Information
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-800">
                      {selectedAcceptedNotification.receiverName || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-medium text-gray-800">
                      {selectedAcceptedNotification.receiverPhone || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Address</p>
                    <p className="font-medium text-gray-800">
                      {selectedAcceptedNotification.receiverAddress || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`rounded-xl p-5 ${isAccepted
                ? 'bg-green-50 border-green-100'
                : 'bg-gray-50 border-gray-100'} border`}
              >
                <div className="flex items-center mb-4">
                  <Heart className={`h-6 w-6 mr-3 ${isAccepted
                    ? 'text-green-500'
                    : 'text-gray-500'}`}
                  />
                  <h3 className={`text-lg font-semibold ${isAccepted
                    ? 'text-green-800'
                    : 'text-gray-800'}`}
                  >
                    Donor Information
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-800">
                      {selectedAcceptedNotification.donorName || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Contact</p>
                    <p className="font-medium text-gray-800">
                      {selectedAcceptedNotification.donorContact || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {selectedAcceptedNotification.responseNote && (
              <div className={`p-4 rounded-lg ${isAccepted
                ? 'bg-yellow-50 border-yellow-100'
                : 'bg-gray-50 border-gray-100'} border`}
              >
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <MessageCircle className={`h-5 w-5 mr-2 ${isAccepted
                    ? 'text-yellow-500'
                    : 'text-gray-500'}`}
                  />
                  {isAccepted ? "Donor's Message" : "Rejection Reason"}
                </h4>
                <p className="text-gray-700">
                  {selectedAcceptedNotification.responseNote || 'No additional information provided.'}
                </p>
              </div>
            )}
          </div>
          <div className={`modal-footer p-4 border-t ${isAccepted
            ? 'border-green-100 bg-green-50'
            : 'border-red-100 bg-red-50'} flex justify-end`}
          >
            <button
              onClick={() => setSelectedAcceptedNotification(null)}
              className={`px-4 py-2 rounded-lg transition flex items-center ${isAccepted
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600'
                }`}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOverviewModal = () => (
    <div
      className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      style={{ opacity: overviewFormAnimation ? 1 : 0 }}
      onClick={closeOverviewModal}
    >
      // Replace this modal container class
      <div
        className="modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-3xl w-full"
        style={{
          transform: formAnimation ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex justify-between items-center p-4 bg-green-600 text-white sticky top-0 z-10">
          <div className="modal-title flex items-center">
            <BarChart className="h-6 w-6 mr-2" />
            <span className="font-semibold text-lg">Food Donation Overview</span>
          </div>
          <button
            onClick={closeOverviewModal}
            className="modal-close-button p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-100 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">Accepted Requests</p>
                  <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">{overviewStats.summary.acceptedRequests || 0}</h3>
                </div>
                <div className="bg-green-100 dark:bg-green-800 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-100 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Pending Requests</p>
                  <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200">{overviewStats.summary.pendingRequests || 0}</h3>
                </div>
                <div className="bg-amber-100 dark:bg-amber-800 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-100 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">Rejected Requests</p>
                  <h3 className="text-2xl font-bold text-red-800 dark:text-red-200">{overviewStats.summary.rejectedRequests || 0}</h3>
                </div>
                <div className="bg-red-100 dark:bg-red-800 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-0 mb-4 border dark:border-gray-700 rounded-lg overflow-hidden w-fit">
            <button
              onClick={() => setOverviewTab('received')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${overviewTab === 'received'
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
            >
              Received
            </button>
            <button
              onClick={() => setOverviewTab('requested')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-l border-r dark:border-gray-700 ${overviewTab === 'requested'
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
            >
              Requested
            </button>
            <button
              onClick={() => setOverviewTab('accepted')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${overviewTab === 'accepted'
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setOverviewTab('saved')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${overviewTab === 'saved'
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
            >
              Saved ({savedFoods.length})
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Received Tab (ACCEPTED foods) */}
            {overviewTab === 'received' && (
              <div>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Received Food Items</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Food items that have been accepted for you</p>
                </div>

                <div className="p-4 dark:bg-gray-800">
                  {overviewStats.received && overviewStats.received.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                        <Truck className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-1">No received food items</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Food items that have been received will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {overviewStats.received && overviewStats.received.map(item => (
                        <div key={item.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3 p-3">
                              <div className="h-32 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                                <img
                                  src={item.foodImageData
                                    ? `data:${item.foodImageContentType || 'image/jpeg'};base64,${item.foodImageData}`
                                    : "/api/placeholder/300/200"}
                                  alt={item.foodName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                            <div className="md:w-2/3 p-4 dark:bg-gray-800">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">{item.foodName}</h4>
                                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                                  Received
                                </span>
                              </div>

                              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Requested:</span>
                                  <span className="ml-1 text-gray-700 dark:text-gray-300">
                                    {new Date(item.requestDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Accepted:</span>
                                  <span className="ml-1 text-gray-700 dark:text-gray-300">
                                    {new Date(item.responseDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                                  <span className="ml-1 text-gray-700 dark:text-gray-300">{item.quantity}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">From:</span>
                                  <span className="ml-1 text-gray-700 dark:text-gray-300">{item.donorName || 'Unknown'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {overviewTab === 'requested' && (
              <div>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Your Food Requests</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">All food items you have requested</p>
                </div>

                <div className="p-4 dark:bg-gray-800">
                  {overviewStats.requested && overviewStats.requested.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                        <Package className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-1">No food requests</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Food items that you have requested will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {overviewStats.requested && overviewStats.requested.map(item => (
                        <div key={item.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3 p-3">
                              <div className="h-32 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                                <img
                                  src={item.foodImageData
                                    ? `data:${item.foodImageContentType || 'image/jpeg'};base64,${item.foodImageData}`
                                    : "/api/placeholder/300/200"}
                                  alt={item.foodName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                            <div className="md:w-2/3 p-4 dark:bg-gray-800">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">{item.foodName}</h4>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === "ACCEPTED"
                                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                  : item.status === "PENDING"
                                    ? "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200"
                                    : item.status === "REJECTED"
                                      ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                  }`}>
                                  {item.status || 'Unknown'}
                                </span>
                              </div>

                              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Requested:</span>
                                  <span className="ml-1 text-gray-700 dark:text-gray-300">
                                    {new Date(item.requestDate).toLocaleDateString()}
                                  </span>
                                </div>
                                {item.responseDate && (
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Response:</span>
                                    <span className="ml-1 text-gray-700 dark:text-gray-300">
                                      {new Date(item.responseDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                                  <span className="ml-1 text-gray-700 dark:text-gray-300">{item.quantity}</span>
                                </div>
                                {item.pickupMethod && (
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Pickup:</span>
                                    <span className="ml-1 text-gray-700 dark:text-gray-300">{item.pickupMethod}</span>
                                  </div>
                                )}
                              </div>

                              {item.responseNote && (
                                <div className="mt-2 text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">Note:</span>
                                  <p className="mt-1 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">{item.responseNote}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {overviewTab === 'accepted' && (
              <div>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Accepted Food Requests</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pick up these food items as soon as possible</p>
                </div>

                <div className="p-4 dark:bg-gray-800">
                  {acceptedRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                        <Package className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-1">No accepted requests</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Your accepted food requests will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {acceptedRequests.map(request => (
                        <div key={request.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3 p-3">
                              <div className="h-32 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                                <img
                                  src={request.foodImageData
                                    ? `data:${request.foodImageContentType || 'image/jpeg'};base64,${request.foodImageData}`
                                    : "/api/placeholder/300/200"}
                                  alt={request.foodName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                            <div className="md:w-2/3 p-4 dark:bg-gray-800">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">{request.foodName}</h4>
                                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                                  Accepted
                                </span>
                              </div>

                              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Requested:</span>
                                  <span className="ml-1 text-gray-700 dark:text-gray-300">
                                    {new Date(request.requestDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Accepted:</span>
                                  <span className="ml-1 text-gray-700 dark:text-gray-300">
                                    {new Date(request.responseDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                                  <span className="ml-1 text-gray-700 dark:text-gray-300">{request.quantity}</span>
                                </div>
                                {request.pickupMethod && (
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Pickup:</span>
                                    <span className="ml-1 text-gray-700 dark:text-gray-300">
                                      {request.pickupMethod === 'self' ? 'Self Pickup' : 'Courier Delivery'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {request.responseNote && (
                                <div className="mt-2 text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">Donor's Note:</span>
                                  <p className="mt-1 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">{request.responseNote}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {overviewTab === 'saved' && (
              <div>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Your Saved Food Items</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Food donations you've bookmarked for later</p>
                </div>

                <div className="p-4 dark:bg-gray-800">
                  {overviewStats.saved && overviewStats.saved.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                        <Bookmark className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-1">No saved food items</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Food items you save will appear here for easy access later.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {overviewStats.saved && overviewStats.saved.map(item => (
                        <div key={item.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3 p-3">
                              <div className="h-32 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                                <img
                                  src={item.imageData
                                    ? `data:${item.imageContentType || 'image/jpeg'};base64,${item.imageData}`
                                    : "/api/placeholder/300/200"}
                                  alt={item.foodName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                            <div className="md:w-2/3 p-4 dark:bg-gray-800">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">{item.foodName}</h4>
                                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                                  Saved
                                </span>
                              </div>

                              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Category:</span>
                                  <span className="ml-1 text-gray-700 dark:text-gray-300">{item.foodCategory}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                  <span className="ml-1 text-gray-700 dark:text-gray-300">{item.location}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Saved:</span>
                                  <span className="ml-1 text-gray-700 dark:text-gray-300">
                                    {new Date(item.savedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Expires:</span>
                                  <span className="ml-1 text-gray-700 dark:text-gray-300">{item.expiryDate}</span>
                                </div>
                              </div>

                              <div className="mt-3 flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  From: {item.donorName}
                                </span>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      closeOverviewModal();
                                      openPickupRequestModal({ id: item.donationId, foodName: item.foodName, category: item.foodCategory, location: item.location, description: item.description, quantity: item.quantity, expiryDate: item.expiryDate, imageData: item.imageData, imageContentType: item.imageContentType });
                                    }}
                                    className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                                  >
                                    Request Now
                                  </button>
                                  <button
                                    onClick={() => toggleSaveFood(item.donationId)}
                                    className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSavedDonationsModal = () => {
    if (!showSavedDonationsModal) return null;

    return (
      <div
        className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        style={{ opacity: savedDonationsFormAnimation ? 1 : 0 }}
        onClick={closeSavedDonationsModal}
      >
        <div
          className="modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
          style={{
            transform: savedDonationsFormAnimation ? 'scale(1)' : 'scale(0.95)',
            transition: 'transform 0.3s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header flex justify-between items-center p-4 bg-purple-600 text-white sticky top-0 z-10">
            <div className="modal-title flex items-center">
              <Bookmark className="h-6 w-6 mr-2" />
              <span className="font-semibold text-lg">Your Saved Food Items</span>
              <span className="ml-3 px-2 py-1 bg-purple-700 rounded-full text-sm">
                {savedDonationsData.length} items
              </span>
            </div>
            <button
              onClick={closeSavedDonationsModal}
              className="modal-close-button p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-6 dark:bg-gray-800">
            {isLoadingSavedDonations ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading saved donations...</span>
              </div>
            ) : savedDonationsData.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <Bookmark className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-2 text-xl">No Saved Food Items</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  You haven't saved any food donations yet. Browse available donations and click the bookmark icon to save items for later.
                </p>
                <button
                  onClick={closeSavedDonationsModal}
                  className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                >
                  Browse Donations
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedDonationsData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 relative">
                        <div className="h-48 bg-gray-100 dark:bg-gray-600">
                          <img
                            src={item.imageData
                              ? `data:${item.imageContentType || 'image/jpeg'};base64,${item.imageData}`
                              : "/api/placeholder/400/300"}
                            alt={item.foodName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/api/placeholder/400/300";
                            }}
                          />
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium flex items-center">
                            <Bookmark className="h-3 w-3 mr-1 fill-current" />
                            Saved
                          </span>
                        </div>
                      </div>

                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            {item.foodName}
                          </h3>
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                            {item.foodCategory}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <MapPin className="h-4 w-4 mr-2 text-green-500" />
                            <span><strong>Location:</strong> {item.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <Clock className="h-4 w-4 mr-2 text-orange-500" />
                            <span><strong>Expires:</strong> {item.expiryDate}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <Package className="h-4 w-4 mr-2 text-purple-500" />
                            <span><strong>Quantity:</strong> {item.quantity || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <User className="h-4 w-4 mr-2 text-blue-500" />
                            <span><strong>Donor:</strong> {item.donorName}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                            <span><strong>Saved on:</strong> {new Date(item.savedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {item.description && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              <strong>Description:</strong> {item.description}
                            </p>
                          </div>
                        )}
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              closeSavedDonationsModal();
                              openPickupRequestModal({
                                id: item.donationId,
                                foodName: item.foodName,
                                category: item.foodCategory,
                                location: item.location,
                                description: item.description,
                                quantity: item.quantity,
                                expiryDate: item.expiryDate,
                                imageData: item.imageData,
                                imageContentType: item.imageContentType
                              });
                            }}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center space-x-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Request Now</span>
                          </button>

                          <button
                            onClick={async () => {
                              await toggleSaveFood(item.donationId);
                              showDedicatedSavedDonationsModal();
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center space-x-2"
                          >
                            <X className="h-4 w-4" />
                            <span>Remove</span>
                          </button>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`Food: ${item.foodName} at ${item.location}`);
                              showSaveNotification('Food details copied to clipboard!', 'success');
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center justify-center"
                            title="Share food details"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHelpCenterModal = () => {
    if (!showHelpCenterModal) return null;

    const tabData = {
      about: {
        title: 'About FoodBridge Bangladesh',
        icon: <Info className="h-5 w-5" />,
        color: 'blue'
      },
      system: {
        title: 'How It Works',
        icon: <Settings className="h-5 w-5" />,
        color: 'green'
      },
      terms: {
        title: 'Terms & Conditions',
        icon: <FileText className="h-5 w-5" />,
        color: 'purple'
      },
      contact: {
        title: 'Contact Support',
        icon: <Phone className="h-5 w-5" />,
        color: 'orange'
      }
    };

    return (
      <div
        className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        style={{ opacity: helpCenterAnimation ? 1 : 0 }}
        onClick={closeHelpCenterModal}
      >
        <div
          className={`modal-container rounded-xl shadow-xl overflow-hidden w-full max-w-4xl max-h-[90vh] ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
            }`}
          style={{
            transform: helpCenterAnimation ? 'scale(1)' : 'scale(0.95)',
            transition: 'transform 0.3s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header sticky top-0 z-10 flex justify-between items-center p-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <div className="modal-title flex items-center">
              <HelpCircle className="h-6 w-6 mr-2" />
              <span className="font-semibold text-lg">Help Center</span>
            </div>
            <button
              onClick={closeHelpCenterModal}
              className="modal-close-button p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className={`flex border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            {Object.entries(tabData).map(([key, tab]) => (
              <button
                key={key}
                onClick={() => setActiveHelpTab(key)}
                className={`flex-1 py-3 px-4 font-medium text-sm flex items-center justify-center transition-all duration-300 ${activeHelpTab === key
                  ? `bg-${tab.color}-50 dark:bg-${tab.color}-900/30 text-${tab.color}-600 dark:text-${tab.color}-400 border-b-2 border-${tab.color}-500`
                  : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                  }`}
              >
                {tab.icon}
                <span className="ml-2 hidden sm:inline">{tab.title}</span>
              </button>
            ))}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {activeHelpTab === 'about' && (
              <div className="p-6">
                <div className="text-center mb-8">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    FoodBridge Bangladesh
                  </h2>
                  <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Connecting Hearts Through Food
                  </p>
                </div>

                <div className="space-y-6">
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-blue-100'}`}>
                    <h3 className={`text-xl font-semibold mb-3 flex items-center ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      <Globe className="h-6 w-6 mr-2" />
                      Our Mission
                    </h3>
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      FoodBridge Bangladesh is a revolutionary platform dedicated to eliminating food waste and hunger in Bangladesh.
                      We connect generous donors with people in need, creating a sustainable ecosystem where excess food finds its way
                      to those who need it most.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-green-50'} border ${darkMode ? 'border-gray-600' : 'border-green-100'}`}>
                      <h4 className={`font-semibold mb-2 flex items-center ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                        <Gift className="h-5 w-5 mr-2" />
                        Free Food Donations
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Individuals, restaurants, and organizations can donate surplus food completely free of charge.
                      </p>
                    </div>

                    <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-purple-50'} border ${darkMode ? 'border-gray-600' : 'border-purple-100'}`}>
                      <h4 className={`font-semibold mb-2 flex items-center ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                        <ShoppingBag className="h-5 w-5 mr-2" />
                        Food Purchase Options
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Donors can also contribute by purchasing food from our partner merchants to donate to those in need.
                      </p>
                    </div>

                    <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-orange-50'} border ${darkMode ? 'border-gray-600' : 'border-orange-100'}`}>
                      <h4 className={`font-semibold mb-2 flex items-center ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                        <Users className="h-5 w-5 mr-2" />
                        Community Impact
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Building stronger communities by connecting neighbors and reducing food insecurity across Bangladesh.
                      </p>
                    </div>

                    <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-teal-50'} border ${darkMode ? 'border-gray-600' : 'border-teal-100'}`}>
                      <h4 className={`font-semibold mb-2 flex items-center ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}>
                        <Leaf className="h-5 w-5 mr-2" />
                        Environmental Focus
                      </h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Reducing food waste and environmental impact while promoting sustainable food consumption.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeHelpTab === 'system' && (
              <div className="p-6">
                <h2 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  How FoodBridge Works
                </h2>

                <div className="space-y-8">
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-100'}`}>
                    <h3 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      <Users className="h-6 w-6 mr-2" />
                      For Food Receivers (You)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <h4 className={`font-medium ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>Browse Available Food</h4>
                          <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Explore food donations in your area</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <h4 className={`font-medium ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>Request Food Items</h4>
                          <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Submit pickup requests for needed items</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <h4 className={`font-medium ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>Get Approval</h4>
                          <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Wait for donor approval and pickup details</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <h4 className={`font-medium ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>Collect Food</h4>
                          <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Pick up or receive delivered food</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-green-900/30' : 'bg-green-50'} border ${darkMode ? 'border-green-800' : 'border-green-100'}`}>
                    <h3 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                      <Heart className="h-6 w-6 mr-2" />
                      For Food Donors
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-800/30' : 'bg-green-100'}`}>
                        <h4 className={`font-medium mb-2 ${darkMode ? 'text-green-200' : 'text-green-800'}`}>Direct Donations</h4>
                        <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                          Donate surplus food from homes, restaurants, or events completely free
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-800/30' : 'bg-green-100'}`}>
                        <h4 className={`font-medium mb-2 ${darkMode ? 'text-green-200' : 'text-green-800'}`}>Purchase to Donate</h4>
                        <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                          Buy food from partner merchants specifically to donate to those in need
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'} border ${darkMode ? 'border-purple-800' : 'border-purple-100'}`}>
                    <h3 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                      <ShoppingBag className="h-6 w-6 mr-2" />
                      For Food Merchants
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className={`h-5 w-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          List surplus food for donation
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className={`h-5 w-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          Sell food items that donors can purchase for donation
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className={`h-5 w-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          Contribute to community welfare while reducing waste
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeHelpTab === 'terms' && (
              <div className="p-6">
                <h2 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  Terms & Conditions
                </h2>

                <div className="space-y-6">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} border ${darkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
                    <div className="flex items-start">
                      <AlertTriangle className={`h-5 w-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} mr-3 mt-0.5`} />
                      <div>
                        <h3 className={`font-semibold ${darkMode ? 'text-yellow-300' : 'text-yellow-800'} mb-2`}>
                          Important Notice
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                          By using FoodBridge Bangladesh, you agree to these terms and conditions. Please read them carefully.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        1. Food Safety & Quality
                      </h4>
                      <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>• Food donors are responsible for ensuring food safety and quality</li>
                        <li>• Recipients should inspect food before consumption</li>
                        <li>• Report any food safety concerns immediately</li>
                        <li>• FoodBridge is a platform facilitator, not responsible for food quality</li>
                      </ul>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        2. User Responsibilities
                      </h4>
                      <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>• Provide accurate and truthful information</li>
                        <li>• Respect other users and maintain community standards</li>
                        <li>• Use the platform only for legitimate food sharing purposes</li>
                        <li>• Report inappropriate behavior or content</li>
                      </ul>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        3. Privacy & Data Protection
                      </h4>
                      <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>• Your personal information is protected according to our Privacy Policy</li>
                        <li>• Location data is used only for matching donors and recipients</li>
                        <li>• We do not sell or share personal data with third parties</li>
                        <li>• You can request data deletion at any time</li>
                      </ul>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        4. Platform Usage
                      </h4>
                      <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>• The service is provided free of charge</li>
                        <li>• Account suspension may occur for policy violations</li>
                        <li>• We reserve the right to modify features and policies</li>
                        <li>• Platform availability is not guaranteed 24/7</li>
                      </ul>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        5. Limitation of Liability
                      </h4>
                      <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>• FoodBridge Bangladesh is not liable for food-related incidents</li>
                        <li>• Users interact at their own risk and responsibility</li>
                        <li>• We are not responsible for failed transactions or communications</li>
                        <li>• Use of the platform constitutes acceptance of these limitations</li>
                      </ul>
                    </div>
                  </div>

                  <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>For questions about these terms, please contact our support team.</p>
                  </div>
                </div>
              </div>
            )}

            {activeHelpTab === 'contact' && (
              <div className="p-6">
                <h2 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  Contact Support
                </h2>

                <div className="space-y-6">
                  <div className={`text-center p-6 rounded-xl ${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'} border ${darkMode ? 'border-orange-800' : 'border-orange-100'}`}>
                    <div className="mx-auto w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                      <Phone className="h-8 w-8 text-white" />
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                      Need Help?
                    </h3>
                    <p className={`${darkMode ? 'text-orange-200' : 'text-orange-600'} mb-4`}>
                      Our support team is here to assist you with any questions or concerns.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-blue-100'}`}>
                      <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        <Globe className="h-5 w-5 mr-2" />
                        Visit Our Website
                      </h4>
                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Go to our main website's contact section for comprehensive support options.
                      </p>
                      <button
                        onClick={() => window.open('/', '_blank')}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Homepage Contact
                      </button>
                    </div>
                    <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-green-50'} border ${darkMode ? 'border-gray-600' : 'border-green-100'}`}>
                      <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                        <Mail className="h-5 w-5 mr-2" />
                        Email Support
                      </h4>
                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Send us an email for detailed assistance and we'll get back to you soon.
                      </p>
                      <button
                        onClick={() => window.location.href = 'mailto:support@foodbridgebd.com'}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        support@foodbridgebd.com
                      </button>
                    </div>
                  </div>
                  <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      <HelpCircle className="h-5 w-5 mr-2" />
                      Frequently Asked Questions
                    </h4>
                    <div className="space-y-3">
                      <details className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <summary className="cursor-pointer font-medium">How do I request food items?</summary>
                        <p className="text-sm mt-2 pl-4">Browse available donations, click "Request Pickup" on items you need, fill out the request form, and wait for donor approval.</p>
                      </details>
                      <details className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <summary className="cursor-pointer font-medium">Is there any cost involved?</summary>
                        <p className="text-sm mt-2 pl-4">No, receiving food donations is completely free. However, some delivery options may have charges which should be discussed with the donor.</p>
                      </details>
                      <details className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <summary className="cursor-pointer font-medium">How do I report a problem with food quality?</summary>
                        <p className="text-sm mt-2 pl-4">Use the "Report" button on any food item to submit a detailed report with evidence. Our team will investigate within 24-48 hours.</p>
                      </details>
                      <details className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <summary className="cursor-pointer font-medium">Can I save food items for later?</summary>
                        <p className="text-sm mt-2 pl-4">Yes, click the bookmark icon on any food item to save it. Access your saved items from the "Saved" button in the top menu.</p>
                      </details>
                    </div>
                  </div>

                  <div className={`text-center p-4 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                    <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      <strong>Emergency Food Assistance:</strong> If you need urgent food assistance, use the "Emergency" button in the top menu or contact local emergency services.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 transition-colors duration-300">
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-4 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        <div className="dashboard-topbar">
          <div className="welcome-container">
            <div className="welcome-user">
              <div className="welcome-header">
                <h2>Welcome, {userProfile?.firstName || currentUser.name.split(' ')[0]}!</h2>
                <div className="welcome-badge">Food Receiver</div>
              </div>
              <p>Find available food donations near you</p>
              <div className="welcome-decoration"></div>
            </div>
          </div>

          <div className="action-buttons-wrapper">
            <div
              ref={actionButtonsContainerRef}
              className="action-buttons-container"
              onTouchStart={handleActionTouchStart}
              onTouchMove={handleActionTouchMove}
              onTouchEnd={handleActionTouchEnd}
            >
              <button
                onClick={() => setShowFoodRequestForm(true)}
                className="topbar-btn group"
              >
                <div className="topbar-icon-wrapper bg-emerald-50 dark:bg-emerald-900/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-800/50">
                  <PlusCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                </div>
                <span className="topbar-label">Need Food</span>
              </button>

              <button
                onClick={() => setShowEmergencyForm(true)}
                className="topbar-btn group"
              >
                <div className="topbar-icon-wrapper bg-orange-50 dark:bg-orange-900/30 group-hover:bg-orange-100 dark:group-hover:bg-orange-800/50">
                  <AlertCircle className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                </div>
                <span className="topbar-label">Emergency</span>
              </button>

              <button
                onClick={handleOpenOverviewModal}
                className="topbar-btn group"
              >
                <div className="topbar-icon-wrapper bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50">
                  <BarChart className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </div>
                <span className="topbar-label">Overview</span>
              </button>

              <button
                onClick={showDedicatedSavedDonationsModal}
                className="topbar-btn group relative"
              >
                <div className="topbar-icon-wrapper bg-purple-50 dark:bg-purple-900/30 group-hover:bg-purple-100 dark:group-hover:bg-purple-800/50">
                  <Bookmark className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                </div>
                <span className="topbar-label">Saved</span>
                {savedFoods.length > 0 && (
                  <div className="absolute -top-1 -right-1 z-10">
                    <span className="notification-badge-enhanced flex items-center justify-center min-w-[1.25rem] h-5 bg-blue-500 text-white text-xs font-bold rounded-full border-2 border-white shadow-lg">
                      {savedFoods.length > 9 ? '9+' : savedFoods.length}
                    </span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setShowAcceptedNotificationsModal(true)}
                className="topbar-btn group"
              >
                <div className="topbar-icon-wrapper bg-purple-50 dark:bg-purple-900/30 group-hover:bg-purple-100 dark:group-hover:bg-purple-800/50">
                  <Bell className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                </div>
                <span className="topbar-label">Notifications</span>
                {acceptedRequestNotifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 z-10">
                    <span className="notification-badge-enhanced flex items-center justify-center min-w-[1.25rem] h-5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white shadow-lg animate-pulse">
                      {acceptedRequestNotifications.length > 9 ? '9+' : acceptedRequestNotifications.length}
                    </span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="topbar-btn group"
              >
                <div className="topbar-icon-wrapper bg-sky-50 dark:bg-sky-900/30 group-hover:bg-sky-100 dark:group-hover:bg-sky-800/50">
                  <User className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                </div>
                <span className="topbar-label">Profile</span>
              </button>
            </div>

            {/* Progress Bar (Optional - shows scroll position) */}
            <div className="category-scroll-progress">
              <div
                className="category-scroll-progress-bar animated"
                style={{ width: `${actionScrollProgress}%` }}
              />
            </div>

            {/* Mobile Scroll Hint */}
            <div className="mobile-scroll-hint">
              ← Swipe to see more actions →
            </div>

            {/* Scroll Indicators (Dots) */}
            <div className="category-scroll-indicator">
              {[...Array(Math.ceil(6 / 3))].map((_, index) => (
                <div
                  key={index}
                  className={`scroll-indicator-dot ${Math.floor(actionScrollPosition / (actionButtonsContainerRef.current?.clientWidth || 1)) === index ? 'active' : ''
                    }`}
                  onClick={() => {
                    const container = actionButtonsContainerRef.current;
                    if (container) {
                      container.scrollTo({
                        left: index * container.clientWidth,
                        behavior: 'smooth'
                      });
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

            {/* Category Section with Scrolling */}
            <div className="category-section-wrapper w-full">
              {/* Scroll Arrows */}
              <div className={`category-scroll-arrows left ${showLeftArrow ? 'visible' : 'hidden'}`}>
                <button
                  onClick={scrollLeft}
                  className="scroll-arrow-btn"
                  aria-label="Scroll categories left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>

              <div className={`category-scroll-arrows right ${showRightArrow ? 'visible' : 'hidden'}`}>
                <button
                  onClick={scrollRight}
                  className="scroll-arrow-btn"
                  aria-label="Scroll categories right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Category Container */}
              <div
                ref={categoryContainerRef}
                className="category-container"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {[
                  { name: 'All', icon: <Globe className="h-4 w-4" /> },
                  { name: 'Restaurant', icon: <Utensils className="h-4 w-4" /> },
                  { name: 'Homemade', icon: <Coffee className="h-4 w-4" /> },
                  { name: 'Bakery', icon: <Zap className="h-4 w-4" /> },
                  { name: 'Grocery', icon: <ShoppingBag className="h-4 w-4" /> },
                  { name: 'Event', icon: <Calendar className="h-4 w-4" /> },
                  { name: 'Corporate', icon: <Award className="h-4 w-4" /> },
                ].map(category => (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryChange(category.name)}
                    className={`category-pill flex items-center whitespace-nowrap transition-all ${selectedCategory === category.name
                        ? 'active bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                      }`}
                    onTouchStart={(e) => e.currentTarget.classList.add('touch-active')}
                    onTouchEnd={(e) => e.currentTarget.classList.remove('touch-active')}
                  >
                    {category.icon}
                    <span className="category-pill-text">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="category-scroll-progress">
                <div
                  className="category-scroll-progress-bar animated"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>

              {/* Mobile Scroll Hint */}
              <div className="mobile-scroll-hint">
                ← Swipe to see more categories →
              </div>

              {/* Scroll Indicators (Dots) */}
              <div className="category-scroll-indicator">
                {[...Array(Math.ceil(7 / 3))].map((_, index) => (
                  <div
                    key={index}
                    className={`scroll-indicator-dot ${Math.floor(scrollPosition / (categoryContainerRef.current?.clientWidth || 1)) === index ? 'active' : ''
                      }`}
                    onClick={() => {
                      const container = categoryContainerRef.current;
                      if (container) {
                        container.scrollTo({
                          left: index * container.clientWidth,
                          behavior: 'smooth'
                        });
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-2 mt-3 sm:mt-0 flex-shrink-0">
              <div className="flex items-center border dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid'
                    ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list'
                    ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {availableFoods.length > 0 ? (
          <>
            {viewMode === 'grid' ? renderGridView() : renderListView()}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm mt-6">
            <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Food Donations Available for "{selectedCategory}"
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md text-center">
              {selectedCategory === 'All'
                ? 'There are currently no active food donations available. Please check back later.'
                : `No ${selectedCategory.toLowerCase()} food donations are currently available. Try selecting a different category or check back later.`
              }
            </p>

            {pagination.error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900 rounded-lg text-sm text-red-600 dark:text-red-400 max-w-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{pagination.error}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showEmergencyForm && renderEmergencyForm()}

      {showFoodRequestForm && renderFoodRequestForm()}

      {showProfileModal && renderProfileModal()}

      {showOverviewModal && renderOverviewModal()}

      {showProfileMenu && renderProfileMenu()}

      {showPickupRequestModal && renderPickupRequestModal()}

      {renderAcceptedNotificationsModal()}

      {renderSelectedNotificationDetailModal()}

      {showSavedDonationsModal && renderSavedDonationsModal()}

      {showReportModal && renderReportModal()}

      {showHelpCenterModal && renderHelpCenterModal()}

    </div>
  );
};

export default ReceiverDashboard;

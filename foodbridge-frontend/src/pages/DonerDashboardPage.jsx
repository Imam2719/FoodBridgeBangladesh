import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Users, Clock, Calendar, Package,
  User, ChefHat, Building2, X, Upload, AlertCircle, Plus,
  CheckCircle, Clock3, Heart, ArrowLeft, Search,
  UserCog, Image, Trash2, Edit, Droplets,
  Receipt, Lock, LogOut, EyeOff, Eye, Bell,
  ArrowDown, Truck, Phone, ArrowUp, MessageSquare, Inbox, Send, Paperclip
} from 'lucide-react';

import '../style/DonorDashboard.css';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://foodbridgebangladesh-9ehu.onrender.com'
  : 'http://localhost:8080';


const DonorDashboard = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [showAllFoodItems, setShowAllFoodItems] = useState(false);
  const [donationStep, setDonationStep] = useState(0); // 0: not started, 1: category selection, 2: form
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [activeDonations, setActiveDonations] = useState([]);
  const [shouldShowFoodItems, setShouldShowFoodItems] = useState(true);
  const [allFoodItems, setAllFoodItems] = useState([]);
  const [foodItemsLoading, setFoodItemsLoading] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [availableRestaurantFoods, setAvailableRestaurantFoods] = useState([]);
  const [availableGroceryItems, setAvailableGroceryItems] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [selectedFoodDetails, setSelectedFoodDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [showNavigation, setShowNavigation] = useState(true);
  const [donationRequests, setDonationRequests] = useState([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedDonationForRequests, setSelectedDonationForRequests] = useState(null);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedSubTab, setSelectedSubTab] = useState('active');
  const [pendingDonations, setPendingDonations] = useState([]);
  const [rejectedDonations, setRejectedDonations] = useState([]);
  const [completedDonations, setCompletedDonations] = useState([]);
  const [selectedNotificationTab, setSelectedNotificationTab] = useState('all');
  const [viewingNotificationRequest, setViewingNotificationRequest] = useState(null);
  const [foodRequests, setFoodRequests] = useState([]);
  const [foodRequestsLoading, setFoodRequestsLoading] = useState(false);
  const [foodRequestsError, setFoodRequestsError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [donorProfile, setDonorProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState('');
  const [profileUpdateError, setProfileUpdateError] = useState('');
  const [donorId, setDonorId] = useState(null);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationToast, setNotificationToast] = useState({
    type: null,
    message: '',
    show: false
  });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedFoodForPurchase, setSelectedFoodForPurchase] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [selectedMainTab, setSelectedMainTab] = useState('donations'); // Update this line if it exists
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [selectedMessageTab, setSelectedMessageTab] = useState('received');
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [messageStats, setMessageStats] = useState({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageDetails, setShowMessageDetails] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationStats, setNotificationStats] = useState({
    totalNotifications: 0,
    unreadCount: 0,
    pickupRequests: 0,
    foodRequests: 0
  });
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);
  const [selectedNotificationForDetails, setSelectedNotificationForDetails] = useState(null);
  const [processedRequestIds, setProcessedRequestIds] = useState(new Set());
  const [processedFoodRequestIds, setProcessedFoodRequestIds] = useState(new Set());


  const handleViewNotificationDetails = async (notification) => {
    try {
      if (!notification.isRead) {
        await handleMarkNotificationAsRead(notification.id);
      }

      // Create a copy for details instead of mutating original
      const notificationForDetails = {
        ...notification,
        isRead: true,
        readAt: notification.readAt || new Date().toISOString()
      };

      setSelectedNotificationForDetails(notificationForDetails);
      setShowNotificationDetails(true);
    } catch (error) {
      console.error('Error viewing notification details:', error);
      alert('Failed to load notification details');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/notifications/${notificationId}?donorId=${donorId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
        const deletedNotification = notifications.find(n => n.id === notificationId);
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadNotifications(prev => Math.max(0, prev - 1));
        }
        fetchNotificationStats();
        console.log('✅ Notification deleted:', notificationId);
      }
    } catch (error) {
      console.error('💥 Error deleting notification:', error);
      alert('Failed to delete notification');
    }
  };

  const createPickupRequestNotification = async (donorId, requestId, donationId, requesterName, requesterId, donationName, quantity) => {
    try {
      // Check if notification already exists in current state
      const existingNotification = notifications.find(
        n => n.type === 'PICKUP_REQUEST' && n.requestId === requestId
      );

      if (existingNotification) {
        console.log('Notification already exists for request:', requestId);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/donor/notifications/pickup-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorId,
          requestId,
          donationId,
          requesterName,
          requesterId,
          donationName,
          quantity
        })
      });

      if (response.ok) {
        console.log('✅ Pickup request notification created');
        // Refresh notifications only once
        await fetchNotifications();
        await fetchNotificationStats();

        // Show toast only for new notifications
        setNotificationToast({
          type: 'pickup',
          message: `New pickup request from ${requesterName} for ${donationName}`,
          show: true
        });
        setTimeout(() => {
          setNotificationToast(prev => ({ ...prev, show: false }));
        }, 5000);
      }
    } catch (error) {
      console.error('💥 Error creating pickup request notification:', error);
    }
  };

  const createFoodRequestNotification = async (donorId, foodRequestId, requesterName, requesterId, foodType, peopleCount) => {
    try {
      // Check if notification already exists in current state
      const existingNotification = notifications.find(
        n => n.type === 'FOOD_REQUEST' && n.foodRequestId === foodRequestId
      );

      if (existingNotification) {
        console.log('Notification already exists for food request:', foodRequestId);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/donor/notifications/food-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorId,
          foodRequestId,
          requesterName,
          requesterId,
          foodType,
          peopleCount
        })
      });

      if (response.ok) {
        console.log('✅ Food request notification created');
        // Refresh notifications only once
        await fetchNotifications();
        await fetchNotificationStats();
      }
    } catch (error) {
      console.error('💥 Error creating food request notification:', error);
    }
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      let endpoint;
      switch (selectedNotificationTab) {
        case 'unread':
          endpoint = `${API_BASE_URL}/api/donor/notifications/unread?donorId=${donorId}`;
          break;
        case 'read':
          endpoint = `${API_BASE_URL}/api/donor/notifications/read?donorId=${donorId}`;
          break;
        default:
          endpoint = `${API_BASE_URL}/api/donor/notifications?donorId=${donorId}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();

      // Deduplicate notifications by ID
      const uniqueNotifications = data.reduce((acc, current) => {
        const exists = acc.find(item => item.id === current.id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      setNotifications(uniqueNotifications);
      const unreadCount = uniqueNotifications.filter(notification => !notification.isRead).length;
      setUnreadNotifications(unreadCount);
      console.log('✅ Notifications fetched:', uniqueNotifications);
    } catch (error) {
      console.error('💥 Error fetching notifications:', error);
      setNotificationsError('Failed to load notifications');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/notifications/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch notification stats');
      }
      const data = await response.json();
      setNotificationStats(data);
      console.log('✅ Notification stats fetched:', data);
    } catch (error) {
      console.error('💥 Error fetching notification stats:', error);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/notifications/${notificationId}/mark-read?donorId=${donorId}`, {
        method: 'PUT'
      });

      if (response.ok) {
        // Update notifications state immediately
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, isRead: true, readAt: new Date().toISOString() }
              : notification
          )
        );

        // Update unread count
        setUnreadNotifications(prev => Math.max(0, prev - 1));

        // Refresh stats
        await fetchNotificationStats();
        console.log('✅ Notification marked as read:', notificationId);
      }
    } catch (error) {
      console.error('💥 Error marking notification as read:', error);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/notifications/mark-all-read?donorId=${donorId}`, {
        method: 'PUT'
      });
      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadNotifications(0);
        fetchNotificationStats();
        console.log('✅ All notifications marked as read');
      }
    } catch (error) {
      console.error('💥 Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    return () => {
      setProcessedRequestIds(new Set());
      setProcessedFoodRequestIds(new Set());
    };
  }, []);


  useEffect(() => {
    if (donorId) {
      fetchNotifications();
      fetchNotificationStats();

      const notificationInterval = setInterval(() => {
        fetchNotifications();
        fetchNotificationStats();
      }, 300000); // 5 minutes instead of 25 minutes

      return () => clearInterval(notificationInterval);
    }
  }, [donorId, selectedNotificationTab]);


  const fetchReceivedMessages = async () => {
    setMessagesLoading(true);
    setMessagesError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/messages/received`);
      if (!response.ok) {
        throw new Error('Failed to fetch received messages');
      }
      const data = await response.json();
      setReceivedMessages(data);
      console.log('✅ Received messages (role-based):', data);

      data.forEach(msg => {
        console.log(`Message ID: ${msg.id}, Role: ${msg.role}, Subject: ${msg.subject}`);
      });
    } catch (error) {
      console.error('💥 Error fetching received messages:', error);
      setMessagesError('Failed to load received messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchSentMessages = async () => {
    setMessagesLoading(true);
    setMessagesError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/messages/sent`);
      if (!response.ok) {
        throw new Error('Failed to fetch sent messages');
      }
      const data = await response.json();
      setSentMessages(data);
      console.log('✅ Sent messages (role-based):', data);
    } catch (error) {
      console.error('💥 Error fetching sent messages:', error);
      setMessagesError('Failed to load sent messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchMessageStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/messages/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch message stats');
      }
      const data = await response.json();
      setMessageStats(data);
      console.log('✅ Message stats (role-based):', data);
    } catch (error) {
      console.error('💥 Error fetching message stats:', error);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/messages/messages/${messageId}/mark-read`, {
        method: 'PUT'
      });

      if (response.ok) {
        setReceivedMessages(prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, read: true } : msg
          )
        );
        fetchMessageStats(); // Refresh stats
        console.log('✅ Message marked as read (role-based):', messageId);
      }
    } catch (error) {
      console.error('💥 Error marking message as read:', error);
    }
  };

  const handleDeleteSentMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/messages/sent/${messageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSentMessages(prev => prev.filter(msg => msg.id !== messageId));
        alert('Message deleted successfully');
        console.log('✅ Message deleted (role-based):', messageId);
      } else {
        throw new Error('Failed to delete message');
      }
    } catch (error) {
      console.error('💥 Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const handleSendMessage = async (formData) => {
    try {
      console.log('🚀 Sending message with form data...');
      for (let [key, value] of formData.entries()) {
        console.log(`📝 ${key}: ${value}`);
      }

      const response = await fetch(`${API_BASE_URL}/api/donor/messages/send`, {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      console.log(' Response:', result);

      if (result.success) {
        alert('Message sent successfully!');
        setShowComposeModal(false);
        fetchSentMessages();
        fetchMessageStats();

        console.log('✅ Message sent successfully');
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('💥 Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    }
  };

  useEffect(() => {
    if (selectedMainTab === 'messages') {
      console.log(' Loading messages (role-based)...');
      fetchReceivedMessages();
      fetchSentMessages();
      fetchMessageStats();
    }
  }, [selectedMainTab]);

  const handleDonate = (food) => {
    console.log('🟢 Opening purchase modal for:', food.name);

    setShowDonationForm(false);
    setDonationStep(0);
    setSelectedFood(null);
    setShowDetailsModal(false);
    setPurchaseError(null);
    setPurchaseSuccess(null);
    setSelectedFoodForPurchase(food);
    setShowPurchaseModal(true);
    fetch(`${API_BASE_URL}/api/donor/food-items/${food.id}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch food details');
        return response.json();
      })
      .then(data => {
        setSelectedFoodForPurchase(prevData => ({
          ...food, // Keep original food data
          imageBase64: data.imageBase64,
          imageContentType: data.imageContentType
        }));
      })
      .catch(error => {
        console.error('Error fetching food details:', error);
      });
  };

  const handlePurchaseSubmit = (formData) => {
    console.log('🚀 Starting purchase process with FormData');
    setPurchaseLoading(true);
    setPurchaseError(null);
    setPurchaseSuccess(null);
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    fetch(`${API_BASE_URL}/api/merchant/sales/create`, {
      method: 'POST',
      body: formData, // Send FormData directly
    })
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          return response.text().then(text => {
            console.error('Server error response:', text);
            throw new Error(text || 'Failed to complete purchase');
          });
        }
        return response.json();
      })
      .then(result => {
        console.log('✅ Purchase completed successfully:', result);

        if (result.success !== false) {
          setPurchaseSuccess('Your purchase successfully done!');

          setTimeout(() => {
            setShowPurchaseModal(false);
            setSelectedFoodForPurchase(null);

            fetchAllFoodItems();
            fetchActiveDonations();
          }, 3000);
        } else {
          throw new Error(result.message || 'Purchase failed');
        }
      })
      .catch(error => {
        console.error('❌ Purchase error:', error);
        setPurchaseError(error.message || 'Failed to complete the purchase. Please try again.');
      })
      .finally(() => {
        setPurchaseLoading(false);
      });
  };

  const fetchPurchaseHistory = () => {
    if (!donorId) return;

    fetch(`${API_BASE_URL}/api/merchant/sales/donor/${donorId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch purchase history');
        }
        return response.json();
      })
      .then(data => {
        setPurchaseHistory(data);
      })
      .catch(error => {
        console.error('Error fetching purchase history:', error);
      });
  };
  useEffect(() => {
    if (donorId) {
      fetchPurchaseHistory();
    }
  }, [donorId]);

  const handleDeleteDonation = async (donationId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');

    if (confirmDelete) {
      try {
        let response;

        // Use different endpoints based on current tab
        if (selectedSubTab === 'rejected') {
          // Delete rejected requests from receiver_food_requests table
          response = await fetch(`${API_BASE_URL}/api/donor/donations/${donationId}/rejected-requests?donorId=${donorId}`, {
            method: 'DELETE',
          });
        } else {
          // Delete donation from donations table (for other tabs)
          response = await fetch(`${API_BASE_URL}/api/donor/donations/${donationId}?donorId=${donorId}`, {
            method: 'DELETE',
          });
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to delete item');
        }

        // Update the appropriate state based on current tab
        if (selectedSubTab === 'active') {
          setActiveDonations(prevDonations =>
            prevDonations.filter(donation => donation.id !== donationId)
          );
        } else if (selectedSubTab === 'rejected') {
          setRejectedDonations(prevDonations =>
            prevDonations.filter(donation => donation.id !== donationId)
          );
        } else if (selectedSubTab === 'pending') {
          setPendingDonations(prevDonations =>
            prevDonations.filter(donation => donation.id !== donationId)
          );
        } else if (selectedSubTab === 'completed') {
          setCompletedDonations(prevDonations =>
            prevDonations.filter(donation => donation.id !== donationId)
          );
        }

        alert(selectedSubTab === 'rejected' ?
          'Rejected requests deleted successfully' :
          'Donation deleted successfully'
        );
      } catch (error) {
        console.error('Error deleting item:', error);
        alert(error.message || 'Failed to delete item');
      }
    }
  };

  const fetchDonationsByStatus = async (status) => {
    setApiLoading(true);
    setApiError(null);

    try {
      console.log(`Fetching donations with status ${status} for donor ID: ${donorId}`);
      let apiUrl;
      if (status === 'active') {
        apiUrl = `${API_BASE_URL}/api/donor/donations/active?donorId=${donorId}`;
      } else if (status === 'pending') {
        apiUrl = `${API_BASE_URL}/api/donor/donations/pending?donorId=${donorId}`;
      } else if (status === 'rejected') {
        apiUrl = `${API_BASE_URL}/api/donor/donations/rejected?donorId=${donorId}`;
      } else if (status === 'completed') {
        apiUrl = `${API_BASE_URL}/api/donor/donations/completed?donorId=${donorId}`;
      } else {
        throw new Error(`Unknown status: ${status}`);
      }
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching ${status} donations:`, errorText);
        throw new Error(`Failed to fetch ${status} donations`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.warn('Invalid data received:', data);
        return;
      }

      const formattedDonations = data.map(donation => ({
        id: donation.id,
        foodName: donation.foodName || 'Unnamed Donation',
        category: donation.category?.label || donation.category || 'Uncategorized',
        quantity: donation.quantity || 'Unknown',
        expiry: donation.expiryDate,
        location: donation.location || 'No location',
        donorType: donation.donorType || 'Unknown',
        status: donation.status,
        preparation: donation.preparationDate,
        packaging: donation.packaging || 'Not specified',
        dietaryInfo: Array.isArray(donation.dietaryInfo)
          ? donation.dietaryInfo.join(', ')
          : 'Not specified',
        storageInstructions: donation.storageInstructions || 'Not specified',
        imageUrl: donation.imageData
          ? `data:${donation.imageContentType || 'image/jpeg'};base64,${donation.imageData}`
          : '/api/placeholder/400/200'
      }));

      if (status === 'active') {
        setActiveDonations(formattedDonations);
      } else if (status === 'pending') {
        setPendingDonations(formattedDonations);
      } else if (status === 'rejected') {
        setRejectedDonations(formattedDonations);
      } else if (status === 'completed') {
        setCompletedDonations(formattedDonations);
      }

    } catch (error) {
      console.error(`Error in fetchDonationsByStatus(${status}):`, error);
      setApiError(error.message);
      if (status === 'active') {
        setActiveDonations([]);
      } else if (status === 'pending') {
        setPendingDonations([]);
      } else if (status === 'rejected') {
        setRejectedDonations([]);
      } else if (status === 'completed') {
        setCompletedDonations([]);
      }
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    console.log('Active donations state updated:', activeDonations);
    console.log('Pending donations state updated:', pendingDonations);
  }, [activeDonations, pendingDonations]);

  const handleCheckRequests = async (donation) => {
    try {
      setRequestsLoading(true);
      setSelectedDonationForRequests(donation);
      setSelectedMainTab('donations');

      console.log(`Checking requests for donation ID: ${donation.id}`);

      const response = await fetch(`${API_BASE_URL}/api/donor/donations/${donation.id}/requests?donorId=${donorId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Failed to fetch requests: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Requests data:', data);

      const enhancedRequests = data.map(request => ({
        ...request,
        imageUrl: request.imageData
          ? `data:${request.imageContentType || 'image/jpeg'};base64,${request.imageData}`
          : donation.imageUrl || '/api/placeholder/400/200',
        receiverName: request.receiverName || request.requesterName || 'Anonymous',
        requestDate: request.requestDate || new Date(request.createdAt || Date.now()).toLocaleString(),
        status: request.status || 'PENDING',
        quantity: request.quantity || 'Not specified',
        pickupMethod: request.pickupMethod || 'Self Pickup',
        location: request.location || 'No location specified',
        note: request.note || request.notes || ''
      }));

      const pendingRequests = enhancedRequests.filter(request => request.status === 'PENDING');

      // Remove the notification creation logic from here - it should only happen in polling

      setDonationRequests(pendingRequests);
      setShowRequestsModal(true);
    } catch (error) {
      console.error('Error fetching requests:', error);
      alert('Failed to load requests. Please try again.');
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId, status, note = '') => {
    try {
      setRequestsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/donor/requests/${requestId}/status?donorId=${donorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          responseNote: note
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update request status: ${errorText || response.statusText}`);
      }
      if (selectedDonationForRequests) {
        const refreshResponse = await fetch(
          `${API_BASE_URL}/api/donor/donations/${selectedDonationForRequests.id}/requests?donorId=${donorId}`,
          { credentials: 'include' }
        );

        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json();
          const pendingRequests = refreshedData.filter(request => request.status === 'PENDING');
          setDonationRequests(pendingRequests);
        }
      }

      if (donationRequests.length === 0) {
        setShowRequestsModal(false);
      }
      await Promise.all([
        fetchActiveDonations(),
        fetchDonationsByStatus('pending'),
        fetchDonationsByStatus('rejected'),
        fetchDonationsByStatus('completed')
      ]);
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('Failed to update request status: ' + error.message);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleEditDonation = (donation) => {
    console.log("Opening edit modal for donation:", donation);

    if (donation.category) {
      console.log(`Original category format: ${donation.category}`);
    }
    const formData = {
      foodName: donation.foodName || '',
      category: donation.category || '',
      quantity: donation.quantity || '',
      expiry: donation.expiry || '',
      location: donation.location || '',
      description: donation.description || '',
      donorType: donation.donorType || '',
      preparation: donation.preparation || '',
      dietaryInfo: donation.dietaryInfo || '',
      packaging: donation.packaging || '',
      storageInstructions: donation.storageInstructions || '',
      image: null,
      donationId: donation.id
    };

    console.log("Form data initialized with:", formData);
    setDonationForm(formData);
    setEditingDonation(donation);
    setShowEditModal(true);
  };

  const handleEditSubmit = (e, localFormData) => {
    e.preventDefault();
    setApiLoading(true);
    setApiError(null);
    const formData = new FormData();
    const formToUse = localFormData || donationForm;
    console.log('Using form data:', formToUse);
    const fieldMapping = {
      'expiry': 'expiryDate',
      'preparation': 'preparationDate'
    };

    Object.keys(formToUse).forEach(key => {
      if (formToUse[key] !== null && formToUse[key] !== undefined && key !== 'image' && key !== 'donationId') {
        if (key === 'expiry' || key === 'preparation') {
          if (formToUse[key] && formToUse[key].includes('T')) {
            const dateValue = formToUse[key].split('T')[0];
            formData.append(fieldMapping[key] || key, dateValue);
            console.log(`Converting ${key} from ${formToUse[key]} to ${dateValue}`);
          } else if (formToUse[key]) {
            formData.append(fieldMapping[key] || key, formToUse[key]);
            console.log(`Using ${key} directly: ${formToUse[key]}`);
          }
        }
        else if (key === 'dietaryInfo') {
          if (Array.isArray(formToUse[key])) {
            formToUse[key].forEach(item => {
              formData.append('dietaryInfo', item);
              console.log(`Adding dietary info item: ${item}`);
            });
          } else if (typeof formToUse[key] === 'string' && formToUse[key].trim() !== '') {
            const items = formToUse[key].split(',').map(item => item.trim());
            items.forEach(item => {
              if (item) {
                formData.append('dietaryInfo', item);
                console.log(`Adding dietary info from string: ${item}`);
              }
            });
          }
        }

        else if (key === 'category') {
          let categoryValue = formToUse[key];
          if (categoryValue && !categoryValue.includes('_')) {
            const categoryMap = {
              "Homemade Food": "HOMEMADE_FOOD",
              "Restaurant & Café Surplus": "RESTAURANT_SURPLUS",
              "Corporate & Office Donations": "CORPORATE_DONATION",
              "Grocery Store Excess": "GROCERY_EXCESS",
              "Event & Wedding Leftovers": "EVENT_LEFTOVER",
              "Purchased Food for Donation": "PURCHASED_FOOD"
            };

            if (categoryMap[categoryValue]) {
              categoryValue = categoryMap[categoryValue];
            }
          }
          if (categoryValue) {
            formData.append('category', categoryValue);
            console.log(`Adding category: ${categoryValue}`);
          }
        }
        else {
          const backendKey = fieldMapping[key] || key;
          formData.append(backendKey, formToUse[key]);
          console.log(`Adding field ${backendKey}: ${formToUse[key]}`);
        }
      }
    });

    formData.append('donorId', donorId);
    console.log(`Adding donorId: ${donorId}`);
    if (formToUse.image) {
      formData.append('image', formToUse.image);
      console.log('Adding image file:', formToUse.image.name);
    }
    console.log('Sending updated donation data:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
    }
    const apiUrl = `${API_BASE_URL}/api/donor/donations/${formToUse.donationId}`;
    console.log('Updating donation at:', apiUrl);
    console.log('🚀 FINAL FORM DATA TO BE SENT:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    fetch(apiUrl, {
      method: 'PUT',
      body: formData,
    })
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          return response.text().then(text => {
            console.error('Server response:', text);
            throw new Error('Failed to update donation: ' + (text || response.statusText));
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Donation updated successfully:', data);
        console.log('Updated category returned from server:',
          data.category ?
            (typeof data.category === 'object' ?
              `${data.category.name} (${data.category.label})` :
              data.category) :
            'No category returned');
        alert('Donation updated successfully!');
        setShowEditModal(false);
        setEditingDonation(null);
        fetchActiveDonations();
      })
      .catch(error => {
        console.error('Error updating donation:', error);
        setApiError(error.message);
        alert(error.message || 'Failed to update donation. Please try again.');
      })
      .finally(() => {
        setApiLoading(false);
      });
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingDonation(null);
  };

  const handleCheckPendingRequests = async (donation) => {
    try {
      setRequestsLoading(true);
      setSelectedDonationForRequests(donation);
      setSelectedMainTab('donations');

      console.log(`Checking requests for pending donation ID: ${donation.id}`);

      const response = await fetch(`${API_BASE_URL}/api/donor/donations/${donation.id}/requests?donorId=${donorId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Failed to fetch requests: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Requests data for pending donation:', data);
      const acceptedRequests = data.filter(request => request.status === 'ACCEPTED');
      setDonationRequests(acceptedRequests);
      setShowRequestsModal(true);
    } catch (error) {
      console.error('Error fetching requests for pending donation:', error);
      alert('Failed to load requests. Please try again.');
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchRequestsForDonation = async (donationId) => {
    try {
      setRequestsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/donor/donations/${donationId}/requests?donorId=${donorId}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      const pendingRequests = data.filter(request => request.status === 'PENDING');
      setDonationRequests(pendingRequests);
    } catch (error) {
      console.error('Error fetching donation requests:', error);
      alert('Failed to load requests');
    } finally {
      setRequestsLoading(false);
    }
  };
  //
  const DonationRequestsModal = () => {
    const [responseNotes, setResponseNotes] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    if (!showRequestsModal || !selectedDonationForRequests) return null;

    const remainingQuantity = selectedDonationForRequests?.quantity
      ? parseInt(selectedDonationForRequests.quantity.replace(/[^0-9]/g, ''))
      : 0;
    const handleRequestStatusUpdate = async (requestId, status, note = '') => {
      try {
        setIsProcessing(true);

        if (!requestId || !status) {
          throw new Error('Invalid request parameters');
        }

        const response = await fetch(`${API_BASE_URL}/api/donor/requests/${requestId}/status?donorId=${donorId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: status,
            responseNote: note || (status === 'ACCEPTED'
              ? 'Your request has been accepted.'
              : 'Sorry, we cannot fulfill your request.')
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to update request status: ${response.statusText}`);
        }
        const message = status === 'ACCEPTED' ? 'Request accepted successfully!' : 'Request declined';

        await fetchRequestsForDonation(selectedDonationForRequests.id);
        if (donationRequests.length === 0) {
          setShowRequestsModal(false);
        }

      } catch (error) {
        console.error('Error updating request status:', error);
        alert(error.message || 'Failed to update request status');
      } finally {
        setIsProcessing(false);
      }
    };

    const getFallbackImageUrl = (request) => {

      if (request.imageUrl && request.imageUrl !== '/api/placeholder/400/200') {
        return request.imageUrl;
      }

      if (request.imageData) {
        return `data:${request.imageContentType || 'image/jpeg'};base64,${request.imageData}`;
      }

      if (selectedDonationForRequests?.imageUrl && selectedDonationForRequests.imageUrl !== '/api/placeholder/400/200') {
        return selectedDonationForRequests.imageUrl;
      }

      if (selectedDonationForRequests?.imageData) {
        return `data:${selectedDonationForRequests.imageContentType || 'image/jpeg'};base64,${selectedDonationForRequests.imageData}`;
      }

      return '/api/placeholder/400/200';
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <div className="donation-request-modal-overlay">
        <div className="donation-request-modal-container">
          <div className="donation-request-modal-header">
            <div className="donation-request-header-content">
              <h2>{selectedDonationForRequests.foodName} Requests</h2>
              <div className="donation-request-header-meta">
                <Package className="h-4 w-4" />
                <span>Remaining: <strong>{remainingQuantity} servings</strong></span>
              </div>
            </div>
            <button
              className="donation-request-close-btn"
              onClick={() => setShowRequestsModal(false)}
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="donation-request-modal-body">
            {(requestsLoading || isProcessing) && (
              <div className="donation-request-loading">
                <span className="donation-request-spinner"></span>
                <span>{isProcessing ? 'Processing your request...' : 'Loading requests...'}</span>
              </div>
            )}

            {!requestsLoading && donationRequests.length === 0 && (
              <div className="donation-request-empty">
                <Users className="h-16 w-16 text-gray-300" />
                <p>No requests received for this donation</p>
                <span className="text-gray-500 text-sm mt-2">When someone requests your donation, it will appear here</span>
              </div>
            )}

            {!requestsLoading && donationRequests.length > 0 && (
              <div className="donation-requests-grid">
                {donationRequests.map(request => (
                  <div key={request.id} className="donation-request-card">
                    <div className="donation-request-image">
                      <img
                        src={getFallbackImageUrl(request)}
                        alt={request.foodName || "Requested Food"}
                        className="donation-request-food-image"
                      />
                    </div>

                    <div className="donation-request-details">
                      {/* Request Header with User Info */}
                      <div className="donation-request-card-header">
                        <div className="donation-request-user-info">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="font-medium">{request.receiverName || 'Anonymous'}</span>
                        </div>
                        <div className={`donation-request-status ${request.status.toLowerCase()}`}>
                          {request.status}
                        </div>
                      </div>

                      <div className="donation-request-info">
                        <div className="donation-request-info-item">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {formatDate(request.requestDate)}
                          </span>
                        </div>
                        <div className="donation-request-info-item">
                          <Package className="h-3.5 w-3.5" />
                          <span>Quantity: <strong>{request.quantity}</strong></span>
                        </div>
                        <div className="donation-request-info-item">
                          <Truck className="h-3.5 w-3.5" />
                          <span>
                            {request.pickupMethod === 'courier'
                              ? 'Courier Pickup'
                              : 'Self Pickup'
                            }
                          </span>
                        </div>
                        <div className="donation-request-info-item">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{request.location || 'No location specified'}</span>
                        </div>
                      </div>
                      {request.note && (
                        <div className="donation-request-note">
                          <p>"{request.note}"</p>
                        </div>
                      )}

                      {request.status === 'PENDING' && (
                        <div className="donation-request-actions">
                          <input
                            type="text"
                            placeholder="Add a response note..."
                            className="donation-request-note-input"
                            value={responseNotes[request.id] || ''}
                            onChange={(e) => setResponseNotes({
                              ...responseNotes,
                              [request.id]: e.target.value
                            })}
                            disabled={isProcessing}
                          />
                          <div className="donation-request-action-buttons">
                            <button
                              className="donation-request-accept-btn"
                              onClick={() => handleRequestStatusUpdate(
                                request.id,
                                'ACCEPTED',
                                responseNotes[request.id]
                              )}
                              disabled={isProcessing}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Accept</span>
                            </button>
                            <button
                              className="donation-request-decline-btn"
                              onClick={() => handleRequestStatusUpdate(
                                request.id,
                                'REJECTED',
                                responseNotes[request.id]
                              )}
                              disabled={isProcessing}
                            >
                              <X className="h-4 w-4" />
                              <span>Decline</span>
                            </button>
                          </div>
                        </div>
                      )}
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

  const NotificationDetailsModal = ({ notification, onClose }) => {
    if (!notification) return null;

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getAdditionalData = () => {
      try {
        return JSON.parse(notification.additionalData || '{}');
      } catch {
        return {};
      }
    };

    const additionalData = getAdditionalData();

    return (
      <div className="modal-overlay fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[80] flex items-center justify-center">
        <div className="notification-details-modal bg-white dark:bg-gray-900 rounded-xl shadow-xl dark:shadow-black/30 w-11/12 max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <div className="modal-header bg-gradient-to-r from-yellow-600 to-yellow-400 dark:from-yellow-800 dark:to-yellow-600 p-4 flex justify-between items-center">
            <h3 className="modal-title text-white font-semibold text-lg flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Details
            </h3>
            <button
              className="close-btn w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="modal-body p-6 overflow-y-auto flex-1">
            <div className="notification-details-container space-y-6">
              {/* Notification Header */}
              <div className="notification-header bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {notification.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatDate(notification.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${notification.isRead
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                      {notification.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${notification.type === 'PICKUP_REQUEST'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                      {notification.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="message-content bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Message</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {notification.message}
                </p>
              </div>

              {/* Additional Details */}
              {Object.keys(additionalData).length > 0 && (
                <div className="additional-details bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Request Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {additionalData.donationName && (
                      <div>
                        <span className="text-blue-700 dark:text-blue-300 font-medium">Item:</span>
                        <span className="ml-2 text-blue-900 dark:text-blue-100">{additionalData.donationName}</span>
                      </div>
                    )}
                    {additionalData.quantity && (
                      <div>
                        <span className="text-blue-700 dark:text-blue-300 font-medium">Quantity:</span>
                        <span className="ml-2 text-blue-900 dark:text-blue-100">{additionalData.quantity}</span>
                      </div>
                    )}
                    {additionalData.foodType && (
                      <div>
                        <span className="text-blue-700 dark:text-blue-300 font-medium">Food Type:</span>
                        <span className="ml-2 text-blue-900 dark:text-blue-100">{additionalData.foodType}</span>
                      </div>
                    )}
                    {additionalData.peopleCount && (
                      <div>
                        <span className="text-blue-700 dark:text-blue-300 font-medium">People Count:</span>
                        <span className="ml-2 text-blue-900 dark:text-blue-100">{additionalData.peopleCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Requester Information */}
              {notification.requesterName && (
                <div className="requester-info bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Requester Information
                  </h3>
                  <p className="text-purple-700 dark:text-purple-300">
                    <strong>Name:</strong> {notification.requesterName}
                  </p>
                  {notification.requesterId && (
                    <p className="text-purple-700 dark:text-purple-300 mt-1">
                      <strong>ID:</strong> {notification.requesterId}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-3">
            {!notification.isRead && (
              <button
                className="btn-mark-read bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => {
                  handleMarkNotificationAsRead(notification.id);
                  onClose();
                }}
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Read
              </button>
            )}
            <button
              className="btn-close bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EditDonationModal = ({ donation, onClose, onSubmit, loading, error }) => {
    const [localForm, setLocalForm] = useState({
      foodName: donation?.foodName || '',
      category: donation?.category || '',
      quantity: donation?.quantity || '',
      expiry: donation?.expiry || '',
      location: donation?.location || '',
      description: donation?.description || '',
      donorType: donation?.donorType || '',
      preparation: donation?.preparation || '',
      dietaryInfo: donation?.dietaryInfo || '',
      packaging: donation?.packaging || '',
      storageInstructions: donation?.storageInstructions || '',
      image: null,
      donationId: donation?.id
    });

    const updateTheme = (isDark) => {
      const body = document.body;

      if (isDark) {
        body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    };

    const toggleTheme = () => {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      updateTheme(newDarkMode);
    };

    useEffect(() => {
      console.log('Initial edit form state:', localForm);
    }, []);

    const handleLocalChange = (field, value) => {
      console.log(`Changing field ${field} from "${localForm[field]}" to "${value}"`);

      if (field === 'category') {
        console.log(`Category selected: ${value}`);
      }

      setLocalForm(prevForm => ({
        ...prevForm,
        [field]: value
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Form being submitted with data:', localForm);

      const formToSubmit = { ...localForm };

      if (formToSubmit.category) {
        const categoryMap = {
          "Homemade Food": "HOMEMADE_FOOD",
          "Restaurant & Café Surplus": "RESTAURANT_SURPLUS",
          "Corporate & Office Donations": "CORPORATE_DONATION",
          "Grocery Store Excess": "GROCERY_EXCESS",
          "Event & Wedding Leftovers": "EVENT_LEFTOVER",
          "Purchased Food for Donation": "PURCHASED_FOOD"
        };

        if (categoryMap[formToSubmit.category]) {
          formToSubmit.category = categoryMap[formToSubmit.category];
          console.log(`Converted category to enum format: ${formToSubmit.category}`);
        }
      }

      onSubmit(e, formToSubmit);
    };

    if (!donation) return null;

    const hasFieldChanged = (field) => {
      return localForm[field] !== donation[field];
    };

    const identifyCategoryFormat = (category) => {
      if (!category) return 'Empty';
      if (category.includes('_')) return 'Enum format (with underscore)';
      if (category.includes('&')) return 'Human-readable format (contains &)';
      return `Unknown format: ${category}`;
    };

    return (
      <div className="edit-modal-overlay">
        <div className="edit-modal-container">
          <div className="edit-modal-header">
            <h2 className="edit-modal-title">
              Edit Donation - {donation.foodName}
            </h2>
            <button className="edit-modal-close" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="edit-error-message">
              <span>{error}</span>
            </div>
          )}

          <form className="edit-form" onSubmit={handleSubmit}>
            <div className="edit-form-scroll">
              <div className="edit-section">
                <h3 className="edit-section-title">
                  Food Information
                </h3>
                <div className="edit-grid">
                  <div className="edit-field">
                    <label htmlFor="category">Donation Category* {hasFieldChanged('category') && <span className="changed-field-indicator">(changed)</span>}</label>
                    <select
                      id="category"
                      value={localForm.category}
                      onChange={(e) => handleLocalChange('category', e.target.value)}
                      required
                      className={hasFieldChanged('category') ? 'field-changed' : ''}
                    >
                      <option value="">Select Category</option>
                      <option value="HOMEMADE_FOOD">Homemade Food</option>
                      <option value="RESTAURANT_SURPLUS">Restaurant & Café Surplus</option>
                      <option value="CORPORATE_DONATION">Corporate & Office Donations</option>
                      <option value="GROCERY_EXCESS">Grocery Store Excess</option>
                      <option value="EVENT_LEFTOVER">Event & Wedding Leftovers</option>
                      <option value="PURCHASED_FOOD">Purchased Food for Donation</option>
                      <option value="BAKERY">Bakery Item</option>
                    </select>
                    <small>Current format: {identifyCategoryFormat(localForm.category)}</small>
                  </div>

                  <div className="edit-field">
                    <label htmlFor="foodName">Food Name*</label>
                    <input
                      id="foodName"
                      type="text"
                      value={localForm.foodName}
                      onChange={(e) => handleLocalChange('foodName', e.target.value)}
                      placeholder="Enter food name"
                      required
                      className={hasFieldChanged('foodName') ? 'field-changed' : ''}
                    />
                  </div>

                  <div className="edit-field">
                    <label htmlFor="quantity">Quantity*</label>
                    <input
                      id="quantity"
                      type="text"
                      value={localForm.quantity}
                      onChange={(e) => handleLocalChange('quantity', e.target.value)}
                      placeholder="e.g., 5 servings, 2kg"
                      required
                      className={hasFieldChanged('quantity') ? 'field-changed' : ''}
                    />
                  </div>

                  <div className="edit-field">
                    <label htmlFor="donorType">Donor Type</label>
                    <input
                      id="donorType"
                      type="text"
                      value={localForm.donorType}
                      onChange={(e) => handleLocalChange('donorType', e.target.value)}
                      placeholder="Restaurant, Individual, etc."
                      className={hasFieldChanged('donorType') ? 'field-changed' : ''}
                    />
                  </div>

                  <div className="edit-field full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      value={localForm.description || ''}
                      onChange={(e) => handleLocalChange('description', e.target.value)}
                      placeholder="Add any additional details about the food"
                      rows={3}
                      className={hasFieldChanged('description') ? 'field-changed' : ''}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Dates & Storage Section */}
              <div className="edit-section">
                <h3 className="edit-section-title">
                  Dates & Storage
                </h3>
                <div className="edit-grid">
                  <div className="edit-field">
                    <label htmlFor="expiry">Expiry Date & Time*</label>
                    <input
                      id="expiry"
                      type="date"
                      value={localForm.expiry ? (localForm.expiry.includes('T') ? localForm.expiry.split('T')[0] : localForm.expiry) : ''}
                      onChange={(e) => handleLocalChange('expiry', e.target.value)}
                      required
                      className={hasFieldChanged('expiry') ? 'field-changed' : ''}
                    />
                  </div>

                  <div className="edit-field">
                    <label htmlFor="preparation">Preparation Date*</label>
                    <input
                      id="preparation"
                      type="date"
                      value={localForm.preparation ? (localForm.preparation.includes('T') ? localForm.preparation.split('T')[0] : localForm.preparation) : ''}
                      onChange={(e) => handleLocalChange('preparation', e.target.value)}
                      required
                      className={hasFieldChanged('preparation') ? 'field-changed' : ''}
                    />
                  </div>

                  <div className="edit-field">
                    <label htmlFor="packaging">Packaging</label>
                    <input
                      id="packaging"
                      type="text"
                      value={localForm.packaging || ''}
                      onChange={(e) => handleLocalChange('packaging', e.target.value)}
                      placeholder="Not specified"
                      className={hasFieldChanged('packaging') ? 'field-changed' : ''}
                    />
                  </div>

                  <div className="edit-field">
                    <label htmlFor="storageInstructions">Storage Instructions</label>
                    <input
                      id="storageInstructions"
                      type="text"
                      value={localForm.storageInstructions || ''}
                      onChange={(e) => handleLocalChange('storageInstructions', e.target.value)}
                      placeholder="Not specified"
                      className={hasFieldChanged('storageInstructions') ? 'field-changed' : ''}
                    />
                  </div>

                  <div className="edit-field">
                    <label htmlFor="dietaryInfo">Dietary Information</label>
                    <input
                      id="dietaryInfo"
                      type="text"
                      value={typeof localForm.dietaryInfo === 'string' ? localForm.dietaryInfo : (Array.isArray(localForm.dietaryInfo) ? localForm.dietaryInfo.join(', ') : '')}
                      onChange={(e) => handleLocalChange('dietaryInfo', e.target.value)}
                      placeholder="Vegetarian, Vegan, Gluten-Free, etc. (comma separated)"
                      className={hasFieldChanged('dietaryInfo') ? 'field-changed' : ''}
                    />
                    <small className="edit-hint">Separate multiple items with commas</small>
                  </div>
                </div>
              </div>
              <div className="edit-section">
                <h3 className="edit-section-title">
                  Location & Image
                </h3>
                <div className="edit-grid">
                  <div className="edit-field full-width">
                    <label htmlFor="location">Location*</label>
                    <input
                      id="location"
                      type="text"
                      value={localForm.location || ''}
                      onChange={(e) => handleLocalChange('location', e.target.value)}
                      placeholder="Enter pickup location"
                      required
                      className={hasFieldChanged('location') ? 'field-changed' : ''}
                    />
                  </div>

                  <div className="edit-field full-width">
                    <label>Update Food Image</label>
                    <div className="edit-upload">
                      <input
                        type="file"
                        id="food-image-edit"
                        className="file-input"
                        accept="image/*"
                        onChange={(e) => handleLocalChange('image', e.target.files[0])}
                      />
                      <label htmlFor="food-image-edit" className="upload-box">
                        <Upload className="upload-icon" />
                        <span>Click to upload or drag and drop</span>
                        <span className="upload-hint">PNG, JPG up to 5MB</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="edit-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-update" disabled={loading}>
                {loading ? "Updating..." : "Update Donation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };


  const fetchActiveDonations = () => {
    setApiLoading(true);
    setApiError(null);

    console.log('Fetching active donations for donor ID:', donorId);

    fetch(`${API_BASE_URL}/api/donor/donations/active?donorId=${donorId}`)
      .then(response => {
        console.log(`Response status for active donations: ${response.status}`);
        if (!response.ok) {
          return response.text().then(text => {
            console.error('Error response body:', text);
            throw new Error(`Failed to fetch active donations: ${response.statusText}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Active donations received:', data);

        if (!Array.isArray(data)) {
          console.warn('Received non-array data:', data);
          setActiveDonations([]);
          return;
        }
        const filteredDonations = data.filter(donation => {
          if (!donation.quantity) return false;

          const quantityMatch = donation.quantity.match(/\d+/);
          if (!quantityMatch) return false;

          const quantity = parseInt(quantityMatch[0], 10);
          return quantity > 0;
        });

        const formattedDonations = filteredDonations.map(donation => ({
          id: donation.id,
          foodName: donation.foodName,
          category: donation.category?.label || donation.category,
          quantity: donation.quantity,
          expiry: donation.expiryDate,
          location: donation.location,
          donorType: donation.donorType,
          status: donation.status,
          preparation: donation.preparationDate,
          packaging: donation.packaging || 'Not specified',
          dietaryInfo: Array.isArray(donation.dietaryInfo) ? donation.dietaryInfo.join(', ') : 'Not specified',
          storageInstructions: donation.storageInstructions || 'Not specified',
          imageUrl: donation.imageData ?
            `data:${donation.imageContentType || 'image/jpeg'};base64,${donation.imageData}`
            : '/api/placeholder/400/200'
        }));

        setActiveDonations(formattedDonations);
      })
      .catch(error => {
        console.error('Error fetching active donations:', error);
        setApiError(`Failed to fetch active donations: ${error.message}`);
      })
      .finally(() => {
        setApiLoading(false);
      });
  };

  useEffect(() => {
    if (selectedMainTab === 'activeDonations' && donorId) {
      fetchActiveDonations();
    }
  }, [selectedMainTab, donorId]);


  useEffect(() => {
    if (donorId) {
      fetchActiveDonations();
      fetchDonationsByStatus('pending');
      fetchDonationsByStatus('rejected');
      fetchDonationsByStatus('completed');
    }
  }, [donorId]);

  const fetchAllFoodItems = () => {
    setFoodItemsLoading(true);
    setApiError(null);

    console.log('Fetching all food items...');

    fetch(`${API_BASE_URL}/api/donor/food-items/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Total food items received:', data.length);
        console.log('Food items data:', data);

        const formattedItems = data.map(item => ({
          ...item,
          img: item.imageBase64
            ? `data:${item.imageContentType || 'image/jpeg'};base64,${item.imageBase64}`
            : '/api/placeholder/400/200',
          storeName: item.storeName || 'Unknown Source',
          foodType: item.foodType || 'Unspecified',
          quantity: item.remainingQuantity !== undefined
            ? `${item.remainingQuantity} units`
            : `${item.quantity || 0} units`,
          remainingQuantity: item.remainingQuantity || 0,
          totalQuantity: item.totalQuantity || item.quantity || 0,
          expiryDate: item.expiryDate || 'Not specified',
          location: item.location || 'Unknown location'
        }));

        setAllFoodItems(formattedItems);
        setShouldShowFoodItems(true);
      })
      .catch(error => {
        console.error('Error in fetchAllFoodItems:', error);
        setApiError(`Failed to fetch food items: ${error.message}`);
      })
      .finally(() => {
        setFoodItemsLoading(false);
      });
  };

  useEffect(() => {
    if (donorId) {
      fetchAllFoodItems();
    }
  }, [donorId]);

  useEffect(() => {
    setShouldShowFoodItems(!showDonationForm);
  }, [showDonationForm]);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar,
      requirements: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasDigit,
        hasSpecialChar
      }
    };
  };

  const [passwordValidation, setPasswordValidation] = useState({
    requirements: {
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasDigit: false,
      hasSpecialChar: false
    },
    isValid: false
  });

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword') {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
      if (passwordForm.confirmPassword) {
        setPasswordsMatch(value === passwordForm.confirmPassword);
      }
    }

    if (name === 'confirmPassword') {
      setPasswordsMatch(passwordForm.newPassword === value);
    }
  };
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {

    localStorage.removeItem('authUser');
    sessionStorage.removeItem('authUser');

    setShowLogoutModal(false);

    setLogoutSuccess(true);

    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    setShowNavigation(true);
    const authUserFromLocal = localStorage.getItem('authUser');
    const authUserFromSession = sessionStorage.getItem('authUser');
    const authUser = authUserFromLocal
      ? JSON.parse(authUserFromLocal)
      : (authUserFromSession ? JSON.parse(authUserFromSession) : null);

    console.log('Auth user data retrieved:', authUser);

    if (authUser && authUser.userId) {
      setDonorId(authUser.userId);
      console.log('Setting donor ID:', authUser.userId);
      setDonorProfile({
        firstName: authUser.firstName || '',
        lastName: authUser.lastName || '',
        email: authUser.email || '',
        phone: '',
        bloodGroup: '',
        birthdate: '',
        address: '',
        addressDescription: '',
        bio: '',
        userPhotoBase64: null,
        photoContentType: 'image/jpeg'
      });
    } else {
      console.error('No authenticated user found in storage');
      // Potentially redirect to login page if no auth data found
      // window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    if (donorId) {
      console.log('Donor ID changed, fetching profile data...');
      fetchDonorProfile();
    }
  }, [donorId]);


  useEffect(() => {
    console.log('Food Items Visibility State:', {
      showDonationForm,
      shouldShowFoodItems,
      donationStep
    });
  }, [showDonationForm, shouldShowFoodItems, donationStep]);


  const fetchDonorProfile = async () => {
    if (!donorId) {
      console.error('Attempted to fetch profile without a donor ID');
      return;
    }

    console.log('Fetching profile for donor ID:', donorId);
    console.log('API URL:', `${API_BASE_URL}/api/donor/profile/${donorId}`);

    setProfileLoading(true);
    setProfileUpdateError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/profile/${donorId}`);

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);

        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Profile data fetched (raw):', data);
      Object.keys(data).forEach(key => {
        console.log(`Profile property ${key}:`, key === 'userPhotoBase64' ? '[PHOTO DATA]' : data[key]);
      });

      if (data) {
        setDonorProfile(data);
      } else {
        setProfileUpdateError('No profile data returned from server');
      }
    } catch (error) {
      console.error('Error fetching donor profile:', error);
      setProfileUpdateError(error.message || 'Failed to load profile data');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchProfileWithoutLobData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/profile/${donorId}/basic`);

      if (!response.ok) {
        throw new Error(`Failed to fetch basic profile: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Basic profile data fetched:', data);

      if (data) {
        setDonorProfile(data);
      } else {
        setProfileUpdateError('No basic profile data returned from server');
      }
    } catch (error) {
      console.error('Error fetching basic donor profile:', error);
      setProfileUpdateError(error.message || 'Failed to load basic profile data');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileUpdateError('');
    setProfileUpdateSuccess('');

    const formData = new FormData(e.target);

    try {

      const response = await fetch(`${API_BASE_URL}/api/donor/profile/${donorId}`, {
        method: 'PUT',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setDonorProfile(data.donor);
        setProfileUpdateSuccess('Profile updated successfully');
        setShowProfileForm(false);
      } else {
        setProfileUpdateError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileUpdateError(error.message || 'An error occurred while updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchPendingDonations = () => {
    setApiLoading(true);
    setApiError(null);

    console.log(`Fetching pending donations for donor ID: ${donorId}`);

    fetch(`${API_BASE_URL}/api/donor/donations/pending?donorId=${donorId}`)
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            console.error('Error response body:', text);
            throw new Error(`Failed to fetch pending donations: ${response.statusText}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Pending donations received:', data);

        if (!Array.isArray(data)) {
          console.warn('Received non-array data:', data);
          return;
        }

        const formattedDonations = data.map(donation => ({
          id: donation.id,
          foodName: donation.foodName,
          category: donation.category?.label || donation.category,
          quantity: donation.quantity,
          expiry: donation.expiryDate,
          location: donation.location,
          donorType: donation.donorType,
          status: donation.status,
          preparation: donation.preparationDate,
          packaging: donation.packaging || 'Not specified',
          dietaryInfo: Array.isArray(donation.dietaryInfo) ? donation.dietaryInfo.join(', ') : 'Not specified',
          storageInstructions: donation.storageInstructions || 'Not specified',
          imageUrl: donation.imageData ?
            `data:${donation.imageContentType || 'image/jpeg'};base64,${donation.imageData}`
            : '/api/placeholder/400/200'
        }));

        setPendingDonations(formattedDonations);
      })
      .catch(error => {
        console.error('Error fetching pending donations:', error);
        setApiError(`Failed to fetch pending donations: ${error.message}`);
      })
      .finally(() => {
        setApiLoading(false);
      });
  };


  const handleMarkAsCompleted = async (donationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/donations/${donationId}/mark-completed?donorId=${donorId}`, {
        method: 'GET'
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to mark donation as completed');
      }

      alert('Donation marked as completed successfully');

      await fetchDonationsByStatus('pending');
      await fetchDonationsByStatus('completed');
    } catch (error) {
      console.error('Error marking donation as completed:', error);

      if (error.response) {
        try {
          const errorBody = await error.response.json();
          alert(errorBody.message || 'Failed to mark donation as completed');
        } catch {
          alert('Failed to mark donation as completed');
        }
      } else {
        alert(error.message || 'Failed to mark donation as completed');
      }
      console.error('Full error details:', error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordValidation.isValid) {
      setProfileUpdateError('Password does not meet security requirements');
      return;
    }

    if (!passwordsMatch) {
      setProfileUpdateError('New passwords do not match');
      return;
    }

    setProfileLoading(true);
    setProfileUpdateError('');
    setProfileUpdateSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/profile/${donorId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setProfileUpdateSuccess('Password updated successfully');
        setShowPasswordForm(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordValidation({
          requirements: {
            minLength: false,
            hasUpperCase: false,
            hasLowerCase: false,
            hasDigit: false,
            hasSpecialChar: false
          },
          isValid: false
        });
      } else {
        setProfileUpdateError(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setProfileUpdateError(error.message || 'An error occurred while changing password');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleViewDetails = async (food) => {
    try {
      const response = await fetch(`${API_BASE_URL || ''}/api/donor/food-items/${food.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch food item details');
      }

      const itemData = await response.json();
      setSelectedFoodDetails(itemData);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching food item details:', error);
      setApiError(error.message);
    }
  };


  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedFoodDetails(null);
  };

  const closeDonateModal = () => {
    setShowDonateModal(false);
  };

  const proceedToDonation = () => {
    setShowDonateModal(false);
    setDonationStep(3);
  };
  const renderFoodSelection = () => {
    const foods = selectedCategory === 'restaurant'
      ? availableRestaurantFoods
      : availableGroceryItems;

    const title = selectedCategory === 'restaurant'
      ? 'Select Restaurant Food'
      : 'Select Grocery Items';

    return (
      <div className="donation-flow-container food-selection">
        <div className="donation-flow-header">
          <button className="btn-back" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="donation-flow-title">{title}</h2>
          <button className="btn-close" onClick={cancelDonation}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="food-selection-search">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search available items..."
            className="food-search-input"
          />
        </div>

        {apiLoading && (
          <div className="loading-indicator">
            <span className="loading-spinner"></span>
            <span>Loading available items...</span>
          </div>
        )}

        {apiError && (
          <div className="error-message">
            <AlertCircle className="h-4 w-4" />
            <span>{apiError}</span>
          </div>
        )}

        {!apiLoading && foods.length === 0 && !apiError && (
          <div className="no-items-message">
            No items available in this category
          </div>
        )}

        <div className="food-selection-grid">
          {foods.map(food => (
            <FoodSelectionCard
              key={food.id}
              food={food}
              onSelect={selectFood}
              onViewDetails={handleViewDetails}
              onDonate={handleDonate}
            />
          ))}
        </div>
        {showDetailsModal && selectedFoodDetails && (
          <div className="modal-overlay">
            <div className="details-modal">
              <div className="modal-header">
                <h3 className="modal-title">Food Item Details</h3>
              </div>

              <div className="modal-body">
                <div className="food-details-container">
                  <div className="food-details-header-compact">
                    <div className="food-details-image-container">
                      <img
                        className="food-details-image-compact"
                        src={selectedFoodDetails.imageBase64
                          ? `data:${selectedFoodDetails.imageContentType || 'image/jpeg'};base64,${selectedFoodDetails.imageBase64}`
                          : '/api/placeholder/300/200'}
                        alt={selectedFoodDetails.name}
                      />
                    </div>
                    <div className="food-details-title-section">
                      <h2 className="food-details-title-compact">{selectedFoodDetails.name}</h2>
                      <div className="food-details-key-info">
                        <span className="food-info-badge type">
                          {selectedFoodDetails.foodType || 'Not specified'}
                        </span>
                        <span className="food-info-badge price">
                          {selectedFoodDetails.price ? `৳${selectedFoodDetails.price}` : 'Free'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="food-details-grid-compact">
                    <div className="food-details-item-compact">
                      <div className="food-details-label">Available Quantity</div>
                      <div className="food-details-value">{selectedFoodDetails.quantity} units</div>
                    </div>

                    <div className="food-details-item-compact">
                      <div className="food-details-label">Expiry Date</div>
                      <div className="food-details-value">
                        {selectedFoodDetails.expiryDate}
                      </div>
                    </div>

                    <div className="food-details-item-compact">
                      <div className="food-details-label">Store/Restaurant</div>
                      <div className="food-details-value">{selectedFoodDetails.storeName || 'Not specified'}</div>
                    </div>

                    <div className="food-details-item-compact">
                      <div className="food-details-label">Location</div>
                      <div className="food-details-value">{selectedFoodDetails.location || 'Not specified'}</div>
                    </div>

                    <div className="food-details-item-compact">
                      <div className="food-details-label">Food Prepared Time</div>
                      <div className="food-details-value">{selectedFoodDetails.deliveryTime || 'Not specified'}</div>
                    </div>

                    <div className="food-details-item-compact">
                      <div className="food-details-label">Dietary Information</div>
                      <div className="food-details-value">
                        {selectedFoodDetails.dietaryInfo && selectedFoodDetails.dietaryInfo.length > 0
                          ? selectedFoodDetails.dietaryInfo.join(', ')
                          : 'Not specified'}
                      </div>
                    </div>
                  </div>

                  {selectedFoodDetails.description && (
                    <div className="food-details-description-compact">
                      <span className="food-details-description-label">Description</span>
                      <p className="food-details-description-text">
                        {selectedFoodDetails.description || 'No description available'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeDetailsModal}>
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {showDonateModal && selectedFood && (
          <div className="modal-overlay">
            <div className="donate-modal">
              <div className="modal-header">
                <h3 className="modal-title">Donate Food Item</h3>
                <button className="btn-close" onClick={closeDonateModal}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="modal-body">
                <div className="food-details-container">
                  <div className="food-details-header">
                    <img
                      className="food-details-image"
                      src={selectedFood.img || '/api/placeholder/800/400'}
                      alt={selectedFood.name}
                    />
                    <div className="food-details-title-container">
                      <h2 className="food-details-title">{selectedFood.name}</h2>
                    </div>
                  </div>

                  <div className="food-details-content">
                    <div className="donate-message">
                      You are about to donate this food item. You can modify details in the next step.
                    </div>

                    <div className="food-details-grid">
                      <div className="food-details-item">
                        <div className="food-details-label">Type</div>
                        <div className="food-details-value">{selectedFood.cuisine || selectedFood.type}</div>
                      </div>

                      <div className="food-details-item">
                        <div className="food-details-label">From</div>
                        <div className="food-details-value">{selectedFood.restaurant || selectedFood.store}</div>
                      </div>

                      <div className="food-details-item">
                        <div className="food-details-label">Quantity</div>
                        <div className="food-details-value">{selectedFood.quantity}</div>
                      </div>

                      <div className="food-details-item">
                        <div className="food-details-label">Price</div>
                        <div className="food-details-value">
                          {selectedFood.price ? `৳${selectedFood.price}` : 'Free'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeDonateModal}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={proceedToDonation}>
                  <CheckCircle className="h-4 w-4" />
                  Proceed to Donation Form
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const [donationForm, setDonationForm] = useState({
    foodName: '',
    category: '',
    quantity: '',
    expiry: '',
    location: '',
    description: '',
    donorType: '',
    preparation: '',
    dietaryInfo: [],
    packaging: '',
    storageInstructions: '',
    image: null,
    cuisineType: '',
    servedTime: '',
    temperatureRequirements: '',
    ingredients: '',
    servingSize: '',
    eventName: '',
    corporateName: '',
    contactPerson: '',
    productType: '',
    brandName: '',
    bestBeforeDate: '',
    purchaseDate: '',
    purchaseSource: '',
    originalFoodItemId: null
  });

  const handleFormChange = (field, value) => {
    setDonationForm({
      ...donationForm,
      [field]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiLoading(true);
    setApiError(null);

    const formData = new FormData();

    const fieldMapping = {
      'expiry': 'expiryDate',
      'preparation': 'preparationDate'
    };

    Object.keys(donationForm).forEach(key => {
      if (donationForm[key] !== null && donationForm[key] !== undefined) {

        if (key === 'expiry' || key === 'preparation') {

          if (donationForm[key] && donationForm[key].includes('T')) {

            const dateValue = donationForm[key].split('T')[0];
            formData.append(fieldMapping[key] || key, dateValue);
          } else if (donationForm[key]) {

            formData.append(fieldMapping[key] || key, donationForm[key]);
          }
        }

        else if (key === 'dietaryInfo' && Array.isArray(donationForm[key])) {
          donationForm[key].forEach(item => {
            formData.append('dietaryInfo', item);
          });
        }

        else if (key !== 'image') {

          const backendKey = fieldMapping[key] || key;
          formData.append(backendKey, donationForm[key]);
        }
      }
    });

    formData.append('donorId', donorId);

    if (donationForm.image) {
      formData.append('image', donationForm.image);
    }

    console.log('Sending donation data:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
    }

    const apiUrl = `${API_BASE_URL || 'https://foodbridge-frontend.onrender.com'}/api/donor/donations`;
    console.log('Submitting donation to:', apiUrl);

    fetch(apiUrl, {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            console.error('Server response:', text);
            throw new Error('Failed to create donation: ' + (text || response.statusText));
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Donation created successfully:', data);

        alert('Donation created successfully!');

        setDonationStep(0);
        setSelectedCategory('');
        setSelectedFood(null);

        setTimeout(() => {
          console.log('Refreshing active donations after creation...');
          fetchActiveDonations();
        }, 1000);
      })
      .catch(error => {
        console.error('Error creating donation:', error);
        setApiError(error.message);

        alert(error.message || 'Failed to create donation. Please try again.');
      })
      .finally(() => {
        setApiLoading(false);
      });
  };
  //
  const startDonation = () => {
    setDonationStep(3);
    setShowDonationForm(true);
    setShouldShowFoodItems(false);

    setDonationForm({
      foodName: '',
      category: '',
      quantity: '',
      expiry: '',
      location: '',
      description: '',
      donorType: '',
      preparation: '',
      dietaryInfo: '',
      packaging: '',
      storageInstructions: '',
      image: null,
      cuisineType: '',
      servedTime: '',
      temperatureRequirements: '',
      ingredients: '',
      servingSize: '',
      eventName: '',
      corporateName: '',
      contactPerson: '',
      productType: '',
      brandName: '',
      bestBeforeDate: '',
      purchaseDate: '',
      purchasedFoodType: '',
      purchaseSource: '',
      purchasePackaging: ''
    });

    setSelectedCategory('');
    setSelectedFood(null);
  };

  const DashboardFoodItems = ({ items, onDonate, onViewDetails }) => (
    <div className="dashboard-food-items-container">
      <h2 className="section-title">
        <Package className="h-5 w-5 mr-2" />
        Available Food Items
      </h2>

      {foodItemsLoading && (
        <div className="loading-indicator">
          <span className="loading-spinner"></span>
          <span>Loading food items...</span>
        </div>
      )}

      {apiError && (
        <div className="error-message">
          <AlertCircle className="h-4 w-4" />
          <span>{apiError}</span>
        </div>
      )}

      <div className="dashboard-food-grid">
       // In the DashboardFoodItems component, enhance the food item card rendering
        {items.map(item => {
          const quantityMatch = item.quantity.match(/\d+/);
          const totalQuantity = quantityMatch ? parseInt(quantityMatch[0], 10) : 0;
          const remainingQuantity = item.remainingQuantity !== undefined ?
            item.remainingQuantity : totalQuantity;
          const remainingPercentage = totalQuantity > 0 ?
            (remainingQuantity / totalQuantity) * 100 : 0;
          const isAvailable = remainingQuantity > 0;

          return (
            <div
              key={item.id}
              className={`dashboard-food-card ${!isAvailable ? 'sold-out' : ''}`}
            >
              <div className="food-item-image">
                <img src={item.img} alt={item.name} />
                {!isAvailable && (
                  <div className="sold-out-overlay">
                    <span>Sold Out</span>
                  </div>
                )}
              </div>
              <div className="food-item-content">
                <h3 className="food-item-title">{item.name}</h3>
                <div className="food-item-details">
                  <span className="food-item-source">{item.storeName}</span>
                  <span className="food-item-type">{item.foodType}</span>
                </div>
                <div className="food-item-meta">
                  <div className="food-item-meta-row">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Expires: {item.expiryDate}</span>
                  </div>
                  <div className="food-item-meta-row">
                    <Package className="h-4 w-4 text-green-500" />
                    <span>Quantity: {remainingQuantity} / {totalQuantity}</span>
                  </div>
                  <div className="food-item-availability">
                    <div className="availability-bar-bg">
                      <div
                        className="availability-bar-fill"
                        style={{ width: `${remainingPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="food-item-actions">
                  <button
                    className="btn-view-details"
                    onClick={() => onViewDetails(item)}
                  >
                    <Eye className="h-4 w-4" />
                    <span>Details</span>
                  </button>
                  <button
                    className="btn-donate flex-1 flex items-center justify-center gap-2 bg-primary dark:bg-primary-dark text-white py-2 px-3 rounded-md hover:bg-primary-hover dark:hover:bg-primary transition-colors"
                    onClick={() => handleDonate(item)}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Donate</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && !foodItemsLoading && !apiError && (
          <div className="no-items-message">
            <Package className="h-8 w-8 text-gray-300" />
            <span>No food items available</span>
          </div>
        )}
      </div>
    </div>
  );

  const PurchaseHistorySection = ({ purchases, loading, error }) => {
    if (loading) {
      return (
        <div className="purchase-history-loading">
          <span className="loading-spinner"></span>
          <span>Loading purchase history...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="purchase-history-error">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      );
    }

    if (!purchases || purchases.length === 0) {
      return (
        <div className="purchase-history-empty">
          <Package className="h-12 w-12 text-gray-300" />
          <h3>No Purchase History</h3>
          <p>You haven't made any purchases for donation yet</p>
        </div>
      );
    }

    return (
      <div className="purchase-history-container">
        <h2 className="purchase-history-title">
          <Receipt className="h-5 w-5 mr-2" />
          Your Purchase History
        </h2>

        <div className="purchase-history-grid">
          {purchases.map(purchase => (
            <div key={purchase.id} className="purchase-card">
              <div className="purchase-header">
                <div className="purchase-id">
                  Order #{purchase.id}
                </div>
                <div className={`purchase-status ${purchase.saleStatus.toLowerCase()}`}>
                  {purchase.saleStatus}
                </div>
              </div>

              <div className="purchase-details">
                <div className="purchase-detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(purchase.saleDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="purchase-detail-row">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">{purchase.quantitySold}</span>
                </div>
                <div className="purchase-detail-row">
                  <span className="detail-label">Total:</span>
                  <span className="detail-value">৳{purchase.totalAmount}</span>
                </div>
                <div className="purchase-detail-row">
                  <span className="detail-label">Payment:</span>
                  <span className="detail-value">{purchase.paymentMethod}</span>
                </div>
              </div>

              <div className="purchase-actions">
                <button className="btn-view-donation">
                  <Eye className="h-4 w-4" />
                  <span>View Donation</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleDirectDonate = (food) => {
    setSelectedFood(food);
    setDonationStep(3);
    setShowDonationForm(true);
    setDonationForm({
      foodName: food.name,
      quantity: food.quantity.toString(),
      category: food.foodType?.includes('Restaurant') ? 'RESTAURANT_SURPLUS' : 'GROCERY_EXCESS',
      donorType: food.foodType?.includes('Restaurant') ? 'Restaurant' : 'Grocery Store',
      cuisineType: food.foodType || '',
      description: food.description || '',
      expiry: food.expiryDate || '',
      location: food.location || '',
      corporateName: food.storeName || '',
      originalFoodItemId: food.id
    });
  };

  const AllFoodItemsView = ({ items, onDonate, onViewDetails, onClose }) => (
    <div className="all-food-items-overlay">
      <div className="all-food-items-container">
        <div className="all-food-items-header">
          <h2 className="all-food-items-title">
            <Package className="h-5 w-5 mr-2" />
            Available Food Items
          </h2>
          <div className="all-food-items-actions">
            <button className="btn-close" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {foodItemsLoading && (
          <div className="loading-indicator">
            <span className="loading-spinner"></span>
            <span>Loading food items...</span>
          </div>
        )}

        {apiError && (
          <div className="error-message">
            <AlertCircle className="h-4 w-4" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="food-items-search">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search available items..."
            className="food-search-input"
          />
        </div>

        <div className="food-items-grid">
          {items.map(item => (
            <div key={item.id} className="food-item-card">
              <div className="food-item-image">
                <img src={item.img} alt={item.name} />
              </div>
              <div className="food-item-content">
                <h3 className="food-item-title">{item.name}</h3>
                <div className="food-item-details">
                  <span className="food-item-source">{item.storeName}</span>
                  <span className="food-item-type">{item.foodType}</span>
                </div>
                <div className="food-item-meta">
                  <div className="food-item-meta-row">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Expires: {item.expiryDate}</span>
                  </div>
                  <div className="food-item-meta-row">
                    <Package className="h-4 w-4 text-green-500" />
                    <span>Quantity: {item.quantity}</span>
                  </div>
                  <div className="food-item-meta-row">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span>{item.location}</span>
                  </div>
                </div>
                <div className="food-item-actions">
                  <button
                    className="btn-view-details"
                    onClick={() => onViewDetails(item)}
                  >
                    <Eye className="h-4 w-4" />
                    <span>Details</span>
                  </button>
                  <button
                    className="btn-donate"
                    onClick={() => onDonate(item)}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Donate</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && !foodItemsLoading && !apiError && (
          <div className="no-items-message">
            <Package className="h-8 w-8 text-gray-300" />
            <span>No food items available</span>
          </div>
        )}
      </div>
    </div>
  );

  const selectFood = async (food) => {
    setSelectedFood(food);
    setDonationStep(3);

    try {

      const response = await fetch(`${API_BASE_URL}/api/donor/food-items/${food.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch food item details');
      }

      const itemData = await response.json();

      setDonationForm({
        ...donationForm,
        foodName: itemData.name,
        quantity: itemData.quantity.toString(),
        category: selectedCategory === 'restaurant'
          ? 'RESTAURANT_SURPLUS'
          : 'GROCERY_EXCESS',
        donorType: selectedCategory === 'restaurant' ? 'Restaurant' : 'Grocery Store',
        cuisineType: itemData.foodType || '',
        productType: itemData.foodType || '',
        description: itemData.description || '',
        expiryDate: itemData.expiryDate || '',
        location: itemData.location || '',
        corporateName: itemData.storeName || '',
        dietaryInfo: itemData.dietaryInfo || [],
        originalFoodItemId: itemData.id,
        imageBase64: itemData.imageBase64
      });
    } catch (error) {
      console.error('Error fetching food item details:', error);
      setApiError(error.message);
    }
  };

  const goBack = () => {
    if (donationStep === 3) {
      if (selectedCategory === 'restaurant' || selectedCategory === 'grocery') {
        setDonationStep(2);
      } else {
        setDonationStep(0);
      }
    } else {
      setDonationStep(0);
    }
  };


  const cancelDonation = () => {
    setDonationStep(0);
    setSelectedCategory('');
    setSelectedFood(null);
    setShowDonationForm(false);
    setTimeout(() => {
      setShouldShowFoodItems(true);
      fetchAllFoodItems();
    }, 100);
  };

  const handleProfileManagement = () => {
    console.log('Profile Management clicked');
    setSelectedMainTab('profile');
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/food-requests/${requestId}/accept?donorId=${donorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to accept request: ${errorText || response.statusText}`);
      }
      alert('Request accepted successfully');
      fetchFoodRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert(`Failed to accept request: ${error.message}`);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/food-requests/${requestId}/decline?donorId=${donorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to decline request: ${errorText || response.statusText}`);
      }
      alert('Request declined successfully');
      fetchFoodRequests();
    } catch (error) {
      console.error('Error declining request:', error);
      alert(`Failed to decline request: ${error.message}`);
    }
  };

  const handleContactRequester = (request) => {
    alert(`Contact ${request.requesterName} regarding their request`);
  };

  const fetchFoodRequests = async () => {
    setFoodRequestsLoading(true);
    setFoodRequestsError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/donor/food-requests`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch food requests: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('Food requests data:', data);

      const formattedRequests = data.map(request => ({
        id: request.id,
        requesterName: request.receiverName || 'Anonymous',
        requestDate: new Date(request.requestedAt).toLocaleString(),
        status: request.requestStatus,
        distance: request.location || '',
        people: request.peopleCount,
        foodName: request.foodTypes.length > 0 ? request.foodTypes[0] : 'Food Request',
        donorName: 'John Doe',
        urgency: request.priority || 'Medium',
        notes: request.notes || 'No additional notes',
        location: request.location,
        deliveryPreference: request.deliveryPreference,
        recipients: request.recipients,
        specificDate: request.specificDate,
        specificTime: request.specificTime,
        userId: request.userId,
        imageUrl: request.imageData
          ? `data:${request.imageContentType || 'image/jpeg'};base64,${request.imageData}`
          : '/api/placeholder/400/200'
      }));

      formattedRequests.forEach(request => {
        if (request.status === 'PENDING') {
          const existingNotification = notifications.find(
            notif => notif.type === 'FOOD_REQUEST' && notif.foodRequestId === request.id
          );

          if (!existingNotification) {
            createFoodRequestNotification(
              donorId,
              request.id,
              request.requesterName,
              request.userId,
              request.foodName,
              request.people
            );
          }
        }
      });

      setFoodRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching food requests:', error);
      setFoodRequestsError(error.message);
    } finally {
      setFoodRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMainTab === 'requests' && donorId) {
      fetchFoodRequests();
    }
  }, [selectedMainTab, donorId]);

  useEffect(() => {
    if (!donorId) return;

    let isMounted = true;

    const pollForNewRequests = async () => {
      if (!isMounted) return;

      try {
        // Get current notifications to check what already exists
        const notificationsResponse = await fetch(`${API_BASE_URL}/api/donor/notifications?donorId=${donorId}`);
        if (!notificationsResponse.ok || !isMounted) return;

        const currentNotifications = await notificationsResponse.json();

        // Extract existing request IDs to prevent duplicates
        const existingPickupRequestIds = new Set(
          currentNotifications
            .filter(n => n.type === 'PICKUP_REQUEST' && n.requestId)
            .map(n => n.requestId)
        );

        const existingFoodRequestIds = new Set(
          currentNotifications
            .filter(n => n.type === 'FOOD_REQUEST' && n.foodRequestId)
            .map(n => n.foodRequestId)
        );

        // Check for new pickup requests
        if (activeDonations.length > 0) {
          for (const donation of activeDonations) {
            if (!isMounted) return;

            const response = await fetch(`${API_BASE_URL}/api/donor/donations/${donation.id}/requests?donorId=${donorId}`, {
              credentials: 'include'
            });

            if (response.ok && isMounted) {
              const requests = await response.json();
              const newPendingRequests = requests.filter(request =>
                request.status === 'PENDING' &&
                !existingPickupRequestIds.has(request.id) &&
                !processedRequestIds.has(request.id)
              );

              // Create notifications only for truly new requests
              for (const request of newPendingRequests) {
                if (!isMounted) return;

                try {
                  await createPickupRequestNotification(
                    donorId,
                    request.id,
                    donation.id,
                    request.receiverName || 'Anonymous',
                    request.receiverId || request.userId,
                    donation.foodName,
                    request.quantity || 'Not specified'
                  );

                  // Track this request as processed
                  setProcessedRequestIds(prev => new Set([...prev, request.id]));
                } catch (error) {
                  console.error('Error creating pickup request notification:', error);
                }
              }
            }
          }
        }

        // Check for new food requests
        const foodRequestsResponse = await fetch(`${API_BASE_URL}/api/donor/food-requests`);
        if (foodRequestsResponse.ok && isMounted) {
          const allFoodRequests = await foodRequestsResponse.json();
          const newFoodRequests = allFoodRequests.filter(request =>
            request.requestStatus === 'PENDING' &&
            !existingFoodRequestIds.has(request.id) &&
            !processedFoodRequestIds.has(request.id)
          );

          // Create notifications only for truly new food requests
          for (const request of newFoodRequests) {
            if (!isMounted) return;

            try {
              await createFoodRequestNotification(
                donorId,
                request.id,
                request.receiverName || 'Anonymous',
                request.userId,
                request.foodTypes.length > 0 ? request.foodTypes[0] : 'Food Request',
                request.peopleCount
              );

              // Track this request as processed
              setProcessedFoodRequestIds(prev => new Set([...prev, request.id]));
            } catch (error) {
              console.error('Error creating food request notification:', error);
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error polling for new requests:', error);
        }
      }
    };

    // Initial poll
    pollForNewRequests();

    // Set up interval - reduced frequency to prevent spam
    const pollInterval = setInterval(pollForNewRequests, 60000); // 1 minute instead of 30 seconds

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [donorId, activeDonations]);


  const RequestCard = ({ request }) => (
    <div className="request-card">
      <div className="request-card-header">
        <div className="request-meta-info">
          <Clock3 className="h-4 w-4 text-gray-500" />
          <span className="request-date">{request.requestDate}</span>
        </div>
        <div className={`request-status ${request.status.toLowerCase()}`}>
          {request.status}
        </div>
      </div>

      <div className="request-card-body">
        <div className="request-details-grid">
          <div className="detail-group">
            <span className="detail-label">Food:</span>
            <span className="detail-value">{request.foodName}</span>
          </div>
          <div className="detail-group">
            <span className="detail-label">Requested Time:</span>
            <span className="detail-value">{request.requestDate}</span>
          </div>
          <div className="detail-group">
            <span className="detail-label">Requested By:</span>
            <span className="detail-value">{request.requesterName}</span>
          </div>
          <div className="detail-group">
            <span className="detail-label">People:</span>
            <span className="detail-value">{request.people}</span>
          </div>
          <div className="detail-group">
            <span className="detail-label">Location:</span>
            <span className="detail-value">{request.location}</span>
          </div>
          <div className="detail-group">
            <span className="detail-label">Delivery:</span>
            <span className="detail-value">{request.deliveryPreference}</span>
          </div>
          {request.specificDate && (
            <div className="detail-group">
              <span className="detail-label">Date Needed:</span>
              <span className="detail-value">{request.specificDate}</span>
            </div>
          )}
          {request.specificTime && (
            <div className="detail-group">
              <span className="detail-label">Time Needed:</span>
              <span className="detail-value">{request.specificTime}</span>
            </div>
          )}
        </div>

        <div className="urgency-indicator">
          <span className={`urgency-badge ${request.urgency.toLowerCase()}`}>
            {request.urgency} Priority
          </span>
        </div>

        {request.imageUrl && (
          <div className="request-image-container">
            <img src={request.imageUrl} alt="Request" className="request-image" />
          </div>
        )}

        <div className="notes-container">
          <h4 className="notes-heading">Notes:</h4>
          <p className="notes-content">{request.notes}</p>
        </div>

        <div className="recipients-container">
          <h4 className="recipients-heading">Recipients:</h4>
          <div className="recipients-list">
            {request.recipients && request.recipients.map((recipient, index) => (
              <span key={index} className="recipient-tag">{recipient}</span>
            ))}
          </div>
        </div>

        <div className="request-actions-row">
          {request.status === 'PENDING' && (
            <>
              <button className="btn-accept-request" onClick={() => handleAcceptRequest(request.id)}>
                <CheckCircle className="h-4 w-4" />
                <span>Accept Request</span>
              </button>
              <button className="btn-decline-request" onClick={() => handleDeclineRequest(request.id)}>
                <X className="h-4 w-4" />
                <span>Decline</span>
              </button>
            </>
          )}
          {request.status === 'ACCEPTED' && (
            <button className="btn-contact-requester" onClick={() => handleContactRequester(request)}>
              <User className="h-4 w-4" />
              <span>Contact Requester</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
  const DonationRequestModal = ({ request, onClose, onAccept, onDecline }) => {
    if (!request) return null;
    return (
      <div className="modal-overlay">
        <div className="donation-request-modal">
          <div className="modal-header">
            <h2 className="modal-title">Donation Request</h2>
            <button className="btn-close" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="modal-body">
            <div className="request-time">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{request.requestDate}</span>
            </div>

            <div className="request-details-grid">
              <div className="request-detail-column">
                <div className="request-detail-item">
                  <h3 className="detail-header">FOOD:</h3>
                  <p className="detail-value">{request.foodName}</p>
                </div>

                <div className="request-detail-item">
                  <h3 className="detail-header">PEOPLE:</h3>
                  <p className="detail-value">{request.people}</p>
                </div>
              </div>

              <div className="request-detail-column">
                <div className="request-detail-item">
                  <h3 className="detail-header">FROM:</h3>
                  <p className="detail-value">{request.requesterName}</p>
                </div>

                <div className="request-detail-item">
                  <h3 className="detail-header">DISTANCE:</h3>
                  <p className="detail-value">{request.location}</p>
                </div>
              </div>
            </div>

            <div className="priority-badge">
              <span className={`priority-indicator ${request.urgency.toLowerCase()}`}>
                {request.urgency.toUpperCase()} PRIORITY
              </span>
            </div>

            <div className="request-notes">
              <h3 className="notes-header">Notes:</h3>
              <p className="notes-content">{request.notes}</p>
            </div>

            {request.imageUrl && (
              <div className="request-image">
                <img src={request.imageUrl} alt="Request" />
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-accept" onClick={() => onAccept(request.id)}>
                <CheckCircle className="h-5 w-5" />
                <span>Accept Request</span>
              </button>
              <button className="btn-decline" onClick={() => onDecline(request.id)}>
                <X className="h-5 w-5" />
                <span>Decline</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FoodSelectionCard = ({ food, onSelect, onViewDetails, onDonate }) => (
    <div className="food-selection-card">
      <div className="food-selection-image">
        <img src={food.img} alt={food.name} />
      </div>
      <div className="food-selection-content">
        <h3 className="food-selection-title">{food.name}</h3>
        <div className="food-selection-meta">
          <span className="food-selection-type">
            {food.cuisine || food.type}
          </span>
          <span className="food-selection-price">
            {food.price ? `৳${food.price}` : 'Free'}
          </span>
        </div>
        <div className="food-selection-actions">
          <button
            className="btn-view-details"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(food);
            }}
          >
            <Eye className="h-4 w-4" />
            <span>Details</span>
          </button>
          <button
            className="btn-donate"
            onClick={(e) => {
              e.stopPropagation();
              onDonate(food);
            }}
          >
            <Heart className="h-4 w-4" />
            <span>Donate</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDonationForm = () => (
    <div className="donation-flow-container donation-form-container bg-white dark:bg-gray-900">
      <div className="donation-flow-header bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button className="btn-back text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="donation-flow-title text-gray-900 dark:text-white">
          Self Food Donation Form
          {selectedFood && ` - ${selectedFood.name}`}
        </h1>
      </div>

      <form className="donation-form" onSubmit={handleSubmit}>
        <div className="form-sections bg-white dark:bg-gray-900">
          {/* Basic Food Information Section */}
          <div className="form-section border-b border-gray-200 dark:border-gray-700">
            <h3 className="section-title text-gray-900 dark:text-gray-100 flex items-center">
              <Package className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
              <span>Basic Food Information</span>
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label text-gray-700 dark:text-gray-300">Donation Category*</label>
                <select
                  className="form-select w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                  value={donationForm.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="HOMEMADE_FOOD">Homemade Food</option>
                  <option value="RESTAURANT_SURPLUS">Restaurant & Café Surplus</option>
                  <option value="CORPORATE_DONATION">Corporate & Office Donations</option>
                  <option value="GROCERY_EXCESS">Grocery Store Excess</option>
                  <option value="EVENT_LEFTOVER">Event & Wedding Leftovers</option>
                  <option value="PURCHASED_FOOD">Purchased Food for Donation</option>
                  <option value="BAKERY">Bakery Item</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label text-gray-700 dark:text-gray-300">Food Name*</label>
                <input
                  type="text"
                  className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                  value={donationForm.foodName}
                  onChange={(e) => handleFormChange('foodName', e.target.value)}
                  placeholder="Enter food name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label text-gray-700 dark:text-gray-300">Quantity*</label>
                <input
                  type="text"
                  className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                  value={donationForm.quantity}
                  onChange={(e) => handleFormChange('quantity', e.target.value)}
                  placeholder="e.g., 5 meals, 2kg"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label text-gray-700 dark:text-gray-300">Donor Type*</label>
                <input
                  type="text"
                  className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                  value={donationForm.donorType}
                  onChange={(e) => handleFormChange('donorType', e.target.value)}
                  placeholder="Restaurant, Individual, etc."
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  className="form-textarea w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                  value={donationForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Add any additional details about the food"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="form-section border-b border-gray-200 dark:border-gray-700">
            <h3 className="section-title text-gray-900 dark:text-gray-100 flex items-center">
              <Calendar className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
              <span>Dates & Storage</span>
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label text-gray-700 dark:text-gray-300">Expiry Date & Time*</label>
                <input
                  type="datetime-local"
                  className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                  value={donationForm.expiry}
                  onChange={(e) => handleFormChange('expiry', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label text-gray-700 dark:text-gray-300">Preparation Date*</label>
                <input
                  type="date"
                  className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                  value={donationForm.preparation}
                  onChange={(e) => handleFormChange('preparation', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label text-gray-700 dark:text-gray-300">Packaging</label>
                <input
                  type="text"
                  className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                  value={donationForm.packaging}
                  onChange={(e) => handleFormChange('packaging', e.target.value)}
                  placeholder="Plastic container, paper bag, etc."
                />
              </div>

              <div className="form-group">
                <label className="form-label text-gray-700 dark:text-gray-300">Storage Instructions</label>
                <input
                  type="text"
                  className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                  value={donationForm.storageInstructions}
                  onChange={(e) => handleFormChange('storageInstructions', e.target.value)}
                  placeholder="Refrigerate, keep at room temperature, etc."
                />
              </div>

              <div className="form-group">
                <label className="form-label text-gray-700 dark:text-gray-300">Dietary Information</label>
                <select
                  className="form-select w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                  multiple
                  value={Array.isArray(donationForm.dietaryInfo) ? donationForm.dietaryInfo : []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    handleFormChange('dietaryInfo', selected);
                  }}
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                  <option value="Dairy-Free">Dairy-Free</option>
                  <option value="Nut-Free">Nut-Free</option>
                  <option value="Halal">Halal</option>
                  <option value="Kosher">Kosher</option>
                </select>
                <small className="form-hint text-gray-500 dark:text-gray-400">Hold Ctrl/Cmd to select multiple options</small>
              </div>
            </div>
          </div>

          <div className="form-section border-b border-gray-200 dark:border-gray-700">
            <h3 className="section-title text-gray-900 dark:text-gray-100 flex items-center">
              <MapPin className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
              <span>Location & Image</span>
            </h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label text-gray-700 dark:text-gray-300">Location*</label>
                <input
                  type="text"
                  className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                  value={donationForm.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  placeholder="Enter pickup location"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label text-gray-700 dark:text-gray-300">Food Image</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="food-image"
                    className="file-input"
                    accept="image/*"
                    onChange={(e) => setDonationForm({
                      ...donationForm,
                      image: e.target.files[0]
                    })}
                  />
                  <label htmlFor="food-image" className="upload-area bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Upload className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    <span className="upload-text text-gray-700 dark:text-gray-300">Click to upload or drag and drop</span>
                    <span className="upload-hint text-gray-500 dark:text-gray-400">PNG, JPG up to 5MB</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {donationForm.category && (
            <div className="form-section">
              <h3 className="section-title text-gray-900 dark:text-gray-100 flex items-center">
                <Package className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2" />
                <span>{getCategoryLabel(donationForm.category)} Specific Details</span>
              </h3>
              <div className="form-grid">
                {/* Restaurant Surplus Fields */}
                {donationForm.category === 'RESTAURANT_SURPLUS' && (
                  <>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Cuisine Type</label>
                      <input
                        type="text"
                        className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.cuisineType}
                        onChange={(e) => handleFormChange('cuisineType', e.target.value)}
                        placeholder="Italian, Chinese, etc."
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Served Time</label>
                      <input
                        type="time"
                        className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.servedTime}
                        onChange={(e) => handleFormChange('servedTime', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Temperature Requirements</label>
                      <input
                        type="text"
                        className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.temperatureRequirements}
                        onChange={(e) => handleFormChange('temperatureRequirements', e.target.value)}
                        placeholder="Hot, Cold, Room Temperature"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Restaurant Name</label>
                      <input
                        type="text"
                        className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.corporateName}
                        onChange={(e) => handleFormChange('corporateName', e.target.value)}
                        placeholder="Restaurant name"
                      />
                    </div>
                  </>
                )}

                {donationForm.category === 'HOMEMADE_FOOD' && (
                  <>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Ingredients</label>
                      <textarea
                        className="form-textarea w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.ingredients}
                        onChange={(e) => handleFormChange('ingredients', e.target.value)}
                        placeholder="List main ingredients"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Serving Size</label>
                      <input
                        type="text"
                        className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.servingSize}
                        onChange={(e) => handleFormChange('servingSize', e.target.value)}
                        placeholder="e.g., 200g per serving"
                      />
                    </div>
                  </>
                )}

                {(donationForm.category === 'CORPORATE_DONATION' || donationForm.category === 'EVENT_LEFTOVER') && (
                  <>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Event Name</label>
                      <input
                        type="text"
                        className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.eventName}
                        onChange={(e) => handleFormChange('eventName', e.target.value)}
                        placeholder="Conference, Wedding, etc."
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Corporate/Organization Name</label>
                      <input
                        type="text"
                        className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.corporateName}
                        onChange={(e) => handleFormChange('corporateName', e.target.value)}
                        placeholder="Company or organization name"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Contact Person</label>
                      <input
                        type="text"
                        className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.contactPerson}
                        onChange={(e) => handleFormChange('contactPerson', e.target.value)}
                        placeholder="Name of contact person"
                      />
                    </div>
                  </>
                )}

                {donationForm.category === 'GROCERY_EXCESS' && (
                  <>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Product Type</label>
                      <input
                        type="text"
                        className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.productType}
                        onChange={(e) => handleFormChange('productType', e.target.value)}
                        placeholder="Bread, Fruits, Vegetables, etc."
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Brand Name</label>
                      <input
                        type="text"
                        className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.brandName}
                        onChange={(e) => handleFormChange('brandName', e.target.value)}
                        placeholder="Product brand if applicable"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Best Before Date</label>
                      <input
                        type="date"
                        className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.bestBeforeDate}
                        onChange={(e) => handleFormChange('bestBeforeDate', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Store Name</label>
                      <input
                        type="text"
                        className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.corporateName}
                        onChange={(e) => handleFormChange('corporateName', e.target.value)}
                        placeholder="Grocery store name"
                      />
                    </div>
                  </>
                )}

                {donationForm.category === 'PURCHASED_FOOD' && (
                  <>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Purchase Source</label>
                      <input
                        type="text"
                        className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.purchaseSource}
                        onChange={(e) => handleFormChange('purchaseSource', e.target.value)}
                        placeholder="Where the food was purchased"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label text-gray-700 dark:text-gray-300">Purchase Date</label>
                      <input
                        type="date"
                        className="form-input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        value={donationForm.purchaseDate}
                        onChange={(e) => handleFormChange('purchaseDate', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="form-actions bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="btn-cancel bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            onClick={cancelDonation}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit bg-primary dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Create Donation
          </button>
        </div>
      </form>
    </div>
  );

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      'HOMEMADE_FOOD': 'Homemade Food',
      'RESTAURANT_SURPLUS': 'Restaurant & Café',
      'CORPORATE_DONATION': 'Corporate',
      'GROCERY_EXCESS': 'Grocery',
      'EVENT_LEFTOVER': 'Event',
      'PURCHASED_FOOD': 'Purchased Food'
    };
    return categoryLabels[category] || category;
  };

  const PurchaseDonateModal = ({ food, onClose, onSubmit }) => {
    const [quantity, setQuantity] = useState(1);
    const [maxQuantity, setMaxQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [useStoreAddress, setUseStoreAddress] = useState(true);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    const unitPrice = parseFloat(food.price) || 0;
    const totalPrice = (unitPrice * quantity).toFixed(2);

    useEffect(() => {
      if (!food || !food.id) return;

      setLoading(true);

      fetch(`${API_BASE_URL}/api/merchant/food-items/${food.id}/with-remaining`)
        .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch'))
        .then(data => {
          console.log('Food item remaining quantity data:', data);
          const remaining = data.remainingQuantity || data.foodItem?.remainingQuantity || 1;
          setMaxQuantity(remaining);

          setQuantity(Math.max(1, Math.min(remaining, 1)));
          setDeliveryAddress(food.location || '');

          const authUser = JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || '{}');

          if (authUser.firstName) {
            setCustomerName(`${authUser.firstName} ${authUser.lastName || ''}`.trim());
          }
        })
        .catch(err => {
          console.error('Error loading food data:', err);
          setError('Failed to load food details');
        })
        .finally(() => {
          setLoading(false);
        });
    }, [food]);


    const handleSubmit = (e) => {
      e.preventDefault();
      e.stopPropagation();

      console.log('🎯 Form submitted');

      setError(null);

      if (quantity < 1 || quantity > maxQuantity) {
        setError(`Please select between 1 and ${maxQuantity} units`);
        return;
      }

      if (!customerName.trim()) {
        setError('Please enter customer name');
        return;
      }

      if (!useStoreAddress && !deliveryAddress.trim()) {
        setError('Please enter a delivery address');
        return;
      }

      const formData = new FormData();
      formData.append('foodItemId', food.id.toString());
      formData.append('donorId', donorId.toString());
      formData.append('quantity', quantity.toString());
      formData.append('paymentMethod', 'CASH');
      formData.append('deliveryAddress', useStoreAddress ? food.location : deliveryAddress);
      formData.append('notes', `Purchase for donation by ${customerName}. Phone: ${customerPhone || 'Not provided'}`);
      formData.append('customerName', customerName);
      formData.append('customerPhone', customerPhone || '');

      console.log('📋 FormData created, calling onSubmit');

      onSubmit(formData);
    };

    if (loading) {
      return (
        <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-96 p-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
              <span className="text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-11/12 max-w-md mx-4">
          <div className="bg-emerald-500 dark:bg-emerald-600 p-4 rounded-t-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold text-lg">Purchase for Donation</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Success Message */}
            {purchaseSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg mb-4 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold">{purchaseSuccess}</div>
                <div className="text-sm mt-1">Your donation has been added successfully!</div>
              </div>
            )}

            {(error || purchaseError) && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
                {error || purchaseError}
              </div>
            )}

            {!purchaseSuccess && (
              <>
                <div className="mb-6">
                  <div className="flex space-x-4">
                    <img
                      src={food.img || '/api/placeholder/80/80'}
                      alt={food.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{food.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{food.storeName}</p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium">৳{unitPrice} per unit</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Available: {maxQuantity} units</p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Quantity
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          const newQuantity = Math.max(1, quantity - 1);
                          console.log('Decreasing quantity from', quantity, 'to', newQuantity);
                          setQuantity(newQuantity);
                        }}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={quantity <= 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const newQuantity = inputValue === '' ? 1 : Math.min(maxQuantity, Math.max(1, parseInt(inputValue) || 1));
                          console.log('Input quantity changed from', quantity, 'to', newQuantity);
                          setQuantity(newQuantity);
                        }}
                        onBlur={(e) => {
                          // Ensure valid quantity on blur
                          const inputValue = e.target.value;
                          if (inputValue === '' || parseInt(inputValue) < 1) {
                            setQuantity(1);
                          } else if (parseInt(inputValue) > maxQuantity) {
                            setQuantity(maxQuantity);
                          }
                        }}
                        className="w-20 text-center border border-gray-300 dark:border-gray-600 rounded-md py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        min="1"
                        max={maxQuantity}
                        placeholder="1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newQuantity = Math.min(maxQuantity, quantity + 1);
                          console.log('Increasing quantity from', quantity, 'to', newQuantity);
                          setQuantity(newQuantity);
                        }}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={quantity >= maxQuantity}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        of {maxQuantity} available
                      </span>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                        Total: ৳{totalPrice}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Delivery Address
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="address"
                          checked={useStoreAddress}
                          onChange={() => setUseStoreAddress(true)}
                          className="text-emerald-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Pick up from store: {food.location}
                        </span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="address"
                          checked={!useStoreAddress}
                          onChange={() => setUseStoreAddress(false)}
                          className="text-emerald-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Use different address
                        </span>
                      </label>
                    </div>
                    {!useStoreAddress && (
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter delivery address"
                        className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        required
                      />
                    )}
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                      disabled={purchaseLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-emerald-500 dark:bg-emerald-600 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-700 flex items-center justify-center space-x-2 disabled:opacity-50"
                      disabled={purchaseLoading}
                    >
                      {purchaseLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4" />
                          <span>Purchase ৳{totalPrice}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dashboard-container">
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Logout</h3>
            </div>
            <div className="modal-body">
              <h4>Are you sure you want to log out from your account?</h4>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="btn-primary" onClick={confirmLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {logoutSuccess && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="modal-body">
              <CheckCircle className="h-12 w-12" />
              <h3 className="success-message">Successfully logged out!</h3>
              <p>Redirecting to home page...</p>
            </div>
          </div>
        </div>
      )}
      {purchaseSuccess && (
        <div className="success-notification fixed top-4 right-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg border border-green-200 dark:border-green-800 shadow-md flex items-center gap-2 z-50 animate-slideIn">
          <CheckCircle className="h-5 w-5" />
          <span>{purchaseSuccess}</span>
        </div>
      )}
      <div className="dashboard-content dark:bg-gray-800 dark:border-gray-700">

        <div className="dashboard-header-section bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-gray-950/40">
          <div className="dashboard-header bg-white dark:bg-gray-900">
            <div className="header-content">
              <div className="logo-title-wrapper">
                <div>
                  <h1 className="dashboard-title text-primary-dark dark:text-emerald-400 font-bold">Donor Dashboard</h1>
                  <p className="dashboard-subtitle text-gray-600 dark:text-gray-300">
                    Manage your food donations and connect with those in need
                  </p>
                </div>
              </div>
            </div>
            <div className="header-actions flex items-center">
              <div className="header-navigation-buttons flex items-center space-x-2 mr-4">
                <button
                  className="header-nav-btn hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-300 transition-colors duration-200"
                  onClick={() => {
                    setSelectedMainTab('activeDonations');
                  }}
                >
                  <Package className="h-4 w-4" />
                  <span>Active Donations</span>
                </button>
                <button
                  className="header-nav-btn hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-300 transition-colors duration-200"
                  onClick={() => setSelectedMainTab('requests')}
                >
                  <Users className="h-4 w-4" />
                  <span>Requests</span>
                </button>
                <button
                  className="header-nav-btn hover:bg-gray-100 dark:hover:bg-gray-800 text-purple-600 dark:text-purple-300 transition-colors duration-200 relative"
                  onClick={() => setSelectedMainTab('messages')}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                  {messageStats.unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {messageStats.unreadMessages}
                    </span>
                  )}
                </button>
                <button
                  className="header-nav-btn hover:bg-gray-100 dark:hover:bg-gray-800 text-yellow-600 dark:text-yellow-300 transition-colors duration-200 relative"
                  onClick={() => setShowNotificationsModal(true)}
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                <button
                  className="header-nav-btn hover:bg-gray-100 dark:hover:bg-gray-800 text-orange-600 dark:text-orange-300 transition-colors duration-200"
                  onClick={() => setSelectedMainTab('profile')}
                >
                  <UserCog className="h-4 w-4" />
                  <span>Profile</span>
                </button>
              </div>
              <button
                className="btn-refresh-dashboard bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-600 dark:to-blue-800 dark:hover:from-blue-500 dark:hover:to-blue-700 text-white shadow-md dark:shadow-blue-900/30 transition-all duration-300 transform hover:-translate-y-0.5"
                onClick={handleLogout}
                title="Log out"
              >
                <span>Log out</span>
              </button>
            </div>
          </div>
          <div className="stats-container">
            <div className="stats-card bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-l-4 border-blue-500 dark:border-blue-400 shadow-md dark:shadow-gray-950/30 rounded-r-lg transition-transform duration-300 hover:-translate-y-1">
              <div className="stats-icon stats-blue bg-blue-500 dark:bg-blue-400 text-white dark:text-gray-900 shadow-lg dark:shadow-blue-500/30">
                <Package className="h-5 w-5" />
              </div>
              <div className="stats-content">
                <div className="stats-value text-gray-900 dark:text-white font-bold text-2xl">
                  {activeDonations.length}
                </div>
                <div className="stats-label text-gray-600 dark:text-gray-300 text-xs tracking-wider">
                  ACTIVE DONATIONS
                </div>
              </div>
            </div>

            <div className="stats-card bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-l-4 border-green-500 dark:border-green-400 shadow-md dark:shadow-gray-950/30 rounded-r-lg transition-transform duration-300 hover:-translate-y-1">
              <div className="stats-icon stats-green bg-green-500 dark:bg-green-400 text-white dark:text-gray-900 shadow-lg dark:shadow-green-500/30">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="stats-content">
                <div className="stats-value text-gray-900 dark:text-white font-bold text-2xl">
                  {completedDonations.length}
                </div>
                <div className="stats-label text-gray-600 dark:text-gray-300 text-xs tracking-wider">
                  COMPLETED
                </div>
              </div>
            </div>

            <div className="stats-card bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-l-4 border-orange-500 dark:border-orange-400 shadow-md dark:shadow-gray-950/30 rounded-r-lg transition-transform duration-300 hover:-translate-y-1">
              <div className="stats-icon stats-orange bg-orange-500 dark:bg-orange-400 text-white dark:text-gray-900 shadow-lg dark:shadow-orange-500/30">
                <Clock3 className="h-5 w-5" />
              </div>
              <div className="stats-content">
                <div className="stats-value text-gray-900 dark:text-white font-bold text-2xl">
                  {pendingDonations.length}
                </div>
                <div className="stats-label text-gray-600 dark:text-gray-300 text-xs tracking-wider">
                  Accepted request but donation not yet delivered
                </div>
              </div>
            </div>

            <div className="stats-card bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-l-4 border-purple-500 dark:border-purple-400 shadow-md dark:shadow-gray-950/30 rounded-r-lg transition-transform duration-300 hover:-translate-y-1">
              <div className="stats-icon stats-purple bg-purple-500 dark:bg-purple-400 text-white dark:text-gray-900 shadow-lg dark:shadow-purple-500/30">
                <Users className="h-5 w-5" />
              </div>
              <div className="stats-content">
                <div className="stats-value text-gray-900 dark:text-white font-bold text-2xl">
                  {foodRequests.length}
                </div>
                <div className="stats-label text-gray-600 dark:text-gray-300 text-xs tracking-wider">
                  FOOD NEED REQUESTS
                </div>
              </div>
            </div>
          </div>

        </div>

        {showDonationForm && donationStep > 0 && (
          <div className="donation-flow-overlay">
            {donationStep === 2 && renderFoodSelection()}
            {donationStep === 3 && renderDonationForm()}
          </div>
        )}

        <div className="main-tabs-container dark:bg-gray-800 dark:border-gray-700">
          <button
            className="btn-primary"
            onClick={startDonation}
          >
            <Plus className="h-6 w-6" />
            <span>Donate Own Food</span>
          </button>
        </div>
        {!showDonationForm && shouldShowFoodItems && (
          <div className="dashboard-food-items-container bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md dark:shadow-gray-900/30">
            <h2 className="section-title flex items-center text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">
              <Package className="h-5 w-5 mr-2 text-primary dark:text-primary-light" />
              Available Food Items
            </h2>

            {foodItemsLoading && (
              <div className="loading-indicator flex items-center justify-center p-8 text-gray-600 dark:text-gray-400">
                <span className="loading-spinner border-t-2 border-primary dark:border-primary-light w-6 h-6 rounded-full animate-spin mr-3"></span>
                <span>Loading available items...</span>
              </div>
            )}

            {apiError && (
              <div className="error-message flex items-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-4">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <div className="dashboard-food-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allFoodItems.map(item => (
                <div
                  key={item.id}
                  className="dashboard-food-card bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 shadow-md dark:shadow-gray-900/30"
                >
                  <div className="food-item-image h-48 relative overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>

                  <div className="food-item-content p-5">
                    <h3 className="food-item-title text-lg font-bold text-gray-800 dark:text-white mb-2">{item.name}</h3>

                    <div className="food-item-details flex justify-between mb-3">
                      <span className="food-item-source text-gray-600 dark:text-gray-400 text-sm">{"Price: "}{item.price}{"Taka"}</span>
                      <span className="food-item-type bg-primary-transparent dark:bg-primary-dark/30 text-primary dark:text-primary-light px-2 py-1 rounded-full text-xs font-medium">
                        {item.foodType}
                      </span>
                    </div>

                    <div className="food-item-meta border-t border-gray-100 dark:border-gray-700 pt-3 mb-4">
                      <div className="food-item-meta-row flex items-center mb-2 text-sm text-gray-700 dark:text-gray-300">
                        <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0" />
                        <span>Expires: {item.expiryDate}</span>
                      </div>

                      <div className="food-item-meta-row flex items-center mb-2 text-sm text-gray-700 dark:text-gray-300">
                        <Package className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                        <span>Quantity: {item.quantity}</span>
                      </div>

                      <div className="food-item-meta-row flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <MapPin className="h-4 w-4 text-red-500 dark:text-red-400 mr-2 flex-shrink-0" />
                        <span>{item.location}</span>
                      </div>
                    </div>

                    <div className="food-item-actions flex gap-3">
                      <button
                        className="btn-view-details flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleViewDetails(item)}
                      >
                        <Eye className="h-4 w-4" />
                        <span>Details</span>
                      </button>
                      <button
                        className="btn-donate flex-1 flex items-center justify-center gap-2 bg-primary dark:bg-primary-dark text-white py-2 px-3 rounded-md hover:bg-primary-hover dark:hover:bg-primary transition-colors"
                        onClick={() => handleDonate(item)}
                      >
                        <Heart className="h-4 w-4" />
                        <span>Donate</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {allFoodItems.length === 0 && !foodItemsLoading && !apiError && (
                <div className="no-items-message col-span-full flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <span className="text-gray-500 dark:text-gray-400">No food items available</span>
                </div>
              )}
            </div>
          </div>
        )}

        {showDetailsModal && selectedFoodDetails && (
          <div className="modal-overlay fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="details-modal w-11/12 max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-xl dark:shadow-black/30 overflow-hidden flex flex-col max-h-[85vh] animate-modal-appear">
              <div className="modal-header bg-gradient-to-r from-primary to-primary-light dark:from-primary-dark dark:to-primary p-4 flex justify-between items-center">
                <h3 className="modal-title text-white font-semibold text-lg">Food Item Details</h3>
                <button
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                  onClick={closeDetailsModal}
                  aria-label="Close details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="modal-body overflow-y-auto p-0">
                <div className="food-details-container">
                  <div className="food-details-header-compact flex flex-col md:flex-row bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 gap-4">
                    <div className="food-details-image-container w-full md:w-48 h-40 overflow-hidden rounded-lg shadow-md dark:shadow-black/20 flex-shrink-0">
                      <img
                        className="food-details-image-compact w-full h-full object-cover"
                        src={selectedFoodDetails.imageBase64
                          ? `data:${selectedFoodDetails.imageContentType || 'image/jpeg'};base64,${selectedFoodDetails.imageBase64}`
                          : '/api/placeholder/300/200'}
                        alt={selectedFoodDetails.name}
                      />
                    </div>
                    <div className="food-details-title-section flex-1">
                      <h2 className="food-details-title-compact text-gray-800 dark:text-white text-xl md:text-2xl font-bold mb-2">
                        {selectedFoodDetails.name}
                      </h2>
                      <div className="food-details-key-info flex flex-wrap gap-2 mt-2">
                        <span className="food-info-badge type bg-primary/10 dark:bg-primary-dark/30 text-primary dark:text-primary-light px-3 py-1 rounded-full text-sm font-medium">
                          {selectedFoodDetails.foodType || 'Not specified'}
                        </span>
                        <span className="food-info-badge price bg-primary dark:bg-primary-dark text-white px-3 py-1 rounded-full text-sm font-bold">
                          {selectedFoodDetails.price ? `৳${selectedFoodDetails.price}` : 'Free'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="food-details-grid-compact grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white dark:bg-gray-800">
                    <div className="food-details-item-compact bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border-l-2 border-blue-500 dark:border-blue-400">
                      <div className="food-details-label text-gray-500 dark:text-gray-400 text-xs uppercase font-medium mb-1">
                        Available Quantity
                      </div>
                      <div className="food-details-value text-gray-800 dark:text-gray-100 font-semibold">
                        {selectedFoodDetails.quantity}
                      </div>
                    </div>

                    <div className="food-details-item-compact bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border-l-2 border-amber-500 dark:border-amber-400">
                      <div className="food-details-label text-gray-500 dark:text-gray-400 text-xs uppercase font-medium mb-1">
                        Expiry Date
                      </div>
                      <div className="food-details-value text-gray-800 dark:text-gray-100 font-semibold">
                        {selectedFoodDetails.expiryDate}
                      </div>
                    </div>

                    <div className="food-details-item-compact bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border-l-2 border-green-500 dark:border-green-400">
                      <div className="food-details-label text-gray-500 dark:text-gray-400 text-xs uppercase font-medium mb-1">
                        Store/Restaurant
                      </div>
                      <div className="food-details-value text-gray-800 dark:text-gray-100 font-semibold">
                        {selectedFoodDetails.storeName || 'Not specified'}
                      </div>
                    </div>

                    <div className="food-details-item-compact bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border-l-2 border-red-500 dark:border-red-400">
                      <div className="food-details-label text-gray-500 dark:text-gray-400 text-xs uppercase font-medium mb-1">
                        Location
                      </div>
                      <div className="food-details-value text-gray-800 dark:text-gray-100 font-semibold">
                        {selectedFoodDetails.location || 'Not specified'}
                      </div>
                    </div>

                    <div className="food-details-item-compact bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border-l-2 border-purple-500 dark:border-purple-400">
                      <div className="food-details-label text-gray-500 dark:text-gray-400 text-xs uppercase font-medium mb-1">
                        Delivery Time
                      </div>
                      <div className="food-details-value text-gray-800 dark:text-gray-100 font-semibold">
                        {selectedFoodDetails.deliveryTime || 'Not specified'}
                      </div>
                    </div>

                    <div className="food-details-item-compact bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border-l-2 border-teal-500 dark:border-teal-400">
                      <div className="food-details-label text-gray-500 dark:text-gray-400 text-xs uppercase font-medium mb-1">
                        Dietary Information
                      </div>
                      <div className="food-details-value text-gray-800 dark:text-gray-100 font-semibold">
                        {selectedFoodDetails.dietaryInfo && selectedFoodDetails.dietaryInfo.length > 0
                          ? selectedFoodDetails.dietaryInfo.join(', ')
                          : 'Not specified'}
                      </div>
                    </div>
                  </div>

                  {selectedFoodDetails.description && (
                    <div className="food-details-description-compact mx-4 mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border-l-2 border-primary dark:border-primary-light">
                      <span className="food-details-description-label block text-primary dark:text-primary-light text-sm font-semibold mb-2">
                        Description
                      </span>
                      <p className="food-details-description-text text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {selectedFoodDetails.description || 'No description available'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
                <button
                  className="btn-secondary bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium"
                  onClick={closeDetailsModal}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}
        {selectedMainTab === 'activeDonations' && (
          <div className="popup-overlay fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="popup-container active-donations-popup bg-white dark:bg-gray-900 rounded-xl shadow-xl dark:shadow-black/30 w-11/12 max-w-6xl max-h-[85vh] flex flex-col overflow-hidden">
              {/* Popup Header */}
              <div className="popup-header bg-gradient-to-r from-primary to-primary-light dark:from-primary-dark dark:to-primary flex justify-between items-center p-4 border-b border-primary-light/20 dark:border-primary-dark/30">
                <div className="popup-title-container flex items-center">
                  <Package className="h-5 w-5 mr-2 text-white" />
                  <h2 className="popup-title text-white text-lg font-semibold">Donation Management</h2>
                </div>

                <div className="popup-actions flex items-center">
                  <div className="popup-tabs flex mr-3 space-x-2">
                    <button
                      className={`popup-tab-btn px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedSubTab === 'active'
                        ? 'bg-white text-primary dark:bg-primary-dark/80 dark:text-white'
                        : 'bg-white/20 text-white hover:bg-white/30 dark:bg-gray-700/30 dark:hover:bg-gray-700/50'
                        }`}
                      onClick={() => setSelectedSubTab('active')}
                    >
                      Active
                    </button>
                    <button
                      className={`popup-tab-btn px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedSubTab === 'pending'
                        ? 'bg-white text-primary dark:bg-primary-dark/80 dark:text-white'
                        : 'bg-white/20 text-white hover:bg-white/30 dark:bg-gray-700/30 dark:hover:bg-gray-700/50'
                        }`}
                      onClick={() => setSelectedSubTab('pending')}
                    >
                      Accepted
                    </button>
                    <button
                      className={`popup-tab-btn px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedSubTab === 'rejected'
                        ? 'bg-white text-primary dark:bg-primary-dark/80 dark:text-white'
                        : 'bg-white/20 text-white hover:bg-white/30 dark:bg-gray-700/30 dark:hover:bg-gray-700/50'
                        }`}
                      onClick={() => setSelectedSubTab('rejected')}
                    >
                      Rejected
                    </button>
                    <button
                      className={`popup-tab-btn px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedSubTab === 'completed'
                        ? 'bg-white text-primary dark:bg-primary-dark/80 dark:text-white'
                        : 'bg-white/20 text-white hover:bg-white/30 dark:bg-gray-700/30 dark:hover:bg-gray-700/50'
                        }`}
                      onClick={() => setSelectedSubTab('completed')}
                    >
                      Completed
                    </button>
                  </div>
                  <div className="popup-header-buttons">
                    <button
                      className="popup-close-btn w-8 h-8 rounded-full bg-white/20 dark:bg-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-700/50 flex items-center justify-center text-white transition-transform hover:rotate-90"
                      onClick={() => setSelectedMainTab('donations')}
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="popup-content flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
                {apiLoading && (
                  <div className="loading-indicator flex flex-col items-center justify-center p-12 text-gray-600 dark:text-gray-400">
                    <span className="loading-spinner w-10 h-10 border-4 border-primary/20 dark:border-primary-dark/20 border-t-primary dark:border-t-primary-light rounded-full animate-spin mb-4"></span>
                    <span>Loading donations...</span>
                  </div>
                )}

                {!apiLoading && !donorId && (
                  <div className="error-message flex items-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 m-4 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>Error: User not properly authenticated. Please log in again.</span>
                  </div>
                )}

                {!apiLoading && donorId && (
                  <div className="donations-section flex h-full">
                    {/* Sidebar */}
                    <div className="donations-sidebar w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto flex-shrink-0 h-full">
                      <div className="sidebar-header p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-gray-800 dark:text-gray-200 font-medium text-sm">Your Donations</h3>
                      </div>
                      <div className="sidebar-content p-2">
                        {(() => {
                          let items = [];
                          switch (selectedSubTab) {
                            case 'active':
                              items = activeDonations;
                              break;
                            case 'pending':
                              items = pendingDonations;
                              break;
                            case 'rejected':
                              items = rejectedDonations;
                              break;
                            case 'completed':
                              items = completedDonations;
                              break;
                            default:
                              items = [];
                          }

                          return items.map(item => (
                            <div key={item.id} className="sidebar-item flex items-center p-2 mb-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                              <img
                                src={item.imageUrl}
                                alt={item.foodName}
                                className="sidebar-item-image w-10 h-10 rounded-md object-cover mr-3"
                              />
                              <div className="sidebar-item-info overflow-hidden">
                                <span className="sidebar-item-name text-gray-800 dark:text-gray-200 text-sm font-medium truncate block">{item.foodName}</span>
                              </div>
                            </div>
                          ));
                        })()}

                        {(() => {
                          let items = [];
                          switch (selectedSubTab) {
                            case 'active':
                              items = activeDonations;
                              break;
                            case 'pending':
                              items = pendingDonations;
                              break;
                            case 'rejected':
                              items = rejectedDonations;
                              break;
                            case 'completed':
                              items = completedDonations;
                              break;
                            default:
                              items = [];
                          }

                          if (items.length === 0) {
                            return (
                              <div className="empty-sidebar flex flex-col items-center justify-center py-8 px-4 text-center text-gray-500 dark:text-gray-400">
                                <Package className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="text-sm">No {selectedSubTab} donations</p>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="donations-main-content flex-1 p-4 overflow-y-auto bg-gray-100 dark:bg-gray-900">
                      {selectedSubTab === 'active' && (
                        <div className="donations-compact-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {activeDonations.length > 0 ? (
                            activeDonations.map(donation => (
                              <div key={donation.id} className="donation-compact-card bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:shadow-gray-900/30 transition-all hover:-translate-y-1">
                                <div className="donation-card-image-container h-48 relative overflow-hidden">
                                  <img
                                    src={donation.imageUrl}
                                    alt={donation.foodName}
                                    className="donation-card-image w-full h-full object-cover"
                                  />
                                  <div className={`status-badge absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-semibold uppercase ${donation.status.toLowerCase() === 'active'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                                    : ''
                                    }`}>
                                    {donation.status}
                                  </div>
                                </div>

                                <div className="donation-card-content p-4">
                                  <h3 className="donation-card-title text-gray-900 dark:text-white font-semibold mb-2 line-clamp-1">{donation.foodName}</h3>
                                  <div className="donation-meta flex justify-between items-center mb-3">
                                    <span className="donation-category bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300">
                                      {donation.category}
                                    </span>
                                    <div className={`donor-type-icon flex items-center ${donation.donorType === 'Restaurant'
                                      ? 'text-orange-500 dark:text-orange-400'
                                      : donation.donorType === 'Individual'
                                        ? 'text-blue-500 dark:text-blue-400'
                                        : 'text-purple-500 dark:text-purple-400'
                                      }`}>
                                      {donation.donorType === 'Restaurant' ? <ChefHat className="h-3 w-3" /> :
                                        donation.donorType === 'Individual' ? <User className="h-3 w-3" /> :
                                          <Building2 className="h-3 w-3" />}
                                      <span className="donor-type-text text-xs ml-1">{donation.donorType}</span>
                                    </div>
                                  </div>

                                  <div className="donation-compact-info border-t border-gray-100 dark:border-gray-700 pt-3 mb-3">
                                    <div className="info-row flex items-center mb-1.5 text-sm text-gray-600 dark:text-gray-300">
                                      <Clock className="info-icon h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                                      <span className="info-text">
                                        {new Date(donation.expiry).toLocaleString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: 'numeric',
                                          minute: '2-digit',
                                          hour12: true
                                        })}
                                      </span>
                                    </div>
                                    <div className="info-row flex items-center mb-1.5 text-sm text-gray-600 dark:text-gray-300">
                                      <MapPin className="info-icon h-4 w-4 text-red-500 dark:text-red-400 mr-2" />
                                      <span className="info-text line-clamp-1">{donation.location}</span>
                                    </div>
                                    <div className="info-row flex items-center text-sm text-gray-600 dark:text-gray-300">
                                      <Package className="info-icon h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                                      <span className="info-text">Quantity: {donation.quantity}</span>
                                    </div>
                                  </div>

                                  <div className="donation-card-footer flex justify-between">
                                    <button
                                      className="btn-card-action check-requests bg-primary/10 dark:bg-primary-dark/30 hover:bg-primary/20 dark:hover:bg-primary-dark/40 text-primary dark:text-primary-light rounded-lg py-1.5 px-3 text-sm font-medium transition-colors"
                                      onClick={() => handleCheckRequests(donation)}
                                    >
                                      <Users className="h-3 w-3 mr-1" />
                                      Requests
                                    </button>
                                    <div className="card-action-buttons flex space-x-2">
                                      <button
                                        className="btn-card-action edit bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
                                        onClick={() => handleEditDonation(donation)}
                                        title="Edit"
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        className="btn-card-action delete bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
                                        onClick={() => handleDeleteDonation(donation.id)}
                                        title="Delete"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="empty-state col-span-full flex flex-col items-center justify-center py-12 px-4 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                              <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                              <p className="text-gray-600 dark:text-gray-400 mb-6">No active donations available</p>
                              <button
                                className="btn-create-donation bg-primary dark:bg-primary-dark hover:bg-primary-dark dark:hover:bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                onClick={startDonation}
                              >
                                <Plus className="h-4 w-4" />
                                Create New Donation
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedSubTab === 'pending' && (
                        <div className="donations-compact-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {pendingDonations.length > 0 ? (
                            pendingDonations.map(donation => (
                              <div key={donation.id} className="donation-compact-card bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:shadow-gray-900/30 transition-all hover:-translate-y-1">
                                <div className="donation-card-image-container h-48 relative overflow-hidden">
                                  <img
                                    src={donation.imageUrl}
                                    alt={donation.foodName}
                                    className="donation-card-image w-full h-full object-cover"
                                  />
                                  <div className="status-badge absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-semibold uppercase bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                    Pending
                                  </div>
                                </div>

                                <div className="donation-card-content p-4">
                                  <h3 className="donation-card-title text-gray-900 dark:text-white font-semibold mb-2 line-clamp-1">{donation.foodName}</h3>
                                  <div className="donation-meta flex justify-between items-center mb-3">
                                    <span className="donation-category bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300">
                                      {donation.category}
                                    </span>
                                    <div className={`donor-type-icon flex items-center ${donation.donorType === 'Restaurant'
                                      ? 'text-orange-500 dark:text-orange-400'
                                      : donation.donorType === 'Individual'
                                        ? 'text-blue-500 dark:text-blue-400'
                                        : 'text-purple-500 dark:text-purple-400'
                                      }`}>
                                      {donation.donorType === 'Restaurant' ? <ChefHat className="h-3 w-3" /> :
                                        donation.donorType === 'Individual' ? <User className="h-3 w-3" /> :
                                          <Building2 className="h-3 w-3" />}
                                      <span className="donor-type-text text-xs ml-1">{donation.donorType}</span>
                                    </div>
                                  </div>

                                  <div className="donation-compact-info border-t border-gray-100 dark:border-gray-700 pt-3 mb-3">
                                    <div className="info-row flex items-center mb-1.5 text-sm text-gray-600 dark:text-gray-300">
                                      <Clock className="info-icon h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                                      <span className="info-text">
                                        {new Date(donation.expiry).toLocaleString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: 'numeric',
                                          minute: '2-digit',
                                          hour12: true
                                        })}
                                      </span>
                                    </div>
                                    <div className="info-row flex items-center mb-1.5 text-sm text-gray-600 dark:text-gray-300">
                                      <MapPin className="info-icon h-4 w-4 text-red-500 dark:text-red-400 mr-2" />
                                      <span className="info-text line-clamp-1">{donation.location}</span>
                                    </div>
                                    <div className="info-row flex items-center text-sm text-gray-600 dark:text-gray-300">
                                      <Package className="info-icon h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                                      <span className="info-text">Quantity: {donation.quantity}</span>
                                    </div>
                                  </div>

                                  <div className="donation-card-footer flex gap-2">
                                    <button
                                      className="btn-card-action mark-complete flex-1 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg py-1.5 px-3 text-sm font-medium transition-colors flex items-center justify-center"
                                      onClick={() => handleMarkAsCompleted(donation.id)}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      <span>Complete</span>
                                    </button>
                                    <button
                                      className="btn-card-action view-details flex-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg py-1.5 px-3 text-sm font-medium transition-colors flex items-center justify-center"
                                      onClick={() => handleCheckPendingRequests(donation)}
                                    >
                                      <Users className="h-3 w-3 mr-1" />
                                      <span>Requests</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="empty-state col-span-full flex flex-col items-center justify-center py-12 px-4 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                              <Clock3 className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                              <p className="text-gray-600 dark:text-gray-400">No pending donations available</p>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedSubTab === 'rejected' && (
                        <div className="donations-compact-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {rejectedDonations.length > 0 ? (
                            rejectedDonations.map(donation => (
                              <div key={donation.id} className="donation-compact-card bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:shadow-gray-900/30 transition-all hover:-translate-y-1">
                                <div className="donation-card-image-container h-48 relative overflow-hidden">
                                  <img
                                    src={donation.imageUrl}
                                    alt={donation.foodName}
                                    className="donation-card-image w-full h-full object-cover"
                                  />
                                  <div className="status-badge absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-semibold uppercase bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                                    Rejected
                                  </div>
                                </div>

                                <div className="donation-card-content p-4">
                                  <h3 className="donation-card-title text-gray-900 dark:text-white font-semibold mb-2 line-clamp-1">{donation.foodName}</h3>
                                  <div className="donation-meta flex justify-between items-center mb-3">
                                    <span className="donation-category bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300">
                                      {donation.category}
                                    </span>
                                    <div className={`donor-type-icon flex items-center ${donation.donorType === 'Restaurant'
                                      ? 'text-orange-500 dark:text-orange-400'
                                      : donation.donorType === 'Individual'
                                        ? 'text-blue-500 dark:text-blue-400'
                                        : 'text-purple-500 dark:text-purple-400'
                                      }`}>
                                      {donation.donorType === 'Restaurant' ? <ChefHat className="h-3 w-3" /> :
                                        donation.donorType === 'Individual' ? <User className="h-3 w-3" /> :
                                          <Building2 className="h-3 w-3" />}
                                      <span className="donor-type-text text-xs ml-1">{donation.donorType}</span>
                                    </div>
                                  </div>

                                  <div className="donation-compact-info border-t border-gray-100 dark:border-gray-700 pt-3 mb-3">
                                    <div className="info-row flex items-center mb-1.5 text-sm text-gray-600 dark:text-gray-300">
                                      <Clock className="info-icon h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                                      <span className="info-text">
                                        {new Date(donation.expiry).toLocaleString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: 'numeric',
                                          minute: '2-digit',
                                          hour12: true
                                        })}
                                      </span>
                                    </div>
                                    <div className="info-row flex items-center mb-1.5 text-sm text-gray-600 dark:text-gray-300">
                                      <MapPin className="info-icon h-4 w-4 text-red-500 dark:text-red-400 mr-2" />
                                      <span className="info-text line-clamp-1">{donation.location}</span>
                                    </div>
                                    <div className="info-row flex items-center text-sm text-gray-600 dark:text-gray-300">
                                      <Package className="info-icon h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                                      <span className="info-text">Quantity: {donation.quantity}</span>
                                    </div>
                                  </div>

                                  <div className="donation-card-footer flex justify-center">
                                    <button
                                      className="btn-card-action delete bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg py-1.5 px-6 text-sm font-medium transition-colors flex items-center justify-center"
                                      onClick={() => handleDeleteDonation(donation.id)}
                                    >
                                      <Trash2 className="h-3 w-3 mr-2" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="empty-state col-span-full flex flex-col items-center justify-center py-12 px-4 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                              <X className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                              <p className="text-gray-600 dark:text-gray-400">No rejected donations available</p>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedSubTab === 'completed' && (
                        <div className="donations-compact-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {completedDonations.length > 0 ? (
                            completedDonations.map(donation => (
                              <div key={donation.id} className="donation-compact-card bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:shadow-gray-900/30 transition-all hover:-translate-y-1">
                                <div className="donation-card-image-container h-48 relative overflow-hidden">
                                  <img
                                    src={donation.imageUrl}
                                    alt={donation.foodName}
                                    className="donation-card-image w-full h-full object-cover"
                                  />
                                  <div className="status-badge absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-semibold uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                    Completed
                                  </div>
                                </div>

                                <div className="donation-card-content p-4">
                                  <h3 className="donation-card-title text-gray-900 dark:text-white font-semibold mb-2 line-clamp-1">{donation.foodName}</h3>
                                  <div className="donation-meta flex justify-between items-center mb-3">
                                    <span className="donation-category bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300">
                                      {donation.category}
                                    </span>
                                    <div className={`donor-type-icon flex items-center ${donation.donorType === 'Restaurant'
                                      ? 'text-orange-500 dark:text-orange-400'
                                      : donation.donorType === 'Individual'
                                        ? 'text-blue-500 dark:text-blue-400'
                                        : 'text-purple-500 dark:text-purple-400'
                                      }`}>
                                      {donation.donorType === 'Restaurant' ? <ChefHat className="h-3 w-3" /> :
                                        donation.donorType === 'Individual' ? <User className="h-3 w-3" /> :
                                          <Building2 className="h-3 w-3" />}
                                      <span className="donor-type-text text-xs ml-1">{donation.donorType}</span>
                                    </div>
                                  </div>

                                  <div className="donation-compact-info border-t border-gray-100 dark:border-gray-700 pt-3 mb-3">
                                    <div className="info-row flex items-center mb-1.5 text-sm text-gray-600 dark:text-gray-300">
                                      <Clock className="info-icon h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                                      <span className="info-text">
                                        {new Date(donation.expiry).toLocaleString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          minute: '2-digit',
                                          hour12: true
                                        })}
                                      </span>
                                    </div>
                                    <div className="info-row flex items-center mb-1.5 text-sm text-gray-600 dark:text-gray-300">
                                      <MapPin className="info-icon h-4 w-4 text-red-500 dark:text-red-400 mr-2" />
                                      <span className="info-text line-clamp-1">{donation.location}</span>
                                    </div>
                                    <div className="info-row flex items-center text-sm text-gray-600 dark:text-gray-300">
                                      <Package className="info-icon h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                                      <span className="info-text">Quantity: {donation.quantity}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="empty-state col-span-full flex flex-col items-center justify-center py-12 px-4 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                              <CheckCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                              <p className="text-gray-600 dark:text-gray-400">No completed donations available</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Donation Modal - Conditionally rendered */}
            {showEditModal && editingDonation && (
              <EditDonationModal
                donation={editingDonation}
                onClose={closeEditModal}
                onSubmit={handleEditSubmit}
                loading={apiLoading}
                error={apiError}
              />
            )}
          </div>
        )}

        {selectedMainTab === 'requests' && (
          <div className="popup-overlay fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="popup-container requests-popup bg-white dark:bg-gray-900 rounded-xl shadow-xl dark:shadow-black/30 w-11/12 max-w-6xl max-h-[85vh] flex flex-col overflow-hidden">

              {/* Enhanced Header */}
              <div className="popup-header bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-800 dark:to-purple-600 flex justify-between items-center p-4 border-b border-purple-400/20 dark:border-purple-800/30">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3 text-white" />
                  <h2 className="popup-title text-white text-xl font-bold">Food Requests</h2>
                  {foodRequests.length > 0 && (
                    <span className="ml-3 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {foodRequests.filter(req => req.status === 'PENDING').length} pending
                    </span>
                  )}
                </div>

                <button
                  className="popup-close-btn w-10 h-10 rounded-full bg-white/20 dark:bg-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-700/50 flex items-center justify-center text-white transition-all duration-200 hover:rotate-90"
                  onClick={() => setSelectedMainTab('donations')}
                  aria-label="Close requests"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Enhanced Content Area */}
              <div className="popup-content requests-content flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
                {foodRequestsLoading ? (
                  <div className="loading-indicator flex flex-col items-center justify-center p-12 text-gray-600 dark:text-gray-400">
                    <div className="loading-spinner w-12 h-12 border-4 border-purple-200 dark:border-purple-900/30 border-t-purple-600 dark:border-t-purple-500 rounded-full animate-spin mb-4"></div>
                    <span className="text-lg">Loading food requests...</span>
                  </div>
                ) : foodRequestsError ? (
                  <div className="error-message flex items-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 m-6 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{foodRequestsError}</span>
                  </div>
                ) : foodRequests.length > 0 ? (
                  <div className="requests-scroll-container overflow-y-auto h-full p-6 custom-scrollbar">
                    <div className="requests-enhanced-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {foodRequests.map(request => (
                        <div
                          key={request.id}
                          className="request-enhanced-card bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/30 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-gray-900/50"
                        >
                          {/* Card Header */}
                          <div className="request-card-header bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 p-4 border-b border-gray-100 dark:border-gray-600">
                            <div className="flex justify-between items-center">
                              <div className="requester-info flex items-center">
                                <div className="avatar-circle w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-3 font-semibold">
                                  {(request.requesterName || 'A').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h3 className="requester-name text-gray-900 dark:text-white font-semibold text-sm">
                                    {request.requesterName || 'Anonymous'}
                                  </h3>
                                  <div className="request-meta-info flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{request.requestDate}</span>
                                  </div>
                                </div>
                              </div>

                              <div className={`request-status px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${request.status === 'PENDING'
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                : request.status === 'ACCEPTED'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                }`}>
                                {request.status}
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Image Section */}
                          {request.imageUrl && (
                            <div className="request-image-container h-40 overflow-hidden relative bg-gray-100 dark:bg-gray-800">
                              <img
                                src={request.imageUrl}
                                alt="Requested food"
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                          )}

                          {/* Card Body */}
                          <div className="request-card-body p-4">
                            {/* Priority Badge */}
                            <div className="mb-3">
                              <span className={`priority-badge inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${request.urgency?.toLowerCase() === 'high'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                : request.urgency?.toLowerCase() === 'medium'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${request.urgency?.toLowerCase() === 'high' ? 'bg-red-500' :
                                  request.urgency?.toLowerCase() === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}></div>
                                {request.urgency || 'Medium'} Priority
                              </span>
                            </div>

                            {/* Request Details Grid */}
                            <div className="request-details-compact grid grid-cols-2 gap-3 mb-4">
                              <div className="detail-group bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                <span className="detail-label block text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                                  Food Type
                                </span>
                                <span className="detail-value text-sm text-gray-800 dark:text-gray-200 font-semibold">
                                  {request.foodName}
                                </span>
                              </div>

                              <div className="detail-group bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                <span className="detail-label block text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                                  People
                                </span>
                                <span className="detail-value text-sm text-gray-800 dark:text-gray-200 font-semibold flex items-center">
                                  <Users className="h-3 w-3 mr-1 text-purple-500" />
                                  {request.people || 'Not specified'}
                                </span>
                              </div>

                              <div className="detail-group bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                <span className="detail-label block text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                                  Location
                                </span>
                                <span className="detail-value text-sm text-gray-800 dark:text-gray-200 font-semibold flex items-center">
                                  <MapPin className="h-3 w-3 mr-1 text-red-500" />
                                  <span className="truncate">{request.location || 'Not specified'}</span>
                                </span>
                              </div>

                              <div className="detail-group bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                <span className="detail-label block text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                                  Delivery
                                </span>
                                <span className="detail-value text-sm text-gray-800 dark:text-gray-200 font-semibold flex items-center">
                                  <Truck className="h-3 w-3 mr-1 text-blue-500" />
                                  {request.deliveryPreference || 'Pickup'}
                                </span>
                              </div>
                            </div>

                            {/* Additional Info */}
                            {(request.specificDate || request.specificTime) && (
                              <div className="timing-info bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4 border-l-3 border-blue-400">
                                <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span className="font-medium">Timing Requirements</span>
                                </div>
                                <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                  {request.specificDate && <span>Date: {request.specificDate}</span>}
                                  {request.specificDate && request.specificTime && <span className="mx-2">•</span>}
                                  {request.specificTime && <span>Time: {request.specificTime}</span>}
                                </div>
                              </div>
                            )}

                            {/* Notes Section */}
                            {request.notes && (
                              <div className="notes-container bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mb-4 border-l-3 border-purple-400">
                                <h4 className="notes-heading text-xs text-purple-700 dark:text-purple-300 uppercase font-medium mb-1 flex items-center">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Request Notes
                                </h4>
                                <p className="notes-content text-sm text-purple-600 dark:text-purple-400 leading-relaxed">
                                  {request.notes}
                                </p>
                              </div>
                            )}

                            {/* Recipients Section */}
                            {request.recipients && request.recipients.length > 0 && (
                              <div className="recipients-container mb-4">
                                <h4 className="recipients-heading text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-2 flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  Recipients
                                </h4>
                                <div className="recipients-list flex flex-wrap gap-1.5">
                                  {request.recipients.map((recipient, index) => (
                                    <span
                                      key={index}
                                      className="recipient-tag bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-1 rounded-md font-medium"
                                    >
                                      {recipient}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Enhanced Action Buttons */}
                            <div className="request-actions-row flex gap-2 mt-4">
                              {request.status === 'PENDING' ? (
                                <>
                                  <button
                                    className="btn-accept-request flex-1 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    onClick={() => handleAcceptRequest(request.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1.5" />
                                    <span>Accept</span>
                                  </button>
                                  <button
                                    className="btn-decline-request flex-1 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    onClick={() => handleDeclineRequest(request.id)}
                                  >
                                    <X className="h-4 w-4 mr-1.5" />
                                    <span>Decline</span>
                                  </button>
                                </>
                              ) : request.status === 'ACCEPTED' ? (
                                <button
                                  className="btn-contact-requester w-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                  onClick={() => handleContactRequester(request)}
                                >
                                  <Phone className="h-4 w-4 mr-1.5" />
                                  <span>Contact Requester</span>
                                </button>
                              ) : (
                                <div className="status-message w-full text-center py-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    Request {request.status.toLowerCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state-container flex flex-col items-center justify-center py-20 px-8 text-center bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 mx-6 my-6">
                    <div className="empty-icon-container bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-full mb-6">
                      <Users className="h-16 w-16 text-purple-500 dark:text-purple-400" />
                    </div>
                    <h3 className="empty-state-title text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                      No Food Requests Yet
                    </h3>
                    <p className="empty-state-message text-gray-600 dark:text-gray-400 text-base max-w-md leading-relaxed">
                      When someone requests your donated food, their requests will appear here. You'll be able to accept or decline requests and coordinate with recipients.
                    </p>
                    <div className="empty-state-features mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="feature-item flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Real-time notifications</span>
                      </div>
                      <div className="feature-item flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Easy accept/decline</span>
                      </div>
                      <div className="feature-item flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Direct communication</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedMainTab === 'messages' && (
          <div className="popup-overlay fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="popup-container messages-popup bg-white dark:bg-gray-900 rounded-xl shadow-xl dark:shadow-black/30 w-11/12 max-w-6xl max-h-[85vh] flex flex-col overflow-hidden">
              {/* Messages Header */}
              <div className="popup-header bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-800 dark:to-purple-600 flex justify-between items-center p-4 border-b border-purple-400/20 dark:border-purple-800/30">
                <div className="popup-title-container flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-white" />
                  <h2 className="popup-title text-white text-lg font-semibold">Messages</h2>
                </div>

                <div className="popup-actions flex items-center">
                  <div className="popup-tabs flex mr-3 space-x-2">
                    <button
                      className={`popup-tab-btn px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedMessageTab === 'received'
                        ? 'bg-white text-purple-600 dark:bg-purple-dark/80 dark:text-white'
                        : 'bg-white/20 text-white hover:bg-white/30 dark:bg-gray-700/30 dark:hover:bg-gray-700/50'
                        }`}
                      onClick={() => setSelectedMessageTab('received')}
                    >
                      <Inbox className="h-4 w-4 mr-1" />
                      Received ({messageStats.totalReceivedMessages || 0})
                    </button>
                    <button
                      className={`popup-tab-btn px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedMessageTab === 'sent'
                        ? 'bg-white text-purple-600 dark:bg-purple-dark/80 dark:text-white'
                        : 'bg-white/20 text-white hover:bg-white/30 dark:bg-gray-700/30 dark:hover:bg-gray-700/50'
                        }`}
                      onClick={() => setSelectedMessageTab('sent')}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Sent ({messageStats.totalSentMessages || 0})
                    </button>
                  </div>

                  <button
                    className="compose-btn bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mr-3 flex items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🖱️ Compose button clicked - opening modal');
                      // Close the main messages popup first
                      setSelectedMainTab('donations');
                      // Small delay to ensure smooth transition
                      setTimeout(() => {
                        setShowComposeModal(true);
                      }, 100);
                    }}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Compose
                  </button>

                  <button
                    className="popup-close-btn w-8 h-8 rounded-full bg-white/20 dark:bg-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-700/50 flex items-center justify-center text-white transition-transform hover:rotate-90"
                    onClick={() => setSelectedMainTab('donations')}
                    aria-label="Close messages"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages Content */}
              <div className="popup-content messages-content flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
                {messagesLoading && (
                  <div className="loading-indicator flex flex-col items-center justify-center p-12 text-gray-600 dark:text-gray-400">
                    <span className="loading-spinner w-10 h-10 border-4 border-purple-200 dark:border-purple-900/30 border-t-purple-600 dark:border-t-purple-500 rounded-full animate-spin mb-4"></span>
                    <span>Loading messages...</span>
                  </div>
                )}

                {messagesError && (
                  <div className="error-message flex items-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 m-4 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{messagesError}</span>
                  </div>
                )}

                {!messagesLoading && !messagesError && (
                  <div className="messages-section p-6 overflow-y-auto h-full">
                    {selectedMessageTab === 'received' && (
                      <div className="received-messages">
                        {receivedMessages.length > 0 ? (
                          <div className="messages-grid space-y-4">
                            {receivedMessages.map(message => (
                              <div
                                key={message.id}
                                className={`message-card bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md dark:shadow-gray-900/30 transition-all cursor-pointer ${!message.read ? 'border-l-4 border-l-purple-500 bg-purple-50/30 dark:bg-purple-900/10' : ''}`}
                                onClick={() => {
                                  setSelectedMessage(message);
                                  setShowMessageDetails(true);
                                  if (!message.read) {
                                    handleMarkAsRead(message.id);
                                  }
                                }}
                              >
                                <div className="message-header flex justify-between items-start mb-2">
                                  <div className="sender-info flex items-center">
                                    <img
                                      src={message.senderAvatar}
                                      alt="Sender"
                                      className="w-8 h-8 rounded-full mr-3"
                                    />
                                    <div>
                                      <div className="sender-name font-semibold text-gray-900 dark:text-white">
                                        {message.sender}
                                      </div>
                                      <div className="message-date text-xs text-gray-500 dark:text-gray-400">
                                        {message.date} at {message.time}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="message-badges flex items-center space-x-2">
                                    {!message.read && (
                                      <span className="unread-badge bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                                        New
                                      </span>
                                    )}
                                    {message.hasAttachment && (
                                      <Paperclip className="h-4 w-4 text-gray-400" />
                                    )}
                                  </div>
                                </div>

                                <div className="message-subject font-medium text-gray-800 dark:text-gray-200 mb-1">
                                  {message.subject}
                                </div>

                                <div className="message-preview text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                  {message.message}
                                </div>

                                <div className="message-role mt-2">
                                  <span className={`role-badge px-2 py-1 rounded-full text-xs font-medium ${message.role === 'admin_to_donor'
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    }`}>
                                    {message.role === 'admin_to_donor' ? 'From Admin' : 'From Merchant'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-state-container flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <Inbox className="h-20 w-20 text-gray-300 dark:text-gray-600 mb-6" />
                            <p className="empty-state-message text-gray-600 dark:text-gray-400 text-lg">No messages received</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2 max-w-md">
                              Messages from admin and merchants will appear here.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedMessageTab === 'sent' && (
                      <div className="sent-messages">
                        {sentMessages.length > 0 ? (
                          <div className="messages-grid space-y-4">
                            {sentMessages.map(message => (
                              <div
                                key={message.id}
                                className="message-card bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md dark:shadow-gray-900/30 transition-all"
                              >
                                <div className="message-header flex justify-between items-start mb-2">
                                  <div className="recipient-info">
                                    <div className="recipient-label text-sm text-gray-500 dark:text-gray-400">To: Admin</div>
                                    <div className="message-date text-xs text-gray-500 dark:text-gray-400">
                                      {message.date} at {message.time}
                                    </div>
                                  </div>
                                  <div className="message-actions flex items-center space-x-2">
                                    {message.hasAttachment && (
                                      <Paperclip className="h-4 w-4 text-gray-400" />
                                    )}
                                    <button
                                      className="delete-btn text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                                      onClick={() => handleDeleteSentMessage(message.id)}
                                      title="Delete message"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>

                                <div className="message-subject font-medium text-gray-800 dark:text-gray-200 mb-1">
                                  {message.subject}
                                </div>

                                <div className="message-preview text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                  {message.message}
                                </div>

                                <div className="message-role mt-2">
                                  <span className="role-badge bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
                                    To Admin
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-state-container flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <Send className="h-20 w-20 text-gray-300 dark:text-gray-600 mb-6" />
                            <p className="empty-state-message text-gray-600 dark:text-gray-400 text-lg">No messages sent</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2 max-w-md">
                              Your sent messages to admin will appear here.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showComposeModal && (
          <div className="modal-overlay fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="compose-modal bg-white dark:bg-gray-900 rounded-2xl shadow-2xl dark:shadow-black/40 w-11/12 max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="modal-header bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 dark:from-purple-800 dark:via-purple-700 dark:to-indigo-800 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="modal-title text-white font-bold text-lg flex items-center">
                      <Send className="h-5 w-5 mr-2" />
                      Compose Message to Admin
                    </h3>
                    <p className="text-purple-100 dark:text-purple-200 text-xs mt-1">
                      Choose a template or write your own message
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-body p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900">
                {/* Message Templates Section */}
                <div className="templates-section mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Quick Templates
                  </h4>
                  <div className="templates-grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Merchant Complaint Template */}
                    <div
                      className="template-card bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all duration-200 hover:border-red-300 dark:hover:border-red-600 group"
                      onClick={() => {
                        document.getElementById('subject').value = 'Merchant Complaint - Quality/Service Issue';
                        document.getElementById('message').value = `Dear Admin,

I would like to report an issue with a merchant on the platform:

Merchant Name: [Merchant Name]
Issue Type: [Quality/Service/Delivery/Other]
Date of Incident: [Date]

Description of the problem:
[Please describe the issue in detail]

Evidence/Photos: [Attached if any]

This affects the trust and quality of our donation platform. Please investigate and take appropriate action.

Thank you for your attention to this matter.

Best regards,
${donorProfile?.firstName} ${donorProfile?.lastName}`;
                      }}
                    >
                      <div className="flex items-center mb-3">
                        <div className="template-icon bg-red-100 dark:bg-red-900/30 p-2 rounded-lg mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h5 className="template-title font-semibold text-gray-800 dark:text-gray-200">Merchant Complaint</h5>
                      </div>
                      <p className="template-description text-gray-600 dark:text-gray-400 text-sm">
                        Report issues with merchant quality, service, or delivery problems
                      </p>
                    </div>

                    {/* User/Receiver Complaint Template */}
                    <div
                      className="template-card bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-600 group"
                      onClick={() => {
                        document.getElementById('subject').value = 'User Complaint - Inappropriate Behavior';
                        document.getElementById('message').value = `Dear Admin,

I need to report inappropriate behavior from a platform user:

User/Receiver Name: [User Name]
Issue Type: [Behavior/Communication/Request Abuse/Other]
Date of Incident: [Date]

Details of the incident:
[Please describe what happened]

Impact on donation process:
[How this affected your donation experience]

Screenshots/Evidence: [Attached if available]

Please review this user's account and take necessary action to maintain platform integrity.

Best regards,
${donorProfile?.firstName} ${donorProfile?.lastName}`;
                      }}
                    >
                      <div className="flex items-center mb-3">
                        <div className="template-icon bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg mr-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                          <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h5 className="template-title font-semibold text-gray-800 dark:text-gray-200">User Complaint</h5>
                      </div>
                      <p className="template-description text-gray-600 dark:text-gray-400 text-sm">
                        Report inappropriate behavior or issues with other users
                      </p>
                    </div>

                    {/* System Issues Template */}
                    <div
                      className="template-card bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 group"
                      onClick={() => {
                        document.getElementById('subject').value = 'Technical Issue - Platform Bug Report';
                        document.getElementById('message').value = `Dear Technical Team,

I'm experiencing a technical issue with the platform:

Problem Type: [Bug/Error/Performance/UI Issue]
Page/Section: [Where the issue occurred]
Browser: [Chrome/Firefox/Safari/Edge]
Device: [Desktop/Mobile/Tablet]

Steps to reproduce:
1. [First step]
2. [Second step]
3. [When error occurred]

Expected behavior:
[What should have happened]

Actual behavior:
[What actually happened]

Error message (if any):
[Copy exact error message]

This issue is affecting my ability to [describe impact].

Please investigate and provide a solution.

Best regards,
${donorProfile?.firstName} ${donorProfile?.lastName}`;
                      }}
                    >
                      <div className="flex items-center mb-3">
                        <div className="template-icon bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h5 className="template-title font-semibold text-gray-800 dark:text-gray-200">System Issues</h5>
                      </div>
                      <p className="template-description text-gray-600 dark:text-gray-400 text-sm">
                        Report technical problems, bugs, or platform issues
                      </p>
                    </div>

                    {/* Donor Account Issues Template */}
                    <div
                      className="template-card bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all duration-200 hover:border-green-300 dark:hover:border-green-600 group"
                      onClick={() => {
                        document.getElementById('subject').value = 'Donor Account Issue - Need Assistance';
                        document.getElementById('message').value = `Dear Admin,

I need assistance with my donor account:

Issue Category: [Profile/Donations/Verification/Settings/Other]
Urgency Level: [Low/Medium/High]

Problem Description:
[Explain the issue you're facing]

Account Information:
- Donor ID: ${donorId}
- Email: ${donorProfile?.email}
- Registration Date: [If known]

What I've already tried:
[List any troubleshooting steps you've attempted]

Additional context:
[Any other relevant information]

Please help resolve this issue so I can continue helping those in need.

Thank you,
${donorProfile?.firstName} ${donorProfile?.lastName}`;
                      }}
                    >
                      <div className="flex items-center mb-3">
                        <div className="template-icon bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                          <UserCog className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h5 className="template-title font-semibold text-gray-800 dark:text-gray-200">Account Issues</h5>
                      </div>
                      <p className="template-description text-gray-600 dark:text-gray-400 text-sm">
                        Get help with donor account settings, profile, or verification
                      </p>
                    </div>

                    {/* General Feedback Template */}
                    <div
                      className="template-card bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600 group"
                      onClick={() => {
                        document.getElementById('subject').value = 'Platform Feedback - Suggestions for Improvement';
                        document.getElementById('message').value = `Dear Admin Team,

I have some feedback and suggestions for the platform:

Feedback Category: [Feature Request/Improvement/Compliment/General]

What's working well:
[Things you appreciate about the platform]

Suggestions for improvement:
[Your ideas for making the platform better]

Feature requests:
[New features you'd like to see]

User experience notes:
[Your experience using the platform]

This feedback comes from my experience as an active donor who wants to see the platform succeed in helping more people.

Thank you for considering my input.

Best regards,
${donorProfile?.firstName} ${donorProfile?.lastName}`;
                      }}
                    >
                      <div className="flex items-center mb-3">
                        <div className="template-icon bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                          <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h5 className="template-title font-semibold text-gray-800 dark:text-gray-200">General Feedback</h5>
                      </div>
                      <p className="template-description text-gray-600 dark:text-gray-400 text-sm">
                        Share suggestions, compliments, or general platform feedback
                      </p>
                    </div>

                    {/* Custom Message Template */}
                    <div
                      className="template-card bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 group"
                      onClick={() => {
                        document.getElementById('subject').value = '';
                        document.getElementById('message').value = `Dear Admin,

[Write your custom message here]

Best regards,
${donorProfile?.firstName} ${donorProfile?.lastName}`;
                      }}
                    >
                      <div className="flex items-center mb-3">
                        <div className="template-icon bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mr-3 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                          <Edit className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <h5 className="template-title font-semibold text-gray-800 dark:text-gray-200">Custom Message</h5>
                      </div>
                      <p className="template-description text-gray-600 dark:text-gray-400 text-sm">
                        Start with a blank template for your own custom message
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Message Form */}
                <div className="message-form-section bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <Send className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Message Details
                  </h4>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log('📋 Form submitted');

                      const formData = new FormData(e.target);

                      // Add donorId and donorEmail to the form data
                      formData.append('donorId', donorId.toString());
                      formData.append('donorEmail', donorProfile?.email || '');

                      console.log('📤 Calling handleSendMessage...');
                      handleSendMessage(formData);
                    }}
                    className="compose-form space-y-6"
                  >
                    {/* Recipient Display */}
                    <div className="form-group">
                      <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-3">
                        <Users className="h-4 w-4 inline mr-2" />
                        To:
                      </label>
                      <div className="recipient-display bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center">
                          <div className="avatar bg-purple-100 dark:bg-purple-800 p-2 rounded-full mr-3">
                            <UserCog className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <span className="text-gray-800 dark:text-gray-200 font-semibold">Admin Team</span>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Food Bridge Bangladesh Administration</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subject Field */}
                    <div className="form-group">
                      <label htmlFor="subject" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                        <MessageSquare className="h-4 w-4 inline mr-2" />
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        placeholder="Enter a clear, descriptive subject line"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all duration-200 shadow-sm"
                      />
                    </div>

                    {/* Message Field */}
                    <div className="form-group">
                      <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                        <Edit className="h-4 w-4 inline mr-2" />
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={8}
                        placeholder="Type your message here or use a template above..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all duration-200 resize-vertical shadow-sm"
                      ></textarea>
                    </div>

                    {/* Enhanced File Upload */}
                    <div className="form-group">
                      <label htmlFor="attachment" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                        <Paperclip className="h-4 w-4 inline mr-2" />
                        Attachment (Optional)
                      </label>
                      <div className="file-upload-container">
                        <input
                          type="file"
                          id="attachment"
                          name="attachment"
                          className="file-input hidden"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip"
                        />
                        <label
                          htmlFor="attachment"
                          className="file-upload-area border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500"
                        >
                          <div className="upload-icon bg-purple-100 dark:bg-purple-800 p-3 rounded-full mb-3">
                            <Paperclip className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-gray-600 dark:text-gray-300 text-center font-medium">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                            PDF, DOC, Images, ZIP up to 10MB
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="form-actions flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        className="btn-cancel px-8 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-200 font-medium flex items-center gap-2 hover:shadow-md"
                        onClick={() => setShowComposeModal(false)}
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-send px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 hover:from-purple-700 hover:to-indigo-700 dark:hover:from-purple-800 dark:hover:to-indigo-800 text-white rounded-xl transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Send className="h-4 w-4" />
                        Send Message
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message Details Modal */}
        {showMessageDetails && selectedMessage && (
          <div className="modal-overlay fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center">
            <div className="message-details-modal bg-white dark:bg-gray-900 rounded-xl shadow-xl dark:shadow-black/30 w-11/12 max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="modal-header bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-800 dark:to-purple-600 p-4 flex justify-between items-center">
                <h3 className="modal-title text-white font-semibold text-lg">
                  Message Details
                </h3>
                <button
                  className="close-btn w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                  onClick={() => {
                    setShowMessageDetails(false);
                    setSelectedMessage(null);
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="modal-body p-6 overflow-y-auto flex-1">
                <div className="message-details-container">
                  {/* Message Header */}
                  <div className="message-header-section bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                    <div className="sender-info flex items-center mb-3">
                      <img
                        src={selectedMessage.senderAvatar}
                        alt="Sender"
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div className="flex-1">
                        <div className="sender-name text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedMessage.sender}
                        </div>
                        <div className="message-meta text-sm text-gray-500 dark:text-gray-400">
                          {selectedMessage.date} at {selectedMessage.time}
                        </div>
                      </div>
                      <div className="message-badges">
                        <span className={`role-badge px-3 py-1 rounded-full text-sm font-medium ${selectedMessage.role === 'admin_to_donor'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          }`}>
                          {selectedMessage.role === 'admin_to_donor' ? 'From Admin' : 'From Merchant'}
                        </span>
                      </div>
                    </div>

                    <div className="subject-line">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        {selectedMessage.subject}
                      </h2>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="message-content-section bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="message-text text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </div>
                  </div>

                  {/* Attachment Section */}
                  {selectedMessage.hasAttachment && (
                    <div className="attachment-section bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                        <Paperclip className="h-5 w-5 mr-2" />
                        Attachment
                      </h3>
                      <div className="attachment-item bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-3 flex items-center justify-between">
                        <div className="attachment-info flex items-center">
                          <div className="attachment-icon bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
                            <Paperclip className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <div className="attachment-name font-medium text-gray-800 dark:text-gray-200">
                              {selectedMessage.fileName}
                            </div>
                            <div className="attachment-size text-sm text-gray-500 dark:text-gray-400">
                              {selectedMessage.fileSize ? `${(selectedMessage.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                            </div>
                          </div>
                        </div>
                        <button className="download-btn bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
                <button
                  className="btn-close bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-lg transition-colors"
                  onClick={() => {
                    setShowMessageDetails(false);
                    setSelectedMessage(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedMainTab === 'profile' && (
          <div className="popup-overlay fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="popup-container profile-popup bg-white dark:bg-gray-900 rounded-xl shadow-xl dark:shadow-black/30 w-11/12 max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

              {/* Enhanced Header */}
              <div className="popup-header bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-800 dark:to-purple-600 flex justify-between items-center p-4 border-b border-purple-400/20 dark:border-purple-800/30 flex-shrink-0">
                <h2 className="popup-title flex items-center text-white text-lg font-semibold">
                  <UserCog className="h-5 w-5 mr-2 text-white" />
                  Profile Management
                </h2>
                <button
                  className="popup-close-btn w-8 h-8 rounded-full bg-white/20 dark:bg-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-700/50 flex items-center justify-center text-white transition-transform hover:rotate-90"
                  onClick={() => setSelectedMainTab('donations')}
                  aria-label="Close profile"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Enhanced Scrollable Content */}
              <div className="popup-content profile-management-container flex-grow overflow-hidden bg-gray-50 dark:bg-gray-900">
                <div className="h-full overflow-y-auto custom-scrollbar">
                  <div className="p-6 space-y-6">

                    {/* Loading indicator */}
                    {profileLoading && (
                      <div className="loading-indicator flex flex-col items-center justify-center p-12 text-gray-600 dark:text-gray-400">
                        <div className="loading-spinner w-10 h-10 border-4 border-purple-200 dark:border-purple-900/30 border-t-purple-600 dark:border-t-purple-500 rounded-full animate-spin mb-4"></div>
                        <span>Loading profile data...</span>
                      </div>
                    )}

                    {/* Success message */}
                    {profileUpdateSuccess && (
                      <div className="success-message flex items-center bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-4 shadow-sm">
                        <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="font-medium">{profileUpdateSuccess}</span>
                      </div>
                    )}

                    {/* Error message */}
                    {profileUpdateError && (
                      <div className="error-message flex items-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4 shadow-sm">
                        <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="font-medium">{profileUpdateError}</span>
                      </div>
                    )}

                    {/* Enhanced Profile View */}
                    {!showProfileForm && !showPasswordForm && donorProfile && (
                      <>
                        {/* Profile Header Card */}
                        <div className="profile-header-card bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 overflow-hidden">
                          {/* Cover Section */}
                          <div className="profile-cover bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 dark:from-purple-700 dark:via-purple-800 dark:to-indigo-800 h-32 relative">
                            <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                          </div>

                          {/* Profile Info Section */}
                          <div className="profile-info-section p-6 -mt-16 relative">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                              {/* Profile Image */}
                              <div className="profile-image-container relative">
                                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden bg-white dark:bg-gray-700">
                                  {donorProfile.userPhotoBase64 ? (
                                    <img
                                      src={`data:${donorProfile.photoContentType};base64,${donorProfile.userPhotoBase64}`}
                                      alt="Profile"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                                      <User className="w-16 h-16 text-white" />
                                    </div>
                                  )}
                                </div>
                                <button
                                  className="absolute bottom-2 right-2 w-10 h-10 bg-purple-500 dark:bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors"
                                  onClick={() => setShowProfileForm(true)}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Profile Info */}
                              <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                  {donorProfile.firstName} {donorProfile.lastName}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
                                  {donorProfile.bio || 'No bio added yet. Click edit to add a bio.'}
                                </p>

                                {/* Profile Badges */}
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                    <Heart className="w-4 h-4 mr-1" />
                                    Donor
                                  </span>
                                  {donorProfile.bloodGroup && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                      <Droplets className="w-4 h-4 mr-1" />
                                      {donorProfile.bloodGroup}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Verified
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Personal Information Grid */}
                        <div className="profile-details-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Contact Information Card */}
                          <div className="profile-section bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="section-title text-gray-900 dark:text-white text-lg font-semibold mb-6 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                              <Phone className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                              Contact Information
                            </h3>

                            <div className="space-y-4">
                              <div className="info-item bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border-l-4 border-blue-500">
                                <span className="detail-label block text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Email Address</span>
                                <span className="detail-value text-gray-800 dark:text-gray-200 font-semibold break-all">
                                  {donorProfile.email}
                                </span>
                              </div>

                              <div className="info-item bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border-l-4 border-green-500">
                                <span className="detail-label block text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Phone Number</span>
                                <span className="detail-value text-gray-800 dark:text-gray-200 font-semibold">
                                  {donorProfile.phone || 'Not provided'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Personal Details Card */}
                          <div className="profile-section bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="section-title text-gray-900 dark:text-white text-lg font-semibold mb-6 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                              <User className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                              Personal Details
                            </h3>

                            <div className="space-y-4">
                              <div className="info-item bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border-l-4 border-red-500">
                                <span className="detail-label block text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Blood Group</span>
                                <span className="detail-value text-gray-800 dark:text-gray-200 font-semibold">
                                  {donorProfile.bloodGroup || 'Not provided'}
                                </span>
                              </div>

                              <div className="info-item bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border-l-4 border-purple-500">
                                <span className="detail-label block text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Birth Date</span>
                                <span className="detail-value text-gray-800 dark:text-gray-200 font-semibold">
                                  {donorProfile.birthdate ? new Date(donorProfile.birthdate).toLocaleDateString() : 'Not provided'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Address Information Card */}
                          <div className="profile-section bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
                            <h3 className="section-title text-gray-900 dark:text-white text-lg font-semibold mb-6 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                              <MapPin className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                              Address Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="info-item bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border-l-4 border-orange-500">
                                <span className="detail-label block text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Address</span>
                                <span className="detail-value text-gray-800 dark:text-gray-200 font-semibold">
                                  {donorProfile.address || 'Not provided'}
                                </span>
                              </div>

                              <div className="info-item bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border-l-4 border-teal-500">
                                <span className="detail-label block text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Address Details</span>
                                <span className="detail-value text-gray-800 dark:text-gray-200 font-semibold">
                                  {donorProfile.addressDescription || 'Not provided'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="profile-actions flex flex-wrap gap-4 justify-center md:justify-start bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-6">
                          <button
                            className="btn-edit-profile flex items-center gap-3 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 hover:from-purple-600 hover:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800 text-white py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            onClick={() => setShowProfileForm(true)}
                          >
                            <Edit className="h-5 w-5" />
                            <span className="font-medium">Edit Profile</span>
                          </button>

                          <button
                            className="btn-change-password flex items-center gap-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                            onClick={() => setShowPasswordForm(true)}
                          >
                            <Lock className="h-5 w-5" />
                            <span className="font-medium">Change Password</span>
                          </button>
                        </div>
                      </>
                    )}

                    {/* Enhanced Profile Form */}
                    {showProfileForm && donorProfile && (
                      <div className="profile-form-container bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="form-header bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="form-title text-gray-900 dark:text-white text-xl font-semibold flex items-center">
                            <Edit className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                            Edit Profile
                          </h3>
                          <button
                            className="btn-close w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
                            onClick={() => setShowProfileForm(false)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="form-content max-h-96 overflow-y-auto custom-scrollbar p-6">
                          <form className="profile-edit-form space-y-6" onSubmit={handleProfileUpdate}>
                            <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="form-group">
                                <label htmlFor="firstName" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                  First Name *
                                </label>
                                <input
                                  type="text"
                                  id="firstName"
                                  name="firstName"
                                  defaultValue={donorProfile.firstName}
                                  className="form-input w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
                                  required
                                />
                              </div>

                              <div className="form-group">
                                <label htmlFor="lastName" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                  Last Name *
                                </label>
                                <input
                                  type="text"
                                  id="lastName"
                                  name="lastName"
                                  defaultValue={donorProfile.lastName}
                                  className="form-input w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
                                  required
                                />
                              </div>
                            </div>

                            <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="form-group">
                                <label htmlFor="phone" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                  Phone Number *
                                </label>
                                <input
                                  type="tel"
                                  id="phone"
                                  name="phone"
                                  defaultValue={donorProfile.phone}
                                  className="form-input w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
                                  required
                                />
                              </div>

                              <div className="form-group">
                                <label htmlFor="bloodGroup" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                  Blood Group *
                                </label>
                                <select
                                  id="bloodGroup"
                                  name="bloodGroup"
                                  defaultValue={donorProfile.bloodGroup}
                                  className="form-select w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
                                  required
                                >
                                  <option value="">Select Blood Group</option>
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

                            <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="form-group">
                                <label htmlFor="address" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                  Address *
                                </label>
                                <input
                                  type="text"
                                  id="address"
                                  name="address"
                                  defaultValue={donorProfile.address}
                                  className="form-input w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
                                  required
                                />
                              </div>

                              <div className="form-group">
                                <label htmlFor="addressDescription" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                  Address Details
                                </label>
                                <input
                                  type="text"
                                  id="addressDescription"
                                  name="addressDescription"
                                  defaultValue={donorProfile.addressDescription}
                                  className="form-input w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors"
                                />
                              </div>
                            </div>

                            <div className="form-group">
                              <label htmlFor="bio" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                Bio
                              </label>
                              <textarea
                                id="bio"
                                name="bio"
                                defaultValue={donorProfile.bio}
                                className="form-textarea w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-colors resize-vertical"
                                rows={3}
                                placeholder="Tell us about yourself..."
                              />
                            </div>

                            <div className="form-group">
                              <label htmlFor="userPhoto" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                Profile Photo
                              </label>
                              <div className="image-upload-container">
                                <input
                                  type="file"
                                  id="userPhoto"
                                  name="userPhoto"
                                  className="file-input hidden"
                                  accept="image/*"
                                />
                                <label
                                  htmlFor="userPhoto"
                                  className="upload-area border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                >
                                  <Upload className="h-12 w-12 text-purple-500 dark:text-purple-400 mb-3" />
                                  <span className="upload-text text-gray-600 dark:text-gray-300 text-center font-medium">
                                    Click to upload or drag and drop
                                  </span>
                                  <span className="upload-hint text-gray-500 dark:text-gray-500 text-xs mt-2">
                                    PNG, JPG up to 5MB
                                  </span>
                                </label>
                              </div>
                            </div>

                            <div className="form-actions flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                              <button
                                type="button"
                                className="btn-cancel px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors font-medium"
                                onClick={() => setShowProfileForm(false)}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="btn-save px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 hover:from-purple-600 hover:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800 text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                                disabled={profileLoading}
                              >
                                {profileLoading ? (
                                  <>
                                    <div className="spinner-sm w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Saving...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Save Changes</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Password Form */}
                    {showPasswordForm && (
                      <div className="password-form-container bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="form-header bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="form-title text-gray-900 dark:text-white text-xl font-semibold flex items-center">
                            <Lock className="w-5 h-5 mr-2 text-red-500 dark:text-red-400" />
                            Change Password
                          </h3>
                          <button
                            className="btn-close w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
                            onClick={() => setShowPasswordForm(false)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="form-content max-h-96 overflow-y-auto custom-scrollbar p-6">
                          <form className="password-change-form space-y-6" onSubmit={handlePasswordChange}>
                            {/* Current Password Field */}
                            <div className="form-group">
                              <label htmlFor="currentPassword" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                Current Password *
                              </label>
                              <div className="password-input-wrapper relative">
                                <input
                                  type={showCurrentPassword ? "text" : "password"}
                                  id="currentPassword"
                                  name="currentPassword"
                                  value={passwordForm.currentPassword}
                                  onChange={handlePasswordFormChange}
                                  className="form-input password-input w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-colors"
                                  required
                                />
                                <button
                                  type="button"
                                  className="password-visibility-toggle absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </div>

                            {/* New Password Field */}
                            <div className="form-group">
                              <label htmlFor="newPassword" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                New Password *
                              </label>
                              <div className="password-input-wrapper relative">
                                <input
                                  type={showNewPassword ? "text" : "password"}
                                  id="newPassword"
                                  name="newPassword"
                                  value={passwordForm.newPassword}
                                  onChange={handlePasswordFormChange}
                                  className={`form-input password-input w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-colors ${passwordForm.newPassword && !passwordValidation.isValid
                                    ? 'border-red-300 dark:border-red-700'
                                    : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                  required
                                />
                                <button
                                  type="button"
                                  className="password-visibility-toggle absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>

                              {/* Password Strength Indicator */}
                              {passwordForm.newPassword && (
                                <div className="password-strength-container mt-3">
                                  <div className="password-strength-indicator">
                                    <div className="strength-bar-container h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                      <div
                                        className={`strength-bar h-full rounded-full transition-all duration-300 ${!passwordForm.newPassword ? '' :
                                          passwordValidation.isValid ? 'bg-green-500 dark:bg-green-400' :
                                            Object.values(passwordValidation.requirements).filter(Boolean).length >= 3 ? 'bg-yellow-500 dark:bg-yellow-400' :
                                              'bg-red-500 dark:bg-red-400'
                                          }`}
                                        style={{
                                          width: `${passwordForm.newPassword ?
                                            Math.max(20, (Object.values(passwordValidation.requirements).filter(Boolean).length / 5) * 100)
                                            : 0}%`
                                        }}
                                      />
                                    </div>
                                    <div className="flex justify-between mt-2">
                                      <span className={`strength-label text-xs font-medium ${!passwordForm.newPassword ? 'text-gray-500 dark:text-gray-400' :
                                        passwordValidation.isValid ? 'text-green-600 dark:text-green-400' :
                                          Object.values(passwordValidation.requirements).filter(Boolean).length >= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                                            'text-red-600 dark:text-red-400'
                                        }`}>
                                        {!passwordForm.newPassword ? 'Password strength' :
                                          passwordValidation.isValid ? 'Strong password' :
                                            Object.values(passwordValidation.requirements).filter(Boolean).length >= 3 ? 'Medium strength' :
                                              'Weak password'}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {Object.values(passwordValidation.requirements).filter(Boolean).length}/5 requirements met
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Password Requirements */}
                            <div className="password-requirements-container bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <h4 className="requirements-title text-gray-700 dark:text-gray-300 font-medium mb-3 text-sm">
                                Password Requirements:
                              </h4>
                              <ul className="requirements-list space-y-2">
                                {[
                                  { key: 'minLength', text: 'At least 8 characters' },
                                  { key: 'hasUpperCase', text: 'At least one uppercase letter (A-Z)' },
                                  { key: 'hasLowerCase', text: 'At least one lowercase letter (a-z)' },
                                  { key: 'hasDigit', text: 'At least one number (0-9)' },
                                  { key: 'hasSpecialChar', text: 'At least one special character (!@#$%^&*)' }
                                ].map(requirement => (
                                  <li key={requirement.key} className={`flex items-center gap-2 text-sm transition-colors ${passwordValidation.requirements[requirement.key]
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                    <CheckCircle className={`h-4 w-4 ${passwordValidation.requirements[requirement.key]
                                      ? 'text-green-500 dark:text-green-400'
                                      : 'text-gray-300 dark:text-gray-600'
                                      }`} />
                                    <span>{requirement.text}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="form-group">
                              <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                Confirm New Password *
                              </label>
                              <div className="password-input-wrapper relative">
                                <input
                                  type={showConfirmPassword ? "text" : "password"}
                                  id="confirmPassword"
                                  name="confirmPassword"
                                  value={passwordForm.confirmPassword}
                                  onChange={handlePasswordFormChange}
                                  className={`form-input password-input w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-colors ${passwordForm.confirmPassword && !passwordsMatch
                                    ? 'border-red-300 dark:border-red-700'
                                    : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                  required
                                />
                                <button
                                  type="button"
                                  className="password-visibility-toggle absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>

                              {/* Password Match Indicator */}
                              {passwordForm.confirmPassword && (
                                <div className="mt-2">
                                  {!passwordsMatch ? (
                                    <div className="password-mismatch-warning flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                                      <AlertCircle className="h-4 w-4" />
                                      <span>Passwords don't match</span>
                                    </div>
                                  ) : (
                                    <div className="password-match-indicator flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                                      <CheckCircle className="h-4 w-4" />
                                      <span>Passwords match</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="form-actions flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                              <button
                                type="button"
                                className="btn-cancel px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors font-medium"
                                onClick={() => setShowPasswordForm(false)}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className={`btn-save px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl ${(profileLoading || !passwordValidation.isValid || !passwordsMatch)
                                  ? 'bg-red-400/70 dark:bg-red-700/70 cursor-not-allowed text-white/80 dark:text-white/80'
                                  : 'bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white'
                                  }`}
                                disabled={profileLoading || !passwordValidation.isValid || !passwordsMatch}
                              >
                                {profileLoading ? (
                                  <>
                                    <div className="spinner-sm w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Updating...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Update Password</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showNotificationsModal && (
          <div className="popup-overlay fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="popup-container notifications-popup bg-white dark:bg-gray-900 rounded-xl shadow-xl dark:shadow-black/30 w-11/12 max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
              {/* Enhanced Notifications Header */}
              <div className="popup-header bg-gradient-to-r from-yellow-600 to-yellow-400 dark:from-yellow-800 dark:to-yellow-600 flex justify-between items-center p-4 border-b border-yellow-400/20 dark:border-yellow-800/30">
                <div className="popup-title-container flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-white" />
                  <h2 className="popup-title text-white text-xl font-bold">Notifications</h2>
                  {unreadNotifications > 0 && (
                    <span className="ml-3 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {unreadNotifications} unread
                    </span>
                  )}
                </div>

                <div className="popup-actions flex items-center gap-3">
                  {notificationToast.show && (
                    <div className="toast-notification fixed top-4 right-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-6 py-4 rounded-lg shadow-xl dark:shadow-black/30 border border-gray-200 dark:border-gray-700 z-[60] animate-slideIn">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${notificationToast.type === 'pickup' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                        <div>
                          <div className="font-semibold text-sm">New Request!</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">{notificationToast.message}</div>
                        </div>
                        <button
                          onClick={() => setNotificationToast(prev => ({ ...prev, show: false }))}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    className="popup-close-btn w-8 h-8 rounded-full bg-white/20 dark:bg-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-700/50 flex items-center justify-center text-white transition-transform hover:rotate-90"
                    onClick={() => setShowNotificationsModal(false)}
                    aria-label="Close notifications"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Enhanced Notifications Content */}
              <div className="popup-content notifications-content flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
                {notificationsLoading ? (
                  <div className="loading-indicator flex flex-col items-center justify-center p-12 text-gray-600 dark:text-gray-400">
                    <div className="loading-spinner w-12 h-12 border-4 border-yellow-200 dark:border-yellow-900/30 border-t-yellow-600 dark:border-t-yellow-500 rounded-full animate-spin mb-4"></div>
                    <span className="text-lg">Loading notifications...</span>
                  </div>
                ) : notificationsError ? (
                  <div className="error-message flex items-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 m-6 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{notificationsError}</span>
                  </div>
                ) : (
                  <div className="notifications-section p-6 overflow-y-auto h-full custom-scrollbar">
                    {notifications.length > 0 ? (
                      <div className="notifications-enhanced-grid space-y-4">
                        {notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`notification-enhanced-card bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-lg dark:shadow-gray-900/30 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-gray-900/50 ${!notification.isRead ? 'border-l-4 border-l-yellow-500 bg-yellow-50/30 dark:bg-yellow-900/10' : ''
                              }`}
                          >
                            {/* Notification Header */}
                            <div className="notification-card-header flex justify-between items-start mb-4">
                              <div className="notification-type-info flex items-center">
                                <div className={`notification-icon p-2 rounded-full mr-3 ${notification.type === 'PICKUP_REQUEST'
                                  ? 'bg-blue-100 dark:bg-blue-900/30'
                                  : notification.type === 'FOOD_REQUEST'
                                    ? 'bg-green-100 dark:bg-green-900/30'
                                    : 'bg-purple-100 dark:bg-purple-900/30'
                                  }`}>
                                  {notification.type === 'PICKUP_REQUEST' ? (
                                    <Truck className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                  ) : notification.type === 'FOOD_REQUEST' ? (
                                    <Users className="h-5 w-5 text-green-500 dark:text-green-400" />
                                  ) : (
                                    <Bell className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="notification-title text-gray-900 dark:text-white font-semibold text-lg">
                                    {notification.title}
                                  </h3>
                                  <div className="notification-meta flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                                    {notification.requesterName && (
                                      <>
                                        <span className="mx-2">•</span>
                                        <span>From: {notification.requesterName}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="notification-badges flex items-center space-x-2">
                                {!notification.isRead && (
                                  <span className="unread-badge bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-yellow-200 dark:border-yellow-800">
                                    New
                                  </span>
                                )}
                                <span className={`type-badge px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${notification.type === 'PICKUP_REQUEST'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                  : notification.type === 'FOOD_REQUEST'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                                  }`}>
                                  {notification.type.replace('_', ' ')}
                                </span>
                              </div>
                            </div>

                            {/* Notification Message */}
                            <div className="notification-message mb-4">
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {notification.message}
                              </p>
                            </div>

                            {/* Additional Data Display */}
                            {notification.additionalData && (
                              <div className="notification-details bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-4 border-l-3 border-primary">
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                                  <Package className="h-4 w-4 mr-1 text-primary" />
                                  Request Details
                                </h4>
                                {(() => {
                                  try {
                                    const data = JSON.parse(notification.additionalData);
                                    return (
                                      <div className="grid grid-cols-2 gap-3 text-sm">
                                        {data.donationName && (
                                          <div>
                                            <span className="text-gray-500 dark:text-gray-400">Item:</span>
                                            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{data.donationName}</span>
                                          </div>
                                        )}
                                        {data.quantity && (
                                          <div>
                                            <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                                            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{data.quantity}</span>
                                          </div>
                                        )}
                                        {data.foodType && (
                                          <div>
                                            <span className="text-gray-500 dark:text-gray-400">Food Type:</span>
                                            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{data.foodType}</span>
                                          </div>
                                        )}
                                        {data.peopleCount && (
                                          <div>
                                            <span className="text-gray-500 dark:text-gray-400">People:</span>
                                            <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{data.peopleCount}</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  } catch (e) {
                                    return <span className="text-gray-500 dark:text-gray-400 text-sm">Additional details available</span>;
                                  }
                                })()}
                              </div>
                            )}

                            {/* Enhanced Action Buttons */}
                            <div className="notification-actions flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="notification-action-buttons flex gap-2">
                                {(notification.type === 'PICKUP_REQUEST' || notification.type === 'FOOD_REQUEST') && (
                                  <button
                                    className="btn-view-details bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                    onClick={() => handleViewNotificationDetails(notification)}
                                  >
                                    <Eye className="h-4 w-4 mr-1.5" />
                                    <span>View Details</span>
                                  </button>
                                )}

                                {!notification.isRead && (
                                  <button
                                    className="btn-mark-read bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                    onClick={() => handleMarkNotificationAsRead(notification.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1.5" />
                                    <span>Mark Read</span>
                                  </button>
                                )}
                              </div>

                              <button
                                className="btn-delete-notification bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state-container flex flex-col items-center justify-center py-20 px-8 text-center bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="empty-icon-container bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 p-6 rounded-full mb-6">
                          <Bell className="h-16 w-16 text-yellow-500 dark:text-yellow-400" />
                        </div>
                        <h3 className="empty-state-title text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                          {selectedNotificationTab === 'unread' ? 'No Unread Notifications' :
                            selectedNotificationTab === 'read' ? 'No Read Notifications' : 'No Notifications Yet'}
                        </h3>
                        <p className="empty-state-message text-gray-600 dark:text-gray-400 text-base max-w-md leading-relaxed">
                          {selectedNotificationTab === 'unread'
                            ? 'All your notifications have been read!'
                            : selectedNotificationTab === 'read'
                              ? "You haven't read any notifications yet."
                              : 'You\'ll receive notifications here when users send pickup requests or food requests.'
                          }
                        </p>
                        <div className="empty-state-features mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="feature-item flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            <span>Real-time updates</span>
                          </div>
                          <div className="feature-item flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            <span>Request management</span>
                          </div>
                          <div className="feature-item flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            <span>Smart filtering</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Notification Details Modal */}
        {showNotificationDetails && selectedNotificationForDetails && (
          <NotificationDetailsModal
            notification={selectedNotificationForDetails}
            onClose={() => {
              setShowNotificationDetails(false);
              setSelectedNotificationForDetails(null);
            }}
          />
        )}

        {showRequestsModal && <DonationRequestsModal />}

        {/* Purchase Modal - MUST be present */}
        {showPurchaseModal && selectedFoodForPurchase && (
          <PurchaseDonateModal
            food={selectedFoodForPurchase}
            onClose={() => setShowPurchaseModal(false)}
            onSubmit={handlePurchaseSubmit}
          />
        )}

        {showAllFoodItems && (
          <AllFoodItemsView
            items={allFoodItems}
            onDonate={handleDirectDonate}
            onViewDetails={handleViewDetails}
            onClose={() => setShowAllFoodItems(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Edit, Trash2, Search, ShoppingBag, Clock, X, PauseCircle, PlayCircle,
  MapPin, DollarSign, Store, Calendar, Tag, Coffee, User, AlertCircle, ArrowRight, Activity,
  Award, ChevronDown, Heart, MessageSquare, History, Settings, Phone, Mail, Send, Eye,
  CheckCircle, Camera, Upload, Save, CreditCard, Briefcase, Wallet, LogOut, Users, Package
} from 'lucide-react';

import '../style/MerchantDashboardPage.css';
const MerchantDashboard = () => {

  const BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://foodbridgebangladesh-9ehu.onrender.com';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [foodItems, setFoodItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const avatarInputRef = useRef(null);
  const [feesLoading, setFeesLoading] = useState(false);
  const [donationsOpen, setDonationsOpen] = useState(false);
  const [modalSource, setModalSource] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedMainTab, setSelectedMainTab] = useState('listings');
  const [donationsSubTab, setDonationsSubTab] = useState('active');
  const [merchantDonations, setMerchantDonations] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [rejectedDonations, setRejectedDonations] = useState([]);
  const [completedDonations, setCompletedDonations] = useState([]);
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationError, setDonationError] = useState(null);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedDonationForRequests, setSelectedDonationForRequests] = useState(null);
  const [donationRequests, setDonationRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [salesHistoryOpen, setSalesHistoryOpen] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState('');


  const [selectedPaymentMonth, setSelectedPaymentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [mobilePaymentMethod, setMobilePaymentMethod] = useState('bkash');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const [currentItem, setCurrentItem] = useState({
    id: null,
    name: '',
    description: '',
    foodCategory: 'restaurant',
    foodType: '',
    price: '',
    quantity: 1,
    expiryDate: '',
    location: '',
    storeName: '',
    makingTime: '',
    deliveryTime: '',
    dietaryInfo: [],
    imageUrl: '',
    isPaused: false
  });
  // State for donation management
  const [viewDonationModalOpen, setViewDonationModalOpen] = useState(false);
  const [editDonationModalOpen, setEditDonationModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState(null);

  const [statsVisible, setStatsVisible] = useState(true);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [donationItem, setDonationItem] = useState(null);
  const [donationData, setDonationData] = useState({
    organization: '',
    quantity: 1,
    notes: '',
    pickupDate: '',
    pickupTime: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: ''
  });
  //
  // Add these states to MerchantDashboard component
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageStats, setMessageStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    readMessages: 0
  });

  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [messageTab, setMessageTab] = useState('received'); // 'sent' or 'received'
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [selectedMessageForView, setSelectedMessageForView] = useState(null);
  const [showMessageViewModal, setShowMessageViewModal] = useState(false);

  //
  // ADD THESE TWO NEW FUNCTIONS
  const fetchMerchantSentMessages = async () => {
    if (!merchantId) return;

    setMessagesLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/merchant/messages/${merchantId}/sent`);

      if (response.ok) {
        const data = await response.json();
        setSentMessages(data);
        console.log('Fetched sent messages:', data);
      } else {
        console.error('Failed to fetch sent messages');
      }
    } catch (error) {
      console.error('Error fetching sent messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchMerchantReceivedMessages = async () => {
    if (!merchantId) return;

    setMessagesLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/merchant/messages/${merchantId}/received`);

      if (response.ok) {
        const data = await response.json();
        setReceivedMessages(data);
        console.log('Fetched received messages:', data);
      } else {
        console.error('Failed to fetch received messages');
      }
    } catch (error) {
      console.error('Error fetching received messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchMerchantMessageStats = async () => {
    if (!merchantId) return;

    try {
      const response = await fetch(`${BASE_URL}/api/merchant/messages/${merchantId}/stats`);

      if (response.ok) {
        const stats = await response.json();
        setMessageStats(stats);
      }
    } catch (error) {
      console.error('Error fetching message stats:', error);
    }
  };

  const handleReplyMessage = async () => {
    if (!replyContent.trim() || !selectedMessage) return;

    try {
      const authData = JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser'));
      const merchantEmail = authData?.email || '';

      const formData = new FormData();
      formData.append('merchantId', merchantId);
      formData.append('merchantEmail', merchantEmail);
      formData.append('replyContent', replyContent);

      const response = await fetch(`${BASE_URL}/api/merchant/messages/reply/${selectedMessage.id}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // Add reply to the thread
        const updatedMessages = messages.map(msg => {
          if (msg.id === selectedMessage.id) {
            const reply = {
              id: `REPLY-${Date.now()}`,
              sender: 'Me',
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: replyContent
            };
            return {
              ...msg,
              thread: [...msg.thread, reply]
            };
          }
          return msg;
        });

        setMessages(updatedMessages);
        setReplyContent('');

        const updatedSelectedMessage = updatedMessages.find(msg => msg.id === selectedMessage.id);
        setSelectedMessage(updatedSelectedMessage);

        alert('Reply sent successfully!');
      } else {
        alert('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply');
    }
  };
  //End message 
  //
  const [merchantId, setMerchantId] = useState(() => {
    try {
      const authUserJSON = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');

      if (authUserJSON) {
        const authUser = JSON.parse(authUserJSON);
        if (authUser && authUser.userId) {
          localStorage.setItem('merchantId', authUser.userId);
          return authUser.userId;
        }
      }
      return null;
    } catch (error) {
      console.error('Error retrieving merchant ID:', error);
      return null;
    }
  });
  //
  const [overviewStats, setOverviewStats] = useState({
    totalItemsSold: 0,
    totalRevenue: 0,
    activeListings: 0,
    loading: true
  });

  useEffect(() => {
    if (merchantId && foodItems.length >= 0) {
      fetchOverviewStats();
    }
  }, [merchantId, foodItems]);

  // REPLACE getTotalItemsSaved function with:
  const getTotalItemsSold = () => {
    return overviewStats.totalItemsSold;
  };

  //

  useEffect(() => {
    // Auto-fetch message stats on component mount and when merchant ID is available
    if (merchantId) {
      fetchMerchantMessageStats();

      // Set up periodic refresh every 30 seconds for real-time updates
      const messageStatsInterval = setInterval(() => {
        if (!messagesOpen) { // Only refresh when messages modal is not open
          fetchMerchantMessageStats();
        }
      }, 30000);

      return () => clearInterval(messageStatsInterval);
    }
  }, [merchantId]);

  const handleSalesHistory = () => {
    setSalesHistoryOpen(true);
    setMessagesOpen(false);
    setProfileOpen(false);
    setFeesOpen(false);

    // Fetch sales data when opening
    fetchSalesHistory();
  };

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm('Are you sure you want to permanently delete this sale record? This action cannot be undone.')) {
      return;
    }

    try {
      console.log(`Deleting sale ID: ${saleId} for merchant ID: ${merchantId}`);

      const response = await fetch(
        `${BASE_URL}/api/merchant/sales/${saleId}?merchantId=${merchantId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove the deleted sale from the state
        setSalesHistory(prevSales =>
          prevSales.filter(sale => sale.id !== saleId)
        );

        alert('Sale record deleted successfully');
        console.log(`Successfully deleted sale ID: ${saleId}`);
      } else {
        throw new Error(data.message || 'Failed to delete sale');
      }

    } catch (error) {
      console.error('Error deleting sale:', error);
      alert(`Failed to delete sale record: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSaleStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'status-completed';
      case 'PENDING':
        return 'status-pending';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  };


  // 
  const fileInputRef = useRef(null);
  //
  const [imageFile, setImageFile] = useState(null);
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  useEffect(() => {
    const checkAuthenticationStatus = () => {
      const authUser = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
      const merchantId = localStorage.getItem('merchantId');
      console.log('Authentication Check:', {
        authUser: !!authUser,
        merchantId: merchantId
      });

      if (!authUser || !merchantId) {
        window.location.href = '/login';
        return false;
      }
      return true;
    };

    checkAuthenticationStatus();
  }, []);



  const fetchOverviewStats = async () => {
    if (!merchantId) {
      console.error('No merchant ID available for stats fetch');
      return;
    }

    try {
      console.log(`Fetching overview stats for merchant ID: ${merchantId}`);

      // Fetch sales data for revenue and items sold
      const salesResponse = await fetch(`${BASE_URL}/api/merchant/sales/merchant/${merchantId}`);
      let totalItemsSold = 0;
      let totalRevenue = 0;

      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        console.log('Sales data for stats:', salesData);

        // Calculate total items sold and revenue from actual sales
        totalItemsSold = salesData.reduce((total, sale) => {
          return total + (sale.quantitySold || 0);
        }, 0);

        totalRevenue = salesData.reduce((total, sale) => {
          return total + parseFloat(sale.totalAmount || 0);
        }, 0);
      } else {
        console.warn('Failed to fetch sales data for stats');
      }

      // Calculate active listings from current food items
      const activeListings = foodItems.filter(item => !item.isPaused).length;

      // Update stats state
      setOverviewStats({
        totalItemsSold,
        totalRevenue,
        activeListings,
        loading: false
      });

      console.log('Updated overview stats:', {
        totalItemsSold,
        totalRevenue: totalRevenue.toFixed(2),
        activeListings
      });

    } catch (error) {
      console.error('Error fetching overview stats:', error);
      setOverviewStats(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchSalesHistory = async () => {
    if (!merchantId) {
      console.error('No merchant ID available for sales fetch');
      setSalesError('Invalid merchant ID. Please login again.');
      return;
    }

    setSalesLoading(true);
    setSalesError('');

    try {
      console.log(`Fetching sales history for merchant ID: ${merchantId}`);
      const response = await fetch(`${BASE_URL}/api/merchant/sales/merchant/${merchantId}/detailed`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        setSalesError(`Error: ${errorData.message || 'Failed to load sales history'}`);
        return;
      }

      const data = await response.json();
      console.log('Sales data received:', data);

      if (data.success && data.sales) {
        setSalesHistory(data.sales);
        console.log(`Loaded ${data.sales.length} sales records`);
      } else {
        setSalesError('No sales data received from server');
      }

    } catch (error) {
      console.error('Error fetching sales history:', error);
      setSalesError('Failed to load sales history. Please check your connection.');
    } finally {
      setSalesLoading(false);
    }
  };


  // MODIFY your existing profile useEffect (around line 450)
  useEffect(() => {
    const fetchMerchantProfile = async () => {
      if (!merchantId) {
        console.error('No merchant ID available for profile fetch');
        setProfileError('User authentication issue. Please log out and log in again.');
        return;
      }

      setProfileLoading(true);
      setProfileError('');

      try {
        console.log(`Attempting to fetch profile with merchantId: ${merchantId}`);
        const response = await fetch(`${BASE_URL}/api/merchant/profile?merchantId=${merchantId}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to fetch merchant profile:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            merchantId: merchantId
          });

          if (response.status === 404) {
            setProfileError('Your merchant profile was not found. Please contact support.');
          } else {
            setProfileError(`Failed to load profile data (${response.status}). Please try again later.`);
          }
          return;
        }

        const merchantData = await response.json();
        setUserProfile({
          name: `${merchantData.ownerFirstName} ${merchantData.ownerLastName}`,
          email: merchantData.email,
          phone: merchantData.phoneNumber || '',
          address: merchantData.businessAddress || '',
          storeName: merchantData.businessName || '',
          bio: merchantData.businessDescription || '',
          avatar: merchantData.logoBase64 ?
            `data:${merchantData.logoType || 'image/jpeg'};base64,${merchantData.logoBase64}` :
            'https://randomuser.me/api/portraits/men/41.jpg',
          businessType: merchantData.businessType || '',
          businessLicenseNumber: merchantData.businessLicenseNumber || '',
          city: merchantData.city || '',
          stateProvince: merchantData.stateProvince || '',
          postalCode: merchantData.postalCode || ''
        });

        console.log('Successfully loaded merchant profile data');

      } catch (error) {
        console.error('Error fetching merchant profile:', error);
        setProfileError('An unexpected error occurred while loading your profile. Please try again later.');
      } finally {
        setProfileLoading(false);
      }
    };

    if (profileOpen) {
      fetchMerchantProfile();
    }
  }, [merchantId, profileOpen]);

  useEffect(() => {
    const fetchMerchantProfileOnLoad = async () => {
      if (!merchantId) {
        console.error('No merchant ID available for immediate profile fetch');
        return;
      }

      // Don't reload if we already have the profile data
      if (userProfile.name && userProfile.name !== '') {
        return;
      }

      try {
        console.log(`Fetching profile immediately for merchantId: ${merchantId}`);
        const response = await fetch(`${BASE_URL}/api/merchant/profile?merchantId=${merchantId}`);

        if (!response.ok) {
          console.error(`Failed to fetch merchant profile on load: ${response.status}`);
          return;
        }

        const merchantData = await response.json();
        setUserProfile({
          name: `${merchantData.ownerFirstName} ${merchantData.ownerLastName}`,
          email: merchantData.email,
          phone: merchantData.phoneNumber || '',
          address: merchantData.businessAddress || '',
          storeName: merchantData.businessName || '',
          bio: merchantData.businessDescription || '',
          avatar: merchantData.logoBase64 ?
            `data:${merchantData.logoType || 'image/jpeg'};base64,${merchantData.logoBase64}` :
            'https://randomuser.me/api/portraits/men/41.jpg',
          businessType: merchantData.businessType || '',
          businessLicenseNumber: merchantData.businessLicenseNumber || '',
          city: merchantData.city || '',
          stateProvince: merchantData.stateProvince || '',
          postalCode: merchantData.postalCode || ''
        });

        console.log('Profile loaded immediately on dashboard load');

      } catch (error) {
        console.error('Error fetching profile on load:', error);
      }
    };

    // Fetch profile immediately when merchantId is available
    if (merchantId) {
      fetchMerchantProfileOnLoad();
    }
  }, [merchantId]); // Only depend on merchantId, not profileOpen

  useEffect(() => {
    if (!merchantId) {
      console.error('No merchant ID available - redirecting to login');
      window.location.replace('/login');
    }
  }, []);

  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    storeName: '',
    bio: '',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg', // Default avatar
    businessType: '',
    businessLicenseNumber: '',
    city: '',
    stateProvince: '',
    postalCode: ''
  });


  // ==========================================
  // NEW STATE FOR PAY FEES FEATURE
  // ==========================================
  const [feesOpen, setFeesOpen] = useState(false);
  const [feeData, setFeeData] = useState({
    currentBalance: 0,
    dueDate: '',
    platformFee: 0,
    transactionFees: 0,
    promotionalFees: 0,
    previousBalance: 0,
    paymentHistory: []
  });

  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        if (!merchantId) {
          console.error('No merchant ID available');
          return;
        }

        console.log(`Fetching food items with merchantId: ${merchantId}`);

        const response = await fetch(`${BASE_URL}/api/merchant/food-items?merchantId=${merchantId}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to fetch food items: ${response.status} - ${errorText}`);
          alert("Failed to load your food listings. Please try again later.");
          return;
        }

        const foodItemsData = await response.json();
        const processedFoodItems = foodItemsData.map(item => ({
          ...item,
          foodCategory: item.foodCategory?.toLowerCase() || 'other',
          imageUrl: item.imageBase64 && item.imageContentType
            ? `data:${item.imageContentType};base64,${item.imageBase64}`
            : null
        }));

        setFoodItems(processedFoodItems);

      } catch (error) {
        console.error('Error fetching food items:', error);
        alert("Error connecting to server. Please check your connection and try again.");
      }
    };
    if (merchantId) {
      fetchFoodItems();
    }
  }, [merchantId]);

  const fetchMerchantDonations = async () => {
    if (!merchantId) {
      console.error('No merchant ID available');
      return;
    }

    setDonationLoading(true);
    setDonationError(null);

    try {
      console.log(`Fetching ${donationsSubTab} donations for merchant ID: ${merchantId}`);

      let statusValue;
      switch (donationsSubTab) {
        case 'active':
          statusValue = 'Active';
          break;
        case 'pending':
          statusValue = 'Pending';
          break;
        case 'rejected':
          statusValue = 'Rejected';
          break;
        case 'completed':
          statusValue = 'Completed';
          break;
        default:
          statusValue = 'Active';
      }

      const url = `${BASE_URL}/api/merchant/donate/merchant/${merchantId}/status/${statusValue}`;

      console.log("Fetching from URL:", url); // Debug log to verify URL

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch donations: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Received ${data.length} ${donationsSubTab} donations:`, data);
      const formattedDonations = data.map(donation => ({
        id: donation.id,
        foodName: donation.foodName || 'Unnamed Donation',
        category: donation.category?.label || donation.category || 'Uncategorized',
        quantity: donation.quantity || 'Unknown',
        expiry: donation.expiryDate,
        location: donation.location || 'No location',
        donorType: donation.donorType || 'Merchant',
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
      switch (donationsSubTab) {
        case 'active':
          setMerchantDonations(formattedDonations);
          break;
        case 'pending':
          setPendingDonations(formattedDonations);
          break;
        case 'rejected':
          setRejectedDonations(formattedDonations);
          break;
        case 'completed':
          setCompletedDonations(formattedDonations);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${donationsSubTab} donations:`, error);
      setDonationError(error.message);
    } finally {
      setDonationLoading(false);
    }
  };

  useEffect(() => {
    if ((donationsOpen || selectedMainTab === 'donations') && merchantId) {
      fetchMerchantDonations();
    }
  }, [donationsOpen, selectedMainTab, donationsSubTab, merchantId]);


  const handleCheckRequests = async (donation) => {
    try {
      setRequestsLoading(true);
      setSelectedDonationForRequests(donation);

      console.log(`Checking requests for donation ID: ${donation.id}, merchantId: ${merchantId}`);
      console.log("Stored merchantId in localStorage:", localStorage.getItem('merchantId'));
      console.log("Stored merchantId in sessionStorage:", sessionStorage.getItem('merchantId'));

      if (!merchantId) {
        throw new Error('Merchant ID is missing or invalid');
      }

      const url = `${BASE_URL}/api/merchant/donations/${donation.id}/requests?merchantId=${merchantId}`;
      console.log("Request URL:", url);

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText || response.statusText}`);
      }
      const data = await response.json();
      console.log('Complete response data:', data);

      if (!Array.isArray(data)) {
        console.error('Expected array response but received:', typeof data, data);
        throw new Error('Invalid response format: expected an array of requests');
      }

      const pendingRequests = data.filter(request => {
        if (!request.status) {
          console.warn('Request missing status field:', request);
          return false;
        }

        const status = request.status.toUpperCase();
        const isPending = status === "PENDING";

        console.log(`Request ID ${request.id}: status = "${request.status}" → isPending = ${isPending}`);
        return isPending;
      });

      console.log(`Found ${pendingRequests.length} pending requests out of ${data.length} total requests`);
      setDonationRequests(pendingRequests);

      setShowRequestsModal(true);
      if (donationsOpen) {
        setDonationsOpen(false);
      }
    } catch (error) {
      console.error('Error processing requests:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Failed to load requests: ${errorMessage}\n\nPlease check the console for details and try again.`);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId, status, note = '') => {
    try {
      setRequestsLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/merchant/requests/${requestId}/status?merchantId=${merchantId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: status,
            responseNote: note
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update request status: ${response.statusText}`);
      }
      if (selectedDonationForRequests) {
        const refreshResponse = await fetch(
          `${BASE_URL}/api/merchant/donations/${selectedDonationForRequests.id}/requests?merchantId=${merchantId}`,
          { credentials: 'include' }
        );

        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json();
          const pendingRequests = refreshedData.filter(request => request.status === "PENDING");
          setDonationRequests(pendingRequests);
        }
      }

      if (donationRequests.length === 0) {
        setShowRequestsModal(false);
      }

      fetchMerchantDonations();

    } catch (error) {
      console.error('Error updating request status:', error);
      alert('Failed to update request status: ' + error.message);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setCurrentItem({ ...item });
    } else {
      setCurrentItem({
        id: null,
        name: '',
        description: '',
        foodCategory: 'restaurant',
        foodType: '',
        price: '',
        quantity: 1,
        expiryDate: '',
        location: '',
        storeName: '',
        makingTime: '',
        deliveryTime: '',
        dietaryInfo: [],
        imageUrl: '',
        isPaused: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({
      ...currentItem,
      [name]: value
    });
  };

  const handleDietaryChange = (option, context = 'donation') => {
    if (context === 'foodItem') {
      let updatedDietaryInfo = [...(currentItem.dietaryInfo || [])];
      const isSelected = updatedDietaryInfo.includes(option);

      if (isSelected) {
        updatedDietaryInfo = updatedDietaryInfo.filter(item => item !== option);
      } else {
        updatedDietaryInfo.push(option);
      }

      setCurrentItem({
        ...currentItem,
        dietaryInfo: updatedDietaryInfo
      });
    } else {
      // Handle donation context (existing functionality)
      let updatedDietaryInfo = [...(donationData.dietaryInfo || [])];
      const isSelected = updatedDietaryInfo.includes(option);

      if (isSelected) {
        updatedDietaryInfo = updatedDietaryInfo.filter(item => item !== option);
      } else {
        updatedDietaryInfo.push(option);
      }

      setDonationData({
        ...donationData,
        dietaryInfo: updatedDietaryInfo
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started");

    const formData = new FormData();

    if (currentItem.id) {
      formData.append('id', currentItem.id);
      console.log(`Updating existing item with ID: ${currentItem.id}`);
    } else {
      console.log("Creating new food item");
    }

    formData.append('name', currentItem.name);
    formData.append('description', currentItem.description);
    formData.append('foodCategory', currentItem.foodCategory.toUpperCase());
    formData.append('foodType', currentItem.foodType);
    formData.append('price', currentItem.price);
    formData.append('quantity', currentItem.quantity);
    formData.append('expiryDate', currentItem.expiryDate);
    formData.append('location', currentItem.location);
    formData.append('storeName', currentItem.storeName);
    formData.append('makingTime', currentItem.makingTime);
    formData.append('deliveryTime', currentItem.deliveryTime);

    if (currentItem.dietaryInfo && currentItem.dietaryInfo.length > 0) {
      currentItem.dietaryInfo.forEach(item => {
        formData.append('dietaryInfo', item);
      });
    }

    formData.append('isPaused', currentItem.isPaused === true ? 'true' : 'false');

    if (!merchantId) {
      alert('You need to be logged in with a valid merchant account to create listings.');
      return;
    }
    formData.append('merchantId', merchantId.toString());
    if (imageFile) {
      console.log(`Appending image file: ${imageFile.name}, size: ${imageFile.size} bytes`);
      formData.append('image', imageFile);
    } else {
      console.log("No new image file to upload");
    }
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      let response;
      let url;

      if (currentItem.id) {

        url = `${BASE_URL}/api/merchant/food-items/${currentItem.id}?merchantId=${merchantId}`;
        console.log(`PUT request to: ${url}`);

        response = await fetch(url, {
          method: 'PUT',
          body: formData
        });
      } else {
        url = `${BASE_URL}/api/merchant/food-items?merchantId=${merchantId}`;
        console.log(`POST request to: ${url}`);

        response = await fetch(url, {
          method: 'POST',
          body: formData
        });
      }
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        console.error('Status:', response.status, response.statusText);
        alert(`Failed to save food item: ${errorText || response.statusText}`);
        return;
      }

      const updatedItem = await response.json();
      console.log('Item saved successfully:', updatedItem);
      const processedItem = {
        ...updatedItem,
        foodCategory: updatedItem.foodCategory?.toLowerCase() || 'other', // Add null check
        imageUrl: updatedItem.imageBase64 && updatedItem.imageContentType
          ? `data:${updatedItem.imageContentType};base64,${updatedItem.imageBase64}`
          : null
      };

      if (currentItem.id) {
        console.log(`Updating existing item in state with ID: ${processedItem.id}`);
        setFoodItems(prevItems =>
          prevItems.map(item => item.id === processedItem.id ? processedItem : item)
        );
      } else {

        console.log(`Adding new item to state with ID: ${processedItem.id}`);
        setFoodItems(prevItems => [processedItem, ...prevItems]);
      }
      setIsModalOpen(false);
      setImageFile(null);
      console.log("Refreshing full food items list");
      try {
        const refreshResponse = await fetch(`${BASE_URL}/api/merchant/food-items?merchantId=${merchantId}`);

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          console.log(`Fetched ${refreshData.length} food items in refresh`);

          const mappedData = refreshData.map(item => ({
            ...item,
            foodCategory: item.foodCategory?.toLowerCase() || 'other', // Add null check
            imageUrl: item.imageBase64 && item.imageContentType ? `data:${item.imageContentType};base64,${item.imageBase64}` : null
          }));

          setFoodItems(mappedData);
        } else {
          console.error(`Failed to refresh food items list: ${refreshResponse.status} ${refreshResponse.statusText}`);
        }
      } catch (refreshError) {
        console.error('Error during refresh operation:', refreshError);
      }

    } catch (error) {
      console.error('Network or other error:', error);
      alert(`Error saving food item: ${error.message}`);
    }
  };
  const handleMarkAsCompleted = async (donationId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/merchant/donate/${donationId}/status?merchantId=${merchantId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'Completed'
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark donation as completed: ${response.statusText}`);
      }

      alert('Donation marked as completed successfully');
      fetchMerchantDonations();
    } catch (error) {
      console.error('Error marking donation as completed:', error);
      alert('Failed to mark donation as completed: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`${BASE_URL}/api/merchant/food-items/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setFoodItems(foodItems.filter(item => item.id !== id));
        }
      } catch (error) {
        console.error('Error deleting food item:', error);
      }
    }
  };

  const togglePause = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/merchant/food-items/${id}/toggle-pause`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle pause status');
      }

      const updatedItem = await response.json();
      setFoodItems(prevItems =>
        prevItems.map(item =>
          item.id === id
            ? {
              ...item,
              isPaused: updatedItem.paused,
              foodCategory: updatedItem.foodCategory.toLowerCase()
            }
            : item
        )
      );
    } catch (error) {
      console.error('Error toggling pause status:', error);
      alert('Failed to pause/resume the item. Please try again.');
    }
  };

  const toggleStats = () => {
    setStatsVisible(!statsVisible);
  };

  const handleOpenDonateModal = (item) => {
    setDonationItem(item);

    const maxQuantity = item.remainingQuantity !== undefined
      ? item.remainingQuantity
      : item.quantity;

    setDonationData({
      foodName: item.name,
      description: item.description,
      donationCategory: mapFoodCategoryToDonationCategory(item.foodCategory),
      foodType: item.foodType,
      quantity: 1,
      expiryDate: item.expiryDate,
      preparationDate: new Date().toISOString().split('T')[0],
      location: item.location,
      donorType: item.foodCategory === 'restaurant' ? 'Restaurant' :
        item.foodCategory === 'grocery' ? 'Grocery Store' : 'Other',
      dietaryInfo: item.dietaryInfo || [],
      packaging: '',
      storageInstructions: '',
      notes: '',
      maxQuantity: maxQuantity,
      storeName: item.storeName
    });

    setIsDonateModalOpen(true);
  };

  const mapFoodCategoryToDonationCategory = (foodCategory) => {
    switch (foodCategory) {
      case 'restaurant':
        return 'RESTAURANT_SURPLUS';
      case 'grocery':
        return 'GROCERY_EXCESS';
      default:
        return 'OTHER';
    }
  };


  const handleCloseDonateModal = () => {
    setIsDonateModalOpen(false);
  };

  const handleDonationInputChange = (e) => {
    const { name, value } = e.target;
    setDonationData({
      ...donationData,
      [name]: value
    });
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create donation payload
      const donationPayload = {
        foodItemId: donationItem.id,
        merchantId: merchantId,
        foodName: donationData.foodName,
        description: donationData.description,
        category: donationData.donationCategory,
        quantity: parseInt(donationData.quantity, 10),
        expiryDate: donationData.expiryDate,
        preparationDate: donationData.preparationDate,
        location: donationData.location,
        foodType: donationData.foodType,
        donorType: donationData.donorType,
        dietaryInfo: donationData.dietaryInfo,
        packaging: donationData.packaging,
        storageInstructions: donationData.storageInstructions,
        notes: donationData.notes,
        storeName: donationData.storeName
      };

      console.log("Sending donation payload:", donationPayload);

      const response = await fetch(`${BASE_URL}/api/merchant/donate/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(donationPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || 'Failed to create donation');
      }

      const result = await response.json();

      const savedDonation = result.donation;

      console.log("Saved donation status:", savedDonation.status);

      setIsDonateModalOpen(false);

      alert(`Donation of ${donationData.quantity} ${donationData.foodName}(s) has been successfully created.`);

      // ADDED: Refresh food items with remaining quantities
      fetchFoodItemsWithRemaining();

      setDonationsSubTab('active');

      setTimeout(() => {
        if (selectedMainTab === 'donations' || donationsOpen) {
          fetchMerchantDonations();
        }
      }, 500);

      const formattedDonation = {
        id: savedDonation.id,
        foodName: savedDonation.foodName || 'Unnamed Donation',
        category: savedDonation.category?.label || savedDonation.category || 'Uncategorized',
        quantity: savedDonation.quantity || 'Unknown',
        expiry: savedDonation.expiryDate,
        location: savedDonation.location || 'No location',
        donorType: savedDonation.donorType || 'Merchant',
        status: savedDonation.status,
        preparation: savedDonation.preparationDate,
        packaging: savedDonation.packaging || 'Not specified',
        dietaryInfo: Array.isArray(savedDonation.dietaryInfo)
          ? savedDonation.dietaryInfo.join(', ')
          : 'Not specified',
        storageInstructions: savedDonation.storageInstructions || 'Not specified',
        imageUrl: savedDonation.imageData
          ? `data:${savedDonation.imageContentType || 'image/jpeg'};base64,${savedDonation.imageData}`
          : '/api/placeholder/400/200'
      };

      console.log("Saved donation:", savedDonation);
      console.log("Formatted donation for UI:", formattedDonation);
      console.log("Current merchantDonations state:", merchantDonations);

      if (savedDonation.status && savedDonation.status.toLowerCase().trim() === 'active') {
        setMerchantDonations(prevDonations => [formattedDonation, ...prevDonations]);

        if (selectedMainTab === 'donations' || donationsOpen) {
          setDonationsSubTab('active');
        }
      } else if (savedDonation.status.toLowerCase() === 'pending') {
        setPendingDonations(prevDonations => [formattedDonation, ...prevDonations]);
      }

    } catch (error) {
      console.error('Error creating donation:', error);
      alert(`Failed to create donation: ${error.message}`);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setCurrentItem({
        ...currentItem,
        imageUrl: imageUrl
      });
    }
  };

  const DonationRequestsModal = () => {
    const [responseNotes, setResponseNotes] = useState({});

    if (!showRequestsModal || !selectedDonationForRequests) return null;

    return (
      <div className="modal-overlay">
        <div className="donation-requests-modal">
          <div className="modal-header">
            <h2>{selectedDonationForRequests.foodName} Requests</h2>
            <button
              className="close-button"
              onClick={() => setShowRequestsModal(false)}
            >
              <X size={24} />
            </button>
          </div>

          <div className="modal-body">
            {requestsLoading ? (
              <div className="loading-indicator">
                <span className="loading-spinner"></span>
                <span>Loading requests...</span>
              </div>
            ) : donationRequests.length === 0 ? (
              <div className="no-requests-message">
                <Users className="h-16 w-16 text-gray-300" />
                <p>No requests received for this donation</p>
              </div>
            ) : (
              <div className="requests-grid">
                {donationRequests.map(request => (
                  <div className="request-card" key={request.id}>
                    <div className="request-header">
                      <div className="requester-info">
                        <div className="avatar">
                          <User className="h-5 w-5" />
                        </div>
                        <h3>{request.receiverName || 'Anonymous'}</h3>
                      </div>
                      <div className="request-date">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="request-details">
                      <div className="detail-row">
                        <span className="detail-label">Quantity:</span>
                        <span className="detail-value">{request.quantity}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Pickup Method:</span>
                        <span className="detail-value">{request.pickupMethod}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Contact:</span>
                        <span className="detail-value">{request.receiverPhone || 'Not provided'}</span>
                      </div>
                      {request.note && (
                        <div className="request-note">
                          <p>"{request.note}"</p>
                        </div>
                      )}
                    </div>

                    <div className="request-response">
                      <textarea
                        placeholder="Add a response note..."
                        value={responseNotes[request.id] || ''}
                        onChange={(e) => setResponseNotes({
                          ...responseNotes,
                          [request.id]: e.target.value
                        })}
                      ></textarea>

                      <div className="response-actions">
                        <button
                          className="btn-accept"
                          onClick={() => handleUpdateRequestStatus(
                            request.id, 'ACCEPTED', responseNotes[request.id]
                          )}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleUpdateRequestStatus(
                            request.id, 'REJECTED', responseNotes[request.id]
                          )}
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
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

  const handleViewDonation = (donation) => {
    setSelectedDonation(donation);
    setModalSource('donations');
    setDonationsOpen(false);
    setViewDonationModalOpen(true);
  };

  const handleEditDonation = (donation) => {
    setSelectedDonation({ ...donation });
    setModalSource('donations');
    setDonationsOpen(false);
    setEditDonationModalOpen(true);
  };

  const handleDeleteDonation = (donationId) => {
    setDonationToDelete(donationId);
    setModalSource('donations');
    setDonationsOpen(false);
    setDeleteConfirmationOpen(true);
  };

  // Function to confirm and execute deletion
  const confirmDeleteDonation = async () => {
    if (!donationToDelete) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/merchant/donate/${donationToDelete}?merchantId=${merchantId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete donation: ${response.statusText}`);
      }

      // Remove the deleted donation from the state
      setMerchantDonations(prevDonations =>
        prevDonations.filter(d => d.id !== donationToDelete)
      );

      // Close the confirmation dialog
      setDeleteConfirmationOpen(false);
      setDonationToDelete(null);

      // Show success notification
      alert('Donation deleted successfully');

      // Refresh donations
      fetchMerchantDonations();

    } catch (error) {
      console.error('Error deleting donation:', error);
      alert('Failed to delete donation: ' + error.message);
    }
  };

  const handleSaveDonationEdit = async (editedDonation) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/merchant/donate/${editedDonation.id}?merchantId=${merchantId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            foodName: editedDonation.foodName,
            category: editedDonation.category,
            quantity: editedDonation.quantity,
            expiryDate: editedDonation.expiry,
            location: editedDonation.location,
            // Include other fields as needed
            packaging: editedDonation.packaging,
            dietaryInfo: editedDonation.dietaryInfo,
            storageInstructions: editedDonation.storageInstructions
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update donation: ${response.statusText}`);
      }

      setMerchantDonations(prevDonations =>
        prevDonations.map(donation =>
          donation.id === editedDonation.id ? editedDonation : donation
        )
      );

      setEditDonationModalOpen(false);
      setSelectedDonation(null);
      if (modalSource === 'donations') {

        setTimeout(() => {
          setDonationsOpen(true);
          setModalSource(null); // Reset the source
        }, 10);
      }

      alert('Donation updated successfully');

      fetchMerchantDonations();

    } catch (error) {
      console.error('Error updating donation:', error);
      alert('Failed to update donation: ' + error.message);
    }
  };
  // ==========================================
  // NEW PAY FEES HANDLER FUNCTIONS
  // ==========================================
  const handleFees = async () => {
    setFeesOpen(true);
    setOrderHistoryOpen(false);
    setMessagesOpen(false);
    setProfileOpen(false);

    if (!merchantId) {
      console.error('No merchant ID available for fee fetch');
      alert('Invalid merchant ID. Please login again.');
      return;
    }

    setFeesLoading(true);

    try {
      console.log(`Fetching fees with merchantId: ${merchantId} for month: ${selectedPaymentMonth}`);

      // ✅ ENHANCED: Include selected month in the request
      const response = await fetch(
        `${BASE_URL}/api/merchant/fees/calculate?merchantId=${merchantId}&selectedMonth=${selectedPaymentMonth}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert(`Error: ${errorData.message || 'Failed to load fee information'}`);
        return;
      }

      const feeData = await response.json();
      console.log('Fee data received:', feeData);

      // ✅ NEW: Handle different response scenarios
      if (!feeData.success && feeData.message) {
        // Future month or other validation error
        setFeeData({
          ...feeData,
          currentBalance: 0,
          paymentHistory: []
        });
      } else {
        // Valid response
        setFeeData(feeData);
      }

      // Fetch payment history
      await fetchPaymentHistory();

    } catch (error) {
      console.error('Error fetching fee data:', error);
      alert('Failed to load fee information');
    } finally {
      setFeesLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/merchant/fees/payment-history?merchantId=${merchantId}`);
      if (response.ok) {
        const history = await response.json();
        // ✅ FIXED: Extract the paymentHistory array from the response
        setFeeData(prev => ({ ...prev, paymentHistory: history.paymentHistory || [] }));
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // ✅ Set empty array on error
      setFeeData(prev => ({ ...prev, paymentHistory: [] }));
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentProcessing(true);

    try {
      const paymentData = {
        merchantId: String(merchantId), // ✅ Convert to string
        amount: feeData.currentBalance,
        paymentMethod: mobilePaymentMethod,
        paymentMonth: selectedPaymentMonth,
        feeType: feeData.feeType,
        totalRevenue: overviewStats.totalRevenue
      };

      console.log('Sending payment data:', paymentData);

      const response = await fetch(`${BASE_URL}/api/merchant/fees/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      console.log('Payment response:', result);

      if (response.ok && result.success) {
        // ✅ ENHANCED: Show detailed success message
        const successMessage = result.message ||
          `Your ${getMonthName(selectedPaymentMonth)} payment has been completed successfully!`;

        alert(successMessage);

        // Update fee data to reflect payment
        setFeeData({
          ...feeData,
          currentBalance: 0,
          alreadyPaid: true,
          canPay: false,
          message: `Payment for ${getMonthName(selectedPaymentMonth)} has been completed successfully.`,
          paymentHistory: [result.paymentRecord, ...feeData.paymentHistory]
        });

        // Reset form and close modal
        setPaymentAmount(0);
        setFeesOpen(false);

        // Show additional success info
        console.log('Transaction ID:', result.transactionId);
        console.log('Payment Date:', result.paymentDate);

      } else {
        const errorMessage = result.message || 'Payment processing failed';
        alert(`Payment failed: ${errorMessage}`);
        console.error('Payment failed:', result);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const getMonthName = (monthString) => {
    try {
      const [year, month] = monthString.split('-');
      const date = new Date(year, month - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch (error) {
      return monthString;
    }
  };

  const formatCurrency = (amount) => {
    return `৳${parseFloat(amount).toFixed(2)}`;
  };

  const handleMonthChange = (newMonth) => {
    setSelectedPaymentMonth(newMonth);

    // ✅ NEW: Auto-refresh fee data when month changes
    if (feesOpen) {
      handleFees();
    }
  };
  // ==========================================
  // POPUP HANDLERS
  // ==========================================
  const SalesHistoryModal = () => {
    if (!salesHistoryOpen) return null;

    return (
      <div className="popup-overlay">
        <div className="popup-content sales-history-popup">
          <div className="popup-header">
            <h2>Sales History</h2>
            <div className="header-actions">
              <button
                className="refresh-btn"
                onClick={fetchSalesHistory}
                disabled={salesLoading}
              >
                <Activity size={18} />
                <span>Refresh</span>
              </button>
              <button
                className="close-button"
                onClick={() => setSalesHistoryOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="popup-body">
            {salesLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <h3>Loading Sales History...</h3>
                <p>Please wait while we fetch your sales data</p>
              </div>
            ) : salesError ? (
              <div className="error-state">
                <AlertCircle size={48} className="error-icon" />
                <h3>Error Loading Sales</h3>
                <p>{salesError}</p>
                <button
                  className="retry-button"
                  onClick={fetchSalesHistory}
                >
                  <Activity size={16} />
                  <span>Retry</span>
                </button>
              </div>
            ) : salesHistory.length === 0 ? (
              <div className="empty-state">
                <History size={48} />
                <h3>No Sales History</h3>
                <p>You haven't made any sales yet. Your completed sales will appear here.</p>
              </div>
            ) : (
              <>
                <div className="sales-summary">
                  <div className="summary-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Sales</span>
                      <span className="stat-value">{salesHistory.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Revenue</span>
                      <span className="stat-value">
                        {formatCurrency(
                          salesHistory.reduce((total, sale) => total + parseFloat(sale.totalAmount || 0), 0)
                        )}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Items Sold</span>
                      <span className="stat-value">
                        {salesHistory.reduce((total, sale) => total + parseInt(sale.quantitySold || 0), 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sales-list">
                  {salesHistory.map(sale => (
                    <div key={sale.id} className="sale-card">
                      <div className="sale-header">
                        <div className="sale-info">
                          <h3 className="sale-id">Sale #{sale.id}</h3>
                          <p className="sale-date">{formatDate(sale.saleDate)}</p>
                        </div>
                        <div className={`sale-status ${getSaleStatusClass(sale.saleStatus)}`}>
                          {sale.saleStatus}
                        </div>
                      </div>

                      <div className="sale-content">
                        <div className="food-item-details">
                          <div className="food-item-header">
                            <h4 className="food-name">{sale.foodItemName || 'Unknown Item'}</h4>
                            <div className="food-category">
                              {getCategoryIcon(sale.foodCategory?.toLowerCase())}
                              <span>{getFoodCategoryLabel(sale.foodCategory?.toLowerCase())}</span>
                            </div>
                          </div>

                          {sale.foodItemDescription && (
                            <p className="food-description">{sale.foodItemDescription}</p>
                          )}

                          <div className="sale-details">
                            <div className="detail-row">
                              <div className="detail-item">
                                <Store size={14} />
                                <span>{sale.storeName || 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <MapPin size={14} />
                                <span>{sale.location || 'N/A'}</span>
                              </div>
                            </div>

                            <div className="detail-row">
                              <div className="detail-item">
                                <Package size={14} />
                                <span>Qty: {sale.quantitySold}</span>
                              </div>
                              <div className="detail-item">
                                <DollarSign size={14} />
                                <span>Unit: {formatCurrency(sale.pricePerUnit)}</span>
                              </div>
                            </div>

                            <div className="detail-row">
                              <div className="detail-item">
                                <CreditCard size={14} />
                                <span>{sale.paymentMethod || 'N/A'}</span>
                              </div>
                              {sale.transactionId && (
                                <div className="detail-item">
                                  <span className="transaction-id">TX: {sale.transactionId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="sale-amount">
                          <div className="amount-breakdown">
                            <div className="amount-line">
                              <span>{sale.quantitySold} × {formatCurrency(sale.pricePerUnit)}</span>
                            </div>
                            <div className="total-amount">
                              <strong>{formatCurrency(sale.totalAmount)}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {sale.donationStatus && (
                        <div className="donation-info">
                          <div className="donation-status">
                            <Heart size={14} />
                            <span>Donation Status: {sale.donationStatus}</span>
                          </div>
                          {sale.donationLocation && (
                            <div className="donation-location">
                              <MapPin size={14} />
                              <span>Donation Location: {sale.donationLocation}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="sale-actions">
                        <div className="sale-timestamps">
                          <small>Created: {formatDate(sale.createdAt)}</small>
                        </div>

                        <div className="action-buttons">
                          <button
                            className="sale-action-btn view"
                            onClick={() => {
                              alert(`Sale Details:\n\nSale ID: ${sale.id}\nDate: ${formatDate(sale.saleDate)}\nFood Item: ${sale.foodItemName}\nQuantity: ${sale.quantitySold}\nTotal Amount: ${formatCurrency(sale.totalAmount)}\nPayment Method: ${sale.paymentMethod}\nStatus: ${sale.saleStatus}`);
                            }}
                          >
                            <Eye size={16} />
                            <span>View Details</span>
                          </button>

                          <button
                            className="sale-action-btn delete"
                            onClick={() => handleDeleteSale(sale.id)}
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const NewMessageModal = () => {
    const [recipientType, setRecipientType] = useState('admin');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState(null);

    // Template definitions
    const adminTemplates = [
      {
        id: 'system_issue',
        title: 'System/Technical Issue',
        subject: 'Technical Support Required - System Issue',
        content: `Dear Admin Team,

I am experiencing a technical issue with the system that requires your assistance.

Issue Details:
- Problem Description: [Please describe the issue you're experiencing]
- When it occurred: [Date and time]
- Steps taken: [What you tried to resolve it]
- Browser/Device: [Your browser and device information]

This issue is affecting my ability to [describe impact on your operations].

Please provide assistance at your earliest convenience.

Best regards,
[Your Business Name]`
      },
      {
        id: 'complaint',
        title: 'Complaint/Feedback',
        subject: 'Formal Complaint - Merchant Feedback',
        content: `Dear Admin Team,

I would like to formally submit the following complaint/feedback regarding my experience with the platform.

Complaint Details:
- Issue Category: [Service, Platform, Policy, Other]
- Description: [Detailed description of your concern]
- Date of Incident: [When the issue occurred]
- Reference Number: [If applicable]

Expected Resolution:
[What outcome you are seeking]

I look forward to your prompt response and resolution of this matter.

Best regards,
[Your Business Name]`
      },
      {
        id: 'subscription',
        title: 'Subscription/Account Issues',
        subject: 'Account Support Required - Subscription Issue',
        content: `Dear Admin Team,

I need assistance with my merchant account and subscription.

Account Details:
- Business Name: [Your registered business name]
- Account Issue: [Billing, Subscription upgrade/downgrade, Account access, Other]
- Description: [Detailed description of the issue]

Current Subscription: [Your current plan]
Requested Action: [What you need help with]

Please review my account and provide the necessary assistance.

Best regards,
[Your Business Name]`
      },
      {
        id: 'feature_request',
        title: 'Feature Request',
        subject: 'Feature Request - Platform Enhancement',
        content: `Dear Admin Team,

I would like to suggest a new feature or enhancement to improve the platform.

Feature Request:
- Feature Name: [Brief name for the feature]
- Description: [Detailed description of the proposed feature]
- Business Benefit: [How this would help merchants like me]
- Priority: [High/Medium/Low]

Implementation Suggestion:
[Any ideas on how this could be implemented]

Thank you for considering this request.

Best regards,
[Your Business Name]`
      },
      {
        id: 'custom',
        title: 'Custom Message',
        subject: '',
        content: ''
      }
    ];

    const donorTemplates = [
      {
        id: 'food_offer',
        title: 'Special Food Offer - Discounted Prices',
        subject: 'Special Food Offer Available - Discounted Fresh Items',
        content: `Dear Food Donors and Community Partners,

We have fresh food items available at discounted prices that would be perfect for your donation programs.

Available Items:
- Item 1: [Food item name] - [Original price] → [Discounted price]
- Item 2: [Food item name] - [Original price] → [Discounted price]
- Item 3: [Food item name] - [Original price] → [Discounted price]

Details:
- Pickup Location: [Your restaurant/store address]
- Available Until: [Date and time]
- Quantity Available: [Number of portions/items]
- Pickup Time: [Preferred pickup time window]

These items are fresh, properly stored, and ready for immediate pickup. Perfect for feeding programs, community kitchens, or families in need.

Contact us to arrange pickup or for more information.

Best regards,
[Your Business Name]
[Your Contact Information]`
      },
      {
        id: 'new_meal',
        title: 'New Meal/Dish Available for Donation',
        subject: 'New Nutritious Meals Available for Community Donation',
        content: `Dear Food Donors and Community Organizations,

We are excited to offer new meal options that are perfect for donation to those in need.

New Menu Items Available:
- Meal 1: [Dish name] - [Description and nutritional highlights]
- Meal 2: [Dish name] - [Description and nutritional highlights]
- Meal 3: [Dish name] - [Description and nutritional highlights]

Meal Details:
- Portion Size: [Serving size]
- Nutritional Value: [Key nutrients, dietary considerations]
- Packaging: [How meals are packaged]
- Shelf Life: [How long meals stay fresh]
- Special Dietary Options: [Vegetarian, vegan, gluten-free, etc.]

Schedule:
- Available Days: [When these meals are available]
- Pickup Times: [Best times for pickup]
- Advance Notice: [How much notice you need]

These meals are prepared with fresh ingredients and follow all food safety standards.

Please let us know if you're interested in regular pickups.

Best regards,
[Your Business Name]
[Your Contact Information]`
      },
      {
        id: 'lunch_special',
        title: 'Daily/Weekly Lunch Specials',
        subject: 'Weekly Lunch Donation Program - Fresh Meals Available',
        content: `Dear Community Partners,

We are pleased to announce our weekly lunch donation program with fresh, healthy meals.

This Week's Lunch Program:
- Monday: [Meal description]
- Tuesday: [Meal description]
- Wednesday: [Meal description]
- Thursday: [Meal description]
- Friday: [Meal description]

Program Details:
- Pickup Time: [Daily pickup time window]
- Quantity: [Number of meals available daily]
- Location: [Pickup address]
- Contact Person: [Name and phone number]

Meal Features:
- Freshly prepared daily
- Balanced nutrition
- Proper food safety standards
- Various dietary options available

This program runs every week, and we can accommodate regular pickup schedules.

Please confirm your interest and preferred pickup arrangements.

Best regards,
[Your Business Name]
[Your Contact Information]`
      },
      {
        id: 'donation_package',
        title: 'Easy Food Donation Packages',
        subject: 'Ready-to-Distribute Food Packages for Community Outreach',
        content: `Dear Food Donors and Social Organizations,

We have prepared convenient food donation packages that are ready for immediate distribution to families and individuals in need.

Available Packages:

Family Package (Serves 4-6):
- Main Items: [List of main food items]
- Sides: [Side dishes/items]
- Beverages: [Drinks included]
- Estimated Value: [Package value]

Individual Package (Serves 1-2):
- Main Items: [List of main food items]
- Sides: [Side dishes/items]
- Snacks: [Additional items]
- Estimated Value: [Package value]

Bulk Package (Serves 10+):
- Main Items: [Large quantity items]
- Sides: [Bulk side items]
- Serving Supplies: [Plates, utensils if included]
- Estimated Value: [Package value]

Package Benefits:
- Pre-portioned and ready to distribute
- Nutritionally balanced
- Easy transportation
- Professional packaging
- Includes serving suggestions

Availability:
- Current Stock: [Number of each package type]
- Pickup Window: [Time frame for pickup]
- Ordering: [How to request specific packages]

These packages make distribution easy and ensure consistent, quality meals for your programs.

Contact us to reserve packages or discuss custom arrangements.

Best regards,
[Your Business Name]
[Your Contact Information]`
      },
      {
        id: 'surplus_alert',
        title: 'Surplus Food Alert - Immediate Pickup Available',
        subject: 'Urgent: Fresh Surplus Food Available for Immediate Donation',
        content: `Dear Emergency Food Response Teams,

We have surplus food available that needs immediate pickup to prevent waste.

Surplus Items Available:
- Item Type: [Food category - prepared meals, baked goods, fresh produce, etc.]
- Quantity: [Amount available]
- Condition: [Fresh, best by date, storage requirements]
- Pickup Deadline: [Latest pickup time]

Urgent Details:
- Available Now Until: [End time/date]
- Location: [Pickup address]
- Contact for Immediate Pickup: [Phone number]
- Parking/Access: [Loading instructions]

Food Safety Information:
- Preparation Time: [When food was prepared]
- Storage Conditions: [How it's currently stored]
- Best Consumed By: [Recommended consumption timeline]
- Allergen Information: [Any allergen warnings]

This is a time-sensitive opportunity to redirect quality food to those who need it.

Please respond quickly if you can arrange immediate pickup.

Best regards,
[Your Business Name]
[Emergency Contact: Phone Number]`
      },
      {
        id: 'custom',
        title: 'Custom Message',
        subject: '',
        content: ''
      }
    ];

    if (!showNewMessageModal) return null;

    const getCurrentTemplates = () => {
      return recipientType === 'admin' ? adminTemplates : donorTemplates;
    };

    const handleRecipientTypeChange = (type) => {
      setRecipientType(type);
      setSelectedTemplate('');
      setSubject('');
      setMessage('');
      setAttachment(null);
    };

    const handleTemplateChange = (templateId) => {
      setSelectedTemplate(templateId);
      const template = getCurrentTemplates().find(t => t.id === templateId);
      if (template) {
        setSubject(template.subject);
        setMessage(template.content);
      }
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          alert('File size must be less than 10MB');
          e.target.value = '';
          return;
        }

        const allowedTypes = [
          'application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg', 'image/jpg', 'image/png', 'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedTypes.includes(file.type)) {
          alert('Please select a valid file type (PDF, DOC, DOCX, JPG, PNG, TXT, XLS, XLSX)');
          e.target.value = '';
          return;
        }
        setAttachment(file);
      }
    };

    const removeAttachment = () => {
      setAttachment(null);
      const fileInput = document.getElementById('messageAttachment');
      if (fileInput) fileInput.value = '';
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const authData = JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser'));
        const merchantEmail = authData?.email || '';

        const formData = new FormData();
        formData.append('merchantId', merchantId);
        formData.append('merchantEmail', merchantEmail);
        formData.append('toEmail', recipientType === 'admin' ? 'sfms0674@gmail.com' : 'donor@foodbridge.com');
        formData.append('subject', subject);
        formData.append('message', message);
        formData.append('recipientType', recipientType);

        if (attachment) {
          formData.append('attachment', attachment);
        }

        const response = await fetch(`${BASE_URL}/api/merchant/messages/send`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          alert('Message sent successfully!');
          setShowNewMessageModal(false);
          setRecipientType('admin');
          setSelectedTemplate('');
          setSubject('');
          setMessage('');
          setAttachment(null);

          // Refresh message stats
          fetchMerchantMessageStats();
        } else {
          const errorData = await response.text();
          alert(`Failed to send message: ${errorData}`);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message');
      }
    };

    return (
      <div className="message-modal-overlay">
        <div className="message-modal-container">
          <div className="message-modal-content">
            <div className="message-modal-header">
              <div className="modal-header-content">
                <h3 className="modal-title">Send New Message</h3>
                <p className="modal-subtitle">
                  {recipientType === 'admin'
                    ? 'Send message to Admin Support using templates'
                    : 'Send message to Food Donors using templates'}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowNewMessageModal(false)}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="message-modal-body">
              <form onSubmit={handleSubmit} className="message-form">

                <div className="form-section">
                  <label className="section-label">Send Message To*</label>
                  <div className="recipient-type-container">
                    <label className={`recipient-type-card ${recipientType === 'admin' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="recipientType"
                        value="admin"
                        checked={recipientType === 'admin'}
                        onChange={(e) => handleRecipientTypeChange(e.target.value)}
                        className="recipient-radio"
                      />
                      <div className="recipient-card-content">
                        <div className="recipient-icon admin-icon">
                          <Settings size={20} />
                        </div>
                        <div className="recipient-info">
                          <span className="recipient-title">Admin Support</span>
                          <span className="recipient-desc">Technical support, account issues, complaints, feature requests</span>
                        </div>
                      </div>
                    </label>

                    <label className={`recipient-type-card ${recipientType === 'donor' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="recipientType"
                        value="donor"
                        checked={recipientType === 'donor'}
                        onChange={(e) => handleRecipientTypeChange(e.target.value)}
                        className="recipient-radio"
                      />
                      <div className="recipient-card-content">
                        <div className="recipient-icon donor-icon">
                          <Heart size={20} />
                        </div>
                        <div className="recipient-info">
                          <span className="recipient-title">Food Donors</span>
                          <span className="recipient-desc">Food offers, meal announcements, donation packages</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <label htmlFor="templateSelect" className="field-label">
                    Message Template*
                    <span className="field-note">Choose a template to get started</span>
                  </label>
                  <select
                    id="templateSelect"
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    required
                    className="form-input"
                  >
                    <option value="">Select a template...</option>
                    {getCurrentTemplates().map(template => (
                      <option key={template.id} value={template.id}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-section">
                  <label htmlFor="subjectField" className="field-label">Subject*</label>
                  <input
                    type="text"
                    id="subjectField"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter message subject"
                    required
                    className="form-input"
                    maxLength={100}
                  />
                  <div className="field-helper">
                    <span className="char-count">{subject.length}/100</span>
                  </div>
                </div>

                <div className="form-section">
                  <label htmlFor="messageTextArea" className="field-label">Message*</label>
                  <div className="textarea-container">
                    <textarea
                      id="messageTextArea"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Your message will appear here when you select a template, or type your custom message"
                      required
                      className="form-textarea"
                      rows="8"
                      maxLength={2000}
                      spellCheck={true}
                    />
                    <div className="textarea-helper">
                      <span className="char-count">{message.length}/2000</span>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <label className="field-label">
                    Attachment (Optional)
                    <span className="field-note">Max 10MB - PDF, DOC, DOCX, JPG, PNG, TXT, XLS, XLSX</span>
                  </label>

                  {!attachment ? (
                    <div className="file-upload-zone">
                      <input
                        type="file"
                        id="messageAttachment"
                        onChange={handleFileChange}
                        className="file-input-hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xls,.xlsx"
                      />
                      <label htmlFor="messageAttachment" className="file-upload-label">
                        <div className="file-upload-content">
                          <div className="file-upload-icon">
                            <Upload size={24} />
                          </div>
                          <div className="file-upload-text">
                            <span className="upload-primary">Click to upload file</span>
                            <span className="upload-secondary">or drag and drop</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="file-selected-display">
                      <div className="file-info">
                        <div className="file-icon">
                          <Package size={20} />
                        </div>
                        <div className="file-details">
                          <span className="file-name">{attachment.name}</span>
                          <span className="file-size">{formatFileSize(attachment.size)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="file-remove-btn"
                        aria-label="Remove attachment"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="message-modal-footer">
              <div className="footer-actions">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn-send"
                  disabled={!subject.trim() || !message.trim() || !selectedTemplate}
                >
                  <Send size={16} />
                  <span>Send Message</span>
                </button>
              </div>
              <div className="footer-note">
                <span>Messages are sent from your registered merchant email automatically</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order from history?')) {
      setOrders(orders.filter(order => order.id !== orderId));
    }
  };

  const handleContactCustomer = (order) => {
    const newMessage = {
      id: `MSG-${Date.now()}`,
      sender: order.customer,
      senderAvatar: 'https://randomuser.me/api/portraits/lego/1.jpg', // Placeholder
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subject: `Follow-up on order ${order.id}`,
      message: '',
      read: true,
      thread: []
    };

    setMessages([newMessage, ...messages]);
    setOrderHistoryOpen(false);
    setMessagesOpen(true);
    setSelectedMessage(newMessage);
    setReplyContent(`Hi ${order.customer}, I'm reaching out about your order ${order.id}. `);
  };

  const handleMessages = () => {
    setMessagesOpen(true);
    setOrderHistoryOpen(false);
    setProfileOpen(false);
    setFeesOpen(false);
    setSalesHistoryOpen(false);
    setDonationsOpen(false);

    // Refresh message stats when opening messages
    fetchMerchantSentMessages();
    fetchMerchantReceivedMessages();
    fetchMerchantMessageStats();
  };
  const handleCloseMessages = () => {
    setMessagesOpen(false);
    // Refresh stats after closing to update any read messages
    setTimeout(() => {
      fetchMerchantMessageStats();
    }, 500);
  };

  const handleViewMessage = async (message) => {
    setSelectedMessageForView(message);
    setShowMessageViewModal(true);

    // Auto-mark as read if it's a received message and not already read
    if (messageTab === 'received' && !message.read) {
      try {
        const response = await fetch(
          `${BASE_URL}/api/merchant/messages/${merchantId}/messages/${message.id}/mark-read`,
          {
            method: 'PUT',
          }
        );

        if (response.ok) {
          // Update the message in state to mark as read
          setReceivedMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === message.id ? { ...msg, read: true } : msg
            )
          );

          // Refresh stats immediately after marking as read
          fetchMerchantMessageStats();
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  // Ignore message functionality
  const handleIgnoreMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to ignore this message? It will be hidden from your inbox.')) {
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/merchant/messages/${merchantId}/messages/${messageId}/ignore`,
        {
          method: 'PUT',
        }
      );

      if (response.ok) {
        // Remove the message from the received messages list
        setReceivedMessages(prevMessages =>
          prevMessages.filter(msg => msg.id !== messageId)
        );

        alert('Message ignored successfully');
        fetchMerchantMessageStats();
      } else {
        alert('Failed to ignore message');
      }
    } catch (error) {
      console.error('Error ignoring message:', error);
      alert('Error ignoring message');
    }
  };

  // Delete sent message functionality
  const handleDeleteSentMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this sent message?')) {
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/merchant/messages/${merchantId}/sent/${messageId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        // Remove the message from the sent messages list
        setSentMessages(prevMessages =>
          prevMessages.filter(msg => msg.id !== messageId)
        );

        alert('Message deleted successfully');
        fetchMerchantMessageStats();
      } else {
        alert('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message');
    }
  };

  const handleProfileUpdate = () => {
    setProfileOpen(true);
    setOrderHistoryOpen(false);
    setMessagesOpen(false);
    setFeesOpen(false);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const nameParts = value.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      setUserProfile({
        ...userProfile,
        [name]: value,
        ownerFirstName: firstName,
        ownerLastName: lastName
      });
    } else {
      setUserProfile({
        ...userProfile,
        [name]: value
      });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const formData = new FormData();

      if (!userProfile.ownerFirstName || !userProfile.ownerLastName) {
        const nameParts = userProfile.name.split(' ');
        formData.append('ownerFirstName', nameParts[0] || '');
        formData.append('ownerLastName', nameParts.slice(1).join(' ') || '');
      } else {
        formData.append('ownerFirstName', userProfile.ownerFirstName);
        formData.append('ownerLastName', userProfile.ownerLastName);
      }
      formData.append('businessName', userProfile.storeName);
      formData.append('email', userProfile.email);
      formData.append('phoneNumber', userProfile.phone);
      formData.append('businessAddress', userProfile.address);
      formData.append('businessDescription', userProfile.bio);
      formData.append('businessType', userProfile.businessType);
      formData.append('businessLicenseNumber', userProfile.businessLicenseNumber);
      formData.append('city', userProfile.city);
      formData.append('stateProvince', userProfile.stateProvince);
      formData.append('postalCode', userProfile.postalCode);
      formData.append('merchantId', merchantId.toString());
      if (avatarFile) {
        formData.append('logo', avatarFile);
      }
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      const response = await fetch(`${BASE_URL}/api/merchant/profile/update?merchantId=${merchantId}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile update failed:', errorText);
        setProfileError(`Failed to update profile: ${errorText || response.statusText}`);
        return;
      }

      const updatedProfile = await response.json();
      console.log('Profile updated successfully:', updatedProfile);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => {
        setProfileOpen(false);
      }, 2000);

    } catch (error) {
      console.error('Error updating merchant profile:', error);
      setProfileError(`An unexpected error occurred: ${error.message}`);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarUpload = () => {
    avatarInputRef.current.click();
  };
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const imageUrl = URL.createObjectURL(file);
      setUserProfile({
        ...userProfile,
        avatar: imageUrl
      });
    }
  };


  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'restaurant':
        return <Coffee size={16} />;
      case 'grocery':
        return <ShoppingBag size={16} />;
      case 'other':
        return <Tag size={16} />;
      default:
        return <ShoppingBag size={16} />;
    }
  };

  const getFoodCategoryLabel = (category) => {
    switch (category) {
      case 'restaurant':
        return 'Restaurant & Café';
      case 'grocery':
        return 'Grocery Store';
      case 'other':
        return 'Other';
      default:
        return category;
    }
  };

  const getTotalItemsSaved = () => {
    return foodItems.reduce((total, item) => total + (item.isPaused ? 0 : parseInt(item.quantity)), 0);
  };

  const getActiveListings = () => {
    return foodItems.filter(item => !item.isPaused).length;
  };

  const getTotalRevenue = () => {
    return overviewStats.totalRevenue.toFixed(2);
  };


  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Processing':
        return 'status-processing';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const fetchFoodItemsWithRemaining = async () => {
    try {
      if (!merchantId) {
        console.error('No merchant ID available');
        return;
      }

      console.log(`Fetching food items with remaining quantity for merchantId: ${merchantId}`);

      // First get all food items
      const response = await fetch(`${BASE_URL}/api/merchant/food-items?merchantId=${merchantId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch food items: ${response.status}`);
      }

      const foodItemsData = await response.json();

      // Then get the remaining quantities for each item with the updated calculation
      const itemsWithRemaining = await Promise.all(
        foodItemsData.map(async (item) => {
          try {
            // This endpoint should now include both sold AND donated quantities
            const remainingResponse = await fetch(`${BASE_URL}/api/merchant/food-items/${item.id}/with-remaining`);

            if (remainingResponse.ok) {
              const remainingData = await remainingResponse.json();
              return {
                ...item,
                foodCategory: item.foodCategory?.toLowerCase() || 'other',
                imageUrl: item.imageBase64 && item.imageContentType
                  ? `data:${item.imageContentType};base64,${item.imageBase64}`
                  : null,
                remainingQuantity: remainingData.remainingQuantity
              };
            }
            return {
              ...item,
              foodCategory: item.foodCategory?.toLowerCase() || 'other',
              imageUrl: item.imageBase64 && item.imageContentType
                ? `data:${item.imageContentType};base64,${item.imageBase64}`
                : null
            };
          } catch (error) {
            console.error(`Error fetching remaining quantity for item ${item.id}:`, error);
            return {
              ...item,
              foodCategory: item.foodCategory?.toLowerCase() || 'other',
              imageUrl: item.imageBase64 && item.imageContentType
                ? `data:${item.imageContentType};base64,${item.imageBase64}`
                : null
            };
          }
        })
      );

      console.log("Fetched items with updated remaining quantities:", itemsWithRemaining);
      setFoodItems(itemsWithRemaining);

    } catch (error) {
      console.error('Error fetching food items with remaining quantities:', error);
      alert("Error connecting to server. Please check your connection and try again.");
    }
  };

  useEffect(() => {

    if (merchantId) {
      fetchFoodItemsWithRemaining();
    }
  }, [merchantId]);

const DonationsPopup = ({
  isOpen,
  onClose,
  donationsSubTab,
  setDonationsSubTab,
  merchantDonations,
  pendingDonations,
  rejectedDonations,
  completedDonations,
  donationLoading,
  donationError,
  handleCheckRequests,
  handleMarkAsCompleted,
  // ADD THESE MISSING PROPS:
  handleViewDonation,
  handleEditDonation,
  handleDeleteDonation
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content donations-popup">
        <div className="popup-header">
          <h2>My Donations</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="popup-body">
          <div className="donations-tabs">
            <button
              className={`donation-tab ${donationsSubTab === 'active' ? 'active' : ''}`}
              onClick={() => setDonationsSubTab('active')}
            >
              Active
            </button>
            <button
              className={`donation-tab ${donationsSubTab === 'pending' ? 'active' : ''}`}
              onClick={() => setDonationsSubTab('pending')}
            >
              Pending
            </button>
            <button
              className={`donation-tab ${donationsSubTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setDonationsSubTab('rejected')}
            >
              Rejected
            </button>
            <button
              className={`donation-tab ${donationsSubTab === 'completed' ? 'active' : ''}`}
              onClick={() => setDonationsSubTab('completed')}
            >
              Completed
            </button>
          </div>

          {donationLoading ? (
            <div className="loading-indicator">
              <span className="loading-spinner"></span>
              <span>Loading donations...</span>
            </div>
          ) : donationError ? (
            <div className="error-message">
              <AlertCircle className="h-5 w-5" />
              <span>{donationError}</span>
            </div>
          ) : (
            <div className="donations-grid">
              {(() => {
                // Determine which donations to display based on current tab
                let displayDonations = [];
                switch (donationsSubTab) {
                  case 'active':
                    displayDonations = merchantDonations;
                    break;
                  case 'pending':
                    displayDonations = pendingDonations;
                    break;
                  case 'rejected':
                    displayDonations = rejectedDonations;
                    break;
                  case 'completed':
                    displayDonations = completedDonations;
                    break;
                  default:
                    displayDonations = merchantDonations;
                }

                if (displayDonations.length === 0) {
                  return (
                    <div className="no-donations-message">
                      <Heart className="h-12 w-12 text-gray-300" />
                      <h3>No {donationsSubTab} donations</h3>
                      <p>Donations you make will appear here</p>
                    </div>
                  );
                }

                return displayDonations.map(donation => (
                  <div key={donation.id} className="donation-card">
                    <div className="donation-image">
                      <img src={donation.imageUrl} alt={donation.foodName} />
                      <div className={`status-badge ${donation.status.toLowerCase()}`}>
                        {donation.status}
                      </div>
                    </div>

                    <div className="donation-content">
                      <h3 className="donation-title">{donation.foodName}</h3>

                      <div className="donation-meta">
                        <div className="meta-item">
                          <Tag className="h-4 w-4" />
                          <span>{donation.category}</span>
                        </div>
                        <div className="meta-item">
                          <Package className="h-4 w-4" />
                          <span>{donation.quantity}</span>
                        </div>
                      </div>

                      <div className="donation-details">
                        <div className="detail-item">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>Expires: {new Date(donation.expiry).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-item">
                          <MapPin className="h-4 w-4 text-red-500" />
                          <span>{donation.location}</span>
                        </div>
                      </div>

                      {/* STEP 3: FIXED DONATION ACTIONS - Make sure this section renders properly */}
                      <div className="donation-actions">
                        {donationsSubTab === 'active' && (
                          <>
                            <button
                              className="card-action-btn check-requests"
                              onClick={() => handleCheckRequests(donation)}
                            >
                              <Users className="h-4 w-4" />
                              <span>Requests</span>
                            </button>

                            <button
                              className="card-action-btn view"
                              onClick={() => handleViewDonation(donation)}
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>

                            <button
                              className="card-action-btn edit"
                              onClick={() => handleEditDonation(donation)}
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>

                            <button
                              className="card-action-btn delete"
                              onClick={() => handleDeleteDonation(donation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}

                        {/* Existing buttons for other tabs */}
                        {donationsSubTab === 'pending' && (
                          <button
                            className="action-btn mark-complete"
                            onClick={() => handleMarkAsCompleted(donation.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Mark Complete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

  const filteredItems = foodItems
    .filter(item => filterCategory === 'all' || item.foodCategory === filterCategory)
    .filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const ViewDonationModal = ({ isOpen, onClose, donation }) => {
    if (!isOpen || !donation) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content view-donation-modal dark:bg-gray-900 dark:text-gray-100">
          <div className="modal-header dark:bg-gray-800">
            <h2>View Donation Details</h2>
            <button className="close-button dark:text-gray-300" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-body dark:bg-gray-900">
            <div className="donation-image-container">
              <img
                src={donation.imageUrl || '/api/placeholder/400/200'}
                alt={donation.foodName}
                className="donation-detail-image"
              />
            </div>

            <div className="donation-detail-section dark:bg-gray-800 dark:border-gray-700">
              <h3 className="section-title dark:text-gray-200">Basic Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label dark:text-gray-400">Name:</span>
                  <span className="detail-value dark:text-gray-200">{donation.foodName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label dark:text-gray-400">Category:</span>
                  <span className="detail-value dark:text-gray-200">{donation.category}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label dark:text-gray-400">Quantity:</span>
                  <span className="detail-value dark:text-gray-200">{donation.quantity}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label dark:text-gray-400">Status:</span>
                  <span className={`status-badge ${donation.status.toLowerCase()} dark:opacity-90`}>
                    {donation.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="donation-detail-section dark:bg-gray-800 dark:border-gray-700">
              <h3 className="section-title dark:text-gray-200">Dates & Location</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label dark:text-gray-400">Expiry Date:</span>
                  <span className="detail-value dark:text-gray-200">
                    {new Date(donation.expiry).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label dark:text-gray-400">Preparation Date:</span>
                  <span className="detail-value dark:text-gray-200">
                    {donation.preparation ? new Date(donation.preparation).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label dark:text-gray-400">Location:</span>
                  <span className="detail-value dark:text-gray-200">{donation.location}</span>
                </div>
              </div>
            </div>

            <div className="donation-detail-section dark:bg-gray-800 dark:border-gray-700">
              <h3 className="section-title dark:text-gray-200">Additional Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label dark:text-gray-400">Packaging:</span>
                  <span className="detail-value dark:text-gray-200">{donation.packaging || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label dark:text-gray-400">Storage Instructions:</span>
                  <span className="detail-value dark:text-gray-200">{donation.storageInstructions || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label dark:text-gray-400">Dietary Info:</span>
                  <span className="detail-value dark:text-gray-200">{donation.dietaryInfo || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EditDonationModal = ({ isOpen, onClose, donation, onSave }) => {

    const [editedDonation, setEditedDonation] = useState({ ...donation });

    if (!isOpen || !donation) return null;

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setEditedDonation(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleDietaryChange = (option) => {
      let updatedDietaryInfo = [...(editedDonation.dietaryInfo || [])];

      if (typeof updatedDietaryInfo === 'string') {
        updatedDietaryInfo = updatedDietaryInfo.split(', ');
      }

      const isSelected = updatedDietaryInfo.includes(option);

      if (isSelected) {
        updatedDietaryInfo = updatedDietaryInfo.filter(item => item !== option);
      } else {
        updatedDietaryInfo.push(option);
      }

      setEditedDonation(prev => ({
        ...prev,
        dietaryInfo: updatedDietaryInfo
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(editedDonation);
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content edit-donation-modal dark:bg-gray-900 dark:text-gray-100">
          <div className="modal-header dark:bg-gray-800">
            <h2>Edit Donation</h2>
            <button className="close-button dark:text-gray-300" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-body dark:bg-gray-900">
            <form onSubmit={handleSubmit}>
              <div className="form-section dark:bg-gray-800 dark:border-gray-700">
                <h3 className="section-title dark:text-gray-200">Basic Information</h3>

                <div className="form-group">
                  <label htmlFor="foodName" className="dark:text-gray-300">Food Name</label>
                  <input
                    type="text"
                    id="foodName"
                    name="foodName"
                    value={editedDonation.foodName}
                    onChange={handleInputChange}
                    required
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="dark:text-gray-300">Category</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={editedDonation.category}
                    onChange={handleInputChange}
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="quantity" className="dark:text-gray-300">Quantity</label>
                  <input
                    type="text"
                    id="quantity"
                    name="quantity"
                    value={editedDonation.quantity}
                    onChange={handleInputChange}
                    required
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="form-section dark:bg-gray-800 dark:border-gray-700">
                <h3 className="section-title dark:text-gray-200">Dates & Location</h3>

                <div className="form-group">
                  <label htmlFor="expiry" className="dark:text-gray-300">Expiry Date</label>
                  <input
                    type="date"
                    id="expiry"
                    name="expiry"
                    value={editedDonation.expiry ? editedDonation.expiry.split('T')[0] : ''}
                    onChange={handleInputChange}
                    required
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location" className="dark:text-gray-300">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={editedDonation.location}
                    onChange={handleInputChange}
                    required
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="form-section dark:bg-gray-800 dark:border-gray-700">
                <h3 className="section-title dark:text-gray-200">Additional Details</h3>

                <div className="form-group">
                  <label htmlFor="packaging" className="dark:text-gray-300">Packaging</label>
                  <input
                    type="text"
                    id="packaging"
                    name="packaging"
                    value={editedDonation.packaging || ''}
                    onChange={handleInputChange}
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="storageInstructions" className="dark:text-gray-300">Storage Instructions</label>
                  <input
                    type="text"
                    id="storageInstructions"
                    name="storageInstructions"
                    value={editedDonation.storageInstructions || ''}
                    onChange={handleInputChange}
                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  />
                </div>

                <div className="form-group">
                  <label className="dark:text-gray-300">Dietary Information</label>
                  <div className="dietary-options">
                    {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Halal'].map(option => {
                      // Handle both array and string types for dietary info
                      let dietaryArray = [];
                      if (typeof editedDonation.dietaryInfo === 'string') {
                        dietaryArray = editedDonation.dietaryInfo.split(', ');
                      } else if (Array.isArray(editedDonation.dietaryInfo)) {
                        dietaryArray = editedDonation.dietaryInfo;
                      }

                      return (
                        <label key={option} className="dietary-option dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={dietaryArray.includes(option)}
                            onChange={() => handleDietaryChange(option)}
                            className="dark:bg-gray-700"
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="form-actions dark:border-t dark:border-gray-700">
                <button
                  type="button"
                  className="cancel-button dark:bg-gray-700 dark:text-gray-200"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button dark:bg-green-600 dark:hover:bg-green-700"
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="confirmation-dialog">
          <div className="dialog-header">
            <h3>Confirm Deletion</h3>
          </div>

          <div className="dialog-content">
            <AlertCircle className="warning-icon" size={48} />
            <p>
              Are you sure you want to delete this donation? This action cannot be undone,
              and the donation will be permanently removed from the database.
            </p>
          </div>

          <div className="dialog-actions">
            <button
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="delete-button"
              onClick={onConfirm}
            >
              <Trash2 size={16} />
              <span>Delete Permanently</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EnhancedFeesPopup = () => {
    if (!feesOpen) return null;

    return (
      <div className="popup-overlay">
        <div className="popup-content fees-popup enhanced-fees dark:bg-gray-900 dark:border dark:border-gray-700">
          <div className="popup-header dark:bg-green-700 bg-gradient-to-r from-green-600 to-green-400">
            <h2 className="text-white">Platform Fees - Mobile Banking Payment</h2>
            <button className="close-button text-white hover:text-neutral-100" onClick={() => setFeesOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="popup-body dark:bg-gray-900">
            {feesLoading ? (
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                <p className="dark:text-gray-300">Loading fee information...</p>
              </div>
            ) : (
              <>
                {/* ✅ NEW: Message display for different scenarios */}
                {feeData.message && (
                  <div className={`fee-message ${!feeData.canPay && feeData.alreadyPaid ? 'success' :
                    !feeData.success ? 'warning' : 'info'}`}>
                    <div className="message-content">
                      {!feeData.success ? (
                        <div className="warning-icon">⚠️</div>
                      ) : feeData.alreadyPaid ? (
                        <div className="success-icon">✅</div>
                      ) : (
                        <div className="info-icon">ℹ️</div>
                      )}
                      <p>{feeData.message}</p>
                    </div>
                  </div>
                )}

                {/* Fee Summary Card */}
                <div className="fees-summary enhanced-summary">
                  <div className="fee-balance-card bg-gradient-to-br from-green-500 to-green-600">
                    <div className="fee-type-badge">
                      <span className="fee-type-label">
                        {feeData.feeType === 'contractual' ? 'Fixed Amount' : 'Percentage Based'}
                      </span>
                    </div>
                    <h3 className="text-white opacity-90">
                      {feeData.alreadyPaid ? 'Payment Completed' : 'Fee Due'}
                    </h3>
                    <div className="balance-amount text-white">
                      ৳{(feeData.currentBalance || 0).toFixed(2)}
                    </div>

                    {feeData.feeType === 'percentage' && feeData.monthlyRevenue && (
                      <div className="calculation-details text-white opacity-80">
                        <small>
                          {feeData.feeAmount}% of ৳{feeData.monthlyRevenue.toFixed(2)} monthly revenue
                        </small>
                      </div>
                    )}

                    <div className="due-info text-white opacity-80">
                      For: {getMonthName(selectedPaymentMonth)}
                    </div>
                  </div>
                </div>

                {/* ✅ CONDITIONAL: Only show payment section if can pay */}
                {feeData.canPay && feeData.success && !feeData.alreadyPaid && (
                  <div className="payment-section enhanced-payment dark:bg-gray-800 dark:border dark:border-gray-700">
                    <h3 className="dark:text-white">Make Payment - Mobile Banking</h3>

                    <form onSubmit={handlePaymentSubmit} className="payment-form enhanced-form">
                      {/* Month Selection */}
                      <div className="form-group">
                        <label htmlFor="paymentMonth" className="dark:text-gray-300">Payment Month</label>
                        <select
                          id="paymentMonth"
                          value={selectedPaymentMonth}
                          onChange={(e) => handleMonthChange(e.target.value)}
                          className="form-select dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
                        >
                          {Array.from({ length: 12 }, (_, i) => {
                            const date = new Date();
                            date.setMonth(date.getMonth() - 6 + i);
                            const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                            const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                            return (
                              <option key={value} value={value}>{label}</option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Payment Amount Display */}
                      <div className="form-group">
                        <label className="dark:text-gray-300">Payment Amount</label>
                        <div className="amount-display dark:bg-gray-900 dark:border-gray-700">
                          <span className="currency-symbol">৳</span>
                          <span className="amount-value">{(feeData.currentBalance || 0).toFixed(2)}</span>
                          <small className="amount-note">
                            {feeData.feeType === 'contractual' ? 'Fixed monthly fee' : `${feeData.feeAmount}% of revenue`}
                          </small>
                        </div>
                      </div>

                      {/* Mobile Banking Methods */}
                      <div className="form-group">
                        <label className="dark:text-gray-300">Select Mobile Banking</label>
                        <div className="mobile-banking-methods">
                          <label className={`banking-method bkash ${mobilePaymentMethod === 'bkash' ? 'selected' : ''}`}>
                            <input
                              type="radio"
                              name="mobilePaymentMethod"
                              value="bkash"
                              checked={mobilePaymentMethod === 'bkash'}
                              onChange={() => setMobilePaymentMethod('bkash')}
                            />
                            <div className="banking-logo bkash-logo">
                              <span>bKash</span>
                            </div>
                            <span className="banking-name">bKash</span>
                          </label>

                          <label className={`banking-method nagad ${mobilePaymentMethod === 'nagad' ? 'selected' : ''}`}>
                            <input
                              type="radio"
                              name="mobilePaymentMethod"
                              value="nagad"
                              checked={mobilePaymentMethod === 'nagad'}
                              onChange={() => setMobilePaymentMethod('nagad')}
                            />
                            <div className="banking-logo nagad-logo">
                              <span>Nagad</span>
                            </div>
                            <span className="banking-name">Nagad</span>
                          </label>

                          <label className={`banking-method rocket ${mobilePaymentMethod === 'rocket' ? 'selected' : ''}`}>
                            <input
                              type="radio"
                              name="mobilePaymentMethod"
                              value="rocket"
                              checked={mobilePaymentMethod === 'rocket'}
                              onChange={() => setMobilePaymentMethod('rocket')}
                            />
                            <div className="banking-logo rocket-logo">
                              <span>Rocket</span>
                            </div>
                            <span className="banking-name">Rocket</span>
                          </label>
                        </div>
                      </div>

                      {/* Payment Instructions */}
                      <div className="payment-instructions dark:bg-gray-900 dark:border-gray-700">
                        <h4>Payment Instructions:</h4>
                        <ol>
                          <li>Select your preferred mobile banking service</li>
                          <li>Click "Pay Now" to proceed</li>
                          <li>You will be redirected to {mobilePaymentMethod.toUpperCase()} payment gateway</li>
                          <li>Complete payment using your mobile banking app</li>
                        </ol>
                      </div>

                      <button
                        type="submit"
                        className="pay-now-btn enhanced-pay-btn dark:bg-green-600 dark:hover:bg-green-700"
                        disabled={!feeData.currentBalance || paymentProcessing}
                      >
                        {paymentProcessing ? (
                          <>
                            <div className="payment-spinner"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <div className="payment-icon">
                              {mobilePaymentMethod === 'bkash' && <span>📱</span>}
                              {mobilePaymentMethod === 'nagad' && <span>💳</span>}
                              {mobilePaymentMethod === 'rocket' && <span>🚀</span>}
                            </div>
                            <span>Pay ৳{(feeData.currentBalance || 0).toFixed(2)} with {mobilePaymentMethod.toUpperCase()}</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Enhanced Payment History */}
                <div className="payment-history enhanced-history dark:bg-gray-800 dark:border dark:border-gray-700">
                  <h3 className="dark:text-gray-100">Payment History</h3>
                  {feeData.paymentHistory && feeData.paymentHistory.length === 0 ? (
                    <div className="empty-history dark:text-gray-400">No payment history available</div>
                  ) : (
                    <div className="payment-history-list">
                      {feeData.paymentHistory && feeData.paymentHistory.map(payment => (
                        <div key={payment.id} className="payment-record dark:border-gray-700">
                          <div className="payment-info">
                            <div className="payment-amount">৳{(payment.amount || 0).toFixed(2)}</div>
                            <div className="payment-month">{getMonthName(payment.paymentMonth)}</div>
                            <div className="payment-date">
                              {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-GB') : 'N/A'}
                            </div>
                            <div className="payment-day">
                              {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-US', { weekday: 'long' }) : ''}
                            </div>
                          </div>
                          <div className="payment-method-badge">
                            <span className={`method-label ${payment.paymentMethod}`}>
                              {(payment.paymentMethod || 'unknown').toUpperCase()}
                            </span>
                          </div>
                          <div className={`payment-status ${(payment.status || 'unknown').toLowerCase()}`}>
                            {payment.status === 'COMPLETED' ? 'PAID' : 'UNPAID'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="merchant-dashboard dark:bg-gray-900 dark:text-gray-100">
      {/* ========== MAIN CONTENT AREA ========== */}
      <main className="dashboard-main" style={{ paddingTop: '64px' }}>
        <div className="dashboard-content">

          {/* ========== COMPACT PREMIUM HEADER WITH PROMINENT MERCHANT INFO ========== */}
          <div className="compact-premium-header">
            <div className="merchant-info-section">
              <div className="merchant-avatar">
                <img
                  src={userProfile.avatar || 'https://randomuser.me/api/portraits/men/41.jpg'}
                  alt="Profile"
                  className="merchant-image"
                />
                <div className="status-indicator"></div>
              </div>
              <div className="merchant-details">
                <h1 className="merchant-name">
                  Welcome back, <span className="name-highlight">{userProfile.name || 'Merchant'}</span>
                </h1>
                <p className="current-date">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* ========== COMPACT ACTION BUTTONS ========== */}
            <div className="compact-actions-layout">

             {/* Updated JSX structure in MerchantDashboardPage.jsx */}
<div className="compact-actions-layout">
  {/* Main Action Buttons - 6 buttons total */}
  <div className="compact-main-actions">
    <button className="compact-action-btn fees-btn" onClick={handleFees}>
      <div className="compact-btn-icon">
        <Wallet size={18} />
      </div>
      <div className="compact-btn-text">
        <span className="btn-title">Pay Fees</span>
        <span className="btn-subtitle">Manage</span>
      </div>
    </button>

    <button className="compact-action-btn donations-btn" onClick={() => setDonationsOpen(true)}>
      <div className="compact-btn-icon">
        <Heart size={18} />
      </div>
      <div className="compact-btn-text">
        <span className="btn-title">My Donations</span>
        <span className="btn-subtitle">Track</span>
      </div>
    </button>

    <button className="compact-action-btn sales-btn" onClick={handleSalesHistory}>
      <div className="compact-btn-icon">
        <History size={18} />
      </div>
      <div className="compact-btn-text">
        <span className="btn-title">Sales History</span>
        <span className="btn-subtitle">Reports</span>
      </div>
    </button>

    <button className="compact-action-btn messages-btn" onClick={handleMessages}>
      <div className="compact-btn-icon">
        <MessageSquare size={18} />
        {messageStats.unreadMessages > 0 && (
          <div className="compact-notification-badge">
            {messageStats.unreadMessages > 99 ? '99+' : messageStats.unreadMessages}
          </div>
        )}
      </div>
      <div className="compact-btn-text">
        <span className="btn-title">Messages</span>
        <span className="btn-subtitle">Communications</span>
      </div>
    </button>

    <button className="compact-action-btn profile-btn" onClick={handleProfileUpdate}>
      <div className="compact-btn-icon">
        <Settings size={18} />
      </div>
      <div className="compact-btn-text">
        <span className="btn-title">Profile</span>
        <span className="btn-subtitle">Settings</span>
      </div>
    </button>

    <button className="compact-action-btn create-btn" onClick={() => handleOpenModal()}>
      <div className="compact-btn-icon">
        <Plus size={18} />
      </div>
      <div className="compact-btn-text">
        <span className="btn-title">Create Listing</span>
        <span className="btn-subtitle">Add new item</span>
      </div>
    </button>
  </div>

  {/* Logout moved to separate section */}
  <div className="compact-logout-section">
    <button className="compact-logout-btn" onClick={handleLogout}>
      <LogOut size={16} />
      <span>Logout</span>
    </button>
  </div>
</div>


            </div>
          </div>

          {/* ========== COMPACT BUSINESS OVERVIEW SECTION ========== */}
          <div className={`compact-overview-container ${statsVisible ? 'expanded' : 'collapsed'}`}>
            <div className="compact-overview-header">
              <div className="overview-title-section">
                <div className="overview-icon">
                  <Activity size={20} />
                </div>
                <div className="overview-title-content">
                  {statsVisible ? (
                    <>
                      <h3 className="overview-title">Business Overview</h3>
                      <p className="overview-subtitle">Real-time insights into your performance</p>
                    </>
                  ) : (
                    <>
                      <h3 className="overview-title">{userProfile.name || 'Merchant'} Overview</h3>
                      <p className="overview-subtitle">Click expand to view business insights</p>
                    </>
                  )}
                </div>
              </div>
              <button className="compact-toggle-btn" onClick={toggleStats}>
                <span className="toggle-text">{statsVisible ? 'Collapse' : 'Expand'}</span>
                <div className="toggle-icon">
                  {statsVisible ? <ChevronDown size={16} /> : <ArrowRight size={16} />}
                </div>
              </button>
            </div>

            {statsVisible && (
              <div className="compact-stats-grid">
                {/* Items Sold Card */}
                <div className="compact-stat-card items-sold-card">
                  <div className="compact-stat-header">
                    <div className="compact-stat-icon">
                      <Package size={20} />
                    </div>
                    <div className="compact-trend positive">+12%</div>
                  </div>
                  <div className="compact-stat-content">
                    {overviewStats.loading ? (
                      <div className="compact-loading">
                        <div className="loading-pulse"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <>
                        <h4 className="compact-stat-number">{getTotalItemsSold().toLocaleString()}</h4>
                        <p className="compact-stat-label">Total Items Sold</p>
                        <span className="compact-stat-sublabel">Lifetime performance</span>
                      </>
                    )}
                  </div>
                  <div className="compact-progress">
                    <div className="compact-progress-fill" style={{ width: '75%' }}></div>
                  </div>
                </div>

                {/* Active Listings Card */}
                <div className="compact-stat-card active-listings-card">
                  <div className="compact-stat-header">
                    <div className="compact-stat-icon">
                      <Tag size={20} />
                    </div>
                    <div className="compact-trend neutral">0%</div>
                  </div>
                  <div className="compact-stat-content">
                    {overviewStats.loading ? (
                      <div className="compact-loading">
                        <div className="loading-pulse"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <>
                        <h4 className="compact-stat-number">{getActiveListings()}</h4>
                        <p className="compact-stat-label">Active Listings</p>
                        <span className="compact-stat-sublabel">Available items</span>
                      </>
                    )}
                  </div>
                  <div className="compact-progress">
                    <div className="compact-progress-fill" style={{ width: '60%' }}></div>
                  </div>
                </div>

                {/* Total Revenue Card */}
                <div className="compact-stat-card revenue-card">
                  <div className="compact-stat-header">
                    <div className="compact-stat-icon">
                      <DollarSign size={20} />
                    </div>
                    <div className="compact-trend positive">+24%</div>
                  </div>
                  <div className="compact-stat-content">
                    {overviewStats.loading ? (
                      <div className="compact-loading">
                        <div className="loading-pulse"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <>
                        <h4 className="compact-stat-number">৳{getTotalRevenue()}</h4>
                        <p className="compact-stat-label">Total Revenue</p>
                        <span className="compact-stat-sublabel">All-time earnings</span>
                      </>
                    )}
                  </div>
                  <div className="compact-progress">
                    <div className="compact-progress-fill" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========== SEARCH AND FILTER SECTION ========== */}
          <div className="action-bar">
            <div className="search-filter">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search food items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="category-filter">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="all">All Categories</option>
                  <option value="restaurant">Restaurant & Café</option>
                  <option value="grocery">Grocery Store</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* ========== FOOD ITEMS CARDS GRID ========== */}
          <div className="food-cards">
            {filteredItems.length === 0 ? (
              <div className="no-items">
                <div className="no-items-content">
                  <AlertCircle size={48} />
                  <h3>No food listings available</h3>
                  <p>Create your first food listing to reduce waste and help your community</p>
                </div>
              </div>
            ) : (
              filteredItems.map((item) => {

                const remainingQuantity = item.remainingQuantity !== undefined
                  ? item.remainingQuantity
                  : item.quantity;
                const remainingPercentage = item.quantity > 0
                  ? (remainingQuantity / item.quantity) * 100
                  : 0;
                return (
                  <div className={`food-card ${item.isPaused ? 'paused' : ''}`} key={item.id}>

                    <div className="food-card-image">
                      <img
                        src={item.imageUrl || (item.imageBase64 && item.imageContentType ? `data:${item.imageContentType};base64,${item.imageBase64}` : 'https://via.placeholder.com/300x200')}
                        alt={item.name}
                      />
                      <div className="food-card-category">
                        {getCategoryIcon(item.foodCategory)}
                        <span>{getFoodCategoryLabel(item.foodCategory)}</span>
                      </div>
                      {/* Paused Status Badge */}
                      {item.isPaused && (
                        <div className="paused-badge">
                          Paused
                        </div>
                      )}

                      <div className="food-card-price">
                        <span>{item.price}Tk</span>
                      </div>
                    </div>
                    <div className="food-card-content">
                      <h3 className="food-card-title">{item.name}</h3>
                      <div className="food-card-details">
                        <div className="detail-item">
                          <Store size={14} />
                          <span>{item.storeName}</span>
                        </div>
                        <div className="detail-item">
                          <MapPin size={14} />
                          <span>{item.location}</span>
                        </div>
                      </div>
                      <div className="food-card-details">
                        <div className="detail-item">
                          <Clock size={14} />
                          <span>Ready: {item.makingTime}</span>
                        </div>
                        <div className="detail-item">
                          <Tag size={14} />
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>

                      <div className="food-dietary-tags">
                        <span>Dietary Information: </span>
                        {item.dietaryInfo.map(tag => (
                          <span key={tag} className="dietary-tag">{tag}</span>
                        ))}
                      </div>

                      {/* Remaining Quantity Section */}
                      <div className="food-card-quantity">
                        <div className="quantity-label">Remaining Quantity:</div>
                        <div className="quantity-bar-container">
                          <div className="quantity-values">
                            <span className="remaining-value">{remainingQuantity}</span>
                            <span className="total-value">/ {item.quantity}</span>
                          </div>
                          <div className="quantity-bar-background">
                            <div
                              className="quantity-bar-fill"
                              style={{ width: `${remainingPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Food Card Action Buttons */}
                    <div className="food-card-actions">
                      <button
                        className="card-action-btn edit"
                        onClick={() => handleOpenModal(item)}
                        aria-label="Edit"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="card-action-btn delete"
                        onClick={() => handleDelete(item.id)}
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                      <button
                        className="card-action-btn pause"
                        onClick={() => togglePause(item.id)}
                        aria-label={item.isPaused ? "Resume" : "Pause"}
                      >
                        {item.isPaused ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
                        <span>{item.isPaused ? "Resume" : "Pause"}</span>
                      </button>
                      <button
                        className="card-action-btn donate"
                        onClick={() => handleOpenDonateModal(item)}
                        aria-label="Donate"
                      >
                        <Heart size={16} />
                        <span>Donate</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>


      {/* ========== MODAL FORM FOR CREATING/EDITING ITEMS ========== */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h2>{currentItem.id ? 'Edit Food Listing' : 'Create New Food Listing'}</h2>
              <button className="close-button" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            {/* Food Item Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3 className="form-section-title">Basic Information</h3>

                <div className="form-group">
                  <label htmlFor="foodCategory">Food Source Category*</label>
                  <select
                    id="foodCategory"
                    name="foodCategory"
                    value={currentItem.foodCategory}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="restaurant">Restaurant & Café Surplus</option>
                    <option value="grocery">Grocery Store Excess</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="name">Food Item Name*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={currentItem.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="foodType">Food Type*</label>
                  <input
                    type="text"
                    id="foodType"
                    name="foodType"
                    placeholder="e.g., Bakery, Italian, Dessert"
                    value={currentItem.foodType}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Price (in BD)*</label>
                    <div className="price-input">
                      <input
                        type="number"
                        id="price"
                        name="price"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={currentItem.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="quantity">Quantity Available*</label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="1"
                      value={currentItem.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description*</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe your food item in detail..."
                    value={currentItem.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-section">
                <h3 className="form-section-title">Store & Location Details</h3>
                <div className="form-group">
                  <label htmlFor="storeName">Store/Restaurant Name*</label>
                  <input
                    type="text"
                    id="storeName"
                    name="storeName"
                    value={currentItem.storeName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location*</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    placeholder="Address or area"
                    value={currentItem.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-section">
                <h3 className="form-section-title">Timing & Dietary Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="makingTime">Ready By Time*</label>
                    <input
                      type="time"
                      id="makingTime"
                      name="makingTime"
                      value={currentItem.makingTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="deliveryTime">Preparing Time*</label>
                    <input
                      type="text"
                      id="deliveryTime"
                      name="deliveryTime"
                      placeholder="e.g., 14:00-16:00"
                      value={currentItem.deliveryTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date*</label>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={currentItem.expiryDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Dietary Information (Optional)</label>
                  <div className="dietary-options">
                    {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Halal'].map(option => (
                      <label key={option} className="dietary-option">
                        <input
                          type="checkbox"
                          checked={currentItem.dietaryInfo?.includes(option) || false}
                          onChange={() => handleDietaryChange(option, 'foodItem')}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-section">
                <h3 className="form-section-title">Food Image</h3>

                <div className="form-group">
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                  />
                  <button
                    type="button"
                    className="upload-button"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <Upload size={16} />
                    Upload Image
                  </button>

                  <div className="image-preview">
                    {currentItem.imageUrl && (
                      <img src={currentItem.imageUrl} alt="Preview" />
                    )}
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {currentItem.id ? 'Update Listing' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== NEW FEES POPUP ========== */}
      {feesOpen && <EnhancedFeesPopup />}

      {selectedMainTab === 'donations' && (
        <div className="merchant-donations-container">
          <div className="donations-header">
            <h2>My Donations</h2>
            <div className="donations-tabs">
              <button
                className={`donation-tab ${donationsSubTab === 'active' ? 'active' : ''}`}
                onClick={() => setDonationsSubTab('active')}
              >
                Active
              </button>
              <button
                className={`donation-tab ${donationsSubTab === 'pending' ? 'active' : ''}`}
                onClick={() => setDonationsSubTab('pending')}
              >
                Pending
              </button>
              <button
                className={`donation-tab ${donationsSubTab === 'rejected' ? 'active' : ''}`}
                onClick={() => setDonationsSubTab('rejected')}
              >
                Rejected
              </button>
              <button
                className={`donation-tab ${donationsSubTab === 'completed' ? 'active' : ''}`}
                onClick={() => setDonationsSubTab('completed')}
              >
                Completed
              </button>
            </div>
          </div>
          {donationLoading ? (
            <div className="loading-indicator">
              <span className="loading-spinner"></span>
              <span>Loading donations...</span>
            </div>
          ) : donationError ? (
            <div className="error-message">
              <AlertCircle className="h-5 w-5" />
              <span>{donationError}</span>
            </div>
          ) : (
            <div className="donations-grid">
              {(() => {
                let displayDonations = [];
                switch (donationsSubTab) {
                  case 'active':
                    displayDonations = merchantDonations;
                    break;
                  case 'pending':
                    displayDonations = pendingDonations;
                    break;
                  case 'rejected':
                    displayDonations = rejectedDonations;
                    break;
                  case 'completed':
                    displayDonations = completedDonations;
                    break;
                  default:
                    displayDonations = merchantDonations;
                }
                if (displayDonations.length === 0) {
                  return (
                    <div className="no-donations-message">
                      <Heart className="h-12 w-12 text-gray-300" />
                      <h3>No {donationsSubTab} donations</h3>
                      <p>Donations you make will appear here</p>
                    </div>
                  );
                }
                return displayDonations.map(donation => (
                  <div key={donation.id} className="donation-card">
                    <div className="donation-image">
                      <img src={donation.imageUrl} alt={donation.foodName} />
                      <div className={`status-badge ${donation.status.toLowerCase()}`}>
                        {donation.status}
                      </div>
                    </div>
                    <div className="donation-content">
                      <h3 className="donation-title">{donation.foodName}</h3>
                      <div className="donation-meta">
                        <div className="meta-item">
                          <Tag className="h-4 w-4" />
                          <span>{donation.category}</span>
                        </div>
                        <div className="meta-item">
                          <Package className="h-4 w-4" />
                          <span>{donation.quantity}</span>
                        </div>
                      </div>
                      <div className="donation-details">
                        <div className="detail-item">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>Expires: {new Date(donation.expiry).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-item">
                          <MapPin className="h-4 w-4 text-red-500" />
                          <span>{donation.location}</span>
                        </div>
                      </div>

                      <div className="donation-actions">
                        {donationsSubTab === 'active' && (
                          <>
                            <button
                              className="card-action-btn check-requests"
                              onClick={() => handleCheckRequests(donation)}
                            >
                              <Users className="h-4 w-4" />
                              <span>Requests</span>
                            </button>

                            {/* New View Button */}
                            <button
                              className="card-action-btn view"
                              onClick={() => handleViewDonation(donation)}
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>

                            {/* New Edit Button */}
                            <button
                              className="card-action-btn edit"
                              onClick={() => handleEditDonation(donation)}
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>

                            {/* New Delete Button */}
                            <button
                              className="card-action-btn delete"
                              onClick={() => handleDeleteDonation(donation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}

                        {/* Existing buttons for other tabs */}
                        {donationsSubTab === 'pending' && (
                          <button
                            className="action-btn mark-complete"
                            onClick={() => handleMarkAsCompleted(donation.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Mark Complete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      )}

      {salesHistoryOpen && <SalesHistoryModal />}

      {/* ========== MESSAGES POPUP ========== */}

      {messagesOpen && (
        <div className="popup-overlay">
          <div className="popup-content messages-popup">
            <div className="popup-header">
              <h2>
                Messages
                {messageTab === 'received' && receivedMessages.filter(msg => !msg.read).length > 0 && (
                  <span className="unread-badge">({receivedMessages.filter(msg => !msg.read).length} unread)</span>
                )}
              </h2>
              <div className="header-actions">
                <button
                  className="action-btn compose-btn"
                  onClick={() => {
                    setMessagesOpen(false);
                    setShowNewMessageModal(true);
                  }}
                >
                  <Plus size={18} />
                  <span>New Message</span>
                </button>
                {/* UPDATED CLOSE BUTTON WITH handleCloseMessages */}
                <button className="close-button" onClick={handleCloseMessages}>
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Message Tabs */}
            <div className="message-tabs">
              <button
                className={`message-tab ${messageTab === 'received' ? 'active' : ''}`}
                onClick={() => setMessageTab('received')}
              >
                <MessageSquare size={16} />
                <span>My Messages</span>
                {receivedMessages.filter(msg => !msg.read).length > 0 && (
                  <span className="tab-badge">{receivedMessages.filter(msg => !msg.read).length}</span>
                )}
              </button>
              <button
                className={`message-tab ${messageTab === 'sent' ? 'active' : ''}`}
                onClick={() => setMessageTab('sent')}
              >
                <Send size={16} />
                <span>Sent</span>
                <span className="tab-count">({sentMessages.length})</span>
              </button>
            </div>

            <div className="popup-body messages-container">
              {messagesLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <h3>Loading Messages...</h3>
                </div>
              ) : (messageTab === 'sent' ? sentMessages : receivedMessages).length === 0 ? (
                <div className="empty-state">
                  {messageTab === 'sent' ? (
                    <>
                      <Send size={48} />
                      <h3>No Sent Messages</h3>
                      <p>Messages you send will appear here</p>
                    </>
                  ) : (
                    <>
                      <MessageSquare size={48} />
                      <h3>No Received Messages</h3>
                      <p>Messages from admin and donors will appear here</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="messages-layout">
                  <div className="message-list">
                    {(messageTab === 'sent' ? sentMessages : receivedMessages).map(message => (
                      <div
                        key={message.id}
                        className={`message-item ${!message.read && messageTab === 'received' ? 'unread' : ''}`}
                      >
                        <div className="message-header">
                          <div className="message-sender">
                            <div className="sender-avatar">
                              <img src={message.senderAvatar} alt="Avatar" />
                            </div>
                            <div className="sender-info">
                              <h4>{message.sender}</h4>
                              <p className="message-role">{message.role?.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className="message-meta">
                            <span className="message-date">{message.date}</span>
                            <span className="message-time">{message.time}</span>
                            {!message.read && messageTab === 'received' && (
                              <span className="unread-indicator">●</span>
                            )}
                          </div>
                        </div>

                        <div className="message-content">
                          <h5 className="message-subject">{message.subject}</h5>
                          <p className="message-preview">
                            {message.message?.length > 100
                              ? message.message.substring(0, 100) + '...'
                              : message.message}
                          </p>

                          {message.hasAttachment && (
                            <div className="attachment-indicator">
                              <Package size={14} />
                              <span>{message.fileName}</span>
                            </div>
                          )}
                        </div>

                        <div className="message-actions">
                          <button
                            className="message-action-btn view"
                            onClick={() => handleViewMessage(message)}
                          >
                            <Eye size={16} />
                            <span>View</span>
                          </button>

                          {messageTab === 'sent' ? (
                            <button
                              className="message-action-btn delete"
                              onClick={() => handleDeleteSentMessage(message.id)}
                            >
                              <Trash2 size={16} />
                              <span>Delete</span>
                            </button>
                          ) : (
                            <button
                              className="message-action-btn ignore"
                              onClick={() => handleIgnoreMessage(message.id)}
                            >
                              <X size={16} />
                              <span>Ignore</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== MESSAGE VIEW MODAL ========== */}
      {showMessageViewModal && selectedMessageForView && (
        <div className="modal-overlay">
          <div className="modal-content message-view-modal">
            <div className="modal-header">
              <h2>{selectedMessageForView.subject}</h2>
              <button
                className="close-button"
                onClick={() => setShowMessageViewModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="message-details">
                <div className="message-info-row">
                  <div className="info-item">
                    <span className="label">From:</span>
                    <span className="value">{selectedMessageForView.sender}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Date:</span>
                    <span className="value">
                      {selectedMessageForView.date} at {selectedMessageForView.time}
                    </span>
                  </div>
                </div>

                <div className="message-info-row">
                  <div className="info-item">
                    <span className="label">Type:</span>
                    <span className="value">{selectedMessageForView.role?.replace('_', ' ')}</span>
                  </div>
                  {selectedMessageForView.hasAttachment && (
                    <div className="info-item">
                      <span className="label">Attachment:</span>
                      <span className="value">
                        <Package size={14} />
                        {selectedMessageForView.fileName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="message-body">
                  <h4>Message:</h4>
                  <div className="message-text">
                    {selectedMessageForView.message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW MESSAGE MODAL - Make sure this renders */}
      {showNewMessageModal && <NewMessageModal />}

      {/* ========== PROFILE MANAGEMENT POPUP ========== */}
      {profileOpen && (
        <div className="popup-overlay">
          <div className="popup-content profile-popup">
            <div className="popup-header">
              <h2>Profile Management</h2>
              <button className="close-button" onClick={() => setProfileOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="popup-body">
              {profileLoading && !profileError ? (
                <div className="loading-spinner-container">
                  <div className="loading-spinner"></div>
                  <p>Loading profile data...</p>
                </div>
              ) : profileError ? (
                <div className="error-message">
                  <AlertCircle size={24} />
                  <p>{profileError}</p>
                  <button
                    className="retry-button"
                    onClick={() => {
                      setProfileError('');
                      setProfileOpen(false);
                      setTimeout(() => setProfileOpen(true), 100);
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleProfileSubmit} className="profile-form">
                  {profileSuccess && (
                    <div className="success-message">
                      <CheckCircle size={24} />
                      <p>{profileSuccess}</p>
                    </div>
                  )}
                  <div className="profile-avatar-section">
                    <div className="avatar-container">
                      <img src={userProfile.avatar} alt="Profile" className="profile-avatar" />
                      <button
                        type="button"
                        className="avatar-edit-btn"
                        onClick={handleAvatarUpload}
                      >
                        <Camera size={18} />
                      </button>
                      <input
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleAvatarFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                  <div className="form-section">
                    <h3 className="form-section-title">Personal Information</h3>
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={userProfile.name}
                        onChange={handleProfileChange}
                        required
                        className="profile-input"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={userProfile.email}
                          onChange={handleProfileChange}
                          required
                          className="profile-input"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={userProfile.phone}
                          onChange={handleProfileChange}
                          required
                          className="profile-input"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-section">
                    <h3 className="form-section-title">Business Information</h3>
                    <div className="form-group">
                      <label htmlFor="storeName">Store/Restaurant Name</label>
                      <input
                        type="text"
                        id="storeName"
                        name="storeName"
                        value={userProfile.storeName}
                        onChange={handleProfileChange}
                        required
                        className="profile-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="businessType">Business Type</label>
                      <input
                        type="text"
                        id="businessType"
                        name="businessType"
                        value={userProfile.businessType}
                        onChange={handleProfileChange}
                        required
                        className="profile-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="businessLicenseNumber">Business License Number</label>
                      <input
                        type="text"
                        id="businessLicenseNumber"
                        name="businessLicenseNumber"
                        value={userProfile.businessLicenseNumber}
                        onChange={handleProfileChange}
                        required
                        className="profile-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address">Business Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={userProfile.address}
                        onChange={handleProfileChange}
                        required
                        className="profile-input"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={userProfile.city}
                          onChange={handleProfileChange}
                          required
                          className="profile-input"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="stateProvince">State/Province</label>
                        <input
                          type="text"
                          id="stateProvince"
                          name="stateProvince"
                          value={userProfile.stateProvince}
                          onChange={handleProfileChange}
                          required
                          className="profile-input"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="postalCode">Postal Code</label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={userProfile.postalCode}
                          onChange={handleProfileChange}
                          required
                          className="profile-input"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="bio">Business Description</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={userProfile.bio}
                        onChange={handleProfileChange}
                        placeholder="Describe your business in a few sentences..."
                        rows={4}
                        className="profile-textarea"
                      ></textarea>
                    </div>
                  </div>
                  <div className="form-section">
                    <h3 className="form-section-title">Account Settings</h3>
                    <div className="settings-actions">
                      <button type="button" className="setting-action-btn">
                        Change Password
                      </button>
                      <button type="button" className="setting-action-btn">
                        Privacy Settings
                      </button>
                      <button type="button" className="setting-action-btn">
                        Notification Preferences
                      </button>
                    </div>
                  </div>

                  <div className="form-actions profile-actions">
                    <button type="button" className="cancel-button" onClick={() => setProfileOpen(false)}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        <>
                          <span className="button-spinner"></span>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ========== DONATION MODAL ========== */}
      {isDonateModalOpen && donationItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Donate {donationItem.name}</h2>
              <button className="close-button" onClick={handleCloseDonateModal}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleDonationSubmit}>
              <div className="form-section">
                <h3 className="form-section-title">Basic Food Information</h3>

                <div className="form-group">
                  <label htmlFor="donationCategory">Donation Category*</label>
                  <select
                    id="donationCategory"
                    name="donationCategory"
                    value={donationData.donationCategory || mapFoodCategoryToDonationCategory(donationItem.foodCategory)}
                    onChange={handleDonationInputChange}
                    required
                  >
                    <option value="RESTAURANT_SURPLUS">Restaurant & Café Surplus</option>
                    <option value="GROCERY_EXCESS">Grocery Store Excess</option>
                    <option value="EVENT_LEFTOVER">Event & Wedding Leftovers</option>
                    <option value="CORPORATE_DONATION">Corporate & Office Donations</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="foodName">Food Name*</label>
                  <input
                    type="text"
                    id="foodName"
                    name="foodName"
                    value={donationData.foodName || donationItem.name}
                    onChange={handleDonationInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="quantity">Quantity*</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max={donationData.maxQuantity}
                    value={donationData.quantity}
                    onChange={handleDonationInputChange}
                    required
                  />
                  <small>Available: {donationData.maxQuantity}</small>
                </div>

                <div className="form-group">
                  <label htmlFor="foodType">Food Type*</label>
                  <input
                    type="text"
                    id="foodType"
                    name="foodType"
                    placeholder="Restaurant, takeout, etc."
                    value={donationData.foodType || donationItem.foodType}
                    onChange={handleDonationInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Add any additional details about the food"
                    value={donationData.description || donationItem.description}
                    onChange={handleDonationInputChange}
                  />
                </div>
              </div>
              <div className="form-section">
                <h3 className="form-section-title">Dates & Storage</h3>
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date & Time*</label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={donationData.expiryDate || donationItem.expiryDate}
                    onChange={handleDonationInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="preparationDate">Preparation Date*</label>
                  <input
                    type="date"
                    id="preparationDate"
                    name="preparationDate"
                    value={donationData.preparationDate || new Date().toISOString().split('T')[0]}
                    onChange={handleDonationInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="packaging">Packaging</label>
                  <input
                    type="text"
                    id="packaging"
                    name="packaging"
                    placeholder="Plastic container, paper bag, etc."
                    value={donationData.packaging || ''}
                    onChange={handleDonationInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="storageInstructions">Storage Instructions</label>
                  <input
                    type="text"
                    id="storageInstructions"
                    name="storageInstructions"
                    placeholder="Refrigerate, keep at room temperature, etc."
                    value={donationData.storageInstructions || ''}
                    onChange={handleDonationInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Dietary Information</label>
                  <div className="dietary-options">
                    {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Halal'].map(option => (
                      <label key={option} className="dietary-option">
                        <input
                          type="checkbox"
                          name="dietaryInfo"
                          value={option}
                          checked={donationData.dietaryInfo?.includes(option) || donationItem.dietaryInfo?.includes(option) || false}
                          onChange={handleDietaryChange}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-section">
                <h3 className="form-section-title">Location</h3>

                <div className="form-group">
                  <label htmlFor="location">Location*</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    placeholder="Your pickup location"
                    value={donationData.location || donationItem.location}
                    onChange={handleDonationInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-section">
                <h3 className="form-section-title">Additional Notes</h3>

                <div className="form-group">
                  <label htmlFor="notes">Special Notes (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    placeholder="Any special handling or preparation notes..."
                    value={donationData.notes || ''}
                    onChange={handleDonationInputChange}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={handleCloseDonateModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={donationData.quantity < 1 || donationData.quantity > donationData.maxQuantity}
                >
                  <Heart size={16} />
                  <span>Create Donation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showRequestsModal && <DonationRequestsModal />}

      {/* Adding the View Donation Modal */}
      {viewDonationModalOpen && (
        <ViewDonationModal
          isOpen={viewDonationModalOpen}
          onClose={() => {
            setViewDonationModalOpen(false);
            // Only reopen donations if that's where we came from
            if (modalSource === 'donations') {
              // Use setTimeout to ensure proper state update sequencing
              setTimeout(() => {
                setDonationsOpen(true);
                setModalSource(null); // Reset the source
              }, 10);
            }
          }}
          donation={selectedDonation}
        />

      )}

      {/* Adding the Edit Donation Modal */}
      {editDonationModalOpen && (
        <EditDonationModal
          isOpen={editDonationModalOpen}
          onClose={() => {
            setEditDonationModalOpen(false);
            if (modalSource === 'donations') {
              setTimeout(() => {
                setDonationsOpen(true);
                setModalSource(null); // Reset the source
              }, 10);
            }
          }}
          donation={selectedDonation}
          onSave={handleSaveDonationEdit}
        />
      )}

      {/* Adding the Delete Confirmation Dialog */}
      {deleteConfirmationOpen && (
        <DeleteConfirmationDialog
          isOpen={deleteConfirmationOpen}
          onClose={() => {
            setDeleteConfirmationOpen(false);
            setDonationToDelete(null);

            if (modalSource === 'donations') {
              setTimeout(() => {
                setDonationsOpen(true);
                setModalSource(null);
              }, 10);
            }
          }}
          onConfirm={confirmDeleteDonation}
        />
      )}

      {donationsOpen && (
        <DonationsPopup
          isOpen={donationsOpen}
          onClose={() => setDonationsOpen(false)}
          donationsSubTab={donationsSubTab}
          setDonationsSubTab={setDonationsSubTab}
          merchantDonations={merchantDonations}
          pendingDonations={pendingDonations}
          rejectedDonations={rejectedDonations}
          completedDonations={completedDonations}
          donationLoading={donationLoading}
          donationError={donationError}
          handleCheckRequests={handleCheckRequests}
          handleMarkAsCompleted={handleMarkAsCompleted}
            handleViewDonation={handleViewDonation}
    handleEditDonation={handleEditDonation}
    handleDeleteDonation={handleDeleteDonation}

        />
      )}
    </div>
  );
};

export default MerchantDashboard;

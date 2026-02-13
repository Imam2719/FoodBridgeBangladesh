import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Users, Utensils, ArrowRight, MapPin,
  Clock, ShieldCheck, Share2, Gift, Award,
  ArrowDown, Sparkles, CheckCircle2, Star,
  Store, Coffee, ShoppingBag, HeartHandshake, Calendar,
  Building, User, AlertCircle, LucideBarChart4, Truck,
  ChevronRight, ExternalLink, Bookmark, Bell, MessageSquare, Send, Building2,
  Paperclip, Image, FileText, X, Upload, DollarSign, TrendingUp,
  Zap, Crown, Package, LogIn
} from 'lucide-react';
import '../style/HomePage.css';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://foodbridgebangladesh-9ehu.onrender.com/api'
  : 'http://localhost:8080/api';

const HomePage = () => {

  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [contactMessage, setContactMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statistics, setStatistics] = useState({
    mealsShared: '0',
    activeDonors: '0',
    foodSellers: '0',
    totalFoodSell: '0'
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch(`${API_BASE_URL}/statistics/homepage`);
      const data = await response.json();

      if (response.ok) {
        setStatistics({
          mealsShared: data.mealsShared || '0',
          activeDonors: data.activeDonors || '0',
          foodSellers: data.foodSellers || '0',
          totalFoodSell: data.totalFoodSell || '0'
        });
      } else {
        console.error('Failed to fetch statistics:', data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);

    // Fetch statistics on component mount
    fetchStatistics();

    // Auto rotate active index for the statistics
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 4);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setIsVisible(true);

    // Auto rotate active index for the statistics
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 4);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const stats = [
    {
      icon: Utensils,
      number: statistics.mealsShared,
      label: 'Meals Shared',
      description: 'Total donations made to help those in need',
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      icon: Users,
      number: statistics.activeDonors,
      label: 'Active Users',
      description: 'Registered donors and receivers combined',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Store,
      number: statistics.foodSellers,
      label: 'Food Sellers',
      description: 'Verified merchants offering food services',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: Package,
      number: statistics.totalFoodSell,
      label: 'Total Food Sales',
      description: 'Successfully completed food transactions',
      color: 'text-orange-600 bg-orange-100'
    },
  ];

  const donateFoodCards = [
    {
      icon: User,
      title: 'Homemade Food',
      description: 'Share your home-cooked meals with those in need. Make a meaningful impact in your community by donating fresh, homemade food prepared with care.',
      buttonText: 'Donate Homemade Food',
      color: 'border-l-4 border-emerald-400',
      iconColor: 'text-emerald-600 bg-emerald-100',
      category: 'HOMEMADE_FOOD'
    },
    {
      icon: Store,
      title: 'Restaurant & Café Surplus',
      description: 'Restaurants and cafés can donate unsold food that is still safe to consume instead of throwing it away. Reduce waste and help those in need.',
      buttonText: 'Donate as Restaurant',
      color: 'border-l-4 border-orange-400',
      iconColor: 'text-orange-600 bg-orange-100',
      category: 'RESTAURANT_SURPLUS'
    },
    {
      icon: Building2,
      title: 'Corporate & Office Donations',
      description: 'Donate excess food from corporate events, meetings, and office gatherings. Convert your surplus into meaningful support for communities.',
      buttonText: 'Donate as Organization',
      color: 'border-l-4 border-blue-400',
      iconColor: 'text-blue-600 bg-blue-100',
      category: 'CORPORATE_DONATION'
    },
    {
      icon: ShoppingBag,
      title: 'Grocery Store Excess',
      description: 'Grocery stores can donate unsold but perfectly good food items that would otherwise go to waste. Help reduce food waste while feeding those in need.',
      buttonText: 'Donate Grocery Items',
      color: 'border-l-4 border-green-400',
      iconColor: 'text-green-600 bg-green-100',
      category: 'GROCERY_EXCESS'
    },
    {
      icon: Calendar,
      title: 'Event & Wedding Leftovers',
      description: 'Put leftover food from events, weddings, and celebrations to good use. Share the joy of your special occasions by donating excess food.',
      buttonText: 'Donate Event Leftovers',
      color: 'border-l-4 border-purple-400',
      iconColor: 'text-purple-600 bg-purple-100',
      category: 'EVENT_LEFTOVER'
    },
    {
      icon: Gift,
      title: 'Purchased Food for Donation',
      description: 'Buy food specifically to donate to those in need. Make a direct impact by purchasing nutritious items that will help support vulnerable individuals and families.',
      buttonText: 'Donate Purchased Food',
      color: 'border-l-4 border-red-400',
      iconColor: 'text-red-600 bg-red-100',
      category: 'PURCHASED_FOOD'
    }
  ];

  const needFoodCards = [
    {
      icon: AlertCircle,
      title: 'Emergency Food Assistance',
      description: 'Request immediate food assistance during personal emergencies, disasters, or urgent situations. We prioritize critical needs.',
      buttonText: 'Request Emergency Help',
      color: 'border-l-4 border-red-400',
      iconColor: 'text-red-600 bg-red-100',
      requestType: 'emergency'
    },
    {
      icon: Users,
      title: 'Individual Food Request',
      description: 'Individuals and families experiencing food insecurity can request food donations to meet their immediate needs.',
      buttonText: 'Request as Individual',
      color: 'border-l-4 border-blue-400',
      iconColor: 'text-blue-600 bg-blue-100',
      requestType: 'individual'
    },
    {
      icon: Calendar,
      title: 'Regular Food Support',
      description: 'Apply for consistent food assistance through our programs for ongoing support to address long-term food insecurity.',
      buttonText: 'Apply for Support',
      color: 'border-l-4 border-amber-400',
      iconColor: 'text-amber-600 bg-amber-100',
      requestType: 'regular'
    },
    {
      icon: Building2,
      title: 'Community & NGO Requests',
      description: 'NGOs, shelters, and community organizations can request bulk food donations to support vulnerable populations they serve.',
      buttonText: 'Request as Organization',
      color: 'border-l-4 border-purple-400',
      iconColor: 'text-purple-600 bg-purple-100',
      requestType: 'organization'
    },
    {
      icon: Award,
      title: 'Event-Based Food Support',
      description: 'Request food assistance for community events, disaster relief, or special occasions serving those in need.',
      buttonText: 'Request for Event',
      color: 'border-l-4 border-green-400',
      iconColor: 'text-green-600 bg-green-100',
      requestType: 'event'
    },
    {
      icon: Truck,
      title: 'Delivery Request',
      description: 'Request food delivery service for those with mobility limitations or transportation challenges.',
      buttonText: 'Request Delivery',
      color: 'border-l-4 border-teal-400',
      iconColor: 'text-teal-600 bg-teal-100',
      requestType: 'delivery'
    }
  ];

  const howItWorksSteps = [
    {
      number: '01',
      title: 'Simple Registration',
      description: 'Sign up as a donor or receiver within minutes using our secure and straightforward process.',
      icon: CheckCircle2,
      color: 'text-emerald-500'
    },
    {
      number: '02',
      title: 'List or Request Food',
      description: 'Donors can easily list available food while those in need can browse and request meals through our intuitive interface.',
      icon: ShoppingBag,
      color: 'text-blue-500'
    },
    {
      number: '03',
      title: 'Smart Matching',
      description: 'Our system intelligently connects food donors with receivers based on location, needs, and food type.',
      icon: HeartHandshake,
      color: 'text-purple-500'
    },
    {
      number: '04',
      title: 'Safe Distribution',
      description: 'Food is distributed following strict safety protocols, either through pickup or our volunteer delivery network.',
      icon: Truck,
      color: 'text-orange-500'
    }
  ];

  const sellFoodFeatures = [
    {
      icon: DollarSign,
      title: 'Earn While Helping',
      description: 'Sell your homemade food, surplus inventory, or catering services at competitive prices.',
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Reach new customers and expand your food business through our platform.',
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      icon: Heart,
      title: 'Community Impact',
      description: 'Contribute to reducing food waste while building sustainable income streams.',
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      icon: Crown,
      title: 'Premium Listing',
      description: 'Get featured placement and enhanced visibility for your food listings.',
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    }
  ];

  const impactAreas = [
    {
      icon: Building,
      title: 'Urban Communities',
      description: 'Supporting vulnerable populations in densely populated areas with immediate food assistance.',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      stats: '15+ cities'
    },
    {
      icon: MapPin,
      title: 'Rural Areas',
      description: 'Extending our reach to underserved rural communities with limited access to resources.',
      color: 'bg-green-50 border-green-200 text-green-700',
      stats: '25+ villages'
    },
    {
      icon: Users,
      title: 'Disaster Response',
      description: 'Providing rapid food distribution during natural disasters and emergency situations.',
      color: 'bg-red-50 border-red-200 text-red-700',
      stats: '10+ emergencies'
    }
  ];

  const handleFileAttachment = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type.startsWith('image/') ? 'image' : 'file'
    }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (!contactEmail.trim()) {
      alert('Please enter your email address.');
      return;
    }

    if (!contactMessage.trim()) {
      alert('Please enter your message.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('email', contactEmail);
      formData.append('message', contactMessage);

      if (attachedFiles.length > 0) {
        formData.append('attachment', attachedFiles[0].file);
      }

      const response = await fetch(`${API_BASE_URL}/messages/submit`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert('Thank you for your message! We will get back to you soon.');
        setContactMessage('');
        setContactEmail('');
        setAttachedFiles([]);
      } else {
        alert(result.message || 'Failed to send message. Please try again.');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      alert('An error occurred while sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-300">
     <div
  className="relative px-4 md:px-6 py-8 md:py-16 max-w-7xl mx-auto transition-all duration-300 min-h-screen hero-mobile-bg flex items-center"
  style={{
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/3.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  }}
>
  <div className="w-full">
    {/* Mobile Layout */}
    <div className="flex flex-row lg:hidden items-start gap-4">
      {/* Left side content for mobile */}
      <div className="flex-1">
        <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-4 shadow-sm border border-white/30">
          <Star className="w-3 h-3 mr-2 text-yellow-300" />
          <span className="text-xs font-medium text-white">
            Fighting hunger in Bangladesh
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
          Bridging Food Surplus
          <span className="block text-emerald-300 drop-shadow-lg">
            With Those in Need
          </span>
        </h1>

        <p className="text-sm mb-6 text-white/90 drop-shadow-md">
          FoodBridge connects food donors with people in need, reduces waste and hunger
          throughout Bangladesh. <span className="font-semibold text-emerald-300">Donate freely or sell affordably</span> - One meal at a time.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/login')}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 backdrop-blur-sm border border-white/20 text-sm"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Join Now
          </button>
        </div>
      </div>

      {/* Right side mini stats for mobile */}
      <div className="w-32 flex-shrink-0">
        <div className="grid grid-cols-1 gap-2">
          {stats.slice(0, 2).map((stat, index) => (
            <div
              key={stat.label}
              className={`bg-white/5 backdrop-blur-3xl rounded-lg p-2 transition-all duration-500 border border-white/10 ${
                activeIndex === index ? 'ring-1 ring-emerald-400/20 scale-105 bg-white/8' : ''
              }`}
            >
              <div className="inline-flex items-center justify-center w-6 h-6 mb-1 rounded-lg backdrop-blur-lg border border-white/8 bg-white/5">
                <stat.icon className={`w-3 h-3 ${stat.color.split(' ')[0]}`} />
              </div>

              <h3 className="text-lg font-bold text-white mb-1 drop-shadow-lg">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-300/30 h-4 w-8 rounded"></div>
                ) : (
                  stat.number
                )}
              </h3>

              <p className="text-xs font-semibold text-white/95 mb-1 drop-shadow-md">{stat.label}</p>
            </div>
          ))}
        </div>
        
        {/* Bottom mini stats */}
        <div className="grid grid-cols-1 gap-2 mt-2">
          {stats.slice(2, 4).map((stat, index) => (
            <div
              key={stat.label}
              className={`bg-white/5 backdrop-blur-3xl rounded-lg p-2 transition-all duration-500 border border-white/10 ${
                activeIndex === index + 2 ? 'ring-1 ring-emerald-400/20 scale-105 bg-white/8' : ''
              }`}
            >
              <div className="inline-flex items-center justify-center w-6 h-6 mb-1 rounded-lg backdrop-blur-lg border border-white/8 bg-white/5">
                <stat.icon className={`w-3 h-3 ${stat.color.split(' ')[0]}`} />
              </div>

              <h3 className="text-lg font-bold text-white mb-1 drop-shadow-lg">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-300/30 h-4 w-8 rounded"></div>
                ) : (
                  stat.number
                )}
              </h3>

              <p className="text-xs font-semibold text-white/95 mb-1 drop-shadow-md">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Desktop Layout - Same as before */}
    <div className="hidden lg:flex flex-row items-center gap-10">
      <div className="lg:w-1/2">
        <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 mb-6 shadow-sm border border-white/30">
          <Star className="w-4 h-4 mr-2 text-yellow-300" />
          <span className="text-sm font-medium text-white">
            Fighting hunger in Bangladesh
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
          Bridging Food Surplus
          <span className="block text-emerald-300 drop-shadow-lg">
            With Those in Need
          </span>
        </h1>

        <p className="text-lg mb-8 text-white/90 drop-shadow-md">
          FoodBridge connects food donors with people in need, reduces waste and hunger
          throughout Bangladesh. <span className="font-semibold text-emerald-300">Donate freely or sell affordably</span> - One meal at a time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/login')}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 backdrop-blur-sm border border-white/20"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Join Now
          </button>
        </div>
      </div>

      <div className="lg:w-1/2">
        <div className="relative">
          <div className="relative grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`bg-white/5 dark:bg-gray-900/8 backdrop-blur-3xl rounded-xl p-5 transition-all duration-500 border border-white/10 dark:border-gray-700/15 hover:border-emerald-400/20 dark:hover:border-emerald-500/25 transform hover:-translate-y-2 hover:scale-[1.02] ${
                  activeIndex === index ? 'ring-1 ring-emerald-400/20 dark:ring-emerald-500/25 scale-105 bg-white/8 dark:bg-gray-800/12' : ''
                } group`}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl backdrop-blur-lg border border-white/8 dark:border-gray-600/12 group-hover:scale-110 transition-all duration-300 bg-white/5 dark:bg-gray-800/8">
                  <stat.icon className={`w-6 h-6 ${stat.color.split(' ')[0]}`} />
                </div>

                <h3 className="text-2xl font-bold text-white dark:text-gray-100 mb-2 drop-shadow-lg">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-300/30 dark:bg-gray-600/30 h-7 w-14 rounded-lg"></div>
                  ) : (
                    stat.number
                  )}
                </h3>

                <p className="text-sm font-semibold text-white/95 dark:text-gray-200 mb-2 drop-shadow-md">{stat.label}</p>
                <p className="text-xs text-white/85 dark:text-gray-300 leading-relaxed drop-shadow-sm">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-20">
        {/* Sell Food Invitation Section with Dark Mode */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-12 text-white">
            <div className="text-center mb-8">
              <div className="inline-flex items-center bg-white/20 dark:bg-white/10 rounded-full px-4 py-2 mb-4 backdrop-blur-sm">
                <Zap className="w-5 h-5 mr-2 text-yellow-300 dark:text-yellow-200" />
                <span className="text-sm font-medium">New Opportunity</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Turn Your Food into Income
              </h2>
              <p className="text-lg text-purple-100 dark:text-purple-200 max-w-3xl mx-auto">
                Communicate with us, Join the marketplace! Sell your homemade food, surplus inventory, or catering services.
                Help your community while building sustainable income streams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {sellFoodFeatures.map((feature, index) => (
                <div key={index} className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all">
                  <div className="w-12 h-12 rounded-lg bg-white/20 dark:bg-white/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-sm text-purple-100 dark:text-purple-200">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Who Should Donate with Dark Mode */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Who Should Donate Food?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
            Everyone can play a part in reducing food waste and hunger. Discover how you can contribute.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {donateFoodCards.map((card, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl dark:shadow-lg dark:hover:shadow-2xl transition-all flex flex-col ${card.color} hover:scale-105 transform duration-300 border border-gray-100 dark:border-gray-700`}
              >
                <div className="p-6 flex-1">
                  <div className={`w-12 h-12 rounded-lg mb-4 ${card.iconColor} flex items-center justify-center shadow-sm`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{card.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Who Needs Food with Dark Mode */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Who Needs Food Support?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
            FoodBridge serves various groups facing food insecurity. Learn about who we help and how to request support.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {needFoodCards.map((card, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl dark:shadow-lg dark:hover:shadow-2xl transition-all flex flex-col ${card.color} hover:scale-105 transform duration-300 border border-gray-100 dark:border-gray-700`}
              >
                <div className="p-6 flex-1">
                  <div className={`w-12 h-12 rounded-lg mb-4 ${card.iconColor} flex items-center justify-center shadow-sm`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{card.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works with Dark Mode */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">How FoodBridge Works</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
            Our platform makes food donation and distribution simple, efficient and transparent
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl dark:shadow-lg dark:hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 group hover:scale-105 transform duration-300"
              >
                <div className="relative mb-6">
                  <div className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-500 dark:to-blue-500 text-white rounded-full shadow-lg z-10">
                    <span className="text-sm font-bold">{step.number}</span>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Communities We Serve with Dark Mode */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Communities We Serve</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
            FoodBridge is committed to reaching those in need across Bangladesh, from urban centers to remote areas
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {impactAreas.map((area, index) => (
              <div
                key={index}
                className={`${area.color} dark:bg-gray-800 dark:border-gray-600 rounded-lg shadow-md hover:shadow-xl dark:shadow-lg dark:hover:shadow-2xl transition-all border p-6 hover:scale-105 transform duration-300`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                    <area.icon className={`w-6 h-6 ${area.color.split(' ')[2]} dark:text-white`} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{area.stats}</div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{area.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{area.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Mission with Dark Mode */}
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why We Created FoodBridge</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                In Bangladesh, approximately 36% of food is wasted while over 40 million people face food insecurity.
                FoodBridge was created to address this paradox by connecting food surplus with those who need it most.
              </p>
              <p>
                Our platform aims to reduce food waste, combat hunger, and create sustainable communities
                through a simple yet powerful digital solution. We believe that technology can play a vital role
                in solving one of our country's most pressing challenges.
              </p>
            </div>
          </div>

          <div className="md:w-1/2 space-y-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-lg dark:shadow-lg dark:hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-4">
                  <LucideBarChart4 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">36%</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Food is wasted in Bangladesh, from production to consumption stages</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-lg dark:shadow-lg dark:hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-4">
                  <Users className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">40+ million</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">People face food insecurity in Bangladesh, including children and elderly</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-lg dark:shadow-lg dark:hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Sustainable Development</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Our work directly supports the UN SDGs of Zero Hunger and Responsible Consumption</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer with Contact Form and Dark Mode */}
      <footer className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 mt-20 py-12 border-t border-gray-200 dark:border-gray-700 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Have questions or suggestions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-4" id="contactForm">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Your email address"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea
                    id="message"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    rows="4"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                {/* File Attachment Section with Dark Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments (Optional)</label>

                  {/* File Input */}
                  <div className="flex items-center gap-2 mb-3">
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-all text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600"
                    >
                      <Paperclip className="w-4 h-4 mr-2" />
                      Attach Files
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileAttachment}
                      className="hidden"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Images, PDF, DOC, TXT</span>
                  </div>

                  {/* Attached Files Display with Dark Mode */}
                  {attachedFiles.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {attachedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-3">
                              {file.type === 'image' ?
                                <Image className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> :
                                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              }
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-48">
                                {file.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{file.size}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-500 dark:to-blue-500 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-blue-700 dark:hover:from-emerald-600 dark:hover:to-blue-600 transition-all group shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  {!isSubmitting && <Send className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Connect With Us</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Join our mission to fight hunger and reduce food waste across Bangladesh. Together, we can make a difference.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-4">
                    <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Our Address</h4>
                    <p className="text-gray-600 dark:text-gray-300">123 Food Street, Dhaka, Bangladesh</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-4">
                    <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Email</h4>
                    <p className="text-gray-600 dark:text-gray-300">hello@foodbridge.org</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-4">
                    <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Support Hours</h4>
                    <p className="text-gray-600 dark:text-gray-300">24/7 for emergency food requests</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default HomePage;

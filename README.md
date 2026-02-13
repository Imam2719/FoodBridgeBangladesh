# FoodBridge Bangladesh - Complete Food Distribution Platform

**Connecting Hearts Through Food**

A comprehensive digital platform that bridges the gap between food waste and hunger in Bangladesh by connecting food donors with people in need, while creating business opportunities for food merchants.

## 🌐 Live Application

**Deployed URL:** https://foodbridgebangladesh-k0sb.onrender.com

## 🔐 Test Accounts

### Admin Account
- **Email:** admin@foodbridge.com
- **Password:** Admin123!
- **Access:** Full system administration, user management, merchant approval, reports

### Merchant Account  
- **Email:** kfc@mail.com
- **Password:** kfc123
- **Access:** Food inventory management, sales tracking, donation creation

### Receiver Account
- **Email:** 2021-3-60-260@std.ewubd.edu
- **Password:** Imam9755@#$
- **Access:** Browse donations, request food, emergency requests

### Donor Account
- **Email:** alimamuddin755@gmail.com
- **Password:** Imam260@#$
- **Access:** Create donations, manage requests, purchase for donation

## 🏗️ System Architecture Overview

### Three-Tier Architecture
```
┌─────────────────────────────────────┐
│          Frontend Layer             │
│     (React 18 + Tailwind CSS)       │
│        Port: 3000 (Dev)             │
├─────────────────────────────────────┤
│           Backend Layer             │
│     (Spring Boot 3.4.2 + Java 17)  │
│        Port: 8080                   │
├─────────────────────────────────────┤
│          Database Layer             │
│        (PostgreSQL 12+)             │
│        Port: 5432                   │
└─────────────────────────────────────┘
```

### Role-Based Access Control Flow
```
User Login → Authentication → Role Detection → Dashboard Routing

├── Admin → Admin Dashboard
│   ├── User Management
│   ├── Merchant Approval
│   ├── Food Reports
│   ├── System Statistics
│   └── Communication Center
│
├── Donor → Donor Dashboard  
│   ├── Create Donations
│   ├── Manage Food Listings
│   ├── View Requests
│   ├── Purchase for Donation
│   └── Profile Management
│
├── Merchant → Merchant Dashboard
│   ├── Food Inventory
│   ├── Sales Management
│   ├── Donation Creation
│   ├── Financial Tracking
│   └── Business Profile
│
└── Receiver → Receiver Dashboard
    ├── Browse Food Donations
    ├── Request Food Items
    ├── Emergency Requests
    ├── Saved Donations
    └── Profile Management
```

## 🛠️ Technology Stack

### Frontend Technologies
- **Framework:** React 18.2+ with modern hooks
- **Language:** JavaScript ES6+ with advanced patterns
- **Styling:** Tailwind CSS 3.0+ with custom components
- **UI Components:** Custom component library with dark mode
- **Icons:** Lucide React for consistent iconography
- **HTTP Client:** Axios for API communication
- **Routing:** React Router DOM v6 for navigation
- **State Management:** React Hooks (useState, useEffect, useContext)

### Backend Technologies
- **Framework:** Spring Boot 3.4.2
- **Language:** Java 17 (LTS)
- **Database Access:** Spring Data JPA + Hibernate ORM
- **Security:** Spring Security with JWT authentication
- **Email:** Spring Mail with SMTP integration
- **Validation:** Spring Boot Validation with Jakarta annotations
- **API:** RESTful services with comprehensive endpoints
- **WebSocket:** Real-time notifications support
- **File Handling:** Multipart file upload with Base64 storage

### Database & Storage
- **Database:** PostgreSQL 12+ 
- **Migration:** Flyway for database versioning
- **Connection Pooling:** HikariCP for performance
- **File Storage:** Base64 encoding for images and documents
- **Schema:** Comprehensive relational design with proper indexing

### Development & Build Tools
- **Build Tool:** Maven 3.6+ with standard project structure
- **Development:** Spring Boot DevTools for hot reload
- **Code Generation:** Lombok for reducing boilerplate
- **Monitoring:** Spring Boot Actuator for health checks
- **Testing:** Spring Boot Test with comprehensive test suite

### Infrastructure & Deployment
- **Frontend Hosting:** Render.com with automatic deployments
- **Backend Hosting:** Production-ready server configuration
- **Database:** Managed PostgreSQL instance
- **Email Service:** Gmail SMTP with app-specific passwords
- **CORS:** Configured for cross-origin requests

## 📋 System Features by Role

### 🔧 Admin Dashboard Features
1. **User Management System**
   - View all registered users (donors, receivers)
   - User verification and account approval
   - Account status management (active/inactive)
   - User statistics and analytics

2. **Merchant Management**
   - Merchant registration approval workflow
   - Business license verification
   - Merchant performance monitoring
   - Fee structure management

3. **Food Quality Control**
   - Food safety report management
   - Investigation and resolution tracking
   - Evidence review and verification
   - Quality assurance metrics

4. **Communication Center**
   - System-wide announcements
   - Email template management
   - User support and messaging
   - Notification broadcasting

5. **Analytics & Reporting**
   - Platform usage statistics
   - Food distribution metrics
   - Emergency response analytics
   - Financial reporting

### 🤝 Donor Dashboard Features
1. **Donation Management**
   - Create food donation listings
   - Upload food images and descriptions
   - Set pickup locations and times
   - Manage donation status and availability

2. **Request Handling**
   - View incoming food requests
   - Accept or decline requests
   - Coordinate pickup arrangements
   - Track donation completion

3. **Purchase & Donate**
   - Browse merchant food catalog
   - Purchase food items for donation
   - Direct donation conversion
   - Payment processing integration

4. **Notification System**
   - Real-time request notifications
   - Pickup reminders and updates
   - System announcements
   - Request status changes

5. **Profile Management**
   - Personal information updates
   - Donation history tracking
   - Performance metrics
   - Account settings

### 🏪 Merchant Dashboard Features
1. **Food Inventory Management**
   - Add and manage food items
   - Category-based organization
   - Price and quantity tracking
   - Expiry date management

2. **Sales & Revenue**
   - Process customer sales
   - Revenue tracking and analytics
   - Payment method integration
   - Financial reporting

3. **Donation Creation**
   - Convert unsold inventory to donations
   - Bulk donation processing
   - Donation impact tracking
   - Community contribution metrics

4. **Business Operations**
   - Business profile management
   - Document and license uploads
   - Fee calculation and payments
   - Performance analytics

5. **Customer Communication**
   - Message management system
   - Customer support features
   - Feedback and rating system
   - Promotional announcements

### 🍽️ Receiver Dashboard Features
1. **Food Discovery**
   - Browse available donations
   - Category and location filtering
   - Search functionality
   - Distance-based sorting

2. **Request Management**
   - Submit food requests
   - Track request status
   - Pickup coordination
   - Request history

3. **Emergency System**
   - Submit urgent food requests
   - Priority-based processing
   - Real-time status updates
   - Emergency contact system

4. **Favorites & Saved Items**
   - Save preferred donations
   - Wishlist functionality
   - Quick access to saved items
   - Personalized recommendations

5. **Quality Feedback**
   - Report food quality issues
   - Evidence upload system
   - Safety concern reporting
   - Community protection

## 🔄 Complete System Workflow

### 1. User Registration & Authentication
```
Registration → Email Verification → Role Selection → Profile Setup → Dashboard Access
```

### 2. Food Donation Workflow
```
Donor Creates Donation → Upload Details & Images → Publish Listing → 
Receivers Browse → Submit Requests → Donor Reviews → Accept Request → 
Coordinate Pickup → Complete Transaction → Feedback & Rating
```

### 3. Merchant Integration Workflow
```
Merchant Registration → Business Verification → Admin Approval → 
Inventory Setup → Sales Processing → Revenue Tracking → Fee Payment → 
Donation Creation → Community Impact
```

### 4. Emergency Response Workflow
```
Emergency Request → Priority Assessment → Admin Notification → 
Resource Allocation → Donor Matching → Rapid Response → 
Status Tracking → Completion Verification
```

### 5. Quality Assurance Workflow
```
Issue Report → Evidence Collection → Admin Investigation → 
Resolution Process → User Notification → System Improvement → 
Quality Metrics Update
```

## 🗄️ Database Schema Overview

### Core Tables
- **users** - Central user management (donors, receivers)
- **admins** - System administrators with role hierarchy
- **merchants** - Business entities with verification
- **donations** - Food donation listings and metadata
- **food_items** - Merchant inventory catalog
- **requests** - Food request queue management
- **emergency_requests** - Priority emergency assistance
- **messages** - Internal communication system
- **food_reports** - Quality control and safety
- **payment_history** - Financial transaction tracking
- **notifications** - Real-time user alerts

### Key Relationships
- Users (1:many) → Donations
- Merchants (1:many) → Food Items
- Donations (1:many) → Requests
- Users (1:many) → Emergency Requests
- Donations (1:many) → Food Reports

## 🛡️ Security Implementation

### Authentication & Authorization
- **JWT Token-based** authentication
- **Role-based access control** (RBAC)
- **Multi-repository** user lookup
- **Session management** with security logging
- **Password encryption** with BCrypt

### Data Protection
- **Input validation** with Jakarta annotations
- **SQL injection** prevention through JPA
- **File upload security** with type and size validation
- **CORS configuration** for secure cross-origin requests
- **Sensitive data encryption** for PII protection

### API Security
- **Endpoint protection** based on user roles
- **Resource ownership** verification
- **Rate limiting** for critical operations
- **Error handling** without information disclosure
- **HTTPS enforcement** in production

## 🚀 Installation & Setup

### Prerequisites
- **Node.js 16+** for frontend development
- **Java 17+** for backend development
- **PostgreSQL 12+** for database
- **Maven 3.6+** for backend build
- **Git** for version control

### Frontend Setup
```bash
# Clone repository
git clone [repository-url]
cd foodbridge-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with API URL

# Start development server
npm start
# Access: http://localhost:3000
```

### Backend Setup
```bash
# Navigate to backend
cd foodbridge-backend

# Configure database
# Edit application.properties:
spring.datasource.url=jdbc:postgresql://localhost:5432/FoodBridgeBangladesh
spring.datasource.username=your_username
spring.datasource.password=your_password

# Install dependencies and run
mvn clean install
mvn spring-boot:run
# Access: http://localhost:8080
```

### Database Setup
```sql
-- Create database
CREATE DATABASE FoodBridgeBangladesh;

-- Create user
CREATE USER foodbridge_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE FoodBridgeBangladesh TO foodbridge_user;

-- Tables will be created automatically via JPA
```

### Email Configuration
```properties
# Gmail SMTP configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## 📊 System Configuration

### Environment Variables
```bash
# Frontend (.env)
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENVIRONMENT=development

# Backend (application.properties)
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/FoodBridgeBangladesh
spring.profiles.active=development
```

### CORS Configuration
```properties
spring.web.cors.allowed-origins=http://localhost:3000,https://foodbridge-frontend.onrender.com
spring.mvc.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.mvc.cors.allowed-headers=*
spring.mvc.cors.allow-credentials=true
```

### File Upload Settings
```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
spring.servlet.multipart.enabled=true
```

## 🔗 API Endpoints Overview

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/signup` - User registration
- `POST /api/request-password-reset` - Password reset
- `POST /api/verify-reset-otp` - OTP verification

### Admin Endpoints
- `GET /api/admin/users` - User management
- `GET /api/admin/merchants` - Merchant management
- `GET /api/admin/food-reports` - Quality reports
- `GET /api/admin/statistics` - System analytics

### Donor Endpoints
- `GET /api/donor/donations` - Donation management
- `POST /api/donor/donations` - Create donation
- `GET /api/donor/notifications` - Notification feed
- `GET /api/donor/food-items` - Available items

### Merchant Endpoints
- `GET /api/merchant/food-items` - Inventory management
- `POST /api/merchant/sales` - Sales processing
- `GET /api/merchant/analytics` - Business metrics
- `POST /api/merchant/donate` - Create donation

### Receiver Endpoints
- `GET /api/receiver/food/available` - Browse donations
- `POST /api/receiver/food/request` - Request food
- `POST /api/receiver/emergency` - Emergency request
- `POST /api/receiver/food-reports` - Quality report

## 🎯 Key Features & Benefits

### Social Impact
- **Reduce Food Waste** - Connect surplus food with needy people
- **Fight Hunger** - Provide accessible food assistance
- **Build Community** - Foster social connections through food sharing
- **Emergency Response** - Rapid assistance during crises

### Economic Benefits
- **Merchant Revenue** - New sales channels for food businesses
- **Cost Savings** - Reduced waste disposal costs
- **Economic Opportunity** - Platform-based income generation
- **Resource Efficiency** - Optimal resource utilization

### Environmental Impact
- **Waste Reduction** - Decrease landfill food waste
- **Carbon Footprint** - Reduce environmental impact
- **Sustainability** - Promote circular economy principles
- **Resource Conservation** - Efficient resource distribution

### Technology Innovation
- **Digital Platform** - Modern web-based solution
- **Real-time Systems** - Immediate response capabilities
- **Data Analytics** - Insights for better decision making
- **Scalable Architecture** - Growth-ready technology stack

## 📱 User Experience Features

### Responsive Design
- **Mobile-first** approach for accessibility
- **Cross-platform** compatibility
- **Touch-friendly** interface design
- **Progressive** web app capabilities

### Real-time Features
- **Live notifications** for important events
- **Status updates** for ongoing processes
- **Chat system** for user communication
- **Dashboard analytics** with real-time data

### Accessibility
- **Screen reader** support
- **Keyboard navigation** capabilities
- **High contrast** mode support
- **Multiple language** support (extensible)

### Performance
- **Fast loading** times with optimization
- **Efficient caching** strategies
- **Minimal bandwidth** usage
- **Offline capabilities** for core features

## 🤝 Contributing

### Development Guidelines
1. Follow **coding standards** and best practices
2. Write **comprehensive tests** for new features
3. Document **API changes** and updates
4. Use **meaningful commit messages**
5. Submit **pull requests** for review

### Code Standards
- **Frontend:** ESLint + Prettier for consistent formatting
- **Backend:** Checkstyle for Java code standards
- **Database:** Proper indexing and normalization
- **API:** RESTful conventions and documentation

## 📞 Support & Contact

### Technical Support
- **Email:** alimamuddin755@gmail.com
- **Documentation:** Available in repository
- **Issue Tracker:** GitHub issues for bug reports
- **Community:** Developer community forums

## 📄 License

This project is licensed under the MIT License - promoting open-source development and community contributions.

## 🎉 Acknowledgments

- **Spring Boot Community** for excellent framework
- **React Team** for powerful frontend library
- **PostgreSQL Team** for robust database system
- **Open Source Contributors** for various libraries and tools
- **Bangladesh Tech Community** for support and feedback

---

**"Building bridges between abundance and need, one meal at a time."**

**Powered by Technology. Driven by Compassion. Serving Bangladesh.**

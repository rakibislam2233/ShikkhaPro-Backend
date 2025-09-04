# Flight Booking Backend API

A comprehensive Node.js backend API for flight booking and compensation services, built with Express.js, TypeScript, and MongoDB. This API integrates with FlightAware's AeroAPI to provide real-time flight data and supports various flight-related operations.

## 🚀 Features

### Flight Services
- **Flight Data Integration**: Powered by OpenFlights database and OpenSky Network for comprehensive flight information
- **Flight Verification**: Verify flight existence using OpenSky Network's real-time ADS-B data
- **Airlines & Airports**: Search and retrieve airline and airport data from OpenFlights database with US-specific filtering
- **Route Search**: Find flights by origin and destination airports using OpenSky tracking data

### User Management
- **Authentication & Authorization**: JWT-based secure authentication system
- **User Profiles**: Complete user registration and profile management
- **OTP Verification**: Secure OTP-based email verification

### Compensation Services
- **Flight Disruption Claims**: Handle flight delay, cancellation, and denial boarding claims
- **Automatic Eligibility**: Check compensation eligibility based on flight data
- **Claim Management**: Process and track compensation claims

### Additional Services
- **Notifications**: Real-time notification system with Socket.io
- **Testimonials**: Customer testimonial management
- **Settings Management**: About Us, Privacy Policy, Terms & Conditions
- **Email Services**: Automated email notifications
- **File Uploads**: AWS S3 integration for file storage

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport.js
- **Flight Data**: OpenFlights Database + OpenSky Network API
- **File Storage**: AWS S3
- **Real-time**: Socket.io
- **Email**: Nodemailer with SMTP
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting, XSS Protection

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flight-booking-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=8083
   SOCKET=8082

   # Database
   MONGODB_URL=mongodb://localhost:27017/flight-booking

   # JWT Configuration
   JWT_ACCESS_SECRET=your_access_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   JWT_ACCESS_EXPIRATION_TIME=15m
   JWT_REFRESH_EXPIRATION_TIME=30d

   # OpenSky Network API (Optional - for enhanced flight tracking)
   OPENSKY_USERNAME=your_opensky_username
   OPENSKY_PASSWORD=your_opensky_password
   OPENSKY_BASE_URL=https://opensky-network.org/api

   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   EMAIL_FROM=your_email@gmail.com

   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your-bucket-name

   # Client URL
   CLIENT_URL=http://localhost:3000

   # Additional API Keys
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. **Seed flight data (airlines & airports)**
   ```bash
   npm run seed:flights
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start production server
- `npm run lint:check` - Check for linting errors
- `npm run lint:fix` - Fix linting errors
- `npm run prettier:check` - Check code formatting
- `npm run prettier:fix` - Fix code formatting
- `npm run seeder` - Run database seeder
- `npm run seed:flights` - Seed flight data (airlines & airports) from OpenFlights

## 🛣 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### Flight Services
- `GET /api/flights/airlines` - Get all airlines with search and pagination
- `GET /api/flights/airports` - Get all airports with search and pagination
- `POST /api/flights/verify` - Verify flight existence and details
- `GET /api/flights/info/:flightId` - Get specific flight information
- `GET /api/flights/search` - Search flights by route

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/account` - Delete user account

### Compensation Claims
- `POST /api/compensation` - Submit compensation claim
- `GET /api/compensation` - Get user's claims
- `GET /api/compensation/:id` - Get specific claim details
- `PUT /api/compensation/:id` - Update claim status

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

### Settings
- `GET /api/settings/about-us` - Get about us content
- `GET /api/settings/privacy-policy` - Get privacy policy
- `GET /api/settings/terms-conditions` - Get terms and conditions

## 🔌 Flight Data Integration

This API uses a combination of **OpenFlights Database** and **OpenSky Network API** for comprehensive flight data:

### OpenFlights Database Integration
**OpenFlights** provides free, comprehensive airline and airport data stored in MongoDB:
- **Airlines**: 7,000+ airlines with IATA/ICAO codes, callsigns, and country information
- **Airports**: 10,000+ airports worldwide with coordinates, timezones, and detailed location data
- **Storage**: Stored in MongoDB with optimized indexes for fast search and pagination
- **Auto-seeding**: Data automatically seeds on first API call if not present
- **Manual seeding**: Run `npm run seed:flights` to populate data manually
- **Cost**: Completely free with no API keys required

### OpenSky Network Integration
**OpenSky Network** provides real-time flight tracking using crowd-sourced ADS-B data:
- **Real-time Tracking**: Live aircraft positions and flight status
- **Flight Verification**: Verify flight existence using actual flight data
- **Historical Data**: Access to flight history (with registered account)
- **Cost**: Free for non-commercial use with rate limits

### Getting Started

#### Anonymous Usage (Limited)
The system works immediately with no configuration required:
- OpenFlights data seeds automatically into MongoDB on first API call
- OpenSky API works with anonymous access (limited to current data)
- Run `npm run seed:flights` to pre-populate flight data (recommended)

#### Enhanced Usage (Recommended)
For better OpenSky API limits and historical data:
1. **Sign up** for a free OpenSky account at [opensky-network.org](https://opensky-network.org)
2. **Add credentials** to your `.env` file:
   ```env
   OPENSKY_USERNAME=your_username
   OPENSKY_PASSWORD=your_password
   ```

### Rate Limits
- **Anonymous Users**: 400 API credits/day, current data only
- **Registered Users**: 4,000+ API credits/day, historical data access
- **OpenFlights**: No rate limits (data stored in MongoDB with optimized queries)

### Database Performance Features
- **MongoDB Indexes**: Text search, geospatial, and compound indexes for fast queries
- **Pagination**: Efficient cursor-based pagination for large datasets  
- **Search**: Full-text search across airline/airport names, cities, and codes
- **Filtering**: Advanced filtering by country, IATA/ICAO codes, and US-specific data

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  isEmailVerified: Boolean,
  role: String (enum: ['user', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

### Compensation Claims
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  flightDetails: {
    flightNumber: String,
    departureDate: Date,
    route: {
      from: String,
      to: String
    }
  },
  disruptionType: String (enum: ['delay', 'cancellation', 'denied-boarding']),
  status: String (enum: ['pending', 'processing', 'approved', 'rejected']),
  compensationAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** using bcrypt with configurable salt rounds
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **XSS Protection** using express-xss-sanitizer
- **MongoDB Injection Protection** using express-mongo-sanitize
- **Helmet Security Headers** for additional protection
- **Input Validation** using Zod schemas

## 🌍 Environment Configuration

The application supports multiple environments:

- **Development**: Full logging, detailed error messages
- **Production**: Optimized performance, security-focused
- **Testing**: Isolated test database and configurations

## 📝 API Documentation

### Error Responses
All API endpoints return consistent error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "data": null
}
```

### Success Responses
```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check FlightAware documentation for API-related issues

## 🚦 Getting Support for Flight APIs

### OpenFlights Database
- **Documentation**: [OpenFlights Data Page](https://openflights.org/data.php)
- **GitHub Repository**: [OpenFlights on GitHub](https://github.com/jpatokal/openflights)
- **Data Format**: CSV files with detailed field descriptions

### OpenSky Network API  
- **Documentation**: [OpenSky API Documentation](https://openskynetwork.github.io/opensky-api/)
- **REST API Guide**: [OpenSky REST API](https://openskynetwork.github.io/opensky-api/rest.html)
- **Python Examples**: [OpenSky API Examples](https://github.com/openskynetwork/opensky-api)
- **Data Portal**: [OpenSky Network](https://opensky-network.org/)

---

Made with ❤️ for aviation enthusiasts and travelers worldwide.
# 📚 ShikkhaPro Backend - AI-Powered Quiz Generator 

A comprehensive backend API for an intelligent exam question and answer generator built with Node.js, Express, TypeScript, MongoDB, and OpenAI integration.

## 🚀 Features

- 🤖 **AI-Powered Quiz Generation** - Generate intelligent quizzes using OpenAI GPT-4
- 🌐 **Multi-Language Support** - English, Bengali, and Hindi language support
- 📊 **Comprehensive Analytics** - Track quiz attempts, scores, and user statistics
- 🏆 **Leaderboards & Achievements** - Competitive elements with ranking systems
- 🔐 **Secure Authentication** - JWT-based authentication with role management
- 📚 **Academic Level Support** - From Class 1 to MSc level questions
- 🎯 **Multiple Question Types** - MCQ, True/False, Short Answer, Multiple Select
- 📈 **Real-time Progress Tracking** - Monitor quiz attempts in real-time
- 🚀 **Scalable Architecture** - Built with scalability and performance in mind

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: OpenAI GPT-4
- **Authentication**: JWT
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: ts-node-dev, ESLint, Prettier

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (v5.0 or higher)
- **OpenAI API Key**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd exam-qa-generator-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=8083
SOCKET=8082

# Database
MONGODB_URL=mongodb://localhost:27017/exam-qa-generator

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-here
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-here
JWT_ACCESS_EXPIRATION_TIME=5d
JWT_REFRESH_EXPIRATION_TIME=365d

# OpenAI Configuration (Required)
OPENAI_API_KEY=sk-your-openai-api-key-here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
DEV_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:8081

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# Security Configuration
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=2
```

### 4. Start the Development Server

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The server will start on `http://localhost:8083`

## 📚 API Documentation

### Base URL
```
http://localhost:8083/api/v1
```

### Core Endpoints

#### 🔐 Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-otp` - OTP verification
- `POST /auth/forgot-password` - Password reset

#### 📝 Quiz Management
- `POST /quizzes/generate` - Generate AI-powered quiz
- `POST /quizzes` - Create custom quiz
- `GET /quizzes/:id` - Get quiz by ID
- `GET /quizzes/public` - Get public quizzes
- `GET /quizzes/search` - Search quizzes with filters
- `PATCH /quizzes/:id` - Update quiz
- `DELETE /quizzes/:id` - Delete quiz

#### ❓ Question Management
- `POST /questions` - Create question
- `POST /questions/generate` - Generate AI question
- `GET /questions/approved` - Get approved questions
- `GET /questions/search` - Search questions
- `PATCH /questions/:id/approve` - Approve question (Admin)

#### 🎯 Quiz Attempts
- `POST /quiz-attempts/start` - Start quiz attempt
- `POST /quiz-attempts/answer` - Submit answer
- `POST /quiz-attempts/complete` - Complete quiz
- `GET /quiz-attempts/result/:attemptId` - Get results
- `GET /quiz-attempts/stats/user` - User statistics
- `GET /quiz-attempts/stats/leaderboard` - Leaderboard

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🏗️ Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── config/               # Configuration files
│   └── index.ts          # Environment configuration
├── models/               # Database models & business logic
│   ├── auth/            # Authentication
│   ├── user/            # User management
│   ├── quiz/            # Quiz management
│   ├── question/        # Question management
│   └── quizAttempt/     # Quiz attempts & results
├── services/            # External services
│   └── openai.service.ts # OpenAI integration
├── middlewares/         # Express middlewares
│   ├── auth.ts          # Authentication middleware
│   └── globalErrorHandler.ts
├── shared/              # Shared utilities
│   ├── catchAsync.ts    # Async error handler
│   ├── sendResponse.ts  # Response formatter
│   └── validateRequest.ts # Request validation
├── routes/              # Route definitions
└── types/               # TypeScript definitions
```

## 🎯 Core Features

### 1. AI-Powered Quiz Generation

Generate intelligent quizzes with customizable parameters:

```typescript
{
  "academicLevel": "class-10",
  "subject": "Mathematics",
  "topic": "Algebra",
  "language": "english",
  "questionType": "mcq",
  "difficulty": "medium",
  "questionCount": 10,
  "timeLimit": 30
}
```

### 2. Multi-Language Support

Support for three languages:
- English
- Bengali (বাংলা)
- Hindi (हिंदी)

### 3. Academic Levels

Comprehensive coverage from basic to advanced:
- Primary: Class 1-7
- Secondary: JSC, SSC
- Higher Secondary: HSC
- University: BSc, MSc

### 4. Question Types

Multiple question formats:
- Multiple Choice Questions (MCQ)
- True/False
- Short Answer
- Multiple Select
- Mixed Types

### 5. Real-time Analytics

Track performance with detailed analytics:
- User statistics
- Quiz performance metrics
- Time-based analytics
- Subject-wise progress

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Rate Limiting** to prevent API abuse
- **Input Validation** using Zod schemas
- **XSS Protection** with sanitization
- **CORS Configuration** for cross-origin requests
- **Helmet Security** headers
- **MongoDB Injection** prevention
- **Password Hashing** with bcrypt

## 🚀 Deployment

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Build the project
npm run build

# Start with PM2
pm2 start dist/server.js --name "exam-qa-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 8083

CMD ["node", "dist/server.js"]
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=8083
MONGODB_URL=mongodb://your-production-db-url
OPENAI_API_KEY=your-production-openai-key
JWT_ACCESS_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-jwt-refresh-secret
```

## 🧪 Testing

### Manual Testing

Use tools like Postman, Thunder Client, or cURL to test the API endpoints.

### Example Test Flow

1. **Register a new user**
```bash
curl -X POST http://localhost:8083/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "address": "123 Main St"
  }'
```

2. **Login and get token**
```bash
curl -X POST http://localhost:8083/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

3. **Generate a quiz**
```bash
curl -X POST http://localhost:8083/api/v1/quizzes/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "academicLevel": "class-10",
    "subject": "Mathematics",
    "topic": "Algebra",
    "language": "english",
    "questionType": "mcq",
    "difficulty": "medium",
    "questionCount": 5
  }'
```

## 📊 Performance Considerations

- **Database Indexing**: Optimized indexes for frequent queries
- **Pagination**: All list endpoints support pagination
- **Caching**: Consider implementing Redis for session caching
- **Rate Limiting**: Built-in protection against API abuse
- **Connection Pooling**: MongoDB connection optimization
- **Response Compression**: Gzip compression enabled

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add proper error handling
- Include input validation
- Follow RESTful API conventions

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **OpenAI API Error**
   - Verify API key is correct
   - Check API quota and billing
   - Ensure network access to OpenAI

3. **JWT Token Issues**
   - Check token expiration
   - Verify secret keys match
   - Ensure proper Authorization header format

4. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes: `lsof -ti:8083 | xargs kill -9`

### Debugging

Enable debug logs by setting:
```env
NODE_ENV=development
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT-4 API
- MongoDB team for the excellent database
- Express.js community for the robust framework
- TypeScript team for type safety

## 📞 Support

For questions, issues, or contributions:

- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Happy Coding! 🚀**
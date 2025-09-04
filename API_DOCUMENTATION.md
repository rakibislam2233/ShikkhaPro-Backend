# Exam QA Generator Backend API Documentation

## Overview

This is a comprehensive backend API for an exam question and answer generator application built with Node.js, Express, TypeScript, MongoDB, and OpenAI integration.

## Features

- 🤖 AI-powered quiz generation using OpenAI GPT-4
- 📚 Multi-language support (English, Bengali, Hindi)
- 📊 Comprehensive quiz attempt tracking and analytics
- 🏆 Leaderboard and user statistics
- 🔐 JWT-based authentication
- 📱 Academic level support (Class 1-12, JSC, SSC, HSC, BSc, MSc)
- 🎯 Multiple question types (MCQ, True/False, Short Answer, Multiple Select)
- 📈 Real-time progress tracking
- 🚀 Scalable architecture with pagination

## Base URL

```
http://localhost:8083/api/v1
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 🔐 Authentication

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "address": "123 Main St"
}
```

### 📝 Quiz Management

#### Generate Quiz with AI
```http
POST /quizzes/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "academicLevel": "class-10",
  "subject": "Mathematics",
  "topic": "Algebra",
  "language": "english",
  "questionType": "mcq",
  "difficulty": "medium",
  "questionCount": 10,
  "timeLimit": 30,
  "instructions": "Solve all questions carefully"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Quiz generated successfully",
  "data": {
    "_id": "64f123...",
    "title": "Mathematics - Algebra Quiz",
    "subject": "Mathematics",
    "topic": "Algebra",
    "questions": [...],
    "totalPoints": 10,
    "estimatedTime": 10
  }
}
```

#### Create Custom Quiz
```http
POST /quizzes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Custom Math Quiz",
  "description": "A custom mathematics quiz",
  "subject": "Mathematics",
  "topic": "Geometry",
  "academicLevel": "class-9",
  "difficulty": "easy",
  "language": "english",
  "questions": [
    {
      "question": "What is the sum of angles in a triangle?",
      "type": "mcq",
      "options": ["90°", "180°", "270°", "360°"],
      "correctAnswer": "180°",
      "explanation": "The sum of all angles in any triangle is always 180 degrees.",
      "difficulty": "easy",
      "points": 1
    }
  ],
  "timeLimit": 15,
  "isPublic": true,
  "tags": ["geometry", "angles"]
}
```

#### Get Quiz by ID
```http
GET /quizzes/:id
Authorization: Bearer <token> (optional for public quizzes)
```

#### Update Quiz
```http
PATCH /quizzes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Quiz Title",
  "description": "Updated description",
  "status": "published"
}
```

#### Delete Quiz
```http
DELETE /quizzes/:id
Authorization: Bearer <token>
```

#### Get User's Quizzes
```http
GET /quizzes/my-quizzes?page=1&limit=10&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <token>
```

#### Get Public Quizzes
```http
GET /quizzes/public?page=1&limit=10&sortBy=attempts&sortOrder=desc
```

#### Search Quizzes
```http
GET /quizzes/search?academicLevel=class-10&subject=Mathematics&difficulty=medium&language=english&page=1&limit=20
```

**Query Parameters:**
- `academicLevel`: Filter by academic levels (comma-separated)
- `subject`: Filter by subjects (comma-separated)
- `difficulty`: Filter by difficulty (easy,medium,hard)
- `questionType`: Filter by question types
- `language`: Filter by language
- `tags`: Filter by tags
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Sort field (createdAt, updatedAt, attempts, averageScore, title)
- `sortOrder`: Sort order (asc, desc)

### ❓ Question Management

#### Create Question
```http
POST /questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "What is 2 + 2?",
  "type": "mcq",
  "options": ["3", "4", "5", "6"],
  "correctAnswer": "4",
  "explanation": "2 + 2 equals 4",
  "difficulty": "easy",
  "points": 1,
  "subject": "Mathematics",
  "topic": "Addition",
  "academicLevel": "class-1",
  "language": "english",
  "tags": ["arithmetic", "basic"]
}
```

#### Generate Single Question with AI
```http
POST /questions/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Physics",
  "topic": "Mechanics",
  "academicLevel": "class-11",
  "difficulty": "hard",
  "questionType": "mcq",
  "language": "english"
}
```

#### Get Question by ID
```http
GET /questions/:id
```

#### Update Question
```http
PATCH /questions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "Updated question text",
  "explanation": "Updated explanation"
}
```

#### Delete Question
```http
DELETE /questions/:id
Authorization: Bearer <token>
```

#### Get User's Questions
```http
GET /questions/my-questions?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Approved Questions
```http
GET /questions/approved?page=1&limit=20
```

#### Search Questions
```http
GET /questions/search?subject=Mathematics&topic=Algebra&difficulty=medium&isApproved=true
```

#### Approve Question (Admin Only)
```http
PATCH /questions/:id/approve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isApproved": true
}
```

#### Improve Question with AI
```http
POST /questions/:id/improve
Authorization: Bearer <token>
Content-Type: application/json

{
  "feedback": "Make the question more challenging and add more realistic options"
}
```

#### Get Questions by Subject
```http
GET /questions/subject/:subject
```

#### Get Questions by Topic
```http
GET /questions/topic/:topic
```

#### Get Question Statistics
```http
GET /questions/stats
```

### 🎯 Quiz Attempts

#### Start Quiz Attempt
```http
POST /quiz-attempts/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "quizId": "64f123..."
}
```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Quiz attempt started successfully",
  "data": {
    "_id": "64f456...",
    "quizId": "64f123...",
    "userId": "64f789...",
    "status": "in-progress",
    "totalQuestions": 10,
    "startedAt": "2024-01-15T10:00:00.000Z",
    "timeLimit": 30
  }
}
```

#### Submit Single Answer
```http
POST /quiz-attempts/answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "attemptId": "64f456...",
  "questionId": "q_1705320000_0",
  "answer": "Option B"
}
```

#### Save Multiple Answers
```http
POST /quiz-attempts/save
Authorization: Bearer <token>
Content-Type: application/json

{
  "attemptId": "64f456...",
  "answers": {
    "q_1705320000_0": "Option A",
    "q_1705320000_1": ["Option B", "Option C"],
    "q_1705320000_2": "True"
  }
}
```

#### Flag Question
```http
POST /quiz-attempts/flag
Authorization: Bearer <token>
Content-Type: application/json

{
  "attemptId": "64f456...",
  "questionId": "q_1705320000_0",
  "flagged": true
}
```

#### Complete Quiz Attempt
```http
POST /quiz-attempts/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "attemptId": "64f456..."
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Quiz completed successfully",
  "data": {
    "attempt": {...},
    "quiz": {...},
    "detailedResults": [
      {
        "questionId": "q_1705320000_0",
        "question": "What is 2+2?",
        "userAnswer": "4",
        "correctAnswer": "4",
        "isCorrect": true,
        "points": 1,
        "explanation": "2+2 equals 4"
      }
    ],
    "performance": {
      "totalScore": 8,
      "percentage": 80,
      "grade": "A",
      "timeSpent": 15,
      "averageTimePerQuestion": 1.5
    },
    "recommendations": [
      "Great job! You have a strong grasp of the topic",
      "Review the explanations for incorrect answers"
    ]
  }
}
```

#### Get Quiz Attempt Details
```http
GET /quiz-attempts/:id
Authorization: Bearer <token>
```

#### Get Attempt Progress
```http
GET /quiz-attempts/:id/progress
Authorization: Bearer <token>
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "attemptId": "64f456...",
    "status": "in-progress",
    "answeredQuestions": 7,
    "totalQuestions": 10,
    "progressPercentage": 70,
    "flaggedQuestions": ["q_1705320000_3"],
    "timeLimit": 30,
    "timeRemaining": 18,
    "startedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### Get User's Attempts
```http
GET /quiz-attempts/my-attempts?quizId=64f123...&status=completed&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Quiz Results
```http
GET /quiz-attempts/result/:attemptId
Authorization: Bearer <token>
```

#### Abandon Attempt
```http
PATCH /quiz-attempts/:id/abandon
Authorization: Bearer <token>
```

#### Get Attempts for a Quiz
```http
GET /quiz-attempts/quiz/:quizId/attempts?page=1&limit=10
```

### 📊 Statistics & Analytics

#### Get User Statistics
```http
GET /quiz-attempts/stats/user?timeframe=month&subject=Mathematics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "totalQuizzes": 25,
    "totalAttempts": 45,
    "completedQuizzes": 42,
    "averageScore": 78,
    "bestScore": 95,
    "totalTimeSpent": 480,
    "favoriteSubjects": ["Mathematics", "Physics", "Chemistry"],
    "weakAreas": ["Calculus", "Thermodynamics"],
    "strongAreas": ["Algebra", "Mechanics"],
    "streakDays": 7,
    "achievements": [],
    "lastActivityAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### Get Leaderboard
```http
GET /quiz-attempts/stats/leaderboard?quizId=64f123...&limit=10&timeframe=month
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "userId": "64f789...",
      "userName": "John Doe",
      "email": "john@example.com",
      "bestScore": 95,
      "totalAttempts": 12,
      "averageScore": 87.5,
      "totalTimeSpent": 180
    }
  ]
}
```

## Data Models

### Academic Levels
- `class-1` to `class-7`
- `jsc` (Junior School Certificate)
- `ssc` (Secondary School Certificate)
- `hsc` (Higher Secondary Certificate)
- `bsc` (Bachelor of Science)
- `msc` (Master of Science)

### Question Types
- `mcq` - Multiple Choice Question
- `short-answer` - Short Answer
- `true-false` - True/False
- `multiple-select` - Multiple Select
- `mixed` - Mixed Types (for quizzes)

### Difficulty Levels
- `easy`
- `medium`
- `hard`

### Languages
- `english`
- `bengali`
- `hindi`

### Quiz Status
- `draft` - Not published yet
- `published` - Available for attempts
- `archived` - No longer active

### Attempt Status
- `in-progress` - Currently being taken
- `completed` - Successfully completed
- `abandoned` - Left incomplete

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "success": false,
  "message": "User authentication required"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "success": false,
  "message": "Access denied to this resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "success": false,
  "message": "Internal server error"
}
```

## Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=8083
SOCKET=8082

# Database
MONGODB_URL=mongodb://localhost:27017/exam-qa-generator

# JWT
JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_ACCESS_EXPIRATION_TIME=5d
JWT_REFRESH_EXPIRATION_TIME=365d

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
DEV_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:8081

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# AWS S3 (optional for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

## Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd exam-qa-generator-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. **Start the development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
npm start
```

## Testing the API

You can test the API using tools like:
- **Postman** - Import the collection from `postman_collection.json`
- **cURL** - Use the provided cURL examples
- **Thunder Client** - VS Code extension for API testing

### Sample Test Flow

1. **Register a new user**
2. **Login to get JWT token**
3. **Generate a quiz with AI**
4. **Start a quiz attempt**
5. **Submit answers**
6. **Complete the quiz**
7. **View results and statistics**

## Architecture

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── config/                # Configuration files
├── models/               # Database models and business logic
│   ├── quiz/            # Quiz related files
│   ├── question/        # Question related files
│   ├── quizAttempt/     # Quiz attempt related files
│   ├── user/            # User related files
│   └── auth/            # Authentication files
├── services/            # External services (OpenAI)
├── middlewares/         # Express middlewares
├── shared/              # Shared utilities
├── routes/              # Route definitions
└── types/               # TypeScript type definitions
```

## Performance Considerations

- **Pagination**: All list endpoints support pagination
- **Indexing**: Database indexes on frequently queried fields
- **Caching**: Consider implementing Redis for session caching
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Security**: Helmet, CORS, XSS protection, and input sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please contact the development team or create an issue in the repository.
# User Dashboard API Documentation

## Overview
The User Dashboard provides comprehensive overview of user's quiz activities, performance analytics, and progress tracking. It includes total quizzes attempted, completion statistics, average marks, recent activities, and detailed analytics.

## Base URL
```
http://localhost:7972/api/dashboard
```

## Authentication
All dashboard endpoints require JWT token authentication.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

## API Endpoints

### 1. Dashboard Overview (Complete Statistics)

**Endpoint:** `GET /dashboard/overview`

**Description:** Get complete dashboard overview with all statistics including recent activity, weekly progress, subject performance, achievements, and more.

**Request:**
```bash
curl -X GET http://localhost:7972/api/dashboard/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalQuizzes": 15,
    "totalAttempts": 23,
    "completedQuizzes": 20,
    "averageScore": 78,
    "averagePercentage": 85,
    "bestScore": 95,
    "bestPercentage": 100,
    "totalTimeSpent": 420,
    "favoriteSubjects": ["Mathematics", "Physics", "Chemistry"],
    "recentActivity": [
      {
        "attemptId": "64f7b3b3b3b3b3b3b3b3b3b3",
        "quizId": "64f7b3b3b3b3b3b3b3b3b3b4",
        "quizTitle": "Basic Algebra Quiz",
        "subject": "Mathematics",
        "topic": "Algebra",
        "score": 18,
        "totalScore": 20,
        "percentage": 90,
        "grade": "A+",
        "gpa": 5.0,
        "timeSpent": 25,
        "difficulty": "medium",
        "completedAt": "2024-01-15T10:30:00Z",
        "status": "completed"
      }
    ],
    "weeklyProgress": [
      {
        "week": "2024-02",
        "weekStart": "2024-01-08T00:00:00Z",
        "weekEnd": "2024-01-14T23:59:59Z",
        "quizzesCompleted": 3,
        "averageScore": 82,
        "totalTimeSpent": 75
      }
    ],
    "subjectPerformance": [
      {
        "subject": "Mathematics",
        "totalAttempts": 8,
        "completedQuizzes": 7,
        "averageScore": 85,
        "averagePercentage": 89,
        "bestScore": 95,
        "totalTimeSpent": 180,
        "lastAttemptDate": "2024-01-15T10:30:00Z",
        "improvementTrend": "improving"
      }
    ],
    "difficultyBreakdown": {
      "easy": {
        "attempts": 5,
        "averageScore": 92,
        "averagePercentage": 95
      },
      "medium": {
        "attempts": 10,
        "averageScore": 78,
        "averagePercentage": 82
      },
      "hard": {
        "attempts": 5,
        "averageScore": 65,
        "averagePercentage": 70
      }
    },
    "achievements": [
      {
        "id": "first_quiz",
        "title": "First Steps",
        "description": "Completed your first quiz",
        "icon": "🎯",
        "category": "milestone",
        "unlockedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "streakDays": 5,
    "rank": 12,
    "lastActivityAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Dashboard Summary (Quick Stats)

**Endpoint:** `GET /dashboard/summary`

**Description:** Get essential dashboard statistics for header/sidebar display.

**Request:**
```bash
curl -X GET http://localhost:7972/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "totalQuizzes": 15,
    "totalAttempts": 23,
    "completedQuizzes": 20,
    "averageScore": 78,
    "averagePercentage": 85,
    "rank": 12,
    "streakDays": 5,
    "lastActivityAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3. All Quiz Attempts (With Filtering & Pagination)

**Endpoint:** `GET /dashboard/attempts`

**Description:** Get all quiz attempts with comprehensive filtering and pagination options.

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 20, max: 100) - Number of results per page
- `status` (string) - Filter by status: `completed`, `in-progress`, `abandoned`
- `subject` (string) - Filter by subject name
- `difficulty` (string) - Filter by difficulty: `easy`, `medium`, `hard`
- `fromDate` (ISO datetime) - Filter attempts from this date
- `toDate` (ISO datetime) - Filter attempts until this date

**Request Examples:**

**Basic Request:**
```bash
curl -X GET http://localhost:7972/api/dashboard/attempts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**With Filters:**
```bash
curl -X GET "http://localhost:7972/api/dashboard/attempts?status=completed&subject=Mathematics&difficulty=medium&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**With Date Range:**
```bash
curl -X GET "http://localhost:7972/api/dashboard/attempts?fromDate=2024-01-01T00:00:00Z&toDate=2024-01-31T23:59:59Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Quiz attempts retrieved successfully",
  "data": {
    "attempts": [
      {
        "attemptId": "64f7b3b3b3b3b3b3b3b3b3b3",
        "quizId": "64f7b3b3b3b3b3b3b3b3b3b4",
        "quizTitle": "Basic Algebra Quiz",
        "subject": "Mathematics",
        "topic": "Algebra",
        "difficulty": "medium",
        "questionCount": 20,
        "score": 18,
        "totalScore": 20,
        "percentage": 90,
        "grade": "A+",
        "gpa": 5.0,
        "timeSpent": 25,
        "status": "completed",
        "startedAt": "2024-01-15T10:00:00Z",
        "completedAt": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "totalCount": 23,
    "completedCount": 20,
    "inProgressCount": 2,
    "abandonedCount": 1,
    "filters": {
      "status": "completed",
      "subject": "Mathematics",
      "difficulty": "medium",
      "fromDate": null,
      "toDate": null
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 4. Recent Activity

**Endpoint:** `GET /dashboard/recent-activity`

**Description:** Get recent quiz activities (last 10 by default).

**Query Parameters:**
- `limit` (number, default: 10, max: 50) - Number of recent activities

**Request:**
```bash
curl -X GET "http://localhost:7972/api/dashboard/recent-activity?limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Recent activity retrieved successfully",
  "data": [
    {
      "attemptId": "64f7b3b3b3b3b3b3b3b3b3b3",
      "quizId": "64f7b3b3b3b3b3b3b3b3b3b4",
      "quizTitle": "Physics Quiz - Mechanics",
      "subject": "Physics",
      "topic": "Mechanics",
      "score": 16,
      "totalScore": 20,
      "percentage": 80,
      "grade": "A+",
      "gpa": 5.0,
      "timeSpent": 30,
      "difficulty": "hard",
      "completedAt": "2024-01-15T10:30:00Z",
      "status": "completed"
    }
  ]
}
```

### 5. Weekly Progress

**Endpoint:** `GET /dashboard/weekly-progress`

**Description:** Get weekly progress data for charts and analytics.

**Query Parameters:**
- `weeks` (number, default: 8, max: 52) - Number of weeks to include

**Request:**
```bash
curl -X GET "http://localhost:7972/api/dashboard/weekly-progress?weeks=12" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Weekly progress retrieved successfully",
  "data": [
    {
      "week": "2024-02",
      "weekStart": "2024-01-08T00:00:00Z",
      "weekEnd": "2024-01-14T23:59:59Z",
      "quizzesCompleted": 3,
      "averageScore": 82,
      "totalTimeSpent": 75
    },
    {
      "week": "2024-03",
      "weekStart": "2024-01-15T00:00:00Z",
      "weekEnd": "2024-01-21T23:59:59Z",
      "quizzesCompleted": 5,
      "averageScore": 88,
      "totalTimeSpent": 120
    }
  ]
}
```

### 6. Subject Performance

**Endpoint:** `GET /dashboard/subject-performance`

**Description:** Get subject-wise performance breakdown and trends.

**Request:**
```bash
curl -X GET http://localhost:7972/api/dashboard/subject-performance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Subject performance retrieved successfully",
  "data": [
    {
      "subject": "Mathematics",
      "totalAttempts": 8,
      "completedQuizzes": 7,
      "averageScore": 85,
      "averagePercentage": 89,
      "bestScore": 95,
      "totalTimeSpent": 180,
      "lastAttemptDate": "2024-01-15T10:30:00Z",
      "improvementTrend": "improving"
    },
    {
      "subject": "Physics",
      "totalAttempts": 6,
      "completedQuizzes": 5,
      "averageScore": 78,
      "averagePercentage": 82,
      "bestScore": 90,
      "totalTimeSpent": 150,
      "lastAttemptDate": "2024-01-14T14:20:00Z",
      "improvementTrend": "stable"
    },
    {
      "subject": "Chemistry",
      "totalAttempts": 9,
      "completedQuizzes": 8,
      "averageScore": 72,
      "averagePercentage": 76,
      "bestScore": 85,
      "totalTimeSpent": 210,
      "lastAttemptDate": "2024-01-13T16:45:00Z",
      "improvementTrend": "declining"
    }
  ]
}
```

## Dashboard Features

### 📊 **Key Statistics**
- **Total Quizzes**: Unique quizzes attempted by the user
- **Total Attempts**: Total number of quiz attempts (including retakes)
- **Completed Quizzes**: Successfully finished quiz attempts
- **Average Score**: Mean score across all completed quizzes
- **Average Percentage**: Mean percentage across all completed quizzes
- **Best Score**: Highest score achieved
- **Total Time Spent**: Cumulative time spent on quizzes (in minutes)

### 📈 **Analytics & Insights**
- **Weekly Progress**: Performance trends over time
- **Subject Performance**: Breakdown by academic subjects
- **Difficulty Analysis**: Performance across easy/medium/hard quizzes
- **Improvement Trends**: Performance trajectory (improving/stable/declining)
- **Achievement System**: Milestone and performance achievements
- **Rank & Leaderboard**: User position among all participants

### 🏆 **Achievements**
- **First Steps**: Complete your first quiz
- **Quiz Master**: Complete 10 quizzes
- **Perfect Score**: Achieve 100% on any quiz
- **High Achiever**: Maintain 80%+ average score
- **Consistency**: Maintain active streak
- **Subject Expert**: Excel in specific subjects

### 📱 **Real-time Updates**
- **Recent Activity**: Last 10 quiz activities
- **Current Streak**: Consecutive days with quiz activity
- **Live Rankings**: Real-time position updates
- **Progress Tracking**: Daily/weekly/monthly progress

## Grading System (Bangladesh Standard)

| Percentage | Grade | GPA |
|------------|-------|-----|
| 80-100%    | A+    | 5.0 |
| 75-79%     | A     | 4.0 |
| 70-74%     | A-    | 3.5 |
| 65-69%     | B+    | 3.25|
| 60-64%     | B     | 3.0 |
| 55-59%     | B-    | 2.75|
| 50-54%     | C+    | 2.5 |
| 45-49%     | C     | 2.25|
| 40-44%     | D     | 2.0 |
| Below 40%  | F     | 0.0 |

## Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "User authentication required"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid request parameters",
  "errors": [
    {
      "field": "limit",
      "message": "Limit must be a number between 1 and 100"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Failed to fetch dashboard statistics"
}
```

## Usage Examples

### Frontend Dashboard Implementation

```javascript
// Get dashboard overview for main dashboard page
const fetchDashboardOverview = async () => {
  try {
    const response = await fetch('/api/dashboard/overview', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard:', error);
  }
};

// Get paginated attempts with filters
const fetchQuizAttempts = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`/api/dashboard/attempts?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Get recent activity for sidebar
const fetchRecentActivity = async (limit = 5) => {
  const response = await fetch(`/api/dashboard/recent-activity?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### Dashboard Components Suggestions

1. **Overview Cards**: Display key metrics (total quizzes, average score, rank, streak)
2. **Progress Chart**: Weekly progress visualization
3. **Subject Performance**: Pie chart or bar chart for subject breakdown
4. **Recent Activity Feed**: List of recent quiz attempts
5. **Achievement Badges**: Display unlocked achievements
6. **Leaderboard Widget**: Show user's rank and nearby users
7. **Performance Trends**: Line charts showing improvement over time

## Best Practices

1. **Caching**: Implement caching for dashboard overview to improve performance
2. **Real-time Updates**: Use WebSocket for live updates of rankings and achievements
3. **Pagination**: Always use pagination for quiz attempts to handle large datasets
4. **Filtering**: Provide intuitive filtering options for better user experience
5. **Mobile Optimization**: Ensure dashboard is responsive and mobile-friendly
6. **Performance**: Load essential stats first, then secondary analytics
7. **Error Handling**: Implement proper error handling and fallback UI states

This comprehensive dashboard API provides all the necessary endpoints to create a rich, interactive user dashboard that showcases quiz performance, progress tracking, and detailed analytics.
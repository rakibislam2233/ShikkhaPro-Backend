# Gemini AI Integration for Quiz Generation

## Overview
Your exam quiz generator backend now supports both **OpenAI** and **Google Gemini** AI providers for generating quiz questions. By default, the system now uses **Gemini** as the primary AI provider, with OpenAI as an alternative option.

## Configuration

### Environment Variables
The following environment variables need to be added to your `.env` file:

```bash
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI (existing)
OPENAI_API_KEY=your_openai_api_key_here
```

**⚠️ Security Note:** Never commit your actual API keys to version control. Always use placeholder values in documentation and keep your real API keys in your local `.env` file which should be added to `.gitignore`.

## API Usage

### Generate Quiz with Gemini (Default)

**Endpoint:** `POST /api/quiz/generate`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body (using Gemini - default):**
```json
{
  "academicLevel": "ssc",
  "subject": "Physics",
  "topic": "Mechanics",
  "language": "english",
  "questionType": "mcq",
  "difficulty": "medium",
  "questionCount": 5,
  "timeLimit": 30,
  "instructions": "Focus on practical applications"
}
```

**Request Body (explicitly using Gemini):**
```json
{
  "academicLevel": "ssc",
  "subject": "Physics",
  "topic": "Mechanics",
  "language": "english",
  "questionType": "mcq",
  "difficulty": "medium",
  "questionCount": 5,
  "timeLimit": 30,
  "instructions": "Focus on practical applications",
  "aiProvider": "gemini"
}
```

**Request Body (using OpenAI):**
```json
{
  "academicLevel": "ssc",
  "subject": "Physics",
  "topic": "Mechanics",
  "language": "english",
  "questionType": "mcq",
  "difficulty": "medium",
  "questionCount": 5,
  "timeLimit": 30,
  "instructions": "Focus on practical applications",
  "aiProvider": "openai"
}
```

## Best Commands for Quiz Generation

### 1. **Basic MCQ Quiz (Recommended)**
```json
{
  "academicLevel": "ssc",
  "subject": "Mathematics",
  "topic": "Algebra",
  "language": "english",
  "questionType": "mcq",
  "difficulty": "medium",
  "questionCount": 10,
  "aiProvider": "gemini"
}
```

### 2. **Mixed Question Types Quiz**
```json
{
  "academicLevel": "hsc",
  "subject": "Chemistry",
  "topic": "Organic Chemistry",
  "language": "english",
  "questionType": "mixed",
  "difficulty": "hard",
  "questionCount": 15,
  "timeLimit": 45,
  "aiProvider": "gemini"
}
```

### 3. **Bengali Language Quiz**
```json
{
  "academicLevel": "jsc",
  "subject": "বিজ্ঞান",
  "topic": "পদার্থবিজ্ঞান",
  "language": "bengali",
  "questionType": "mcq",
  "difficulty": "easy",
  "questionCount": 8,
  "timeLimit": 20,
  "aiProvider": "gemini"
}
```

### 4. **Short Answer Quiz**
```json
{
  "academicLevel": "bsc",
  "subject": "Computer Science",
  "topic": "Data Structures",
  "language": "english",
  "questionType": "short-answer",
  "difficulty": "hard",
  "questionCount": 5,
  "timeLimit": 60,
  "instructions": "Provide detailed explanations with examples",
  "aiProvider": "gemini"
}
```

### 5. **True/False Quiz**
```json
{
  "academicLevel": "class-6",
  "subject": "History",
  "topic": "Ancient Civilizations",
  "language": "english",
  "questionType": "true-false",
  "difficulty": "easy",
  "questionCount": 12,
  "timeLimit": 15,
  "aiProvider": "gemini"
}
```

## Available Options

### Academic Levels
- `class-1` to `class-7` (Primary/Secondary)
- `jsc` (Junior School Certificate)
- `ssc` (Secondary School Certificate)
- `hsc` (Higher Secondary Certificate)
- `bsc` (Bachelor of Science)
- `msc` (Master of Science)

### Question Types
- `mcq` (Multiple Choice Questions)
- `short-answer` (Short Answer Questions)
- `true-false` (True/False Questions)
- `multiple-select` (Multiple Select Questions)
- `mixed` (Combination of all types)

### Difficulty Levels
- `easy` (Basic concepts and direct recall)
- `medium` (Application of concepts with some analysis)
- `hard` (Critical thinking and complex problem-solving)

### Languages
- `english`
- `bengali`
- `hindi`

### AI Providers
- `gemini` (Default - Google Gemini AI)
- `openai` (OpenAI GPT-4)

## Response Format

**Success Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Quiz generated successfully",
  "data": {
    "quizId": "60f7b3b3b3b3b3b3b3b3b3b3"
  }
}
```

## CURL Examples

### Generate Quiz with Gemini (Default)
```bash
curl -X POST http://localhost:7972/api/quiz/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "academicLevel": "ssc",
    "subject": "Physics",
    "topic": "Mechanics",
    "language": "english",
    "questionType": "mcq",
    "difficulty": "medium",
    "questionCount": 5
  }'
```

### Generate Quiz with OpenAI
```bash
curl -X POST http://localhost:7972/api/quiz/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "academicLevel": "ssc",
    "subject": "Physics",
    "topic": "Mechanics",
    "language": "english",
    "questionType": "mcq",
    "difficulty": "medium",
    "questionCount": 5,
    "aiProvider": "openai"
  }'
```

## Advantages of Gemini Integration

1. **Cost-effective**: Generally more affordable than OpenAI
2. **Fast Response**: Quick generation of quiz questions
3. **Multilingual Support**: Better support for Bengali and Hindi
4. **Educational Focus**: Optimized for educational content generation
5. **JSON Reliability**: Consistent JSON output formatting

## Getting Started

1. **Ensure you have a valid JWT token** for authentication
2. **Start with basic MCQ quizzes** using the recommended commands above
3. **Experiment with different academic levels** to match your target audience
4. **Use mixed question types** for comprehensive assessments
5. **Leverage multilingual support** for local language education

## Troubleshooting

- **Invalid API Key**: Ensure your Gemini API key is correctly set in the `.env` file
- **Authentication Error**: Verify your JWT token is valid and properly formatted
- **Validation Error**: Check that all required fields are provided and follow the correct format
- **Generation Timeout**: For large question counts, consider breaking into smaller batches

## Support

The system automatically falls back to error handling if one AI provider fails. Both OpenAI and Gemini services follow the same interface pattern, making it easy to switch between providers as needed.
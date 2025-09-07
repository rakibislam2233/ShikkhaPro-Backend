import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Exam Quiz Generator API',
      version: '1.0.0',
      description: 'Comprehensive API for managing quizzes, questions, quiz attempts, users, and authentication',
      contact: {
        name: 'API Support',
        email: 'support@quizapp.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? `http://localhost:${process.env.PORT || 7972}/api/v1`
          : `http://localhost:${process.env.PORT || 7972}/api/v1`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in format: Bearer <token>',
        },
      },
      schemas: {
        // User Related Schemas
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            profile: {
              type: 'object',
              properties: {
                fullName: {
                  type: 'string',
                  example: 'John Doe',
                },
                avatar: {
                  type: 'string',
                  example: '/uploads/avatars/user.jpg',
                },
                phoneNumber: {
                  type: 'string',
                  example: '+1234567890',
                },
              },
            },
            role: {
              type: 'string',
              enum: ['User', 'Admin', 'Super_Admin'],
              example: 'User',
            },
            status: {
              type: 'string',
              enum: ['active', 'blocked', 'pending'],
              example: 'active',
            },
            isEmailVerified: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // Quiz Related Schemas
        Quiz: {
          type: 'object',
          required: ['title', 'description', 'subject', 'academicLevel', 'difficulty', 'questions'],
          properties: {
            _id: {
              type: 'string',
              description: 'Quiz ID',
            },
            title: {
              type: 'string',
              description: 'Quiz title',
              example: 'Mathematics Quiz - Algebra Basics',
            },
            description: {
              type: 'string',
              description: 'Quiz description',
              example: 'A comprehensive quiz on basic algebra concepts',
            },
            subject: {
              type: 'string',
              description: 'Subject category',
              example: 'Mathematics',
            },
            topic: {
              type: 'string',
              description: 'Specific topic',
              example: 'Algebra',
            },
            academicLevel: {
              type: 'string',
              enum: ['class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'jsc', 'ssc', 'hsc', 'bsc', 'msc'],
              description: 'Academic level',
              example: 'hsc',
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard'],
              description: 'Difficulty level',
              example: 'medium',
            },
            language: {
              type: 'string',
              enum: ['english', 'bengali', 'hindi'],
              description: 'Quiz language',
              example: 'english',
            },
            questions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Question',
              },
            },
            timeLimit: {
              type: 'number',
              description: 'Time limit in minutes',
              example: 30,
            },
            instructions: {
              type: 'string',
              description: 'Quiz instructions',
              example: 'Answer all questions carefully. Each question carries equal marks.',
            },
            isPublic: {
              type: 'boolean',
              description: 'Whether quiz is public',
              default: true,
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              default: 'published',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['math', 'algebra', 'basic'],
            },
            totalPoints: {
              type: 'number',
              description: 'Total points for the quiz',
              example: 100,
            },
            attempts: {
              type: 'number',
              description: 'Number of attempts made',
              default: 0,
            },
            averageScore: {
              type: 'number',
              description: 'Average score of all attempts',
              default: 0,
            },
            createdBy: {
              type: 'string',
              description: 'Creator user ID',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // Question Schema
        Question: {
          type: 'object',
          required: ['id', 'question', 'type', 'correctAnswer', 'points', 'difficulty'],
          properties: {
            id: {
              type: 'string',
              description: 'Question ID',
              example: 'q1',
            },
            question: {
              type: 'string',
              description: 'Question text',
              example: 'What is 2 + 2?',
            },
            type: {
              type: 'string',
              enum: ['mcq', 'short-answer', 'true-false', 'multiple-select', 'mixed'],
              description: 'Question type',
              example: 'mcq',
            },
            options: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Answer options (for multiple choice questions)',
              example: ['3', '4', '5', '6'],
            },
            correctAnswer: {
              oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } }
              ],
              description: 'Correct answer(s)',
              example: '4',
            },
            points: {
              type: 'number',
              description: 'Points awarded for correct answer',
              example: 1,
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard'],
              description: 'Question difficulty',
              example: 'easy',
            },
            explanation: {
              type: 'string',
              description: 'Explanation of the correct answer',
              example: '2 + 2 equals 4 in basic arithmetic',
            },
            subject: {
              type: 'string',
              example: 'Mathematics',
            },
            topic: {
              type: 'string',
              example: 'Algebra',
            },
            academicLevel: {
              type: 'string',
              enum: ['class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'jsc', 'ssc', 'hsc', 'bsc', 'msc'],
              example: 'hsc',
            },
            language: {
              type: 'string',
              enum: ['english', 'bengali', 'hindi'],
              example: 'english',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['basic', 'arithmetic'],
            },
            isApproved: {
              type: 'boolean',
              description: 'Whether question is approved by admin',
              default: false,
            },
            usageCount: {
              type: 'number',
              description: 'Number of times question was used',
              default: 0,
            },
            averageScore: {
              type: 'number',
              description: 'Average score for this question',
            },
            createdBy: {
              type: 'string',
              description: 'Creator user ID',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // Quiz Attempt Schema
        QuizAttempt: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Attempt ID',
            },
            quizId: {
              type: 'string',
              description: 'Quiz ID',
            },
            userId: {
              type: 'string',
              description: 'User ID',
            },
            answers: {
              type: 'object',
              additionalProperties: {
                oneOf: [
                  { type: 'string' },
                  { type: 'array', items: { type: 'string' } }
                ],
              },
              description: 'User answers map',
              example: {
                'q1': '4',
                'q2': ['option1', 'option2']
              },
            },
            startedAt: {
              type: 'string',
              format: 'date-time',
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
            },
            score: {
              type: 'number',
              description: 'Total score achieved',
            },
            totalScore: {
              type: 'number',
              description: 'Maximum possible score',
            },
            totalQuestions: {
              type: 'number',
              description: 'Total number of questions',
            },
            correctAnswers: {
              type: 'number',
              description: 'Number of correct answers',
            },
            timeSpent: {
              type: 'number',
              description: 'Time spent in minutes',
            },
            isCompleted: {
              type: 'boolean',
              description: 'Whether attempt is completed',
              default: false,
            },
            status: {
              type: 'string',
              enum: ['in-progress', 'completed', 'abandoned'],
              description: 'Attempt status',
            },
            flaggedQuestions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of flagged question IDs',
            },
            timeLimit: {
              type: 'number',
              description: 'Time limit in minutes',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // Quiz Result Schema
        QuizResult: {
          type: 'object',
          properties: {
            attempt: {
              $ref: '#/components/schemas/QuizAttempt',
            },
            quiz: {
              $ref: '#/components/schemas/Quiz',
            },
            detailedResults: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  questionId: {
                    type: 'string',
                  },
                  question: {
                    type: 'string',
                  },
                  userAnswer: {
                    oneOf: [
                      { type: 'string' },
                      { type: 'array', items: { type: 'string' } }
                    ],
                  },
                  correctAnswer: {
                    oneOf: [
                      { type: 'string' },
                      { type: 'array', items: { type: 'string' } }
                    ],
                  },
                  isCorrect: {
                    type: 'boolean',
                  },
                  points: {
                    type: 'number',
                  },
                  explanation: {
                    type: 'string',
                  },
                },
              },
            },
            performance: {
              type: 'object',
              properties: {
                totalScore: {
                  type: 'number',
                },
                percentage: {
                  type: 'number',
                },
                grade: {
                  type: 'string',
                },
                timeSpent: {
                  type: 'number',
                },
                averageTimePerQuestion: {
                  type: 'number',
                },
              },
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },

        // Notification Schema
        Notification: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            title: {
              type: 'string',
              example: 'New Quiz Available',
            },
            message: {
              type: 'string',
              example: 'A new mathematics quiz has been published',
            },
            type: {
              type: 'string',
              enum: ['quiz', 'system', 'message', 'achievement'],
              example: 'quiz',
            },
            userId: {
              type: 'string',
              description: 'Target user ID',
            },
            isViewed: {
              type: 'boolean',
              default: false,
            },
            data: {
              type: 'object',
              description: 'Additional notification data',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // API Response Schemas
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            code: {
              type: 'number',
              example: 200,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
            meta: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  example: 1,
                },
                limit: {
                  type: 'number',
                  example: 10,
                },
                total: {
                  type: 'number',
                  example: 100,
                },
                totalPages: {
                  type: 'number',
                  example: 10,
                },
              },
            },
          },
        },

        ApiError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              default: false,
            },
            code: {
              type: 'number',
              example: 400,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            stack: {
              type: 'string',
              description: 'Error stack trace (development only)',
            },
          },
        },

        // Auth Related Schemas
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'profile'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'password123',
            },
            profile: {
              type: 'object',
              required: ['fullName'],
              properties: {
                fullName: {
                  type: 'string',
                  example: 'John Doe',
                },
                phoneNumber: {
                  type: 'string',
                  example: '+1234567890',
                },
              },
            },
          },
        },

        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              example: 'password123',
            },
          },
        },

        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
            },
            tokens: {
              type: 'object',
              properties: {
                access: {
                  type: 'object',
                  properties: {
                    token: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    },
                    expires: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
                refresh: {
                  type: 'object',
                  properties: {
                    token: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    },
                    expires: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
        },

        // Statistics Schema
        UserStats: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
            },
            totalQuizzes: {
              type: 'number',
              description: 'Total unique quizzes attempted',
            },
            totalAttempts: {
              type: 'number',
              description: 'Total quiz attempts made',
            },
            completedQuizzes: {
              type: 'number',
              description: 'Number of completed quizzes',
            },
            averageScore: {
              type: 'number',
              description: 'Average score percentage',
            },
            bestScore: {
              type: 'number',
              description: 'Best score achieved',
            },
            totalTimeSpent: {
              type: 'number',
              description: 'Total time spent in minutes',
            },
            favoriteSubjects: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Most attempted subjects',
            },
            weakAreas: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Areas needing improvement',
            },
            strongAreas: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Strong performance areas',
            },
            streakDays: {
              type: 'number',
              description: 'Current streak of active days',
            },
            achievements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  icon: { type: 'string' },
                  unlockedAt: { type: 'string', format: 'date-time' },
                  category: {
                    type: 'string',
                    enum: ['performance', 'consistency', 'improvement', 'milestone'],
                  },
                },
              },
            },
            lastActivityAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        Leaderboard: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
            },
            userName: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
            bestScore: {
              type: 'number',
            },
            totalAttempts: {
              type: 'number',
            },
            averageScore: {
              type: 'number',
            },
            totalTimeSpent: {
              type: 'number',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/models/*/routes/*.ts',
    './src/models/*/*.routes.ts',
    './src/routes/*.ts',
  ],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info hgroup.main h2 { color: #3b4151 }
      .swagger-ui .scheme-container { background: #f7f7f7; border: 1px solid #d3d3d3 }
    `,
    customSiteTitle: 'Quiz API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  }));

  // Serve swagger.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📖 Swagger documentation available at: /api-docs');
};

export default specs;
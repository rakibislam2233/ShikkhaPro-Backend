import { z } from 'zod';

const academicLevelSchema = z.enum([
  'class-1', 'class-2', 'class-3', 'class-4', 'class-5', 
  'class-6', 'class-7', 'jsc', 'ssc', 'hsc', 'bsc', 'msc'
]);

const questionTypeSchema = z.enum(['mcq', 'short-answer', 'true-false', 'multiple-select', 'mixed']);
const difficultySchema = z.enum(['easy', 'medium', 'hard']);
const languageSchema = z.enum(['english', 'bengali', 'hindi']);

const questionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters').max(2000, 'Question too long'),
  type: questionTypeSchema,
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string().min(5, 'Explanation must be at least 5 characters').max(1000, 'Explanation too long'),
  difficulty: difficultySchema,
  points: z.number().min(1).max(10).default(1),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const generateQuizValidation = z.object({
  body: z.object({
    academicLevel: academicLevelSchema,
    subject: z.string().min(2, 'Subject must be at least 2 characters').max(100),
    topic: z.string().min(2, 'Topic must be at least 2 characters').max(100).optional(),
    language: languageSchema,
    questionType: questionTypeSchema,
    difficulty: difficultySchema,
    questionCount: z.number().min(1).max(50),
    timeLimit: z.number().min(1).max(300).optional(),
    instructions: z.string().max(2000).optional(),
  }),
});

export const createQuizValidation = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().max(1000).optional(),
    subject: z.string().min(2, 'Subject must be at least 2 characters').max(100),
    topic: z.string().min(2, 'Topic must be at least 2 characters').max(100),
    academicLevel: academicLevelSchema,
    difficulty: difficultySchema,
    language: languageSchema,
    questions: z.array(questionSchema).min(1, 'Quiz must have at least one question'),
    timeLimit: z.number().min(1).max(300).optional(),
    isPublic: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    instructions: z.string().max(2000).optional(),
  }),
});

export const updateQuizValidation = z.object({
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().max(1000).optional(),
    subject: z.string().min(2).max(100).optional(),
    topic: z.string().min(2).max(100).optional(),
    academicLevel: academicLevelSchema.optional(),
    difficulty: difficultySchema.optional(),
    language: languageSchema.optional(),
    questions: z.array(questionSchema).min(1).optional(),
    timeLimit: z.number().min(1).max(300).optional(),
    isPublic: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    instructions: z.string().max(2000).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
});

export const getQuizValidation = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID'),
  }),
});

export const deleteQuizValidation = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID'),
  }),
});

export const searchQuizzesValidation = z.object({
  query: z.object({
    academicLevel: z.string().optional(),
    subject: z.string().optional(),
    difficulty: z.string().optional(),
    language: z.string().optional(),
    tags: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'attempts', 'averageScore', 'title']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const startQuizAttemptValidation = z.object({
  body: z.object({
    quizId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID'),
  }),
});

export const submitAnswerValidation = z.object({
  body: z.object({
    attemptId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid attempt ID'),
    questionId: z.string().min(1, 'Question ID is required'),
    answer: z.union([z.string(), z.array(z.string())]),
  }),
});

export const submitQuizAnswerValidation = z.object({
  body: z.object({
    quizId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID'),
    answers: z.record(z.union([z.string(), z.array(z.string())])),
  }),
});

export const completeQuizAttemptValidation = z.object({
  body: z.object({
    attemptId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid attempt ID'),
  }),
});
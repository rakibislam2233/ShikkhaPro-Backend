import { z } from 'zod';

const academicLevelSchema = z.enum([
  'class-1', 'class-2', 'class-3', 'class-4', 'class-5', 
  'class-6', 'class-7', 'jsc', 'ssc', 'hsc', 'bsc', 'msc'
]);

const questionTypeSchema = z.enum(['mcq', 'short-answer', 'true-false', 'multiple-select']);
const difficultySchema = z.enum(['easy', 'medium', 'hard']);
const languageSchema = z.enum(['english', 'bengali', 'hindi']);

export const createQuestionValidation = z.object({
  body: z.object({
    question: z.string().min(5, 'Question must be at least 5 characters').max(2000, 'Question too long'),
    type: questionTypeSchema,
    options: z.array(z.string()).optional(),
    correctAnswer: z.union([z.string(), z.array(z.string())]),
    explanation: z.string().min(5, 'Explanation must be at least 5 characters').max(1000, 'Explanation too long'),
    difficulty: difficultySchema,
    points: z.number().min(1).max(10).optional(),
    subject: z.string().min(2, 'Subject must be at least 2 characters').max(100),
    topic: z.string().min(2, 'Topic must be at least 2 characters').max(100),
    academicLevel: academicLevelSchema,
    language: languageSchema,
    category: z.string().max(100).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateQuestionValidation = z.object({
  body: z.object({
    question: z.string().min(5).max(2000).optional(),
    type: questionTypeSchema.optional(),
    options: z.array(z.string()).optional(),
    correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
    explanation: z.string().min(5).max(1000).optional(),
    difficulty: difficultySchema.optional(),
    points: z.number().min(1).max(10).optional(),
    subject: z.string().min(2).max(100).optional(),
    topic: z.string().min(2).max(100).optional(),
    academicLevel: academicLevelSchema.optional(),
    language: languageSchema.optional(),
    category: z.string().max(100).optional(),
    tags: z.array(z.string()).optional(),
    isApproved: z.boolean().optional(),
  }),
});

export const getQuestionValidation = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid question ID'),
  }),
});

export const deleteQuestionValidation = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid question ID'),
  }),
});

export const searchQuestionsValidation = z.object({
  query: z.object({
    subject: z.string().optional(),
    topic: z.string().optional(),
    academicLevel: z.string().optional(),
    difficulty: z.string().optional(),
    questionType: z.string().optional(),
    language: z.string().optional(),
    tags: z.string().optional(),
    isApproved: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'usageCount', 'averageScore']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const approveQuestionValidation = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid question ID'),
  }),
  body: z.object({
    isApproved: z.boolean(),
  }),
});
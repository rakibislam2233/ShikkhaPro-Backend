import { z } from 'zod';

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

export const saveAnswersValidation = z.object({
  body: z.object({
    attemptId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid attempt ID'),
    answers: z.record(z.union([z.string(), z.array(z.string())])),
  }),
});

export const completeQuizAttemptValidation = z.object({
  body: z.object({
    attemptId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid attempt ID'),
  }),
});

export const getQuizAttemptValidation = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid attempt ID'),
  }),
});

export const flagQuestionValidation = z.object({
  body: z.object({
    attemptId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid attempt ID'),
    questionId: z.string().min(1, 'Question ID is required'),
    flagged: z.boolean().optional().default(true),
  }),
});

export const getUserAttemptsValidation = z.object({
  query: z.object({
    quizId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID').optional(),
    status: z.enum(['in-progress', 'completed', 'abandoned']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'score', 'completedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const getQuizResultValidation = z.object({
  params: z.object({
    attemptId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid attempt ID'),
  }),
});

export const getLeaderboardValidation = z.object({
  query: z.object({
    quizId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID').optional(),
    limit: z.string().optional(),
    academicLevel: z.string().optional(),
    subject: z.string().optional(),
    timeframe: z.enum(['all', 'week', 'month', 'year']).optional().default('all'),
  }),
});

export const getUserStatsValidation = z.object({
  query: z.object({
    timeframe: z.enum(['all', 'week', 'month', 'year']).optional().default('all'),
    subject: z.string().optional(),
    academicLevel: z.string().optional(),
  }),
});
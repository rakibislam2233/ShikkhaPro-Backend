import { z } from 'zod';

export const getDashboardOverviewValidation = z.object({
  query: z.object({}).optional(),
});

export const getAllAttemptsValidation = z.object({
  query: z.object({
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    subject: z.string().min(1).max(100).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    status: z.enum(['completed', 'in-progress', 'abandoned']).optional(),
    limit: z.string().refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0 && num <= 100;
      },
      { message: 'Limit must be a number between 1 and 100' }
    ).optional(),
    page: z.string().refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0;
      },
      { message: 'Page must be a positive number' }
    ).optional(),
  }),
});

export const getRecentActivityValidation = z.object({
  query: z.object({
    limit: z.string().refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0 && num <= 50;
      },
      { message: 'Limit must be a number between 1 and 50' }
    ).optional(),
  }),
});

export const getWeeklyProgressValidation = z.object({
  query: z.object({
    weeks: z.string().refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0 && num <= 52;
      },
      { message: 'Weeks must be a number between 1 and 52' }
    ).optional(),
  }),
});

export const getSubjectPerformanceValidation = z.object({
  query: z.object({}).optional(),
});

export const getDashboardSummaryValidation = z.object({
  query: z.object({}).optional(),
});
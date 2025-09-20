import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import pick from '../../shared/pick';
import { DashboardService } from './dashboard.service';

// Get user dashboard overview with all statistics
const getDashboardOverview = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const dashboardStats = await DashboardService.getDashboardStats(userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Dashboard statistics retrieved successfully',
    data: dashboardStats,
  });
});

// Get all quiz attempts with filters and pagination
const getAllAttempts = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const filters = pick(req.query, [
    'fromDate',
    'toDate',
    'subject',
    'difficulty',
    'status',
    'limit',
    'page',
  ]);

  // Convert string values to appropriate types
  const convertedFilters: any = {};

  if (filters.fromDate) {
    convertedFilters.fromDate = new Date(filters.fromDate as string);
  }
  if (filters.toDate) {
    convertedFilters.toDate = new Date(filters.toDate as string);
  }
  if (filters.limit) {
    convertedFilters.limit = parseInt(filters.limit as string, 10);
  }
  if (filters.page) {
    convertedFilters.page = parseInt(filters.page as string, 10);
  }
  if (filters.status) {
    convertedFilters.status = filters.status;
  }
  if (filters.subject) {
    convertedFilters.subject = filters.subject;
  }
  if (filters.difficulty) {
    convertedFilters.difficulty = filters.difficulty;
  }

  const attemptsData = await DashboardService.getAllAttempts(userId, convertedFilters);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Quiz attempts retrieved successfully',
    data: attemptsData,
  });
});

// Get recent activity (last 10 activities)
const getRecentActivity = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const limit = parseInt(req.query.limit as string, 10) || 10;
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const recentActivity = await DashboardService.getRecentActivity(
    userObjectId,
    limit
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Recent activity retrieved successfully',
    data: recentActivity,
  });
});

// Get weekly progress data
const getWeeklyProgress = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const weeks = parseInt(req.query.weeks as string, 10) || 8;
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const weeklyProgress = await DashboardService.getWeeklyProgress(userObjectId, weeks);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Weekly progress retrieved successfully',
    data: weeklyProgress,
  });
});

// Get subject-wise performance
const getSubjectPerformance = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const subjectPerformance = await DashboardService.getSubjectPerformance(userObjectId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Subject performance retrieved successfully',
    data: subjectPerformance,
  });
});

// Get dashboard summary (quick stats for header/sidebar)
const getDashboardSummary = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const fullStats = await DashboardService.getDashboardStats(userId);

  // Extract only essential summary data
  const summary = {
    totalQuizzes: fullStats.totalQuizzes,
    totalAttempts: fullStats.totalAttempts,
    completedQuizzes: fullStats.completedQuizzes,
    averageScore: fullStats.averageScore,
    averagePercentage: fullStats.averagePercentage,
    rank: fullStats.rank,
    streakDays: fullStats.streakDays,
    lastActivityAt: fullStats.lastActivityAt,
  };

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Dashboard summary retrieved successfully',
    data: summary,
  });
});

export const DashboardController = {
  getDashboardOverview,
  getAllAttempts,
  getRecentActivity,
  getWeeklyProgress,
  getSubjectPerformance,
  getDashboardSummary,
};
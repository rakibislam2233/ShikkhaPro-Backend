import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import { quizAttemptService } from './quizAttempt.service';
import sendResponse from '../../shared/sendResponse';
import { IUser } from '../user/user.interface';
import pick from '../../shared/pick';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

const startQuizAttempt = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id?.toString();
  
  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User authentication required',
    });
  }

  const attempt = await quizAttemptService.startQuizAttempt(req.body, userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Quiz attempt started successfully',
    data: attempt,
  });
});

const submitAnswer = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id?.toString();
  
  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User authentication required',
    });
  }

  const attempt = await quizAttemptService.submitAnswer(req.body, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Answer submitted successfully',
    data: attempt,
  });
});

const saveAnswers = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id?.toString();
  
  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User authentication required',
    });
  }

  const attempt = await quizAttemptService.saveAnswers(req.body, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Answers saved successfully',
    data: attempt,
  });
});

const flagQuestion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id?.toString();
  
  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User authentication required',
    });
  }

  const { attemptId, questionId, flagged } = req.body;
  const attempt = await quizAttemptService.flagQuestion(attemptId, questionId, flagged ?? true, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Question ${flagged ? 'flagged' : 'unflagged'} successfully`,
    data: attempt,
  });
});

const completeQuizAttempt = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id?.toString();
  
  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User authentication required',
    });
  }

  const result = await quizAttemptService.completeQuizAttempt(req.body, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quiz completed successfully',
    data: result,
  });
});

const getQuizAttemptById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?._id?.toString();
  
  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User authentication required',
    });
  }

  const attempt = await quizAttemptService.getQuizAttemptById(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quiz attempt retrieved successfully',
    data: attempt,
  });
});

const getUserAttempts = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id?.toString();
  
  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User authentication required',
    });
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortOrder']);
  const filters = pick(req.query, ['quizId', 'status']);
  const result = await quizAttemptService.getUserAttempts(userId, options, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User attempts retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getQuizAttempts = catchAsync(async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortOrder']);
  const result = await quizAttemptService.getQuizAttempts(quizId, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quiz attempts retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getQuizResult = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { attemptId } = req.params;
  const userId = req.user?._id?.toString();
  
  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User authentication required',
    });
  }

  const result = await quizAttemptService.getQuizResult(attemptId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quiz result retrieved successfully',
    data: result,
  });
});

const getUserStats = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id?.toString();
  
  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User authentication required',
    });
  }

  const filters = pick(req.query, ['timeframe', 'subject', 'academicLevel']);
  const stats = await quizAttemptService.getUserStats(userId, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User statistics retrieved successfully',
    data: stats,
  });
});

const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const { quizId } = req.query;
  const limit = parseInt(req.query.limit as string) || 10;
  const filters = pick(req.query, ['timeframe', 'subject', 'academicLevel']);
  
  const leaderboard = await quizAttemptService.getLeaderboard(
    quizId as string || undefined, 
    limit,
    filters
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Leaderboard retrieved successfully',
    data: leaderboard,
  });
});

const abandonAttempt = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?._id?.toString();
  
  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User authentication required',
    });
  }

  const attempt = await quizAttemptService.abandonAttempt(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quiz attempt abandoned successfully',
    data: attempt,
  });
});

const getAttemptProgress = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?._id?.toString();
  
  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User authentication required',
    });
  }

  const progress = await quizAttemptService.getAttemptProgress(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Attempt progress retrieved successfully',
    data: progress,
  });
});

export const QuizAttemptController = {
  startQuizAttempt,
  submitAnswer,
  saveAnswers,
  flagQuestion,
  completeQuizAttempt,
  getQuizAttemptById,
  getUserAttempts,
  getQuizAttempts,
  getQuizResult,
  getUserStats,
  getLeaderboard,
  abandonAttempt,
  getAttemptProgress,
};
import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import { quizAttemptService } from './quizAttempt.service';
import sendResponse from '../../shared/sendResponse';
import { IUser } from '../user/user.interface';
import pick from '../../shared/pick';
import { StatusCodes } from 'http-status-codes';

const startQuizAttempt = catchAsync(
  async (req, res) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: 'User authentication required',
      });
    }

    const attempt = await quizAttemptService.startQuizAttempt(req.body, userId);

    sendResponse(res, {
      code: StatusCodes.CREATED,
      message: 'Quiz attempt started successfully',
      data: attempt,
    });
  }
);

const submitAnswer = catchAsync(
  async (req, res) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: 'User authentication required',
      });
    }

    const attempt = await quizAttemptService.submitAnswer(req.body, userId);

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Answer submitted successfully',
      data: attempt,
    });
  }
);

const saveAnswers = catchAsync(
  async (req, res) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: 'User authentication required',
      });
    }

    const attempt = await quizAttemptService.saveAnswers(req.body, userId);

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Answers saved successfully',
      data: attempt,
    });
  }
);

const flagQuestion = catchAsync(
  async (req, res) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: 'User authentication required',
      });
    }

    const { attemptId, questionId, flagged } = req.body;
    const attempt = await quizAttemptService.flagQuestion(
      attemptId,
      questionId,
      flagged ?? true,
      userId
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      message: `Question ${flagged ? 'flagged' : 'unflagged'} successfully`,
      data: attempt,
    });
  }
);

const completeQuizAttempt = catchAsync(
  async (req, res) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: 'User authentication required',
      });
    }

    const result = await quizAttemptService.completeQuizAttempt(
      req.body,
      userId
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Quiz completed successfully',
      data: result,
    });
  }
);

const getQuizAttemptById = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id?.toString();

    if (!userId) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: 'User authentication required',
      });
    }

    const attempt = await quizAttemptService.getQuizAttemptById(id, userId);

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Quiz attempt retrieved successfully',
      data: attempt,
    });
  }
);

const getUserAttempts = catchAsync(
  async (req, res) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: 'User authentication required',
      });
    }

    const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortOrder']);
    const filters = pick(req.query, ['quizId', 'status']);
    const result = await quizAttemptService.getUserAttempts(
      userId,
      options,
      filters
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'User attempts retrieved successfully',
      data: result,
    });
  }
);

const getQuizAttempts = catchAsync(async (req: Request, res) => {
  const { quizId } = req.params;
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortOrder']);
  const result = await quizAttemptService.getQuizAttempts(quizId, options);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Quiz attempts retrieved successfully',
    data: result,
  });
});

const getQuizResult = catchAsync(
  async (req, res) => {
    const { attemptId } = req.params;
    const userId = req.user?._id?.toString();

    if (!userId) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: 'User authentication required',
      });
    }

    const result = await quizAttemptService.getQuizResult(attemptId, userId);

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Quiz result retrieved successfully',
      data: result,
    });
  }
);

const getUserStats = catchAsync(
  async (req, res) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: 'User authentication required',
      });
    }

    const filters = pick(req.query, ['timeframe', 'subject', 'academicLevel']);
    const stats = await quizAttemptService.getUserStats(userId, filters);

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'User statistics retrieved successfully',
      data: stats,
    });
  }
);

const getLeaderboard = catchAsync(async (req: Request, res) => {
  const { quizId } = req.query;
  const limit = parseInt(req.query.limit as string) || 10;
  const filters = pick(req.query, ['timeframe', 'subject', 'academicLevel']);

  const leaderboard = await quizAttemptService.getLeaderboard(
    (quizId as string) || undefined,
    limit,
    filters
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Leaderboard retrieved successfully',
    data: leaderboard,
  });
});

const abandonAttempt = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id?.toString();

    if (!userId) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: 'User authentication required',
      });
    }

    const attempt = await quizAttemptService.abandonAttempt(id, userId);

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Quiz attempt abandoned successfully',
      data: attempt,
    });
  }
);

const getAttemptProgress = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id?.toString();

    if (!userId) {
      return sendResponse(res, {
        code: StatusCodes.UNAUTHORIZED,
        message: 'User authentication required',
      });
    }

    const progress = await quizAttemptService.getAttemptProgress(id, userId);

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Attempt progress retrieved successfully',
      data: progress,
    });
  }
);

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

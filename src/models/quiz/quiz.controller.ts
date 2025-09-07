import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import { QuizServices } from './quiz.service';
import sendResponse from '../../shared/sendResponse';
import pick from '../../shared/pick';
import { StatusCodes } from 'http-status-codes';

// generate quiz for all authorized users
const generateQuiz = catchAsync(async (req, res) => {
  const { userId } = req.user;
  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }
  const quiz = await QuizServices.generateQuiz(req.body, userId);

  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'Quiz generated successfully',
    data: quiz,
  });
});

// not implemented yet
const createQuiz = catchAsync(async (req, res) => {
  const userId = req.user?._id?.toString();
  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const quiz = await QuizServices.createQuiz(req.body, userId);

  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'Quiz created successfully',
    data: quiz,
  });
});

// get specific user single quiz
const getQuizById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  const quiz = await QuizServices.getQuizById(id, userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Quiz retrieved successfully',
    data: quiz,
  });
});

// update specific user single quiz
const updateQuiz = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const quiz = await QuizServices.updateQuiz(id, req.body, userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Quiz updated successfully',
    data: quiz,
  });
});

// delete specific user single quiz
const deleteQuiz = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id?.toString();

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  await QuizServices.deleteQuiz(id, userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Quiz deleted successfully',
  });
});

// get all user quizzes
const getUserQuizzes = catchAsync(async (req, res) => {
  const { userId } = req.user;
  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }
  const filters = pick(req.query, [
    'subject',
    'topic',
    'difficulty',
    'academicLevel',
    'status',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortOrder']);
  filters.userId = userId;
  const result = await QuizServices.getUserQuizzes(filters, options);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'User quizzes retrieved successfully',
    data: result,
  });
});

const startQuizAttempt = catchAsync(async (req, res) => {
  const userId = req.user?._id?.toString();

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const attempt = await QuizServices.startQuizAttempt(req.body, userId);

  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'Quiz attempt started successfully',
    data: attempt,
  });
});

const submitAnswer = catchAsync(async (req, res) => {
  const userId = req.user?._id?.toString();

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const attempt = await QuizServices.submitAnswer(req.body, userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Answer submitted successfully',
    data: attempt,
  });
});

const saveAnswers = catchAsync(async (req, res) => {
  const userId = req.user?._id?.toString();

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const attempt = await QuizServices.saveAnswers(req.body, userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Answers saved successfully',
    data: attempt,
  });
});

const completeQuizAttempt = catchAsync(async (req, res) => {
  const userId = req.user?._id?.toString();

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const result = await QuizServices.completeQuizAttempt(req.body, userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Quiz completed successfully',
    data: result,
  });
});

const getQuizResult = catchAsync(async (req, res) => {
  const { attemptId } = req.params;
  const userId = req.user?._id?.toString();

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const result = await QuizServices.getQuizResult(attemptId, userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Quiz result retrieved successfully',
    data: result,
  });
});

const getUserStats = catchAsync(async (req, res) => {
  const userId = req.user?._id?.toString();

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const stats = await QuizServices.getUserStats(userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'User statistics retrieved successfully',
    data: stats,
  });
});

const getLeaderboard = catchAsync(async (req: Request, res) => {
  const { quizId } = req.query;
  const limit = parseInt(req.query.limit as string) || 10;

  const leaderboard = await QuizServices.getLeaderboard(
    (quizId as string) || undefined,
    limit
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Leaderboard retrieved successfully',
    data: leaderboard,
  });
});

export const QuizController = {
  generateQuiz,
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getUserQuizzes,
  startQuizAttempt,
  submitAnswer,
  saveAnswers,
  completeQuizAttempt,
  getQuizResult,
  getUserStats,
  getLeaderboard,
};

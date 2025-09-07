import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { UserRoles } from '../user/user.interface';
import pick from '../../shared/pick';
import { QuestionServices } from './question.service';

const createQuestion = catchAsync(async (req, res) => {
  const userId = req.user?._id?.toString();
  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const question = await QuestionServices.createQuestion(req.body, userId);

  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'Question created successfully',
    data: question,
  });
});

const getQuestionById = catchAsync(async (req: Request, res) => {
  const { id } = req.params;
  const question = await QuestionServices.getQuestionById(id);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Question retrieved successfully',
    data: question,
  });
});

const updateQuestion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id?.toString();
  const isAdmin =
    req.user?.role === UserRoles.Admin ||
    req.user?.role === UserRoles.Super_Admin;

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const question = await QuestionServices.updateQuestion(
    id,
    req.body,
    userId,
    isAdmin
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Question updated successfully',
    data: question,
  });
});

const deleteQuestion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id?.toString();
  const isAdmin =
    req.user?.role === UserRoles.Admin ||
    req.user?.role === UserRoles.Super_Admin;

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  await QuestionServices.deleteQuestion(id, userId, isAdmin);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Question deleted successfully',
  });
});

const getUserQuestions = catchAsync(async (req, res) => {
  const userId = req.user?._id?.toString();

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortOrder']);
  const result = await QuestionServices.getUserQuestions(userId, options);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'User questions retrieved successfully',
    data: result,
  });
});

const getApprovedQuestions = catchAsync(async (req: Request, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortOrder']);
  const result = await QuestionServices.getApprovedQuestions(options);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Approved questions retrieved successfully',
    data: result,
  });
});

const searchQuestions = catchAsync(async (req: Request, res) => {
  const filters = pick(req.query, [
    'subject',
    'topic',
    'academicLevel',
    'difficulty',
    'questionType',
    'language',
    'tags',
    'isApproved',
    'dateRange',
  ]);

  // Parse array filters
  if (filters.subject && typeof filters.subject === 'string') {
    filters.subject = filters.subject.split(',');
  }
  if (filters.topic && typeof filters.topic === 'string') {
    filters.topic = filters.topic.split(',');
  }
  if (filters.academicLevel && typeof filters.academicLevel === 'string') {
    filters.academicLevel = filters.academicLevel.split(',');
  }
  if (filters.difficulty && typeof filters.difficulty === 'string') {
    filters.difficulty = filters.difficulty.split(',');
  }
  if (filters.questionType && typeof filters.questionType === 'string') {
    filters.questionType = filters.questionType.split(',');
  }
  if (filters.language && typeof filters.language === 'string') {
    filters.language = filters.language.split(',');
  }
  if (filters.tags && typeof filters.tags === 'string') {
    filters.tags = filters.tags.split(',');
  }
  if (filters.isApproved && typeof filters.isApproved === 'string') {
    (filters as any).isApproved = filters.isApproved === 'true';
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortOrder']);
  const result = await QuestionServices.searchQuestions(filters, options);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Questions retrieved successfully',
    data: result,
  });
});

const approveQuestion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isApproved } = req.body;

  // Only admins can approve questions
  const isAdmin =
    req.user?.role === UserRoles.Admin ||
    req.user?.role === UserRoles.Super_Admin;
  if (!isAdmin) {
    return sendResponse(res, {
      code: StatusCodes.FORBIDDEN,
      message: 'Admin access required',
    });
  }

  const question = await QuestionServices.approveQuestion(id, isApproved);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: `Question ${isApproved ? 'approved' : 'rejected'} successfully`,
    data: question,
  });
});

const generateQuestion = catchAsync(async (req, res) => {
  const userId = req.user?._id?.toString();

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const { subject, topic, academicLevel, difficulty, questionType, language } =
    req.body;

  const question = await QuestionServices.generateQuestion(
    subject,
    topic,
    academicLevel,
    difficulty,
    questionType,
    language || 'english',
    userId
  );

  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'Question generated successfully',
    data: question,
  });
});

const improveQuestion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;
  const userId = req.user?._id?.toString();

  if (!userId) {
    return sendResponse(res, {
      code: StatusCodes.UNAUTHORIZED,
      message: 'User authentication required',
    });
  }

  const question = await QuestionServices.improveQuestion(id, feedback, userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Question improved successfully',
    data: question,
  });
});

const getQuestionsBySubject = catchAsync(async (req: Request, res) => {
  const { subject } = req.params;
  const questions = await QuestionServices.getQuestionsBySubject(subject);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Questions by subject retrieved successfully',
    data: questions,
  });
});

const getQuestionsByTopic = catchAsync(async (req: Request, res) => {
  const { topic } = req.params;
  const questions = await QuestionServices.getQuestionsByTopic(topic);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Questions by topic retrieved successfully',
    data: questions,
  });
});

const getQuestionStats = catchAsync(async (req: Request, res) => {
  const stats = await QuestionServices.getQuestionStats();

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Question statistics retrieved successfully',
    data: stats,
  });
});

export const QuestionController = {
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getUserQuestions,
  getApprovedQuestions,
  searchQuestions,
  approveQuestion,
  generateQuestion,
  improveQuestion,
  getQuestionsBySubject,
  getQuestionsByTopic,
  getQuestionStats,
};

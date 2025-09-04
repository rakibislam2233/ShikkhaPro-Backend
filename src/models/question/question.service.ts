import { StatusCodes } from 'http-status-codes';
import { Question } from './question.model';
import {
  IQuestion,
  ICreateQuestionRequest,
  IUpdateQuestionRequest,
  IQuestionSearchFilters,
} from './question.interface';
import ApiError from '../../errors/AppErro';
import { IPaginateOptions, IPaginateResult } from '../../types/paginate';
import { OpenAIService } from '../../services/openai.service';

const createQuestion = async (
  questionData: ICreateQuestionRequest,
  userId: string
): Promise<IQuestion> => {
  const question = new Question({
    ...questionData,
    createdBy: userId,
    points: questionData.points || 1,
    tags: questionData.tags || [],
  });

  return await question.save();
};

const getQuestionById = async (questionId: string): Promise<IQuestion> => {
  const question = await Question.findById(questionId).populate(
    'createdBy',
    'profile.fullName email'
  );

  if (!question) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Question not found');
  }

  return question;
};

const updateQuestion = async (
  questionId: string,
  updateData: IUpdateQuestionRequest,
  userId: string,
  isAdmin: boolean = false
): Promise<IQuestion> => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Question not found');
  }

  // Only allow the creator or admin to update questions
  if (!isAdmin && question.createdBy.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only update your own questions'
    );
  }

  // Only admins can approve questions
  if (updateData.isApproved !== undefined && !isAdmin) {
    delete updateData.isApproved;
  }

  Object.assign(question, updateData);
  return await question.save();
};

const deleteQuestion = async (
  questionId: string,
  userId: string,
  isAdmin: boolean = false
): Promise<void> => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Question not found');
  }

  // Only allow the creator or admin to delete questions
  if (!isAdmin && question.createdBy.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only delete your own questions'
    );
  }

  await Question.findByIdAndDelete(questionId);
};

const getUserQuestions = async (
  userId: string,
  options: IPaginateOptions
): Promise<IPaginateResult<IQuestion>> => {
  const filter = { createdBy: userId };
  options.sortBy = options.sortBy || 'createdAt';
  return await Question.paginate(filter, options);
};

const getApprovedQuestions = async (
  options: IPaginateOptions
): Promise<IPaginateResult<IQuestion>> => {
  const filter = { isApproved: true };
  options.populate = [{ path: 'createdBy', select: 'profile.fullName' }];
  options.sortBy = options.sortBy || 'createdAt';
  return await Question.paginate(filter, options);
};

const searchQuestions = async (
  filters: IQuestionSearchFilters,
  options: IPaginateOptions
): Promise<IPaginateResult<IQuestion>> => {
  const query: any = {};

  if (filters.subject && filters.subject.length > 0) {
    query.subject = { $in: filters.subject };
  }

  if (filters.topic && filters.topic.length > 0) {
    query.topic = { $in: filters.topic };
  }

  if (filters.academicLevel && filters.academicLevel.length > 0) {
    query.academicLevel = { $in: filters.academicLevel };
  }

  if (filters.difficulty && filters.difficulty.length > 0) {
    query.difficulty = { $in: filters.difficulty };
  }

  if (filters.questionType && filters.questionType.length > 0) {
    query.type = { $in: filters.questionType };
  }

  if (filters.language && filters.language.length > 0) {
    query.language = { $in: filters.language };
  }

  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  if (filters.isApproved !== undefined) {
    query.isApproved = filters.isApproved;
  }

  if (filters.dateRange) {
    query.createdAt = {
      ...(filters.dateRange.from && { $gte: new Date(filters.dateRange.from) }),
      ...(filters.dateRange.to && { $lte: new Date(filters.dateRange.to) }),
    };
  }
  options.populate = [{ path: 'createdBy', select: 'profile.fullName' }];
  options.sortBy = options.sortBy || 'createdAt';
  return await Question.paginate(query, options);
};

const approveQuestion = async (
  questionId: string,
  isApproved: boolean
): Promise<IQuestion> => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Question not found');
  }

  question.isApproved = isApproved;
  return await question.save();
};

const getQuestionsBySubject = async (subject: string): Promise<IQuestion[]> => {
  return await Question.getQuestionsBySubject(subject);
};

const getQuestionsByTopic = async (topic: string): Promise<IQuestion[]> => {
  return await Question.getQuestionsByTopic(topic);
};

const generateQuestion = async (
  subject: string,
  topic: string,
  academicLevel: any,
  difficulty: any,
  questionType: any,
  language: any,
  userId: string
): Promise<IQuestion> => {
  try {
    const generatedQuestion = await OpenAIService.openAIGenerateSingleQuestion(
      subject,
      topic,
      academicLevel,
      difficulty,
      questionType,
      language
    );

    const questionData: ICreateQuestionRequest = {
      question: generatedQuestion.question,
      type: generatedQuestion.type,
      options: generatedQuestion.options,
      correctAnswer: generatedQuestion.correctAnswer,
      explanation: generatedQuestion.explanation,
      difficulty: generatedQuestion.difficulty,
      points: generatedQuestion.points,
      subject,
      topic,
      academicLevel,
      language,
      category: generatedQuestion.category,
      tags: generatedQuestion.tags,
    };

    return await createQuestion(questionData, userId);
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to generate question');
  }
};

const improveQuestion = async (
  questionId: string,
  feedback: string,
  userId: string
): Promise<IQuestion> => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Question not found');
  }

  if (question.createdBy.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only improve your own questions'
    );
  }

  try {
    const improvedQuestion = await OpenAIService.openAIImproveQuestion(
      {
        id: question._id.toString(),
        question: question.question,
        type: question.type,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        points: question.points,
        category: question.category,
        tags: question.tags,
      },
      feedback
    );

    // Update the question with improved version
    Object.assign(question, {
      question: improvedQuestion.question,
      options: improvedQuestion.options,
      correctAnswer: improvedQuestion.correctAnswer,
      explanation: improvedQuestion.explanation,
      tags: improvedQuestion.tags,
    });

    return await question.save();
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to improve question');
  }
};

const incrementQuestionUsage = async (questionId: string): Promise<void> => {
  await Question.findByIdAndUpdate(questionId, { $inc: { usageCount: 1 } });
};

const getQuestionStats = async (): Promise<any> => {
  const stats = await Question.aggregate([
    {
      $group: {
        _id: null,
        totalQuestions: { $sum: 1 },
        approvedQuestions: {
          $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] },
        },
        pendingApproval: {
          $sum: { $cond: [{ $eq: ['$isApproved', false] }, 1, 0] },
        },
        averageUsage: { $avg: '$usageCount' },
        subjectDistribution: { $addToSet: '$subject' },
        difficultyDistribution: { $push: '$difficulty' },
        typeDistribution: { $push: '$type' },
      },
    },
  ]);

  const subjectStats = await Question.aggregate([
    { $group: { _id: '$subject', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const difficultyStats = await Question.aggregate([
    { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const typeStats = await Question.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return {
    ...stats[0],
    subjectStats,
    difficultyStats,
    typeStats,
  };
};

export const QuestionServices = {
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getUserQuestions,
  searchQuestions,
  approveQuestion,
  getQuestionsBySubject,
  getQuestionsByTopic,
  getApprovedQuestions,
  generateQuestion,
  improveQuestion,
  incrementQuestionUsage,
  getQuestionStats,
};

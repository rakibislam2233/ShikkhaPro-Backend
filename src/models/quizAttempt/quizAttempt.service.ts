import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import ApiError from '../../errors/AppErro';
import { IPaginateOptions, IPaginateResult } from '../../types/paginate';
import { IQuiz } from '../quiz/quiz.interface';
import { Quiz } from '../quiz/quiz.model';
import {
  ICompleteQuizAttemptRequest,
  IQuizAttemptDocument,
  IQuizResult,
  IQuizStats,
  ISaveAnswerRequest,
  IStartQuizAttemptRequest,
  ISubmitAnswerRequest
} from './quizAttempt.interface';
import { QuizAttempt } from './quizAttempt.model';
const startQuizAttempt = async (
  request: IStartQuizAttemptRequest,
  userId: string
): Promise<IQuizAttemptDocument> => {
  const quiz = await Quiz.findById(request.quizId);

  if (!quiz) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz not found');
  }

  // Check if quiz is accessible
  if (!quiz.isPublic && quiz.createdBy.toString() !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied to this quiz');
  }

  if (quiz.status !== 'published') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Quiz is not published');
  }

  // Check if user already has an in-progress attempt for this quiz
  const existingAttempt = await QuizAttempt.findOne({
    quizId: request.quizId,
    userId,
    status: 'in-progress',
  });

  if (existingAttempt) {
    // Check if time limit exceeded
    if (existingAttempt.timeLimit) {
      const timeElapsed =
        (Date.now() - existingAttempt.startedAt.getTime()) / (1000 * 60);
      if (timeElapsed > existingAttempt.timeLimit) {
        existingAttempt.status = 'abandoned';
        await existingAttempt.save();
      } else {
        return existingAttempt;
      }
    } else {
      return existingAttempt;
    }
  }

  const attempt = new QuizAttempt({
    quizId: request.quizId,
    userId,
    totalQuestions: quiz.questions.length,
    timeLimit: quiz.timeLimit,
    answers: new Map(),
  });

  return await attempt.save();
};
const submitAnswer = async (
  request: ISubmitAnswerRequest,
  userId: string
): Promise<IQuizAttemptDocument> => {
  const attempt = await QuizAttempt.findById(request.attemptId);

  if (!attempt) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz attempt not found');
  }

  if (attempt.userId.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only submit answers for your own attempts'
    );
  }

  if (attempt.status !== 'in-progress') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Quiz attempt is not in progress'
    );
  }

  // Check if time limit exceeded
  if (attempt.timeLimit) {
    const timeElapsed =
      (Date.now() - attempt.startedAt.getTime()) / (1000 * 60);
    if (timeElapsed > attempt.timeLimit) {
      attempt.status = 'abandoned';
      await attempt.save();
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Time limit exceeded');
    }
  }

  attempt.answers.set(request.questionId, request.answer);
  return await attempt.save();
};
const saveAnswers = async (
  request: ISaveAnswerRequest,
  userId: string
): Promise<IQuizAttemptDocument> => {
  const attempt = await QuizAttempt.findById(request.attemptId);

  if (!attempt) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz attempt not found');
  }

  if (attempt.userId.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only save answers for your own attempts'
    );
  }

  if (attempt.status !== 'in-progress') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Quiz attempt is not in progress'
    );
  }

  // Update answers
  Object.entries(request.answers).forEach(([questionId, answer]) => {
    attempt.answers.set(questionId, answer);
  });

  return await attempt.save();
};
const flagQuestion = async (
  attemptId: string,
  questionId: string,
  flagged: boolean,
  userId: string
): Promise<IQuizAttemptDocument> => {
  const attempt = await QuizAttempt.findById(attemptId);

  if (!attempt) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz attempt not found');
  }

  if (attempt.userId.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only flag questions for your own attempts'
    );
  }

  if (attempt.status !== 'in-progress') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Quiz attempt is not in progress'
    );
  }

  if (flagged) {
    if (!attempt.flaggedQuestions.includes(questionId)) {
      attempt.flaggedQuestions.push(questionId);
    }
  } else {
    attempt.flaggedQuestions = attempt.flaggedQuestions.filter(
      id => id !== questionId
    );
  }

  return await attempt.save();
};
const completeQuizAttempt = async (
  request: ICompleteQuizAttemptRequest,
  userId: string
): Promise<IQuizResult> => {
  const attempt = await QuizAttempt.findById(request.attemptId);

  if (!attempt) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz attempt not found');
  }

  if (attempt.userId.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only complete your own attempts'
    );
  }

  if (attempt.status !== 'in-progress') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Quiz attempt is not in progress'
    );
  }

  const quiz = await Quiz.findById(attempt.quizId);
  if (!quiz) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz not found');
  }

  // Mark as completed
  attempt.status = 'completed';
  attempt.isCompleted = true;
  attempt.completedAt = new Date();

  // Calculate score
  // await attempt.calculateQuizScore(quiz);

  // Update quiz statistics
  await updateQuizStats(quiz._id, attempt.score!, quiz.totalPoints!);

  return generateQuizResult(attempt, quiz);
};
const getQuizAttemptById = async (
  attemptId: string,
  userId: string
): Promise<IQuizAttemptDocument> => {
  const attempt = await QuizAttempt.findById(attemptId)
    .populate('quizId', 'title subject topic difficulty timeLimit')
    .populate('userId', 'profile.fullName email');

  if (!attempt) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz attempt not found');
  }

  if (attempt.userId._id.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only view your own attempts'
    );
  }

  return attempt;
};
const getUserAttempts = async (
  userId: string,
  options: IPaginateOptions,
  filters?: {
    quizId?: string;
    status?: 'in-progress' | 'completed' | 'abandoned';
  }
): Promise<IPaginateResult<IQuizAttemptDocument>> => {
  const query: any = { userId };

  if (filters?.quizId) {
    query.quizId = filters.quizId;
  }

  if (filters?.status) {
    query.status = filters.status;
  }
  options.populate = [
    {
      path: 'quizId',
      select: 'title subject topic difficulty timeLimit totalPoints',
    },
  ];
  options.sortBy = options.sortBy || 'createdAt';

  return (await QuizAttempt.paginate(query, options)) as IPaginateResult<
    IQuizAttemptDocument
  >;
};
const getQuizAttempts = async (
  quizId: string,
  options: IPaginateOptions
): Promise<IPaginateResult<IQuizAttemptDocument>> => {
  const query = { quizId, status: 'completed' };
  options.populate = [
    { path: 'userId', select: 'profile.fullName email' },
    { path: 'quizId', select: 'title subject topic' },
  ];
  options.sortBy = options.sortBy || 'createdAt';
  return (await QuizAttempt.paginate(query, options)) as IPaginateResult<
    IQuizAttemptDocument
  >;
};
const getQuizResult = async (
  attemptId: string,
  userId: string
): Promise<IQuizResult> => {
  const attempt = await QuizAttempt.findById(attemptId);

  if (!attempt) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz attempt not found');
  }

  if (attempt.userId.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only view your own results'
    );
  }

  if (attempt.status !== 'completed') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Quiz attempt is not completed'
    );
  }

  const quiz = await Quiz.findById(attempt.quizId);
  if (!quiz) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz not found');
  }

  return generateQuizResult(attempt, quiz);
};

const getUserStats = async (
  userId: string,
  filters?: { timeframe?: string; subject?: string; academicLevel?: string }
): Promise<IQuizStats> => {
  const baseStats = await QuizAttempt.getUserStats(userId);

  // Apply additional filters if needed
  let additionalQuery: any = { userId: new mongoose.Types.ObjectId(userId) };

  if (filters?.subject) {
    additionalQuery = {
      ...additionalQuery,
      $lookup: {
        from: 'quizzes',
        localField: 'quizId',
        foreignField: '_id',
        as: 'quiz',
      },
      $match: {
        ...additionalQuery,
        'quiz.subject': filters.subject,
      },
    };
  }

  if (filters?.timeframe && filters.timeframe !== 'all') {
    const now = new Date();
    let dateFilter: Date;

    switch (filters.timeframe) {
      case 'week':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(0);
    }

    additionalQuery.createdAt = { $gte: dateFilter };
  }

  return baseStats;
};

const getLeaderboard = async (
  quizId?: string,
  limit: number = 10,
  filters?: {
    timeframe?: string;
    subject?: string;
    academicLevel?: string;
  }
): Promise<any[]> => {
  return await QuizAttempt.getLeaderboard(quizId, limit);
};

const abandonAttempt = async (
  attemptId: string,
  userId: string
): Promise<IQuizAttemptDocument> => {
  const attempt = await QuizAttempt.findById(attemptId);

  if (!attempt) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz attempt not found');
  }

  if (attempt.userId.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only abandon your own attempts'
    );
  }

  if (attempt.status !== 'in-progress') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Only in-progress attempts can be abandoned'
    );
  }

  attempt.status = 'abandoned';
  return await attempt.save();
};

const getAttemptProgress = async (
  attemptId: string,
  userId: string
): Promise<any> => {
  const attempt = await QuizAttempt.findById(attemptId);

  if (!attempt) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz attempt not found');
  }

  if (attempt.userId.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only view your own attempt progress'
    );
  }

  const answeredQuestions = attempt.answers.size;
  const totalQuestions = attempt.totalQuestions;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  let timeRemaining = null;
  if (attempt.timeLimit) {
    const timeElapsed =
      (Date.now() - attempt.startedAt.getTime()) / (1000 * 60);
    timeRemaining = Math.max(0, attempt.timeLimit - timeElapsed);
  }

  return {
    attemptId: attempt._id,
    status: attempt.status,
    answeredQuestions,
    totalQuestions,
    progressPercentage: Math.round(progressPercentage),
    flaggedQuestions: attempt.flaggedQuestions,
    timeLimit: attempt.timeLimit,
    timeRemaining,
    startedAt: attempt.startedAt,
  };
};

const updateQuizStats = async (
  quizId: mongoose.Types.ObjectId,
  score: number,
  totalScore: number
): Promise<void> => {
  const attempts = await QuizAttempt.countDocuments({
    quizId,
    status: 'completed',
  });
  const avgResult = await QuizAttempt.aggregate([
    { $match: { quizId, status: 'completed' } },
    { $group: { _id: null, averageScore: { $avg: '$score' } } },
  ]);

  await Quiz.findByIdAndUpdate(quizId, {
    attempts,
    averageScore: Math.round(avgResult[0]?.averageScore || 0),
  });
};

const generateQuizResult = (attempt: IQuizAttemptDocument, quiz: IQuiz): IQuizResult => {
  const detailedResults = quiz.questions.map((question: any) => {
    const userAnswer = attempt.answers.get(question.id);
    let isCorrect = false;

    if (question.type === 'multiple-select') {
      const correctAnswers = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

      isCorrect =
        correctAnswers.length === userAnswers.length &&
        correctAnswers.every((ans: string) => userAnswers.includes(ans));
    } else {
      isCorrect =
        String(userAnswer || '')
          .toLowerCase()
          .trim() === String(question.correctAnswer).toLowerCase().trim();
    }

    return {
      questionId: question.id,
      question: question.question,
      userAnswer: userAnswer || '',
      correctAnswer: question.correctAnswer,
      isCorrect,
      points: isCorrect ? question.points : 0,
      explanation: question.explanation,
    };
  });

  const percentage = Math.round((attempt.score! / attempt.totalScore!) * 100);
  const timeSpent = attempt.timeSpent || 0;
  const questions = quiz.questions;
  const numQuestions = questions.length;
  const averageTimePerQuestion = Number(timeSpent) / numQuestions;

  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 50) grade = 'D';

  const recommendations = generateRecommendations(
    detailedResults,
    quiz,
    percentage
  );

  return {
    attempt,
    quiz,
    detailedResults,
    performance: {
      totalScore: attempt.score!,
      percentage,
      grade,
      timeSpent,
      averageTimePerQuestion: Math.round(averageTimePerQuestion * 100) / 100,
    },
    recommendations,
  };
};

const generateRecommendations = (
  detailedResults: any[],
  quiz: IQuiz,
  percentage: number
): string[] => {
  const recommendations = [];
  const incorrectQuestions = detailedResults.filter(r => !r.isCorrect);

  if (percentage < 60) {
    recommendations.push(
      `Consider reviewing the basics of ${quiz.subject} - ${quiz.topic}`
    );
    recommendations.push('Practice more questions on this topic');
    recommendations.push('Focus on understanding the fundamental concepts');
  } else if (percentage < 80) {
    recommendations.push(
      'Good job! Focus on understanding the concepts you missed'
    );
    recommendations.push('Review the explanations for incorrect answers');
  } else if (percentage < 95) {
    recommendations.push(
      'Excellent performance! You have a strong grasp of the topic'
    );
    recommendations.push('Review minor areas of improvement');
  } else {
    recommendations.push('Outstanding! You have mastered this topic');
    recommendations.push('Consider exploring more advanced topics');
  }

  if (incorrectQuestions.length > 0) {
    const difficultyCounts = incorrectQuestions.reduce((acc: any, q: any) => {
      const difficulty = quiz.questions.find(
        (qq: any) => qq.id === q.questionId
      )?.difficulty;
      if (difficulty) {
        acc[difficulty] = (acc[difficulty] || 0) + 1;
      }
      return acc;
    }, {});

    const mostMissedDifficulty = Object.keys(difficultyCounts).reduce((a, b) =>
      difficultyCounts[a] > difficultyCounts[b] ? a : b
    );

    if (mostMissedDifficulty) {
      recommendations.push(
        `Focus more on ${mostMissedDifficulty} level questions`
      );
    }
  }

  return recommendations;
};
export const QuizAttemptServices = {
  startQuizAttempt,
  submitAnswer,
  saveAnswers,
  flagQuestion,
  getUserStats,
  getQuizAttempts,
  completeQuizAttempt,
  getQuizAttemptById,
  getUserAttempts,
  getAttemptProgress,
  getQuizResult,
  generateQuizResult,
  generateRecommendations,
  getLeaderboard,
  updateQuizStats,
  abandonAttempt,
};

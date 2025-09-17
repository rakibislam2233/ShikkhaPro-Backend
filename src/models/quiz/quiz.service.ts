import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { Quiz } from './quiz.model';
import { QuizAttempt } from '../quizAttempt/quizAttempt.model';
import { OpenAIService } from '../../services/openai.service';
import {
  IQuiz,
  IGenerateQuizRequest,
  ICreateQuizRequest,
  IUpdateQuizRequest,
  QuizSearchFilters,
} from './quiz.interface';

import {
  IQuizAttemptDocument,
  IQuizResult,
  ISubmitAnswerRequest,
  ISaveAnswerRequest,
} from '../quizAttempt/quizAttempt.interface';
import ApiError from '../../errors/AppErro';
import { IPaginateOptions, IPaginateResult } from '../../types/paginate';

// Generate quiz
const generateQuiz = async (
  request: IGenerateQuizRequest,
  userId: string
): Promise<{ quizId: string }> => {
  try {
    const generatedQuestions = await OpenAIService.openAIGenerateQuiz(request);
    const quizData: ICreateQuizRequest = {
      title: `${request.subject} - ${request.topic} Quiz`,
      description: `A ${request.difficulty} level quiz on ${request?.topic} for ${request.academicLevel}`,
      subject: request.subject,
      topic: request?.topic,
      academicLevel: request.academicLevel,
      difficulty: request.difficulty,
      language: request.language,
      questions: generatedQuestions,
      timeLimit: request.timeLimit,
      instructions: request.instructions,
      isPublic: false,
      tags: [request.subject, request?.topic, request.academicLevel],
    };

    const response = await createQuiz(quizData, userId);
    return {
      quizId: response?._id.toString(),
    };
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to generate quiz');
  }
};

const determineQuestionType = (questions: any[]): any => {
  const types = [...new Set(questions.map(q => q.type))];
  return types.length === 1 ? types[0] : 'mixed';
};

// save the quize for backend
const createQuiz = async (
  quizData: ICreateQuizRequest,
  userId: string
): Promise<IQuiz> => {
  const quiz = new Quiz({
    ...quizData,
    createdBy: userId,
    config: {
      academicLevel: quizData.academicLevel,
      subject: quizData.subject,
      topic: quizData?.topic,
      language: quizData.language,
      questionType: determineQuestionType(quizData.questions),
      difficulty: quizData.difficulty,
      questionCount: quizData.questions.length,
      timeLimit: quizData?.timeLimit,
      instructions: quizData?.instructions,
    },
  });

  return await quiz.save();
};

// get specific user single quiz
const getQuizById = async (quizId: string, userId?: string): Promise<IQuiz> => {
  const quiz = await Quiz.findOne({
    _id: quizId,
    status: { $ne: 'archived' },
  }).populate('createdBy', 'profile.fullName email');
  if (!quiz) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz not found');
  }
  // Check if user has access to this quiz
  if (
    !quiz.isPublic &&
    (!userId || quiz?.createdBy?._id.toString() !== userId)
  ) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied to this quiz');
  }

  return quiz;
};

// update specific user single quiz
const updateQuiz = async (
  quizId: string,
  updateData: IUpdateQuizRequest,
  userId: string
): Promise<IQuiz> => {
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz not found');
  }

  if (quiz.createdBy.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only update your own quizzes'
    );
  }

  Object.assign(quiz, updateData);
  return await quiz.save();
};

// delete specific user single quiz
const deleteQuiz = async (quizId: string, userId: string): Promise<void> => {
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz not found');
  }

  if (quiz.createdBy.toString() !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only delete your own quizzes'
    );
  }

  // Soft delete by setting status to archived
  quiz.status = 'archived';
  await quiz.save();
};

// get all user quizzes
const getUserQuizzes = async (
  filters: QuizSearchFilters,
  options: IPaginateOptions
): Promise<IPaginateResult<IQuiz>> => {
  const query: any = {
    createdBy: filters?.userId,
    status: { $ne: 'archived' },
  };

  if (filters.academicLevel) {
    query.academicLevel = { $in: filters.academicLevel };
  }

  if (filters.subject && filters.subject.length > 0) {
    query.subject = { $in: filters.subject };
  }

  if (filters.difficulty && filters.difficulty.length > 0) {
    query.difficulty = { $in: filters.difficulty };
  }
  if (filters.language && filters.language.length > 0) {
    query.language = { $in: filters.language };
  }
  options.populate = [{ path: 'createdBy' }];
  options.sortBy = options.sortBy || 'createdAt';
  return await Quiz.paginate(query, options);
};

// submit an answer
const submitAnswer = async (request: ISubmitAnswerRequest, userId: string) => {
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
      (Date.now() - attempt.startedAt.getTime()) / (1000 * 60); // in minutes
    if (timeElapsed > attempt.timeLimit) {
      attempt.status = 'completed';
      attempt.completedAt = new Date();
      await attempt.save();
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Time limit exceeded');
    }
  }
  attempt.answers.set(request.questionId, request.answer);
  await attempt.save();
  return null;
};

const startQuiz = async (quizId: string, userId: string) => {
  const quiz = await getQuizById(quizId, userId);
  if (!quiz) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz not found');
  }
  const attempt = await QuizAttempt.create({
    quizId: quizId,
    userId,
    status: 'in-progress',
    startedAt: new Date(),
    totalQuestions: quiz.questions.length,
    timeLimit: quiz.estimatedTime,
  });
  return { attemptId: attempt._id };
};

const submitQuizAnswer = async (
  request: ISaveAnswerRequest,
  userId: string
) => {
  const quiz = await getQuizById(request.quizId, userId);
  if (!quiz) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz not found');
  }
  // Check if user already has an in-progress attempt for this quiz
  const existingAttempt = await QuizAttempt.findOne({
    quizId: request.quizId,
    userId,
    status: 'in-progress',
  });


  if (existingAttempt) {
    Object.entries(request.answers).forEach(([questionId, answer]) => {
      existingAttempt.answers.set(questionId, answer);
    });
    existingAttempt.status = 'completed';
    existingAttempt.isCompleted = true;
    existingAttempt.completedAt = new Date();
    await existingAttempt.calculateScore(quiz);
    return {
      attemptId: existingAttempt._id,
    };
  }

  const startedAt =
    request.startedAt ||
    new Date(Date.now() - (request.timeSpent || 0) * 60 * 1000);

  const attempt = new QuizAttempt({
    quizId: request.quizId,
    userId,
    totalQuestions: quiz.questions.length,
    timeLimit: quiz.timeLimit,
    answers: request.answers,
    startedAt: startedAt,
  });
  attempt.status = 'completed';
  attempt.isCompleted = true;
  attempt.completedAt = new Date();
  await attempt.calculateScore(quiz);

  return {
    attemptId: attempt._id,
  };
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

const getUserStats = async (userId: string): Promise<any> => {
  return await QuizAttempt.getUserStats(userId);
};

const getLeaderboard = async (
  quizId?: string,
  limit: number = 10
): Promise<any[]> => {
  return await QuizAttempt.getLeaderboard(quizId, limit);
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
    averageScore: avgResult[0]?.averageScore || 0,
  });
};

const generateQuizResult = (
  attempt: IQuizAttemptDocument,
  quiz: IQuiz
): IQuizResult => {
  const detailedResults = quiz.questions.map(question => {
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
        String(userAnswer).toLowerCase().trim() ===
        String(question.correctAnswer).toLowerCase().trim();
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

  const correctCount = detailedResults.filter(r => r.isCorrect).length;
  const totalQuestions = detailedResults.length;
  const totalScore = detailedResults.reduce(
    (sum, r) => sum + (r.isCorrect ? r.points : 0),
    0
  );
  const maxScore = quiz.totalPoints || quiz.questions.length;

  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const timeSpent = attempt.timeSpent || 0;
  const averageTimePerQuestion = timeSpent / quiz.questions.length;

  // Bangladesh grading system
  let grade = 'F';
  let gpa = 0.00;

  if (percentage >= 80) {
    grade = 'A+';
    gpa = 5.00;
  } else if (percentage >= 75) {
    grade = 'A';
    gpa = 4.00;
  } else if (percentage >= 70) {
    grade = 'A-';
    gpa = 3.50;
  } else if (percentage >= 65) {
    grade = 'B+';
    gpa = 3.25;
  } else if (percentage >= 60) {
    grade = 'B';
    gpa = 3.00;
  } else if (percentage >= 55) {
    grade = 'B-';
    gpa = 2.75;
  } else if (percentage >= 50) {
    grade = 'C+';
    gpa = 2.50;
  } else if (percentage >= 45) {
    grade = 'C';
    gpa = 2.25;
  } else if (percentage >= 40) {
    grade = 'D';
    gpa = 2.00;
  } else {
    grade = 'F';
    gpa = 0.00;
  }

  const recommendations = generateRecommendations(detailedResults, quiz);

  // Update attempt object with correct values
  const updatedAttempt = {
    ...attempt.toJSON(),
    correctAnswers: correctCount,
    score: totalScore,
    totalScore: maxScore,
    percentage,
    grade,
    gpa,
  };

  return {
    attempt: updatedAttempt,
    quiz,
    detailedResults,
    performance: {
      totalScore,
      percentage,
      grade,
      gpa,
      timeSpent,
      averageTimePerQuestion,
    },
    recommendations,
  };
};

const generateRecommendations = (
  detailedResults: any[],
  quiz: IQuiz
): string[] => {
  const recommendations = [];
  const incorrectQuestions = detailedResults.filter(r => !r.isCorrect);
  const percentage =
    (detailedResults.filter(r => r.isCorrect).length / detailedResults.length) *
    100;

  if (percentage < 60) {
    recommendations.push(
      `Consider reviewing the basics of ${quiz.subject} - ${quiz.topic}`
    );
    recommendations.push('Practice more questions on this topic');
  } else if (percentage < 80) {
    recommendations.push(
      'Good job! Focus on understanding the concepts you missed'
    );
  } else {
    recommendations.push(
      'Excellent performance! You have a strong grasp of the topic'
    );
  }

  if (incorrectQuestions.length > 0) {
    const categories = [...new Set(incorrectQuestions.map(q => q.explanation))];
    recommendations.push('Review the explanations for incorrect answers');
  }

  return recommendations;
};

export const QuizServices = {
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getUserQuizzes,
  submitAnswer,
  startQuiz,
  submitQuizAnswer,
  getQuizResult,
  generateQuiz,
  getUserStats,
  getLeaderboard,
  generateQuizResult,
  updateQuizStats,
};

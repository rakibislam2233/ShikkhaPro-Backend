import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { Quiz } from './quiz.model';
import { QuizAttempt } from '../quizAttempt/quizAttempt.model';
import { generateQuiz as openAIGenerateQuiz } from '../../services/openai.service';
import {
  IQuiz,
  IGenerateQuizRequest,
  ICreateQuizRequest,
  IUpdateQuizRequest,
  QuizSearchFilters,
} from './quiz.interface';
import {
  IQuizAttempt,
  IQuizResult,
  IStartQuizAttemptRequest,
  ISubmitAnswerRequest,
  ISaveAnswerRequest,
  ICompleteQuizAttemptRequest,
} from '../quizAttempt/quizAttempt.interface';
import ApiError from '../../errors/AppErro';
import { IPaginateOptions, IPaginateResult } from '../../types/paginate';
export const generateQuiz = async (
  request: IGenerateQuizRequest,
  userId: string
): Promise<IQuiz> => {
  try {
    const generatedQuestions = await openAIGenerateQuiz(request);

    const quizData: ICreateQuizRequest = {
      title: `${request.subject} - ${request.topic} Quiz`,
      description: `A ${request.difficulty} level quiz on ${request.topic} for ${request.academicLevel}`,
      subject: request.subject,
      topic: request.topic,
      academicLevel: request.academicLevel,
      difficulty: request.difficulty,
      language: request.language,
      questions: generatedQuestions,
      timeLimit: request.timeLimit,
      instructions: request.instructions,
      isPublic: false,
      tags: [request.subject, request.topic, request.academicLevel],
    };

    return await createQuiz(quizData, userId);
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to generate quiz');
  }
};

  async createQuiz(
    quizData: ICreateQuizRequest,
    userId: string
  ): Promise<IQuiz> {
    const quiz = new Quiz({
      ...quizData,
      createdBy: userId,
      config: {
        academicLevel: quizData.academicLevel,
        subject: quizData.subject,
        topic: quizData.topic,
        language: quizData.language,
        questionType: this.determineQuestionType(quizData.questions),
        difficulty: quizData.difficulty,
        questionCount: quizData.questions.length,
        timeLimit: quizData.timeLimit,
        instructions: quizData.instructions,
      },
    });

    return await quiz.save();
  }

  async getQuizById(quizId: string, userId?: string): Promise<IQuiz> {
    const quiz = await Quiz.findById(quizId).populate(
      'createdBy',
      'profile.fullName email'
    );

    if (!quiz) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz not found');
    }

    // Check if user has access to this quiz
    if (
      !quiz.isPublic &&
      (!userId || quiz.createdBy._id.toString() !== userId)
    ) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied to this quiz');
    }

    return quiz;
  }

  async updateQuiz(
    quizId: string,
    updateData: IUpdateQuizRequest,
    userId: string
  ): Promise<IQuiz> {
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

    if (updateData.questions) {
      quiz.config = {
        ...quiz.config,
        questionType: this.determineQuestionType(updateData.questions),
        questionCount: updateData.questions.length,
      };
    }

    return await quiz.save();
  }

  async deleteQuiz(quizId: string, userId: string): Promise<void> {
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
  }

  async getUserQuizzes(
    userId: string,
    options: IPaginateOptions
  ): Promise<IPaginateResult<IQuiz>> {
    const filter = { createdBy: userId };
    options.sortBy = options.sortBy || 'createdAt';
    return await Quiz.paginate(filter, options);
  }

  async getPublicQuizzes(
    options: IPaginateOptions
  ): Promise<IPaginateResult<IQuiz>> {
    const filter = { isPublic: true, status: 'published' };
    options.populate = [{ path: 'createdBy', select: 'profile.fullName' }];
    options.sortBy = options.sortBy || 'createdAt';
    return await Quiz.paginate(filter, options);
  }

  async searchQuizzes(
    filters: QuizSearchFilters,
    options: IPaginateOptions
  ): Promise<IPaginateResult<IQuiz>> {
    const query: any = { isPublic: true, status: 'published' };

    if (filters.academicLevel && filters.academicLevel.length > 0) {
      query.academicLevel = { $in: filters.academicLevel };
    }

    if (filters.subject && filters.subject.length > 0) {
      query.subject = { $in: filters.subject };
    }

    if (filters.difficulty && filters.difficulty.length > 0) {
      query.difficulty = { $in: filters.difficulty };
    }

    if (filters.questionType && filters.questionType.length > 0) {
      query['questions.type'] = { $in: filters.questionType };
    }

    if (filters.language && filters.language.length > 0) {
      query.language = { $in: filters.language };
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.dateRange) {
      query.createdAt = {
        ...(filters.dateRange.from && {
          $gte: new Date(filters.dateRange.from),
        }),
        ...(filters.dateRange.to && { $lte: new Date(filters.dateRange.to) }),
      };
    }
    options.populate = [{ path: 'createdBy', select: 'profile.fullName' }];
    options.sortBy = options.sortBy || 'createdAt';
    return await Quiz.paginate(query, options);
  }

  async startQuizAttempt(
    request: IStartQuizAttemptRequest,
    userId: string
  ): Promise<IQuizAttempt> {
    const quiz = await this.getQuizById(request.quizId, userId);

    // Check if user already has an in-progress attempt for this quiz
    const existingAttempt = await QuizAttempt.findOne({
      quizId: request.quizId,
      userId,
      status: 'in-progress',
    });

    if (existingAttempt) {
      return existingAttempt;
    }

    const attempt = new QuizAttempt({
      quizId: request.quizId,
      userId,
      totalQuestions: quiz.questions.length,
      timeLimit: quiz.timeLimit,
      answers: new Map(),
    });

    return await attempt.save();
  }

  async submitAnswer(
    request: ISubmitAnswerRequest,
    userId: string
  ): Promise<IQuizAttempt> {
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
    return await attempt.save();
  }

  async saveAnswers(
    request: ISaveAnswerRequest,
    userId: string
  ): Promise<IQuizAttempt> {
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
  }

  async completeQuizAttempt(
    request: ICompleteQuizAttemptRequest,
    userId: string
  ): Promise<IQuizResult> {
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
    await attempt.calculateScore(quiz);

    // Update quiz statistics
    await this.updateQuizStats(quiz._id, attempt.score!, quiz.totalPoints!);

    return this.generateQuizResult(attempt, quiz);
  }

  async getQuizResult(attemptId: string, userId: string): Promise<IQuizResult> {
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

    return this.generateQuizResult(attempt, quiz);
  }

  async getUserStats(userId: string): Promise<any> {
    return await QuizAttempt.getUserStats(userId);
  }

  async getLeaderboard(quizId?: string, limit: number = 10): Promise<any[]> {
    return await QuizAttempt.getLeaderboard(quizId, limit);
  }

  private determineQuestionType(questions: any[]): any {
    const types = [...new Set(questions.map(q => q.type))];
    return types.length === 1 ? types[0] : 'mixed';
  }

  private async updateQuizStats(
    quizId: mongoose.Types.ObjectId,
    score: number,
    totalScore: number
  ): Promise<void> {
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
  }

  private generateQuizResult(attempt: IQuizAttempt, quiz: IQuiz): IQuizResult {
    const detailedResults = quiz.questions.map(question => {
      const userAnswer = attempt.answers.get(question.id);
      let isCorrect = false;

      if (question.type === 'multiple-select') {
        const correctAnswers = Array.isArray(question.correctAnswer)
          ? question.correctAnswer
          : [question.correctAnswer];
        const userAnswers = Array.isArray(userAnswer)
          ? userAnswer
          : [userAnswer];

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

    const percentage = Math.round((attempt.score! / attempt.totalScore!) * 100);
    const timeSpent = attempt.timeSpent || 0;
    const averageTimePerQuestion = timeSpent / quiz.questions.length;

    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    const recommendations = this.generateRecommendations(detailedResults, quiz);

    return {
      attempt,
      quiz,
      detailedResults,
      performance: {
        totalScore: attempt.score!,
        percentage,
        grade,
        timeSpent,
        averageTimePerQuestion,
      },
      recommendations,
    };
  }

  private generateRecommendations(
    detailedResults: any[],
    quiz: IQuiz
  ): string[] {
    const recommendations = [];
    const incorrectQuestions = detailedResults.filter(r => !r.isCorrect);
    const percentage =
      (detailedResults.filter(r => r.isCorrect).length /
        detailedResults.length) *
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
      const categories = [
        ...new Set(incorrectQuestions.map(q => q.explanation)),
      ];
      recommendations.push('Review the explanations for incorrect answers');
    }

    return recommendations;
  }
}

export const quizService = new QuizService();

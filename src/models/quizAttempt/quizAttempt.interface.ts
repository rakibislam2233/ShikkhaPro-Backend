import mongoose, { Model } from 'mongoose';
import { IPaginateOptions, IPaginateResult } from '../../types/paginate';
import { IQuiz } from '../quiz/quiz.interface';

export interface IQuizAttempt {
  _id: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  answers: { [questionId: string]: string | string[] };
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  totalScore?: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent?: number; // in minutes
  isCompleted: boolean;
  flaggedQuestions: string[];
  status: 'in-progress' | 'completed' | 'abandoned';
  timeLimit?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizResult {
  attempt: IQuizAttempt;
  quiz: IQuiz;
  detailedResults: {
    questionId: string;
    question: string;
    userAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
    points: number;
    explanation: string;
  }[];
  performance: {
    totalScore: number;
    percentage: number;
    grade: string;
    timeSpent: number;
    averageTimePerQuestion: number;
  };
  recommendations: string[];
}

export interface IQuizStats {
  userId: mongoose.Types.ObjectId;
  totalQuizzes: number;
  totalAttempts: number;
  completedQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  favoriteSubjects: string[];
  weakAreas: string[];
  strongAreas: string[];
  streakDays: number;
  achievements: IAchievement[];
  lastActivityAt: Date;
}

export interface IAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'performance' | 'consistency' | 'improvement' | 'milestone';
}

export interface IQuizAttemptModel extends Model<IQuizAttempt> {
  paginate: (
    filter: object,
    options: IPaginateOptions
  ) => Promise<IPaginateResult<IQuizAttempt>>;
  isExistAttemptById(id: string): Promise<Partial<IQuizAttempt> | null>;
  getUserAttempts(userId: string): Promise<IQuizAttempt[]>;
  getQuizAttempts(quizId: string): Promise<IQuizAttempt[]>;
  getUserStats(userId: string): Promise<IQuizStats>;
  getLeaderboard(quizId?: string, limit?: number): Promise<any[]>;
}

export interface IStartQuizAttemptRequest {
  quizId: string;
}

export interface ISubmitAnswerRequest {
  attemptId: string;
  questionId: string;
  answer: string | string[];
}

export interface ISaveAnswerRequest {
  attemptId: string;
  answers: { [questionId: string]: string | string[] };
}

export interface ICompleteQuizAttemptRequest {
  attemptId: string;
}
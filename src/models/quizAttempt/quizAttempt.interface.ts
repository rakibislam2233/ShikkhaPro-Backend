import mongoose, { Model } from 'mongoose';
import { IPaginateOptions, IPaginateResult } from '../../types/paginate';
import { IQuiz } from '../quiz/quiz.interface';

export interface IQuizAttempt {
  _id: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  answers: Map<string, string | string[]>;
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
  attempt: IQuizAttemptDocument | any;
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

export interface IQuizAttemptDocument extends IQuizAttempt, mongoose.Document {
  _id: mongoose.Types.ObjectId;
  calculateScore(quiz: any): Promise<IQuizAttemptDocument>;
}

export interface IQuizAttemptModel extends Model<IQuizAttemptDocument> {
  paginate: (
    filter: object,
    options: IPaginateOptions
  ) => Promise<IPaginateResult<IQuizAttemptDocument>>;
  isExistAttemptById(id: string): Promise<Partial<IQuizAttemptDocument> | null>;
  getUserAttempts(userId: string): Promise<IQuizAttemptDocument[]>;
  getQuizAttempts(quizId: string): Promise<IQuizAttemptDocument[]>;
  getUserStats(userId: string): Promise<IQuizStats>;
  getLeaderboard(quizId?: string, limit?: number): Promise<any[]>;
}

export interface ISubmitAnswerRequest {
  attemptId: string;
  questionId: string;
  answer: string | string[];
}

export interface ISaveAnswerRequest {
  quizId: string;
  answers: { [questionId: string]: string | string[] };
}
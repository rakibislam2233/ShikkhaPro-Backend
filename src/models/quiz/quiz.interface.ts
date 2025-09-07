import mongoose, { Model } from 'mongoose';
import { IPaginateOptions, IPaginateResult } from '../../types/paginate';

export type AcademicLevel =
  | 'class-1'
  | 'class-2'
  | 'class-3'
  | 'class-4'
  | 'class-5'
  | 'class-6'
  | 'class-7'
  | 'jsc'
  | 'ssc'
  | 'hsc'
  | 'bsc'
  | 'msc';

export type QuestionType =
  | 'mcq'
  | 'short-answer'
  | 'true-false'
  | 'multiple-select'
  | 'mixed';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export type Difficulty = QuizDifficulty;

export type QuizLanguage = 'english' | 'bengali' | 'hindi';
export type Language = QuizLanguage;

export interface QuizConfig {
  academicLevel: AcademicLevel;
  subject: string;
  topic: string;
  language: QuizLanguage;
  questionType: QuestionType;
  difficulty: QuizDifficulty;
  questionCount: number;
  timeLimit?: number;
  instructions?: string;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  correct_answer?: string;
  explanation: string;
  difficulty: Difficulty;
  points: number;
  category?: string;
  tags?: string[];
}

export interface IQuiz {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  subject: string;
  topic: string;
  academicLevel: AcademicLevel;
  difficulty: QuizDifficulty;
  language: QuizLanguage;
  questions: Question[];
  timeLimit?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  tags: string[];
  estimatedTime?: number;
  totalPoints?: number;
  instructions?: string;
  config?: QuizConfig;
  attempts?: number;
  averageScore?: number;
  status: 'draft' | 'published' | 'archived';
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: { [questionId: string]: string | string[] };
  startedAt: string;
  completedAt?: string;
  score?: number;
  totalScore?: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent?: number;
  isCompleted: boolean;
  flaggedQuestions: string[];
}

export interface QuizResult {
  attempt: QuizAttempt;
  quiz: IQuiz;
  detailedResults: {
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
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

export interface QuizStats {
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  favoriteSubjects: string[];
  weakAreas: string[];
  strongAreas: string[];
  streakDays: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'performance' | 'consistency' | 'improvement' | 'milestone';
}

export interface QuizSearchFilters {
  userId?: string;
  academicLevel?: string;
  subject?: string;
  difficulty?: Difficulty;
  questionType?: QuestionType;
  language?: Language;
}

export interface QuizLibrary {
  quizzes: IQuiz[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filters: QuizSearchFilters;
  sortBy: 'createdAt' | 'updatedAt' | 'attempts' | 'averageScore' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface IQuizModel extends Model<IQuiz> {
  paginate: (
    filter: object,
    options: IPaginateOptions
  ) => Promise<IPaginateResult<IQuiz>>;
  isExistQuizById(id: string): Promise<Partial<IQuiz> | null>;
  getQuizzesByUser(userId: string): Promise<IQuiz[]>;
  getPublicQuizzes(): Promise<IQuiz[]>;
  searchQuizzes(filters: QuizSearchFilters): Promise<IQuiz[]>;
}


// create quiz
export interface IGenerateQuizRequest {
  academicLevel: AcademicLevel;
  subject: string;
  topic: string;
  language: QuizLanguage;
  questionType: QuestionType;
  difficulty: QuizDifficulty;
  questionCount: number;
  timeLimit?: number;
  instructions?: string;
}

export interface ICreateQuizRequest {
  title: string;
  description?: string;
  subject: string;
  topic: string;
  academicLevel: AcademicLevel;
  difficulty: QuizDifficulty;
  language: QuizLanguage;
  questions: Question[];
  timeLimit?: number;
  isPublic?: boolean;
  tags?: string[];
  instructions?: string;
}

export interface IUpdateQuizRequest {
  title?: string;
  description?: string;
  subject?: string;
  topic?: string;
  academicLevel?: AcademicLevel;
  difficulty?: QuizDifficulty;
  language?: QuizLanguage;
  questions?: Question[];
  timeLimit?: number;
  isPublic?: boolean;
  tags?: string[];
  instructions?: string;
  status?: 'draft' | 'published' | 'archived';
}

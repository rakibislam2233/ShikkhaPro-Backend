import mongoose, { Model } from 'mongoose';
import { IPaginateOptions, IPaginateResult } from '../../types/paginate';

export type AcademicLevel =
  // Pre-Primary & Primary Education (Ages 3-10)
  | 'playgroup'        // Playgroup (Age 3-4)
  | 'nursery'          // Nursery (Age 4-5)
  | 'kg'               // Kindergarten (Age 5-6)
  | 'class-1'          // Class 1 (Age 6-7)
  | 'class-2'          // Class 2 (Age 7-8)
  | 'class-3'          // Class 3 (Age 8-9)
  | 'class-4'          // Class 4 (Age 9-10)
  | 'class-5'          // Class 5 (Age 10-11)

  // Secondary Education (Ages 11-16)
  | 'class-6'          // Class 6 (Age 11-12)
  | 'class-7'          // Class 7 (Age 12-13)
  | 'class-8'          // Class 8 (Age 13-14)
  | 'jsc'              // Junior School Certificate (JSC/JDC)
  | 'class-9'          // Class 9 (Age 14-15)
  | 'class-10'         // Class 10 (Age 15-16)
  | 'ssc'              // Secondary School Certificate (SSC)

  // Higher Secondary Education (Ages 17-18)
  | 'class-11'         // Class 11 (Age 16-17)
  | 'class-12'         // Class 12 (Age 17-18)
  | 'hsc'              // Higher Secondary Certificate (HSC)

  // Undergraduate Education (Ages 18-22)
  | 'bachelor'         // Bachelor's Degree (General)
  | 'bsc'              // Bachelor of Science
  | 'ba'               // Bachelor of Arts
  | 'bcom'             // Bachelor of Commerce
  | 'bba'              // Bachelor of Business Administration
  | 'btech'            // Bachelor of Technology
  | 'beng'             // Bachelor of Engineering

  // Postgraduate Education (Ages 22+)
  | 'master'           // Master's Degree (General)
  | 'msc'              // Master of Science
  | 'ma'               // Master of Arts
  | 'mcom'             // Master of Commerce
  | 'mba'              // Master of Business Administration
  | 'mtech'            // Master of Technology
  | 'meng'             // Master of Engineering

  // Professional & Competitive Exams
  | 'bcs'              // Bangladesh Civil Service
  | 'bank-job'         // Bank Job Preparation
  | 'medical'          // Medical Entrance Exams
  | 'engineering'      // Engineering Entrance Exams
  | 'university'       // University Admission Tests
  | 'ielts'            // IELTS Preparation
  | 'toefl'            // TOEFL Preparation
  | 'gre'              // GRE Preparation
  | 'sat'              // SAT Preparation

  // Professional Development
  | 'professional'     // Professional Development
  | 'skill-development'// Skill Development
  | 'certification'    // Professional Certifications
  | 'adult-learning'   // Adult Learning Programs
  | 'general'          // General Knowledge/Mixed Level;

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

export type AIProvider = 'openai' | 'gemini';

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
  status: 'active' | 'deleted';
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
  aiProvider?: AIProvider;
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
  status?: 'active' | 'deleted';
}

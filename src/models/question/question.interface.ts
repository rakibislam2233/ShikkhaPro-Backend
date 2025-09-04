import mongoose, { Model } from 'mongoose';
import { IPaginateOptions, IPaginateResult } from '../../types/paginate';

export type QuestionType =
  | 'mcq'
  | 'short-answer'
  | 'true-false'
  | 'multiple-select';
export type Difficulty = 'easy' | 'medium' | 'hard';
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
export type Language = 'english' | 'bengali' | 'hindi';

export interface IQuestion {
  _id: mongoose.Types.ObjectId;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: Difficulty;
  points: number;
  subject: string;
  topic: string;
  academicLevel: AcademicLevel;
  language: Language;
  category?: string;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  isApproved: boolean;
  usageCount: number;
  averageScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestionModel extends Model<IQuestion> {
  paginate: (
    filter: object,
    options: IPaginateOptions
  ) => Promise<IPaginateResult<IQuestion>>;
  isExistQuestionById(id: string): Promise<Partial<IQuestion> | null>;
  getQuestionsBySubject(subject: string): Promise<IQuestion[]>;
  getQuestionsByTopic(topic: string): Promise<IQuestion[]>;
  searchQuestions(filters: IQuestionSearchFilters): Promise<IQuestion[]>;
}

export interface ICreateQuestionRequest {
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: Difficulty;
  points?: number;
  subject: string;
  topic: string;
  academicLevel: AcademicLevel;
  language: Language;
  category?: string;
  tags?: string[];
}

export interface IUpdateQuestionRequest {
  question?: string;
  type?: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  difficulty?: Difficulty;
  points?: number;
  subject?: string;
  topic?: string;
  academicLevel?: AcademicLevel;
  language?: Language;
  category?: string;
  tags?: string[];
  isApproved?: boolean;
}

export interface IQuestionSearchFilters {
  subject?: string[];
  topic?: string[];
  academicLevel?: AcademicLevel[];
  difficulty?: Difficulty[];
  questionType?: QuestionType[];
  language?: Language[];
  tags?: string[];
  isApproved?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

import mongoose from 'mongoose';

export interface IDashboardStats {
  totalQuizzes: number;
  totalAttempts: number;
  completedQuizzes: number;
  averageScore: number;
  averagePercentage: number;
  bestScore: number;
  bestPercentage: number;
  totalTimeSpent: number; // in minutes
  favoriteSubjects: string[];
  recentActivity: IRecentActivity[];
  weeklyProgress: IWeeklyProgress[];
  subjectPerformance: ISubjectPerformance[];
  difficultyBreakdown: IDifficultyBreakdown;
  achievements: IAchievement[];
  streakDays: number;
  rank: number;
  lastActivityAt: Date;
}

export interface IRecentActivity {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  topic: string;
  score: number;
  totalScore: number;
  percentage: number;
  grade: string;
  gpa: number;
  timeSpent: number;
  difficulty: string;
  completedAt: Date;
  status: 'completed' | 'in-progress' | 'abandoned';
}

export interface IWeeklyProgress {
  week: string; // YYYY-WW format
  weekStart: Date;
  weekEnd: Date;
  quizzesCompleted: number;
  averageScore: number;
  totalTimeSpent: number;
}

export interface ISubjectPerformance {
  subject: string;
  totalAttempts: number;
  completedQuizzes: number;
  averageScore: number;
  averagePercentage: number;
  bestScore: number;
  totalTimeSpent: number;
  lastAttemptDate: Date;
  improvementTrend: 'improving' | 'declining' | 'stable';
}

export interface IDifficultyBreakdown {
  easy: {
    attempts: number;
    averageScore: number;
    averagePercentage: number;
  };
  medium: {
    attempts: number;
    averageScore: number;
    averagePercentage: number;
  };
  hard: {
    attempts: number;
    averageScore: number;
    averagePercentage: number;
  };
}

export interface IAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'performance' | 'consistency' | 'improvement' | 'milestone';
  unlockedAt: Date;
  progress?: number; // 0-100 for partial achievements
  requirement?: string;
}

export interface IQuizAttemptSummary {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  score: number;
  totalScore: number;
  percentage: number;
  grade: string;
  gpa: number;
  timeSpent: number;
  status: 'completed' | 'in-progress' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface IAllAttemptsResponse {
  attempts: IQuizAttemptSummary[];
  totalCount: number;
  completedCount: number;
  inProgressCount: number;
  abandonedCount: number;
  filters: {
    status?: string;
    subject?: string;
    difficulty?: string;
    fromDate?: Date;
    toDate?: Date;
  };
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface IDashboardFilters {
  fromDate?: Date;
  toDate?: Date;
  subject?: string;
  difficulty?: string;
  status?: string;
  limit?: number;
  page?: number;
}
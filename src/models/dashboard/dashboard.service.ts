import mongoose from 'mongoose';
import { QuizAttempt } from '../quizAttempt/quizAttempt.model';
import { Quiz } from '../quiz/quiz.model';
import {
  IDashboardStats,
  IRecentActivity,
  IWeeklyProgress,
  ISubjectPerformance,
  IDifficultyBreakdown,
  IAchievement,
  IQuizAttemptSummary,
  IAllAttemptsResponse,
  IDashboardFilters,
} from './dashboard.interface';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../errors/AppErro';

// Main dashboard statistics
const getDashboardStats = async (userId: string): Promise<IDashboardStats> => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get basic stats
    const basicStats = await getBasicStats(userObjectId);

    // Get recent activity
    const recentActivity = await getRecentActivity(userObjectId, 10);

    // Get weekly progress (last 8 weeks)
    const weeklyProgress = await getWeeklyProgress(userObjectId, 8);

    // Get subject performance
    const subjectPerformance = await getSubjectPerformance(userObjectId);

    // Get difficulty breakdown
    const difficultyBreakdown = await getDifficultyBreakdown(userObjectId);

    // Get achievements
    const achievements = await getAchievements(userObjectId);

    // Get streak days
    const streakDays = await getStreakDays(userObjectId);

    // Get user rank
    const rank = await getUserRank(userObjectId);

    return {
      ...basicStats,
      recentActivity,
      weeklyProgress,
      subjectPerformance,
      difficultyBreakdown,
      achievements,
      streakDays,
      rank,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch dashboard statistics');
  }
};

// Get basic statistics
const getBasicStats = async (userId: mongoose.Types.ObjectId) => {
  const pipeline = [
    { $match: { userId } },
    {
      $lookup: {
        from: 'quizzes',
        localField: 'quizId',
        foreignField: '_id',
        as: 'quiz',
      },
    },
    { $unwind: '$quiz' },
    {
      $group: {
        _id: '$userId',
        totalAttempts: { $sum: 1 },
        completedQuizzes: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        totalQuizzes: { $addToSet: '$quizId' },
        averageScore: {
          $avg: { $cond: [{ $eq: ['$status', 'completed'] }, '$score', null] },
        },
        averagePercentage: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              {
                $multiply: [
                  { $divide: ['$score', '$totalScore'] },
                  100
                ]
              },
              null
            ]
          }
        },
        bestScore: {
          $max: { $cond: [{ $eq: ['$status', 'completed'] }, '$score', null] },
        },
        bestPercentage: {
          $max: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              {
                $multiply: [
                  { $divide: ['$score', '$totalScore'] },
                  100
                ]
              },
              null
            ]
          }
        },
        totalTimeSpent: { $sum: '$timeSpent' },
        favoriteSubjects: { $addToSet: '$quiz.subject' },
        lastActivityAt: { $max: '$updatedAt' },
      },
    },
  ];

  const result = await QuizAttempt.aggregate(pipeline);
  const stats = result[0];

  if (!stats) {
    return {
      totalQuizzes: 0,
      totalAttempts: 0,
      completedQuizzes: 0,
      averageScore: 0,
      averagePercentage: 0,
      bestScore: 0,
      bestPercentage: 0,
      totalTimeSpent: 0,
      favoriteSubjects: [],
      lastActivityAt: new Date(),
    };
  }

  return {
    totalQuizzes: stats.totalQuizzes?.length || 0,
    totalAttempts: stats.totalAttempts || 0,
    completedQuizzes: stats.completedQuizzes || 0,
    averageScore: Math.round(stats.averageScore || 0),
    averagePercentage: Math.round(stats.averagePercentage || 0),
    bestScore: stats.bestScore || 0,
    bestPercentage: Math.round(stats.bestPercentage || 0),
    totalTimeSpent: stats.totalTimeSpent || 0,
    favoriteSubjects: stats.favoriteSubjects || [],
    lastActivityAt: stats.lastActivityAt || new Date(),
  };
};

// Get recent activity
const getRecentActivity = async (
  userId: mongoose.Types.ObjectId,
  limit: number = 10
): Promise<IRecentActivity[]> => {
  const recentAttempts = await QuizAttempt.find({ userId })
    .populate('quizId', 'title subject topic difficulty')
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

  return recentAttempts.map((attempt: any) => {
    const percentage = attempt.totalScore > 0
      ? Math.round((attempt.score / attempt.totalScore) * 100)
      : 0;

    let grade = 'F';
    let gpa = 0.0;

    if (percentage >= 80) { grade = 'A+'; gpa = 5.0; }
    else if (percentage >= 75) { grade = 'A'; gpa = 4.0; }
    else if (percentage >= 70) { grade = 'A-'; gpa = 3.5; }
    else if (percentage >= 65) { grade = 'B+'; gpa = 3.25; }
    else if (percentage >= 60) { grade = 'B'; gpa = 3.0; }
    else if (percentage >= 55) { grade = 'B-'; gpa = 2.75; }
    else if (percentage >= 50) { grade = 'C+'; gpa = 2.5; }
    else if (percentage >= 45) { grade = 'C'; gpa = 2.25; }
    else if (percentage >= 40) { grade = 'D'; gpa = 2.0; }

    return {
      attemptId: attempt._id.toString(),
      quizId: attempt.quizId._id.toString(),
      quizTitle: attempt.quizId.title,
      subject: attempt.quizId.subject,
      topic: attempt.quizId.topic,
      score: attempt.score || 0,
      totalScore: attempt.totalScore || 0,
      percentage,
      grade,
      gpa,
      timeSpent: attempt.timeSpent || 0,
      difficulty: attempt.quizId.difficulty,
      completedAt: attempt.completedAt || attempt.updatedAt,
      status: attempt.status,
    };
  });
};

// Get weekly progress
const getWeeklyProgress = async (
  userId: mongoose.Types.ObjectId,
  weeks: number = 8
): Promise<IWeeklyProgress[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeks * 7));

  const pipeline: any[] = [
    {
      $match: {
        userId,
        status: 'completed',
        completedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$completedAt' },
          week: { $week: '$completedAt' },
        },
        quizzesCompleted: { $sum: 1 },
        averageScore: { $avg: '$score' },
        totalTimeSpent: { $sum: '$timeSpent' },
        weekStart: { $min: '$completedAt' },
        weekEnd: { $max: '$completedAt' },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ];

  const result = await QuizAttempt.aggregate(pipeline);

  return result.map((week: any) => ({
    week: `${week._id.year}-${week._id.week.toString().padStart(2, '0')}`,
    weekStart: week.weekStart,
    weekEnd: week.weekEnd,
    quizzesCompleted: week.quizzesCompleted,
    averageScore: Math.round(week.averageScore || 0),
    totalTimeSpent: week.totalTimeSpent || 0,
  }));
};

// Get subject performance
const getSubjectPerformance = async (
  userId: mongoose.Types.ObjectId
): Promise<ISubjectPerformance[]> => {
  const pipeline: any[] = [
    { $match: { userId } },
    {
      $lookup: {
        from: 'quizzes',
        localField: 'quizId',
        foreignField: '_id',
        as: 'quiz',
      },
    },
    { $unwind: '$quiz' },
    {
      $group: {
        _id: '$quiz.subject',
        totalAttempts: { $sum: 1 },
        completedQuizzes: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        averageScore: {
          $avg: { $cond: [{ $eq: ['$status', 'completed'] }, '$score', null] },
        },
        averagePercentage: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              { $multiply: [{ $divide: ['$score', '$totalScore'] }, 100] },
              null,
            ],
          },
        },
        bestScore: {
          $max: { $cond: [{ $eq: ['$status', 'completed'] }, '$score', null] },
        },
        totalTimeSpent: { $sum: '$timeSpent' },
        lastAttemptDate: { $max: '$updatedAt' },
        scores: {
          $push: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              '$score',
              null,
            ],
          },
        },
      },
    },
    { $sort: { totalAttempts: -1 } },
  ];

  const result = await QuizAttempt.aggregate(pipeline);

  return result.map((subject: any) => {
    // Calculate improvement trend
    const scores = subject.scores.filter((score: number) => score !== null);
    let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';

    if (scores.length >= 3) {
      const recentScores = scores.slice(-3);
      const earlierScores = scores.slice(0, 3);
      const recentAvg = recentScores.reduce((a: number, b: number) => a + b, 0) / recentScores.length;
      const earlierAvg = earlierScores.reduce((a: number, b: number) => a + b, 0) / earlierScores.length;

      if (recentAvg > earlierAvg + 5) improvementTrend = 'improving';
      else if (recentAvg < earlierAvg - 5) improvementTrend = 'declining';
    }

    return {
      subject: subject._id,
      totalAttempts: subject.totalAttempts,
      completedQuizzes: subject.completedQuizzes,
      averageScore: Math.round(subject.averageScore || 0),
      averagePercentage: Math.round(subject.averagePercentage || 0),
      bestScore: subject.bestScore || 0,
      totalTimeSpent: subject.totalTimeSpent || 0,
      lastAttemptDate: subject.lastAttemptDate,
      improvementTrend,
    };
  });
};

// Get difficulty breakdown
const getDifficultyBreakdown = async (
  userId: mongoose.Types.ObjectId
): Promise<IDifficultyBreakdown> => {
  const pipeline: any[] = [
    { $match: { userId, status: 'completed' } },
    {
      $lookup: {
        from: 'quizzes',
        localField: 'quizId',
        foreignField: '_id',
        as: 'quiz',
      },
    },
    { $unwind: '$quiz' },
    {
      $group: {
        _id: '$quiz.difficulty',
        attempts: { $sum: 1 },
        averageScore: { $avg: '$score' },
        averagePercentage: {
          $avg: { $multiply: [{ $divide: ['$score', '$totalScore'] }, 100] },
        },
      },
    },
  ];

  const result = await QuizAttempt.aggregate(pipeline);

  const breakdown: IDifficultyBreakdown = {
    easy: { attempts: 0, averageScore: 0, averagePercentage: 0 },
    medium: { attempts: 0, averageScore: 0, averagePercentage: 0 },
    hard: { attempts: 0, averageScore: 0, averagePercentage: 0 },
  };

  result.forEach((diff: any) => {
    if (diff._id in breakdown) {
      breakdown[diff._id as keyof IDifficultyBreakdown] = {
        attempts: diff.attempts,
        averageScore: Math.round(diff.averageScore || 0),
        averagePercentage: Math.round(diff.averagePercentage || 0),
      };
    }
  });

  return breakdown;
};

// Get achievements
const getAchievements = async (
  userId: mongoose.Types.ObjectId
): Promise<IAchievement[]> => {
  const achievements: IAchievement[] = [];

  // Get user stats for achievement calculation
  const stats = await getBasicStats(userId);

  // First Quiz Achievement
  if (stats.totalAttempts >= 1) {
    achievements.push({
      id: 'first_quiz',
      title: 'First Steps',
      description: 'Completed your first quiz',
      icon: '🎯',
      category: 'milestone',
      unlockedAt: new Date(), // Should be actual first quiz date
    });
  }

  // Quiz Master Achievement
  if (stats.completedQuizzes >= 10) {
    achievements.push({
      id: 'quiz_master',
      title: 'Quiz Master',
      description: 'Completed 10 quizzes',
      icon: '🏆',
      category: 'milestone',
      unlockedAt: new Date(),
    });
  }

  // Perfect Score Achievement
  if (stats.bestPercentage === 100) {
    achievements.push({
      id: 'perfect_score',
      title: 'Perfect Score',
      description: 'Achieved 100% on a quiz',
      icon: '⭐',
      category: 'performance',
      unlockedAt: new Date(),
    });
  }

  // High Achiever
  if (stats.averagePercentage >= 80) {
    achievements.push({
      id: 'high_achiever',
      title: 'High Achiever',
      description: 'Maintain 80%+ average score',
      icon: '🌟',
      category: 'performance',
      unlockedAt: new Date(),
    });
  }

  return achievements;
};

// Get streak days
const getStreakDays = async (userId: mongoose.Types.ObjectId): Promise<number> => {
  const attempts = await QuizAttempt.find({
    userId,
    status: 'completed',
  })
    .sort({ completedAt: -1 })
    .select('completedAt')
    .lean();

  if (attempts.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const attempt of attempts) {
    const attemptDate = new Date(attempt.completedAt!);
    attemptDate.setHours(0, 0, 0, 0);

    const diffTime = currentDate.getTime() - attemptDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 1) {
      streak++;
      currentDate = attemptDate;
    } else {
      break;
    }
  }

  return streak;
};

// Get user rank
const getUserRank = async (userId: mongoose.Types.ObjectId): Promise<number> => {
  const pipeline: any[] = [
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: '$userId',
        averageScore: { $avg: '$score' },
        totalCompleted: { $sum: 1 },
      },
    },
    {
      $sort: { averageScore: -1, totalCompleted: -1 },
    },
  ];

  const leaderboard = await QuizAttempt.aggregate(pipeline);
  const userIndex = leaderboard.findIndex(
    (user: any) => user._id.toString() === userId.toString()
  );

  return userIndex >= 0 ? userIndex + 1 : leaderboard.length + 1;
};

// Get all attempts with filters and pagination
const getAllAttempts = async (
  userId: string,
  filters: IDashboardFilters = {}
): Promise<IAllAttemptsResponse> => {
  const {
    fromDate,
    toDate,
    subject,
    difficulty,
    status,
    limit = 20,
    page = 1,
  } = filters;

  const matchQuery: any = { userId: new mongoose.Types.ObjectId(userId) };

  // Apply date filters
  if (fromDate || toDate) {
    matchQuery.createdAt = {};
    if (fromDate) matchQuery.createdAt.$gte = new Date(fromDate);
    if (toDate) matchQuery.createdAt.$lte = new Date(toDate);
  }

  // Apply status filter
  if (status) {
    matchQuery.status = status;
  }

  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    { $match: matchQuery },
    {
      $lookup: {
        from: 'quizzes',
        localField: 'quizId',
        foreignField: '_id',
        as: 'quiz',
      },
    },
    { $unwind: '$quiz' },
  ];

  // Apply subject and difficulty filters
  const additionalFilters: any = {};
  if (subject) additionalFilters['quiz.subject'] = subject;
  if (difficulty) additionalFilters['quiz.difficulty'] = difficulty;

  if (Object.keys(additionalFilters).length > 0) {
    pipeline.push({ $match: additionalFilters });
  }

  // Add pagination
  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  const attempts = await QuizAttempt.aggregate(pipeline);

  // Get total count - build separate pipeline
  const countPipeline: any[] = [
    { $match: matchQuery },
    {
      $lookup: {
        from: 'quizzes',
        localField: 'quizId',
        foreignField: '_id',
        as: 'quiz',
      },
    },
    { $unwind: '$quiz' },
  ];

  if (Object.keys(additionalFilters).length > 0) {
    countPipeline.push({ $match: additionalFilters });
  }

  countPipeline.push({ $count: 'total' });
  const countResult = await QuizAttempt.aggregate(countPipeline);
  const totalCount = countResult[0]?.total || 0;

  // Get status counts
  const statusCounts = await QuizAttempt.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const completedCount = statusCounts.find(s => s._id === 'completed')?.count || 0;
  const inProgressCount = statusCounts.find(s => s._id === 'in-progress')?.count || 0;
  const abandonedCount = statusCounts.find(s => s._id === 'abandoned')?.count || 0;

  const mappedAttempts: IQuizAttemptSummary[] = attempts.map((attempt: any) => {
    const percentage = attempt.totalScore > 0
      ? Math.round((attempt.score / attempt.totalScore) * 100)
      : 0;

    let grade = 'F';
    let gpa = 0.0;

    if (percentage >= 80) { grade = 'A+'; gpa = 5.0; }
    else if (percentage >= 75) { grade = 'A'; gpa = 4.0; }
    else if (percentage >= 70) { grade = 'A-'; gpa = 3.5; }
    else if (percentage >= 65) { grade = 'B+'; gpa = 3.25; }
    else if (percentage >= 60) { grade = 'B'; gpa = 3.0; }
    else if (percentage >= 55) { grade = 'B-'; gpa = 2.75; }
    else if (percentage >= 50) { grade = 'C+'; gpa = 2.5; }
    else if (percentage >= 45) { grade = 'C'; gpa = 2.25; }
    else if (percentage >= 40) { grade = 'D'; gpa = 2.0; }

    return {
      attemptId: attempt._id.toString(),
      quizId: attempt.quiz._id.toString(),
      quizTitle: attempt.quiz.title,
      subject: attempt.quiz.subject,
      topic: attempt.quiz.topic,
      difficulty: attempt.quiz.difficulty,
      questionCount: attempt.totalQuestions,
      score: attempt.score || 0,
      totalScore: attempt.totalScore || 0,
      percentage,
      grade,
      gpa,
      timeSpent: attempt.timeSpent || 0,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      createdAt: attempt.createdAt,
    };
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    attempts: mappedAttempts,
    totalCount,
    completedCount,
    inProgressCount,
    abandonedCount,
    filters: {
      status,
      subject,
      difficulty,
      fromDate,
      toDate,
    },
    pagination: {
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const DashboardService = {
  getDashboardStats,
  getAllAttempts,
  getRecentActivity,
  getWeeklyProgress,
  getSubjectPerformance,
};
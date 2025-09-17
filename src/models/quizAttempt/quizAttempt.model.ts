import mongoose, { Schema } from 'mongoose';
import {
  IQuizAttempt,
  IQuizAttemptDocument,
  IQuizAttemptModel,
  IQuizStats,
} from './quizAttempt.interface';
import paginate from '../../common/plugins/paginate';

const quizAttemptSchema = new Schema<IQuizAttemptDocument, IQuizAttemptModel>(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    answers: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map(),
    },
    startedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    completedAt: {
      type: Date,
      index: true,
    },
    score: {
      type: Number,
      min: 0,
    },
    totalScore: {
      type: Number,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    correctAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },
    timeSpent: {
      type: Number,
      min: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    flaggedQuestions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
      index: true,
    },
    timeLimit: {
      type: Number,
      min: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
quizAttemptSchema.index({ userId: 1, quizId: 1 });
quizAttemptSchema.index({ userId: 1, status: 1 });
quizAttemptSchema.index({ quizId: 1, completedAt: -1 });
quizAttemptSchema.index({ userId: 1, createdAt: -1 });
quizAttemptSchema.index({ score: -1, completedAt: -1 });

// Virtual for percentage
quizAttemptSchema.virtual('percentage').get(function(this: IQuizAttemptDocument) {
  if (!this.totalScore || this.totalScore === 0) return 0;
  return Math.round(((this.score || 0) / this.totalScore) * 100);
});

// Virtual for grade (Bangladesh grading system)
quizAttemptSchema.virtual('grade').get(function(this: IQuizAttemptDocument) {
  const percentage = this.get('percentage') as number || 0;
  if (percentage >= 80) return 'A+';
  if (percentage >= 75) return 'A';
  if (percentage >= 70) return 'A-';
  if (percentage >= 65) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 55) return 'B-';
  if (percentage >= 50) return 'C+';
  if (percentage >= 45) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
});

// Virtual for GPA (Bangladesh grading system)
quizAttemptSchema.virtual('gpa').get(function(this: IQuizAttemptDocument) {
  const percentage = this.get('percentage') as number || 0;
  if (percentage >= 80) return 5.00;
  if (percentage >= 75) return 4.00;
  if (percentage >= 70) return 3.50;
  if (percentage >= 65) return 3.25;
  if (percentage >= 60) return 3.00;
  if (percentage >= 55) return 2.75;
  if (percentage >= 50) return 2.50;
  if (percentage >= 45) return 2.25;
  if (percentage >= 40) return 2.00;
  return 0.00;
});

// Add pagination plugin
quizAttemptSchema.plugin(paginate);

// Static methods
quizAttemptSchema.statics.isExistAttemptById = async function(id: string) {
  return await this.findById(id).lean();
};

quizAttemptSchema.statics.getUserAttempts = async function(userId: string): Promise<IQuizAttemptDocument[]> {
  return await this.find({ userId })
    .populate('quizId', 'title subject topic difficulty')
    .sort({ createdAt: -1 });
};

quizAttemptSchema.statics.getQuizAttempts = async function(quizId: string): Promise<IQuizAttemptDocument[]> {
  return await this.find({ quizId, status: 'completed' })
    .populate('userId', 'profile.fullName email')
    .sort({ score: -1, completedAt: -1 });
};

quizAttemptSchema.statics.getUserStats = async function(userId: string): Promise<IQuizStats> {
  const pipeline = [
    {
      $match: { 
        userId: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: 'quizzes',
        localField: 'quizId',
        foreignField: '_id',
        as: 'quiz'
      }
    },
    {
      $unwind: '$quiz'
    },
    {
      $group: {
        _id: '$userId',
        totalAttempts: { $sum: 1 },
        completedQuizzes: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageScore: { 
          $avg: { $cond: [{ $eq: ['$status', 'completed'] }, '$score', null] }
        },
        bestScore: { 
          $max: { $cond: [{ $eq: ['$status', 'completed'] }, '$score', null] }
        },
        totalTimeSpent: { $sum: '$timeSpent' },
        subjects: { $addToSet: '$quiz.subject' },
        lastActivityAt: { $max: '$createdAt' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  const stats = result[0];

  if (!stats) {
    return {
      userId: new mongoose.Types.ObjectId(userId),
      totalQuizzes: 0,
      totalAttempts: 0,
      completedQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      totalTimeSpent: 0,
      favoriteSubjects: [],
      weakAreas: [],
      strongAreas: [],
      streakDays: 0,
      achievements: [],
      lastActivityAt: new Date(),
    };
  }

  return {
    userId: stats._id,
    totalQuizzes: stats.subjects?.length || 0,
    totalAttempts: stats.totalAttempts || 0,
    completedQuizzes: stats.completedQuizzes || 0,
    averageScore: Math.round(stats.averageScore || 0),
    bestScore: stats.bestScore || 0,
    totalTimeSpent: stats.totalTimeSpent || 0,
    favoriteSubjects: stats.subjects || [],
    weakAreas: [], // TODO: Calculate based on performance analysis
    strongAreas: [], // TODO: Calculate based on performance analysis
    streakDays: 0, // TODO: Calculate streak
    achievements: [], // TODO: Calculate achievements
    lastActivityAt: stats.lastActivityAt,
  };
};

quizAttemptSchema.statics.getLeaderboard = async function(quizId?: string, limit: number = 10) {
  const matchStage: any = { status: 'completed' };
  if (quizId) {
    matchStage.quizId = new mongoose.Types.ObjectId(quizId);
  }

  return await this.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $group: {
        _id: '$userId',
        userName: { $first: '$user.profile.fullName' },
        email: { $first: '$user.email' },
        bestScore: { $max: '$score' },
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score' },
        totalTimeSpent: { $sum: '$timeSpent' }
      }
    },
    { $sort: { bestScore: -1, averageScore: -1 } },
    { $limit: limit },
    {
      $project: {
        userId: '$_id',
        userName: 1,
        email: 1,
        bestScore: { $round: ['$bestScore', 0] },
        totalAttempts: 1,
        averageScore: { $round: ['$averageScore', 1] },
        totalTimeSpent: 1
      }
    }
  ]);
};

// Pre-save middleware to calculate time spent
quizAttemptSchema.pre('save', function(next) {
  if (this.isModified('completedAt') && this.completedAt && this.startedAt) {
    const timeDiff = this.completedAt.getTime() - this.startedAt.getTime();
    this.timeSpent = Math.round(timeDiff / (1000 * 60)); // Convert to minutes
  }
  next();
});

// Instance methods
quizAttemptSchema.methods.calculateScore = function(quiz: any) {
  let correctAnswers = 0;
  let totalScore = 0;

  quiz.questions.forEach((question: any) => {
    const userAnswer = this.answers.get(question.id);
    let isCorrect = false;

    if (question.type === 'multiple-select') {
      // For multiple select, check if arrays match
      const correctAnswers = Array.isArray(question.correctAnswer) 
        ? question.correctAnswer 
        : [question.correctAnswer];
      const userAnswers = Array.isArray(userAnswer) 
        ? userAnswer 
        : [userAnswer];
      
      isCorrect = correctAnswers.length === userAnswers.length &&
        correctAnswers.every((ans: string) => userAnswers.includes(ans));
    } else {
      // For single answer questions
      isCorrect = String(userAnswer).toLowerCase().trim() === 
        String(question.correctAnswer).toLowerCase().trim();
    }

    if (isCorrect) {
      correctAnswers++;
      totalScore += question.points || 1;
    }
  });

  this.correctAnswers = correctAnswers;
  this.score = totalScore;
  this.totalScore = quiz.totalPoints || quiz.questions.length;
  
  return this.save();
};

export const QuizAttempt = mongoose.model<IQuizAttemptDocument, IQuizAttemptModel>('QuizAttempt', quizAttemptSchema);
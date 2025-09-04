import mongoose, { Schema } from 'mongoose';
import paginate from '../../common/plugins/paginate';
import {
  IQuestion,
  IQuestionModel,
  IQuestionSearchFilters,
} from './question.interface';

const questionSchema = new Schema<IQuestion, IQuestionModel>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
      index: true,
    },
    type: {
      type: String,
      enum: ['mcq', 'short-answer', 'true-false', 'multiple-select'],
      required: true,
      index: true,
    },
    options: {
      type: [String],
      validate: {
        validator: function (this: IQuestion, options: string[]) {
          if (this.type === 'mcq' || this.type === 'multiple-select') {
            return options && options.length >= 2;
          }
          if (this.type === 'true-false') {
            return options && options.length === 2;
          }
          return true; // For short-answer, options are not required
        },
        message:
          'MCQ and multiple-select questions must have at least 2 options, true-false must have exactly 2 options',
      },
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
      index: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 1,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    topic: {
      type: String,
      trim: true,
      default: '',
    },
    academicLevel: {
      type: String,
      enum: [
        'class-1',
        'class-2',
        'class-3',
        'class-4',
        'class-5',
        'class-6',
        'class-7',
        'jsc',
        'ssc',
        'hsc',
        'bsc',
        'msc',
      ],
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ['english', 'bengali', 'hindi'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageScore: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
questionSchema.index({ subject: 1, academicLevel: 1 });
questionSchema.index({ difficulty: 1, type: 1 });
questionSchema.index({ createdBy: 1, isApproved: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ usageCount: -1 });
questionSchema.index({ createdAt: -1 });

// questionSchema.index(
//   {
//     question: 'text',
//     explanation: 'text',
//     subject: 'text',
//     topic: 'text',
//     tags: 'text',
//   },
//   {
//     default_language: 'none', // Disable language-specific processing
//     language_override: 'indexLanguage',
//   }
// );

questionSchema.index(
  {
    question: 'text',
    explanation: 'text',
    subject: 'text',
    topic: 'text',
    tags: 'text',
  },
  {
    default_language: 'none', // Disable language-specific processing
    language_override: 'indexLanguage', // Add this field to control per document
  }
);

// Add pagination plugin
questionSchema.plugin(paginate);

// Static methods
questionSchema.statics.isExistQuestionById = async function (id: string) {
  return await this.findById(id).lean();
};

questionSchema.statics.getQuestionsBySubject = async function (
  subject: string
) {
  return await this.find({
    subject,
    isApproved: true,
  }).sort({ usageCount: -1, createdAt: -1 });
};

questionSchema.statics.getQuestionsByTopic = async function (topic: string) {
  return await this.find({
    topic,
    isApproved: true,
  }).sort({ usageCount: -1, createdAt: -1 });
};

questionSchema.statics.searchQuestions = async function (
  filters: IQuestionSearchFilters
) {
  const query: any = {};

  if (filters.subject && filters.subject.length > 0) {
    query.subject = { $in: filters.subject };
  }

  if (filters.topic && filters.topic.length > 0) {
    query.topic = { $in: filters.topic };
  }

  if (filters.academicLevel && filters.academicLevel.length > 0) {
    query.academicLevel = { $in: filters.academicLevel };
  }

  if (filters.difficulty && filters.difficulty.length > 0) {
    query.difficulty = { $in: filters.difficulty };
  }

  if (filters.questionType && filters.questionType.length > 0) {
    query.type = { $in: filters.questionType };
  }

  if (filters.language && filters.language.length > 0) {
    query.language = { $in: filters.language };
  }

  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  if (filters.isApproved !== undefined) {
    query.isApproved = filters.isApproved;
  }

  if (filters.dateRange) {
    query.createdAt = {
      ...(filters.dateRange.from && { $gte: new Date(filters.dateRange.from) }),
      ...(filters.dateRange.to && { $lte: new Date(filters.dateRange.to) }),
    };
  }

  return await this.find(query).sort({ usageCount: -1, createdAt: -1 });
};

// Instance methods
questionSchema.methods.incrementUsage = function () {
  this.usageCount = (this.usageCount || 0) + 1;
  return this.save();
};

export const Question = mongoose.model<IQuestion, IQuestionModel>(
  'Question',
  questionSchema
);

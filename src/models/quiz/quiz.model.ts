import { model, Schema } from 'mongoose';
import paginate from '../../common/plugins/paginate';
import {
  IQuiz,
  IQuizModel,
  Question,
  QuizConfig,
} from './quiz.interface';

const questionSchema = new Schema<Question>({
  id: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['mcq', 'short-answer', 'true-false', 'multiple-select', 'mixed'],
    required: true,
  },
  options: {
    type: [String],
    validate: {
      validator: function (this: Question, options: string[]) {
        if (this.type === 'mcq' || this.type === 'multiple-select') {
          return options && options.length >= 2;
        }
        if (this.type === 'true-false') {
          return options && options.length === 2;
        }
        return true;
      },
      message:
        'MCQ and multiple-select questions must have at least 2 options, true-false must have exactly 2 options',
    },
  },
  correctAnswer: {
    type: Schema.Types.Mixed,
    required: true,
  },
  correct_answer: String, // Legacy compatibility
  explanation: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  category: String,
  tags: [String],
});

const quizConfigSchema = new Schema<QuizConfig>({
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
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  topic: {
    type: String,
    trim: true,
  },
  language: {
    type: String,
    enum: ['english', 'bengali', 'hindi'],
    required: true,
  },
  questionType: {
    type: String,
    enum: ['mcq', 'short-answer', 'true-false', 'multiple-select', 'mixed'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  questionCount: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  timeLimit: {
    type: Number,
    min: 1,
  },
  instructions: String,
});

const quizSchema = new Schema<IQuiz, IQuizModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
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
      index: true,
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
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ['english', 'bengali', 'hindi'],
      required: true,
      index: true,
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: function (questions: Question[]) {
          return questions.length > 0;
        },
        message: 'Quiz must have at least one question',
      },
    },
    timeLimit: {
      type: Number,
      min: 1,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    estimatedTime: {
      type: Number,
      min: 1,
    },
    totalPoints: {
      type: Number,
      min: 0,
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    config: quizConfigSchema,
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
quizSchema.index({ createdBy: 1, status: 1 });
quizSchema.index({ isPublic: 1, status: 1 });
quizSchema.index({ subject: 1, academicLevel: 1, difficulty: 1 });
quizSchema.index({ tags: 1 });
quizSchema.index({ createdAt: -1 });
quizSchema.index({ attempts: -1 });
quizSchema.index({ averageScore: -1 });
quizSchema.index(
  {
    title: 'text',
    description: 'text',
    subject: 'text',
    topic: 'text',
    tags: 'text',
  },
  {
    default_language: 'none',
    language_override: 'none',
  }
);

// Virtual for question count
quizSchema.virtual('questionCount').get(function () {
  return this.questions?.length || 0;
});

// Add pagination plugin
quizSchema.plugin(paginate);

// Pre-save middleware to calculate total points and estimated time
quizSchema.pre('save', function (next) {
  if (this.questions && this.questions.length > 0) {
    // Calculate total points
    this.totalPoints = this.questions.reduce((total, question) => {
      return total + (question.points || 1);
    }, 0);

    // Calculate estimated time (1 minute per question if not set)
    if (!this.estimatedTime) {
      this.estimatedTime = this.questions.length * 1; // 1 minute per question
    }
  }
  next();
});

// Static methods
quizSchema.statics.isExistQuizById = async function (id: string) {
  return await this.findById(id).lean();
};

quizSchema.statics.getQuizzesByUser = async function (userId: string) {
  return await this.find({ createdBy: userId }).sort({ createdAt: -1 });
};

quizSchema.statics.getPublicQuizzes = async function () {
  return await this.find({ isPublic: true, status: 'published' }).sort({
    createdAt: -1,
  });
};

export const Quiz = model<IQuiz, IQuizModel>('Quiz', quizSchema);

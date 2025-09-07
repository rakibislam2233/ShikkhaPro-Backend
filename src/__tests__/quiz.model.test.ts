import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Quiz } from '../models/quiz/quiz.model';
import { IQuiz } from '../models/quiz/quiz.interface';

describe('Quiz Model', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Quiz.deleteMany({});
  });

  it('should create a new quiz with valid data', async () => {
    const quizData: Partial<IQuiz> = {
      title: 'Test Quiz',
      subject: 'Math',
      academicLevel: 'hsc',
      difficulty: 'easy',
      language: 'english',
      questions: [
        {
          id: '1',
          question: 'What is 2+2?',
          type: 'mcq',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          explanation: 'Because it is.',
          points: 1,
          difficulty: 'easy',
        },
      ],
      createdBy: new mongoose.Types.ObjectId(),
    };
    const quiz = new Quiz(quizData);
    const savedQuiz = await quiz.save();

    expect(savedQuiz._id).toBeDefined();
    expect(savedQuiz.title).toBe(quizData.title);
    expect(savedQuiz.totalPoints).toBe(1);
    expect(savedQuiz.estimatedTime).toBe(1);
  });

  it('should not create a new quiz with missing required fields', async () => {
    const quizData: Partial<IQuiz> = {
      title: 'Test Quiz',
    };
    const quiz = new Quiz(quizData);
    await expect(quiz.save()).rejects.toThrow();
  });
});

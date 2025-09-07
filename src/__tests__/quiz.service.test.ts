import { QuizServices } from '../models/quiz/quiz.service';
import { Quiz } from '../models/quiz/quiz.model';
import { ICreateQuizRequest } from '../models/quiz/quiz.interface';
import mongoose from 'mongoose';

// Mock the Quiz model
jest.mock('../models/quiz/quiz.model');

describe('QuizServices', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuiz', () => {
    it('should create a quiz successfully', async () => {
      const quizData: ICreateQuizRequest = {
        title: 'Test Quiz',
        description: 'A test quiz',
        subject: 'Mathematics',
        topic: 'Algebra',
        academicLevel: 'bsc',
        difficulty: 'medium',
        language: 'english',
        questions: [
          {
            id: 'q1',
            question: 'What is 2+2?',
            type: 'mcq' as const,
            difficulty: 'easy' as const,
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            points: 1,
            explanation: '2+2 equals 4'
          }
        ],
        timeLimit: 30,
        instructions: 'Answer all questions',
        isPublic: true,
        tags: ['math', 'algebra']
      };

      const mockCreatedQuiz = { ...quizData, createdBy: mockUserId };
      (Quiz.create as jest.Mock).mockResolvedValue(mockCreatedQuiz);

      const quiz = await QuizServices.createQuiz(quizData, mockUserId);

      expect(Quiz.create).toHaveBeenCalledWith({ ...quizData, createdBy: mockUserId });
      expect(quiz).toEqual(mockCreatedQuiz);
    });
  });

  describe('getQuizById', () => {
    it('should retrieve a public quiz', async () => {
      const mockQuizId = new mongoose.Types.ObjectId().toString();
      const mockQuiz = {
        _id: mockQuizId,
        title: 'Public Quiz',
        isPublic: true,
      };

      (Quiz.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockQuiz),
      });

      const retrievedQuiz = await QuizServices.getQuizById(mockQuizId);

      expect(Quiz.findOne).toHaveBeenCalledWith({ _id: mockQuizId, isPublic: true });
      expect(retrievedQuiz).toEqual(mockQuiz);
    });

    it('should return null if quiz not found', async () => {
        const mockQuizId = new mongoose.Types.ObjectId().toString();

        (Quiz.findOne as jest.Mock).mockReturnValue({
            select: jest.fn().mockResolvedValue(null),
        });

        const retrievedQuiz = await QuizServices.getQuizById(mockQuizId);

        expect(Quiz.findOne).toHaveBeenCalledWith({ _id: mockQuizId, isPublic: true });
        expect(retrievedQuiz).toBeNull();
    });
  });

  describe('updateQuiz', () => {
    it('should update a quiz when user is owner', async () => {
        const mockQuizId = new mongoose.Types.ObjectId().toString();
        const updateData = { title: 'Updated Title' };
        const mockUpdatedQuiz = { _id: mockQuizId, ...updateData };

        (Quiz.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedQuiz);

        const updatedQuiz = await QuizServices.updateQuiz(
            mockQuizId,
            updateData,
            mockUserId
        );

        expect(Quiz.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: mockQuizId, createdBy: mockUserId },
            { $set: updateData },
            { new: true, runValidators: true, select: '-__v' }
        );
        expect(updatedQuiz).toEqual(mockUpdatedQuiz);
    });

    it('should throw an error if user is not owner', async () => {
        const mockQuizId = new mongoose.Types.ObjectId().toString();
        const updateData = { title: 'Updated Title' };
        const anotherUserId = new mongoose.Types.ObjectId().toString();

        (Quiz.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

        await expect(QuizServices.updateQuiz(
            mockQuizId,
            updateData,
            anotherUserId
        )).rejects.toThrow('Quiz not found or you are not the owner');
    });
  });
});

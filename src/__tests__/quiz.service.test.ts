import { QuizServices } from '../models/quiz/quiz.service';
import { Quiz } from '../models/quiz/quiz.model';
import { ICreateQuizRequest } from '../models/quiz/quiz.interface';
import mongoose from 'mongoose';

describe('QuizServices', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();

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

      const quiz = await QuizServices.createQuiz(quizData, mockUserId);

      expect(quiz).toBeDefined();
      expect(quiz.title).toBe(quizData.title);
      expect(quiz.createdBy.toString()).toBe(mockUserId);
      expect(quiz.questions).toHaveLength(1);
    });
  });

  describe('getQuizById', () => {
    it('should retrieve a public quiz', async () => {
      const quiz = new Quiz({
        title: 'Public Quiz',
        description: 'Test',
        subject: 'Science',
        academicLevel: 'bsc',
        difficulty: 'easy',
        language: 'english',
        questions: [{
          id: 'q1',
          question: 'Test question?',
          type: 'mcq',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A',
          points: 1,
          explanation: 'Test explanation'
        }],
        isPublic: true,
        createdBy: new mongoose.Types.ObjectId(),
        config: {
          academicLevel: 'university',
          subject: 'Science',
          language: 'english',
          questionType: 'mcq',
          difficulty: 'easy',
          questionCount: 1
        }
      });

      await quiz.save();

      const retrievedQuiz = await QuizServices.getQuizById(quiz._id.toString());
      expect(retrievedQuiz).toBeDefined();
      expect(retrievedQuiz.title).toBe('Public Quiz');
    });
  });

  describe('updateQuiz', () => {
    it('should update a quiz when user is owner', async () => {
      const userId = new mongoose.Types.ObjectId();
      const quiz = new Quiz({
        title: 'Original Title',
        description: 'Original description',
        subject: 'Math',
        academicLevel: 'high-school',
        difficulty: 'easy',
        language: 'english',
        questions: [],
        isPublic: true,
        createdBy: userId,
        config: {
          academicLevel: 'high-school',
          subject: 'Math',
          language: 'english',
          questionType: 'mcq',
          difficulty: 'easy',
          questionCount: 0
        }
      });

      await quiz.save();

      const updateData = { title: 'Updated Title' };
      const updatedQuiz = await QuizServices.updateQuiz(
        quiz._id.toString(),
        updateData,
        userId.toString()
      );

      expect(updatedQuiz.title).toBe('Updated Title');
    });
  });
});
import request from 'supertest';
import express from 'express';
import { QuizController } from '../models/quiz/quiz.controller';
import { QuizServices } from '../models/quiz/quiz.service';
import { StatusCodes } from 'http-status-codes';

// Mock the QuizServices
jest.mock('../models/quiz/quiz.service');

const app = express();
app.use(express.json());
app.post('/quiz/generate', (req, res, next) => {
    req.user = { userId: 'mockUserId' };
    next();
}, QuizController.generateQuiz);


describe('QuizController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateQuiz', () => {
    it('should generate a quiz successfully', async () => {
      const mockQuiz = { title: 'Generated Quiz' };
      (QuizServices.generateQuiz as jest.Mock).mockResolvedValue(mockQuiz);

      const response = await request(app)
        .post('/quiz/generate')
        .send({ topic: 'test' });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body.data).toEqual(mockQuiz);
    });
  });
});

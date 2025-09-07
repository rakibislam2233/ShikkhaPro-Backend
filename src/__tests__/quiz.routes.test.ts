import request from 'supertest';
import express from 'express';
import router from '../models/quiz/quiz.routes';
import { QuizController } from '../models/quiz/quiz.controller';
import { StatusCodes } from 'http-status-codes';

// Mock the QuizController
jest.mock('../models/quiz/quiz.controller');

const app = express();
app.use(express.json());
app.use('/quiz', (req, res, next) => {
    req.user = { userId: 'mockUserId' };
    next();
}, router);

describe('Quiz Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /quiz/generate', () => {
    it('should call QuizController.generateQuiz', async () => {
      (QuizController.generateQuiz as jest.Mock).mockImplementation((req, res) => res.sendStatus(StatusCodes.OK));
      const response = await request(app).post('/quiz/generate').send({});
      expect(QuizController.generateQuiz).toHaveBeenCalled();
      expect(response.status).toBe(StatusCodes.OK);
    });
  });

  describe('POST /quiz', () => {
    it('should call QuizController.createQuiz', async () => {
        (QuizController.createQuiz as jest.Mock).mockImplementation((req, res) => res.sendStatus(StatusCodes.CREATED));
        const response = await request(app).post('/quiz').send({});
        expect(QuizController.createQuiz).toHaveBeenCalled();
        expect(response.status).toBe(StatusCodes.CREATED);
    });
  });
});

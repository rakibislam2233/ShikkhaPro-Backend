import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../shared/validateRequest';
import { QuizController } from './quiz.controller';
import {
  completeQuizAttemptValidation,
  createQuizValidation,
  deleteQuizValidation,
  generateQuizValidation,
  getQuizValidation,
  saveAnswersValidation,
  searchQuizzesValidation,
  startQuizAttemptValidation,
  submitAnswerValidation,
  updateQuizValidation,
} from './quiz.validation';

const router = express.Router();

// Quiz generation and management
router.post(
  '/generate',
  auth('User'),
  validateRequest(generateQuizValidation),
  QuizController.generateQuiz
);

router.post(
  '/',
  auth("User"),
  validateRequest(createQuizValidation),
  QuizController.createQuiz
);

router.get('/my-quizzes', auth("User"), QuizController.getUserQuizzes);

router.get('/public', QuizController.getPublicQuizzes);

router.get(
  '/search',
  validateRequest(searchQuizzesValidation),
  QuizController.searchQuizzes
);

router.get(
  '/:id',
  validateRequest(getQuizValidation),
  QuizController.getQuizById
);

router.patch(
  '/:id',
  auth("User"),
  validateRequest(updateQuizValidation),
  QuizController.updateQuiz
);

router.delete(
  '/:id',
  auth("User"),
  validateRequest(deleteQuizValidation),
  QuizController.deleteQuiz
);

// Quiz attempt management
router.post(
  '/attempt/start',
  auth("User"),
  validateRequest(startQuizAttemptValidation),
  QuizController.startQuizAttempt
);

router.post(
  '/attempt/answer',
  auth("User"),
  validateRequest(submitAnswerValidation),
  QuizController.submitAnswer
);

router.post(
  '/attempt/save',
  auth("User"),
  validateRequest(saveAnswersValidation),
  QuizController.saveAnswers
);

router.post(
  '/attempt/complete',
  auth("User"),
  validateRequest(completeQuizAttemptValidation),
  QuizController.completeQuizAttempt
);

router.get('/result/:attemptId', auth("User"), QuizController.getQuizResult);

// Statistics and leaderboard
router.get('/stats/user', auth("User"), QuizController.getUserStats);

router.get('/stats/leaderboard', QuizController.getLeaderboard);

export default router;

import express from 'express';
import { QuizController } from './quiz.controller';
import validateRequest from '../../shared/validateRequest';
import auth from '../../middlewares/auth';
import {
  generateQuizValidation,
  createQuizValidation,
  updateQuizValidation,
  getQuizValidation,
  deleteQuizValidation,
  searchQuizzesValidation,
  startQuizAttemptValidation,
  submitAnswerValidation,
  saveAnswersValidation,
  completeQuizAttemptValidation,
} from './quiz.validation';

const router = express.Router();

// Quiz generation and management
router.post(
  '/generate',
  auth(),
  validateRequest(generateQuizValidation),
  QuizController.generateQuiz
);

router.post(
  '/',
  auth(),
  validateRequest(createQuizValidation),
  QuizController.createQuiz
);

router.get(
  '/my-quizzes',
  auth(),
  QuizController.getUserQuizzes
);

router.get(
  '/public',
  QuizController.getPublicQuizzes
);

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
  auth(),
  validateRequest(updateQuizValidation),
  QuizController.updateQuiz
);

router.delete(
  '/:id',
  auth(),
  validateRequest(deleteQuizValidation),
  QuizController.deleteQuiz
);

// Quiz attempt management
router.post(
  '/attempt/start',
  auth(),
  validateRequest(startQuizAttemptValidation),
  QuizController.startQuizAttempt
);

router.post(
  '/attempt/answer',
  auth(),
  validateRequest(submitAnswerValidation),
  QuizController.submitAnswer
);

router.post(
  '/attempt/save',
  auth(),
  validateRequest(saveAnswersValidation),
  QuizController.saveAnswers
);

router.post(
  '/attempt/complete',
  auth(),
  validateRequest(completeQuizAttemptValidation),
  QuizController.completeQuizAttempt
);

router.get(
  '/result/:attemptId',
  auth(),
  QuizController.getQuizResult
);

// Statistics and leaderboard
router.get(
  '/stats/user',
  auth(),
  QuizController.getUserStats
);

router.get(
  '/stats/leaderboard',
  QuizController.getLeaderboard
);

export default router;
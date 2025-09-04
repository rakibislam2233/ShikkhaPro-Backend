import express from 'express';
import { QuizAttemptController } from './quizAttempt.controller';
import validateRequest from '../../shared/validateRequest';
import auth from '../../middlewares/auth';
import {
  startQuizAttemptValidation,
  submitAnswerValidation,
  saveAnswersValidation,
  flagQuestionValidation,
  completeQuizAttemptValidation,
  getQuizAttemptValidation,
  getUserAttemptsValidation,
  getQuizResultValidation,
  getLeaderboardValidation,
  getUserStatsValidation,
} from './quizAttempt.validation';

const router = express.Router();

// Quiz attempt management
router.post(
  '/start',
  auth(),
  validateRequest(startQuizAttemptValidation),
  QuizAttemptController.startQuizAttempt
);

router.post(
  '/answer',
  auth(),
  validateRequest(submitAnswerValidation),
  QuizAttemptController.submitAnswer
);

router.post(
  '/save',
  auth(),
  validateRequest(saveAnswersValidation),
  QuizAttemptController.saveAnswers
);

router.post(
  '/flag',
  auth(),
  validateRequest(flagQuestionValidation),
  QuizAttemptController.flagQuestion
);

router.post(
  '/complete',
  auth(),
  validateRequest(completeQuizAttemptValidation),
  QuizAttemptController.completeQuizAttempt
);

// Get attempt details
router.get(
  '/my-attempts',
  auth(),
  validateRequest(getUserAttemptsValidation),
  QuizAttemptController.getUserAttempts
);

router.get(
  '/quiz/:quizId/attempts',
  QuizAttemptController.getQuizAttempts
);

router.get(
  '/:id',
  auth(),
  validateRequest(getQuizAttemptValidation),
  QuizAttemptController.getQuizAttemptById
);

router.get(
  '/:id/progress',
  auth(),
  validateRequest(getQuizAttemptValidation),
  QuizAttemptController.getAttemptProgress
);

// Results
router.get(
  '/result/:attemptId',
  auth(),
  validateRequest(getQuizResultValidation),
  QuizAttemptController.getQuizResult
);

// Statistics and leaderboard
router.get(
  '/stats/user',
  auth(),
  validateRequest(getUserStatsValidation),
  QuizAttemptController.getUserStats
);

router.get(
  '/stats/leaderboard',
  validateRequest(getLeaderboardValidation),
  QuizAttemptController.getLeaderboard
);

// Abandon attempt
router.patch(
  '/:id/abandon',
  auth(),
  validateRequest(getQuizAttemptValidation),
  QuizAttemptController.abandonAttempt
);

export default router;
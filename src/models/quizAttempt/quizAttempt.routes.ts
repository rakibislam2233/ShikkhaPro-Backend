import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../shared/validateRequest';
import { QuizAttemptController } from './quizAttempt.controller';
import {
  completeQuizAttemptValidation,
  flagQuestionValidation,
  getLeaderboardValidation,
  getQuizAttemptValidation,
  getQuizResultValidation,
  getUserAttemptsValidation,
  getUserStatsValidation,
  saveAnswersValidation,
  startQuizAttemptValidation,
  submitAnswerValidation,
} from './quizAttempt.validation';

const router = express.Router();

// Quiz attempt management
router.post(
  '/start',
  auth("User"),
  validateRequest(startQuizAttemptValidation),
  QuizAttemptController.startQuizAttempt
);

router.post(
  '/answer',
  auth("User"),
  validateRequest(submitAnswerValidation),
  QuizAttemptController.submitAnswer
);

router.post(
  '/save',
  auth("User"),
  validateRequest(saveAnswersValidation),
  QuizAttemptController.saveAnswers
);

router.post(
  '/flag',
  auth("User"),
  validateRequest(flagQuestionValidation),
  QuizAttemptController.flagQuestion
);

router.post(
  '/complete',
  auth("User"),
  validateRequest(completeQuizAttemptValidation),
  QuizAttemptController.completeQuizAttempt
);

// Get attempt details
router.get(
  '/my-attempts',
  auth("User"),
  validateRequest(getUserAttemptsValidation),
  QuizAttemptController.getUserAttempts
);

router.get(
  '/quiz/:quizId/attempts',
  QuizAttemptController.getQuizAttempts
);

router.get(
  '/:id',
  auth("User"),
  validateRequest(getQuizAttemptValidation),
  QuizAttemptController.getQuizAttemptById
);

router.get(
  '/:id/progress',
  auth("User"),
  validateRequest(getQuizAttemptValidation),
  QuizAttemptController.getAttemptProgress
);

// Results
router.get(
  '/result/:attemptId',
  auth("User"),
  validateRequest(getQuizResultValidation),
  QuizAttemptController.getQuizResult
);

// Statistics and leaderboard
router.get(
  '/stats/user',
  auth("User"),
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
  auth("User"),
  validateRequest(getQuizAttemptValidation),
  QuizAttemptController.abandonAttempt
);

export default router;
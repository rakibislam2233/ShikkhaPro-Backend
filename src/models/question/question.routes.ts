import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../shared/validateRequest';
import { QuestionController } from './question.controller';
import {
  approveQuestionValidation,
  createQuestionValidation,
  deleteQuestionValidation,
  getQuestionValidation,
  searchQuestionsValidation,
  updateQuestionValidation,
} from './question.validation';

const router = express.Router();

// Question generation
router.post(
  '/generate',
  auth("User"),
  QuestionController.generateQuestion
);

// Question management
router.post(
  '/',
  auth("User"),
  validateRequest(createQuestionValidation),
  QuestionController.createQuestion
);

router.get(
  '/my-questions',
  auth("User"),
  QuestionController.getUserQuestions
);

router.get(
  '/approved',
  QuestionController.getApprovedQuestions
);

router.get(
  '/search',
  validateRequest(searchQuestionsValidation),
  QuestionController.searchQuestions
);

router.get(
  '/subject/:subject',
  QuestionController.getQuestionsBySubject
);

router.get(
  '/topic/:topic',
  QuestionController.getQuestionsByTopic
);

router.get(
  '/stats',
  QuestionController.getQuestionStats
);

router.get(
  '/:id',
  validateRequest(getQuestionValidation),
  QuestionController.getQuestionById
);

router.patch(
  '/:id',
  auth("User"),
  validateRequest(updateQuestionValidation),
  QuestionController.updateQuestion
);

router.delete(
  '/:id',
  auth("User"),
  validateRequest(deleteQuestionValidation),
  QuestionController.deleteQuestion
);

// Question improvement
router.post(
  '/:id/improve',
  auth("User"),
  QuestionController.improveQuestion
);

// Admin only - Question approval
router.patch(
  '/:id/approve',
  auth("User"),
  validateRequest(approveQuestionValidation),
  QuestionController.approveQuestion
);

export default router;
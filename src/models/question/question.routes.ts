import express from 'express';
import { QuestionController } from './question.controller';
import validateRequest from '../../shared/validateRequest';
import auth from '../../middlewares/auth';
import {
  createQuestionValidation,
  updateQuestionValidation,
  getQuestionValidation,
  deleteQuestionValidation,
  searchQuestionsValidation,
  approveQuestionValidation,
} from './question.validation';

const router = express.Router();

// Question generation
router.post(
  '/generate',
  auth(),
  QuestionController.generateQuestion
);

// Question management
router.post(
  '/',
  auth(),
  validateRequest(createQuestionValidation),
  QuestionController.createQuestion
);

router.get(
  '/my-questions',
  auth(),
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
  auth(),
  validateRequest(updateQuestionValidation),
  QuestionController.updateQuestion
);

router.delete(
  '/:id',
  auth(),
  validateRequest(deleteQuestionValidation),
  QuestionController.deleteQuestion
);

// Question improvement
router.post(
  '/:id/improve',
  auth(),
  QuestionController.improveQuestion
);

// Admin only - Question approval
router.patch(
  '/:id/approve',
  auth(),
  validateRequest(approveQuestionValidation),
  QuestionController.approveQuestion
);

export default router;
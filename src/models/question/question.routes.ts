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

/**
 * @swagger
 * tags:
 *   name: Question
 *   description: Question management endpoints
 */

/**
 * @swagger
 * /question/generate:
 *   post:
 *     summary: Generate questions using AI
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - topic
 *               - academicLevel
 *               - difficulty
 *               - questionCount
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Mathematics"
 *               topic:
 *                 type: string
 *                 example: "Algebra"
 *               academicLevel:
 *                 type: string
 *                 enum: [
        'class-1',
        'class-2',
        'class-3',
        'class-4',
        'class-5',
        'class-6',
        'class-7',
        'jsc',
        'ssc',
        'hsc',
        'bsc',
        'msc',
      ]
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *               questionCount:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 20
 *               questionTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [mcq, true-false, short-answer, essay]
 *     responses:
 *       201:
 *         description: Questions generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
// Question generation
router.post(
  '/generate',
  auth("User"),
  QuestionController.generateQuestion
);

/**
 * @swagger
 * /question:
 *   post:
 *     summary: Create a new question
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestionCreation'
 *     responses:
 *       201:
 *         description: Question created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
// Question management
router.post(
  '/',
  auth("User"),
  validateRequest(createQuestionValidation),
  QuestionController.createQuestion
);

/**
 * @swagger
 * /question/my-questions:
 *   get:
 *     summary: Get current user's questions
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *     responses:
 *       200:
 *         description: User questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/my-questions',
  auth("User"),
  QuestionController.getUserQuestions
);

/**
 * @swagger
 * /question/approved:
 *   get:
 *     summary: Get all approved questions
 *     tags: [Question]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *     responses:
 *       200:
 *         description: Approved questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get(
  '/approved',
  QuestionController.getApprovedQuestions
);

/**
 * @swagger
 * /question/search:
 *   get:
 *     summary: Search questions
 *     tags: [Question]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: Questions found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 */
router.get(
  '/search',
  validateRequest(searchQuestionsValidation),
  QuestionController.searchQuestions
);

/**
 * @swagger
 * /question/subject/{subject}:
 *   get:
 *     summary: Get questions by subject
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: subject
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject name
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get(
  '/subject/:subject',
  QuestionController.getQuestionsBySubject
);

/**
 * @swagger
 * /question/topic/{topic}:
 *   get:
 *     summary: Get questions by topic
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: topic
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic name
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get(
  '/topic/:topic',
  QuestionController.getQuestionsByTopic
);

/**
 * @swagger
 * /question/stats:
 *   get:
 *     summary: Get question statistics
 *     tags: [Question]
 *     responses:
 *       200:
 *         description: Question statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalQuestions:
 *                       type: number
 *                     approvedQuestions:
 *                       type: number
 *                     pendingQuestions:
 *                       type: number
 *                     questionsBySubject:
 *                       type: object
 *                     questionsByDifficulty:
 *                       type: object
 */
router.get(
  '/stats',
  QuestionController.getQuestionStats
);

/**
 * @swagger
 * /question/{id}:
 *   get:
 *     summary: Get question by ID
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Question not found
 *   patch:
 *     summary: Update question
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestionCreation'
 *     responses:
 *       200:
 *         description: Question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question not found
 *   delete:
 *     summary: Delete question
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question not found
 */
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

/**
 * @swagger
 * /question/{id}/improve:
 *   post:
 *     summary: Improve question using AI
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               improvementType:
 *                 type: string
 *                 enum: [clarity, difficulty, options, explanation]
 *                 description: Type of improvement to apply
 *               instructions:
 *                 type: string
 *                 description: Specific instructions for improvement
 *     responses:
 *       200:
 *         description: Question improved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question not found
 */
// Question improvement
router.post(
  '/:id/improve',
  auth("User"),
  QuestionController.improveQuestion
);

/**
 * @swagger
 * /question/{id}/approve:
 *   patch:
 *     summary: Approve question (Admin only)
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isApproved
 *             properties:
 *               isApproved:
 *                 type: boolean
 *                 description: Whether to approve or reject the question
 *               feedback:
 *                 type: string
 *                 description: Optional feedback for the question creator
 *     responses:
 *       200:
 *         description: Question approval status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question not found
 */
// Admin only - Question approval
router.patch(
  '/:id/approve',
  auth("User"),
  validateRequest(approveQuestionValidation),
  QuestionController.approveQuestion
);

export default router;
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../shared/validateRequest';
import { QuizController } from './quiz.controller';
import {
  createQuizValidation,
  deleteQuizValidation,
  generateQuizValidation,
  getQuizValidation,
  submitAnswerValidation,
  submitQuizAnswerValidation,
  updateQuizValidation,
} from './quiz.validation';

const router = express.Router();

// generate quiz for all authorized users
router.post(
  '/generate',
  auth('User'),
  validateRequest(generateQuizValidation),
  QuizController.generateQuiz
);

/**
 * @swagger
 * /quiz:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - subject
 *               - academicLevel
 *               - difficulty
 *               - questions
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Basic Algebra Quiz"
 *               description:
 *                 type: string
 *                 example: "A quiz covering basic algebraic concepts"
 *               subject:
 *                 type: string
 *                 example: "Mathematics"
 *               topic:
 *                 type: string
 *                 example: "Algebra"
 *               academicLevel:
 *                 type: string
 *                 enum: ['class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'jsc', 'ssc', 'hsc', 'bsc', 'msc']
 *               difficulty:
 *                 type: string
 *                 enum: ['easy', 'medium', 'hard']
 *               language:
 *                 type: string
 *                 default: "english"
 *               questions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Question'
 *               timeLimit:
 *                 type: number
 *                 description: "Time limit in minutes"
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

// create specific quize as teacher or student (not implemented yet)
router.post(
  '/',
  auth('User'),
  validateRequest(createQuizValidation),
  QuizController.createQuiz
);

/**
 * @swagger
 * /quiz/my-quizzes:
 *   get:
 *     summary: Get all quizzes created by current user
 *     tags: [Quiz]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User quizzes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 */
// get my all quizzes
router.get('/my-quizzes', auth('User'), QuizController.getUserQuizzes);

/**
 * @swagger
 * /quiz/{id}:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Quiz not found
 *   patch:
 *     summary: Update quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               subject:
 *                 type: string
 *               topic:
 *                 type: string
 *               academicLevel:
 *                 type: string
 *                 enum: ['class-1', 'class-2', 'class-3', 'class-4', 'class-5', 'class-6', 'class-7', 'jsc', 'ssc', 'hsc', 'bsc', 'msc']
 *               difficulty:
 *                 type: string
 *                 enum: ['easy', 'medium', 'hard']
 *               timeLimit:
 *                 type: number
 *               isPublic:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz not found
 *   delete:
 *     summary: Delete quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz not found
 */
router.get(
  '/:id',
  auth('User'),
  validateRequest(getQuizValidation),
  QuizController.getQuizById
);

router.patch(
  '/:id',
  auth('User'),
  validateRequest(updateQuizValidation),
  QuizController.updateQuiz
);

router.delete(
  '/:id',
  auth('User'),
  validateRequest(deleteQuizValidation),
  QuizController.deleteQuiz
);


/**
 * @swagger
 * /quiz/attempt/answer:
 *   post:
 *     summary: Submit answer for a question
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attemptId
 *               - questionId
 *               - answer
 *             properties:
 *               attemptId:
 *                 type: string
 *               questionId:
 *                 type: string
 *               answer:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attempt not found
 */
router.post(
  '/attempt/answer',
  auth('User'),
  validateRequest(submitAnswerValidation),
  QuizController.submitAnswer
);

/**
 * @swagger
 * /quiz/attempt/save:
 *   post:
 *     summary: Save answers for multiple questions
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attemptId
 *               - answers
 *             properties:
 *               attemptId:
 *                 type: string
 *               answers:
 *                 type: object
 *                 additionalProperties:
 *                   oneOf:
 *                     - type: string
 *                     - type: array
 *                       items:
 *                         type: string
 *     responses:
 *       200:
 *         description: Answers saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attempt not found
 */
router.post(
  '/attempt/submit-quiz-answer',
  auth('User'),
  validateRequest(submitQuizAnswerValidation),
  QuizController.submitQuizAnswer
);


/**
 * @swagger
 * /quiz/result/{attemptId}:
 *   get:
 *     summary: Get quiz result for an attempt
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz attempt ID
 *     responses:
 *       200:
 *         description: Quiz result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attempt not found
 */
router.get('/result/:attemptId', auth('User'), QuizController.getQuizResult);

/**
 * @swagger
 * /quiz/stats/user:
 *   get:
 *     summary: Get user quiz statistics
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 */
// Statistics and leaderboard
router.get('/stats/user', auth('User'), QuizController.getUserStats);

/**
 * @swagger
 * /quiz/stats/leaderboard:
 *   get:
 *     summary: Get quiz leaderboard
 *     tags: [Quiz]
 *     parameters:
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter by subject
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of top users to return
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/stats/leaderboard', QuizController.getLeaderboard);

export default router;

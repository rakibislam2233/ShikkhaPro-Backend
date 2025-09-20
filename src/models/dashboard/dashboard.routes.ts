import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../shared/validateRequest';
import { DashboardController } from './dashboard.controller';
import {
  getDashboardOverviewValidation,
  getAllAttemptsValidation,
  getRecentActivityValidation,
  getWeeklyProgressValidation,
  getSubjectPerformanceValidation,
  getDashboardSummaryValidation,
} from './dashboard.validation';

const router = express.Router();

/**
 * @swagger
 * /dashboard/overview:
 *   get:
 *     summary: Get complete dashboard overview with all statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalQuizzes:
 *                       type: number
 *                       description: Total unique quizzes attempted
 *                     totalAttempts:
 *                       type: number
 *                       description: Total quiz attempts
 *                     completedQuizzes:
 *                       type: number
 *                       description: Successfully completed quiz attempts
 *                     averageScore:
 *                       type: number
 *                       description: Average score across all completed quizzes
 *                     averagePercentage:
 *                       type: number
 *                       description: Average percentage across all completed quizzes
 *                     bestScore:
 *                       type: number
 *                       description: Highest score achieved
 *                     bestPercentage:
 *                       type: number
 *                       description: Highest percentage achieved
 *                     totalTimeSpent:
 *                       type: number
 *                       description: Total time spent on quizzes (in minutes)
 *                     favoriteSubjects:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of subjects user has attempted
 *                     recentActivity:
 *                       type: array
 *                       description: Last 10 quiz attempts
 *                     weeklyProgress:
 *                       type: array
 *                       description: Weekly progress for last 8 weeks
 *                     subjectPerformance:
 *                       type: array
 *                       description: Performance breakdown by subject
 *                     achievements:
 *                       type: array
 *                       description: Unlocked achievements
 *                     streakDays:
 *                       type: number
 *                       description: Current streak of consecutive days with quiz activity
 *                     rank:
 *                       type: number
 *                       description: User's rank among all users
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/overview',
  auth('User'),
  validateRequest(getDashboardOverviewValidation),
  DashboardController.getDashboardOverview
);

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get quick dashboard summary for header/sidebar
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalQuizzes:
 *                       type: number
 *                     totalAttempts:
 *                       type: number
 *                     completedQuizzes:
 *                       type: number
 *                     averageScore:
 *                       type: number
 *                     averagePercentage:
 *                       type: number
 *                     rank:
 *                       type: number
 *                     streakDays:
 *                       type: number
 *                     lastActivityAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/summary',
  auth('User'),
  validateRequest(getDashboardSummaryValidation),
  DashboardController.getDashboardSummary
);

/**
 * @swagger
 * /dashboard/attempts:
 *   get:
 *     summary: Get all quiz attempts with filtering and pagination
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *           maximum: 100
 *         description: Number of results per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [completed, in-progress, abandoned]
 *         description: Filter by attempt status
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter by subject
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         description: Filter by difficulty
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter attempts from this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter attempts until this date
 *     responses:
 *       200:
 *         description: Quiz attempts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     attempts:
 *                       type: array
 *                       description: List of quiz attempts
 *                     totalCount:
 *                       type: number
 *                     completedCount:
 *                       type: number
 *                     inProgressCount:
 *                       type: number
 *                     abandonedCount:
 *                       type: number
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/attempts',
  auth('User'),
  validateRequest(getAllAttemptsValidation),
  DashboardController.getAllAttempts
);

/**
 * @swagger
 * /dashboard/recent-activity:
 *   get:
 *     summary: Get recent quiz activity
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *           maximum: 50
 *         description: Number of recent activities to return
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       attemptId:
 *                         type: string
 *                       quizId:
 *                         type: string
 *                       quizTitle:
 *                         type: string
 *                       subject:
 *                         type: string
 *                       topic:
 *                         type: string
 *                       score:
 *                         type: number
 *                       totalScore:
 *                         type: number
 *                       percentage:
 *                         type: number
 *                       grade:
 *                         type: string
 *                       timeSpent:
 *                         type: number
 *                       difficulty:
 *                         type: string
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/recent-activity',
  auth('User'),
  validateRequest(getRecentActivityValidation),
  DashboardController.getRecentActivity
);

/**
 * @swagger
 * /dashboard/weekly-progress:
 *   get:
 *     summary: Get weekly progress data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: weeks
 *         schema:
 *           type: number
 *           default: 8
 *           maximum: 52
 *         description: Number of weeks to include
 *     responses:
 *       200:
 *         description: Weekly progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       week:
 *                         type: string
 *                         description: Week identifier (YYYY-WW)
 *                       weekStart:
 *                         type: string
 *                         format: date-time
 *                       weekEnd:
 *                         type: string
 *                         format: date-time
 *                       quizzesCompleted:
 *                         type: number
 *                       averageScore:
 *                         type: number
 *                       totalTimeSpent:
 *                         type: number
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/weekly-progress',
  auth('User'),
  validateRequest(getWeeklyProgressValidation),
  DashboardController.getWeeklyProgress
);

/**
 * @swagger
 * /dashboard/subject-performance:
 *   get:
 *     summary: Get subject-wise performance breakdown
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subject performance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subject:
 *                         type: string
 *                       totalAttempts:
 *                         type: number
 *                       completedQuizzes:
 *                         type: number
 *                       averageScore:
 *                         type: number
 *                       averagePercentage:
 *                         type: number
 *                       bestScore:
 *                         type: number
 *                       totalTimeSpent:
 *                         type: number
 *                       lastAttemptDate:
 *                         type: string
 *                         format: date-time
 *                       improvementTrend:
 *                         type: string
 *                         enum: [improving, declining, stable]
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/subject-performance',
  auth('User'),
  validateRequest(getSubjectPerformanceValidation),
  DashboardController.getSubjectPerformance
);

export default router;
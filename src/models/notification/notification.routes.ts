import { Router } from 'express';
import auth from '../../middlewares/auth';
import { NotificationController } from './notification.controllers';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Notification management endpoints
 */

/**
 * @swagger
 * /notification/unview-notification-count:
 *   get:
 *     summary: Get unviewed notification count
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unviewed notification count retrieved successfully
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
 *                     count:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/unview-notification-count',
  auth('Common'),
  NotificationController.getUnViewNotificationCount
);

/**
 * @swagger
 * /notification/unview-message-notification-count:
 *   get:
 *     summary: Get unviewed message notification count
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unviewed message notification count retrieved successfully
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
 *                     count:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/unview-message-notification-count',
  auth('Common'),
  NotificationController.getUnViewMessageNotificationCount
);

/**
 * @swagger
 * /notification/view-all-notifications:
 *   post:
 *     summary: Mark all notifications as viewed
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as viewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 */
/** ========================View all notifications route here==================== */
router
  .route('/view-all-notifications')
  .post(auth('Common'), NotificationController.viewAllNotifications);

/**
 * @swagger
 * /notification/get-all-message-notifications:
 *   get:
 *     summary: Get all message notifications
 *     tags: [Notification]
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
 *     responses:
 *       200:
 *         description: Message notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 */
/** ========================Get all message notifications route here==================== */
router
  .route('/get-all-message-notifications')
  .get(auth('Common'), NotificationController.getALLMessageNotification);

/**
 * @swagger
 * /notification/view-single-notification:
 *   post:
 *     summary: Mark single notification as viewed
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificationId
 *             properties:
 *               notificationId:
 *                 type: string
 *                 description: ID of the notification to mark as viewed
 *     responses:
 *       200:
 *         description: Notification marked as viewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
/** ========================View single notifications route here==================== */
router
  .route('/view-single-notification')
  .post(auth('Common'), NotificationController.viewSingleNotification);

/**
 * @swagger
 * /notification/clear-all-notifications:
 *   delete:
 *     summary: Clear all notifications
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 */
/** ========================Clear all notifications route here==================== */
router
  .route('/clear-all-notifications')
  .delete(auth('Common'), NotificationController.clearAllNotification);

/**
 * @swagger
 * /notification/admin-notifications:
 *   get:
 *     summary: Get admin notifications (Admin only)
 *     tags: [Notification]
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
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *     responses:
 *       200:
 *         description: Admin notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
/** ========================Admin all notifications route here==================== */
router
  .route('/admin-notifications')
  .get(auth('admin'), NotificationController.getAdminNotifications);

/**
 * @swagger
 * /notification:
 *   get:
 *     summary: Get all user notifications
 *     tags: [Notification]
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
 *         name: isViewed
 *         schema:
 *           type: boolean
 *         description: Filter by viewed status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 */
/** ========================User all notifications route here==================== */
router
  .route('/')
  .get(auth('Common'), NotificationController.getALLNotification);

/**
 * @swagger
 * /notification/{id}:
 *   get:
 *     summary: Get single notification by ID
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *   patch:
 *     summary: Mark notification as viewed
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as viewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *   delete:
 *     summary: Delete notification
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
/** ========================Single notifications route here==================== */
router
  .route('/:id')
  .get(auth('Common'), NotificationController.getSingleNotification)
  .patch(auth('Common'), NotificationController.viewSingleNotification)
  /** ========================Delete Single notifications route here==================== */
  .delete(auth('Common'), NotificationController.deleteNotification);

export const NotificationRoutes = router;

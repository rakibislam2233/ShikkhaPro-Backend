import { Router } from 'express';
import auth from '../../middlewares/auth';
import { NotificationController } from './notification.controllers';

const router = Router();

router.get(
  '/unview-notification-count',
  auth('Common'),
  NotificationController.getUnViewNotificationCount
);

router.get(
  '/unview-message-notification-count',
  auth('Common'),
  NotificationController.getUnViewMessageNotificationCount
);

router
  .route('/view-all-notifications')
  .post(auth('Common'), NotificationController.viewAllNotifications);

router
  .route('/get-all-message-notifications')
  .get(auth('Common'), NotificationController.getALLMessageNotification);

router
  .route('/view-single-notification')
  .post(auth('Common'), NotificationController.viewSingleNotification);

router
  .route('/clear-all-notifications')
  .delete(auth('Common'), NotificationController.clearAllNotification);

router
  .route('/admin-notifications')
  .get(auth('admin'), NotificationController.getAdminNotifications);

router
  .route('/')
  .get(auth('Common'), NotificationController.getALLNotification);

router
  .route('/:id')
  .get(auth('Common'), NotificationController.getSingleNotification)
  .patch(auth('Common'), NotificationController.viewSingleNotification)
  .delete(auth('Common'), NotificationController.deleteNotification);

export const NotificationRoutes = router;
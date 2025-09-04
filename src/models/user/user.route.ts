import { Router } from 'express';
import auth from '../../middlewares/auth';
import { UserController } from './user.controller';
import fileUploadHandler from '../../shared/fileUploadHandler';
import { USER_UPLOADS_FOLDER } from './user.constant';
const uploads = fileUploadHandler(USER_UPLOADS_FOLDER);

const router = Router();

//get user activity graph chart
router.get(
  '/activity-graph-chart',
  auth('Admin', 'Super_Admin'),
  UserController.userActivityGraphChart
);

router.get(
  '/dashboard/overview',
  auth('Admin', 'Super_Admin'),
  UserController.getDashboardOverview
);

router.get('/', auth('Admin', 'Super_Admin'), UserController.getAllUsers);
router.get('/:id', auth('Admin', 'Super_Admin'), UserController.getUserById);

router.patch(
  '/:id/status',
  auth('Admin', 'Super_Admin'),
  UserController.updateUserStatus
);
router.get('/profile/me', auth('Common'), UserController.getMyProfile);
router.patch(
  '/profile/update',
  auth('Common'),
  uploads.single('avatar'),
  UserController.updateMyProfile
);
router.delete(
  '/profile/delete',
  auth('Common'),
  UserController.deleteMyProfile
);
export const UserRoutes = router;

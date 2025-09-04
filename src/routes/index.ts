import express from 'express';
import { NotificationRoutes } from '../models/notification/notification.routes';
import { UserRoutes } from '../models/user/user.route';
import { AuthRoutes } from '../models/auth/auth.routes';
import { SettingsRoutes } from '../models/settings/settings.routes';

const router = express.Router();

const apiRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/settings',
    route: SettingsRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;

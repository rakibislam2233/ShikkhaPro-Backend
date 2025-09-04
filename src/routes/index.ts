import express from 'express';
import { NotificationRoutes } from '../models/notification/notification.routes';
import { UserRoutes } from '../models/user/user.route';
import { AuthRoutes } from '../models/auth/auth.routes';
import { SettingsRoutes } from '../models/settings/settings.routes';
import quizRoutes from '../models/quiz/quiz.routes';
import questionRoutes from '../models/question/question.routes';
import quizAttemptRoutes from '../models/quizAttempt/quizAttempt.routes';

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
  {
    path: '/quizzes',
    route: quizRoutes,
  },
  {
    path: '/questions',
    route: questionRoutes,
  },
  {
    path: '/quiz-attempts',
    route: quizAttemptRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;

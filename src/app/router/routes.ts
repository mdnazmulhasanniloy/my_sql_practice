import { chatRouters } from '@app/modules/chat/chat.route';
import { UserRouter } from '@app/modules/users/users.routes';
import { Router } from 'express';

const router = Router();
const moduleRoutes = [
  {
    path: '/users',
    route: UserRouter,
  },
  {
    path: '/chat',
    route: chatRouters,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;

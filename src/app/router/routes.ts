import { UserRouter } from '@app/modules/users/users.routes';
import { Router } from 'express';

const router = Router();
const moduleRoutes = [
  {
    path: '/users',
    route: UserRouter,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;

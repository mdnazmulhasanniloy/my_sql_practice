import { Router } from 'express';
import { UserController } from './user.controller';
import multer, { memoryStorage } from 'multer';
import parseData from '@app/middleware/parseData';
import validateRequest from '@app/middleware/validateRequest';
import { UserValidator } from './user.validation';
import auth from '@app/middleware/auth';
import { Role } from './user.interface';

const route = Router();
const upload = multer({ storage: memoryStorage() });

route.post(
  '/login',
  validateRequest(UserValidator.login),
  UserController.login
);

route.post(
  '/',
  upload.single('profile'),
  parseData(),
  validateRequest(UserValidator.create),
  UserController.createUser
);

route.get(
  '/my-profile',
  auth(Role.admin, Role.user),
  UserController.getMyProfile
);
route.get('/:id', auth(Role.admin, Role.user), UserController.getUserById);
route.get('/', auth(Role.admin, Role.user), UserController.getAll);

export const UserRouter = route;

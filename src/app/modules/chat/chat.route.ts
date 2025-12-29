import { Router } from 'express';
import { chatController } from './chat.controller';
import auth from '@app/middleware/auth';

const router = Router();

router.post('/', chatController.createChat);
router.get('/', auth('admin', 'user'), chatController.getMyChat);

export const chatRouters = router;

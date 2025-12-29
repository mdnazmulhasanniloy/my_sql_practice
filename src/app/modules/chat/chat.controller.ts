import catchAsync from '@app/utils/catchAsync';
import sendResponse from '@app/utils/sendResponse';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { chatService } from './chat.service';
import { JwtPayload } from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: JwtPayload | null;
}

const createChat = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await chatService.createChatList(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'chat create success',
    data: result,
  });
});
const getMyChat = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await chatService.getMyChatList(req?.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'chat create success',
    data: result,
  });
});

// const createChat = catchAsync(async (req: Request, res: Response) => {
//   createUser;
// });

export const chatController = {
  createChat,
  getMyChat,
};

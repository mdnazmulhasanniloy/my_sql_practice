import catchAsync from '@app/utils/catchAsync';
import sendResponse from '@app/utils/sendResponse';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { UserService } from './user.service';
import { JwtPayload } from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: JwtPayload | null;
}

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createUser(req.body, req.file);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'user created successfully',
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.login(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'user login successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  //@ts-ignore
  const result = await UserService.getMyProfile(req.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My profile get successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAll(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Get all users successfully',
    data: result,
  });
});
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Get all users successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  login,
  getMyProfile,
  getAll,
  getUserById,
};

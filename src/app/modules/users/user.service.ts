import AppError from '@app/error/AppError';
import HashPassword from '@app/shared/hashPassword';
import prisma from '@app/shared/prisma';
import { uploadToS3 } from '@app/utils/s3';
import { Prisma, Role } from '@prisma/client';
import httpStatus from 'http-status';
import { createToken, isPasswordMatched } from './user.utils';
import { ILogin } from './user.interface';
import config from '@app/config';
import pickQuery from '@app/utils/pickQuery';
import { paginationHelper } from '@app/helpers/pagination.helpers';

const createUser = async (payload: Prisma.userCreateInput, file: any) => {
  const isUserExist = await prisma.user.findFirst({
    where: {
      email: payload.email,
    },
  });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This email already taken');
  }

  if (file) {
    payload.profile = (await uploadToS3({
      file,
      fileName: `user-profile/${payload.email}`,
    })) as string;
  }
  payload['password'] = await HashPassword(payload?.password);
  const result = await prisma.user.create({
    data: payload,
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user creation filed.');
  }

  return result;
};

const login = async (payload: ILogin) => {
  const user = await prisma.user.findFirst({
    where: { email: payload.email },
  });
  console.log('🚀 ~ login ~ user:', user);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user is not registered!');
  }

  if (!(await isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  const jwtPayload: { userId: string; email: string; role: string } = {
    userId: user?.id?.toString() as string,
    email: user?.email as string,
    role: user?.role as string,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const getMyProfile = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
  });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user not found');
  }

  return user;
};

const getAll = async (query: Record<string, any>) => {
  const { filters, pagination } = await pickQuery(query);

  const { searchTerm, ...filtersData } = filters;

  // eslint-disable-next-line prefer-const
  let pipeline: Prisma.userWhereInput = {};

  // search condition
  if (searchTerm) {
    pipeline.OR = ['name', 'email'].map(field => ({
      [field]: {
        contains: searchTerm,
        // mode: 'insensitive',
      },
    }));
  }

  // Add filterQuery conditions
  if (Object.keys(filtersData).length > 0) {
    const oldAnd = pipeline.AND;
    const oldAndArray = Array.isArray(oldAnd) ? oldAnd : oldAnd ? [oldAnd] : [];

    pipeline.AND = [
      ...oldAndArray,
      ...Object.entries(filtersData).map(([key, value]) => ({
        [key]: { equals: value },
      })),
    ];
  }

  // Sorting condition
  const { page, limit, skip, sort } =
    paginationHelper.calculatePagination(pagination);

  let sortArray: any[] = [];
  if (sort) {
    sortArray = sort.split(',').map(field => {
      const trimmedField = field.trim();
      if (trimmedField.startsWith('-')) {
        return { [trimmedField.slice(1)]: 'desc' };
      }
      return { [trimmedField]: 'asc' };
    });
  }

  const data = await prisma.user.findMany({
    where: pipeline,
    skip,
    take: limit,
    orderBy: sortArray,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profile: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = await prisma.user.count({
    where: pipeline,
  });

  return {
    data,
    meta: { page, limit, total },
  };
};

const getUserById = async (id: string) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profile: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

export const UserService = {
  createUser,
  login,
  getMyProfile,
  getAll,
  getUserById,
};

import { paginationHelper } from '@app/helpers/pagination.helpers';
import pickQuery from '@app/utils/pickQuery';
import { Prisma } from '@prisma/index';
import prisma from '@app/shared/prisma';
import AppError from '@app/error/AppError';
import httpStatus from 'http-status';

const getMessages = async (query: Record<string, any>) => {
  const { filters, pagination } = await pickQuery(query);
  const { searchTerm, ...filtersData } = filters;

  const where: Prisma.messageWhereInput = {};
  if (searchTerm) {
    where.OR = ['text'].map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    }));
  }

  // Filter conditions
  if (Object.keys(filtersData).length > 0) {
    const oldAnd = where.AND;
    const andArray = Array.isArray(oldAnd) ? oldAnd : oldAnd ? [oldAnd] : [];

    where.AND = [
      ...andArray,
      ...Object.entries(filtersData).map(([key, value]) => ({
        [key]: { equals: value },
      })),
    ];
  }

  const { page, limit, skip, sort } =
    paginationHelper.calculatePagination(pagination);

  const orderBy: Prisma.messageOrderByWithRelationInput[] = sort
    ? sort.split(',').map(field => {
        const trimmed = field.trim();
        if (trimmed.startsWith('-')) {
          return { [trimmed.slice(1)]: 'desc' };
        }
        return { [trimmed]: 'asc' };
      })
    : [];

  const data = await prisma.message.findMany({
    where,
    skip,
    take: limit,
    orderBy,
    include: {
      user: true,
      chat: true,
    },
  });
};

const deleteMessage = async (id: string) => {
  const result = await prisma.user.delete({
    where: {
      id: Number(id),
    },
  });

  if (!result)
    throw new AppError(httpStatus.BAD_REQUEST, 'Message deletion failed!');

  return result;
};

export const messageController = {
  getMessages,
  deleteMessage,
};

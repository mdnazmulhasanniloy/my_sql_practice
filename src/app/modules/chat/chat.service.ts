import prisma from '@app/shared/prisma';
import { Prisma } from '@prisma/index';

const getMyChatList = async (userId: string) => {
  const userIdNum = Number(userId);

  const chats = await prisma.chat.findMany({
    where: {
      participant: {
        some: {
          OR: [{ user1Id: userIdNum }, { user2Id: userIdNum }],
        },
      },
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      participant: {
        select: {
          user1Id: true,
          user2Id: true,
          user_participant_user1IdTouser: {
            select: { id: true, name: true, profile: true, email: true },
          },
          user_participant_user2IdTouser: {
            select: { id: true, name: true, profile: true, email: true },
          },
        },
      },
      message: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          text: true,
          image: true,
          createdAt: true,
          isRead: true,
          senderId: true,
        },
      },
      _count: {
        select: {
          message: {
            where: { isRead: false, receiverId: userIdNum },
          },
        },
      },
    },
  });

 

  // 🧩 Transform result for frontend
  return chats
    ?.map(chat => {
      const participant = chat.participant[0];
      if (!participant) return null;

      const isUser1 = participant.user1Id === userIdNum;
      const otherUser = isUser1
        ? participant.user_participant_user2IdTouser
        : participant.user_participant_user1IdTouser;

      const lastMessage = chat.message[0] || null;

      return {
        chatId: chat.id,
        otherUser: otherUser
          ? {
              id: otherUser.id,
              name: otherUser.name,
              image: otherUser.profile,
            }
          : null,
        lastMessage: lastMessage
          ? {
              text: lastMessage.text,
              image: lastMessage.image,
              time: lastMessage.createdAt,
              isRead: lastMessage.isRead,
              isMine: lastMessage.senderId === userIdNum,
            }
          : null,
        unreadCount: chat._count.message,
        updatedAt: chat.updatedAt,
      };
    })
    .filter(Boolean);
};

const createChatList = async (payload: {
  user1Id: number;
  user2Id: number;
}) => {
  // 🔍 Check if a chat already exists between user1 and user2

  const { user1Id, user2Id } = payload;
  const isExist = await prisma.chat.findFirst({
    where: {
      participant: {
        some: {
          OR: [
            { user1Id: user1Id, user2Id: user2Id },
            { user1Id: user2Id, user2Id: user1Id },
          ],
        },
      },
    },
    include: {
      participant: true,
    },
  });

  // ✅ If chat already exists, return it
  if (isExist) {
    return isExist;
  }

  // 🚀 Otherwise create a new chat
  const result = await prisma.chat.create({
    data: {
      status: 'active',
      participant: {
        create: {
          user1Id: Number(user1Id),
          user2Id: Number(user2Id),
        },
      },
    },
    include: {
      participant: true,
    },
  });

  return result;
};

export const chatService = {
  createChatList,
  getMyChatList,
};

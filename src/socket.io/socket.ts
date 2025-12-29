import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import httpStatus from 'http-status';
import getUserDetailsFromToken from '@app/helpers/getUserDetailsFromToken';
import AppError from '@app/error/AppError';
import callbackFn from '@app/utils/callbackFn';
import { chatService } from '@app/modules/chat/chat.service';
import handelChatList from './handler/handelChatLIst';
import handelSendMessage from './handler/handelSendMessage';

const socketTOUserId = new Map<string, string>();
const userTOSocketId = new Map<string, string>();

export function getSocketId(userid: number) {
  return userTOSocketId.get(userid?.toString()) as string;
}

export function getUserId(socketid: number) {
  return socketTOUserId.get(socketid?.toString()) as string;
}

const initializeSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  const onlineUser = new Set();

  io.on('connection', async socket => {
    console.log('connected', socket?.id);

    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.headers?.token;

      const user: any = await getUserDetailsFromToken(token);
      if (!user) throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');

      socket.join(user?._id?.toString());
      onlineUser.add(user?._id?.toString());
      socketTOUserId.set(socket?.id, user?._id?.toString());
      userTOSocketId.set(user?._id?.toString(), socket?.id);

      socket.on(
        'my-chat-list',
        async (data, callback) => await handelChatList(io, callback, user)
      );

      socket.on(
        'send-message',
        async (data, callback) =>
          await handelSendMessage(data, io, user, callback)
      );
    } catch (error) {
      console.error('-- socket.io connection error --', error);
    }
  });
};

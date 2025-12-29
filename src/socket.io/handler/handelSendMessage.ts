import { chatService } from '@app/modules/chat/chat.service';
import prisma from '@app/shared/prisma';
import callbackFn from '@app/utils/callbackFn';
import { getSocketId, getUserId } from 'socket.io/socket';

interface ISendMessage {
  senderId: number;
  receiverId: number;
  text: string;
  image: string;
  chatId?: number;
}
const handelSendMessage = async (
  data: ISendMessage,
  io: any,
  user: any,
  callBack: any
) => {
  try {
    data['senderId'] = user.id;
    const chat = await chatService.createChatList({
      user2Id: data?.senderId,
      user1Id: data?.senderId,
    });

    data['chatId'] = chat.id;

    const message = await prisma.message.create({
      data: {
        chatId: data.chatId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        text: data.text || '',
        image: data.image || '',
      },
      include: {
        chat: true,
        user: true,
      },
    });
    if (!message)
      callbackFn(callBack, { success: false, message: 'message send failed' });

    const receiverSocketId = getSocketId(message.receiverId);
    const senderSocketId = getSocketId(message.senderId);
    io.to(receiverSocketId).emit('new-message', message);
    io.to(senderSocketId).emit('new-message', message);
    callbackFn(callBack, {
      success: true,
      message: 'Message send successfully',
      data: message,
    });

    
  } catch (error: any) {
    console.log('send message Error::', error);
    callbackFn(callBack, {
      success: false,
      message: error?.message || 'send message failed',
    });
  }
};

export default handelSendMessage;

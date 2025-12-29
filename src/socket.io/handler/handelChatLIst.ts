import { chatService } from '@app/modules/chat/chat.service';
import callbackFn from '@app/utils/callbackFn';
import { getSocketId } from 'socket.io/socket';

const handelChatList = async (io: any, callback: any, user: any) => {
  {
    try {
      const chatList = await chatService.getMyChatList(user?.id);
      const mySocketId = getSocketId(user?._id);

      io.to(mySocketId).emit('chat-list', chatList);

      callbackFn(callback, { success: true, message: chatList });
    } catch (error: any) {
      callbackFn(callback, {
        success: false,
        message: error.message,
      });
      io.emit('io-error', { success: false, message: error.message });
    }
  }
};


export default handelChatList;
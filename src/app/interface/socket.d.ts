import 'socket.io';
interface IUser {
  userId: ObjectId | string;
  email: string;
  role: string;
}

declare module 'socket.io' {
  interface Socket {
    user: IUser;
  }
}

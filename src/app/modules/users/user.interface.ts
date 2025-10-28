export interface ILogin {
  email: string;
  password: string;
}

export enum Role {
  user = 'user',
  admin = 'admin',
}

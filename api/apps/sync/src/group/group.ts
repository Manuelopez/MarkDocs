import { User } from './user';

export class Group {
  roomId: string;
  title: string;
  serverText: string;
  users: User[];
}

//enums
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

//interfaces
export interface User {
  id: number;
  name?: string;
  email?: string;
  avatar?: string;
  role: UserRole;
}
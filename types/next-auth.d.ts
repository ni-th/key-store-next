import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    image?: string;
    avatar?: string;
  }
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      role?: string;
      image?: string;
      avatar?: string;
    };
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: string;
    image?: string;
  }
}
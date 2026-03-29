declare module "next-auth" {
  interface User {
    accessToken?: string;
    refreshToken?: string;
    role?: string;
  }
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: string;
  }
}
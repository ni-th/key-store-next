import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";



export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Call your backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            console.log("Login failed:", response.status);
            return null;
          }

          const data = await response.json();
          console.log("Backend response:", data);
          
          // Extract user and token from the response
          const { user, access_token, refresh_token } = data;
          
          // Return the user object with the token attached
          // This is what NextAuth expects
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.avatar,
            avatar: user.avatar,
            accessToken: access_token,  // Store token in user object
            refreshToken: refresh_token,  // Store refresh token in user object
          };
          
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "google-session",
      name: "Google Session",
      credentials: {},
      async authorize(_, req) {
        try {
          const cookieHeader = req.headers?.cookie;
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(cookieHeader ? { Cookie: cookieHeader } : {}),
            },
            cache: "no-store",
          });

          if (!response.ok) {
            return null;
          }

          const user = await response.json();

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.avatar,
            avatar: user.avatar,
          };
        } catch (error) {
          console.error("Google session authorize error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      // When user logs in, add their data to the JWT token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Pass the token data to the session
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as string,
        image: token.image as string,
        avatar: token.image as string,
      };
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debugging
}
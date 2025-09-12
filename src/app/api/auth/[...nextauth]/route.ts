import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { env } from '@/lib/env';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is a simple hardcoded user for development
        // In production, you would validate against a database
        if (credentials?.username === "admin" && credentials?.password === "admin") {
          return { 
            id: "1", 
            name: "Admin User", 
            email: "admin@example.com" 
          };
        }
        return null;
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    session: ({ session, token }) => {
      if (token.sub) {
        session.user = session.user || {};
        session.user.id = token.sub;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

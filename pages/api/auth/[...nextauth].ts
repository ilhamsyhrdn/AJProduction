import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/server/utils/mongodb-client";
import dbConnect from "@/server/utils/mongodb";
import User from "@/server/database/models/User";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async session({ session, user }) {
      // Ensure database connection before any fetch
      if (session.user) {
        session.user.id = user.id;
        await dbConnect();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          // Propagate role
          session.user.role = dbUser.role;
          // Propagate image (prefer db stored, fallback to provider value)
          session.user.image = dbUser.image || user.image || session.user.image || null;
        } else {
          // If user not found (rare), still try to surface provider image
          session.user.image = user.image || session.user.image || null;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);


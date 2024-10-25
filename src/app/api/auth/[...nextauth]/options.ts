import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/model/users.model";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        try {
          const user = await User.findOne({
            $or: [{ email: credentials.identifier }, { username: credentials.identifier }],
          });

          if (!user) {
            throw new Error("No user found");
          }

          if (!user.isVerified) {
            throw new Error("User is not verified");
          }

          const isPwdCorrect = await bcrypt.compare(credentials.password, user.password);

          if (!isPwdCorrect) {
            throw new Error("Password is incorrect");
          }

          return user;
        } catch (error) {
          throw new Error("An error occurred while signing in");
        }
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMsg = token.isAcceptingMsg;
        session.user.username = token.username;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMsg = user.isAcceptingMsg;
        token.username = user.username;
      }
      return token;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

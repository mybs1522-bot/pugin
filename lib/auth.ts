import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyOTP } from "@/lib/otp";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "otp",
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code || !credentials?.token)
          return null;
        const valid = verifyOTP(
          credentials.email,
          credentials.code,
          credentials.token
        );
        if (!valid) return null;
        return {
          id: credentials.email.toLowerCase().trim(),
          email: credentials.email.toLowerCase().trim(),
          name: credentials.email.split("@")[0],
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret:
    process.env.NEXTAUTH_SECRET ||
    "f3a7c89b0d1e2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
};

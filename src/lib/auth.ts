import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Resend from "next-auth/providers/resend"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/prisma"

const isDev = process.env.NODE_ENV === "development"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  debug: isDev,
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: "onboarding@resend.dev",
      ...(isDev && {
        sendVerificationRequest: async ({ url }) => {
          console.log(`\n✉️  Magic link (dev — copie ce lien dans ton navigateur) :\n\n  ${url}\n`)
        },
      }),
    }),
  ],
})

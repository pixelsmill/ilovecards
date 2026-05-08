import type { NextAuthConfig } from "next-auth"
import Resend from "next-auth/providers/resend"

const isDev = process.env.NODE_ENV === "development"

export const authConfig = {
  trustHost: true,
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
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
    error: "/login",
  },
} satisfies NextAuthConfig

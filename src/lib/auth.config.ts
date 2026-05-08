import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  trustHost: true,
  providers: [],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
    error: "/login",
  },
} satisfies NextAuthConfig

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getAdminUserByEmail, getAdminUserById, touchAdminLogin } from "@/lib/db/admins";
import { getMemberByEmail, isDatabaseConfigured } from "@/lib/db/members";
import { isAdminEmail } from "@/lib/utils";

function readCredentials(credentials: Partial<Record<string, unknown>> | undefined) {
  return {
    email: String(credentials?.email ?? "")
      .trim()
      .toLowerCase(),
    password: String(credentials?.password ?? ""),
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      id: "admin",
      name: "Administrador",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!isDatabaseConfigured()) return null;
        const { email, password } = readCredentials(credentials);
        if (!email || !password) return null;

        const admin = await getAdminUserByEmail(email);
        if (!admin) return null;
        const ok = await bcrypt.compare(password, admin.passwordHash);
        if (!ok) return null;

        await touchAdminLogin(admin.id);
        return {
          id: `admin-${admin.id}`,
          email: admin.email,
          name: admin.name ?? admin.email,
          role: "admin" as const,
          adminUserId: admin.id,
          mustChangePassword: admin.mustChangePassword,
        };
      },
    }),
    Credentials({
      id: "member",
      name: "Socio",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!isDatabaseConfigured()) return null;
        const { email, password } = readCredentials(credentials);
        if (!email || !password) return null;

        const member = await getMemberByEmail(email);
        if (!member || member.status !== "active" || !member.passwordHash) return null;

        const ok = await bcrypt.compare(password, member.passwordHash);
        if (!ok) return null;

        return {
          id: String(member.id),
          email: member.email,
          name: member.fullName,
          role: "member" as const,
          memberId: member.id,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        return isAdminEmail(user.email);
      }
      if (account?.provider === "admin") {
        return Boolean(user.adminUserId);
      }
      if (account?.provider === "member") {
        return Boolean(user.email && user.memberId);
      }
      return false;
    },
    async jwt({ token, user, account, trigger }) {
      if (account?.provider === "google" && user?.email) {
        token.role = "admin";
        token.memberId = undefined;
        token.adminUserId = undefined;
        token.mustChangePassword = false;
      }
      if (account?.provider === "admin" && user) {
        token.role = "admin";
        token.adminUserId = user.adminUserId;
        token.mustChangePassword = Boolean(user.mustChangePassword);
      }
      if (account?.provider === "member" && user) {
        token.role = "member";
        token.memberId = user.memberId ?? Number(user.id);
      }
      if (trigger === "update" && typeof token.adminUserId === "number") {
        const admin = await getAdminUserById(token.adminUserId);
        token.mustChangePassword = admin ? admin.mustChangePassword : true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "admin" | "member" | undefined;
        session.user.memberId = token.memberId as number | undefined;
        session.user.adminUserId = token.adminUserId as number | undefined;
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }
      return session;
    },
  },
});

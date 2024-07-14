import { AuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import Credentials from "next-auth/providers/credentials";
import { pbkdf2Sync } from "pbkdf2";
import prisma from "./utils/db";

export const authOptions: AuthOptions = {
  theme: {
    buttonText: "Přihlásit se",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as unknown as number;
        token.isSuperAdmin = user.isSuperAdmin;
        token.name = user.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as unknown as number;
        session.user.isSuperAdmin = token.isSuperAdmin;
        session.user.name = token.name;
      }

      return session;
    },
  },
  providers: [
    Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: {
          label: "Uživatelské jméno",
          type: "text",
          placeholder: "pepazdepa",
        },
        password: { label: "Heslo", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)

        const res = await prisma.salePerson.findUnique({
          where: {
            deleted: false,
            name: credentials?.username,
            passwordHash: pbkdf2Sync(
              credentials.password,
              credentials.password.slice(
                0,
                Math.floor(credentials.password.length / 2)
              ),
              10000,
              64,
              "sha512"
            ).toString("hex"),
          },
        });

        return res
          ? { id: res.id, name: res.name, isSuperAdmin: res.isSuperAdmin }
          : null;
      },
    }),
  ],
};

export const handler = NextAuth(authOptions);

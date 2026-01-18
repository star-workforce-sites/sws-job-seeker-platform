import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

console.log('[v0] NextAuth config loading - checking environment variables');
console.log('[v0] GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('[v0] LINKEDIN_CLIENT_ID exists:', !!process.env.LINKEDIN_CLIENT_ID);
console.log('[v0] NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
console.log('[v0] DATABASE_URL exists:', !!process.env.DATABASE_URL);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
      issuer: 'https://www.linkedin.com',
      jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordMatch) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, ensure user has a role
      if (account?.provider !== 'credentials') {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // If user was created via OAuth and doesn't have a role, set default
        if (dbUser && !dbUser.role) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { role: 'job_seeker' },
          });
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      } else if (token.sub) {
        // Refresh role from database on each request
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Handle post-login redirects
      
      // If there's a callbackUrl parameter, use it
      const callbackUrl = new URL(url).searchParams.get('callbackUrl');
      if (callbackUrl) {
        // Ensure it's a relative URL or same origin
        if (callbackUrl.startsWith('/')) {
          return `${baseUrl}${callbackUrl}`;
        }
        if (callbackUrl.startsWith(baseUrl)) {
          return callbackUrl;
        }
      }

      // After signin, redirect based on role
      if (url.includes('/api/auth/signin') || url === baseUrl) {
        // Get user role to determine redirect
        // This will be set by the signIn callback
        return `${baseUrl}/dashboard`;
      }

      // Default: allow the redirect
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

console.log('[v0] NextAuth config successfully created');

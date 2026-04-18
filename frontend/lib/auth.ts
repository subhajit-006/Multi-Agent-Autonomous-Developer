import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { nextCookies } from 'better-auth/next-js';

const memoryDb = {
  user: [],
  session: [],
  account: [],
  verification: [],
};

export const auth = betterAuth({
  appName: 'MAAD',
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || 'dev-only-secret-change-me',
  database: memoryAdapter(memoryDb),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },
  plugins: [nextCookies()],
});

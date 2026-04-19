import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { nextCookies } from 'better-auth/next-js';

const memoryDb = {
  user: [],
  session: [],
  account: [],
  verification: [],
};

const authBaseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'http://localhost:3000';

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

const githubProvider = githubClientId && githubClientSecret
  ? {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    }
  : undefined;

export const auth = betterAuth({
  appName: 'MAAD',
  baseURL: authBaseURL,
  secret: process.env.BETTER_AUTH_SECRET || 'dev-only-secret-change-me',
  database: memoryAdapter(memoryDb),
  socialProviders: githubProvider
    ? {
        github: githubProvider,
      }
    : {},
  plugins: [nextCookies()],
});

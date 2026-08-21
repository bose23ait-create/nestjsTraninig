export const USER_ROLE = 'user';

export const USER_MESSAGES = {
  emailAlreadyExists: 'Email already exists',
  roleNotSeeded: 'The user role has not been seeded',
  invalidCredentials: 'Invalid email or password',
} as const;

export const USER_ROUTES = {
  base: 'users',
  register: 'register',
  login: 'login',
} as const;

export const AUTH_CONFIG = {
  fallbackSecret: 'mySecretKey',
  tokenExpiry: '1h',
  accessTokenKey: 'access_token',
} as const;

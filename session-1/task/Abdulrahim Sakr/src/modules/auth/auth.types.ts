/**
 * Auth-specific type definitions.
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tokens: AuthTokens;
}

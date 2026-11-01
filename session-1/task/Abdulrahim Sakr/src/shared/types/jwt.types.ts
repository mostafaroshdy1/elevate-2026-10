export interface MyJwtPayload {
  userId: number;
  userPhone: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface AuthPayload {
  userId: string;
  role: any;
}

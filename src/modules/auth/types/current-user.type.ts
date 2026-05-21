export type CurrentUserPayload = {
  sub: string;
  userId: string;
  tenantId: string;
  role: string;
  roleName: string[];
  email: string;
  iat?: number;
  exp?: number;
};

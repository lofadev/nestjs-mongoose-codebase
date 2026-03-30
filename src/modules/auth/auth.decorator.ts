import { ExecutionContext, SetMetadata, createParamDecorator } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: JwtPayload;
}

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator((data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  const user = request.user;
  return data ? user[data] : user;
});

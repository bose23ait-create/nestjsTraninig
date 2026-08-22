import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const [type, token] = authorization?.trim().split(/\s+/) ?? [];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Bearer token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<
        NonNullable<AuthenticatedRequest['user']>
      >(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

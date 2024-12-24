import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const tokenParts = authorization.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      throw new UnauthorizedException(
        'Invalid Authorization header format. Expected "Bearer <token>"',
      );
    }

    const token = tokenParts[1];

    try {
      const tokenPayload = await this.jwtService.verifyAsync(token);
      req.user = tokenPayload;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }
}

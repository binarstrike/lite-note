import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * karena guard `JwtGuard` dibuat menjadi global untuk semua controller jadi diperlukan logika
   * untuk menetapkan beberapa endpoint khusus yang dapat diakses secara public tanpa melewati guard
   * yaitu `JwtGuard`.
   */
  canActivate(ctx: ExecutionContext): Promise<boolean> | Observable<boolean> | boolean {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [ctx.getHandler(), ctx.getClass()]);

    if (isPublic) return true;

    return super.canActivate(ctx);
  }
}

import { SetMetadata } from '@nestjs/common';

/**
 * agar endpoint dapat diakses secara public perlu ditambah metadata `isPublic`
 * yang nanti akan di cek oleh global guard yaitu `JwtGuard`.
 */
export const Public = () => SetMetadata('isPublic', true);

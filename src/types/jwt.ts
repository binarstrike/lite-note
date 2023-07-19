export type JwtPayload = {
  sub: string;
};

export type JwtPayloadWithRefreshToken = JwtPayload & { refreshToken: string };

/**
 * type untuk jwt payload yang sudah tervalidasi dan berubah menjadi object lain.
 */
export type ValidatedJwtPayload = {
  id: string;
};

/**
 * type untuk jwt payload yang sudah tervalidasi dan berubah menjadi object lain dengan tambahan
 * properti refreshToken.
 */
export type ValidatedJwtPayloadWithRt = ValidatedJwtPayload & {
  refreshToken: string;
};

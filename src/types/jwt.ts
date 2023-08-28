export type JwtPayload = {
  sub: string;
};

export type ValidatedJwtPayload = {
  id: string;
};

export type ValidatedJwtPayloadWithRefreshToken = ValidatedJwtPayload & {
  refreshToken: string;
};

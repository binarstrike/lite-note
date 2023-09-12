export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const tokenName: Record<Uppercase<keyof Tokens>, keyof Tokens> = {
  ACCESSTOKEN: 'accessToken',
  REFRESHTOKEN: 'refreshToken',
};

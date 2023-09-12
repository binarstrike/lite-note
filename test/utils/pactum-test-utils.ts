import { Tokens, NoteQueryParamType } from 'src/types';

type QueryParamKeys = keyof NoteQueryParamType;

export function pactumStoresQueryParam(queryParam: QueryParamKeys): {
  [K in QueryParamKeys]: `$S{${K}}`;
} {
  switch (queryParam) {
    case 'noteId':
      return { noteId: `$S{noteId}` };
  }
  queryParam satisfies never;
}

export function pactumStoresSetQueryParam(
  queryParam: QueryParamKeys,
  value: string,
): { [K in QueryParamKeys]: string } {
  switch (queryParam) {
    case 'noteId':
      return { noteId: value };
  }
  queryParam satisfies never;
}

export function pactumStoresAuthHeader(
  authToken: keyof Tokens,
): Record<'Authorization', `Bearer $S{${keyof Tokens}}`> {
  switch (authToken) {
    case 'accessToken':
      return { Authorization: `Bearer $S{accessToken}` };
    case 'refreshToken':
      return { Authorization: `Bearer $S{refreshToken}` };
  }
  authToken satisfies never;
}

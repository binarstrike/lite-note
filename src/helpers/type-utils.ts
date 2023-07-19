/**
 * mengambil properti-properti yang dibutuhkan dan dapat secara eksplisit diberi type tertentu
 */
export type IncludePropWithType<T, U extends keyof T, V = undefined> = {
  [Z in U]: V extends undefined ? T[Z] : V;
};

/**
 * menghilangkan properti-properti yang tidak dibutuhkan dan dapat secara eksplisit diberi type tertentu
 */
export type ExcludePropWithType<T, U extends keyof T, V = undefined> = {
  [Z in Exclude<keyof T, U>]: V extends undefined ? T[Z] : V;
};

export type ExcludeProp<T, U extends keyof T> = {
  [K in keyof T as K extends U ? never : K]: T[K];
};

/**
 * @description
 * Allows an object type to say that all its properties are optional,
 * including nested objects
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

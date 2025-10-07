// Store types to avoid circular dependencies

// Define DeepPartial type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// These will be defined after store creation
export type RootState = any; // Will be overridden in index.ts
export type AppDispatch = any; // Will be overridden in index.ts

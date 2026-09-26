import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    cookies: Record<string, string | undefined>;
  }
}

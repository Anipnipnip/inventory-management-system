import rateLimit from 'express-rate-limit';

// Auth endpoints are the main brute-force target (guessing passwords),
// so they get a tighter limit than the rest of the API. 10 attempts per
// 15 minutes per IP is generous for a real user, painful for a script.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.',
  },
});

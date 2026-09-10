import jwt from 'jsonwebtoken';

// Signs a JWT that identifies a user by their Mongo _id. Anything that
// needs to know "who is making this request" later (the protect
// middleware) just verifies this token and looks the user up by id.
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

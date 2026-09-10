import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      // Excluded from query results by default so a stray `User.find()`
      // never accidentally leaks password hashes to a response.
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'staff'],
      default: 'staff',
    },
    // Soft-delete flag. Deactivated users are hidden from normal queries
    // and blocked at login, instead of deleting the document outright
    // (their id may still be referenced by past stock transactions).
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Runs automatically before a User document is saved. Only re-hashes the
// password when it was actually set/changed, so updating e.g. just the
// name doesn't re-hash an already-hashed password.
//
// Note: Mongoose 9 removed the callback-style `next()` parameter for pre
// hooks -- an async function (or one returning a Promise) is enough, and
// Mongoose waits for it to settle before continuing.
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: compares a plain-text candidate password against this
// user's stored hash. Kept on the model so controllers never handle
// bcrypt directly -- they just call user.comparePassword(...).
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Defense in depth: `select: false` only hides the password on queries
// (find/findOne). A freshly created/saved document still holds it in
// memory, so without this transform a response like `res.json({ user })`
// right after User.create(...) would leak the hash. This guarantees it
// never appears in any JSON response, no matter which controller sends it.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;

// One-off script to create the first admin account. Run manually from
// the terminal (`node src/utils/seedAdmin.js`) -- there is no HTTP route
// for this, on purpose. Public registration always creates "staff"
// accounts (see authController.js), so this is the only way to get an
// initial admin into the system. Once it exists, that admin can promote
// other users via PATCH /api/users/:id/role.
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const run = async () => {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Admin';

  if (!email || !password) {
    console.log('Usage: node src/utils/seedAdmin.js <email> <password> [name]');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    existing.isActive = true;
    await existing.save();
    console.log(`Existing user ${email} promoted to admin.`);
  } else {
    await User.create({ name, email, password, role: 'admin' });
    console.log(`Admin account created for ${email}.`);
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Failed to seed admin:', err.message);
  process.exit(1);
});

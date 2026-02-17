require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();
  const email = process.env.SUPERADMIN_EMAIL || 'admin@todo.com';
  const password = process.env.SUPERADMIN_PASSWORD || 'Admin@123';
  const name = process.env.SUPERADMIN_NAME || 'Super Admin';
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email, password, role: 'superadmin' });
  } else {
    if (user.role !== 'superadmin') {
      user.role = 'superadmin';
      await user.save();
    }
  }
  process.exit(0);
};

run().catch((e) => {
  process.exit(1);
});

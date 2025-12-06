#!/usr/bin/env node
require('dotenv').config();

const repl = require('repl');
const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/neurowell';

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log('Connected to MongoDB:', MONGO_URL);

  const User = require('./models/User');

  const r = repl.start({ prompt: 'neurowell> ', useColors: true });
  r.context.mongoose = mongoose;
  r.context.db = mongoose.connection;
  r.context.User = User;
  r.context.bcrypt = require('bcrypt');

  console.log('Available in REPL: User, mongoose, db, bcrypt');
  console.log('Examples: await User.find().limit(5)');
}

main().catch(err => {
  console.error('Failed to start console:', err);
  process.exit(1);
});

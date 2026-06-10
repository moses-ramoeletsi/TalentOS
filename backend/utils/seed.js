// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// require('dotenv').config({ path: '../.env' });

// const User = require('../models/User');
// const Job  = require('../models/Job');

// const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hr_recruitment';

// async function seed() {
//   await mongoose.connect(MONGO_URI);
//   console.log('Connected to MongoDB');

//   // Clear existing
//   await User.deleteMany({});
//   await Job.deleteMany({});

//   // Create admin
//   const admin = await User.create({
//     name: 'Sarah Chen',
//     email: 'admin@talentos.com',
//     password: 'Admin@123',
//     role: 'admin',
//   });

//   // Create HR Manager
//   await User.create({
//     name: 'James Miller',
//     email: 'hr@talentos.com',
//     password: 'Hr@12345',
//     role: 'hr_manager',
//   });

//   // Create candidate accounts
//   await User.create([
//     { name: 'Alex Johnson',  email: 'alex@gmail.com',    password: 'Test@123', role: 'candidate' },
//     { name: 'Maria Santos',  email: 'maria@email.com',   password: 'Test@123', role: 'candidate' },
//     { name: 'Priya Sharma',  email: 'priya@gmail.com',   password: 'Test@123', role: 'candidate' },
//     { name: 'Aisha Diallo',  email: 'aisha@tech.com',    password: 'Test@123', role: 'candidate' },
//   ]);

//   // Create jobs
//   await Job.create([
//     {
//       title: 'Senior React Developer',
//       department: 'Engineering',
//       description: 'Build next-gen web applications using React ecosystem. Work with a high-performing team to deliver world-class user experiences.',
//       requirements: '5+ years React, strong TypeScript, experience with Node.js backends.',
//       location: 'Remote',
//       salary: '$90k - $120k',
//       deadline: new Date('2025-06-30'),
//       skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
//       experience: 4,
//       qualification: 'Bachelor',
//       status: 'active',
//       postedBy: admin._id,
//     },
//     {
//       title: 'Product Manager',
//       department: 'Product',
//       description: 'Drive product strategy, roadmap, and cross-functional execution to deliver exceptional user value.',
//       requirements: 'Proven PM experience, strong analytical and stakeholder management skills.',
//       location: 'New York',
//       salary: '$100k - $130k',
//       deadline: new Date('2025-06-15'),
//       skills: ['Agile', 'JIRA', 'Roadmapping', 'Stakeholder Management'],
//       experience: 5,
//       qualification: 'Master',
//       status: 'active',
//       postedBy: admin._id,
//     },
//     {
//       title: 'Data Scientist',
//       department: 'Analytics',
//       description: 'Build and deploy ML models to generate business insights from large-scale datasets.',
//       requirements: 'Strong Python, ML frameworks, statistics background.',
//       location: 'San Francisco',
//       salary: '$95k - $125k',
//       deadline: new Date('2025-07-01'),
//       skills: ['Python', 'TensorFlow', 'SQL', 'Statistics'],
//       experience: 3,
//       qualification: 'Master',
//       status: 'active',
//       postedBy: admin._id,
//     },
//     {
//       title: 'UX Designer',
//       department: 'Design',
//       description: 'Create beautiful, user-centred experiences across our web and mobile platforms.',
//       requirements: 'Strong Figma skills, user research experience, excellent portfolio.',
//       location: 'Remote',
//       salary: '$70k - $90k',
//       deadline: new Date('2025-05-30'),
//       skills: ['Figma', 'User Research', 'Prototyping', 'CSS'],
//       experience: 2,
//       qualification: 'Bachelor',
//       status: 'active',
//       postedBy: admin._id,
//     },
//   ]);

//   console.log('✅ Seed complete!');
//   console.log('');
//   console.log('Login credentials:');
//   console.log('  Admin:      admin@talentos.com  / Admin@123');
//   console.log('  HR Manager: hr@talentos.com     / Hr@12345');
//   console.log('  Candidate:  alex@gmail.com      / Test@123');
//   process.exit(0);
// }

// seed().catch((err) => { console.error(err); process.exit(1); });
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found. Make sure you run this from the backend/ folder.');
  process.exit(1);
}

// ── Inline User schema (avoids any import issues) ─────────────
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'hr_manager', 'candidate'], default: 'candidate' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seed() {
  console.log('\n🔌 Connecting to MongoDB...');
  console.log('URI:', MONGO_URI.replace(/:([^@]+)@/, ':****@')); // hide password in log

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // ── Show which database we are in ──────────────────────────
  console.log('📦 Database:', mongoose.connection.db.databaseName);

  // ── Clear existing users ───────────────────────────────────
  const deleted = await User.deleteMany({});
  console.log(`🗑️  Cleared ${deleted.deletedCount} existing users\n`);

  // ── Create users with manually hashed passwords ────────────
  const users = [
    { name: 'Sarah Chen',    email: 'admin@talentos.com', password: 'Admin@123',  role: 'admin'       },
    { name: 'James Miller',  email: 'hr@talentos.com',    password: 'Hr@12345',   role: 'hr_manager'  },
    { name: 'Alex Johnson',  email: 'alex@gmail.com',     password: 'Test@123',   role: 'candidate'   },
  ];

  console.log('👤 Creating users...');

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 12);
    const created = await User.create({ ...u, password: hashed });
    console.log(`   ✅ ${created.role.padEnd(12)} | ${created.email.padEnd(30)} | password: ${u.password}`);
  }

  // ── Verify passwords work ──────────────────────────────────
  console.log('\n🔍 Verifying passwords...');
  for (const u of users) {
    const found = await User.findOne({ email: u.email }).select('+password');
    const match = await bcrypt.compare(u.password, found.password);
    console.log(`   ${match ? '✅' : '❌'} ${u.email} — password check: ${match ? 'PASS' : 'FAIL'}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seed complete! Login with:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Admin:      admin@talentos.com  /  Admin@123');
  console.log('  HR Manager: hr@talentos.com     /  Hr@12345');
  console.log('  Candidate:  alex@gmail.com      /  Test@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
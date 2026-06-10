// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const signToken = (id) =>
//   jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// // POST /api/auth/register
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ success: false, message: 'Email already registered.' });

//     // Only allow candidate self-registration; admin/hr_manager created by existing admin
//     const allowedRole = ['admin', 'hr_manager'].includes(role) ? 'candidate' : (role || 'candidate');

//     const user = await User.create({ name, email, password, role: allowedRole });
//     const token = signToken(user._id);

//     res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // POST /api/auth/login
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ success: false, message: 'Please provide email and password.' });

//     const user = await User.findOne({ email }).select('+password');
//     if (!user || !(await user.comparePassword(password)))
//       return res.status(401).json({ success: false, message: 'Invalid credentials.' });

//     if (!user.isActive)
//       return res.status(403).json({ success: false, message: 'Account has been deactivated.' });

//     const token = signToken(user._id);
//     res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // GET /api/auth/me
// exports.getMe = async (req, res) => {
//   res.json({ success: true, user: req.user });
// };

// // POST /api/auth/create-staff  (admin only — creates hr_manager accounts)
// exports.createStaff = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     if (!['hr_manager', 'admin'].includes(role))
//       return res.status(400).json({ success: false, message: 'Invalid staff role.' });

//     const user = await User.create({ name, email, password, role });
//     res.status(201).json({ success: true, user: { id: user._id, name, email, role } });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(400).json({ success: false, message: 'Email already registered.' });

    // Candidates only can self-register
    const safeRole = ['admin', 'hr_manager'].includes(role) ? 'candidate' : (role || 'candidate');

    const user = await User.create({ name, email, password, role: safeRole });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });

    // Must use .select('+password') because password has select:false in schema
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      console.log(`Login failed: no user found for email "${email}"`);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Login failed: wrong password for "${email}"`);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account has been deactivated.' });

    const token = signToken(user._id);
    console.log(`✅ Login success: ${user.email} (${user.role})`);

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// POST /api/auth/create-staff  (admin only)
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!['hr_manager', 'admin'].includes(role))
      return res.status(400).json({ success: false, message: 'Role must be hr_manager or admin.' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(400).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      success: true,
      user: { id: user._id, name, email, role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
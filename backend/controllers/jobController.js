const Job = require('../models/Job');

// GET /api/jobs — public list
exports.getJobs = async (req, res) => {
  try {
    const { status, department, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const jobs = await Job.find(filter).populate('postedBy', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/jobs/:id
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/jobs — admin/hr_manager
exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    res.json({ success: true, message: 'Job deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

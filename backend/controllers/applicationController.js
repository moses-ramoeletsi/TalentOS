const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { extractText, parseCV, scoreCandidate } = require('../utils/cvParser');
const { sendEmail, applicationReceived, shortlistedEmail, rejectedEmail } = require('../utils/email');
const fs = require('fs');
const path = require('path');

// POST /api/applications — candidate applies
exports.applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Check job exists and is active
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    if (job.status !== 'active') return res.status(400).json({ success: false, message: 'This job is no longer accepting applications.' });

    // Check duplicate
    const existing = await Application.findOne({ userId: req.user._id, jobId });
    if (existing) return res.status(400).json({ success: false, message: 'You have already applied for this job.' });

    // Parse CV if uploaded
    let parsedData = {};
    let score = 0, matchedSkills = [], missingSkills = [], scoreBreakdown = {};

    if (req.file) {
      const filePath = req.file.path;
      const rawText = await extractText(filePath);
      parsedData = parseCV(rawText);
      const ranking = scoreCandidate(parsedData, job);
      score = ranking.score;
      matchedSkills = ranking.matchedSkills;
      missingSkills = ranking.missingSkills;
      scoreBreakdown = ranking.scoreBreakdown;
    }

    const application = await Application.create({
      userId: req.user._id,
      jobId,
      cvFile: req.file?.filename || null,
      cvOriginalName: req.file?.originalname || null,
      parsedData,
      score,
      matchedSkills,
      missingSkills,
      scoreBreakdown,
      coverLetter,
    });

    // Increment job applicant count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    // Send confirmation email
    try {
      const tmpl = applicationReceived(req.user.name, job.title);
      await sendEmail({ to: req.user.email, ...tmpl });
    } catch (e) { console.warn('Email send failed:', e.message); }

    res.status(201).json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/applications — HR: all; candidate: own
exports.getApplications = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'candidate') filter.userId = req.user._id;

    // Optional filters
    const { status, jobId, minScore } = req.query;
    if (status) filter.status = status;
    if (jobId) filter.jobId = jobId;
    if (minScore) filter.score = { $gte: Number(minScore) };

    const apps = await Application.find(filter)
      .populate('userId', 'name email phone')
      .populate('jobId', 'title department location skills experience qualification')
      .sort({ score: -1, createdAt: -1 });

    res.json({ success: true, count: apps.length, applications: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/applications/:id
exports.getApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('jobId');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });

    // Candidates can only see their own
    if (req.user.role === 'candidate' && String(app.userId._id) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not authorised.' });

    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/applications/:id/status — HR only
exports.updateStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const app = await Application.findById(req.params.id).populate('userId', 'name email').populate('jobId', 'title');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });

    app.status = status;
    if (notes) app.notes = notes;
    await app.save();

    // Send email notification
    try {
      let tmpl;
      if (status === 'shortlisted') tmpl = shortlistedEmail(app.userId.name, app.jobId.title);
      if (status === 'rejected')   tmpl = rejectedEmail(app.userId.name, app.jobId.title);
      if (tmpl) await sendEmail({ to: app.userId.email, ...tmpl });
    } catch (e) { console.warn('Email send failed:', e.message); }

    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/applications/job/:jobId/ranked — HR: ranked list for a job
exports.getRankedCandidates = async (req, res) => {
  try {
    const apps = await Application.find({ jobId: req.params.jobId })
      .populate('userId', 'name email phone')
      .populate('jobId', 'title skills experience qualification')
      .sort({ score: -1 });

    res.json({ success: true, count: apps.length, applications: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/applications/:id/cv — stream CV file
exports.downloadCV = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app || !app.cvFile) return res.status(404).json({ success: false, message: 'CV not found.' });

    const filePath = path.join(__dirname, '../uploads', app.cvFile);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found on server.' });

    res.download(filePath, app.cvOriginalName || app.cvFile);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

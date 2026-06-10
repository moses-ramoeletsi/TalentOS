const Interview = require('../models/Interview');
const Application = require('../models/Application');
const User = require('../models/User');
const { sendEmail, interviewInvitation } = require('../utils/email');

// POST /api/interviews — schedule interview
exports.scheduleInterview = async (req, res) => {
  try {
    const { applicationId, date, time, type, meetingLink, location, notes } = req.body;

    const app = await Application.findById(applicationId)
      .populate('userId', 'name email')
      .populate('jobId', 'title');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });

    const interview = await Interview.create({
      applicationId,
      candidateId: app.userId._id,
      jobId: app.jobId._id,
      scheduledBy: req.user._id,
      date, time, type, meetingLink, location, notes,
      status: 'confirmed',
    });

    // Update application status
    await Application.findByIdAndUpdate(applicationId, { status: 'interview_scheduled' });

    // Send email invitation
    try {
      const tmpl = interviewInvitation(app.userId.name, app.jobId.title, { date, time, type, meetingLink, location });
      await sendEmail({ to: app.userId.email, ...tmpl });
    } catch (e) { console.warn('Email failed:', e.message); }

    res.status(201).json({ success: true, interview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/interviews
exports.getInterviews = async (req, res) => {
  try {
    const filter = req.user.role === 'candidate' ? { candidateId: req.user._id } : {};
    const interviews = await Interview.find(filter)
      .populate('candidateId', 'name email')
      .populate('jobId', 'title department')
      .populate('scheduledBy', 'name')
      .sort({ date: 1 });
    res.json({ success: true, count: interviews.length, interviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/interviews/:id
exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidateId', 'name email phone')
      .populate('jobId')
      .populate('scheduledBy', 'name');
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found.' });
    res.json({ success: true, interview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/interviews/:id
exports.updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found.' });
    res.json({ success: true, interview });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/interviews/:id
exports.deleteInterview = async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Interview cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

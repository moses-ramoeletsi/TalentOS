const Application = require('../models/Application');
const Job = require('../models/Job');
const Interview = require('../models/Interview');
const User = require('../models/User');

// GET /api/analytics/overview
exports.getOverview = async (req, res) => {
  try {
    const [
      totalApplicants,
      shortlisted,
      rejected,
      selected,
      scheduledInterviews,
      activeJobs,
      totalJobs,
      totalCandidates,
    ] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: 'shortlisted' }),
      Application.countDocuments({ status: 'rejected' }),
      Application.countDocuments({ status: 'selected' }),
      Interview.countDocuments({ status: 'confirmed' }),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments(),
      User.countDocuments({ role: 'candidate' }),
    ]);

    const avgScoreResult = await Application.aggregate([{ $group: { _id: null, avg: { $avg: '$score' } } }]);
    const avgScore = avgScoreResult[0] ? Math.round(avgScoreResult[0].avg) : 0;

    res.json({
      success: true,
      data: { totalApplicants, shortlisted, rejected, selected, scheduledInterviews, activeJobs, totalJobs, totalCandidates, avgScore },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/applications-per-month
exports.getApplicationsPerMonth = async (req, res) => {
  try {
    const data = await Application.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/job-demand
exports.getJobDemand = async (req, res) => {
  try {
    const data = await Application.aggregate([
      { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' } },
      { $unwind: '$job' },
      { $group: { _id: '$job.department', count: { $sum: 1 }, avgScore: { $avg: '$score' } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/pipeline
exports.getPipeline = async (req, res) => {
  try {
    const data = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/score-distribution
exports.getScoreDistribution = async (req, res) => {
  try {
    const buckets = await Application.aggregate([
      {
        $bucket: {
          groupBy: '$score',
          boundaries: [0, 25, 50, 65, 80, 90, 101],
          default: 'Other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);
    res.json({ success: true, data: buckets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

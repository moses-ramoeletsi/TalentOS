const express = require('express');
const router = express.Router();
const {
  getOverview,
  getApplicationsPerMonth,
  getJobDemand,
  getPipeline,
  getScoreDistribution,
} = require('../controllers/analyticsController');
const { protect, authorise } = require('../middleware/auth');

const hrOnly = [protect, authorise('admin', 'hr_manager')];

router.get('/overview',              ...hrOnly, getOverview);
router.get('/applications-per-month',...hrOnly, getApplicationsPerMonth);
router.get('/job-demand',            ...hrOnly, getJobDemand);
router.get('/pipeline',              ...hrOnly, getPipeline);
router.get('/score-distribution',    ...hrOnly, getScoreDistribution);

module.exports = router;

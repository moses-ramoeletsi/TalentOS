const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getApplications,
  getApplication,
  updateStatus,
  getRankedCandidates,
  downloadCV,
} = require('../controllers/applicationController');
const { protect, authorise } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/',                                protect, authorise('candidate'), upload.single('cv'), applyForJob);
router.get('/',                                 protect, getApplications);
router.get('/job/:jobId/ranked',               protect, authorise('admin', 'hr_manager'), getRankedCandidates);
router.get('/:id',                             protect, getApplication);
router.patch('/:id/status',                    protect, authorise('admin', 'hr_manager'), updateStatus);
router.get('/:id/cv',                          protect, downloadCV);

module.exports = router;

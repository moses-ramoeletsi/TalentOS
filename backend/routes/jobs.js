const express = require('express');
const router = express.Router();
const { getJobs, getJob, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, authorise } = require('../middleware/auth');

router.get('/',      getJobs);
router.get('/:id',  getJob);
router.post('/',    protect, authorise('admin', 'hr_manager'), createJob);
router.put('/:id',  protect, authorise('admin', 'hr_manager'), updateJob);
router.delete('/:id', protect, authorise('admin'), deleteJob);

module.exports = router;

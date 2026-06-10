const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getInterviews,
  getInterview,
  updateInterview,
  deleteInterview,
} = require('../controllers/interviewController');
const { protect, authorise } = require('../middleware/auth');

router.post('/',     protect, authorise('admin', 'hr_manager'), scheduleInterview);
router.get('/',      protect, getInterviews);
router.get('/:id',   protect, getInterview);
router.patch('/:id', protect, authorise('admin', 'hr_manager'), updateInterview);
router.delete('/:id',protect, authorise('admin', 'hr_manager'), deleteInterview);

module.exports = router;

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Job',  required: true },

    // CV
    cvFile:       { type: String },                        // stored filename
    cvOriginalName: { type: String },

    // Parsed from CV
    parsedData: {
      fullName:   { type: String },
      email:      { type: String },
      phone:      { type: String },
      skills:     [{ type: String }],
      education:  [{ type: String }],
      experience: [{ type: String }],
      rawText:    { type: String },
    },

    // AI Ranking
    score:         { type: Number, default: 0 },           // 0-100
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    scoreBreakdown: {
      skillsScore:    { type: Number, default: 0 },
      expScore:       { type: Number, default: 0 },
      qualScore:      { type: Number, default: 0 },
    },

    // Pipeline status
    status: {
      type: String,
      enum: ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'],
      default: 'applied',
    },

    coverLetter: { type: String },
    notes:       { type: String },                         // HR internal notes
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

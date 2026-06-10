const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    candidateId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Job',  required: true },
    scheduledBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    date:     { type: Date, required: true },
    time:     { type: String, required: true },
    type:     { type: String, enum: ['online', 'physical'], default: 'online' },
    status:   { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },

    // Online interview
    meetingLink: { type: String },

    // Physical interview
    location:    { type: String },

    notes:    { type: String },
    feedback: { type: String },
    rating:   { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);

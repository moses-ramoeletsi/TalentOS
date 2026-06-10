const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title:         { type: String, required: true, trim: true },
    department:    { type: String, required: true },
    description:   { type: String, required: true },
    requirements:  { type: String },
    location:      { type: String, default: 'Remote' },
    salary:        { type: String },
    deadline:      { type: Date, required: true },
    skills:        [{ type: String }],
    experience:    { type: Number, default: 0 },           // min years
    qualification: { type: String, enum: ['Any', 'Bachelor', 'Master', 'PhD'], default: 'Any' },
    status:        { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
    postedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    applicantCount:{ type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);

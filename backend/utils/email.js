const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Send any email ───────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
  return info;
}

// ── Templates ────────────────────────────────────────────────

function applicationReceived(candidateName, jobTitle) {
  return {
    subject: `Application Received — ${jobTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1B4FD8">TalentOS Recruitment</h2>
        <p>Dear <strong>${candidateName}</strong>,</p>
        <p>Thank you for applying for the <strong>${jobTitle}</strong> position. We have received your application and our team will review it shortly.</p>
        <p>You can track your application status by logging into your candidate portal.</p>
        <br><p>Best regards,<br><strong>HR Team</strong></p>
      </div>`,
  };
}

function shortlistedEmail(candidateName, jobTitle) {
  return {
    subject: `You've been Shortlisted — ${jobTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#059669">🎉 Congratulations!</h2>
        <p>Dear <strong>${candidateName}</strong>,</p>
        <p>We are pleased to inform you that you have been <strong>shortlisted</strong> for the <strong>${jobTitle}</strong> position.</p>
        <p>Our team will reach out soon to schedule your interview. Stay tuned!</p>
        <br><p>Best regards,<br><strong>HR Team</strong></p>
      </div>`,
  };
}

function rejectedEmail(candidateName, jobTitle) {
  return {
    subject: `Application Update — ${jobTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1B4FD8">TalentOS Recruitment</h2>
        <p>Dear <strong>${candidateName}</strong>,</p>
        <p>Thank you for your interest in the <strong>${jobTitle}</strong> position.</p>
        <p>After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current requirements.</p>
        <p>We encourage you to apply for future openings that match your profile.</p>
        <br><p>Best regards,<br><strong>HR Team</strong></p>
      </div>`,
  };
}

function interviewInvitation(candidateName, jobTitle, interview) {
  const dateStr = new Date(interview.date).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  return {
    subject: `Interview Invitation — ${jobTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1B4FD8">Interview Invitation</h2>
        <p>Dear <strong>${candidateName}</strong>,</p>
        <p>We are pleased to invite you for an interview for the <strong>${jobTitle}</strong> position.</p>
        <table style="border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:6px 12px;font-weight:bold;color:#374151">Date:</td><td style="padding:6px 12px">${dateStr}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;color:#374151">Time:</td><td style="padding:6px 12px">${interview.time}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;color:#374151">Type:</td><td style="padding:6px 12px">${interview.type === 'online' ? '🌐 Online' : '🏢 In-Person'}</td></tr>
          ${interview.meetingLink ? `<tr><td style="padding:6px 12px;font-weight:bold;color:#374151">Link:</td><td style="padding:6px 12px"><a href="${interview.meetingLink}">${interview.meetingLink}</a></td></tr>` : ''}
          ${interview.location ? `<tr><td style="padding:6px 12px;font-weight:bold;color:#374151">Location:</td><td style="padding:6px 12px">${interview.location}</td></tr>` : ''}
        </table>
        <p>Please reply to confirm your attendance. We look forward to speaking with you!</p>
        <br><p>Best regards,<br><strong>HR Team, TalentOS</strong></p>
      </div>`,
  };
}

module.exports = { sendEmail, applicationReceived, shortlistedEmail, rejectedEmail, interviewInvitation };

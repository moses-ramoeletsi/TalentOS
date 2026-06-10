import React, { useEffect, useState } from 'react';
import { interviewsAPI, applicationsAPI } from '../services/api';
import { StatusBadge, Spinner, Alert } from '../components/UI';

export default function Interviews() {
  const [interviews, setInterviews]   = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [msg, setMsg]   = useState({ type: '', text: '' });
  const [form, setForm] = useState({ applicationId: '', date: '', time: '', type: 'online', meetingLink: '', location: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [intRes, appRes] = await Promise.all([
      interviewsAPI.getAll(),
      applicationsAPI.getAll({ status: 'shortlisted' }),
    ]);
    setInterviews(intRes.data.interviews);
    setShortlisted(appRes.data.applications);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!form.applicationId || !form.date || !form.time) {
      setMsg({ type: 'error', text: 'Please fill all required fields.' }); return;
    }
    setSaving(true);
    try {
      await interviewsAPI.schedule(form);
      setMsg({ type: 'success', text: '✓ Interview scheduled! Email invitation sent.' });
      setForm({ applicationId: '', date: '', time: '', type: 'online', meetingLink: '', location: '', notes: '' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to schedule.' });
    } finally { setSaving(false); }
  };

  const cancelInterview = async (id) => {
    await interviewsAPI.delete(id);
    setInterviews((prev) => prev.filter((i) => i._id !== id));
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:48 }}><Spinner size={32} /></div>;

  return (
    <div className="page-fade">
      {msg.text && <Alert type={msg.type}>{msg.text}</Alert>}

      <div className="grid-2">
        {/* Scheduled Interviews */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Scheduled Interviews ({interviews.length})</div>
          {interviews.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gray400)', fontSize: 13 }}>No interviews scheduled yet.</div>
          )}
          {interviews.map((iv) => {
            const d = new Date(iv.date);
            return (
              <div key={iv._id} className="interview-card">
                <div className="date-box">
                  <div className="date-day">{d.getDate()}</div>
                  <div className="date-mon">{d.toLocaleString('en', { month: 'short' })}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{iv.candidateId?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray500)' }}>{iv.jobId?.title}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`badge ${iv.type === 'online' ? 'badge-blue' : 'badge-purple'}`}>{iv.type}</span>
                    <StatusBadge status={iv.status} />
                    <span style={{ fontSize: 11, color: 'var(--gray400)' }}>⏰ {iv.time}</span>
                  </div>
                  {iv.type === 'online' && iv.meetingLink && (
                    <div style={{ fontSize: 11, color: 'var(--brand)', marginTop: 4 }}>🔗 {iv.meetingLink}</div>
                  )}
                  {iv.type === 'physical' && iv.location && (
                    <div style={{ fontSize: 11, color: 'var(--gray500)', marginTop: 4 }}>📍 {iv.location}</div>
                  )}
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => cancelInterview(iv._id)} title="Cancel interview">✗</button>
              </div>
            );
          })}
        </div>

        {/* Schedule New */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Schedule New Interview</div>
          <form onSubmit={handleSchedule}>
            <div className="form-group">
              <label className="form-label">Candidate *</label>
              <select className="form-select" value={form.applicationId} onChange={(e) => set('applicationId', e.target.value)} required>
                <option value="">-- Select shortlisted candidate --</option>
                {shortlisted.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.userId?.name} → {a.jobId?.title}
                  </option>
                ))}
              </select>
              {shortlisted.length === 0 && (
                <div style={{ fontSize: 11, color: 'var(--warning)', marginTop: 4 }}>No shortlisted candidates. Shortlist candidates first.</div>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-input" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Time *</label>
                <input className="form-input" type="time" value={form.time} onChange={(e) => set('time', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Interview Type</label>
              <select className="form-select" value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option value="online">🌐 Online</option>
                <option value="physical">🏢 Physical / In-Person</option>
              </select>
            </div>
            {form.type === 'online' && (
              <div className="form-group">
                <label className="form-label">Meeting Link</label>
                <input className="form-input" placeholder="e.g. meet.google.com/abc-xyz" value={form.meetingLink} onChange={(e) => set('meetingLink', e.target.value)} />
              </div>
            )}
            {form.type === 'physical' && (
              <div className="form-group">
                <label className="form-label">Office / Location</label>
                <input className="form-input" placeholder="e.g. 123 Main St, New York" value={form.location} onChange={(e) => set('location', e.target.value)} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-textarea" rows={2} placeholder="Any notes for the interviewer..." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
              {saving ? 'Scheduling...' : '📅 Schedule & Send Email Invite'}
            </button>
          </form>
        </div>
      </div>

      {/* Email preview */}
      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>📧 Email Invitation Template Preview</div>
        <div style={{ background: 'var(--gray50)', border: '1px solid var(--gray200)', borderRadius: 8, padding: 20, fontSize: 13, lineHeight: 1.8, color: 'var(--gray700)' }}>
          <div style={{ fontWeight: 600, color: 'var(--gray900)', marginBottom: 8 }}>Subject: Interview Invitation — [Job Title] at TalentOS</div>
          <div style={{ borderTop: '1px solid var(--gray200)', paddingTop: 12 }}>
            Dear <strong>[Candidate Name]</strong>,<br /><br />
            We are pleased to invite you for an interview for the <strong>[Job Title]</strong> position at TalentOS.<br /><br />
            <strong>Interview Details:</strong><br />
            📅 Date: [Date]<br />
            ⏰ Time: [Time]<br />
            📍 Type: [Online / Physical]<br />
            🔗 Link / Location: [Meeting Link or Address]<br /><br />
            Please reply to confirm your availability. We look forward to speaking with you.<br /><br />
            Best regards,<br />
            <strong>HR Team, TalentOS</strong>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--gray400)' }}>
          ✉️ Emails are sent automatically via Nodemailer when you schedule an interview.
        </div>
      </div>
    </div>
  );
}

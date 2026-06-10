import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsAPI, jobsAPI } from '../services/api';
import { StatusBadge, ScoreBar, Avatar, Spinner, EmptyState } from '../components/UI';

const STATUSES = ['all','applied','under_review','shortlisted','interview_scheduled','selected','rejected'];

export default function Applicants() {
  const navigate = useNavigate();
  const [apps, setApps]       = useState([]);
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status:'all', jobId:'all', minScore:'' });

  const load = async () => {
    setLoading(true);
    const params = {};
    if (filters.status  !== 'all') params.status   = filters.status;
    if (filters.jobId   !== 'all') params.jobId     = filters.jobId;
    if (filters.minScore)          params.minScore  = filters.minScore;
    const [appsRes, jobsRes] = await Promise.all([applicationsAPI.getAll(params), jobsAPI.getAll()]);
    setApps(appsRes.data.applications);
    setJobs(jobsRes.data.jobs);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters]);

  const updateStatus = async (id, status) => {
    await applicationsAPI.updateStatus(id, { status });
    load();
  };

  return (
    <div className="page-fade">
      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <select className="form-select" style={{ width:'auto' }} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          {STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace(/_/g,' ')}</option>)}
        </select>
        <select className="form-select" style={{ width:'auto' }} value={filters.jobId} onChange={(e) => setFilters({ ...filters, jobId: e.target.value })}>
          <option value="all">All Jobs</option>
          {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
        </select>
        <input className="form-input" style={{ width:160 }} type="number" placeholder="Min score %" min={0} max={100} value={filters.minScore} onChange={(e) => setFilters({ ...filters, minScore: e.target.value })} />
        <span style={{ fontSize:12, color:'var(--gray400)', marginLeft:'auto' }}>{apps.length} candidates</span>
      </div>

      {loading && <div style={{ display:'flex', justifyContent:'center', padding:48 }}><Spinner size={32} /></div>}
      {!loading && apps.length === 0 && <EmptyState icon="👥" title="No applicants found" subtitle="Adjust your filters to see more." />}

      {!loading && apps.length > 0 && (
        <div className="card" style={{ padding:0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Applied For</th>
                  <th>AI Score</th>
                  <th>Matched Skills</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Avatar name={app.userId?.name} size={34} />
                        <div>
                          <div style={{ fontWeight:500 }}>{app.userId?.name}</div>
                          <div style={{ fontSize:11, color:'var(--gray400)' }}>{app.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:12 }}>{app.jobId?.title}</td>
                    <td><ScoreBar score={app.score} /></td>
                    <td>
                      <div style={{ maxWidth:180 }}>
                        {app.matchedSkills?.slice(0,3).map((s) => <span key={s} className="tag tag-match">{s}</span>)}
                        {app.missingSkills?.length > 0 && <span className="tag tag-miss">-{app.missingSkills.length}</span>}
                      </div>
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                    <td style={{ fontSize:12, color:'var(--gray500)' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/applicants/${app._id}`)}>Profile</button>
                        {['applied','under_review'].includes(app.status) && (
                          <button className="btn btn-success btn-sm" onClick={() => updateStatus(app._id,'shortlisted')}>✓ Shortlist</button>
                        )}
                        {app.status === 'shortlisted' && (
                          <button className="btn btn-primary btn-sm" onClick={() => navigate('/interviews')}>Schedule</button>
                        )}
                        {!['rejected','selected'].includes(app.status) && (
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(app._id,'rejected')}>✗</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

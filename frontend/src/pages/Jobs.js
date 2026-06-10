import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, Spinner, EmptyState } from '../components/UI';

export default function Jobs() {
  const { isHR } = useAuth();
  const navigate  = useNavigate();
  const [jobs, setJobs]       = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsAPI.getAll({ status: 'active' }).then((r) => setJobs(r.data.jobs)).finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.department.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:48 }}><Spinner size={32} /></div>;

  return (
    <div className="page-fade">
      <div style={{ display:'flex', gap:12, marginBottom:20, alignItems:'center' }}>
        <input
          className="form-input"
          style={{ maxWidth: 320 }}
          placeholder="🔍  Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span style={{ color:'var(--gray400)', fontSize:12 }}>{filtered.length} vacancies</span>
        {isHR && <button className="btn btn-primary btn-sm" style={{ marginLeft:'auto' }} onClick={() => navigate('/post-job')}>+ Post Job</button>}
      </div>

      {filtered.length === 0 && <EmptyState icon="💼" title="No jobs found" subtitle="Try adjusting your search." />}

      <div className="grid-2">
        {filtered.map((job) => (
          <div key={job._id} className="card" style={{ cursor:'pointer' }} onClick={() => navigate(isHR ? `/jobs/${job._id}` : `/jobs/${job._id}/apply`)}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <div style={{ fontWeight:600, fontSize:15, color:'var(--gray900)' }}>{job.title}</div>
                <div style={{ fontSize:12, color:'var(--gray500)', marginTop:2 }}>{job.department} · {job.location}</div>
              </div>
              <StatusBadge status={job.status} />
            </div>
            <p style={{ fontSize:12, color:'var(--gray600)', lineHeight:1.6, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{job.description}</p>
            <div style={{ marginBottom:12 }}>{job.skills?.map((s) => <span key={s} className="tag">{s}</span>)}</div>
            <div style={{ display:'flex', gap:16, paddingTop:12, borderTop:'1px solid var(--gray100)', fontSize:12, color:'var(--gray500)' }}>
              <span>👥 {job.applicantCount || 0} applicants</span>
              {job.salary && <span>💰 {job.salary}</span>}
              <span>📅 {new Date(job.deadline).toLocaleDateString()}</span>
              <span>⭐ {job.experience}y exp</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

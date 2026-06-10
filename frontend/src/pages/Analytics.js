import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { analyticsAPI } from '../services/api';
import { Spinner } from '../components/UI';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const chartDefaults = {
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6B7280', font: { size: 11 } } },
    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6B7280', font: { size: 11 } } },
  },
  maintainAspectRatio: false,
};

export default function Analytics() {
  const [overview, setOverview]     = useState(null);
  const [monthly, setMonthly]       = useState([]);
  const [demand, setDemand]         = useState([]);
  const [pipeline, setPipeline]     = useState([]);
  const [scoreDist, setScoreDist]   = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getOverview(),
      analyticsAPI.getMonthlyApps(),
      analyticsAPI.getJobDemand(),
      analyticsAPI.getPipeline(),
      analyticsAPI.getScoreDist(),
    ]).then(([ov, mo, dem, pip, sc]) => {
      setOverview(ov.data.data);
      setMonthly(mo.data.data);
      setDemand(dem.data.data);
      setPipeline(pip.data.data);
      setScoreDist(sc.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:48 }}><Spinner size={32} /></div>;

  const stats = [
    { label:'Total Applications', value: overview?.totalApplicants  ?? 0 },
    { label:'Avg AI Match Score', value: `${overview?.avgScore ?? 0}%` },
    { label:'Hire Rate',          value: `${overview?.totalApplicants ? Math.round((overview?.selected/overview?.totalApplicants)*100) : 0}%` },
    { label:'Interview Rate',     value: `${overview?.totalApplicants ? Math.round((overview?.scheduledInterviews/overview?.totalApplicants)*100) : 0}%` },
  ];

  // Monthly chart data
  const monthlyData = {
    labels: monthly.map((d) => MONTHS[(d._id?.month || 1) - 1]),
    datasets: [{
      label: 'Applications',
      data: monthly.map((d) => d.count),
      backgroundColor: 'rgba(27,79,216,0.7)',
      borderRadius: 5,
    }],
  };

  // Department demand
  const demandData = {
    labels: demand.map((d) => d._id),
    datasets: [{
      data: demand.map((d) => d.count),
      backgroundColor: ['#1B4FD8','#7C3AED','#059669','#D97706','#DC2626','#0891B2'],
      borderWidth: 0,
    }],
  };

  // Pipeline funnel
  const pipelineOrder = ['applied','under_review','shortlisted','interview_scheduled','selected','rejected'];
  const pipelineSorted = pipelineOrder.map((key) => {
    const found = pipeline.find((p) => p._id === key);
    return { label: key.replace(/_/g,' '), count: found?.count || 0 };
  });
  const pipelineData = {
    labels: pipelineSorted.map((p) => p.label),
    datasets: [{
      label: 'Candidates',
      data: pipelineSorted.map((p) => p.count),
      backgroundColor: ['#DBEAFE','#FEF3C7','#EDE9FE','#E0E7FF','#D1FAE5','#FEE2E2'],
      borderColor:     ['#1B4FD8','#D97706','#7C3AED','#4F46E5','#059669','#DC2626'],
      borderWidth: 1.5,
      borderRadius: 4,
    }],
  };

  // Score distribution
  const bucketLabels = ['0-25%','25-50%','50-65%','65-80%','80-90%','90-100%'];
  const scoreData = {
    labels: bucketLabels.slice(0, scoreDist.length),
    datasets: [{
      label: 'Candidates',
      data: scoreDist.map((b) => b.count),
      backgroundColor: ['#FEE2E2','#FEF3C7','#FEF3C7','#DBEAFE','#D1FAE5','#D1FAE5'],
      borderRadius: 4,
    }],
  };

  return (
    <div className="page-fade">
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:14 }}>Applications Per Month</div>
          <div style={{ height: 220 }}>
            {monthly.length > 0
              ? <Bar data={monthlyData} options={chartDefaults} />
              : <div style={{ color:'var(--gray400)', textAlign:'center', paddingTop:60 }}>No data yet</div>
            }
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:14 }}>Job Category Demand</div>
          <div style={{ height: 220 }}>
            {demand.length > 0
              ? <Doughnut data={demandData} options={{ ...chartDefaults, plugins:{ legend:{ position:'bottom', labels:{ font:{ size:11 }, boxWidth:12 } } }, scales: undefined }} />
              : <div style={{ color:'var(--gray400)', textAlign:'center', paddingTop:60 }}>No data yet</div>
            }
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:14 }}>Hiring Pipeline Funnel</div>
          <div style={{ height: 220 }}>
            <Bar data={pipelineData} options={{ ...chartDefaults, indexAxis:'y', plugins:{ legend:{ display:false } } }} />
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:14 }}>AI Score Distribution</div>
          <div style={{ height: 220 }}>
            {scoreDist.length > 0
              ? <Bar data={scoreData} options={chartDefaults} />
              : <div style={{ color:'var(--gray400)', textAlign:'center', paddingTop:60 }}>No data yet</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import JobCard from '../components/jobs/JobCard';

export default function History() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('applied');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: filter });
      const { data } = await apiRequest(`/api/v1/jobs?${params.toString()}`);
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const handleUpdate = (id, status) => {
      // If status changed to different filter, remove it
      if (status !== filter) {
          setJobs(curr => curr.filter(j => j.id !== id));
      }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem' }}>Job History</h1>
        
        <div className="flex gap-2 p-1" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
           <button 
             className={`btn ${filter === 'applied' ? 'btn-primary' : 'btn-ghost'}`}
             onClick={() => setFilter('applied')}
             style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
           >
             Applied
           </button>
           <button 
             className={`btn ${filter === 'ignored' ? 'btn-primary' : 'btn-ghost'}`}
             onClick={() => setFilter('ignored')}
             style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
           >
             Ignored
           </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        jobs.length === 0 ? (
          <div className="card text-center text-muted">No jobs found in this category.</div>
        ) : (
          <div className="history-list">
             {Object.entries(
                jobs.reduce((groups, job) => {
                  const date = new Date(job.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                  if (!groups[date]) groups[date] = [];
                  groups[date].push(job);
                  return groups;
                }, {})
             ).sort((a, b) => new Date(b[1][0].created_at) - new Date(a[1][0].created_at)) // Sort groups desc
              .map(([date, groupJobs]) => (
               <div key={date} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    {date}
                  </h3>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Job Title</th>
                          <th>Company</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupJobs.map(job => (
                           <tr key={job.id}>
                             <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{job.title}</td>
                             <td>{job.company}</td>
                             <td>
                                <span className={`badge ${job.status === 'applied' ? 'badge-green' : 'badge-red'}`}>
                                  {job.status}
                                </span>
                             </td>
                             <td>
                               <a href={job.apply_url} target="_blank" className="btn btn-ghost" style={{ padding: '0.25rem' }}>
                                  View
                               </a>
                             </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
             ))}
          </div>
        )
      )}
    </div>
  );
}

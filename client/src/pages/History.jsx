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
      const { data } = await apiRequest(`/api/v1/jobs?status=${filter}`);
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
    <div className="container">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h1>Job History</h1>
        
        <div className="flex gap-2">
           <button 
             className={`btn ${filter === 'applied' ? 'btn-primary' : 'btn-outline'}`}
             onClick={() => setFilter('applied')}
           >
             Applied
           </button>
           <button 
             className={`btn ${filter === 'ignored' ? 'btn-primary' : 'btn-outline'}`}
             onClick={() => setFilter('ignored')}
           >
             Ignored
           </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        jobs.length === 0 ? (
          <p className="text-muted">No jobs found in this category.</p>
        ) : (
          jobs.map(job => (
             <JobCard key={job.id} job={job} onUpdate={handleUpdate} />
          ))
        )
      )}
    </div>
  );
}

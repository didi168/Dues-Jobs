import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import JobCard from '../components/jobs/JobCard';
import { RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await apiRequest('/api/v1/jobs?status=new');
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleJobUpdate = (jobId, newStatus) => {
    // Optimistically remove from "New" list
    setJobs(current => current.filter(j => j.id !== jobId));
  };

  const manuallyTriggerFetch = async () => {
      // Optional: trigger backend fetch
      if(confirm("Trigger backend scraper? This may take a few seconds.")) {
          try {
             await apiRequest('/api/v1/fetch/run', { 
                 method: 'POST', 
                 headers: { 'cron_secret': 'Chubunni2.' } // Hardcoded for demo, normally env or hidden
             });
             alert("Fetch triggered. Refreshing jobs...");
             setTimeout(fetchJobs, 2000); // Wait a bit
          } catch(e) {
              alert("Failed to trigger fetch");
          }
      }
  };

  if (loading && jobs.length === 0) return <div className="container">Loading jobs...</div>;

  return (
    <div className="container">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
           <h1>New Jobs</h1>
           <p className="text-muted">Matches based on your preferences</p>
        </div>
        <button onClick={manuallyTriggerFetch} className="btn btn-outline">
            <RefreshCw size={16} /> Refresh Feed
        </button>
      </div>

      {error && <div style={{ color: 'var(--danger)' }}>Error: {error}</div>}

      {jobs.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <p>No new jobs found. Try adjusting your preferences or check back later.</p>
        </div>
      ) : (
        <div>
          {jobs.map(job => (
            <JobCard key={job.id} job={job} onUpdate={handleJobUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}

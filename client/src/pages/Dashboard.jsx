import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import JobCard from '../components/jobs/JobCard';
import { RefreshCw } from 'lucide-react';

import '../styles/dashboard.css';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('1'); // Default: 1 day (today/past 24h)

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: 'new' });
      if (dateRange) params.append('days', dateRange);
      
      const { data } = await apiRequest(`/api/v1/jobs?${params.toString()}`);
      console.log('Fetched jobs:', data); // Debug log
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [dateRange]);

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
    <div>
      {/* Welcome Banner */}
      <div className="dashboard-banner">
        <div className="banner-content">
           <h1>Today's Job Matches</h1>
           <p className="text-secondary">
             We found some opportunities matching your preferences.
           </p>
        </div>
        
        <div className="banner-actions">
          <div className="filter-group">
            {[
              { label: '24h', value: '1' },
              { label: '2 Days', value: '2' },
              { label: '3 Days', value: '3' },
              { label: 'All', value: '' },
            ].map(range => (
               <button
                 key={range.value}
                 onClick={() => setDateRange(range.value)}
                 className={`btn-filter ${dateRange === range.value ? 'active' : ''}`}
               >
                 {range.label}
               </button>
            ))}
          </div>
          
          <button onClick={manuallyTriggerFetch} className="btn btn-secondary btn-refresh">
              <RefreshCw size={16} /> Refresh Feed
          </button>
        </div>
      </div>

      {error && <div className="text-danger" style={{ marginBottom: '1rem' }}>Error: {error}</div>}

      {jobs.length === 0 && !loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p>No new jobs found for today.</p>
          <button onClick={manuallyTriggerFetch} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Check Again
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {jobs.map(job => (
            <JobCard key={job.id} job={job} onUpdate={handleJobUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { ExternalLink, Clock, MapPin, Building2 } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function JobCard({ job, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null); // 'applied' or 'ignored'

  const handleAction = async (status) => {
    if (selectedAction) return; // Prevent double click
    
    setSelectedAction(status);
    setLoading(true);
    
    try {
      await apiRequest(`/api/v1/jobs/${job.id}/mark`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      
      // Delay removal to show active state
      setTimeout(() => {
        onUpdate(job.id, status);
      }, 800);
    } catch (err) {
      console.error('Failed to update job', err);
      setSelectedAction(null); // Reset on error
    } finally {
      setLoading(false);
    }
  };

  const getButtonStyle = (status) => {
    if (selectedAction === null) return {};
    if (selectedAction === status) {
        return status === 'applied' 
            ? { backgroundColor: '#10b981', transform: 'scale(1.05)', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }
            : { backgroundColor: '#6b7280', transform: 'scale(1.05)', boxShadow: '0 0 10px rgba(107, 114, 128, 0.4)' };
    }
    return { opacity: 0.5, filter: 'grayscale(1)' };
  };

  return (
    <div className="card" style={selectedAction ? { opacity: 0.8 } : {}}>
      <div className="card-header flex justify-between items-start">
        <div>
           <div className="card-title">{job.title}</div>
           <div className="text-xs text-muted flex items-center gap-2">
              <Building2 size={13} /> {job.company}
           </div>
        </div>
        
        {job.is_remote ? (
           <span className="badge badge-green">Remote</span>
        ) : (
           <span className="text-xs text-muted flex items-center gap-1">
             <MapPin size={12} /> {job.location}
           </span>
        )}
      </div>

      <div className="text-sm text-secondary" style={{ marginBottom: '1rem', lineHeight: '1.4' }}>
         This is a job snippet placeholder. The actual job description would be parsed or truncated here to give a quick preview.
      </div>

      <div className="flex items-center gap-3 text-xs text-muted" style={{ marginBottom: '1rem' }}>
         <span>{formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })}</span>
         <span>•</span>
         <span>{job.source}</span>
      </div>

      <div className="flex gap-2">
        <a href={job.apply_url} target="_blank" rel="noreferrer" className="btn btn-secondary">
          <ExternalLink size={14} /> Details
        </a>

        {job.status === 'new' && (
          <>
            <button 
              onClick={() => handleAction('applied')} 
              className={`btn btn-primary ${selectedAction === 'applied' ? 'active' : ''}`}
              style={{ minWidth: '80px', transition: 'all 0.2s', ...getButtonStyle('applied') }}
              disabled={loading}
            >
              {selectedAction === 'applied' ? 'Applied!' : 'Applied'}
            </button>
            <button 
              onClick={() => handleAction('ignored')} 
              className={`btn btn-secondary ${selectedAction === 'ignored' ? 'active' : ''}`}
              style={{ minWidth: '80px', transition: 'all 0.2s', ...getButtonStyle('ignored') }}
              disabled={loading}
            >
               {selectedAction === 'ignored' ? 'Ignored!' : 'Ignored'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

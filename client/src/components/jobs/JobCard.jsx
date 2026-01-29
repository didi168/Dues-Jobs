import { useState } from 'react';
import { ExternalLink, ThumbsUp, ThumbsDown, Clock, MapPin, Building2 } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function JobCard({ job, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (status) => {
    setLoading(true);
    try {
      await apiRequest(`/api/v1/jobs/${job.id}/mark`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      onUpdate(job.id, status);
    } catch (err) {
      console.error('Failed to update job', err);
      // alert('Failed to update job status'); // Silent fail better for UI? Or stick to simple alert.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ 
      marginBottom: '1rem', 
      padding: '1.25rem',
      backgroundColor: 'var(--bg-card)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      ':hover': { transform: 'translateY(-2px)' } // Inline hover pseudo doesn't work in React style prop, needs CSS class or styled-components. Keeping simple.
    }}>
      {/* Header */}
      <div className="flex justify-between items-start gap-4" style={{ marginBottom: '0.75rem' }}>
        <div>
           <h3 style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1.3 }}>
             <a href={job.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
               {job.title}
             </a>
           </h3>
           <div className="flex items-center gap-2 text-sm text-muted" style={{ marginTop: '0.25rem' }}>
             <span className="flex items-center gap-1"><Building2 size={12} /> {job.company}</span>
           </div>
        </div>
        
        {job.is_remote ? (
           <span style={{ 
             background: 'rgba(62, 207, 142, 0.1)', 
             color: 'var(--primary)', 
             padding: '2px 8px', 
             borderRadius: '12px', 
             fontSize: '0.75rem', 
             fontWeight: 600,
             border: '1px solid rgba(62, 207, 142, 0.2)'
           }}>
             Remote
           </span>
        ) : (
           <span className="flex items-center gap-1 text-sm text-muted">
             <MapPin size={12} /> {job.location}
           </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-muted" style={{ marginBottom: '1.25rem', paddingTop: '0.5rem', borderTop: '1px solid #333' }}>
        <span className="flex items-center gap-1" title="Posted">
          <Clock size={12} /> {formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })}
        </span>
        <span>•</span>
        <span style={{ textTransform: 'capitalize' }}>Source: {job.source}</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <a 
          href={job.source_url} 
          target="_blank" 
          rel="noreferrer" 
          className="btn btn-outline"
          style={{ 
            flex: 1, 
            fontSize: '0.85rem', 
            borderColor: 'var(--border)', 
            color: 'var(--text-main)' 
          }}
        >
          <ExternalLink size={14} /> Full Details
        </a>
        
        {job.status === 'new' && (
          <>
            <button 
              className="btn btn-primary" 
              onClick={() => handleAction('applied')}
              disabled={loading}
              title="Mark as Applied"
              style={{ padding: '0.5rem 0.8rem' }}
            >
              <ThumbsUp size={16} />
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => handleAction('ignored')}
              disabled={loading}
              title="Ignore Job"
              style={{ 
                color: 'var(--text-muted)', 
                borderColor: 'var(--border)',
                padding: '0.5rem 0.8rem'
              }}
            >
              <ThumbsDown size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

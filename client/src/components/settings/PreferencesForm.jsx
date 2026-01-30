import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';

export default function PreferencesForm() {
  const [formData, setFormData] = useState({
    keywords: '',
    locations: '',
    remote_only: false,
    sources: [], // Added sources
    email_enabled: true,
    telegram_enabled: false,
    telegram_chat_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest('/api/v1/users/me/preferences')
      .then(({ message, ...data }) => { // Handle backend potentially wrapping in 'data' or flat
         // Flatten data manually if needed based on API response
         setFormData({
            keywords: (data.keywords || []).join(', '),
            locations: (data.locations || []).join(', '),
            remote_only: !!data.remote_only,
            sources: data.sources || [],
            email_enabled: !!data.email_enabled,
            telegram_enabled: !!data.telegram_enabled,
            telegram_chat_id: data.telegram_chat_id || '',
         });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      ...formData,
      keywords: formData.keywords.split(',').map(s => s.trim()).filter(Boolean),
      locations: formData.locations.split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      await apiRequest('/api/v1/users/me/preferences', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      alert('Preferences saved!');
    } catch (err) {
      alert('Error saving preferences: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  if (loading) return <div>Loading settings...</div>;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="card">
        <div className="card-header">
           <div className="card-title">Job Match Criteria</div>
           <div className="card-subtitle">Define what kind of jobs you are looking for.</div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Keywords (Comma separated)</label>
          <textarea
            className="form-textarea"
            value={formData.keywords}
            onChange={e => setFormData({ ...formData, keywords: e.target.value })}
            rows={3}
            placeholder="e.g. React, Node.js, Senior Engineer"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Locations</label>
          <input
            className="form-input"
            value={formData.locations}
            onChange={e => setFormData({ ...formData, locations: e.target.value })}
            disabled={formData.remote_only}
            placeholder="e.g. San Francisco, London"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Job Sources</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {['Adzuna', 'Remotive', 'RemoteOK'].map(source => (
              <label key={source} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer', background: 'var(--bg-body)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <input
                  type="checkbox"
                  checked={formData.sources.includes(source)}
                  onChange={e => {
                    const newSources = e.target.checked
                      ? [...formData.sources, source]
                      : formData.sources.filter(s => s !== source);
                    setFormData({ ...formData, sources: newSources });
                  }}
                />
                {source}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
           <label className="toggle-wrapper">
             <input
                type="checkbox"
                className="toggle-input"
                checked={formData.remote_only}
                onChange={e => setFormData({ ...formData, remote_only: e.target.checked })}
             />
             <div className="toggle-switch"></div>
             <span className="text-sm">Remote Jobs Only</span>
           </label>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
           <div className="card-title">Notifications</div>
           <div className="card-subtitle">Choose how you want to be alerted.</div>
        </div>

        <div className="form-group">
           <label className="toggle-wrapper" style={{ marginBottom: '1rem' }}>
             <input
                type="checkbox"
                className="toggle-input"
                checked={formData.email_enabled}
                onChange={e => setFormData({ ...formData, email_enabled: e.target.checked })}
             />
             <div className="toggle-switch"></div>
             <span className="text-sm">Daily Email Summary</span>
           </label>
           
           <label className="toggle-wrapper">
             <input
                type="checkbox"
                className="toggle-input"
                checked={formData.telegram_enabled}
                onChange={e => setFormData({ ...formData, telegram_enabled: e.target.checked })}
             />
             <div className="toggle-switch"></div>
             <span className="text-sm">Telegram Alerts</span>
           </label>
        </div>

        {formData.telegram_enabled && (
          <div className="form-group" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-body)', borderRadius: 'var(--radius-sm)' }}>
             <label className="form-label">Telegram Chat ID</label>
             <input
               className="form-input"
               value={formData.telegram_chat_id}
               onChange={e => setFormData({ ...formData, telegram_chat_id: e.target.value })}
               placeholder="12345678"
             />
             <div className="text-xs text-muted" style={{ marginTop: '0.5rem' }}>
                Message <strong>@DuesJobsBot</strong> to get your ID.
             </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );
}

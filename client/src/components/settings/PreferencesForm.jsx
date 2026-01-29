import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';

export default function PreferencesForm() {
  const [formData, setFormData] = useState({
    keywords: '',
    locations: '',
    remote_only: false,
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

  return (
    <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div>
        <label>
          <strong>Keywords</strong> (comma separated)
          <div className="text-sm text-muted">e.g. React, Node.js, Frontend</div>
        </label>
        <textarea
          value={formData.keywords}
          onChange={e => setFormData({ ...formData, keywords: e.target.value })}
          rows={3}
          style={{ width: '100%', marginTop: '0.5rem' }}
        />
      </div>

      <div>
        <label>
          <strong>Locations</strong> (comma separated, ignored if Remote Only)
          <div className="text-sm text-muted">e.g. New York, London</div>
        </label>
        <input
          value={formData.locations}
          onChange={e => setFormData({ ...formData, locations: e.target.value })}
          style={{ width: '100%', marginTop: '0.5rem' }}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="remote"
          checked={formData.remote_only}
          onChange={e => setFormData({ ...formData, remote_only: e.target.checked })}
          style={{ width: 'auto' }}
        />
        <label htmlFor="remote">Remote Jobs Only</label>
      </div>

      <hr style={{ borderTop: '1px solid var(--border)' }} />

      <h3>Notifications</h3>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="email"
          checked={formData.email_enabled}
          onChange={e => setFormData({ ...formData, email_enabled: e.target.checked })}
          style={{ width: 'auto' }}
        />
        <label htmlFor="email">Enable Daily Email Summaries</label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="telegram"
          checked={formData.telegram_enabled}
          onChange={e => setFormData({ ...formData, telegram_enabled: e.target.checked })}
          style={{ width: 'auto' }}
        />
        <label htmlFor="telegram">Enable Telegram Bot Messages</label>
      </div>

      {formData.telegram_enabled && (
        <div>
           <label className="text-sm">Telegram Chat ID</label>
           <input
             value={formData.telegram_chat_id}
             onChange={e => setFormData({ ...formData, telegram_chat_id: e.target.value })}
             placeholder="12345678"
             style={{ width: '100%', marginTop: '0.25rem' }}
           />
           <div className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
              Start a chat with <strong>@DuesJobsBot</strong> to get your ID.
           </div>
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  );
}

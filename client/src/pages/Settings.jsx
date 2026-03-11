import { usePageMeta } from '../hooks/usePageMeta';
import PreferencesForm from '../components/settings/PreferencesForm';

export default function Settings() {
  usePageMeta(
    'Settings',
    'Manage your job preferences and account settings. Customize your job search criteria and notification preferences.',
    'settings, preferences, account settings, job preferences'
  );

  return (
    <div style={{ maxWidth: '700px' }}>
       <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Account Settings</h1>
       <PreferencesForm />
    </div>
  );
}

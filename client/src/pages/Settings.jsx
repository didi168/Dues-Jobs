import PreferencesForm from '../components/settings/PreferencesForm';

export default function Settings() {
  return (
    <div style={{ maxWidth: '700px' }}>
       <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Account Settings</h1>
       <PreferencesForm />
    </div>
  );
}

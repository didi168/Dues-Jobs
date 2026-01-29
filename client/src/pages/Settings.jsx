import PreferencesForm from '../components/settings/PreferencesForm';

export default function Settings() {
  return (
    <div className="container" style={{ maxWidth: '800px' }}>
       <h1 style={{ marginBottom: '2rem' }}>Settings</h1>
       <PreferencesForm />
    </div>
  );
}

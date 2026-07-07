import React, { useState, useEffect } from 'react';
import translations from './utils/localization.js';

// Components
import Dashboard from './components/Dashboard.jsx';
import NewComplaintForm from './components/NewComplaintForm.jsx';
import TrackComplaints from './components/TrackComplaints.jsx';
import AccessibilitySettings from './components/AccessibilitySettings.jsx';
import AICompanion from './components/AICompanion.jsx';

export default function App() {
  // Locale State
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('civic_locale') || 'en';
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState('home');

  // Accessibility States (Synchronized with localStorage)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('civic_theme') || 'dark';
  });
  const [textSize, setTextSize] = useState(() => {
    return localStorage.getItem('civic_text_scale') || '1';
  });
  const [speechEnabled, setSpeechEnabled] = useState(() => {
    return localStorage.getItem('civic_speech_enabled') === 'true';
  });

  // Autofill pipeline state
  const [autofillValues, setAutofillValues] = useState(null);

  // Apply theme class on startup
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    document.documentElement.style.setProperty('--text-scale', textSize);
  }, [theme, textSize]);

  // Current translation dictionary
  const t = translations[locale] || translations.en;

  const handleLanguageChange = (e) => {
    const val = e.target.value;
    setLocale(val);
    localStorage.setItem('civic_locale', val);
  };

  const handleAutofillTrigger = (extractedData) => {
    if (extractedData) {
      // Direct navigation to help users see where fields are going
      if (extractedData.title || extractedData.description) {
        setActiveTab('report');
      }
      setAutofillValues(extractedData);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard t={t} onAutofillRequest={handleAutofillTrigger} />;
      case 'report':
        return (
          <NewComplaintForm
            t={t}
            initialValues={autofillValues}
            onSubmitSuccess={() => {
              setAutofillValues(null);
              setActiveTab('track');
            }}
          />
        );
      case 'track':
        return <TrackComplaints t={t} />;
      case 'accessibility':
        return (
          <AccessibilitySettings
            t={t}
            theme={theme}
            setTheme={setTheme}
            textSize={textSize}
            setTextSize={setTextSize}
            speechEnabled={speechEnabled}
            toggleSpeech={(val) => {
              setSpeechEnabled(val);
              localStorage.setItem('civic_speech_enabled', val ? 'true' : 'false');
            }}
          />
        );
      default:
        return <Dashboard t={t} />;
    }
  };

  return (
    <div className="app-container" style={{ display: 'grid', gridTemplateColumns: '270px 1fr 380px', height: '100vh', overflow: 'hidden' }}>
      
      {/* 1. Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🏛️</span>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: '800', tracking: '-0.03em' }}>
                {t.appName}
              </h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', textTransform: 'uppercase', fontWeight: 'bold', tracking: '0.05em' }}>
                {t.tagline}
              </span>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('home')}
              className={`btn ${activeTab === 'home' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
            >
              <span>🏠</span> {t.navHome}
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`btn ${activeTab === 'report' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
            >
              <span>✏️</span> {t.navReport}
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`btn ${activeTab === 'track' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
            >
              <span>🔎</span> {t.navTrack}
            </button>
            <button
              onClick={() => setActiveTab('accessibility')}
              className={`btn ${activeTab === 'accessibility' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', width: '100%' }}
            >
              <span>♿</span> {t.navAccessibility}
            </button>
          </nav>
        </div>

        {/* Locale select dropdown */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <label className="form-label" htmlFor="locale-selector" style={{ fontSize: '0.8rem' }}>🌐 Translate Platform</label>
          <select
            id="locale-selector"
            className="form-control"
            value={locale}
            onChange={handleLanguageChange}
            style={{ padding: '0.5rem', fontSize: '0.85rem' }}
          >
            <option value="en">English (US)</option>
            <option value="es">Español (ES)</option>
            <option value="hi">हिंदी (IN)</option>
            <option value="fr">Français (FR)</option>
          </select>
        </div>
      </aside>

      {/* 2. Main Content Canvas */}
      <main className="main-content" style={{ overflowY: 'auto', padding: '2rem' }}>
        {renderActiveTab()}
      </main>

      {/* 3. Right-side Slide Out AI Companion */}
      <section style={{ height: '100%' }}>
        <AICompanion
          t={t}
          locale={locale}
          onAutofillRequest={handleAutofillTrigger}
          activeTab={activeTab}
        />
      </section>

    </div>
  );
}

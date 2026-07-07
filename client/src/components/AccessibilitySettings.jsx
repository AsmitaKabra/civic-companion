import React from 'react';

export default function AccessibilitySettings({
  t,
  theme,
  setTheme,
  textSize,
  setTextSize,
  speechEnabled,
  toggleSpeech
}) {
  const handleScaleChange = (scale) => {
    setTextSize(scale);
    document.documentElement.style.setProperty('--text-scale', scale);
    localStorage.setItem('civic_text_scale', scale);
  };

  const handleContrastToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('civic_theme', nextTheme);
  };

  const resetDefaults = () => {
    handleScaleChange('1');
    setTheme('dark');
    document.documentElement.classList.remove('light-theme');
    toggleSpeech(false);
  };

  return (
    <div className="glass animate-fade-in" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span>♿</span> {t.accTitle}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Text Scaling */}
        <div>
          <label className="form-label">{t.accTextSize}</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => handleScaleChange('1')}
              className={`btn ${textSize === '1' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem' }}
            >
              {t.accSizeNormal}
            </button>
            <button
              onClick={() => handleScaleChange('1.25')}
              className={`btn ${textSize === '1.25' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem' }}
            >
              {t.accSizeLarge}
            </button>
            <button
              onClick={() => handleScaleChange('1.5')}
              className={`btn ${textSize === '1.5' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem' }}
            >
              {t.accSizeHuge}
            </button>
          </div>
        </div>

        {/* Theme Contrast Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div>
            <h4 style={{ fontWeight: '600' }}>{t.accHighContrast}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Forced Light / High-Contrast mode for visibility</p>
          </div>
          <button
            onClick={handleContrastToggle}
            className="btn btn-secondary"
            style={{ minWidth: '120px' }}
          >
            {theme === 'dark' ? 'Enable' : 'Disable'}
          </button>
        </div>

        {/* Text to Speech Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div>
            <h4 style={{ fontWeight: '600' }}>{t.accVoiceSynthesis}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>AI Companion will read responses aloud</p>
          </div>
          <button
            onClick={() => toggleSpeech(!speechEnabled)}
            className={`btn ${speechEnabled ? 'btn-primary' : 'btn-secondary'}`}
            style={{ minWidth: '120px' }}
          >
            {speechEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Reset Buttons */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'right' }}>
          <button onClick={resetDefaults} className="btn btn-secondary" style={{ borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}>
            {t.accReset}
          </button>
        </div>
      </div>
    </div>
  );
}

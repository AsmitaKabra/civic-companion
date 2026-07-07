import React, { useState } from 'react';
import { recommendSchemes } from '../services/api.js';
import DocumentChecklist from './DocumentChecklist.jsx';

export default function Dashboard({ t, onAutofillRequest }) {
  const [demographics, setDemographics] = useState({
    age: '',
    income: '',
    ownsHome: false,
    residency: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDemographics(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        age: parseInt(demographics.age, 10) || 0,
        income: parseFloat(demographics.income) || 0,
        ownsHome: demographics.ownsHome,
        residency: demographics.residency
      };
      
      const res = await recommendSchemes(payload);
      setRecommendations(res.recommendations);
      setHasEvaluated(true);
    } catch (err) {
      alert('Failed to match schemes: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateAutofill = () => {
    // autofill demo trigger
    setDemographics({
      age: '28',
      income: '45000',
      ownsHome: false,
      residency: true
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Hero Grid */}
      <div className="glass glow-pulse" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.08), rgba(59, 130, 246, 0.03))' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', background: 'linear-gradient(to right, #ffffff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t.dashGreeting}
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', fontSize: '1.1rem' }}>
          {t.dashSubtitle}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr', gap: '2rem' }}>
        
        {/* Scheme Demographics Matcher Form */}
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🎯 {t.schemeTitle}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{t.schemeDesc}</p>
          
          <form onSubmit={handleRecommend}>
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" htmlFor="dash-age">{t.schemeFieldAge}</label>
                <input
                  id="dash-age"
                  name="age"
                  type="number"
                  required
                  className="form-control"
                  value={demographics.age}
                  onChange={handleChange}
                  placeholder="e.g. 28"
                />
              </div>
              <div>
                <label className="form-label" htmlFor="dash-income">{t.schemeFieldIncome}</label>
                <input
                  id="dash-income"
                  name="income"
                  type="number"
                  required
                  className="form-control"
                  value={demographics.income}
                  onChange={handleChange}
                  placeholder="e.g. 45000"
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', gap: '2rem', margin: '1.25rem 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  name="ownsHome"
                  type="checkbox"
                  checked={demographics.ownsHome}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-teal)' }}
                />
                <span style={{ fontSize: '0.9rem' }}>{t.schemeFieldHome}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  name="residency"
                  type="checkbox"
                  checked={demographics.residency}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-teal)' }}
                />
                <span style={{ fontSize: '0.9rem' }}>{t.schemeFieldRes}</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: '1' }} disabled={isLoading}>
                {isLoading ? 'Calculating...' : t.schemeBtnMatch}
              </button>
              <button
                type="button"
                onClick={handleSimulateAutofill}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                ⚡ Autofill Demo
              </button>
            </div>
          </form>

          {/* Scheme recommendation outputs */}
          {hasEvaluated && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                {t.schemeMatchedHeader} ({recommendations.filter(r => r.eligible).length})
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {recommendations.map(scheme => (
                  <div
                    key={scheme.id}
                    className="glass"
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: `4px solid ${scheme.eligible ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{scheme.name}</h4>
                      <span className={`badge ${scheme.eligible ? 'badge-low' : 'badge-high'}`} style={{ color: scheme.eligible ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                        {scheme.eligible ? 'Qualified' : 'Ineligible'}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {scheme.simpleLanguage}
                    </p>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {scheme.matchReasons.map((reason, idx) => (
                        <div key={idx}>• {reason}</div>
                      ))}
                    </div>

                    {scheme.eligible && (
                      <DocumentChecklist t={t} scheme={scheme} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side column: Announcements, safety, etc */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Recent City Announcements */}
          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📢 {t.dashAnnouncements}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', fontWeight: '600' }}>HOUSING BOARD • JULY 5, 2026</span>
                <h4 style={{ fontSize: '0.95rem', margin: '0.2rem 0' }}>Public Housing Rental Aid budget increased by 15%</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Additional funding allocated to clear the pending waitlist of low-income applicants before winter.</p>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: '600' }}>PUBLIC WORKS • JUNE 30, 2026</span>
                <h4 style={{ fontSize: '0.95rem', margin: '0.2rem 0' }}>Maple St Road Resurfacing scheduled</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Heavy patching crews will commence repairs from 5th Ave down to Maple St beginning next Tuesday.</p>
              </div>
            </div>
          </div>

          {/* Emergency prioritization banner */}
          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-rose)' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-rose)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🚨 {t.dashEmergencyContact}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {t.dashEmergencyDescription}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'rgba(244, 63, 94, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244, 63, 94, 0.15)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MUNICIPAL DISPATCH HOTLINE</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-rose)' }}>1-800-555-SAFE</p>
              </div>
              <a href="tel:1-800-555-SAFE" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Call Now</a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

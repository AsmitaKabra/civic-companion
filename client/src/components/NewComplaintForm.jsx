import React, { useState, useEffect } from 'react';
import { createComplaint } from '../services/api.js';

export default function NewComplaintForm({ t, onSubmitSuccess, initialValues }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Roads & Infrastructure',
    description: '',
    location: '',
    severity: 'Medium',
    priority: 'Medium'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [hasEmergency, setHasEmergency] = useState(false);

  // Sync with AI companion autofill event
  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({
        ...prev,
        ...initialValues
      }));
    }
  }, [initialValues]);

  // Monitor description for utility hazard escalation
  useEffect(() => {
    const descLower = formData.description.toLowerCase();
    if (descLower.includes('wire') || descLower.includes('electric') || descLower.includes('gas') || descLower.includes('leak')) {
      setHasEmergency(true);
      setFormData(prev => ({ ...prev, severity: 'Critical', priority: 'High' }));
    } else {
      setHasEmergency(false);
    }
  }, [formData.description]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMockUpload = () => {
    // Hackathon wow: mock multimodal image parsing
    setFormData(prev => ({
      ...prev,
      title: 'Pothole block - Maple road #34',
      description: 'Large asphalt erosion crater measuring 4 feet wide, obstructing two lanes. Rain has accumulated inside causing splash hazards.',
      location: 'Maple Road & 5th Avenue intersection',
      category: 'Roads & Infrastructure',
      severity: 'High',
      priority: 'High'
    }));
    setSuccessMsg('📷 Mock Multimodal Image Upload: AI successfully analyzed image & populated report fields!');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await createComplaint(formData);
      setSuccessMsg('✅ Complaint ticket successfully registered on the civic board!');
      setFormData({
        title: '',
        category: 'Roads & Infrastructure',
        description: '',
        location: '',
        severity: 'Medium',
        priority: 'Medium'
      });
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass animate-fade-in" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', maxWidth: '750px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>{t.compReportTitle}</h2>
      
      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontWeight: '500' }}>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontWeight: '500' }}>
          {errorMsg}
        </div>
      )}

      {hasEmergency && (
        <div style={{ background: '#f43f5e', color: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontWeight: '700', animation: 'pulseGlow 2s infinite' }}>
          ⚠️ URGENT ELECTRICAL/UTILITY THREAT DETECTED: This issue has been automatically escalated to Critical Priority. Dispatch team will be alerted immediately upon submission.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="comp-title">{t.compFieldTitle}</label>
          <input
            id="comp-title"
            name="title"
            type="text"
            required
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Broken water valve leaking on sidewalk"
          />
        </div>

        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label" htmlFor="comp-category">{t.compFieldCat}</label>
            <select
              id="comp-category"
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Roads & Infrastructure">Roads & Infrastructure</option>
              <option value="Public Lighting">Public Lighting</option>
              <option value="Electricity & Utilities">Electricity & Utilities</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="comp-location">{t.compFieldLoc}</label>
            <input
              id="comp-location"
              name="location"
              type="text"
              required
              className="form-control"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. 455 Maple St / Outside Library"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="comp-description">{t.compFieldDesc}</label>
          <textarea
            id="comp-description"
            name="description"
            required
            rows={4}
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the issue in detail..."
          />
        </div>

        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label" htmlFor="comp-severity">{t.compFieldSev}</label>
            <select
              id="comp-severity"
              name="severity"
              className="form-control"
              value={formData.severity}
              onChange={handleChange}
              disabled={hasEmergency}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="comp-priority">{t.compFieldPri}</label>
            <select
              id="comp-priority"
              name="priority"
              className="form-control"
              value={formData.priority}
              onChange={handleChange}
              disabled={hasEmergency}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        {/* Multi-modal mock feature uploader */}
        <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            📸 Have a photo of the incident? Drop it here to auto-fill details using AI Multimodal parsing.
          </p>
          <button type="button" onClick={handleMockUpload} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
            Simulate Image Analysis
          </button>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
          {isSubmitting ? t.compBtnUpdating : t.compBtnSubmit}
        </button>
      </form>
    </div>
  );
}

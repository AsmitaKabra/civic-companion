import React, { useState, useEffect } from 'react';
import { getComplaints, simulateComplaintUpdate } from '../services/api.js';

export default function TrackComplaints({ t }) {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const loadComplaints = async () => {
    try {
      const data = await getComplaints();
      setComplaints(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleSimulate = async (id) => {
    try {
      const updated = await simulateComplaintUpdate(id);
      setComplaints(prev => prev.map(c => c.id === id ? updated : c));
    } catch (err) {
      alert('Simulation update failed: ' + err.message);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'Submitted': return 1;
      case 'Under Review': return 2;
      case 'In Progress': return 3;
      case 'Resolved': return 4;
      default: return 1;
    }
  };

  const activeComplaint = complaints.find(c => c.id === selectedId);

  if (isLoading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading municipal records...</div>;
  }

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>{t.compTitle}</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
        {/* Sidebar list of tickets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {complaints.map(item => {
            const isSelected = item.id === selectedId;
            let badgeClass = 'badge-medium';
            if (item.severity === 'Low') badgeClass = 'badge-low';
            if (item.severity === 'High') badgeClass = 'badge-high';
            if (item.severity === 'Critical') badgeClass = 'badge-critical';

            return (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className="glass text-left"
                style={{
                  border: isSelected ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'rgba(20, 184, 166, 0.05)' : 'var(--bg-secondary)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  width: '100%',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>{item.id.toUpperCase()}</span>
                  <span className={`badge ${badgeClass}`}>{item.severity}</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  📍 {item.location}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--accent-teal)' }}>● {item.status}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Complaint Detail panel */}
        <div>
          {activeComplaint ? (
            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TICKET ID: {activeComplaint.id.toUpperCase()}</span>
                  <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{activeComplaint.title}</h3>
                </div>
                <button
                  onClick={() => handleSimulate(activeComplaint.id)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}
                >
                  ⚙️ Advance State
                </button>
              </div>

              {/* Status Visual Tracker */}
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Resolution Progress</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '0 1rem' }}>
                  {/* Background progress bar */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '0',
                    right: '0',
                    height: '4px',
                    backgroundColor: 'var(--bg-tertiary)',
                    zIndex: '1'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '0',
                    width: `${((getStatusStep(activeComplaint.status) - 1) / 3) * 100}%`,
                    height: '4px',
                    backgroundColor: 'var(--accent-teal)',
                    transition: 'width 0.4s ease-in-out',
                    zIndex: '1'
                  }} />

                  {/* Steps */}
                  {['Submitted', 'Under Review', 'In Progress', 'Resolved'].map((st, i) => {
                    const activeStep = getStatusStep(activeComplaint.status);
                    const isDone = i + 1 <= activeStep;
                    
                    return (
                      <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: '2' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                          border: `2px solid ${isDone ? 'var(--accent-teal)' : 'var(--border-color)'}`,
                          color: isDone ? '#ffffff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          transition: 'all 0.3s'
                        }}>
                          {isDone ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: isDone ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isDone ? '600' : '400' }}>
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Core Information */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location</span>
                  <p style={{ fontWeight: '500' }}>📍 {activeComplaint.location}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Department Category</span>
                  <p style={{ fontWeight: '500' }}>🏢 {activeComplaint.category}</p>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Description Details</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{activeComplaint.description}</p>
              </div>

              {/* Timeline Logs */}
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Audit Timeline</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '1.25rem', marginLeft: '0.5rem' }}>
                  {activeComplaint.updates.map((up, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      {/* Circle indicator on line */}
                      <div style={{
                        position: 'absolute',
                        left: '-27px',
                        top: '6px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: i === activeComplaint.updates.length - 1 ? 'var(--accent-teal)' : 'var(--text-muted)',
                        border: '2px solid var(--bg-primary)'
                      }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(up.timestamp).toLocaleString()}
                      </span>
                      <p style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                        {up.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)' }}>No complaint selected.</div>
          )}
        </div>
      </div>
    </div>
  );
}

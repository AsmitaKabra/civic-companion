import React, { useState } from 'react';

export default function DocumentChecklist({ t, scheme }) {
  const [docsStatus, setDocsStatus] = useState(
    scheme.documents.reduce((acc, doc) => {
      acc[doc] = 'pending';
      return acc;
    }, {})
  );

  const [loadingDoc, setLoadingDoc] = useState(null);

  const handleSimulatedUpload = (doc) => {
    setLoadingDoc(doc);
    setTimeout(() => {
      setDocsStatus(prev => ({
        ...prev,
        [doc]: 'uploaded'
      }));
      setLoadingDoc(null);
    }, 1500);
  };

  const getDocStatusBadge = (status) => {
    if (status === 'uploaded') {
      return <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>✓ Verified</span>;
    }
    return <span style={{ color: 'var(--accent-amber)' }}>⚠️ Upload Needed</span>;
  };

  return (
    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
      <h5 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: '700' }}>
        📋 {t.schemeRequiredDocuments}
      </h5>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {scheme.documents.map((doc) => {
          const status = docsStatus[doc];
          const isUploaded = status === 'uploaded';

          return (
            <div
              key={doc}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isUploaded ? 'rgba(16, 185, 129, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                border: `1px solid ${isUploaded ? 'rgba(16, 185, 129, 0.1)' : 'var(--border-color)'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  checked={isUploaded}
                  readOnly
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-emerald)' }}
                />
                <span style={{ fontSize: '0.9rem', color: isUploaded ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {doc}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {getDocStatusBadge(status)}
                {!isUploaded && (
                  <button
                    onClick={() => handleSimulatedUpload(doc)}
                    disabled={loadingDoc === doc}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}
                  >
                    {loadingDoc === doc ? 'Processing Scan...' : 'Upload Scan'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

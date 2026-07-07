import React, { useState, useRef, useEffect } from 'react';
import { chatCompletion } from '../services/api.js';
import { useSpeech } from '../hooks/useSpeech.js';

export default function AICompanion({ t, locale, onAutofillRequest, activeTab }) {
  const [messages, setMessages] = useState([
    { role: 'model', content: t.companionEmpty }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [pendingAutofill, setPendingAutofill] = useState(null);

  const {
    isListening,
    speechEnabled,
    speak,
    startListening,
    stopListening
  } = useSpeech();

  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Read aloud the latest model message if speech is enabled
  useEffect(() => {
    const latestMsg = messages[messages.length - 1];
    if (latestMsg && latestMsg.role === 'model') {
      // Strip markdown syntax for cleaner narration speech
      const plainText = latestMsg.content.replace(/[*#_`~]/g, '');
      speak(plainText, locale);
    }
  }, [messages, locale, speak]);

  const handleSendMessage = async (textToSend) => {
    const msg = textToSend || inputVal;
    if (!msg.trim()) return;

    setInputVal('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsLoading(true);
    setPendingAutofill(null);

    try {
      const response = await chatCompletion(sessionId, msg, locale);
      setMessages(prev => [...prev, { role: 'model', content: response.reply }]);
      
      // If AI extracted structured data, offer autofill options
      if (response.extractedData) {
        setPendingAutofill(response.extractedData);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: '❌ Sorry, I encountered a connection issue. Please check the backend server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(
        (transcript) => {
          setInputVal(transcript);
          handleSendMessage(transcript);
        },
        (error) => {
          alert('Voice Recognition failed: ' + error);
        }
      );
    }
  };

  const handleAutofillAction = () => {
    if (pendingAutofill && onAutofillRequest) {
      onAutofillRequest(pendingAutofill);
      setMessages(prev => [...prev, {
        role: 'model',
        content: '✨ **System Log**: Autopopulated current form fields successfully! Please review the inputs before submitting.'
      }]);
      setPendingAutofill(null);
    }
  };

  return (
    <div className="glass" style={{
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      height: '100%',
      borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
      borderLeft: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-secondary)'
    }}>
      {/* Companion Header */}
      <div style={{
        padding: '1.25rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--accent-teal)' }}>●</span> {t.companionTitle}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.companionSubtitle}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {speechEnabled && <span title="Voice Narration Enabled" style={{ fontSize: '1rem' }}>🔊</span>}
        </div>
      </div>

      {/* Message Feed */}
      <div style={{
        padding: '1.25rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                backgroundColor: isUser ? 'var(--accent-teal)' : 'var(--bg-tertiary)',
                color: '#ffffff',
                padding: '0.75rem 1rem',
                borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                fontSize: '0.95rem',
                border: isUser ? 'none' : '1px solid var(--border-color)'
              }}
            >
              {/* Formatted Text Content */}
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
            </div>
          );
        })}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Agentic Autofill Prompt Drawer */}
      {pendingAutofill && (
        <div className="glow-pulse" style={{
          padding: '1rem',
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
          borderTop: '1px solid var(--accent-teal)',
          borderBottom: '1px solid var(--accent-teal)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '500' }}>
            💡 AI detected details to fill out the current screen form!
          </p>
          <button onClick={handleAutofillAction} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            ✨ Autofill Current Form
          </button>
        </div>
      )}

      {/* Input area */}
      <div style={{
        padding: '1.25rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleMicClick}
            className={`btn ${isListening ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.75rem', borderRadius: 'var(--radius-full)', minWidth: '46px' }}
            title="Toggle Voice Input"
          >
            {isListening ? '🛑' : '🎙️'}
          </button>
          <input
            type="text"
            className="form-control"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isListening ? t.companionSpeechStart : t.companionPlaceholder}
            disabled={isLoading || isListening}
            style={{ borderRadius: 'var(--radius-full)' }}
          />
          <button
            onClick={() => handleSendMessage()}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)' }}
            disabled={isLoading || isListening}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

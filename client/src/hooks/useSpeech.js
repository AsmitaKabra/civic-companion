import { useState, useEffect, useCallback } from 'react';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [speechEnabled, setSpeechEnabled] = useState(() => {
    return localStorage.getItem('civic_speech_enabled') === 'true';
  });

  // 1. Initialize Speech Recognition
  useEffect(() => {
    const SpeechObj = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechObj) {
      const rec = new SpeechObj();
      rec.continuous = false;
      rec.interimResults = false;
      setRecognition(rec);
    }
  }, []);

  // 2. Speak Text Aloud (Text-to-Speech)
  const speak = useCallback((text, locale = 'en') => {
    if (!speechEnabled) return;
    
    // Cancel any ongoing speaking
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate voice/locale
    if (locale === 'es') utterance.lang = 'es-ES';
    else if (locale === 'hi') utterance.lang = 'hi-IN';
    else if (locale === 'fr') utterance.lang = 'fr-FR';
    else utterance.lang = 'en-US';

    window.speechSynthesis.speak(utterance);
  }, [speechEnabled]);

  // 3. Listen to Citizen Input (Speech-to-Text)
  const startListening = useCallback((onResult, onError) => {
    if (!recognition) {
      if (onError) onError('Speech recognition not supported in this browser.');
      return;
    }

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      if (onResult) onResult(resultText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event);
      if (onError) onError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Start listening error:', err);
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  const toggleSpeech = useCallback((val) => {
    setSpeechEnabled(val);
    localStorage.setItem('civic_speech_enabled', val ? 'true' : 'false');
    if (!val) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    isListening,
    speechEnabled,
    speak,
    startListening,
    stopListening,
    toggleSpeech
  };
}

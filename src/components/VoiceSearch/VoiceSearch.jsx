import React, { useEffect, useState, useRef } from 'react';
import { X, Mic } from 'lucide-react';
import styles from './VoiceSearch.module.css';

const VoiceSearch = ({ isActive, onClose, onResult, lang }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      startListening();
    } else {
      stopListening();
    }
    
    return () => stopListening();
  }, [isActive, lang]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      onClose();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current][0].transcript;
      setTranscript(result);
      if (event.results[current].isFinal) {
        setTimeout(() => {
          onResult(result);
          onClose();
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      onClose();
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  if (!isActive) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}><X /></button>
        <div className={styles.content}>
          <div className={`${styles.micIcon} ${isListening ? styles.pulse : ''}`}>
            <Mic size={48} />
            <div className={styles.rings}></div>
          </div>
          <h2>{isListening ? (lang.startsWith('ta') ? 'கேட்கிறது...' : 'Listening...') : 'Processing...'}</h2>
          <p className={styles.transcript}>{transcript || "Speak now..."}</p>
          <p className={styles.langHint}>{lang === 'ta-IN' ? 'தமிழில் பேசவும்' : 'Speak in English'}</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceSearch;

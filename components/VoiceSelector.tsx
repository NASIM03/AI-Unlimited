import React, { useState, useEffect } from 'react';

interface VoiceSelectorProps {
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice | null) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onVoiceChange }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        // Set a default voice if none is selected
        if (!selectedVoice) {
          // Prefer a default English voice from the browser's engine
          const defaultVoice = availableVoices.find(v => v.lang.includes('en') && v.default) || availableVoices[0];
          onVoiceChange(defaultVoice);
        }
      }
    };

    loadVoices();
    // Voices may load asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []); // Run only once

  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceURI = event.target.value;
    const voice = voices.find(v => v.voiceURI === voiceURI) || null;
    onVoiceChange(voice);
  };
  
  if (voices.length === 0) {
    return <p className="text-sm text-gray-400">Loading voices...</p>;
  }

  return (
    <select
      value={selectedVoice?.voiceURI || ''}
      onChange={handleVoiceChange}
      className="w-full px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {voices.map(voice => (
        <option key={voice.voiceURI} value={voice.voiceURI}>
          {voice.name} ({voice.lang})
        </option>
      ))}
    </select>
  );
};
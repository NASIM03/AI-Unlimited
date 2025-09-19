import React from 'react';

interface ToneSelectorProps {
  selectedTone: string;
  onToneChange: (tone: string) => void;
}

const TONES = [
  { value: 'Default', label: 'Default' },
  { value: 'Friendly', label: '😊 Friendly' },
  { value: 'Professional', label: '👔 Professional' },
  { value: 'Excited', label: '🎉 Excited' },
  { value: 'Calm', label: '🧘 Calm' },
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedTone, onToneChange }) => {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TONES.map((tone) => (
          <button
            key={tone.value}
            type="button"
            onClick={() => onToneChange(tone.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              selectedTone === tone.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tone.label}
          </button>
        ))}
      </div>
    </div>
  );
};
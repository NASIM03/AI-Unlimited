import React from 'react';

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}

const STYLES = [
  { value: 'Photorealistic', label: '📷 Realistic' },
  { value: 'Anime', label: '🌸 Anime' },
  { value: 'Cartoon', label: '🧸 Cartoon' },
  { value: 'Fantasy Art', label: '🎨 Fantasy Art' },
  { value: 'Minimalist', label: '✨ Minimalist' },
  { value: 'Cyberpunk', label: '🤖 Cyberpunk' },
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onStyleChange }) => {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STYLES.map((style) => (
          <button
            key={style.value}
            type="button"
            onClick={() => onStyleChange(style.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              selectedStyle === style.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {style.label}
          </button>
        ))}
      </div>
    </div>
  );
};
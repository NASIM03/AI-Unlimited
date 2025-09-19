import React from 'react';

interface AspectRatioSelectorProps {
  selectedRatio: string;
  onRatioChange: (ratio: string) => void;
}

const RATIOS = [
  { value: '1:1', label: 'Square' },
  { value: '16:9', label: 'Widescreen' },
  { value: '9:16', label: 'Portrait' },
  { value: '4:3', label: 'Landscape' },
  { value: '3:4', label: 'Tall' },
];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onRatioChange }) => {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {RATIOS.map((ratio) => (
          <button
            key={ratio.value}
            type="button"
            onClick={() => onRatioChange(ratio.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              selectedRatio === ratio.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {ratio.label}
          </button>
        ))}
      </div>
    </div>
  );
};
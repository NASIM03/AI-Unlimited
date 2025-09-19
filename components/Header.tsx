import React from 'react';
import { CameraIcon } from './icons/CameraIcon';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-6">
      <div className="flex items-center justify-center space-x-4">
        <CameraIcon className="w-12 h-12 text-blue-400" />
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          AI Image Generator
        </h1>
      </div>
      <p className="mt-4 text-lg text-gray-400">
        Turn your imagination into stunning visuals with the power of AI.
      </p>
    </header>
  );
};

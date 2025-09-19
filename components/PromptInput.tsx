import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { AspectRatioSelector } from './AspectRatioSelector';
import { StyleSelector } from './StyleSelector';
import { ImageIcon } from './icons/ImageIcon';
import { VideoIcon } from './icons/VideoIcon';
import { AudioIcon } from './icons/AudioIcon';
import { VoiceSelector } from './VoiceSelector';
import { ToneSelector } from './ToneSelector';

type GenerationMode = 'image' | 'video' | 'audio';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  style: string;
  setStyle: (style: string) => void;
  tone: string;
  setTone: (tone: string) => void;
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  setPrompt,
  onSubmit,
  isLoading,
  aspectRatio,
  setAspectRatio,
  style,
  setStyle,
  tone,
  setTone,
  generationMode,
  setGenerationMode,
  selectedVoice,
  setSelectedVoice,
}) => {
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit();
    }
  };

  const buttonText = 
    generationMode === 'image' ? 'Generate Images' :
    generationMode === 'video' ? 'Generate Video' :
    'Generate Speech';
  
  const placeholderText = 
    generationMode === 'image' ? 'e.g., A majestic lion wearing a crown, cinematic, dramatic lighting' :
    generationMode === 'video' ? 'e.g., A futuristic city with flying cars at sunset' :
    'e.g., The quick brown fox jumps over the lazy dog.';

  return (
    <div className="w-full max-w-2xl p-4 bg-gray-800/50 rounded-xl border border-gray-700">
       <div className="flex mb-4 border-b border-gray-700">
        <button
          onClick={() => setGenerationMode('image')}
          className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold transition-colors ${
            generationMode === 'image'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-5 h-5 mr-2" />
          Image
        </button>
        <button
          onClick={() => setGenerationMode('video')}
          className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold transition-colors ${
            generationMode === 'video'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <VideoIcon className="w-5 h-5 mr-2" />
          Video
        </button>
        <button
          onClick={() => setGenerationMode('audio')}
          className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold transition-colors ${
            generationMode === 'audio'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <AudioIcon className="w-5 h-5 mr-2" />
          Audio
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholderText}
          className="w-full h-28 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-gray-200"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute top-4 right-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              <span>{buttonText}</span>
            </>
          )}
        </button>
      </form>
      {generationMode === 'image' && (
        <div className="mt-4 space-y-4 transition-all duration-500">
          <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Aspect Ratio</h3>
              <AspectRatioSelector selectedRatio={aspectRatio} onRatioChange={setAspectRatio} />
          </div>
          <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Style</h3>
              <StyleSelector selectedStyle={style} onStyleChange={setStyle} />
          </div>
        </div>
      )}
       {generationMode === 'audio' && (
        <div className="mt-4 space-y-4 transition-all duration-500">
           <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Tone</h3>
              <ToneSelector selectedTone={tone} onToneChange={setTone} />
          </div>
          <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Voice</h3>
              <VoiceSelector selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} />
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { OutputDisplay } from './components/ImageDisplay';
import { generateImagesFromPrompt, enhancePrompt, generateVideoFromPrompt, rephraseTextForSpeech } from './services/geminiService';

type GenerationMode = 'image' | 'video' | 'audio';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[] | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioText, setAudioText] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [style, setStyle] = useState<string>('Photorealistic');
  const [tone, setTone] = useState<string>('Default');
  const [generationMode, setGenerationMode] = useState<GenerationMode>('image');

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrls(null);
    setVideoUrl(null);
    setAudioText(null);
    setEnhancedPrompt(null);
    setLoadingMessage('Kicking off the creative process...');

    try {
      if (generationMode === 'image') {
        const newEnhancedPrompt = await enhancePrompt(prompt, style, aspectRatio);
        setEnhancedPrompt(newEnhancedPrompt);
        setLoadingMessage('Generating your images...');
        const base64Images = await generateImagesFromPrompt(newEnhancedPrompt, aspectRatio);
        const dataUrls = base64Images.map(base64 => `data:image/jpeg;base64,${base64}`);
        setImageUrls(dataUrls);
      } else if (generationMode === 'video') {
        const newEnhancedPrompt = await enhancePrompt(prompt, style, aspectRatio);
        setEnhancedPrompt(newEnhancedPrompt);

        const onProgress = (message: string) => {
            setLoadingMessage(message);
        };
        
        const generatedVideoUrl = await generateVideoFromPrompt(newEnhancedPrompt, onProgress);
        setVideoUrl(generatedVideoUrl);
      } else { // Audio generation
        setLoadingMessage('Rephrasing text for selected tone...');
        const rephrasedText = await rephraseTextForSpeech(prompt, tone);
        setAudioText(rephrasedText);
        setEnhancedPrompt(prompt); // Use original prompt for display purposes
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, [prompt, aspectRatio, style, generationMode, selectedVoice, tone]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-grow">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center py-8">
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={handleGenerate}
            isLoading={isLoading}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            style={style}
            setStyle={setStyle}
            tone={tone}
            setTone={setTone}
            generationMode={generationMode}
            setGenerationMode={setGenerationMode}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
          />
          <OutputDisplay
            imageUrls={imageUrls}
            videoUrl={videoUrl}
            audioText={audioText}
            selectedVoice={selectedVoice}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            error={error}
            enhancedPrompt={enhancedPrompt}
            aspectRatio={aspectRatio}
            generationMode={generationMode}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
import React, { useState, useEffect, useRef } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { ImageIcon } from './icons/ImageIcon';
import { VideoIcon } from './icons/VideoIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { AudioIcon } from './icons/AudioIcon';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';


type GenerationMode = 'image' | 'video' | 'audio';

interface OutputDisplayProps {
  imageUrls: string[] | null;
  videoUrl: string | null;
  audioText: string | null;
  selectedVoice: SpeechSynthesisVoice | null;
  isLoading: boolean;
  loadingMessage: string | null;
  error: string | null;
  enhancedPrompt: string | null;
  aspectRatio: string;
  generationMode: GenerationMode;
}

const getAspectRatioClass = (ratio: string): string => {
    switch (ratio) {
        case '1:1': return 'aspect-square';
        case '16:9': return 'aspect-video';
        case '9:16': return 'aspect-[9/16]';
        case '4:3': return 'aspect-[4/3]';
        case '3:4': return 'aspect-[3/4]';
        default: return 'aspect-square';
    }
};

const ImageLoadingState: React.FC<{ aspectRatio: string }> = ({ aspectRatio }) => {
    const aspectRatioClass = getAspectRatioClass(aspectRatio);
    return (
        <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={`w-full bg-gray-800 rounded-lg flex items-center justify-center animate-pulse ${aspectRatioClass}`}>
                    <ImageIcon className="w-10 h-10 text-gray-700" />
                </div>
            ))}
        </div>
    );
};

const VideoLoadingState: React.FC<{ message: string | null }> = ({ message }) => (
    <div className="w-full max-w-md mx-auto aspect-video bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center text-center p-4">
        <div className="relative flex items-center justify-center">
            <VideoIcon className="w-16 h-16 text-gray-600" />
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-blue-500/50 animate-ping"></div>
        </div>
        <p className="mt-4 text-lg text-gray-400">Generating your video...</p>
        <p className="mt-2 text-sm text-gray-500 h-5">{message || 'Please wait, this may take a few minutes.'}</p>
    </div>
);

const AudioLoadingState: React.FC<{ message: string | null }> = ({ message }) => (
    <div className="w-full max-w-md mx-auto aspect-square bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center text-center p-4">
        <AudioIcon className="w-16 h-16 text-gray-600 animate-pulse" />
        <p className="mt-4 text-lg text-gray-500">{message || 'Generating your audio...'}</p>
    </div>
);


const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="w-full max-w-md mx-auto aspect-square bg-red-900/20 border-2 border-red-500/50 rounded-lg flex flex-col items-center justify-center text-center p-4">
    <ErrorIcon className="w-16 h-16 text-red-500" />
    <p className="mt-4 text-lg font-semibold text-red-400">Generation Failed</p>
    <p className="mt-2 text-sm text-red-300">{message}</p>
  </div>
);

const InitialState: React.FC = () => (
  <div className="w-full max-w-md mx-auto aspect-square bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center text-center p-4">
    <div className="flex space-x-4">
        <ImageIcon className="w-12 h-12 text-gray-600" />
        <VideoIcon className="w-12 h-12 text-gray-600" />
        <AudioIcon className="w-12 h-12 text-gray-600" />
    </div>
    <p className="mt-4 text-lg text-gray-500">Your generated creations will appear here</p>
    <p className="mt-2 text-sm text-gray-600">Create an image, video, or audio from a prompt!</p>
  </div>
);

const EnhancedPromptDisplay: React.FC<{ prompt: string | null, isAudio?: boolean }> = ({ prompt, isAudio = false }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    useEffect(() => {
        return () => {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
        };
    }, [prompt]);

    const handleSpeak = () => {
        if (!prompt) return;

        if (isSpeaking) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(prompt);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
    };

    if (!prompt) return null;
    return (
        <div className="w-full mb-4 p-3 pr-12 bg-gray-800/60 rounded-lg border border-gray-700 relative">
            <p className="text-xs text-gray-400 mb-1 font-semibold">{isAudio ? 'Original Prompt:' : 'Enhanced Prompt:'}</p>
            <p className="text-sm text-gray-300 italic">"{prompt}"</p>
            {!isAudio && (
                <button
                    onClick={handleSpeak}
                    className="absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                    aria-label={isSpeaking ? "Stop reading prompt" : "Read prompt aloud"}
                >
                    <SpeakerIcon className={`w-5 h-5 ${isSpeaking ? 'text-blue-400' : ''}`} speaking={isSpeaking} />
                </button>
            )}
        </div>
    );
};

const AudioPlayer: React.FC<{ text: string; voice: SpeechSynthesisVoice | null }> = ({ text, voice }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Cleanup object URL on unmount or when a new URL is generated
    useEffect(() => {
        const currentAudioUrl = audioUrl;
        return () => {
            if (currentAudioUrl) {
                URL.revokeObjectURL(currentAudioUrl);
            }
            speechSynthesis.cancel();
        };
    }, [audioUrl, text, voice]);

    const handleToggleSpeech = () => {
        if (isSpeaking) {
            speechSynthesis.cancel(); // This will trigger 'onend'
            return;
        }

        // --- Setup Media Recorder ---
        // This is a workaround to capture system audio. It's not perfect and may not work in all browsers/setups.
        // A more robust solution would use a server-side TTS service that provides an audio file directly.
        // For this demo, we create a silent audio stream and mix the speech into it.
        const audioCtx = new AudioContext();
        const destination = audioCtx.createMediaStreamDestination();
        const mediaStream = destination.stream;
        
        mediaRecorderRef.current = new MediaRecorder(mediaStream, { mimeType: 'audio/webm' });
        audioChunksRef.current = [];
        setAudioUrl(null); // Reset previous URL

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            audioCtx.close();
        };
        // --- End Setup ---

        const utterance = new SpeechSynthesisUtterance(text);
        if (voice) {
            utterance.voice = voice;
        }

        // Route the utterance to our captured stream
        const source = audioCtx.createBufferSource(); // create a dummy source
        source.connect(destination); // connect it to our destination
        
        utterance.onstart = () => {
            setIsSpeaking(true);
            mediaRecorderRef.current?.start();
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            mediaRecorderRef.current?.stop();
        };

        utterance.onerror = (e) => {
            console.error("Speech synthesis error", e);
            setIsSpeaking(false);
            mediaRecorderRef.current?.stop();
        };

        speechSynthesis.speak(utterance);
    };
    
    return (
         <div className="w-full max-w-md mx-auto p-6 bg-gray-800/50 border border-gray-700 rounded-lg flex flex-col items-center justify-center text-center">
            <AudioIcon className="w-16 h-16 text-gray-500 mb-4" />
            <p className="text-sm text-gray-400 mb-4 italic line-clamp-3">"{text}"</p>
            <div className="flex items-center space-x-4">
                <button
                    onClick={handleToggleSpeech}
                    className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label={isSpeaking ? 'Stop' : 'Play'}
                >
                    {isSpeaking ? <StopIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                </button>
                {audioUrl && (
                    <a
                        href={audioUrl}
                        download={`ai-speech-${Date.now()}.webm`}
                        className="flex items-center justify-center w-16 h-16 bg-gray-600 text-white font-semibold rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        aria-label="Download Speech"
                    >
                       <DownloadIcon className="w-7 h-7" />
                    </a>
                )}
            </div>
            {voice && <p className="text-xs text-gray-500 mt-4">Voice: {voice.name}</p>}
        </div>
    );
};


export const OutputDisplay: React.FC<OutputDisplayProps> = ({ 
    imageUrls, videoUrl, audioText, selectedVoice, isLoading, loadingMessage, error, enhancedPrompt, aspectRatio, generationMode 
}) => {
  const aspectRatioClass = getAspectRatioClass(aspectRatio);

  const renderContent = () => {
    if (isLoading) {
        if (generationMode === 'image') return <ImageLoadingState aspectRatio={aspectRatio} />;
        if (generationMode === 'video') return <VideoLoadingState message={loadingMessage} />;
        if (generationMode === 'audio') return <AudioLoadingState message={loadingMessage} />;
    }
    if (error) {
        return <ErrorState message={error} />;
    }
    if (generationMode === 'image' && imageUrls) {
        return (
            <div className="grid grid-cols-2 gap-4">
                {imageUrls.map((url, index) => (
                    <div key={index} className={`relative group ${aspectRatioClass}`}>
                        <img 
                            src={url} 
                            alt={enhancedPrompt || `Generated AI image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg shadow-lg shadow-blue-500/10"
                        />
                        <a
                        href={url}
                        download={`${enhancedPrompt?.slice(0, 30).replace(/\s/g, '_') || 'ai-image'}-${index}.jpg`}
                        className="absolute bottom-2 right-2 flex items-center bg-black bg-opacity-50 text-white py-1.5 px-3 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-label="Download image"
                        >
                            <DownloadIcon className="w-4 h-4 mr-1.5" />
                            <span className="text-sm">Download</span>
                        </a>
                    </div>
                ))}
            </div>
        );
    }
    if (generationMode === 'video' && videoUrl) {
        return (
            <div className="w-full max-w-2xl mx-auto">
                <div className="relative aspect-video">
                    <video 
                        src={videoUrl} 
                        controls 
                        className="w-full h-full rounded-lg shadow-lg shadow-blue-500/10"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div className="flex justify-center mt-4">
                    <a
                        href={videoUrl}
                        download={`${enhancedPrompt?.slice(0, 30).replace(/\s/g, '_') || 'ai-video'}.mp4`}
                        className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300"
                        aria-label="Download video"
                        >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        <span>Download Video</span>
                    </a>
                </div>
            </div>
        );
    }
    if (generationMode === 'audio' && audioText) {
        return <AudioPlayer text={audioText} voice={selectedVoice} />;
    }
    return <InitialState />;
  };

  return (
    <div className="w-full max-w-4xl mt-8 flex flex-col items-center">
      <div className="w-full">
        {enhancedPrompt && !isLoading && !error && <EnhancedPromptDisplay prompt={enhancedPrompt} isAudio={generationMode === 'audio'} />}
        {renderContent()}
      </div>
    </div>
  );
};
async function apiFetch(action: string, payload: any) {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred.' }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    return response.json();
}

export const rephraseTextForSpeech = async (text: string, tone: string): Promise<string> => {
    try {
        const data = await apiFetch('rephraseText', { text, tone });
        return data.text;
    } catch (error) {
        console.error("Error rephrasing text:", error);
        return text; // Fallback
    }
};

export const enhancePrompt = async (prompt: string, style: string, aspectRatio: string): Promise<string> => {
    try {
        const data = await apiFetch('enhancePrompt', { prompt, style, aspectRatio });
        return data.text;
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        return `${prompt}, ${style}, ${aspectRatio}`; // Fallback
    }
};

export const generateImagesFromPrompt = async (prompt: string, aspectRatio: string): Promise<string[]> => {
    const data = await apiFetch('generateImages', { prompt, aspectRatio });
    return data.images;
};

export const generateVideoFromPrompt = async (prompt:string, onProgress: (message: string) => void): Promise<string> => {
    try {
        onProgress("Starting video generation job...");
        const { operation: initialOperation } = await apiFetch('startVideo', { prompt });

        let operation = initialOperation;
        
        const progressMessages = [
            "Warming up the digital director...",
            "Rendering the first few frames...",
            "Compositing the scene...",
            "Applying special effects...",
            "Adding cinematic lighting...",
            "Finalizing the audio mix (just kidding!)...",
            "This is taking a bit longer than usual, but good things are coming...",
            "Polishing the final cut...",
        ];
        let messageIndex = 0;

        while (!operation.done) {
            onProgress(progressMessages[messageIndex % progressMessages.length]);
            messageIndex++;
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            
            const statusResponse = await fetch('/api/video-status', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ operation }),
            });

            if (!statusResponse.ok) {
                console.error("Failed to get video status, retrying...");
                continue;
            }

            const statusData = await statusResponse.json();
            operation = statusData.operation;
        }

        onProgress("Video is ready!");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was provided.");
        }
        
        return `/api/download-video?link=${encodeURIComponent(downloadLink)}`;

    } catch (error) {
        console.error("Error generating video:", error);
        if (error instanceof Error) {
            throw new Error(`Video generation failed: ${error.message}`);
        }
        throw new Error("An unexpected error occurred during video generation.");
    }
};

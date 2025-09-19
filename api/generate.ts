import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY is not defined in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const PROMPT_ENHANCEMENT_SYSTEM_INSTRUCTION = `You are an expert prompt engineer for an advanced AI image generation model. A user will provide a basic idea, an artistic style, and a specific aspect ratio. Your primary and most critical task is to construct a detailed prompt that FORCES the generated image to strictly adhere to the requested aspect ratio. Start the prompt by explicitly stating the composition, for example: 'A cinematic, ultra-widescreen (16:9) shot of...', or 'A full-body vertical portrait (9:16) of...', or 'A perfectly square (1:1) centered image of...'. Then, elaborate on the user's idea, adding rich details about the subject, environment, lighting, and mood that are appropriate for that composition and style. Do not suggest any details that would contradict the requested aspect ratio. Your output must be ONLY the final, detailed prompt text.`;
const AUDIO_PROMPT_ENHANCEMENT_SYSTEM_INSTRUCTION = `You are a speech writer for a text-to-speech engine. A user will provide a piece of text and a desired tone. Your task is to rewrite the text to sound natural and engaging when read aloud in that specific tone. Adjust sentence structure, word choice, and add appropriate pauses or emphasis where needed, but do not change the core meaning of the text. If the tone is 'Default', make only minor corrections for flow. Your output must be ONLY the rewritten text, ready for synthesis.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { action, payload } = req.body;

        switch (action) {
            case 'enhancePrompt': {
                const { prompt, style, aspectRatio } = payload;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `User prompt: "${prompt}", Style: "${style}", Aspect Ratio: "${aspectRatio}"`,
                    config: { systemInstruction: PROMPT_ENHANCEMENT_SYSTEM_INSTRUCTION, temperature: 0.8 },
                });
                return res.status(200).json({ text: response.text.trim() });
            }
            case 'rephraseText': {
                 const { text, tone } = payload;
                 if (tone === 'Default') {
                     return res.status(200).json({ text: text });
                 }
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `User text: "${text}", Desired Tone: "${tone}"`,
                    config: { systemInstruction: AUDIO_PROMPT_ENHANCEMENT_SYSTEM_INSTRUCTION, temperature: 0.7 },
                });
                return res.status(200).json({ text: response.text.trim() });
            }
            case 'generateImages': {
                const { prompt, aspectRatio } = payload;
                const response = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: prompt,
                    config: { numberOfImages: 4, outputMimeType: 'image/jpeg', aspectRatio: aspectRatio },
                });
                const images = response.generatedImages.map(img => img.image.imageBytes);
                return res.status(200).json({ images });
            }
            case 'startVideo': {
                const { prompt } = payload;
                const operation = await ai.models.generateVideos({
                    model: 'veo-2.0-generate-001',
                    prompt: prompt,
                    config: { numberOfVideos: 1 }
                });
                return res.status(200).json({ operation });
            }
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error: any) {
        console.error(`Error in /api/generate for action ${req.body.action}:`, error);
        return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
    }
}

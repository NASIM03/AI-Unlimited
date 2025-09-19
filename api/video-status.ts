import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY is not defined in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { operation: oldOperation } = req.body;
        if (!oldOperation) {
            return res.status(400).json({ error: 'Operation object is required.' });
        }
        
        const updatedOperation = await ai.operations.getVideosOperation({ operation: oldOperation });
        
        return res.status(200).json({ operation: updatedOperation });

    } catch (error: any) {
        console.error("Error in /api/video-status:", error);
        return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
    }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY is not defined in environment variables.");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { link } = req.query;
        if (!link || typeof link !== 'string') {
            return res.status(400).json({ error: 'A valid download link is required.' });
        }

        const downloadUrl = `${link}&key=${API_KEY}`;
        
        const videoResponse = await fetch(downloadUrl);

        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video from Gemini. Status: ${videoResponse.status}`);
        }

        res.setHeader('Content-Type', videoResponse.headers.get('Content-Type') || 'video/mp4');
        const contentLength = videoResponse.headers.get('Content-Length');
        if (contentLength) {
            res.setHeader('Content-Length', contentLength);
        }
        
        if (videoResponse.body) {
            // FIX: Manually pipe the web stream to the Node.js response stream.
            // The `fetch` response body is a Web API ReadableStream, which is not directly compatible
            // with Node.js streams. This loop reads chunks from the web stream and writes them
            // to the Vercel response object, which is a Node.js Writable stream.
            const reader = videoResponse.body.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                res.write(value);
            }
            res.end();
        } else {
            throw new Error("Video response body is null.");
        }
        
    } catch (error: any) {
        console.error("Error in /api/download-video:", error);
        return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
    }
}
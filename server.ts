import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/insights', async (req, res) => {
    try {
      const { entries } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing.' });
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let prompt = "You are a gentle, encouraging AI assistant for a personal carbon footprint tracking app. ";
      
      if (entries && entries.length > 0) {
         const avg = entries.reduce((s: any, e: any) => s + e.total, 0) / entries.length;
         const last = entries[entries.length-1];
         prompt += `The user has logged some activity. Their overall average is ${avg.toFixed(1)} kg CO2e per day. Their most recent entry was ${last.total.toFixed(1)} kg CO2e. `;
         if (last.total < avg) { prompt += "They are doing great and trending below their average! "; }
         else { prompt += "They had a higher footprint day recently. "; }
      } else {
         prompt += "The user hasn't logged any footprint data yet. ";
      }
      prompt += "Provide a short, highly personalized 2-sentence insight analyzing their pattern, followed by one simple, practical, and highly specific tip to help them reduce their footprint. Do not use any markdown formatting or asterisks. Keep the tone minimalist, calm, and uplifting. Max 45 words.";
      
      const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: prompt });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API Error (Insights):', error?.message || error);
      res.json({ text: "You're exploring fast! Our AI is taking a quick breather due to rate limits. Check back in a minute for your updated insights." });
    }
  });

  app.post('/api/projection', async (req, res) => {
    try {
      const { entries } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing.' });
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let prompt = "You are an AI assistant for a carbon footprint app analyzing past data to project the user's future impact over the next 12 months. ";
          
      if (entries && entries.length > 0) {
        const avg = entries.reduce((s: any, e: any) => s + e.total, 0) / entries.length;
        prompt += `The user has logged data. Their daily average is ${avg.toFixed(1)} kg CO2e. `;
      } else {
        prompt += `The user has no logs yet. Assume a typical daily average of 8.4 kg CO2e for the projection. `;
      }
          
      prompt += `Provide a concise 3-sentence projection paragraph. 
      1st sentence: State their projected total CO2e for the next 12 months (multiply daily avg by 365). 
      2nd sentence: Give a tangible, grounded equivalent (e.g. "That's roughly equivalent to driving X miles" or "flying from X to Y"). 
      3rd sentence: Offer an encouraging path forward on how a small 10% reduction could shift that trajectory.
      Do not use markdown formatting. Keep the tone calm and data-focused.`;
      
      const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: prompt });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API Error (Projection):', error?.message || error);
      res.json({ text: "Projecting your future impact... (Our AI rate limit was reached, please try again in about 30 seconds to see your 12-month projection)." });
    }
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

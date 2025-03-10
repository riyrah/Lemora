import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import YouTubeTranscript from 'youtube-transcript';
import * as cheerio from 'cheerio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const transcript = await fetchTranscript(videoId);
    if (!transcript) {
      return res.status(404).json({ error: 'No transcript available for this video' });
    }

    const summary = await generateSummary(transcript);
    return res.status(200).json({ summary });

  } catch (error: any) {
    console.error('Summarization error:', error);
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to generate summary';
    return res.status(500).json({ 
      error: errorMessage,
      ...(error.response?.status && { statusCode: error.response.status })
    });
  }
}
function extractVideoId(url: string): string | null {
  const patterns = [
    /v=([^&#]+)/,
    /youtu\.be\/([^?#]+)/,
    /embed\/([^?#]+)/,
    /shorts\/([^?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

async function fetchTranscript(videoId: string): Promise<string> {
  try {
    const transcriptItems = await (YouTubeTranscript as any).fetchTranscript(videoId) as TranscriptItem[];
    if (!transcriptItems.length) {
      throw new Error('No transcript available');
    }
    return transcriptItems.map((item: TranscriptItem) => item.text).join(' ');
  } catch (error: any) {
    throw new Error(`Failed to fetch transcript: ${error.message}`);
  }
}
async function generateSummary(transcript: string): Promise<string> {
  const MAX_TOKENS = 4096;
  const chunkSize = Math.floor(MAX_TOKENS * 3.5); // Conservative estimate for token count

  // Split transcript into chunks preserving sentence boundaries
  const chunks: string[] = [];
  let currentChunk = '';
  
  const sentences = transcript.match(/[^.!?]+[.!?]+/g) || [];
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += sentence + ' ';
  }
  if (currentChunk) chunks.push(currentChunk.trim());

  const summaries = [];
  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index];
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'You are a helpful study assistant. Generate a concise summary of this YouTube video transcript in bullet points. Explain so that a 10 year old can understand and in depth so the user doesn\'t have to watch the video. Focus on key concepts, main arguments, and important details.'
        }, {
          role: 'user',
          content: `Video Transcript Chunk ${index + 1}/${chunks.length}:\n${chunk}`
        }],
        temperature: 0.3,
        max_tokens: MAX_TOKENS
      });

      const summary = response.choices[0]?.message?.content?.trim();
      if (summary) summaries.push(summary);
    } catch (error: any) {
      console.error(`Error processing chunk ${index + 1}:`, error);
      throw new Error(`Failed to process transcript chunk: ${error.message}`);
    }
  }
  return summaries.join('\n\n');
}
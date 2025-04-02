import { GoogleGenerativeAI } from '@google/generative-ai';
import { YoutubeTranscript } from 'youtube-transcript';
import { NextResponse } from 'next/server';

// Initialize Google AI Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Helper function to extract video ID (reusable)
function getVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      return videoId;
    }
  } catch (e) {
    if (url.includes('v=')) {
      return url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    }
  }
  return null;
}

// Chat prompt template
const CHAT_PROMPT_TEMPLATE = `You are a helpful assistant knowledgeable about the content of a specific YouTube video. Use ONLY the provided transcript to answer the user's question accurately and concisely. Do not add information not present in the transcript. If the answer isn't in the transcript, say "I couldn't find information about that in the video transcript."

Transcript:
---
{transcript}
---

User Question: {question}

Answer:`;

export async function POST(request: Request) {
  console.log('--- [/api/chat] Received request ---');
  try {
    const { url, question } = await request.json();
    console.log(`--- [/api/chat] URL: ${url}, Question: ${question} ---`);

    if (!url || !question) {
      console.error('--- [/api/chat] Error: Missing URL or question ---');
      return NextResponse.json({ error: 'Missing URL or question in request body' }, { status: 400 });
    }

    const videoId = getVideoId(url);
    if (!videoId) {
      console.error(`--- [/api/chat] Error: Could not extract video ID from URL: ${url} ---`);
      return NextResponse.json({ error: 'Invalid YouTube URL or could not extract video ID' }, { status: 400 });
    }
    console.log(`--- [/api/chat] Video ID: ${videoId} ---`);

    // Fetch Transcript
    let transcriptText = '';
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcript.map(t => t.text).join(' ');
      console.log(`--- [/api/chat] Transcript fetched, length: ${transcriptText.length} ---`);
    } catch (error) {
      console.error(`--- [/api/chat] Error fetching transcript for Video ID ${videoId}: ---`, error);
      // Still allow chat if transcript fails, but inform the user/model
      transcriptText = "Transcript unavailable.";
      // Consider returning an error instead if transcript is essential
      // return NextResponse.json({ error: `Failed to fetch transcript. Error: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
    }

    // Prepare prompt for Google AI
    const fullPrompt = CHAT_PROMPT_TEMPLATE
      .replace('{transcript}', transcriptText)
      .replace('{question}', question);

    // Call Google AI for streaming response
    console.log('--- [/api/chat] Calling Google AI API stream... ---');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const generationConfig = {
        temperature: 0.3, // Slightly higher temp for chat
    };
    const content = [{ role: "user", parts: [{ text: fullPrompt }] }];

    const streamResult = await model.generateContentStream({ contents: content, generationConfig });

    // Create a ReadableStream to push SSE formatted chunks
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        console.log('--- [/api/chat] Stream started ---');
        try {
          for await (const chunk of streamResult.stream) {
            try {
              const chunkText = chunk.text();
              if (chunkText) {
                const sseFormattedChunk = `data: ${JSON.stringify({ chunk: chunkText })}\n\n`;
                controller.enqueue(encoder.encode(sseFormattedChunk));
              }
            } catch (chunkError) {
               console.error("--- [/api/chat] Error processing/encoding stream chunk: ---", chunkError);
               const errorChunk = `data: ${JSON.stringify({ error: "Error processing stream chunk" })}\n\n`;
               controller.enqueue(encoder.encode(errorChunk));
            }
          }
          console.log('--- [/api/chat] Stream finished ---');
        } catch (streamError) {
          console.error("--- [/api/chat] Error reading from Gemini stream: ---", streamError);
          try {
            const errorChunk = `data: ${JSON.stringify({ error: "Error reading from AI stream" })}\n\n`;
            controller.enqueue(encoder.encode(errorChunk));
          } catch (enqueueError) {
             console.error("--- [/api/chat] Error sending final stream error: ---", enqueueError);
          }
        } finally {
          try {
              controller.close();
          } catch (closeError) {
              console.error("--- [/api/chat] Error closing stream controller: ---", closeError);
          }
        }
      },
      cancel(reason) {
        console.log(`--- [/api/chat] Stream cancelled: ${reason} ---`);
      }
    });

    // Return the streaming response
    return new Response(readableStream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });

  } catch (error) {
    console.error('--- [/api/chat] General Error: ---', error);
    let errorMessage = 'Failed to start chat stream';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
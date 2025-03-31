import { GoogleGenerativeAI } from '@google/generative-ai';
// Use standard Response for streaming
import { NextResponse } from 'next/server'; 

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// --- Simplified AI Detection Score Calculation ---
function calculateSimplifiedAIDetectionScore(text: string): number {
  // 1. Split into sentences (basic split, may need refinement for edge cases)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Need at least a few sentences for meaningful stats
  if (sentences.length < 3) {
    return 50; // Neutral score if not enough data
  }

  // 2. Calculate word count per sentence
  const wordCounts = sentences.map(s => s.trim().split(/\s+/).length);

  // 3. Calculate average and standard deviation
  const sum = wordCounts.reduce((a, b) => a + b, 0);
  const avg = sum / wordCounts.length;
  
  if (avg === 0) return 30; // Low score if sentences are effectively empty

  const variance = wordCounts.map(count => Math.pow(count - avg, 2)).reduce((a, b) => a + b, 0) / wordCounts.length;
  const stdDev = Math.sqrt(variance);

  // 4. Calculate a score based on variation relative to average length
  // Higher relative variation -> higher score (more "human-like" burstiness)
  // Scaled and clamped arbitrarily to 0-100 range. Needs tuning.
  const score = Math.min(100, Math.max(0, (stdDev / avg) * 200)); 

  console.log(`--- [AI Score Calc] Sentences: ${sentences.length}, AvgLen: ${avg.toFixed(1)}, StdDev: ${stdDev.toFixed(1)}, Score: ${score.toFixed(1)} ---`);
  return Math.round(score);
}
// --- End Simplified AI Detection ---

export async function POST(request: Request) {
  console.log('--- [/api/humanize] Received request for streaming ---');

  try {
    const { text } = await request.json();
    console.log(`--- [/api/humanize] Parsed data: Text Length - ${text?.length || 0} ---`);

    if (!text) {
      console.error('--- [/api/humanize] Error: Missing text in request body ---');
      return NextResponse.json({ error: 'Missing text in request body' }, { status: 400 });
    }

    // Simplified and stricter prompt focused on paraphrasing + structure
    const systemPrompt = `Your primary task is to paraphrase the provided text, making it sound natural and human-written. Follow these rules **absolutely strictly**:

1.  **EXACT PARAGRAPH STRUCTURE:** The output MUST mirror the input's paragraph structure precisely. If the input is one paragraph, the output MUST be one single paragraph. Do NOT add extra paragraph breaks (empty lines). Do NOT merge or split paragraphs.
2.  **PARAPHRASE:** Rewrite using different words and sentence structures while preserving the original meaning entirely.
3.  **SIMILAR LENGTH:** Keep the output word count extremely close to the input's word count (aim for +/- 10 words).
4.  **NATURAL FLOW:** Ensure the paraphrased text flows well and sounds natural.`;
    
    console.log('--- [/api/humanize] Calling Gemini AI API stream with stricter prompt and low temperature... ---');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
    const content = [{ role: "user", parts: [{ text: `${systemPrompt}\n\nParaphrase this text:\n${text}` }] }];
    const generationConfig = {
        temperature: 0.2
    };

    // Get the async generator stream from Gemini
    const streamResult = await model.generateContentStream({ contents: content, generationConfig });

    // Create a ReadableStream to push SSE formatted chunks
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        console.log('--- [/api/humanize] Stream started ---');
        try {
          // Iterate through the stream from Gemini
          for await (const chunk of streamResult.stream) {
            try {
              const chunkText = chunk.text();
              if (chunkText) { // Ensure there's text to send
                const sseFormattedChunk = `data: ${JSON.stringify({ chunk: chunkText })}\n\n`;
                controller.enqueue(encoder.encode(sseFormattedChunk));
              }
            } catch (chunkError) {
               console.error("Error processing/encoding stream chunk:", chunkError);
               // Send an error event within the stream if needed
               const errorChunk = `data: ${JSON.stringify({ error: "Error processing stream chunk" })}\n\n`;
               controller.enqueue(encoder.encode(errorChunk));
            }
          }
          console.log('--- [/api/humanize] Stream finished ---');
        } catch (streamError) {
          console.error("Error reading from Gemini stream:", streamError);
          // Send a final error event if the stream itself fails
          try {
            const errorChunk = `data: ${JSON.stringify({ error: "Error reading from AI stream" })}\n\n`;
            controller.enqueue(encoder.encode(errorChunk));
          } catch (enqueueError) {
             console.error("Error sending final stream error:", enqueueError);
          }
        } finally {
          // Close the stream when done or if an error occurs
          try {
              controller.close();
          } catch (closeError) {
              console.error("Error closing stream controller:", closeError);
          }
        }
      },
      cancel(reason) {
        console.log(`--- [/api/humanize] Stream cancelled: ${reason} ---`);
        // Handle cancellation if needed (e.g., clean up resources)
      }
    });

    // Return the streaming response using the constructed ReadableStream
    return new Response(readableStream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });

  } catch (error) {
    console.error('--- [/api/humanize] Error setting up stream: ---', error);
    let errorMessage = 'Failed to start humanization stream';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
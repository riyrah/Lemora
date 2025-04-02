import { GoogleGenerativeAI } from '@google/generative-ai';
import { YoutubeTranscript } from 'youtube-transcript';
import { NextResponse } from 'next/server';

// Initialize Google AI Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Helper function to extract video ID (same as in summarize route)
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
    // Fallback for potentially invalid URLs or different formats
    if (url.includes('v=')) {
      return url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    }
  }
  return null; // Return null if no ID found
}

// Flashcard generation prompt
const FLASHCARD_PROMPT = `Create exactly 5 high-quality flashcards from this video transcript. Follow STRICTLY:
- Front must be a clear, concise question testing understanding of a key concept.
- Back must be a specific, accurate answer, including brief examples if helpful.
- Questions should focus on the most important takeaways or definitions from the transcript.
- Output MUST be ONLY a valid JSON object containing a single key "flashcards" which is an array of 5 objects, each with "front" and "back" string properties.
- Example JSON structure: {"flashcards": [{"front":"What is concept X?", "back":"Concept X is... Example: ..."}, ...]}

Video transcript:
---
{transcript}
---
`;

export async function POST(request: Request) {
  console.log('--- [/api/generate-flashcards] Received request ---');
  try {
    const { url } = await request.json();
    console.log(`--- [/api/generate-flashcards] URL: ${url} ---`);

    if (!url) {
      console.error('--- [/api/generate-flashcards] Error: Missing URL ---');
      return NextResponse.json({ error: 'Missing URL in request body' }, { status: 400 });
    }

    const videoId = getVideoId(url);
    if (!videoId) {
      console.error(`--- [/api/generate-flashcards] Error: Could not extract video ID from URL: ${url} ---`);
      return NextResponse.json({ error: 'Invalid YouTube URL or could not extract video ID' }, { status: 400 });
    }
    console.log(`--- [/api/generate-flashcards] Video ID: ${videoId} ---`);

    // Fetch Transcript
    let transcriptText = '';
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcript.map(t => t.text).join(' ');
      console.log(`--- [/api/generate-flashcards] Transcript fetched, length: ${transcriptText.length} ---`);
    } catch (error) {
      console.error(`--- [/api/generate-flashcards] Error fetching transcript for Video ID ${videoId}: ---`, error);
      return NextResponse.json({ error: `Failed to fetch transcript. Is it a valid YouTube video with captions enabled? Error: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
    }

    // Prepare prompt for Google AI
    const fullPrompt = FLASHCARD_PROMPT.replace('{transcript}', transcriptText);

    // Call Google AI
    console.log('--- [/api/generate-flashcards] Calling Google AI API for JSON... ---');
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        // Specify JSON output mode
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3
        }
    }); 

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text(); // Gemini returns JSON as a string here
    console.log('--- [/api/generate-flashcards] Google AI JSON response received. ---');

    // Parse the JSON string response
    try {
      const flashcardData = JSON.parse(responseText);
      // Basic validation
      if (!flashcardData.flashcards || !Array.isArray(flashcardData.flashcards) || flashcardData.flashcards.length === 0) {
           console.error('--- [/api/generate-flashcards] Error: Invalid JSON structure received from AI. Data:', responseText);
           throw new Error('AI returned invalid flashcard data format.');
      }
      console.log(`--- [/api/generate-flashcards] Successfully parsed ${flashcardData.flashcards.length} flashcards. ---`);
      return NextResponse.json({ flashcards: flashcardData.flashcards });
    } catch (parseError) {
      console.error('--- [/api/generate-flashcards] Error parsing JSON response from AI: ---', parseError);
      console.error('--- [/api/generate-flashcards] Raw AI Response: ---', responseText);
      return NextResponse.json({ error: 'Failed to parse flashcard data from AI response.' }, { status: 500 });
    }

  } catch (error) {
    console.error('--- [/api/generate-flashcards] General Error: ---', error);
    let errorMessage = 'Failed to generate flashcards';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
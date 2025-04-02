import { GoogleGenerativeAI } from '@google/generative-ai';
import { YoutubeTranscript } from 'youtube-transcript';
import { NextResponse } from 'next/server';

// Initialize Google AI Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Helper function to extract video ID
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

// Adapted prompt template for Google AI
const PROMPT_TEMPLATE = `Create a simple, easy-to-understand summary from this YouTube video transcript that even a 10-year-old could understand without watching the video. Follow these rules:

1. Use VERY simple words and short sentences.
2. Break down complex ideas into basic concepts.
3. Always use examples a child would understand.
4. Format strictly using standard Markdown.

Structure:
## 🎥 Video Overview
2-3 super simple sentences about what this video is about.

## 📝 Summary
- Break down EVERYTHING that happens in the video.
- Use lots of bullet points (using the standard Markdown \`-\` or \`*\` symbol).
- Explain each point in simple words.
→ Give examples where needed.
→ Make sure to cover all important details.
→ Keep each point short and clear.

## 🔑 Main Ideas
→ List the most important takeaways.
→ Explain why each one matters.
→ Use real-world examples.

## ❓ Why This Matters
Simple explanation of why this topic is important and how it affects everyday life.

## 🚀 Try This
Simple activities or ideas to help understand the topic better.

Formatting MUST:
- Use ## for section headers.
- Separate sections and paragraphs with a standard Markdown double newline (like pressing Enter twice).
- Use standard Markdown bullet points (like \`-\` or \`*\`) for ALL lists.
- Start each bullet point with a new idea.
- Keep each point under 2 lines.
- Use simple words only.
- Maximum 750 words.
- Add relevant emojis for visual breaks.
- **Do NOT use any HTML tags like <br> or <p>. Use only standard Markdown formatting.**

Transcript:
---
{transcript}
---
`;

export async function POST(request: Request) {
  console.log('--- [/api/summarize] Received request ---');
  try {
    const { url } = await request.json();
    console.log(`--- [/api/summarize] URL: ${url} ---`);

    if (!url) {
      console.error('--- [/api/summarize] Error: Missing URL in request body ---');
      return NextResponse.json({ error: 'Missing URL in request body' }, { status: 400 });
    }

    const videoId = getVideoId(url);
    if (!videoId) {
      console.error(`--- [/api/summarize] Error: Could not extract video ID from URL: ${url} ---`);
      return NextResponse.json({ error: 'Invalid YouTube URL or could not extract video ID' }, { status: 400 });
    }
    console.log(`--- [/api/summarize] Video ID: ${videoId} ---`);

    // Fetch Transcript
    let transcriptData: { text: string; duration: number; offset: number; }[] = []; // Store structured data
    let transcriptText = ''; // Keep joined text for summary prompt
    try {
      transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcriptData.map(t => t.text).join(' ');
      console.log(`--- [/api/summarize] Transcript fetched, length: ${transcriptText.length} ---`);
    } catch (error) {
      console.error(`--- [/api/summarize] Error fetching transcript for Video ID ${videoId}: ---`, error);
      // Don't return fatal error, allow summary without transcript if needed
      // But maybe return an indicator?
      transcriptText = "Transcript unavailable."; // Indicate unavailability for summary
      // transcriptData will remain empty []
    }

    // Fetch Video Title (using oEmbed)
    let videoTitle = 'Video Title Not Found';
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const oembedResponse = await fetch(oembedUrl);
      if (oembedResponse.ok) {
        const oembedData = await oembedResponse.json();
        videoTitle = oembedData.title || videoTitle;
        console.log(`--- [/api/summarize] Video Title fetched: ${videoTitle} ---`);
      } else {
         console.warn(`--- [/api/summarize] Failed to fetch video title via oEmbed (Status: ${oembedResponse.status}) ---`);
      }
    } catch (error) {
       console.error('--- [/api/summarize] Error fetching video title: ---', error);
       // Non-fatal, proceed without title if necessary
    }

    // Prepare prompt for Google AI using joined text
    const fullPrompt = PROMPT_TEMPLATE.replace('{transcript}', transcriptText);

    // Call Google AI
    console.log('--- [/api/summarize] Calling Google AI API... ---');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or another suitable model
    const generationConfig = {
        temperature: 0.2,
        topP: 0.95,
        // frequencyPenalty, etc. not directly available, control via prompt and temperature
    };

    const result = await model.generateContent(fullPrompt); // Non-streaming for summary
    const response = await result.response;
    const summaryText = response.text();
    console.log('--- [/api/summarize] Google AI response received. ---');


    return NextResponse.json({
      summary: summaryText,
      video_id: videoId,
      video_title: videoTitle,
      transcript: transcriptData // Return the structured transcript array
    });

  } catch (error) {
    console.error('--- [/api/summarize] General Error: ---', error);
    let errorMessage = 'Failed to generate summary';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
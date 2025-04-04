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

// Fallback method to fetch transcript using YouTube's timedtext API
async function fallbackFetchTranscript(videoId: string): Promise<{ text: string; duration: number; offset: number; }[]> {
  console.log(`--- [/api/summarize] Attempting fallback transcript fetch for ${videoId} ---`);
  
  try {
    // First, try to get the available transcript track info
    const trackInfoResponse = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&type=list`);
    
    if (!trackInfoResponse.ok) {
      throw new Error('Failed to fetch track info');
    }
    
    const trackInfoText = await trackInfoResponse.text();
    
    // Parse the XML response to find the first available track
    const trackMatch = trackInfoText.match(/lang_code="([^"]+)".*?lang_original="([^"]+)"/);
    
    if (!trackMatch) {
      throw new Error('No transcript tracks available');
    }
    
    const langCode = trackMatch[1];
    
    // Now fetch the actual transcript with the found language code
    const transcriptResponse = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${langCode}`
    );
    
    if (!transcriptResponse.ok) {
      throw new Error('Failed to fetch transcript content');
    }
    
    const transcriptText = await transcriptResponse.text();
    
    // Parse XML transcript
    const textSegments = transcriptText.match(/<text[^>]*>([\s\S]*?)<\/text>/g) || [];
    const parsedSegments = textSegments.map((segment, index) => {
      const startMatch = segment.match(/start="([^"]+)"/);
      const durMatch = segment.match(/dur="([^"]+)"/);
      const start = startMatch ? parseFloat(startMatch[1]) : index;
      const duration = durMatch ? parseFloat(durMatch[1]) : 2;
      
      // Extract and clean text content
      let text = segment.replace(/<[^>]*>/g, ''); // Remove tags
      text = text.replace(/&amp;/g, '&')
                 .replace(/&lt;/g, '<')
                 .replace(/&gt;/g, '>')
                 .replace(/&quot;/g, '"')
                 .replace(/&#39;/g, "'"); // Handle HTML entities
      
      return {
        text: text.trim(),
        offset: Math.floor(start * 1000), // Convert to ms
        duration: Math.floor(duration * 1000) // Convert to ms
      };
    });
    
    if (parsedSegments.length === 0) {
      throw new Error('Transcript available but empty');
    }
    
    return parsedSegments;
  } catch (error) {
    console.error(`--- [/api/summarize] Fallback transcript fetch failed: ${error instanceof Error ? error.message : String(error)} ---`);
    throw new Error(`Fallback transcript method failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Second fallback: Extract transcript from video metadata if possible
async function getTranscriptFromMetadata(videoId: string): Promise<string> {
  console.log(`--- [/api/summarize] Attempting transcript extraction from metadata for ${videoId} ---`);
  
  try {
    // Fetch the video page HTML
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Try to extract the transcript from page metadata
    // Look for content in the page that might contain transcript data
    let transcript = '';
    
    // Several possible patterns to look for transcript data:
    // 1. Check for "captionTracks" in the ytInitialPlayerResponse
    const captionTracksMatch = html.match(/"captionTracks":\s*\[(.*?)\]/);
    if (captionTracksMatch) {
      const captionTracks = captionTracksMatch[1];
      const baseUrlMatch = captionTracks.match(/"baseUrl":\s*"([^"]+)"/);
      
      if (baseUrlMatch) {
        const captionUrl = baseUrlMatch[1].replace(/\\u0026/g, '&');
        const captionResponse = await fetch(captionUrl);
        if (captionResponse.ok) {
          const captionXml = await captionResponse.text();
          // Extract text from XML (simple approach)
          const textContent = captionXml.replace(/<[^>]*>/g, ' ');
          transcript = textContent;
        }
      }
    }
    
    // 2. Check for transcript in video description
    if (!transcript) {
      const descriptionMatch = html.match(/"description":\s*{"simpleText":\s*"([^"]+)"/);
      if (descriptionMatch) {
        // If description has timestamps, it might contain partial transcript
        transcript = descriptionMatch[1].replace(/\\n/g, ' ');
      }
    }
    
    if (!transcript) {
      throw new Error('Could not extract transcript from metadata');
    }
    
    return transcript;
  } catch (error) {
    console.error(`--- [/api/summarize] Metadata transcript extraction failed: ${error instanceof Error ? error.message : String(error)} ---`);
    throw new Error(`Metadata transcript extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Function to summarize the video directly when no transcript is available
async function generateSummaryWithoutTranscript(videoId: string, videoTitle: string): Promise<string> {
  console.log(`--- [/api/summarize] Generating summary without transcript for ${videoId} ---`);
  
  try {
    const prompt = `You are tasked with creating a useful summary for a YouTube video titled "${videoTitle}" with ID "${videoId}". 
    No transcript is available, but please create a summary that:
    
    1. Acknowledges that this is based on the video title and not actual content
    2. Describes what topics someone might expect to see in a video with this title
    3. Lists possible key points that might be covered
    4. Suggests what viewers might learn from such a video
    
    Format this with proper Markdown headings and bullet points.
    
    Note that since you don't have access to the video content itself, make this clear to the reader.`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`--- [/api/summarize] Failed to generate no-transcript summary: ${error instanceof Error ? error.message : String(error)} ---`);
    throw new Error(`Failed to generate summary without transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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

    // Fetch Video Title (using oEmbed) - do this early to have title available for fallbacks
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

    // Fetch Transcript with multiple fallback methods
    let transcriptData: { text: string; duration: number; offset: number; }[] = []; // Store structured data
    let transcriptText = ''; // Keep joined text for summary prompt
    let usedFallback = false;
    let summaryText = '';
    
    try {
      // Step 1: Try the primary method
      console.log(`--- [/api/summarize] Attempting primary transcript fetch for ${videoId} ---`);
      try {
        transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
        if (!transcriptData || transcriptData.length === 0) {
          throw new Error('Empty transcript returned');
        }
        transcriptText = transcriptData.map(t => t.text).join(' ');
        console.log(`--- [/api/summarize] Primary transcript fetch successful, length: ${transcriptText.length} ---`);
      } catch (primaryError: any) {
        console.log(`--- [/api/summarize] Primary transcript fetch failed: ${primaryError.message} ---`);
        
        // Step 2: Try the first fallback method
        try {
          transcriptData = await fallbackFetchTranscript(videoId);
          transcriptText = transcriptData.map(t => t.text).join(' ');
          usedFallback = true;
          console.log(`--- [/api/summarize] First fallback successful, transcript length: ${transcriptText.length} ---`);
        } catch (fallbackError: any) {
          console.log(`--- [/api/summarize] First fallback failed: ${fallbackError.message} ---`);
          
          // Step 3: Try extracting from metadata
          try {
            transcriptText = await getTranscriptFromMetadata(videoId);
            transcriptData = [{ text: transcriptText, duration: 0, offset: 0 }]; // Simple structure since we don't have timing
            usedFallback = true;
            console.log(`--- [/api/summarize] Metadata extraction successful, transcript length: ${transcriptText.length} ---`);
          } catch (metadataError: any) {
            console.log(`--- [/api/summarize] Metadata extraction failed: ${metadataError.message} ---`);
            
            // Step 4: Generate a title-based summary when all transcript methods fail
            summaryText = await generateSummaryWithoutTranscript(videoId, videoTitle);
            console.log(`--- [/api/summarize] Generated title-based summary (no transcript) ---`);
            
            // Return early with the title-based summary
            return NextResponse.json({
              summary: summaryText,
              video_id: videoId,
              video_title: videoTitle,
              transcript: [], // Empty array since we don't have transcript
              no_transcript: true // Flag to indicate no transcript was available
            });
          }
        }
      }
      
      // If we got here, we have some form of transcript
      
      // Prepare prompt for Google AI using joined text
      const fullPrompt = PROMPT_TEMPLATE.replace('{transcript}', transcriptText);

      // Call Google AI
      console.log('--- [/api/summarize] Calling Google AI API... ---');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      summaryText = response.text();
      console.log('--- [/api/summarize] Google AI response received. ---');

      // Add a note if we used a fallback method
      if (usedFallback) {
        summaryText = `*Note: This summary was generated using an alternative transcript extraction method and may not fully represent the video content.*\n\n${summaryText}`;
      }

      return NextResponse.json({
        summary: summaryText,
        video_id: videoId,
        video_title: videoTitle,
        transcript: transcriptData, // Return the structured transcript array
        used_fallback: usedFallback // Flag to indicate fallback was used
      });
      
    } catch (error) {
      console.error('--- [/api/summarize] All transcript methods failed: ---', error);
      let errorMessage = 'Unable to generate summary from this video.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Try one last approach - generate a summary based just on the video title
      try {
        summaryText = await generateSummaryWithoutTranscript(videoId, videoTitle);
        console.log(`--- [/api/summarize] Generated title-based summary as last resort ---`);
        
        return NextResponse.json({
          summary: summaryText,
          video_id: videoId,
          video_title: videoTitle,
          transcript: [], // Empty array since we don't have transcript
          no_transcript: true, // Flag to indicate no transcript was available
          error_info: errorMessage // Include original error for debugging
        });
      } catch (summaryError) {
        // If even this fails, return an error
        return NextResponse.json({ 
          error: 'Failed to generate any kind of summary', 
          message: errorMessage 
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('--- [/api/summarize] General Error: ---', error);
    let errorMessage = 'Failed to generate summary';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
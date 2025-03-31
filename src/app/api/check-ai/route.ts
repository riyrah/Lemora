import { NextResponse } from 'next/server';

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
  console.log('--- [/api/check-ai] Received request ---');
  try {
    const { text } = await request.json();

    if (!text) {
      console.error('--- [/api/check-ai] Error: Missing text in request body ---');
      return NextResponse.json({ error: 'Missing text in request body' }, { status: 400 });
    }

    const confidenceScore = calculateSimplifiedAIDetectionScore(text);
    console.log(`--- [/api/check-ai] Calculated Score: ${confidenceScore} ---`);

    return NextResponse.json({ confidenceScore });

  } catch (error) {
    console.error('--- [/api/check-ai] Error: ---', error);
    let errorMessage = 'An unexpected error occurred during AI check';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to check AI score', details: errorMessage }, { status: 500 });
  }
} 
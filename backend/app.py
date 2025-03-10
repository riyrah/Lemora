from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
import requests

load_dotenv()
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY") or "",
)

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

PROMPT_TEMPLATE = """Create a simple, easy-to-understand summary from this YouTube video transcript that even a 10-year-old could follow. Follow these rules:

1. Use VERY simple words and short sentences
2. Break down complex ideas into basic concepts
3. Always use examples a child would understand
4. Format strictly using markdown with LOTS of line breaks

Structure:
## 🎥 Video Overview
2-3 super simple sentences about what this video is about

## 📝 Summary
→ Break down EVERYTHING that happens in the video
→ Use lots of bullet points
→ Explain each point in simple words
→ Give examples where needed
→ Make sure to cover all important details
→ Keep each point short and clear

## 🔑 Main Ideas
→ List the most important takeaways
→ Explain why each one matters
→ Use real-world examples

## ❓ Why This Matters
Simple explanation of why this topic is important and how it affects everyday life

## 🚀 Try This
Simple activities or ideas to help understand the topic better

Formatting MUST:
- Use ## for section headers
- Put TWO blank lines between sections
- Use → for ALL bullet points
- Start each bullet point with a new idea
- Keep each point under 2 lines
- Use simple words only
- Maximum 750 words
- Add emojis for visual breaks

Transcript: {transcript}"""

def get_video_id(url: str) -> str:
    if 'v=' in url:
        return url.split('v=')[1].split('&')[0]
    return url.split('/')[-1]

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    url = data.get('url')
    
    try:
        video_id = get_video_id(url)
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = " ".join([t['text'] for t in transcript_list])
        
        # Get video title from YouTube oEmbed API
        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        response = requests.get(oembed_url)
        video_title = "Video Title"
        if response.status_code == 200:
            video_title = response.json().get('title', 'Video Title')
        
        # Generate summary
        gpt_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a gifted teacher who explains complex topics to children."},
                {"role": "user", "content": PROMPT_TEMPLATE.format(transcript=transcript)}
            ],
            temperature=0.1,
            top_p=0.95,
            frequency_penalty=0.5
        )
        
        return jsonify({
            "summary": gpt_response.choices[0].message.content,
            "video_id": video_id,
            "video_title": video_title  # Added title to response
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    url = data.get('url')
    question = data.get('question')
    
    try:
        video_id = get_video_id(url)
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = " ".join([t['text'] for t in transcript_list])
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": f"You are a helpful assistant for a YouTube video. Use this transcript to answer questions: {transcript}"},
                {"role": "user", "content": f"Answer this question based on the video: {question}"}
            ],
            temperature=0.3,
            stream=True  # Enable streaming
        )
        
        def generate():
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"
        
        return Response(generate(), mimetype='text/event-stream')
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate-flashcards', methods=['POST'])
def generate_flashcards():
    data = request.get_json()
    url = data.get('url')
    
    try:
        video_id = get_video_id(url)
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = " ".join([t['text'] for t in transcript_list])
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": """Create exactly 5 high-quality flashcards from this video transcript. Follow STRICTLY:
                - Front must be a clear question
                - Back must be a specific answer with examples
                - Questions should test understanding of key concepts
                - Format as JSON: {"flashcards": [{"front":"...", "back":"..."}]}"""},
                {"role": "user", "content": f"Video transcript: {transcript}"}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        try:
            flashcards = json.loads(response.choices[0].message.content)['flashcards']
            if len(flashcards) != 5:
                raise ValueError("Didn't receive exactly 5 flashcards")
            
            return jsonify({"flashcards": flashcards})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(port=5000, debug=True) 
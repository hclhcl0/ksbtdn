import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  
  if (!text) {
    return new NextResponse('Missing text parameter', { status: 400 });
  }
  
  // Truncate to comply with Google Translate TTS length restrictions (~200 chars)
  const cleanText = text.substring(0, 180);
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
  
  try {
    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      return new NextResponse('Failed to fetch TTS from Google', { status: response.status });
    }
    
    const audioBuffer = await response.arrayBuffer();
    
    // Return audio stream with cache-control headers (cache for 24 hours)
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400'
      }
    });
  } catch (error) {
    console.error('Error in TTS proxy route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

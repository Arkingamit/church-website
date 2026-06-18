import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channelId');

  if (!channelId) {
    return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
  }

  try {
    // If it's a handle like @mkbhd, use it directly, otherwise it might be a channel id
    const isHandle = channelId.startsWith('@');
    const url = isHandle 
      ? `https://www.youtube.com/${channelId}/live` 
      : `https://www.youtube.com/channel/${channelId}/live`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      cache: 'no-store'
    });

    const html = await res.text();

    // Look for canonical URL which points to the watch page if live
    // e.g. <link rel="canonical" href="https://www.youtube.com/watch?v=VIDEO_ID">
    const canonicalMatch = html.match(/rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)"/);
    
    if (canonicalMatch && canonicalMatch[1]) {
      return NextResponse.json({ isLive: true, videoId: canonicalMatch[1] });
    }

    return NextResponse.json({ isLive: false });
  } catch (error) {
    console.error('Error fetching YouTube live status:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

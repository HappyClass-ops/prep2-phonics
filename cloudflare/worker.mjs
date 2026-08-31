const DICTIONARY_ENDPOINT = 'https://dictionaryapi.com/api/v3/references/sd2/json/';
const ELEVENLABS_ENDPOINT = 'https://api.elevenlabs.io/v1/text-to-speech/';
const MAX_SPEECH_CHARACTERS = 600;

function isAllowedOrigin(origin, env) {
  if (!origin) return false;
  if (origin === env.ALLOWED_ORIGIN) return true;
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function jsonResponse(data, status, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...(origin ? corsHeaders(origin) : {})
    }
  });
}

async function dictionaryResponse(request, env, origin) {
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed.' }, 405, origin);
  const word = new URL(request.url).searchParams.get('word')?.trim().toLowerCase() || '';
  if (!/^[a-z]{1,64}$/.test(word)) return jsonResponse({ error: 'Enter one word using letters only.' }, 400, origin);

  const upstreamUrl = DICTIONARY_ENDPOINT + encodeURIComponent(word) + '?key=' + encodeURIComponent(env.MERRIAM_WEBSTER_API_KEY);
  const upstream = await fetch(upstreamUrl, { headers: { Accept: 'application/json' } });
  if (!upstream.ok) return jsonResponse({ error: 'The learning dictionary is unavailable just now.' }, 502, origin);

  return new Response(upstream.body, {
    status: 200,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

async function speechResponse(request, env, origin) {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405, origin);
  let input;
  try {
    input = await request.json();
  } catch {
    return jsonResponse({ error: 'Send speech text as JSON.' }, 400, origin);
  }

  const text = String(input?.text || '').trim();
  if (!text || text.length > MAX_SPEECH_CHARACTERS) {
    return jsonResponse({ error: 'Speech text must contain between 1 and 600 characters.' }, 400, origin);
  }

  const voiceId = env.ELEVENLABS_VOICE_ID;
  const upstreamUrl = ELEVENLABS_ENDPOINT + encodeURIComponent(voiceId) + '?output_format=mp3_44100_128';
  const upstream = await fetch(upstreamUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
      'xi-api-key': env.ELEVENLABS_API_KEY
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.85,
        similarity_boost: 0.85,
        style: 0,
        speed: 0.82
      }
    })
  });

  if (!upstream.ok) return jsonResponse({ error: 'The British voice is unavailable just now.' }, 502, origin);
  return new Response(upstream.body, {
    status: 200,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': upstream.headers.get('Content-Type') || 'audio/mpeg',
      'Cache-Control': 'private, max-age=86400',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return jsonResponse({ ok: true }, 200);

    const origin = request.headers.get('Origin') || '';
    if (!isAllowedOrigin(origin, env)) return jsonResponse({ error: 'Origin not allowed.' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });

    try {
      if (url.pathname === '/api/dictionary') return await dictionaryResponse(request, env, origin);
      if (url.pathname === '/api/speech') return await speechResponse(request, env, origin);
      return jsonResponse({ error: 'Not found.' }, 404, origin);
    } catch {
      return jsonResponse({ error: 'The learning service is unavailable just now.' }, 502, origin);
    }
  }
};


import assert from 'node:assert/strict';
import worker from '../cloudflare/worker.mjs';

const env = {
  ALLOWED_ORIGIN: 'https://happyclass-ops.github.io',
  ELEVENLABS_VOICE_ID: 'british-voice',
  MERRIAM_WEBSTER_API_KEY: 'dictionary-secret',
  ELEVENLABS_API_KEY: 'speech-secret'
};
const allowedOrigin = { Origin: env.ALLOWED_ORIGIN };
const realFetch = globalThis.fetch;

try {
  let upstreamRequest;
  globalThis.fetch = async (url, init = {}) => {
    upstreamRequest = { url: String(url), init };
    return new Response(JSON.stringify([{ shortdef: ['a small animal'] }]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const dictionary = await worker.fetch(new Request('https://worker.example/api/dictionary?word=cat', { headers: allowedOrigin }), env);
  assert.equal(dictionary.status, 200);
  assert.match(upstreamRequest.url, /\/sd2\/json\/cat\?key=dictionary-secret$/);
  assert.equal(dictionary.headers.get('Access-Control-Allow-Origin'), env.ALLOWED_ORIGIN);
  assert.doesNotMatch(await dictionary.text(), /dictionary-secret/);

  const invalidWord = await worker.fetch(new Request('https://worker.example/api/dictionary?word=two%20words', { headers: allowedOrigin }), env);
  assert.equal(invalidWord.status, 400);

  const forbidden = await worker.fetch(new Request('https://worker.example/api/dictionary?word=cat', { headers: { Origin: 'https://example.com' } }), env);
  assert.equal(forbidden.status, 403);

  globalThis.fetch = async (url, init = {}) => {
    upstreamRequest = { url: String(url), init };
    return new Response(new Uint8Array([1, 2, 3]), { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
  };
  const speech = await worker.fetch(new Request('https://worker.example/api/speech', {
    method: 'POST',
    headers: { ...allowedOrigin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Jumped.' })
  }), env);
  assert.equal(speech.status, 200);
  assert.match(upstreamRequest.url, /\/british-voice\?output_format=mp3_44100_128$/);
  assert.equal(upstreamRequest.init.headers['xi-api-key'], 'speech-secret');
  const speechBody = JSON.parse(upstreamRequest.init.body);
  assert.deepEqual(speechBody, {
    text: 'Jumped.',
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.85, similarity_boost: 0.85, style: 0, speed: 0.82 }
  });
  assert.equal(speech.headers.get('Access-Control-Allow-Origin'), env.ALLOWED_ORIGIN);

  const preflight = await worker.fetch(new Request('https://worker.example/api/speech', { method: 'OPTIONS', headers: allowedOrigin }), env);
  assert.equal(preflight.status, 204);
  assert.match(preflight.headers.get('Access-Control-Allow-Methods'), /POST/);
  console.log('PASS: Cloudflare Worker hides secrets, validates input, restricts CORS, and proxies both APIs');
} finally {
  globalThis.fetch = realFetch;
}

import assert from 'node:assert/strict';
import fs from 'node:fs';

const [incomingPath, currentPackPath, pupilAppPath] = process.argv.slice(2);
if (![incomingPath, currentPackPath, pupilAppPath].every(Boolean)) {
  throw new Error('Usage: node scripts/import-master-voice-pack.mjs INCOMING_PACK CURRENT_PACK INDEX_HTML');
}

function decodeDataUri(dataUri) {
  assert.match(dataUri, /^data:audio\/wav;base64,/, 'Every master sound must be a WAV data URI.');
  return Buffer.from(dataUri.slice(dataUri.indexOf(',') + 1), 'base64');
}

function readWav(bytes) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', 'Expected a RIFF audio file.');
  assert.equal(bytes.toString('ascii', 8, 12), 'WAVE', 'Expected a WAVE audio file.');
  let offset = 12;
  let format;
  let data;
  while (offset + 8 <= bytes.length) {
    const id = bytes.toString('ascii', offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    const chunk = offset + 8;
    if (id === 'fmt ') {
      format = {
        type: bytes.readUInt16LE(chunk),
        channels: bytes.readUInt16LE(chunk + 2),
        sampleRate: bytes.readUInt32LE(chunk + 4),
        bits: bytes.readUInt16LE(chunk + 14)
      };
    }
    if (id === 'data') {
      data = bytes.subarray(chunk, chunk + size);
      break;
    }
    offset = chunk + size + (size % 2);
  }
  assert.ok(format && data, 'The WAV file must contain format and data chunks.');
  assert.deepEqual(
    { type: format.type, channels: format.channels, bits: format.bits },
    { type: 1, channels: 1, bits: 16 },
    'Master sounds must be mono 16-bit PCM WAV files.'
  );
  const samples = new Int16Array(Math.floor(data.length / 2));
  for (let index = 0; index < samples.length; index++) samples[index] = data.readInt16LE(index * 2);
  return { sampleRate: format.sampleRate, samples };
}

function encodeWav({ sampleRate, samples }) {
  const bytes = Buffer.alloc(44 + samples.length * 2);
  bytes.write('RIFF', 0);
  bytes.writeUInt32LE(36 + samples.length * 2, 4);
  bytes.write('WAVE', 8);
  bytes.write('fmt ', 12);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(sampleRate, 24);
  bytes.writeUInt32LE(sampleRate * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36);
  bytes.writeUInt32LE(samples.length * 2, 40);
  for (let index = 0; index < samples.length; index++) bytes.writeInt16LE(samples[index], 44 + index * 2);
  return bytes;
}

function trimAndNormalize(wav) {
  const threshold = 0.012;
  let first = 0;
  while (first < wav.samples.length && Math.abs(wav.samples[first] / 32768) < threshold) first++;
  let last = wav.samples.length - 1;
  while (last > first && Math.abs(wav.samples[last] / 32768) < threshold) last--;
  assert.ok(first < wav.samples.length, 'A replacement recording cannot be silent.');
  first = Math.max(0, first - Math.round(wav.sampleRate * 0.05));
  last = Math.min(wav.samples.length - 1, last + Math.round(wav.sampleRate * 0.08));
  const clipped = wav.samples.slice(first, last + 1);
  let activeCount = 0;
  let activeSquares = 0;
  let activePeak = threshold;
  for (const sample of clipped) {
    const value = sample / 32768;
    if (Math.abs(value) < threshold) continue;
    activeCount++;
    activeSquares += value * value;
    activePeak = Math.max(activePeak, Math.abs(value));
  }
  const activeRms = Math.sqrt(activeSquares / Math.max(activeCount, 1));
  const gain = Math.min(0.18 / activeRms, 0.92 / activePeak);
  const normalized = Int16Array.from(clipped, sample => Math.max(-32768, Math.min(32767, Math.round(sample * gain))));
  return { sampleRate: wav.sampleRate, samples: normalized };
}

const incoming = JSON.parse(fs.readFileSync(incomingPath, 'utf8'));
const current = JSON.parse(fs.readFileSync(currentPackPath, 'utf8'));
assert.ok(Array.isArray(incoming.clips) && Array.isArray(current.clips), 'Both voice packs must contain clip arrays.');
assert.equal(incoming.clips.length, current.clips.length, 'The replacement pack must contain the complete master sound inventory.');
assert.equal(new Set(incoming.clips.map(clip => clip.id)).size, incoming.clips.length, 'Replacement sound IDs must be unique.');

const incomingById = new Map(incoming.clips.map(clip => [clip.id, clip]));
const currentIds = current.clips.map(clip => clip.id).sort();
const incomingIds = incoming.clips.map(clip => clip.id).sort();
assert.deepEqual(incomingIds, currentIds, 'The replacement pack must use exactly the published master sound IDs.');

const changedIds = [];
current.clips = current.clips.map(currentClip => {
  const incomingClip = incomingById.get(currentClip.id);
  if (incomingClip.base64Audio === currentClip.base64Audio) return currentClip;
  const normalized = trimAndNormalize(readWav(decodeDataUri(incomingClip.base64Audio)));
  changedIds.push(currentClip.id);
  return {
    ...currentClip,
    grapheme: incomingClip.grapheme || currentClip.grapheme,
    base64Audio: `data:audio/wav;base64,${encodeWav(normalized).toString('base64')}`,
    source: 'teacher'
  };
});

assert.ok(changedIds.length, 'The replacement pack does not contain any changed recordings.');
current.name = 'Prep 2 Little Wandle Master Voice Pack';
current.version = '5.1-normalized-teacher-pack';
current.lastUpdated = new Date().toISOString();
current.totalMasterSounds = current.clips.length;
delete current.exportedAt;
delete current.totalClips;

const serialized = JSON.stringify(current);
fs.writeFileSync(currentPackPath, serialized);
const pupilApp = fs.readFileSync(pupilAppPath, 'utf8');
const updatedApp = pupilApp.replace(/const AUDIO_BUNDLE = .*?;\s*const AUDIO_CACHE/s, `const AUDIO_BUNDLE = ${serialized};\n    const AUDIO_CACHE`);
assert.notEqual(updatedApp, pupilApp, 'Could not find the embedded pupil audio bundle.');
fs.writeFileSync(pupilAppPath, updatedApp);

console.log(`Imported and normalized ${changedIds.length} changed clips: ${changedIds.join(', ')}`);
console.log(`${current.clips.length - changedIds.length} unchanged clips were preserved byte-for-byte.`);

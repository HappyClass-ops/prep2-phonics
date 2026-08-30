import fs from 'node:fs';

const [inputPackPath, correctedEdPath, outputPackPath, pupilAppPath] = process.argv.slice(2);
if (![inputPackPath, correctedEdPath, outputPackPath, pupilAppPath].every(Boolean)) {
  throw new Error('Usage: node scripts/rebuild-audio-pack.mjs INPUT_PACK ED_D_WAV OUTPUT_PACK INDEX_HTML');
}

function decodeDataUri(dataUri) {
  return Buffer.from(dataUri.slice(dataUri.indexOf(',') + 1), 'base64');
}

function readWav(bytes) {
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Expected a RIFF/WAVE file.');
  }
  let offset = 12;
  let format;
  let data;
  while (offset + 8 <= bytes.length) {
    const id = bytes.toString('ascii', offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    const chunk = offset + 8;
    if (id === 'fmt ') format = { type: bytes.readUInt16LE(chunk), channels: bytes.readUInt16LE(chunk + 2), sampleRate: bytes.readUInt32LE(chunk + 4), bits: bytes.readUInt16LE(chunk + 14) };
    if (id === 'data') { data = bytes.subarray(chunk, chunk + size); break; }
    offset = chunk + size + (size % 2);
  }
  if (!format || !data || format.type !== 1 || format.channels !== 1 || format.bits !== 16) {
    throw new Error('Only mono 16-bit PCM WAV clips are supported.');
  }
  const samples = new Int16Array(data.buffer, data.byteOffset, Math.floor(data.length / 2));
  return { sampleRate: format.sampleRate, samples: Int16Array.from(samples) };
}

function encodeWav({ sampleRate, samples }) {
  const bytes = Buffer.alloc(44 + samples.length * 2);
  bytes.write('RIFF', 0); bytes.writeUInt32LE(36 + samples.length * 2, 4); bytes.write('WAVE', 8);
  bytes.write('fmt ', 12); bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(sampleRate, 24); bytes.writeUInt32LE(sampleRate * 2, 28); bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36); bytes.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) bytes.writeInt16LE(samples[i], 44 + i * 2);
  return bytes;
}

function trimAndNormalize(wav) {
  const threshold = 0.012;
  const values = wav.samples;
  let first = 0; while (first < values.length && Math.abs(values[first] / 32768) < threshold) first++;
  let last = values.length - 1; while (last > first && Math.abs(values[last] / 32768) < threshold) last--;
  first = Math.max(0, first - Math.round(wav.sampleRate * 0.05));
  last = Math.min(values.length - 1, last + Math.round(wav.sampleRate * 0.08));
  const clipped = values.slice(first, last + 1);
  const active = [...clipped].map(v => v / 32768).filter(v => Math.abs(v) >= threshold);
  const rms = Math.sqrt(active.reduce((total, v) => total + v * v, 0) / Math.max(active.length, 1));
  const peak = Math.max(...active.map(Math.abs), threshold);
  // A consistent speech RMS is more useful than peak matching alone.  The
  // peak ceiling prevents clipping on plosive phonemes.
  const gain = Math.min(0.18 / rms, 0.92 / peak);
  const normalized = Int16Array.from(clipped, v => Math.max(-32768, Math.min(32767, Math.round(v * gain))));
  return { sampleRate: wav.sampleRate, samples: normalized };
}

const pack = JSON.parse(fs.readFileSync(inputPackPath, 'utf8'));
const correctedEd = fs.readFileSync(correctedEdPath);
for (const clip of pack.clips) {
  const bytes = clip.id === 'ed-d' ? correctedEd : decodeDataUri(clip.base64Audio);
  const wav = trimAndNormalize(readWav(bytes));
  clip.base64Audio = `data:audio/wav;base64,${encodeWav(wav).toString('base64')}`;
  clip.source = 'teacher';
}
pack.name = 'Prep 2 Little Wandle Master Voice Pack';
pack.version = '5.0-normalized-teacher-pack';
pack.lastUpdated = new Date().toISOString();
pack.totalMasterSounds = pack.clips.length;
delete pack.exportedAt;
delete pack.totalClips;
const serialized = JSON.stringify(pack);
fs.writeFileSync(outputPackPath, serialized);

const html = fs.readFileSync(pupilAppPath, 'utf8');
const updatedHtml = html.replace(/const AUDIO_BUNDLE = .*?;\s*const AUDIO_CACHE/s, `const AUDIO_BUNDLE = ${serialized};\n    const AUDIO_CACHE`);
if (updatedHtml === html) throw new Error('Could not find the embedded pupil audio bundle.');
fs.writeFileSync(pupilAppPath, updatedHtml);
console.log(`Normalized ${pack.clips.length} clips and embedded the same pack in the pupil app.`);

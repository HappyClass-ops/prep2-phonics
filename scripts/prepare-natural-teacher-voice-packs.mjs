import assert from 'node:assert/strict';
import fs from 'node:fs';

const [soundInputPath, wordInputPath, soundOutputPath, wordOutputPath, pupilAppPath] = process.argv.slice(2);
if (![soundInputPath, wordInputPath, soundOutputPath, wordOutputPath, pupilAppPath].every(Boolean)) {
  throw new Error('Usage: node scripts/prepare-natural-teacher-voice-packs.mjs SOUND_INPUT WORD_INPUT SOUND_OUTPUT WORD_OUTPUT INDEX_HTML');
}

function decodeDataUri(dataUri) {
  assert.match(dataUri, /^data:audio\/wav;base64,/, 'Every recording must be a WAV data URI.');
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
    const chunkOffset = offset + 8;
    if (id === 'fmt ') {
      format = {
        type: bytes.readUInt16LE(chunkOffset),
        channels: bytes.readUInt16LE(chunkOffset + 2),
        sampleRate: bytes.readUInt32LE(chunkOffset + 4),
        bits: bytes.readUInt16LE(chunkOffset + 14)
      };
    } else if (id === 'data') {
      data = bytes.subarray(chunkOffset, chunkOffset + size);
      break;
    }
    offset = chunkOffset + size + (size % 2);
  }
  assert.ok(format && data, 'The WAV file must contain format and data chunks.');
  assert.deepEqual(
    { type: format.type, channels: format.channels, bits: format.bits },
    { type: 1, channels: 1, bits: 16 },
    'Recordings must be mono 16-bit PCM WAV files.'
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

function frameStats(wav) {
  const frameSize = Math.round(wav.sampleRate * 0.005);
  const frames = [];
  for (let start = 0; start < wav.samples.length; start += frameSize) {
    let squares = 0;
    let peak = 0;
    const length = Math.min(frameSize, wav.samples.length - start);
    for (let index = 0; index < length; index++) {
      const value = Math.abs(wav.samples[start + index] / 32768);
      squares += value * value;
      peak = Math.max(peak, value);
    }
    frames.push({ start, rms: Math.sqrt(squares / length), peak });
  }
  return { frameSize, frames };
}

function activityClusters(wav) {
  const { frameSize, frames } = frameStats(wav);
  const active = frames.map(frame => frame.rms > 0.005 || frame.peak > 0.04);
  const mergeGapFrames = 16; // Keep natural within-word gaps up to 80 ms together.
  const clusters = [];
  let index = 0;
  while (index < active.length) {
    while (index < active.length && !active[index]) index++;
    if (index >= active.length) break;
    const startFrame = index;
    let endFrame = index;
    while (endFrame + 1 < active.length) {
      let next = endFrame + 1;
      let gap = 0;
      while (next < active.length && !active[next] && gap < mergeGapFrames) {
        next++;
        gap++;
      }
      if (next < active.length && active[next] && gap < mergeGapFrames) endFrame = next;
      else break;
    }
    while (endFrame + 1 < active.length && active[endFrame + 1]) endFrame++;
    const selectedFrames = frames.slice(startFrame, endFrame + 1);
    clusters.push({
      start: startFrame * frameSize,
      end: Math.min(wav.samples.length, (endFrame + 1) * frameSize),
      peak: Math.max(...selectedFrames.map(frame => frame.peak))
    });
    index = endFrame + 1;
  }
  return clusters;
}

function removeSafelySeparatedReleaseNoise(wav) {
  const clusters = activityClusters(wav);
  if (clusters.length < 2) return { changed: false, wav };
  const mainIndex = clusters.reduce((best, cluster, index) => cluster.peak > clusters[best].peak ? index : best, 0);
  const main = clusters[mainIndex];
  const after = clusters.slice(mainIndex + 1);
  if (!after.length) return { changed: false, wav };

  const gapSeconds = (after[0].start - main.end) / wav.sampleRate;
  const tailSeconds = (after.at(-1).end - after[0].start) / wav.sampleRate;
  const tailPeak = Math.max(...after.map(cluster => cluster.peak));
  const mainSeconds = (main.end - main.start) / wav.sampleRate;
  const safeReleaseNoise = main.peak >= 0.3
    && mainSeconds >= 0.18
    && gapSeconds >= 0.075
    && tailSeconds <= 0.22
    && tailPeak <= 0.12
    && tailPeak <= main.peak * 0.15;
  if (!safeReleaseNoise) return { changed: false, wav };

  const padding = Math.round(wav.sampleRate * 0.05);
  const end = Math.min(wav.samples.length, main.end + padding);
  const samples = wav.samples.slice(0, end);
  const fadeLength = Math.min(Math.round(wav.sampleRate * 0.01), Math.floor(samples.length / 4));
  for (let index = 0; index < fadeLength; index++) {
    const gain = (fadeLength - index - 1) / fadeLength;
    samples[samples.length - fadeLength + index] = Math.round(samples[samples.length - fadeLength + index] * gain);
  }
  return { changed: true, wav: { sampleRate: wav.sampleRate, samples } };
}

function validatePack(pack, expectedCount, label) {
  assert.ok(Array.isArray(pack.clips), `${label} must contain a clips array.`);
  assert.equal(pack.clips.length, expectedCount, `${label} must contain exactly ${expectedCount} recordings.`);
  assert.equal(new Set(pack.clips.map(clip => clip.id)).size, expectedCount, `${label} IDs must be unique.`);
  pack.clips.forEach(clip => readWav(decodeDataUri(clip.base64Audio)));
}

const soundInput = JSON.parse(fs.readFileSync(soundInputPath, 'utf8'));
const wordInput = JSON.parse(fs.readFileSync(wordInputPath, 'utf8'));
validatePack(soundInput, 75, 'Phonics pack');
validatePack(wordInput, 93, 'Tricky-word pack');

const sounds = {
  ...soundInput,
  name: 'Prep 2 Little Wandle Master Voice Pack',
  version: '6.1-natural-teacher-pack',
  lastUpdated: new Date().toISOString(),
  totalMasterSounds: 75,
  clips: soundInput.clips.map(clip => ({ ...clip, source: 'teacher' }))
};
delete sounds.voiceProfile;
delete sounds.totalClips;

const cleanedIds = [];
const words = {
  ...wordInput,
  name: 'Prep 2 Little Wandle Tricky Word Voice Pack',
  version: '2.1-natural-teacher-pack-declicked',
  lastUpdated: new Date().toISOString(),
  totalClips: 93,
  clips: wordInput.clips.map(clip => {
    const result = removeSafelySeparatedReleaseNoise(readWav(decodeDataUri(clip.base64Audio)));
    if (!result.changed) return { ...clip, source: 'teacher' };
    cleanedIds.push(clip.id);
    return {
      ...clip,
      base64Audio: `data:audio/wav;base64,${encodeWav(result.wav).toString('base64')}`,
      source: 'teacher-end-cleaned'
    };
  })
};
delete words.voiceProfile;
delete words.exportedAt;
words.endNoiseCleanup = {
  method: 'Separated low-level release noise only',
  cleanedIds
};

const expectedCleanedIds = ['tricky:of', 'tricky:once', 'tricky:parents', 'tricky:want', 'tricky:work'];
assert.deepEqual(cleanedIds.slice().sort(), expectedCleanedIds, 'The conservative detector found an unexpected set of recordings. Review before publishing.');
assert.deepEqual(sounds.clips.map(clip => clip.base64Audio), soundInput.clips.map(clip => clip.base64Audio), 'Phoneme recordings must remain byte-for-byte natural.');
words.clips.forEach((clip, index) => {
  const before = readWav(decodeDataUri(wordInput.clips[index].base64Audio));
  const after = readWav(decodeDataUri(clip.base64Audio));
  assert.equal(after.sampleRate, before.sampleRate, `${clip.id} sample rate changed.`);
  if (!cleanedIds.includes(clip.id)) assert.equal(clip.base64Audio, wordInput.clips[index].base64Audio, `${clip.id} changed unexpectedly.`);
  else {
    assert.ok(after.samples.length < before.samples.length, `${clip.id} release noise was not trimmed.`);
    assert.ok(after.samples.length / after.sampleRate >= 0.2, `${clip.id} became too short.`);
  }
});

const soundJson = JSON.stringify(sounds);
const wordJson = JSON.stringify(words);
fs.writeFileSync(soundOutputPath, soundJson);
fs.writeFileSync(wordOutputPath, wordJson);

const pupilApp = fs.readFileSync(pupilAppPath, 'utf8');
const withSounds = pupilApp.replace(/const AUDIO_BUNDLE = .*?;\s*const AUDIO_CACHE/s, `const AUDIO_BUNDLE = ${soundJson};\n    const AUDIO_CACHE`);
assert.notEqual(withSounds, pupilApp, 'Could not replace the embedded phonics pack.');
const withWords = withSounds.replace(/const WORD_AUDIO_BUNDLE = .*?;\s*const WORD_AUDIO_CACHE/s, `const WORD_AUDIO_BUNDLE = ${wordJson};\n    const WORD_AUDIO_CACHE`);
assert.notEqual(withWords, withSounds, 'Could not replace the embedded tricky-word pack.');
fs.writeFileSync(pupilAppPath, withWords);

console.log('Restored all 75 phoneme recordings to the natural teacher voice.');
console.log(`Removed safely separated end noise from ${cleanedIds.length} tricky words: ${cleanedIds.join(', ')}`);

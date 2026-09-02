import assert from 'node:assert/strict';
import fs from 'node:fs';

const [soundInputPath, wordInputPath, soundOutputPath, wordOutputPath, pupilAppPath] = process.argv.slice(2);
if (![soundInputPath, wordInputPath, soundOutputPath, wordOutputPath, pupilAppPath].every(Boolean)) {
  throw new Error('Usage: node scripts/process-teacher-voice-packs.mjs SOUND_INPUT WORD_INPUT SOUND_OUTPUT WORD_OUTPUT INDEX_HTML');
}

const PROFILE = {
  name: 'Deeper Teacher Voice',
  pitchRatio: 0.82,
  pitchSemitones: 12 * Math.log2(0.82),
  targetActiveRms: 0.18,
  peakLimit: 0.92
};

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
  const samples = new Float32Array(Math.floor(data.length / 2));
  for (let index = 0; index < samples.length; index++) samples[index] = data.readInt16LE(index * 2) / 32768;
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
  for (let index = 0; index < samples.length; index++) {
    const value = Math.max(-1, Math.min(0.999969, samples[index]));
    bytes.writeInt16LE(Math.round(value * 32768), 44 + index * 2);
  }
  return bytes;
}

function removeDc(samples) {
  const mean = samples.reduce((sum, value) => sum + value, 0) / Math.max(1, samples.length);
  return Float32Array.from(samples, value => value - mean);
}

function resampleForLowerPitch(samples, ratio) {
  const output = new Float32Array(Math.max(1, Math.round(samples.length / ratio)));
  for (let index = 0; index < output.length; index++) {
    const sourcePosition = Math.min(samples.length - 1, index * ratio);
    const left = Math.floor(sourcePosition);
    const right = Math.min(samples.length - 1, left + 1);
    const fraction = sourcePosition - left;
    output[index] = samples[left] * (1 - fraction) + samples[right] * fraction;
  }
  return output;
}

function normalizedCorrelation(reference, input, inputOffset, length, stride = 4) {
  let cross = 0;
  let referencePower = 0;
  let inputPower = 0;
  for (let index = 0; index < length; index += stride) {
    const left = reference[index];
    const right = input[inputOffset + index];
    cross += left * right;
    referencePower += left * left;
    inputPower += right * right;
  }
  const denominator = Math.sqrt(referencePower * inputPower);
  return denominator > 1e-9 ? cross / denominator : -1;
}

function timeCompressWsola(input, targetLength, sampleRate) {
  if (input.length <= targetLength + 2) return input.slice(0, targetLength);

  let frameSize = Math.min(Math.round(sampleRate * 0.04), Math.max(256, Math.floor(input.length * 0.52)));
  frameSize -= frameSize % 2;
  const overlap = Math.max(96, Math.round(frameSize * 0.5));
  const synthesisHop = frameSize - overlap;
  const timeRatio = targetLength / input.length;
  const analysisHop = synthesisHop / timeRatio;
  const searchRadius = Math.min(Math.round(sampleRate * 0.006), Math.max(16, Math.round(frameSize * 0.18)));
  const output = new Float32Array(targetLength + frameSize);
  const weights = new Float32Array(targetLength + frameSize);
  const window = Float32Array.from({ length: frameSize }, (_, index) => {
    const hann = 0.5 - 0.5 * Math.cos((2 * Math.PI * (index + 0.5)) / frameSize);
    return Math.sqrt(hann);
  });

  let previousInputPosition = 0;
  let outputPosition = 0;
  while (outputPosition < targetLength) {
    let inputPosition = previousInputPosition;
    if (outputPosition > 0) {
      const predicted = Math.round(previousInputPosition + analysisHop);
      const minimum = Math.max(0, predicted - searchRadius);
      const maximum = Math.min(input.length - frameSize, predicted + searchRadius);
      const reference = input.subarray(previousInputPosition + frameSize - overlap, previousInputPosition + frameSize);
      let bestScore = -Infinity;
      let bestPosition = Math.max(0, Math.min(input.length - frameSize, predicted));
      for (let candidate = minimum; candidate <= maximum; candidate += 3) {
        const score = normalizedCorrelation(reference, input, candidate, overlap);
        if (score > bestScore) {
          bestScore = score;
          bestPosition = candidate;
        }
      }
      inputPosition = bestPosition;
    }

    const available = Math.min(frameSize, input.length - inputPosition, targetLength - outputPosition);
    for (let index = 0; index < available; index++) {
      const weight = window[index];
      output[outputPosition + index] += input[inputPosition + index] * weight;
      weights[outputPosition + index] += weight;
    }
    previousInputPosition = inputPosition;
    outputPosition += synthesisHop;
    if (inputPosition + frameSize >= input.length && outputPosition < targetLength) previousInputPosition = Math.max(0, input.length - frameSize);
  }

  const result = new Float32Array(targetLength);
  for (let index = 0; index < result.length; index++) result[index] = weights[index] > 1e-7 ? output[index] / weights[index] : 0;
  return result;
}

function normalizeAndFade(samples, sampleRate) {
  const threshold = 0.012;
  let activeSquares = 0;
  let activeCount = 0;
  let peak = 0;
  for (const value of samples) {
    const magnitude = Math.abs(value);
    peak = Math.max(peak, magnitude);
    if (magnitude >= threshold) {
      activeSquares += value * value;
      activeCount++;
    }
  }
  assert.ok(activeCount > 0 && peak > threshold, 'A recording cannot be silent.');
  const activeRms = Math.sqrt(activeSquares / activeCount);
  const gain = Math.min(PROFILE.targetActiveRms / activeRms, PROFILE.peakLimit / peak);
  const fadeLength = Math.min(Math.round(sampleRate * 0.005), Math.floor(samples.length / 4));
  const output = Float32Array.from(samples, value => value * gain);
  for (let index = 0; index < fadeLength; index++) {
    const envelope = (index + 1) / fadeLength;
    output[index] *= envelope;
    output[output.length - 1 - index] *= envelope;
  }
  return output;
}

function processRecording(dataUri) {
  const original = readWav(decodeDataUri(dataUri));
  assert.ok(original.samples.length >= 256, 'A recording is too short to process safely.');
  const clean = removeDc(original.samples);
  const pitchLowered = resampleForLowerPitch(clean, PROFILE.pitchRatio);
  const restoredTiming = timeCompressWsola(pitchLowered, clean.length, original.sampleRate);
  const finished = normalizeAndFade(removeDc(restoredTiming), original.sampleRate);
  return `data:audio/wav;base64,${encodeWav({ sampleRate: original.sampleRate, samples: finished }).toString('base64')}`;
}

function validateUniqueClips(pack, expectedCount, label) {
  assert.ok(Array.isArray(pack.clips), `${label} must contain a clips array.`);
  assert.equal(pack.clips.length, expectedCount, `${label} must contain exactly ${expectedCount} recordings.`);
  assert.equal(new Set(pack.clips.map(clip => clip.id)).size, expectedCount, `${label} recording IDs must be unique.`);
  assert.ok(pack.clips.every(clip => typeof clip.base64Audio === 'string'), `${label} recordings must contain audio.`);
  assert.ok(!String(pack.version || '').includes('deeper-voice'), `${label} has already been voice-processed; use a clean Studio export.`);
}

function processPack(pack, { expectedCount, name, version }) {
  validateUniqueClips(pack, expectedCount, name);
  const output = {
    ...pack,
    name,
    version,
    lastUpdated: new Date().toISOString(),
    voiceProfile: {
      name: PROFILE.name,
      pitchSemitones: Number(PROFILE.pitchSemitones.toFixed(2)),
      timingPreserved: true,
      clarityPriority: true
    },
    clips: pack.clips.map(clip => ({
      ...clip,
      base64Audio: processRecording(clip.base64Audio),
      source: 'teacher-voice-shifted'
    }))
  };
  delete output.exportedAt;
  output.totalClips = output.clips.length;
  return output;
}

function verifyProcessedPack(original, processed, label) {
  assert.deepEqual(processed.clips.map(clip => clip.id), original.clips.map(clip => clip.id), `${label} IDs changed during processing.`);
  processed.clips.forEach((clip, index) => {
    const before = readWav(decodeDataUri(original.clips[index].base64Audio));
    const after = readWav(decodeDataUri(clip.base64Audio));
    assert.equal(after.sampleRate, before.sampleRate, `${clip.id} sample rate changed.`);
    assert.equal(after.samples.length, before.samples.length, `${clip.id} timing changed.`);
    assert.notEqual(clip.base64Audio, original.clips[index].base64Audio, `${clip.id} was not processed.`);
    let peak = 0;
    let active = 0;
    for (const value of after.samples) {
      peak = Math.max(peak, Math.abs(value));
      if (Math.abs(value) >= 0.012) active++;
    }
    assert.ok(active > 0, `${clip.id} became silent.`);
    assert.ok(peak <= PROFILE.peakLimit + 0.001, `${clip.id} exceeds the safe peak limit.`);
  });
}

const soundInput = JSON.parse(fs.readFileSync(soundInputPath, 'utf8'));
const wordInput = JSON.parse(fs.readFileSync(wordInputPath, 'utf8'));
const sounds = processPack(soundInput, {
  expectedCount: 75,
  name: 'Prep 2 Little Wandle Master Voice Pack',
  version: '6.0-deeper-voice-teacher-pack'
});
const words = processPack(wordInput, {
  expectedCount: 93,
  name: 'Prep 2 Little Wandle Tricky Word Voice Pack',
  version: '2.0-deeper-voice-teacher-pack'
});
verifyProcessedPack(soundInput, sounds, 'Phonics pack');
verifyProcessedPack(wordInput, words, 'Tricky-word pack');

const soundJson = JSON.stringify(sounds);
const wordJson = JSON.stringify(words);
fs.writeFileSync(soundOutputPath, soundJson);
fs.writeFileSync(wordOutputPath, wordJson);

const pupilApp = fs.readFileSync(pupilAppPath, 'utf8');
const withSounds = pupilApp.replace(
  /const AUDIO_BUNDLE = .*?;\s*const AUDIO_CACHE/s,
  `const AUDIO_BUNDLE = ${soundJson};\n    const AUDIO_CACHE`
);
assert.notEqual(withSounds, pupilApp, 'Could not find the embedded phonics audio bundle.');
const withWords = /const WORD_AUDIO_BUNDLE = /s.test(withSounds)
  ? withSounds.replace(/const WORD_AUDIO_BUNDLE = .*?;\s*const WORD_AUDIO_CACHE/s, `const WORD_AUDIO_BUNDLE = ${wordJson};\n    const WORD_AUDIO_CACHE`)
  : withSounds.replace(
      /const WORD_AUDIO_CACHE = new Map\(\);/,
      `const WORD_AUDIO_BUNDLE = ${wordJson};\n    const WORD_AUDIO_CACHE = new Map();\n    WORD_AUDIO_BUNDLE.clips.forEach(clip => WORD_AUDIO_CACHE.set(clip.id, clip.base64Audio));`
    );
assert.notEqual(withWords, withSounds, 'Could not embed the tricky-word audio bundle.');
fs.writeFileSync(pupilAppPath, withWords);

console.log(`Processed ${sounds.clips.length} phonics recordings and ${words.clips.length} tricky-word recordings.`);
console.log(`Applied ${PROFILE.pitchSemitones.toFixed(2)} semitones with original clip timing preserved.`);

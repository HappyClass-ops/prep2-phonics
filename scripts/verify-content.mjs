import assert from 'node:assert/strict';
import fs from 'node:fs';

const pack = JSON.parse(fs.readFileSync('little_wandle_master_voice_pack_v3.json', 'utf8'));
assert.equal(pack.clips.length, 75, 'All 75 teacher clips must be published.');
assert.equal(new Set(pack.clips.map(clip => clip.id)).size, 75, 'Clip ids must be unique.');
assert.ok(pack.clips.every(clip => clip.base64Audio.startsWith('data:audio/wav;base64,')), 'Every clip must be playable WAV audio.');
assert.ok(pack.clips.find(clip => clip.id === 'ed-d'), 'The supplied -ed /d/ clip must be included.');

const app = fs.readFileSync('index.html', 'utf8');
const bundleMatch = app.match(/const AUDIO_BUNDLE = (.*?);\s*const AUDIO_CACHE/s);
assert.ok(bundleMatch, 'The pupil app must contain its published audio bundle.');
const embedded = JSON.parse(bundleMatch[1]);
assert.deepEqual(embedded.clips, pack.clips, 'Teacher Studio and pupil app must use identical audio.');
assert.match(app, /function isAcceptedDictionaryEntry[\s\S]*?entry\.meta[\s\S]*?entry\.ins[\s\S]*?entry\.hwi/, 'Dictionary results must be filtered by provider-owned accepted forms.');
assert.match(app, /const shortDefinitions[\s\S]*?shortDefinitions\.length/, 'Elementary short definitions must be preferred over raw technical sense text.');
assert.match(app, /function applyDictionaryPronunciation/, 'Selected dictionary pronunciations must control ambiguous phonics.');
assert.match(app, /function buildVerifiedImageQueries/, 'Image searches must be built from the selected verified sense.');
assert.doesNotMatch(app, /currentWordAudioUrl|PRIMARY_CURATED_DB/, 'Audio and meanings must not come from stale global or offline dictionary state.');
assert.doesNotMatch(app, /I can see the word/, 'The pupil app must not fabricate a generic sentence when the provider has no example.');
assert.match(fs.readFileSync('studio.html', 'utf8'), /s\.needsUpdate && \(!stem \|\| !stem\.hasAudio\)/, 'The studio must only flag clips that are actually missing.');
console.log('Content checks passed: audio pack, exact dictionary ownership, pronunciation-aware phonics, safe learning content, and studio status.');

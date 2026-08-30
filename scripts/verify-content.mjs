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
assert.match(app, /'trail':\s*\{[\s\S]*?Verb \(Follow Behind\)[\s\S]*?Noun \(Path\)/, 'Trail must offer child-appropriate verb and noun meanings.');
assert.match(app, /'nonsense':\s*\{[\s\S]*?Words or ideas that do not make sense/, 'Nonsense must have a child-appropriate meaning.');
assert.match(fs.readFileSync('studio.html', 'utf8'), /s\.needsUpdate && \(!stem \|\| !stem\.hasAudio\)/, 'The studio must only flag clips that are actually missing.');
console.log('Content checks passed: audio pack, pupil bundle, child-safe senses, and studio status.');

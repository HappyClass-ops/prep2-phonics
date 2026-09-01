# Visual Dictionary

Interactive phonics dictionary and pupil learning app with authentic teacher voice recordings.

The pupil app opens in silent mode. Sound buttons and blending still animate,
but no audio can play until a teacher taps **Silent** and enters PIN `8888` on
the Teacher Studio-style keypad. Tapping **Voice on** returns the app to silent
mode immediately.

## Try It First

Silent searches begin with one compact, inline sound-button activity on the
main dictionary page. Pupils tap a single letter for one sound, swipe across
adjacent letters for a digraph, trigraph, quadgraph, or suffix sound, and draw
from a vowel to final `e` for a split digraph. The completed phoneme map and
blend controls remain hidden until the pupil's groups are correct.

The first unsuccessful check prompts the pupil to listen for the number of
sounds. The second points towards a likely letter team without completing the
word. The third says to call a teacher and deliberately leaves the pupil's
attempt visible for discussion; it never reveals the answer after repeated
guessing. Pupils may keep editing with teacher support. Successful challenges
stay complete only for the current page session, so a reload restores genuine
independent practice. Tricky words receive a separate prompt to read known
parts and ask a teacher, because a regular segmentation challenge would teach
the wrong rule.

## 🚀 Live Links
- **Pupil App**: [Open Student App](https://happyclass-ops.github.io/prep2-phonics/)
- **Teacher Studio (PIN Locked)**: [Open Teacher Studio](https://happyclass-ops.github.io/prep2-phonics/studio/)

## Dictionary data

The pupil dictionary looks up entries live from Merriam-Webster's Elementary
Dictionary API through the `prep2-phonics-api` Cloudflare Worker. The app shows provider-supplied meanings, word classes,
examples, pronunciations, and audio; it does not ship or fall back to a local
historical dictionary, guessed root word, or generated definition.

The browser contains no Merriam-Webster or ElevenLabs credentials. Cloudflare
stores both as encrypted Worker secrets, validates requests, and permits browser
requests only from the published GitHub Pages origin or local development.
Deploy the proxy with `npx wrangler deploy`; the required secret names are
declared in `wrangler.toml` and their values must be added with
`npx wrangler secret put MERRIAM_WEBSTER_API_KEY` and
`npx wrangler secret put ELEVENLABS_API_KEY`.

Returned entries are accepted only when the searched spelling is present in
the provider's headword, stems, or inflection records. The app prefers the
Elementary Dictionary's concise `shortdef` text, keeps meanings and image
searches tied to the selected entry, and exposes provider-supplied alternate
pronunciations for identical spellings. If Merriam-Webster has no exact
recording for a form, the full-word audio button is disabled instead of playing
a related word.

The app also blocks a provider recording when the same audio file is attached
to different pronunciations of a homograph. Teacher-recorded pronunciation
overrides and tricky-word models can be created in Teacher Studio. The app now
contains the full 93-word set verified from the local Little Wandle Year 1
termly overviews. Tricky words never use generated or dictionary voice: they
play only the teacher's matching recording, and remain non-interactive when
silent mode is on or when a recording has not been supplied. Local
recordings work immediately in the same browser; to make them available to all
pupils, export `little_wandle_word_voice_pack.json` and publish that file with
the app.

The Example Builder has one mode because it rebuilds the provider's trusted
example rather than inventing an artificial “hard” sentence. It preserves the
opening capital and final punctuation. Meaning buttons include a short
definition preview so pupils can choose by meaning rather than labels such as
“Noun 1”.

## Read-aloud

When a teacher unlocks voiced mode, ElevenLabs' British voice provides English
read-aloud for ordinary whole words, definitions, dictionary examples, and successfully completed
Example Builder puzzles. Whole-word requests include the selected meaning as
silent context so homographs can be pronounced for the active sense. Teacher
word recordings still take priority when present; if ElevenLabs is unavailable,
the app uses Merriam-Webster audio only when that exact pronunciation is safe.
Browser speech remains the last-resort fallback for definitions and examples,
because Merriam-Webster does not provide audio for those full passages.

Tricky words are deliberately excluded from all AI and provider fallbacks so
the teacher remains the only voice model for that set.

Image buttons open a Google Images search with SafeSearch enabled. Each query
is rebuilt from the selected verified word and meaning; no unrelated API entry
or unverified fallback text can supply the image context.

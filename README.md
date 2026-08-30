# Prep 2 Little Wandle Phonics & Visual Dictionary

Interactive phonics dictionary and pupil learning app with authentic teacher voice recordings.

## 🚀 Live Links
- **Pupil App**: [Open Student App](https://happyclass-ops.github.io/prep2-phonics/)
- **Teacher Studio (PIN Locked)**: [Open Teacher Studio](https://happyclass-ops.github.io/prep2-phonics/studio/)

## Dictionary data

The pupil dictionary looks up entries live from Merriam-Webster's Elementary
Dictionary API. The app shows provider-supplied meanings, word classes,
examples, pronunciations, and audio; it does not ship or fall back to a local
historical dictionary, guessed root word, or generated definition.

Returned entries are accepted only when the searched spelling is present in
the provider's headword, stems, or inflection records. The app prefers the
Elementary Dictionary's concise `shortdef` text, keeps meanings and image
searches tied to the selected entry, and exposes provider-supplied alternate
pronunciations for identical spellings. If Merriam-Webster has no exact
recording for a form, the full-word audio button is disabled instead of playing
a related word.

The app also blocks a provider recording when the same audio file is attached
to different pronunciations of a homograph. Teacher-recorded pronunciation
overrides and tricky-word models can be created in Teacher Studio. Local
recordings work immediately in the same browser; to make them available to all
pupils, export `little_wandle_word_voice_pack.json` and publish that file with
the app.

The Example Builder has one mode because it rebuilds the provider's trusted
example rather than inventing an artificial “hard” sentence. It preserves the
opening capital and final punctuation. Meaning buttons include a short
definition preview so pupils can choose by meaning rather than labels such as
“Noun 1”.

Image buttons open a Google Images search with SafeSearch enabled. Each query
is rebuilt from the selected verified word and meaning; no unrelated API entry
or unverified fallback text can supply the image context.

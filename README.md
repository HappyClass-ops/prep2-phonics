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

Image buttons open a Google Images search with SafeSearch enabled. Each query
is rebuilt from the selected verified word and meaning; no unrelated API entry
or unverified fallback text can supply the image context.

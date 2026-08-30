# Dictionary and audio architecture

## Published audio

- One normalized 75-clip teacher pack is published in both the Teacher Studio
  and pupil app.
- The supplied standalone `ed-d.wav` is used for the `-ed (/d/)` sound.
- A clip is marked unfinished only when it has no playable audio.

## Pupil dictionary

- Merriam-Webster Elementary Dictionary is the sole source of meanings,
  examples, word classes, pronunciations, and full-word audio.
- The app never uses a historical dictionary, guesses a base word, generates a
  definition, or invents a sentence.
- Multiple provider meanings appear as selectable meaning buttons.
- API records are retained only when the exact searched form belongs to the
  provider's headword, stem, or inflection metadata.
- Concise Elementary Dictionary short definitions are preferred; selected
  meanings own their examples, image queries, pronunciations, and audio.
- Alternate provider pronunciations for the same spelling are selectable and
  update both the phonics buttons and whole-word recording.
- If the provider has no exact example, sentence, or recording, that feature is
  disabled rather than supplied from fabricated or related-word content.
- If the provider has no entry, pupils can use phonics blending only; the app
  does not claim a definition, picture context, or full-word pronunciation.

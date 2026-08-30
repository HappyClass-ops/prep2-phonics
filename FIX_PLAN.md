# Child-safe dictionary and audio repair plan

## What caused the reported issues

1. The Teacher Studio labelled 26 sounds as needing recording from a stale
   metadata flag, even though all 75 clips were present.
2. The pupil app carried an embedded copy of the audio. Updating the downloadable
   pack alone could leave children listening to an older recording.
3. The fallback dictionary includes historical Webster entries. When a common
   word has no child-curated override, its first historical sense can be
   inappropriate (for example, the firearm sense of `trail`).
4. The multi-meaning interface existed but was only populated for a few words,
   so it could not help with uncurated ambiguous words.

## Delivered in this repair

- Publish one normalized 75-clip teacher pack in both the Studio and pupil app.
- Use the supplied standalone `ed-d.wav` for the `-ed (/d/)` sound.
- Treat a sound as unfinished only when it has no playable published clip.
- Curate child-appropriate, matching definition/example/image choices for
  `trail` and `nonsense`; `trail` now exposes two meanings.
- Keep a repeatable verification script for the published audio and these
  child-safety regressions.

## Next content pass

Audit high-frequency pupil-search words against the historical fallback data,
then add curated entries wherever the first sense, example, or image suggestion
is unsuitable. Each curated entry should include every sense a child is likely
to meet, a plain definition, a natural sentence, and a matching safe image
search phrase.

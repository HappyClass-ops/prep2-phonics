# Dictionary options for a Year 2 phonics app

Research date: 30 August 2026. Sources are publisher/platform documentation only.

## Bottom line

There is **no zero-cost, browser-only dictionary API that is both editorially child-safe and comprehensive**. That is an important constraint, not an implementation detail.

The best quality match is Oxford's Children's Dictionary API, but it is paid and American English. Merriam-Webster Elementary is the only credible child-oriented no-cost option for a non-commercial project, but it is aimed at US grades 3–5, has a 1,000-query/day limit, and its API key would be public in a GitHub Pages-only app. Neither is a safe production design without a server-side proxy or a provider-approved client-key arrangement.

| Option | Child suitability | Pronunciation/audio and senses | Cost/rights | GitHub Pages direct lookup | Verdict |
| --- | --- | --- | --- | --- | --- |
| Oxford American Children's Dictionary API | Strongest editorial fit: simplified definitions, child examples, age-selected senses and inappropriate meanings excluded | Oxford documents pronunciations/audio, lexical categories, structured senses, and deterministic handling of inflected forms | Paid production licence; the only free access is a restricted Sandbox. Caching/offline saving requires Enterprise | Requires an App ID and App Key in request headers. A static client cannot keep either secret | Best product quality, but not no-cost/no-backend and US English only |
| Merriam-Webster Elementary Dictionary API | Specifically for ages 8–11 / grades 3–5; close to Year 2 but US-focused and slightly older | Definitions, examples, part of speech, headword/stem lookup, pronunciation symbols, audio, spelling suggestions; response supports separate homographs | Free only for non-commercial use, max 1,000 queries/day and two reference works; commercial use requires a licence and branding/logo is required | API URL includes `?key=...`; any key shipped in JavaScript is visible and can be consumed by anyone | Best possible trial candidate, but not an acceptable unattended production dependency on a public static site |
| English Wiktionary via Wikimedia API | Not child-curated; community-written entries can include adult, historical, offensive, or complex senses | May contain multiple senses, parts of speech and regional audio, but coverage/format/audio are inconsistent | Free content under CC BY-SA 4.0/GFDL; attribution and share-alike obligations apply. API supports CORS | Technically feasible, no secret required | Do **not** use as pupil-facing definitions; it recreates the safety/quality problem |
| Free Dictionary API (`dictionaryapi.dev`) | Not child-curated; its own repository says it was built as a free API and shows adult/general dictionary data | Can return multiple parts of speech, definitions, examples and phonetic audio | No key, but project source is GPL-3.0 and the sample audio may be third-party/Commons-licensed; availability and editorial provenance are not a child-safety guarantee | Technically feasible | Do **not** use as pupil-facing definitions or a source of pronunciation truth |
| Wordnik | Its pricing page lists children/student definitions as “coming soon” only for higher plans | Definitions, examples and audio are available in some plans | Basic is $0 but restricted to non-profit/research, 100 calls/hour; public/exposed keys can be shut off and Basic forbids caching | Requires a private key, so not suitable for GitHub Pages-only | Not an option under the stated constraints |
| Cambridge Dictionary API/data | No documented children-specific API found in its official developer material | Cambridge licenses British/international/American data, pronunciation data and audio recordings | Licence/pricing by enquiry | Credentials/licence required; not a no-cost route | Worth a paid UK-English enquiry, not a current no-cost solution |

## What the providers actually offer

### Oxford — the quality benchmark, not the free route

Oxford's [Children's Dictionary API](https://developer.oxforddictionaries.com/childrens-dictionary-api) states that its American dataset (`en-us-childs`) has about 15,000 curated headwords and 30,000+ entries including inflected forms. It explicitly provides simplified definitions, child-appropriate examples, pronunciation respellings, age-appropriate sense selection, and excludes adult/developmentally inappropriate meanings. Its scope is intentionally narrower than a full dictionary.

The [Dictionary API documentation](https://developer.oxforddictionaries.com/dictionary-api) says the `Words` endpoint accepts an inflected form and returns structured definitions, pronunciations, examples and lexical categories; the `Lemmas` endpoint provides deterministic normalisation. This is exactly the behaviour needed to avoid `fired → fir` and `whisper → whisp`.

However, Oxford's [FAQ](https://developer.oxforddictionaries.com/faq) says production plans are paid, the only free access is a 500-call Sandbox restricted to words beginning with the first letter of the alphabet, and it offers no general non-commercial plan. It also says caching or offline saving is Enterprise-only. The [release notes](https://developer.oxforddictionaries.com/updates) state that children’s data is licensed with Growing and Enterprise plans. It is therefore not a no-cost deployment option.

### Merriam-Webster Elementary — best free trial candidate, with hard limits

Merriam-Webster's [Elementary Dictionary API](https://dictionaryapi.com/products/api-elementary-dictionary) is explicitly for grades 3–5 (ages 8–11), has 36,000+ entries, and returns JSON with definitions, examples, word history, synonyms, child-oriented tips, pronunciation symbols, audio and spelling suggestions. It supports lookup by headword and by stems (inflections/variants). The documentation’s response structure includes a `hom` field, parts of speech, senses, example sentences and an audio identifier, allowing the UI to present selectable meanings rather than guessing one.

Its [free-use terms](https://dictionaryapi.com/info/terms-of-service) and [FAQ](https://dictionaryapi.com/info/frequently-asked-questions) allow a non-commercial app only if it stays within 1,000 queries/day/reference work and two reference works. Commercial/ad-supported/paid use or higher traffic requires a licence. The FAQ also says apps using its APIs must feature the Merriam-Webster logo.

The documented request URL includes `?key=your-api-key`. On GitHub Pages, that key would necessarily be delivered to every browser, so it is not secret and the daily allowance could be exhausted or abused. The first-party documentation reviewed does not provide a documented browser-key restriction mechanism. Treat it as unsuitable for an unattended public static deployment unless Merriam-Webster confirms a client-side/key-restriction arrangement in writing.

### Free sources — technically callable, not safe dictionaries for children

[Wiktionary's copyright page](https://en.wiktionary.org/wiki/Wiktionary:Copyrights) licenses entries under CC BY-SA 4.0 and GFDL. [MediaWiki's CORS documentation](https://www.mediawiki.org/wiki/Manual:CORS/en) confirms that its APIs support CORS requests. This means a GitHub Pages app can call it without a secret, but it does **not** make its results appropriate for a Year 2 dictionary. It is not age-curated, can return historical/adult senses, and lacks consistent editorial shape/audio coverage. Attribution and share-alike obligations also need product/legal review.

The open-source [Free Dictionary API repository](https://github.com/meetDeveloper/freeDictionaryAPI) documents a public no-key endpoint that can supply multiple meanings, parts of speech and phonetic audio. It is general-purpose rather than child-oriented; its repository says it is GPL-3.0 and warns of operating-cost pressure. Its sample data includes externally hosted audio, so it cannot be treated as a stable, licensed, child-safe pronunciation service.

The [Wordnik pricing page](https://developer.wordnik.com/pricing) offers its Basic level at $0 only for non-profit/research, with a 100-call/hour limit. Its [FAQ](https://developer.wordnik.com/faq) says exposed public keys can be shut off and Basic users may not cache data. The pricing page lists children/student definitions as “coming soon” only in higher plan tiers, so it does not solve the Year 2 requirement.

Cambridge's [developer page](https://dictionary.cambridge.org/develop.html) offers a Dictionary API and its [licensing page](https://dictionary.cambridge.org/license) says British, International and American English data, pronunciation data and audio recordings are available by enquiry. Neither page identifies a free, children-specific API plan.

## Recommended decision and architecture

1. **Do not connect any uncurated free API to the pupil screen.** It would recreate the current failures, only with a different source.
2. If zero budget and zero backend are immovable requirements, retain the app's independent phonics/blending activity for every spelling, but show dictionary meaning/full-word audio **only** for a deliberately maintained reviewed set. This is the only configuration that keeps an unsafe source out of the product.
3. If a live provider is acceptable, start with a small Merriam-Webster Elementary proof of concept, but do not publish its API key. Ask Merriam-Webster whether it supports a referrer-restricted browser credential and whether this exact public classroom use qualifies as non-commercial. Also test its US recordings and content with Year 2 pupils.
4. For a robust future version, use Oxford Children’s API (or a UK children’s-data licence obtained from a publisher) through a minimal proxy. A proxy can be a tiny hosted function rather than a traditional server; it keeps credentials private, rate-limits requests, logs failures, and enforces the child-safety policy. This conflicts with the current no-backend requirement, but it is the smallest architecture that makes a credentialed live API safe.
5. For homographs/heteronyms, never auto-select pronunciation from spelling alone. Present the provider's separate senses/parts of speech and their pronunciation/audio where available, then let the child choose the sense matching the reading context. A word in isolation cannot always determine `lead`, `tear`, `wind`, etc.

## Before any implementation

- Confirm the programme is legally non-commercial under the provider’s definition, including future monetisation or advertising plans.
- Confirm UK vs US pronunciation needs. Both child-focused options identified here are American datasets/products.
- Obtain written confirmation on browser-based key use, CORS, quota enforcement and classroom traffic from the selected provider.
- Build acceptance tests for the reported failure words (`fired`, `whisper`, `glittering`, `trail`, `astronaut`) and heteronyms (`lead`, `tear`, `wind`) before switching sources.
- Keep the existing teacher-recorded phoneme audio as the only source for grapheme-by-grapheme blending; dictionary word audio is a separate full-word feature.

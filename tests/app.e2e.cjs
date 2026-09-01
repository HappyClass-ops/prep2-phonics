const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const projectRoot = path.resolve(__dirname, '..');
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const fallEntry = {
  meta: { id: 'fall:1', stems: ['fall', 'falls', 'falling', 'fell', 'fallen'] },
  hwi: { hw: 'fall', prs: [{ mw: 'ˈfȯl', sound: { audio: 'fall0001' } }] },
  ins: [
    { if: 'fell', prs: [{ mw: 'ˈfel', sound: { audio: 'fell0001' } }] },
    { if: 'fall*ing' },
    { if: 'falls' }
  ],
  fl: 'verb',
  shortdef: [
    'to come or go down freely by the force of gravity',
    'to come as if by falling',
    'to become lower in degree or value',
    'the act of going down',
    'autumn',
    'a thing that falls',
    'the season between summer and winter'
  ],
  def: [{ sseq: [[['sense', { sn: '1', dt: [['text', '{bc}to come or go down freely by the force of gravity'], ['vis', [{ t: 'An apple {it}fell{/it} from the tree.' }]]] }]]] }]
};

const jumpEntry = {
  meta: { id: 'jump:1', stems: ['jump', 'jumps', 'jumped', 'jumping'] },
  hwi: { hw: 'jump', prs: [{ mw: 'ˈjəmp', sound: { audio: 'jump0001' } }] },
  ins: [{ if: 'jumped' }, { if: 'jump*ing' }, { if: 'jumps' }],
  fl: 'verb',
  shortdef: [
    'to spring into the air',
    'to pass over something by jumping',
    'to make a sudden movement',
    'an act of jumping',
    'a sudden movement',
    'a sharp increase'
  ],
  def: [{ sseq: [[['sense', { sn: '1', dt: [['text', '{bc}to spring into the air'], ['vis', [{ t: 'The frog {it}jumped{/it} over the log.' }]]] }]]] }]
};

const entries = {
  dog: [{ meta: { id: 'dog', stems: ['dog', 'dogs'] }, hwi: { hw: 'dog', prs: [{ mw: 'ˈdȯg', sound: { audio: 'dog00001' } }] }, fl: 'noun', shortdef: ['an animal often kept as a pet'] }],
  haughty: [{
    meta: { id: 'haughty', stems: ['haughty', 'haughtier', 'haughtiest'] },
    hwi: { hw: 'haugh*ty', prs: [{ mw: 'ˈhȯ-tē', sound: { audio: 'haughty01' } }] },
    fl: 'adjective',
    shortdef: ['proud and unfriendly'],
    def: [{ sseq: [[['sense', { sn: '1', dt: [['text', '{bc}proud and unfriendly'], ['vis', [{ t: 'a {it}haughty{/it} princess' }]]] }]]] }]
  }],
  tear: [
    {
      meta: { id: 'tear:1', stems: ['tear', 'tears'] },
      hwi: { hw: 'tear', prs: [{ mw: 'ˈtir', sound: { audio: 'tear0001' } }] },
      fl: 'noun', shortdef: ['a drop of liquid that comes from your eye']
    },
    {
      meta: { id: 'tear:2', stems: ['tear', 'tears', 'tearing', 'tore', 'torn'] },
      hwi: { hw: 'tear', prs: [{ mw: 'ˈter', sound: { audio: 'tear0001' } }] },
      fl: 'verb', shortdef: ['to pull into two or more pieces by force'],
      def: [{ sseq: [[['sense', { sn: '1', dt: [['text', '{bc}to pull into two or more pieces by force'], ['vis', [{ t: 'This paper is easy to {it}tear{/it}.' }]]] }]]] }]
    }
  ],
  cat: [
    {
      meta: { id: 'cat', stems: ['cat', 'cats'] },
      hwi: { hw: 'cat', prs: [{ mw: 'ˈkat', sound: { audio: 'cat00001' } }] },
      fl: 'noun',
      shortdef: ['a small animal with soft fur that is often kept as a pet', 'a member of the animal family that includes lions and tigers'],
      def: [{ sseq: [
        [['sense', { sn: '1', dt: [['text', '{bc}a domesticated carnivorous mammal (Felis catus) valued by humans for companionship and its ability to hunt vermin'], ['vis', [{ t: 'The {it}cat{/it} slept on the mat.' }]]] }]],
        [['sense', { sn: '2', dt: [['text', '{bc}any of the animal family that includes lions and tigers']] }]]
      ] }]
    },
    {
      meta: { id: 'saber-toothed cat', stems: ['saber-toothed cat', 'saber-toothed cats'] },
      hwi: { hw: 'sa*ber-toothed cat' }, fl: 'noun', shortdef: ['saber-toothed tiger']
    },
    {
      meta: { id: 'let', stems: ['let', 'lets', 'letting'] },
      hwi: { hw: 'let', prs: [{ mw: 'ˈlet', sound: { audio: 'let00001' } }] },
      fl: 'verb', shortdef: ['to allow or permit to']
    },
    {
      meta: { id: 'saber-toothed tiger', stems: ['saber-toothed tiger'] },
      hwi: { hw: 'saber-toothed tiger' }, fl: 'noun', shortdef: ['a large extinct cat']
    }
  ],
  is: [{
    meta: { id: 'is', stems: ['is'] },
    hwi: { hw: 'is', prs: [{ mw: 'ˈiz', sound: { audio: 'is000001' } }] },
    fl: 'verb', shortdef: ['present form of be']
  }],
  cautious: [{
    meta: { id: 'cautious', stems: ['cautious', 'cautiously', 'cautiousness'] },
    hwi: { hw: 'cau*tious', prs: [{ mw: 'ˈkȯ-shəs', sound: { audio: 'cautious01' } }] },
    fl: 'adjective', shortdef: ['careful about avoiding danger or trouble']
  }],
  read: [
    {
      meta: { id: 'read:1', stems: ['read', 'reads', 'reading'] },
      hwi: { hw: 'read', prs: [{ mw: 'ˈrēd', sound: { audio: 'read0001' } }] },
      ins: [{ if: 'read', prs: [{ mw: 'ˈred' }] }],
      fl: 'verb', shortdef: ['to look at and understand written words']
    }
  ],
  fall: [fallEntry],
  jump: [jumpEntry],
  jumped: [jumpEntry],
  jumping: [jumpEntry],
  fell: [
    fallEntry,
    {
      meta: { id: 'fell:1', stems: ['fell', 'felled', 'felling'] },
      hwi: { hw: 'fell', prs: [{ mw: 'ˈfel', sound: { audio: 'fell0002' } }] },
      fl: 'verb', shortdef: ['to cut down a tree']
    }
  ],
  catt: ['cat', 'catch'],
  slow: [{ meta: { id: 'slow', stems: ['slow'] }, hwi: { hw: 'slow' }, fl: 'adjective', shortdef: ['moving with little speed'] }]
};

async function startServer() {
  const server = http.createServer((request, response) => {
    let requestPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
    if (requestPath.endsWith('/')) requestPath += 'index.html';
    const filePath = path.join(projectRoot, decodeURIComponent(requestPath.split('?')[0]));
    if (!filePath.startsWith(projectRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404).end('Not found');
      return;
    }
    const extension = path.extname(filePath);
    const contentType = extension === '.html' ? 'text/html; charset=utf-8' : extension === '.js' ? 'text/javascript' : 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return server;
}

async function search(page, word) {
  await page.locator('#wordSearchInput').fill(word);
  await page.locator('.search-btn-primary').click();
  await page.locator('#dictWorkspaceCard').waitFor({ state: 'visible' });
  await page.waitForFunction(expected => document.querySelector('#resWordTitle')?.textContent === expected, word);
}

async function run() {
  const server = await startServer();
  const address = server.address();
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const page = await browser.newPage();
  const pageErrors = [];
  const elevenRequests = [];
  let elevenMode = 'success';
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.addInitScript(() => {
    window.__playedAudioUrls = [];
    localStorage.setItem('word_audio_tricky:is', 'data:audio/wav;base64,VEVTVA==');
    window.Audio = class {
      constructor(url) { this.url = url; window.__playedAudioUrls.push(url); }
      play() { if (this.onended) setTimeout(() => this.onended(), 0); return Promise.resolve(); }
    };
  });
  await page.route('https://prep2-phonics-api.goldenhappyaku.workers.dev/api/dictionary**', async route => {
    const word = new URL(route.request().url()).searchParams.get('word').toLowerCase();
    if (word === 'slow') await new Promise(resolve => setTimeout(resolve, 250));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(entries[word] || []) });
  });
  await page.route('https://prep2-phonics-api.goldenhappyaku.workers.dev/api/speech', async route => {
    elevenRequests.push(JSON.parse(route.request().postData() || '{}'));
    if (elevenMode === 'failure') await route.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"voice unavailable"}' });
    else await route.fulfill({ status: 200, contentType: 'audio/mpeg', body: Buffer.from('FAKE_MP3') });
  });

  try {
    await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(100);
    assert.equal(await page.locator('header .brand-title').innerText(), 'Visual Dictionary');
    assert.match(await page.locator('header .brand-logo-image').getAttribute('src'), /assets\/visual-dictionary-logo\.png$/);
    assert.doesNotMatch(await page.locator('header').innerText(), /Little Wandle|Prep 2 Phonics Assistant/i);
    assert.equal(await page.locator('#wordSearchInput').inputValue(), '', 'Word Finder should open with an empty search field');
    assert.equal(await page.locator('#dictWorkspaceCard').isVisible(), false, 'Word Finder should not show stale word content before a search');
    assert.equal(await page.getByText('Different Picture Idea', { exact: true }).count(), 0, 'the misleading alternate picture control must be removed');
    assert.doesNotMatch(await page.locator('body').innerText(), /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, 'the pupil interface must not use emoji as decoration or status icons');
    assert.equal(await page.getByText('farted', { exact: true }).count(), 0, 'featured and autocomplete suggestions must not advertise a word missing from Merriam Elementary');
    const trickyTotal = await page.locator('#trickyGrid .tricky-card').count();
    const soundboardTotal = await page.locator('#soundboardGrid .sb-tile').count();
    assert.match(await page.locator('#tabTrickyBtn').innerText(), new RegExp(`\\(${trickyTotal}\\)`));
    assert.match(await page.locator('#tabSbBtn').innerText(), new RegExp(`\\(${soundboardTotal}\\)`));
    assert.equal(trickyTotal, 93, 'the verified Little Wandle set must contain all 93 tricky words');
    assert.equal(await page.locator('#trickyGrid .tricky-tip').count(), 93, 'every tricky word must show a reading prompt in silent mode');
    assert.equal(await page.locator('#trickyGrid .tricky-parts-breakdown').count(), 93, 'every tricky word must show either verified detail or a safe spot-the-sounds prompt');
    assert.equal(await page.locator('#trickyGrid .tricky-recording-status', { hasText: 'Silent mode' }).count(), 0, 'silent mode must not replace reading guidance with a mode label');
    assert.equal(await page.locator('#btnSoundModeToggle').getAttribute('aria-pressed'), 'true', 'silent mode must be the default');
    assert.match(await page.locator('#btnSoundModeToggle').innerText(), /Silent/i);
    assert.equal(await page.locator('#trickyGrid .tricky-card').first().getAttribute('role'), null, 'tricky words must not be clickable in silent mode');
    assert.equal(await page.evaluate(() => isAcceptedDictionaryEntry({
      meta: { id: 'fire:2', stems: ['fire'] },
      hwi: { hw: 'fire' },
      ins: [{ if: 'fired' }, { if: 'fir*ing' }]
    }, 'fired')), true, 'provider inflection records must count as accepted forms');
    assert.equal(await page.evaluate(() => getWordClassDetails('pronoun').name), 'PRONOUN');
    assert.equal(await page.evaluate(() => getWordClassDetails('interjection').name), 'INTERJECTION');
    assert.equal(await page.evaluate(() => cleanMerriamText('{bc}{d_link|spelling bee|bee:1} and {sx|rent:2||}')), 'spelling bee and rent');
    console.log('PASS: Word Finder opens in a clean start state');

    await search(page, 'cat');
    assert.equal(await page.locator('#resContextPhrase').isVisible(), false, 'image-search context must not appear on the dictionary page');
    assert.equal(await page.locator('#btnSayWholeWord').isDisabled(), true, 'whole-word voice must be disabled in silent mode');
    assert.equal(await page.locator('#btnDefinitionVoice').isDisabled(), true, 'definition voice must be disabled in silent mode');
    assert.equal(await page.locator('#soundAttemptPanel').isVisible(), true, 'silent mode must ask the child to build the sound buttons first');
    assert.equal(await page.locator('#soundAnswerPanel').isVisible(), false, 'completed sound buttons must stay hidden before a successful attempt');
    for (const letter of await page.locator('.sound-builder-letter').all()) await letter.click();
    await page.locator('#btnCheckSoundAttempt').click();
    await page.waitForTimeout(650);
    assert.equal(await page.locator('#soundAnswerPanel').isVisible(), true, 'a correct attempt must reveal the completed sound buttons');
    const silentAudioCount = await page.evaluate(() => window.__playedAudioUrls.length);
    await page.locator('#soundButtonsRow .phoneme-unit').first().click();
    assert.equal(await page.locator('#soundButtonsRow .phoneme-unit').first().evaluate(el => el.classList.contains('active-sound')), true, 'silent sound buttons must still highlight');
    await page.evaluate(() => playFullBlendSequence());
    await page.waitForTimeout(30);
    assert.equal(await page.evaluate(() => window.__playedAudioUrls.length), silentAudioCount, 'silent blending must animate without creating audio');
    await page.evaluate(() => stopAllAudio());

    await search(page, 'jump');
    await page.evaluate(() => commitSoundAttemptGroup(0, 3));
    for (let attempt = 0; attempt < 3; attempt++) await page.locator('#btnCheckSoundAttempt').click();
    assert.match(await page.locator('#soundAttemptFeedback').innerText(), /Call a teacher over to help you.*locked/i, 'the third unsuccessful check must ask for teacher support and lock the attempt');
    assert.equal(await page.locator('#soundAnswerPanel').isVisible(), false, 'three unsuccessful checks must never reveal the answer');
    assert.equal(await page.locator('.sound-builder-letter:not(:disabled)').count(), 0, 'a locked attempt must disable every letter');
    assert.equal(await page.getByRole('button', { name: 'Undo' }).isDisabled(), true, 'a locked attempt must disable Undo');
    assert.equal(await page.getByRole('button', { name: 'Start again' }).isDisabled(), true, 'a locked attempt must disable Start again');
    assert.equal(await page.locator('#btnCheckSoundAttempt').isDisabled(), true, 'a locked attempt must disable further checks');

    await page.locator('#btnSoundModeToggle').click();
    const eightKey = page.locator('#soundPinBackdrop .sound-pin-key', { hasText: /^8$/ });
    for (let index = 0; index < 4; index++) await eightKey.click();
    assert.equal(await page.locator('#btnSoundModeToggle').getAttribute('aria-pressed'), 'false', 'the teacher PIN must unlock voice mode');
    assert.match(await page.locator('#btnSoundModeToggle').innerText(), /Voice on/i);
    assert.equal(await page.locator('#btnSayWholeWord').isDisabled(), false);
    assert.match(await page.locator('.dictionary-credits').innerText(), /Definitions, examples and pronunciations from Merriam-Webster's Elementary Dictionary/i);
    assert.match(await page.locator('.dictionary-credits').innerText(), /Whole-word and read-aloud voice by ElevenLabs/i);
    assert.match(await page.locator('.dictionary-credits').innerText(), /Merriam-Webster audio is used when the voice service is unavailable/i);
    const meaningButtons = await page.locator('#dictSensesContainer .sense-pill-btn').allTextContents();
    const visibleText = await page.locator('#dictWorkspaceCard').innerText();
    assert.equal(meaningButtons.length, 1, `cat should keep only its one alternative outside the selected main meaning, received: ${meaningButtons.join(', ')}`);
    assert.equal(await page.locator('#dictSensesContainer').isVisible(), false, 'alternative meanings must be collapsed by default');
    assert.match(await page.locator('#btnToggleMeanings').innerText(), /See other meanings \(1\)/i);
    assert.match(meaningButtons[0], /animal family|lions|tigers/i, 'the alternative tab should identify its meaning rather than repeat the selected main meaning');
    assert.doesNotMatch(visibleText, /allow or permit|saber-toothed/i);
    assert.match(await page.locator('#resMeaningText').innerText(), /^A small animal with soft fur/i, 'the elementary short definition should be preferred over raw technical sense text');
    const imageUrl = new URL(await page.locator('#btnGoogleSafeSearch').getAttribute('href'));
    const imageQuery = imageUrl.searchParams.get('q') || '';
    assert.match(imageQuery, /^cat\b/i);
    assert.match(imageQuery, /small animal|soft fur|pet/i);
    assert.doesNotMatch(imageQuery, /saber|permit|carnivorous|Felis/i);
    await page.evaluate(() => speakNaturalWord());
    await page.waitForFunction(() => window.__playedAudioUrls.some(url => String(url).startsWith('blob:')));
    const catAudioUrls = await page.evaluate(() => window.__playedAudioUrls);
    assert.match(catAudioUrls.at(-1) || '', /^blob:/, `cat did not use ElevenLabs whole-word audio: ${catAudioUrls.at(-1)}`);
    assert.match(elevenRequests.at(-1).text, /^cat\.?$/, 'whole-word speech may add terminal punctuation for clean synthesis');
    await page.evaluate(() => playFullBlendSequence());
    await page.waitForTimeout(450);
    const catBlendUrls = await page.evaluate(() => window.__playedAudioUrls);
    assert.match(catBlendUrls.at(-1) || '', /^blob:/, `cat blending did not end with ElevenLabs whole-word audio: ${catBlendUrls.at(-1)}`);
    console.log('PASS: a search displays only exact meanings and blending ends with contextual ElevenLabs audio');

    await search(page, 'fall');
    assert.equal(await page.locator('#dictSensesContainer').isVisible(), false, 'seven meanings must not confront the child at once');
    assert.match(await page.locator('#btnToggleMeanings').innerText(), /See other meanings \(6\)/i);
    assert.match(await page.locator('#resMeaningText').innerText(), /force of gravity/i, 'the main Merriam meaning should be selected automatically');
    await page.locator('#btnToggleMeanings').click();
    assert.equal(await page.locator('#dictSensesContainer').isVisible(), true, 'other meanings should remain available on request');
    assert.match(await page.locator('#otherMeaningsPrompt').innerText(), /Not what you were looking for\? Try another meaning\./i);
    assert.equal(await page.locator('#dictSensesContainer .sense-pill-btn').count(), 6, 'the selected main meaning must not be repeated among other meanings');
    await page.locator('#btnToggleMeanings').click();

    assert.equal(await page.locator('#wordFamilyDetails').isVisible(), false, 'the Time Machine must stay compact until requested');
    await page.locator('#btnToggleWordFamily').click();
    await page.getByRole('button', { name: /Yesterday \(Past\): fell/i }).click();
    await page.waitForFunction(() => document.querySelector('#resWordTitle')?.textContent === 'fell');
    assert.equal(await page.locator('#wordFamilyContext').isVisible(), true);
    assert.match(await page.locator('#wordFamilyContextText').innerText(), /^Fell is the past tense of fall\.$/i);
    assert.match(await page.locator('#resMeaningText').innerText(), /force of gravity/i, 'the dictionary definition must remain the definition');
    assert.equal(await page.locator('#dictSensesContainer').isVisible(), false, 'unrelated fell meanings must stay collapsed during family practice');
    assert.match(await page.locator('#btnReturnToFamilyBase').innerText(), /Back to fall/i);
    await page.locator('#btnReturnToFamilyBase').click();
    await page.waitForFunction(() => document.querySelector('#resWordTitle')?.textContent === 'fall');
    assert.equal(await page.locator('#wordFamilyContext').isVisible(), false);

    await search(page, 'fell');
    assert.match(await page.locator('#resMeaningText').innerText(), /^To cut down a tree/i, 'a direct search must prefer its exact headword instead of opening a word-family lesson');
    assert.equal(await page.locator('#wordFamilyContext').isVisible(), false);
    assert.equal(await page.locator('#wordFamilyDetails').isVisible(), false);
    assert.equal(await page.locator('#dictSensesContainer').isVisible(), false);
    assert.match(await page.locator('#btnToggleMeanings').innerText(), /See other meanings/i);
    console.log('PASS: primary meanings are calm and word-family forms preserve their learning context');

    await search(page, 'jump');
    assert.equal(await page.locator('#wordFamilyContext').isVisible(), false, 'a direct base-word search must never say it is another form of itself');
    assert.doesNotMatch(await page.locator('#dictWorkspaceCard').innerText(), /Jump is another form of jump/i);
    assert.equal(await page.locator('#wordFamilyDetails').isVisible(), false, 'the Time Machine must start collapsed');
    assert.match(await page.locator('#btnToggleWordFamily').innerText(), /See other forms of jump/i);
    await page.locator('#btnToggleWordFamily').click();
    assert.equal(await page.locator('#wordFamilyDetails').isVisible(), true);
    assert.equal(await page.locator('#grammarRuleBadge').isVisible(), false, 'a family-wide +ed badge must not appear to describe jumping');
    assert.match(await page.getByRole('button', { name: /Yesterday \(Past\): jumped/i }).innerText(), /add -ed/i);
    await page.getByRole('button', { name: /Right Now \(-ing\): jumping/i }).click();
    await page.waitForFunction(() => document.querySelector('#resWordTitle')?.textContent === 'jumping');
    assert.match(await page.locator('#wordFamilyContextText').innerText(), /^Jumping shows that jump is happening now\.$/i);
    assert.equal(await page.locator('#wordFamilyDetails').isVisible(), true, 'guided Time Machine navigation should stay expanded');
    assert.match(await page.locator('#resMeaningText').innerText(), /^To spring into the air/i);

    await search(page, 'jumped');
    assert.equal(await page.locator('#wordFamilyContext').isVisible(), false, 'typing jumped directly must remain a normal dictionary search');
    assert.equal(await page.locator('#wordFamilyDetails').isVisible(), false);
    assert.match(await page.locator('#resMeaningText').innerText(), /^To spring into the air/i);
    console.log('PASS: the Time Machine is compact, rule labels are form-specific, and direct searches stay normal');

    await search(page, 'cat');
    await page.getByRole('button', { name: 'Read Definition' }).click();
    await page.waitForTimeout(20);
    assert.match(elevenRequests.at(-1).text, /^A small animal with soft fur/i);
    console.log('PASS: definitions use ElevenLabs read-aloud');

    await page.locator('#tabTrickyBtn').click();
    const isCard = page.locator('#trickyGrid .tricky-word-display', { hasText: /^is$/ }).locator('..');
    await isCard.click();
    await page.waitForTimeout(50);
    const playedUrls = await page.evaluate(() => window.__playedAudioUrls);
    assert.equal(playedUrls.at(-1), 'data:audio/wav;base64,VEVTVA==', 'a tricky word must use only its teacher recording');
    console.log('PASS: tricky-word cards use teacher recordings only');

    await page.locator('#tabDictBtn').click();
    await search(page, 'cautious');
    const sentenceButton = page.getByRole('button', { name: 'Build the Example' });
    assert.equal(await sentenceButton.isDisabled(), false, 'Build the Example must respond even when the provider has no example');
    assert.equal(await page.locator('#dictionaryExampleSection').isVisible(), false, 'No fabricated sentence should be displayed');
    await sentenceButton.click();
    assert.match(await page.locator('#appToast').innerText(), /no dictionary example/i);
    console.log('PASS: Build the Example explains missing provider content instead of silently doing nothing');

    const cautiousUnits = await page.locator('#soundButtonsRow .phoneme-unit').evaluateAll(units => units.map(unit => ({
      letters: unit.querySelector('.phoneme-letters')?.textContent,
      soundId: unit.dataset.soundId
    })));
    assert.deepEqual(cautiousUnits.map(unit => unit.letters), ['c', 'au', 'ti', 'ou', 's']);
    assert.deepEqual(cautiousUnits.map(unit => unit.soundId), ['k', 'or-long', 'sh', 'schwa', 's']);
    console.log('PASS: the phonics engine applies ordered grapheme rules to cautious');

    await page.locator('#wordSearchInput').fill('zephyr');
    const exactSuggestion = page.locator('#autocompleteDropdown .autocomplete-item').first();
    assert.match(await exactSuggestion.innerText(), /Search “zephyr”/i, 'every typed word should offer an exact-search action even when it is outside the local lexicon');
    console.log('PASS: autocomplete never dead-ends for an exact typed word');

    await search(page, 'haughty');
    await page.getByRole('button', { name: 'Build the Example' }).click();
    assert.equal(await page.locator('.game-level-btn').count(), 0, 'duplicate difficulty controls must be removed');
    assert.equal(await page.locator('#gameModalBackdrop .game-title').innerText(), 'Example Builder Puzzle');
    assert.match(await page.locator('.puzzle-bank-label').first().innerText(), /^Example Track$/i);
    const haughtyTiles = await page.locator('#puzzleSourceBank .puzzle-tile').allTextContents();
    assert.equal(haughtyTiles.includes('A'), true, 'the first tile must preserve sentence-style capitalization');
    assert.equal(haughtyTiles.includes('a'), false, 'a lowercase first tile must not replace the capitalized tile');
    for (const token of ['A', 'haughty', 'princess', '.']) await page.locator('#puzzleSourceBank .puzzle-tile').filter({ hasText: new RegExp(`^${token.replace('.', '\\.')}$`) }).click();
    await page.getByRole('button', { name: 'Check Example' }).click();
    await page.waitForTimeout(20);
    assert.equal(elevenRequests.at(-1).text, 'A haughty princess.');
    await page.evaluate(() => closeSentenceGame());
    console.log('PASS: the example puzzle has one honest mode and teaches capitalization');

    await search(page, 'read');
    assert.equal(await page.locator('#soundButtonsRow .phoneme-unit').filter({ hasText: 'ea' }).getAttribute('data-sound-id'), 'ee-long');
    assert.equal(await page.locator('#dictPronunciationsContainer .sense-pill-btn').count(), 2);
    await page.locator('#dictPronunciationsContainer .sense-pill-btn').nth(1).click();
    assert.equal(await page.locator('#soundButtonsRow .phoneme-unit').filter({ hasText: 'ea' }).getAttribute('data-sound-id'), 'e-short');
    assert.equal(await page.locator('#btnSayWholeWord').isDisabled(), false, 'ElevenLabs should keep an alternate pronunciation playable without borrowing headword audio');
    console.log('PASS: selecting a heteronym pronunciation updates phonics and remains available through contextual ElevenLabs audio');

    await search(page, 'tear');
    await page.locator('#btnToggleMeanings').click();
    await page.locator('#dictSensesContainer .sense-pill-btn').first().click();
    assert.equal(await page.locator('#soundButtonsRow .phoneme-unit').filter({ hasText: 'ear' }).getAttribute('data-sound-id'), 'air-tri');
    assert.equal(await page.locator('#btnSayWholeWord').isDisabled(), false, 'ElevenLabs should replace one provider file shared by two pronunciations');
    console.log('PASS: homograph audio collisions cannot teach the wrong whole-word pronunciation');

    await page.evaluate(() => {
      localStorage.setItem('word_audio_pronunciation:tear:2c8-74-65-72', 'data:audio/wav;base64,VEVTVA==');
      applyActiveSenseData(currentActiveSenseIdx);
      window.__playedAudioUrls = [];
    });
    assert.equal(await page.locator('#btnSayWholeWord').isDisabled(), false, 'a teacher pronunciation override must restore exact whole-word audio');
    await page.evaluate(() => speakNaturalWord());
    await page.waitForTimeout(20);
    assert.equal((await page.evaluate(() => window.__playedAudioUrls)).at(-1), 'data:audio/wav;base64,VEVTVA==');
    await page.evaluate(() => localStorage.removeItem('word_audio_pronunciation:tear:2c8-74-65-72'));
    console.log('PASS: teacher-published pronunciation overrides replace blocked provider audio');

    await page.locator('#tabTrickyBtn').click();
    await page.locator('#btnSoundModeToggle').click();
    assert.equal(await page.locator('#btnSoundModeToggle').getAttribute('aria-pressed'), 'true');
    assert.equal(await isCard.getAttribute('role'), null, 'silent tricky-word cards must become non-interactive');
    const beforeSilentTrickyClick = await page.evaluate(() => window.__playedAudioUrls.length);
    await isCard.click({ force: true });
    assert.equal(await page.evaluate(() => window.__playedAudioUrls.length), beforeSilentTrickyClick, 'silent tricky words must never play their recording');
    await page.locator('#tabDictBtn').click();
    console.log('PASS: returning to silent mode immediately disables all tricky-word audio');
    await page.locator('#btnSoundModeToggle').click();
    for (let index = 0; index < 4; index++) await eightKey.click();

    await search(page, 'catt');
    const suggestions = await page.locator('#autocompleteDropdown .autocomplete-item span:first-child').allTextContents();
    assert.deepEqual(suggestions.map(text => text.trim()), ['cat', 'catch']);
    console.log('PASS: provider spelling suggestions are offered after an unsuccessful explicit search');

    await page.locator('#wordSearchInput').fill('slow');
    await page.locator('.search-btn-primary').click();
    await page.waitForTimeout(20);
    await page.locator('#wordSearchInput').fill('cat');
    await page.locator('.search-btn-primary').click();
    await page.waitForFunction(() => document.querySelector('#resWordTitle')?.textContent === 'cat');
    await page.waitForTimeout(350);
    assert.equal(await page.locator('#resWordTitle').innerText(), 'cat');
    console.log('PASS: an older slow lookup cannot overwrite a newer search');

    const phonicsWords = ['cat','ship','rain','cake','book','cloud','talked','jumped','played','boxes','wishes','fired','glittering','astronaut','chocolate','bicycle','enormous','cautious','author','trail','lead','tear','wind','bat','bark','match','right','read','minute','present'];
    const parsedWords = await page.evaluate(words => Object.fromEntries(words.map(word => [word, parseWordToPhonemes(word).units.map(unit => ({ letters: unit.letters, soundId: unit.id }))])), phonicsWords);
    for (const word of phonicsWords) {
      assert.equal(parsedWords[word].map(unit => unit.letters).join(''), word, `${word} must be covered exactly once by its displayed GPC units`);
    }
    const audioPack = JSON.parse(fs.readFileSync(path.join(projectRoot, 'little_wandle_master_voice_pack_v3.json'), 'utf8'));
    const audioIds = new Set(audioPack.clips.map(clip => clip.id));
    for (const word of phonicsWords) {
      for (const unit of parsedWords[word]) assert.equal(audioIds.has(unit.soundId), true, `${word}:${unit.letters} has no teacher audio for ${unit.soundId}`);
    }
    assert.equal(parsedWords.talked.at(-1).soundId, 'ed-t');
    assert.equal(parsedWords.jumped.at(-1).soundId, 'ed-t');
    assert.equal(parsedWords.played.at(-1).soundId, 'ed-d');
    assert.equal(parsedWords.boxes.at(-1).soundId, 'iz-suffix');
    assert.equal(parsedWords.wishes.at(-1).soundId, 'iz-suffix');

    await page.setViewportSize({ width: 360, height: 800 });
    await search(page, 'astronaut');
    const mobileStage = await page.evaluate(() => {
      window.scrollTo(0, 0);
      const wrapper = document.querySelector('.sound-buttons-stage-wrapper');
      const row = document.querySelector('.sound-buttons-row');
      const first = row.firstElementChild;
      const last = row.lastElementChild;
      const wrapperRect = wrapper.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const firstRect = first.getBoundingClientRect();
      wrapper.scrollLeft = wrapper.scrollWidth;
      const lastRect = last.getBoundingClientRect();
      return {
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        offenders: [...document.querySelectorAll('body *')]
          .map(element => ({
            tag: element.tagName,
            id: element.id,
            className: typeof element.className === 'string' ? element.className : '',
            left: Math.round(element.getBoundingClientRect().left),
            right: Math.round(element.getBoundingClientRect().right),
            width: Math.round(element.getBoundingClientRect().width)
          }))
          .filter(item => item.right > window.innerWidth + 1 || item.left < -1)
          .slice(0, 12),
        firstReachable: firstRect.left >= wrapperRect.left - 1,
        lastReachable: lastRect.right <= wrapperRect.right + 1,
        rowStartsInside: rowRect.left >= wrapperRect.left - 1,
        canScrollWhenNeeded: wrapper.scrollWidth <= wrapper.clientWidth || wrapper.scrollLeft > 0
      };
    });
    assert.equal(mobileStage.pageOverflow, 0, `the page itself must not overflow on a phone: ${JSON.stringify(mobileStage.offenders)}`);
    assert.equal(mobileStage.firstReachable, true, 'the first phoneme must never be clipped off-screen');
    assert.equal(mobileStage.rowStartsInside, true, 'a long phoneme row must begin inside its scroll area');
    assert.equal(mobileStage.canScrollWhenNeeded, true, 'long words must be touch-scrollable when they do not fit');
    assert.equal(mobileStage.lastReachable, true, 'the final phoneme must be reachable by scrolling');
    console.log('PASS: long words remain fully reachable on a 360px phone');

    await search(page, 'jump');
    const familyToggleBox = await page.locator('#btnToggleWordFamily').boundingBox();
    assert.ok(familyToggleBox && familyToggleBox.height >= 44, 'the collapsed Time Machine control must remain easy to tap on a phone');
    await page.locator('#btnToggleWordFamily').click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth), true, 'expanded word forms must not create phone page overflow');
    await page.setViewportSize({ width: 667, height: 375 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth), true, 'the Time Machine must also fit a phone in landscape');
    console.log('PASS: the compact Time Machine remains accessible in phone portrait and landscape');

    assert.deepEqual(pageErrors, [], `the pupil app raised browser errors: ${pageErrors.join(' | ')}`);
    console.log('PASS: the 30-word phonics set is complete, playable, and applies suffix voicing rules');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(`FAIL: ${error.stack || error.message}`);
  process.exitCode = 1;
});

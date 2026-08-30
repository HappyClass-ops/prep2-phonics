const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const projectRoot = path.resolve(__dirname, '..');
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const entries = {
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
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.addInitScript(() => {
    window.__playedAudioUrls = [];
    window.Audio = class {
      constructor(url) { this.url = url; window.__playedAudioUrls.push(url); }
      play() { if (this.onended) setTimeout(() => this.onended(), 0); return Promise.resolve(); }
    };
  });
  await page.route('**/api/v3/references/sd2/json/**', async route => {
    const word = decodeURIComponent(new URL(route.request().url()).pathname.split('/').pop()).toLowerCase();
    if (word === 'slow') await new Promise(resolve => setTimeout(resolve, 250));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(entries[word] || []) });
  });

  try {
    await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#wordSearchInput').inputValue(), '', 'Word Finder should open with an empty search field');
    assert.equal(await page.locator('#dictWorkspaceCard').isVisible(), false, 'Word Finder should not show stale word content before a search');
    assert.equal(await page.getByText('Different Picture Idea', { exact: true }).count(), 0, 'the misleading alternate picture control must be removed');
    const trickyTotal = await page.locator('#trickyGrid .tricky-card').count();
    const soundboardTotal = await page.locator('#soundboardGrid .sb-tile').count();
    assert.match(await page.locator('#tabTrickyBtn').innerText(), new RegExp(`\\(${trickyTotal}\\)`));
    assert.match(await page.locator('#tabSbBtn').innerText(), new RegExp(`\\(${soundboardTotal}\\)`));
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
    const meaningButtons = await page.locator('#dictSensesContainer .sense-pill-btn').allTextContents();
    const visibleText = await page.locator('#dictWorkspaceCard').innerText();
    assert.equal(meaningButtons.length, 2, `cat should expose two exact-entry meanings, received: ${meaningButtons.join(', ')}`);
    assert.match(meaningButtons[0], /small animal|soft fur|pet/i, 'meaning tabs should identify the meaning, not merely say Noun 1');
    assert.doesNotMatch(visibleText, /allow or permit|saber-toothed/i);
    assert.match(await page.locator('#resMeaningText').innerText(), /^A small animal with soft fur/i, 'the elementary short definition should be preferred over raw technical sense text');
    const imageUrl = new URL(await page.locator('#btnGoogleSafeSearch').getAttribute('href'));
    const imageQuery = imageUrl.searchParams.get('q') || '';
    assert.match(imageQuery, /^cat\b/i);
    assert.match(imageQuery, /small animal|soft fur|pet/i);
    assert.doesNotMatch(imageQuery, /saber|permit|carnivorous|Felis/i);
    await page.evaluate(() => speakNaturalWord());
    const catAudioUrls = await page.evaluate(() => window.__playedAudioUrls);
    assert.match(catAudioUrls.at(-1) || '', /\/c\/cat00001\.mp3$/, `cat played the wrong whole-word audio: ${catAudioUrls.at(-1)}`);
    await page.evaluate(() => playFullBlendSequence());
    await page.waitForTimeout(450);
    const catBlendUrls = await page.evaluate(() => window.__playedAudioUrls);
    assert.match(catBlendUrls.at(-1) || '', /\/c\/cat00001\.mp3$/, `cat blending ended with the wrong word audio: ${catBlendUrls.at(-1)}`);
    console.log('PASS: a search displays only meanings belonging to an accepted form of the searched word');

    await page.locator('#tabTrickyBtn').click();
    const isCard = page.locator('#trickyGrid .tricky-word-display', { hasText: /^is$/ }).locator('..');
    await isCard.click();
    await page.waitForTimeout(50);
    const playedUrls = await page.evaluate(() => window.__playedAudioUrls);
    assert.match(playedUrls.at(-1) || '', /\/i\/is000001\.mp3$/, `the is card played the wrong audio: ${playedUrls.at(-1)}`);
    console.log('PASS: each tricky-word card plays audio belonging to that card');

    await page.locator('#tabDictBtn').click();
    await search(page, 'cautious');
    const sentenceButton = page.getByRole('button', { name: 'Build the Example' });
    assert.equal(await sentenceButton.isDisabled(), true, 'Sentence Builder must be unavailable without a provider example');
    assert.equal(await page.locator('#dictionaryExampleSection').isVisible(), false, 'No fabricated sentence should be displayed');
    console.log('PASS: Sentence Builder never fabricates a sentence when the selected sense has no example');

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
    await page.evaluate(() => closeSentenceGame());
    console.log('PASS: the example puzzle has one honest mode and teaches capitalization');

    await search(page, 'read');
    assert.equal(await page.locator('#soundButtonsRow .phoneme-unit').filter({ hasText: 'ea' }).getAttribute('data-sound-id'), 'ee-long');
    assert.equal(await page.locator('#dictPronunciationsContainer .sense-pill-btn').count(), 2);
    await page.locator('#dictPronunciationsContainer .sense-pill-btn').nth(1).click();
    assert.equal(await page.locator('#soundButtonsRow .phoneme-unit').filter({ hasText: 'ea' }).getAttribute('data-sound-id'), 'e-short');
    assert.equal(await page.locator('#btnSayWholeWord').isDisabled(), true, 'an alternate pronunciation with no exact recording must not borrow the headword audio');
    console.log('PASS: selecting a heteronym pronunciation updates phonics without borrowing unrelated audio');

    await search(page, 'tear');
    await page.locator('#dictSensesContainer .sense-pill-btn').nth(1).click();
    assert.equal(await page.locator('#soundButtonsRow .phoneme-unit').filter({ hasText: 'ear' }).getAttribute('data-sound-id'), 'air-tri');
    assert.equal(await page.locator('#btnSayWholeWord').isDisabled(), true, 'one provider audio file shared by two pronunciations must be rejected');
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
    assert.deepEqual(pageErrors, [], `the pupil app raised browser errors: ${pageErrors.join(' | ')}`);
    console.log('PASS: the 30-word phonics set is complete, playable, and applies suffix voicing rules');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const projectRoot = path.resolve(__dirname, '..');
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function startServer() {
  const server = http.createServer((request, response) => {
    let requestPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
    if (requestPath.endsWith('/')) requestPath += 'index.html';
    const filePath = path.join(projectRoot, decodeURIComponent(requestPath));
    if (!filePath.startsWith(projectRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': path.extname(filePath) === '.html' ? 'text/html; charset=utf-8' : 'application/json' });
    fs.createReadStream(filePath).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return server;
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const page = await browser.newPage({ acceptDownloads: true });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.addInitScript(() => {
    sessionStorage.setItem('teacher_studio_unlocked', 'true');
    localStorage.setItem('word_audio_tricky:is', 'data:audio/wav;base64,VEVTVA==');
    localStorage.setItem('phonics_recording_review:sound:ed-d', 'true');
    localStorage.setItem('phonics_recording_review:word:tricky:is', 'true');
  });

  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/studio/`, { waitUntil: 'domcontentloaded' });
    await page.locator('#wordRecordingSection').waitFor({ state: 'visible' });
    assert.match(await page.locator('header .brand-sub').innerText(), /Visual Dictionary Audio Pack/i);
    assert.doesNotMatch(await page.locator('header').innerText(), /Little Wandle/i);
    assert.match(await page.locator('header .brand-logo-image').getAttribute('src'), /assets\/visual-dictionary-logo\.png$/);
    assert.equal(await page.locator('#wordRecordingsGrid .sound-card').count(), 101, 'the studio must include all 93 verified tricky words and 8 homograph models');
    assert.match(await page.locator('#wordRecordingSection').innerText(), /same browser.*opened or reloaded.*no extra sync step is needed/i);
    assert.match(await page.locator('#wordRecordingSection').innerText(), /Export Sound Pack.*Export Word Voice Pack.*send the downloaded JSON file.*GitHub/i);
    assert.equal(await page.getByRole('button', { name: 'Use on This Browser' }).count(), 0, 'the studio must not present a fake manual sync step');
    assert.equal(await page.locator('[data-word-recording-id="tricky:is"] .status-teacher').count(), 1, 'a local tricky-word recording must be recognized');
    assert.equal(await page.locator('#card-ed-d .recording-review-control input').isChecked(), true, 'sound review flags must persist beneath the status');
    assert.equal(await page.locator('[data-word-recording-id="tricky:is"] .recording-review-control input').isChecked(), true, 'tricky-word review flags must persist beneath the status');

    await page.getByRole('button', { name: 'Review Queue', exact: true }).click();
    assert.equal(await page.locator('#boothModalBackdrop').isVisible(), true, 'the review queue must open in the rapid booth');
    assert.deepEqual(await page.evaluate(() => boothQueue.map(target => `${target.targetType}:${target.id}`)), ['sound:ed-d', 'word:tricky:is'], 'the priority queue must exclude recordings that were not flagged');
    await page.evaluate(() => nextBoothSound());
    assert.equal(await page.locator('#boothGrapheme').innerText(), 'is', 'the same rapid booth must present tricky-word targets');
    await page.evaluate(() => closeRecordingBooth());

    await page.getByRole('button', { name: 'Rapid Tricky Words' }).click();
    assert.equal(await page.evaluate(() => boothQueue.length), 93, 'rapid tricky-word mode must include all verified tricky words');
    assert.equal(await page.evaluate(() => boothQueue.every(target => target.targetType === 'word' && target.kind === 'Tricky word')), true);
    await page.evaluate(() => closeRecordingBooth());

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export Word Voice Pack' }).click();
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), 'little_wandle_word_voice_pack.json');
    const tempPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'prep2-word-pack-')), download.suggestedFilename());
    await download.saveAs(tempPath);
    const pack = JSON.parse(fs.readFileSync(tempPath, 'utf8'));
    assert.equal(pack.clips.some(clip => clip.id === 'tricky:is' && clip.base64Audio.includes('VEVTVA')), true);

    await page.setViewportSize({ width: 360, height: 800 });
    const firstActionRow = page.locator('#soundsGrid .sound-actions-row').first();
    assert.equal(await firstActionRow.getByText('Download WAV', { exact: true }).count(), 1, 'the individual WAV download must have an explicit label');
    const actionLayout = await firstActionRow.evaluate(row => {
      const rowRect = row.getBoundingClientRect();
      const controls = [...row.children].map(control => control.getBoundingClientRect());
      return {
        overflows: row.scrollWidth > row.clientWidth + 1,
        controlsInside: controls.every(rect => rect.left >= rowRect.left - 1 && rect.right <= rowRect.right + 1),
        columns: getComputedStyle(row).gridTemplateColumns.split(' ').length
      };
    });
    assert.equal(actionLayout.overflows, false, 'the sound action row must not clip horizontally on a phone');
    assert.equal(actionLayout.controlsInside, true, 'every sound action must stay inside its card');
    assert.equal(actionLayout.columns, 2, 'sound actions should use a stable two-column mobile-safe grid');
    assert.deepEqual(pageErrors, [], `Teacher Studio raised browser errors: ${pageErrors.join(' | ')}`);
    console.log('PASS: Teacher Studio records, recognizes, and exports publishable word audio');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});

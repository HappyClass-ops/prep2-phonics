(() => {
  "use strict";

  const PHASE_ORDER = [2, 3, 4, 5];
  const CLIMBS_PER_PHASE = 6;
  const PHASES = {
    2: {
      name: "Mosslight Meadow", short: "Short vowels", message: "Short vowels and simple consonants.", skin: "Trail Scout",
      words: {
        noun: ["cat", "dog", "rat", "pig", "duck", "hen", "fox", "fish", "moth", "bug", "chick", "sun", "fog", "mud", "log", "web", "pot", "cup", "bed", "cap", "hat", "pan", "fan", "pin", "net", "jug", "box", "bag", "tin", "sock", "bell", "doll", "van", "ship", "shed", "bin", "mat", "peg", "rug", "mop", "cot", "chin", "lip", "leg", "rib", "bun", "nut", "jam", "ham", "fig", "bath", "wing"],
        verb: ["run", "hop", "jog", "sit", "dig", "dip", "rip", "zip", "tap", "pat", "hit", "nod", "beg", "rub", "wag", "cut", "pack", "pick", "kick", "lick", "chop", "tug", "win", "hug", "kiss", "huff", "puff", "buzz", "yell", "sob", "chat", "sing", "bang", "hang", "ring", "sink", "wink", "hush", "rush", "dash"],
        adjective: ["big", "fat", "fit", "thin", "thick", "hot", "wet", "red", "dim", "dull", "bad", "sad", "mad", "sick", "well", "ill", "rich", "quick", "shut", "fed", "rash", "posh", "odd", "fun"],
        adverb: ["up", "in", "on", "off", "back", "well", "quick", "bad", "mad", "then", "yet", "much", "less"]
      }
    },
    3: {
      name: "Rainfinder Reach", short: "Long vowels", message: "Vowel digraphs and trigraphs join the trail.", skin: "Rainfinder",
      words: {
        noun: ["rain", "hail", "soil", "farm", "barn", "yard", "bark", "thorn", "moon", "wood", "river", "summer", "sheep", "bee", "owl", "cow", "toad", "deer", "tail", "nail", "chain", "sail", "boat", "coat", "soap", "road", "boot", "book", "hook", "cork", "fork", "horn", "coin", "foil", "feet", "tooth", "cheek", "beard", "hair", "ear", "farmer", "sister", "boxer", "singer", "cook"],
        verb: ["see", "look", "peep", "feel", "weep", "fear", "hear", "seem", "wait", "sail", "rain", "hail", "feed", "meet", "seek", "cook", "hook", "bark", "mark", "park", "burn", "turn", "curl", "howl", "boil", "toil", "zoom", "hoot", "roar", "tear"],
        adjective: ["deep", "dark", "cool", "sharp", "short", "fair", "light", "high", "good", "hard", "poor", "keen", "meek", "sour", "near", "dear", "pure", "tart", "torn", "worn"],
        adverb: ["down", "near", "far", "now", "soon", "tonight", "hard", "deep", "high", "fair", "too"]
      }
    },
    4: {
      name: "Windrider Cliffs", short: "Blends", message: "Consonant blends make the route steeper.", skin: "Windrider",
      words: {
        noun: ["frog", "crab", "slug", "snail", "clown", "twin", "chimp", "pond", "sand", "wind", "frost", "drift", "cliff", "creek", "tree", "star", "storm", "track", "flag", "drum", "plug", "plum", "spot", "step", "sled", "vest", "nest", "tent", "belt", "lamp", "ramp", "stump", "spoon", "train", "toast", "scarf"],
        verb: ["jump", "swim", "skip", "spin", "step", "stop", "trip", "trot", "slip", "slam", "creep", "sweep", "sprint", "clap", "flap", "slap", "grab", "grip", "drop", "drip", "drag", "plod", "plug", "cram", "plan", "snap", "bend", "mend", "send", "lend", "land", "stand", "print", "blink", "drink", "sink", "float", "roast", "bleed"],
        adjective: ["soft", "fast", "damp", "crisp", "fresh", "flat", "slim", "trim", "blunt", "plump", "steep", "green", "glad", "grim", "drab", "snug", "swift", "grand", "brisk", "blond", "fond", "strict", "smart", "sweet"],
        adverb: ["fast", "slow", "soft", "swift", "smart", "strict", "flat", "next", "still", "just", "past", "west", "best"]
      }
    },
    5: {
      name: "Starpilot Summit", short: "Grow the code", message: "Alternative spellings and split digraphs fill the sky.", skin: "Starpilot",
      words: {
        noun: ["whale", "dolphin", "hawk", "fawn", "monkey", "donkey", "puppy", "kitten", "snake", "bird", "cloud", "tray", "straw", "phone", "screw", "cake", "plate", "bike", "kite", "rope", "flute", "badge", "wrench", "candle", "bottle", "beach", "city", "home", "knight", "baby", "lady", "boy", "girl", "giant", "thumb", "wrist", "knee", "mouth", "toe", "time", "ice", "gem", "party", "clue"],
        verb: ["play", "stay", "shout", "count", "bounce", "eat", "read", "dream", "crawl", "yawn", "whistle", "bake", "make", "wave", "chase", "smile", "ride", "hide", "shine", "hope", "stroke", "tune", "dance", "glance", "race", "nudge", "knit", "knot", "wrap", "wreck", "write", "tickle", "cuddle", "hurry"],
        adjective: ["brave", "safe", "late", "same", "white", "ripe", "fine", "wide", "polite", "cute", "huge", "rude", "neat", "clean", "cheap", "proud", "loud", "round", "grey", "royal", "joyful", "blue", "true", "raw", "gentle", "nice", "strange", "wrong", "wriggly", "little", "simple", "shiny", "tiny", "happy", "sunny", "muddy", "silly", "funny", "lucky"],
        adverb: ["safely", "bravely", "politely", "widely", "rudely", "loudly", "proudly", "neatly", "sweetly", "cheaply", "slowly", "softly", "swiftly", "gladly", "boldly", "crisply", "brightly", "strictly", "sadly", "badly", "dimly", "gently", "calmly", "late", "today", "tonight", "away", "out", "round", "home", "close", "quite"]
      }
    }
  };

  const KIND_HELP = {
    noun: "a naming word for a person, place, animal or thing",
    verb: "an action or doing word",
    adjective: "a word that describes a noun",
    adverb: "a word that tells how, when or where an action happens"
  };

  const ADVERB_HELP = {
    up: ["towards a higher place", "Hop up on the log."], in: ["inside a place", "Pip went in."], on: ["in place above a surface", "Sit on the log."], off: ["away from a place or surface", "Hop off the log."], back: ["towards the place you came from", "Step back."], well: ["in a good way", "She can sing well."], quick: ["in a fast way", "Run quick!"], bad: ["in a poor way", "It went bad."], mad: ["in an angry way", "He ran mad."], then: ["after that", "Then he ran."], yet: ["up to this time", "Not yet."], much: ["a large amount", "Do not yell so much."], less: ["a smaller amount", "Chat less."],
    down: ["towards a lower place", "Sit down."], near: ["not far away", "Stay near."], far: ["a long way away", "Do not go far."], now: ["at this time", "Feed the sheep now."], soon: ["after a short time", "See you soon."], tonight: ["during this night", "We sail tonight."], hard: ["with a lot of effort", "Push hard."], deep: ["far down", "Dig deep."], high: ["at or towards a high place", "Fly high."], fair: ["in an honest way", "Play fair."], too: ["more than is needed", "The tea is too hot."],
    fast: ["at high speed", "The crab ran fast."], slow: ["at low speed", "Go slow."], soft: ["in a quiet or gentle way", "Tread soft."], swift: ["in a quick way", "Run swift."], smart: ["in a clever way", "Work smart."], strict: ["in a firm way", "Act strict."], flat: ["in a level position", "Lie flat."], next: ["immediately after", "What comes next?"], still: ["without moving", "Stand still."], just: ["only a short time ago", "He just jumped."], past: ["beyond a place", "The frog swam past."], west: ["towards the west", "Fly west."], best: ["better than all the others", "He did best."],
    safely: ["without getting hurt or damaged", "Pip landed safely."], bravely: ["in a brave way", "She climbed bravely."], politely: ["with good manners", "Speak politely."], widely: ["over a large area", "Open it widely."], rudely: ["without good manners", "He spoke rudely."], loudly: ["with a lot of sound", "She shouted loudly."], proudly: ["in a pleased and confident way", "He stood proudly."], neatly: ["in a tidy way", "Write neatly."], sweetly: ["in a kind or pleasant way", "She sang sweetly."], cheaply: ["for little money", "It sold cheaply."], slowly: ["at a low speed", "Walk slowly."], softly: ["in a gentle or quiet way", "The fox crept softly."], swiftly: ["very quickly", "Pip flew swiftly."], gladly: ["in a happy and willing way", "I gladly helped."], boldly: ["in a brave and confident way", "Step boldly."], crisply: ["in a clear, sharp way", "Speak crisply."], brightly: ["with lots of light", "The star shone brightly."], strictly: ["in a firm way", "Follow it strictly."], sadly: ["in an unhappy way", "He sobbed sadly."], badly: ["in a poor way", "The kite flew badly."], dimly: ["with only a little light", "The lamp glowed dimly."], gently: ["in a kind, careful way", "Stroke the kitten gently."], calmly: ["in a quiet, peaceful way", "Wait calmly."], late: ["after the expected time", "Do not arrive late."], today: ["on this day", "We bake today."], away: ["to another place", "Run away!"], out: ["away from inside", "Go out."], round: ["in a circle or to the other side", "Turn round."], home: ["to the place where you live", "Go home."], close: ["to a nearby place", "Come close."], quite: ["to a fairly large degree", "The cave is quite dark."]
  };

  const ids = ["game", "skyScene", "world", "choices", "pip", "lives", "promptCard", "promptKicker", "promptVerb", "targetWord", "promptHelp", "promptAudio", "scoreText", "coinText", "clueText", "shopButton", "soundButton", "dictionaryButton", "trail", "toast", "particles", "pipTalk", "levelBanner", "levelNumber", "levelName", "levelMessage", "wordHelper", "wordHelperClose", "helperWord", "helperKind", "helperDefinition", "helperExample", "fullDictionaryLink", "loadingOverlay", "introOverlay", "storyOverlay", "storyText", "storyNextButton", "storySkipButton", "shopOverlay", "dictionaryOverlay", "resultOverlay", "playButton", "introShopButton", "introDictionaryButton", "closeShopButton", "backToTrailButton", "closeDictionaryButton", "dictionaryPhases", "dictionarySearch", "dictionaryList", "shopCoins", "rewardFill", "rewardMessage", "resultEyebrow", "resultTitle", "resultCopy", "resultScore", "resultBest", "resultCoins", "resultPip", "againButton", "choosePhaseButton", "announcer", "phasePicker", "unlockText", "difficultyPicker", "homeBest", "homeStars", "homeCheckpoints"];
  const els = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));

  const store = {
    read(key, fallback) { try { const value = localStorage.getItem(`wordwind_${key}`); return value === null ? fallback : JSON.parse(value); } catch { return fallback; } },
    write(key, value) { try { localStorage.setItem(`wordwind_${key}`, JSON.stringify(value)); } catch {} }
  };

  const state = {
    running: false, busy: false, score: 0, phaseScore: 0, phase: 2,
    selectedPhase: Math.min(5, Math.max(2, store.read("selectedPhase", 2))),
    unlockedPhase: Math.min(5, Math.max(2, store.read("unlockedPhase", 2))),
    storyIndex: 0, best: store.read("best", 0), coins: store.read("coins", 0),
    maxHearts: store.read("maxHearts", 3), hearts: 3, shield: store.read("shield", false),
    boots: store.read("boots", false), includeAdverbs: store.read("includeAdverbs", false),
    targetKind: "noun", previousKind: "", anchor: document.getElementById("startIsland"),
    audioOn: store.read("audioOn", true), bossMode: false, bossRemaining: 0, bossTargetPhase: 3,
    clues: 3, streak: 0, bestStreak: store.read("bestStreak", 0),
    totalCorrect: store.read("totalCorrect", 0), checkpoints: store.read("checkpoints", 0),
    dictionaryPhase: 2
  };
  if (state.selectedPhase > state.unlockedPhase) state.selectedPhase = state.unlockedPhase;

  class Sound {
    constructor() {
      this.ctx = null; this.sceneName = ""; this.ducked = false;
      this.music = {
        flight: this.makeAudio("assets/audio/wordwind-flight.mp3", .105, true),
        shop: this.makeAudio("assets/audio/wordwind-shop.mp3", .13, true)
      };
      this.files = {
        jump: "assets/audio/jump-whoosh.mp3", land: "assets/audio/soft-land.mp3",
        correct: "assets/audio/correct-chime.mp3", wrong: "assets/audio/wrong-wind.mp3",
        coin: "assets/audio/star-collect.mp3", checkpoint: "assets/audio/checkpoint-fanfare.mp3",
        clue: "assets/audio/clue-open.mp3", purchase: "assets/audio/upgrade-buy.mp3"
      };
    }
    makeAudio(src, volume, loop = false) { const audio = new Audio(src); audio.preload = "auto"; audio.volume = volume; audio.loop = loop; return audio; }
    ready() { const AudioCtx = window.AudioContext || window.webkitAudioContext; if (!AudioCtx) return; if (!this.ctx) this.ctx = new AudioCtx(); if (this.ctx.state === "suspended") this.ctx.resume(); }
    tone(freq, duration, type = "sine", volume = .12, delay = 0, endFreq = null) { if (!state.audioOn) return; this.ready(); if (!this.ctx) return; const t = this.ctx.currentTime + delay; const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.type = type; osc.frequency.setValueAtTime(freq, t); if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration); gain.gain.setValueAtTime(volume, t); gain.gain.exponentialRampToValueAtTime(.001, t + duration); osc.connect(gain).connect(this.ctx.destination); osc.start(t); osc.stop(t + duration); }
    effect(name, volume = .5) { if (!state.audioOn || !this.files[name]) return; const audio = this.makeAudio(this.files[name], volume); audio.play().catch(() => {}); }
    jump() { this.effect("jump", .34); } land() { this.effect("land", .42); }
    correct() { this.effect("correct", .42); }
    crack(stage) { this.tone(330 - stage * 60, .07 + stage * .025, "sawtooth", .1 + stage * .025, 0, 90); }
    boom() { this.effect("wrong", .48); } coin() { this.effect("coin", .38); }
    checkpoint() { this.effect("checkpoint", .48); } clue() { this.effect("clue", .4); } purchase() { this.effect("purchase", .5); }
    scene(name) {
      this.sceneName = name;
      Object.entries(this.music).forEach(([key, audio]) => {
        const wanted = key === name && state.audioOn;
        audio.volume = this.ducked ? .025 : (key === "shop" ? .13 : .105);
        if (wanted) audio.play().catch(() => {}); else { audio.pause(); if (key !== name) audio.currentTime = 0; }
      });
    }
    duck(on) { this.ducked = on; const current = this.music[this.sceneName]; if (current) current.volume = on ? .025 : (this.sceneName === "shop" ? .13 : .105); }
    toggle() { state.audioOn = !state.audioOn; store.write("audioOn", state.audioOn); if (state.audioOn) { this.ready(); this.scene(this.sceneName || "flight"); } else { Object.values(this.music).forEach(audio => audio.pause()); stopNarration(); } updateSoundButton(); }
  }
  const sound = new Sound();
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const ELEVENLABS_ENDPOINT = "https://prep2-phonics-api.goldenhappyaku.workers.dev/api/speech";
  const voiceCache = new Map();
  let activeVoiceAudio = null;
  let voiceRequestToken = 0;

  function appVoiceAvailable() { return location.origin === "https://happyclass-ops.github.io" || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(location.origin); }
  function stopNarration() { if (activeVoiceAudio) { activeVoiceAudio.pause(); activeVoiceAudio.currentTime = 0; activeVoiceAudio = null; } if ("speechSynthesis" in window) speechSynthesis.cancel(); sound.duck(false); }
  function speakWithBrowser(text) { if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) { sound.duck(false); return; } const voice = new SpeechSynthesisUtterance(text); voice.lang = "en-GB"; voice.rate = .82; voice.pitch = 1; voice.onend = voice.onerror = () => sound.duck(false); const britishVoice = speechSynthesis.getVoices().find(item => /^en-GB/i.test(item.lang)); if (britishVoice) voice.voice = britishVoice; speechSynthesis.speak(voice); }
  async function speak(text) {
    if (!state.audioOn) return;
    const cleanText = String(text || "").trim(); if (!cleanText) return;
    const token = ++voiceRequestToken; stopNarration(); sound.duck(true);
    if (appVoiceAvailable()) {
      try {
        let audioUrl = voiceCache.get(cleanText);
        if (!audioUrl) { const response = await fetch(ELEVENLABS_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: /[.!?]$/.test(cleanText) ? cleanText : `${cleanText}.` }) }); if (!response.ok) throw new Error(`Voice request failed (${response.status})`); audioUrl = URL.createObjectURL(await response.blob()); voiceCache.set(cleanText, audioUrl); }
        if (token !== voiceRequestToken) return;
        const audio = new Audio(audioUrl); activeVoiceAudio = audio; audio.onended = audio.onerror = () => { if (activeVoiceAudio === audio) activeVoiceAudio = null; sound.duck(false); }; await audio.play(); return;
      } catch (error) { console.warn("Teacher voice unavailable; using the browser voice.", error); }
    }
    if (token === voiceRequestToken) speakWithBrowser(cleanText);
  }

  function showOverlay(el) { el.classList.add("open"); }
  function hideOverlay(el) { if (!el) return; if (el.contains(document.activeElement)) document.activeElement.blur(); el.classList.remove("open"); els.game.scrollTop = 0; els.game.scrollLeft = 0; window.scrollTo(0, 0); }
  function phaseDetails(phase = state.phase) { return PHASES[phase]; }
  function enabledKinds() { return state.includeAdverbs ? ["noun", "verb", "adjective", "adverb"] : ["noun", "verb", "adjective"]; }
  function article(kind) { return /^[aeiou]/.test(kind) ? "an" : "a"; }
  function pluralKind(kind) { return kind === "adjective" ? "adjectives" : `${kind}s`; }
  function choose(list) { return list[Math.floor(Math.random() * list.length)]; }
  function shuffle(list) { return list.map(value => ({ value, order: Math.random() })).sort((a, b) => a.order - b.order).map(item => item.value); }

  function pipSay(message, duration = 1900) { clearTimeout(pipSay.timer); els.pipTalk.textContent = message; els.pipTalk.classList.add("show"); els.pip.classList.add("talking"); pipSay.timer = setTimeout(() => { els.pipTalk.classList.remove("show"); els.pip.classList.remove("talking"); }, duration); }
  function closeWordHelper() { clearTimeout(closeWordHelper.timer); els.wordHelper.classList.remove("show"); }
  function helpFor(word, kind) { if (kind === "adverb" && ADVERB_HELP[word]) return ADVERB_HELP[word]; const definitions = { noun: [`“${word}” names a person, place, animal or thing.`, `The word “${word}” is a noun.`], verb: [`“${word}” tells an action that someone or something can do.`, `The word “${word}” is a verb.`], adjective: [`“${word}” can describe what a noun is like.`, `The word “${word}” is an adjective.`] }; return definitions[kind] || [KIND_HELP[kind], `The word is “${word}”.`]; }
  function showWordHelper(word, kind) { const help = helpFor(word, kind); els.wordHelper.dataset.kind = kind; els.helperWord.textContent = word; els.helperKind.textContent = kind; els.helperDefinition.textContent = help[0]; els.helperExample.textContent = help[1]; els.fullDictionaryLink.href = `https://happyclass-ops.github.io/prep2-phonics/?word=${encodeURIComponent(word)}`; els.fullDictionaryLink.dataset.word = word; els.wordHelper.classList.add("show"); speak(`${word}. ${help[0]} ${help[1]}`); clearTimeout(closeWordHelper.timer); closeWordHelper.timer = setTimeout(closeWordHelper, 10000); }
  function useClue(word, kind) { if (!state.running || state.busy) return; if (state.clues <= 0) { toast("No clues left this run—trust your reading!", true); sound.boom(); return; } state.clues -= 1; updateHud(); sound.clue(); showWordHelper(word, kind); toast(`${state.clues} clue${state.clues === 1 ? "" : "s"} left`); }

  function setCamera(step = state.phaseScore) { const phaseRise = (state.phase - 2) * 15; const vertical = Math.max(12, 72 - phaseRise - step * 2.5); const horizontal = 50 + Math.sin((step + state.phase * 1.7) * 1.08) * 12; els.skyScene.style.backgroundPosition = `${horizontal.toFixed(1)}% ${vertical.toFixed(1)}%`; }
  function climbSky() { els.game.classList.remove("climbing"); void els.game.offsetWidth; els.game.classList.add("climbing"); setCamera(); setTimeout(() => els.game.classList.remove("climbing"), 1000); for (let i = 0; i < 18; i++) { const gust = document.createElement("i"); gust.className = "altitude-streak"; gust.style.left = `${5 + Math.random() * 90}%`; gust.style.top = `${-10 - Math.random() * 45}%`; gust.style.setProperty("--fall", `${110 + Math.random() * 80}%`); gust.style.animationDelay = `${Math.random() * .16}s`; els.particles.appendChild(gust); gust.addEventListener("animationend", () => gust.remove()); } }
  async function announceBanner(label, name, message, duration = 2300) { els.levelNumber.textContent = label; els.levelName.textContent = name; els.levelMessage.textContent = message; els.levelBanner.classList.remove("show"); void els.levelBanner.offsetWidth; els.levelBanner.classList.add("show"); sound.correct(); speak(`${label}. ${name}. ${message}`); await sleep(duration); els.levelBanner.classList.remove("show"); }

  function updatePhasePicker() { document.querySelectorAll(".phase-choice").forEach(button => { const phase = Number(button.dataset.phase); const locked = phase > state.unlockedPhase; button.disabled = locked; button.classList.toggle("active", phase === state.selectedPhase); button.classList.toggle("locked", locked); button.setAttribute("aria-pressed", String(phase === state.selectedPhase)); button.setAttribute("aria-label", locked ? `Phase ${phase}, locked` : `Start at Phase ${phase}, ${PHASES[phase].short}`); }); els.unlockText.textContent = state.unlockedPhase === 5 ? "All phases ready" : `Up to Phase ${state.unlockedPhase} ready`; updateDifficultyPicker(); updateHomeRecord(); }
  function updateDifficultyPicker() { document.querySelectorAll(".difficulty-choice").forEach(button => { const hard = button.dataset.difficulty === "hard"; const active = hard === state.includeAdverbs; button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active)); }); }
  function updateHomeRecord() { els.homeBest.textContent = state.best; els.homeStars.textContent = state.coins; els.homeCheckpoints.textContent = state.checkpoints; }
  function updateSoundButton() { els.soundButton.classList.toggle("muted", !state.audioOn); els.soundButton.setAttribute("aria-label", state.audioOn ? "Turn sound off" : "Turn sound on"); }
  function applyPhase(phase, preview = false) { state.phase = phase; els.game.dataset.phase = String(phase); els.game.dataset.level = String(phase - 1); if (!preview) { els.promptKicker.textContent = `Phase ${phase} · ${phaseDetails().name} · ${state.phaseScore}/${CLIMBS_PER_PHASE}`; setCamera(); } }

  function renderStory() { const details = PHASES[state.selectedPhase]; const wordJobs = state.includeAdverbs ? "nouns, verbs, adjectives and adverbs" : "nouns, verbs and adjectives"; const pages = [`The Wordwind has hidden the Phase ${state.selectedPhase} signs across ${details.name}!`, `Help me climb by sorting ${wordJobs}. Every word follows the Phase ${state.selectedPhase} phonics route.`, `After ${CLIMBS_PER_PHASE} leaps we reach a checkpoint. More than one next-phase island may be right, so look carefully!`]; els.storyText.textContent = pages[state.storyIndex]; els.storyNextButton.textContent = state.storyIndex === pages.length - 1 ? "Let's fly" : "Next"; }
  function beginStory() { sound.ready(); sound.scene("flight"); state.storyIndex = 0; hideOverlay(els.introOverlay); renderStory(); showOverlay(els.storyOverlay); }
  function advanceStory() { if (state.storyIndex >= 2) { hideOverlay(els.storyOverlay); startGame(); return; } state.storyIndex += 1; renderStory(); }

  function updateHud() {
    els.scoreText.textContent = state.score; els.coinText.textContent = state.coins; els.clueText.textContent = state.clues; els.shopCoins.textContent = state.coins; els.lives.innerHTML = "";
    for (let i = 0; i < state.maxHearts; i++) { const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("viewBox", "0 0 32 29"); svg.setAttribute("aria-hidden", "true"); svg.classList.add("heart"); if (i >= state.hearts) svg.classList.add("lost"); svg.innerHTML = '<path d="M16 27S2 18.5 2 9.7C2 4.7 5.4 2 9.3 2c3 0 5.2 1.8 6.7 4.2C17.5 3.8 19.7 2 22.7 2 26.6 2 30 4.7 30 9.7 30 18.5 16 27 16 27Z" fill="#ee655e" stroke="#fff7df" stroke-width="2"/>'; els.lives.appendChild(svg); }
    els.lives.setAttribute("aria-label", `${state.hearts} of ${state.maxHearts} hearts`);
    [...els.trail.children].forEach((dot, index) => { if (dot.classList.contains("trail-gate")) dot.classList.toggle("ready", state.bossMode); else dot.classList.toggle("done", index < state.phaseScore); });
    els.game.classList.toggle("out-of-clues", state.clues <= 0); document.querySelectorAll(".learn-word span").forEach(badge => { badge.textContent = state.clues; }); updateHomeRecord();
  }
  function buildTrail() { els.trail.innerHTML = ""; for (let i = 0; i < CLIMBS_PER_PHASE; i++) { const dot = document.createElement("span"); dot.className = "trail-dot"; els.trail.appendChild(dot); } const gate = document.createElement("span"); gate.className = "trail-gate"; gate.textContent = "◆"; gate.setAttribute("aria-hidden", "true"); els.trail.appendChild(gate); }
  function chooseKind() { const available = enabledKinds().filter(kind => kind !== state.previousKind); const kind = choose(available); state.previousKind = kind; return kind; }

  function makeOptions(count) { const bank = phaseDetails().words; const correct = { word: choose(bank[state.targetKind]), kind: state.targetKind, bossCorrect: false }; const otherKinds = enabledKinds().filter(kind => kind !== state.targetKind); const options = [correct]; while (options.length < count) { const kind = otherKinds[(options.length - 1) % otherKinds.length]; let word = choose(bank[kind]); while (options.some(item => item.word === word)) word = choose(bank[kind]); options.push({ word, kind, bossCorrect: false }); } return shuffle(options); }
  function makeBossOptions(targetPhase, count = 5) { const bank = PHASES[targetPhase].words; const correctCount = state.phase === 5 ? 3 : 2; const options = []; while (options.length < correctCount) { const word = choose(bank[state.targetKind]); if (!options.some(item => item.word === word)) options.push({ word, kind: state.targetKind, bossCorrect: true }); } const otherKinds = enabledKinds().filter(kind => kind !== state.targetKind); while (options.length < count) { const kind = otherKinds[(options.length - correctCount) % otherKinds.length]; const word = choose(bank[kind]); if (!options.some(item => item.word === word)) options.push({ word, kind, bossCorrect: false }); } state.bossRemaining = correctCount; return shuffle(options); }

  function createIsland(option, index, count) {
    const island = document.createElement("div"); island.className = `island count-${count} pos-${String.fromCharCode(97 + index)}`; island.setAttribute("role", "button"); island.setAttribute("tabindex", "0"); island.setAttribute("aria-label", `${option.word}. Choose this word`); island.dataset.word = option.word; island.dataset.kind = option.kind; island.dataset.bossCorrect = String(Boolean(option.bossCorrect));
    island.style.setProperty("--drift-delay", `${-(index * .61 + count * .17)}s`); island.innerHTML = `<div class="island-inner"><img class="island-art" src="assets/wind-island-v2.webp" alt=""><i class="island-glint" aria-hidden="true"></i></div><div class="word-plaque">${option.word}</div><button class="learn-word" type="button" aria-label="Use a clue for ${option.word}">?<span>${state.clues}</span></button><button class="speak-word" type="button" aria-label="Hear ${option.word}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10v4h3l4 3V7L8 10H5Zm10-1.5a5 5 0 0 1 0 7"/></svg></button>`;
    const leap = event => { if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return; event.preventDefault(); handleChoice(island); };
    island.addEventListener("click", leap); island.addEventListener("keydown", leap);
    island.querySelector(".speak-word").addEventListener("click", event => { event.stopPropagation(); sound.ready(); speak(option.word); });
    island.querySelector(".learn-word").addEventListener("click", event => { event.stopPropagation(); sound.ready(); useClue(option.word, option.kind); });
    island.addEventListener("pointerenter", () => els.pip.classList.add("engaged")); island.addEventListener("pointerleave", () => els.pip.classList.remove("engaged")); return island;
  }

  function choiceCount() { if (state.phase === 2) return state.phaseScore < 3 ? 2 : 3; if (state.phase === 3) return 3; return 4; }
  function setPrompt(kind, boss = false) { els.promptCard.dataset.kind = kind; if (boss) { els.promptVerb.textContent = "Find"; els.promptKicker.textContent = `Phase ${state.phase} checkpoint · Phase ${state.bossTargetPhase} preview`; els.targetWord.textContent = `all the ${pluralKind(kind)}`; els.promptHelp.textContent = `${state.bossRemaining} islands are right`; } else { els.promptVerb.textContent = "Land on"; els.promptKicker.textContent = `Phase ${state.phase} · ${phaseDetails().name} · ${state.phaseScore}/${CLIMBS_PER_PHASE}`; els.targetWord.textContent = `${article(kind)} ${kind}`; els.promptHelp.textContent = KIND_HELP[kind]; } }
  function newRound() { if (!state.running) return; if (state.phaseScore >= CLIMBS_PER_PHASE) { beginCheckpoint(); return; } state.busy = false; state.bossMode = false; els.game.classList.remove("at-checkpoint"); state.anchor.classList.remove("checkpoint"); clearTimeout(toast.timer); els.toast.classList.remove("show"); closeWordHelper(); state.targetKind = chooseKind(); setPrompt(state.targetKind, false); els.choices.className = ""; els.choices.innerHTML = ""; const count = choiceCount(); makeOptions(count).forEach((option, index) => els.choices.appendChild(createIsland(option, index, count))); updateHud(); const lines = { noun: "Find a naming word!", verb: "Which word can I do?", adjective: "Find a describing word!", adverb: "How, when or where?" }; setTimeout(() => pipSay(lines[state.targetKind]), 220); setTimeout(() => speak(`Land on ${article(state.targetKind)} ${state.targetKind}.`), 340); }

  async function beginCheckpoint() { if (state.bossMode || !state.running) return; state.busy = true; state.bossMode = true; state.bossTargetPhase = state.phase < 5 ? state.phase + 1 : 5; state.anchor.classList.add("checkpoint"); els.game.classList.add("at-checkpoint"); setCamera(CLIMBS_PER_PHASE + 1); updateHud(); const preview = state.phase < 5 ? `Phase ${state.bossTargetPhase} preview` : "Final mastery"; await announceBanner("CHECKPOINT", preview, "More than one island is right.", 2100); if (!state.running) return; state.targetKind = chooseKind(); els.choices.className = "boss-round"; els.choices.innerHTML = ""; const options = makeBossOptions(state.bossTargetPhase, 5); setPrompt(state.targetKind, true); options.forEach((option, index) => els.choices.appendChild(createIsland(option, index, 5))); pipSay("Checkpoint! Find every right island.", 2300); speak(`Checkpoint challenge. Find all the ${pluralKind(state.targetKind)}. ${state.bossRemaining} islands are right.`); state.busy = false; updateHud(); }

  function getPipPosition(island) { return { left: island.offsetLeft + island.offsetWidth * .5 - els.pip.offsetWidth * .5, top: island.offsetTop + island.offsetHeight * .37 - els.pip.offsetHeight * .9 }; }
  async function animatePipTo(island) {
    const start = { left: els.pip.offsetLeft, top: els.pip.offsetTop }; const end = getPipPosition(island);
    const dx = end.left - start.left; const dy = end.top - start.top; const distance = Math.hypot(dx, dy);
    const lift = Math.max(els.game.clientHeight * .15, Math.min(els.game.clientHeight * .25, distance * .42));
    const duration = Math.round(Math.max(680, Math.min(930, 620 + distance * .34)));
    els.pip.classList.add("crouch"); island.classList.add("awaiting-pip"); await sleep(145);
    els.pip.classList.remove("crouch"); els.pip.classList.add("airborne"); els.game.classList.add("pip-jumping"); sound.jump();
    const motion = els.pip.animate([
      { transform: "translate3d(0,0,0) rotate(0deg) scale(1)", offset: 0, easing: "cubic-bezier(.3,.02,.65,.32)" },
      { transform: `translate3d(${dx * .16}px,${dy * .16 - lift * .56}px,0) rotate(${-Math.sign(dx) * 5}deg) scale(.96,1.06)`, offset: .2, easing: "cubic-bezier(.18,.72,.28,1)" },
      { transform: `translate3d(${dx * .48}px,${dy * .48 - lift}px,0) rotate(${Math.sign(dx) * 2}deg) scale(1.02)`, offset: .48, easing: "cubic-bezier(.45,0,.72,.42)" },
      { transform: `translate3d(${dx * .78}px,${dy * .78 - lift * .55}px,0) rotate(${Math.sign(dx) * 7}deg) scale(1.02,.98)`, offset: .78, easing: "cubic-bezier(.2,.75,.28,1)" },
      { transform: `translate3d(${dx}px,${dy}px,0) rotate(0deg) scale(.98,1.03)`, offset: 1 }
    ], { duration, easing: "linear", fill: "forwards" });
    setTimeout(() => els.pip.classList.add("glide"), duration * .28); await motion.finished;
    els.pip.style.left = `${end.left}px`; els.pip.style.top = `${end.top}px`; motion.cancel();
    els.game.classList.remove("pip-jumping"); els.pip.classList.remove("airborne", "glide"); els.pip.classList.add("land"); island.classList.remove("awaiting-pip"); island.classList.add("pip-impact"); sound.land();
    await sleep(290); els.pip.classList.remove("land"); island.classList.remove("pip-impact");
  }
  function setChoicesDisabled(disabled) { els.choices.querySelectorAll(".island").forEach(island => { island.setAttribute("aria-disabled", String(disabled)); island.setAttribute("tabindex", disabled ? "-1" : "0"); }); }
  function toast(message, bad = false) { els.toast.textContent = message; els.toast.classList.toggle("bad", bad); els.toast.classList.add("show"); clearTimeout(toast.timer); toast.timer = setTimeout(() => els.toast.classList.remove("show"), 2100); }

  function burstAt(island) { const gameRect = els.game.getBoundingClientRect(); const rect = island.getBoundingClientRect(); const x = rect.left - gameRect.left + rect.width / 2; const y = rect.top - gameRect.top + rect.height * .25; const colours = ["#ffcb50", "#ef6f62", "#6ee0c2", "#ffffff", "#3d86d8"]; for (let i = 0; i < 18; i++) { const bit = document.createElement("i"); const angle = Math.random() * Math.PI * 2; const distance = gameRect.width * (.04 + Math.random() * .07); bit.className = "particle"; bit.style.left = `${x}px`; bit.style.top = `${y}px`; bit.style.setProperty("--s", `${3 + Math.random() * gameRect.width * .008}px`); bit.style.setProperty("--c", colours[i % colours.length]); bit.style.setProperty("--x", `${Math.cos(angle) * distance}px`); bit.style.setProperty("--y", `${Math.sin(angle) * distance}px`); els.particles.appendChild(bit); bit.addEventListener("animationend", () => bit.remove()); } }
  async function moveNewAnchor(target) { const endLeft = state.anchor.offsetLeft; const endTop = state.anchor.offsetTop; const startLeft = target.offsetLeft; const startTop = target.offsetTop; const pipStart = { left: els.pip.offsetLeft, top: els.pip.offsetTop }; const pipEnd = getPipPosition(state.anchor); state.anchor.animate([{ transform: "translateY(0) scale(1)", opacity: .85 }, { transform: "translateY(2%) scale(.94)", opacity: .35 }, { transform: "translateY(0) scale(1)", opacity: 1 }], { duration: 680, easing: "cubic-bezier(.16,1,.3,1)" }); const islandMove = target.animate([{ transform: "translate3d(0,0,0) scale(1)", opacity: 1 }, { transform: `translate3d(${endLeft - startLeft}px,${endTop - startTop}px,0) scale(.82)`, opacity: .18 }], { duration: 680, fill: "forwards", easing: "cubic-bezier(.16,1,.3,1)" }); const pipMove = els.pip.animate([{ transform: "translate3d(0,0,0)" }, { transform: `translate3d(${pipEnd.left - pipStart.left}px,${pipEnd.top - pipStart.top}px,0)` }], { duration: 680, fill: "forwards", easing: "cubic-bezier(.16,1,.3,1)" }); await Promise.all([islandMove.finished, pipMove.finished]); els.pip.style.left = `${pipEnd.left}px`; els.pip.style.top = `${pipEnd.top}px`; islandMove.cancel(); pipMove.cancel(); els.choices.innerHTML = ""; }

  function awardCorrect() {
    state.streak += 1; state.bestStreak = Math.max(state.bestStreak, state.streak); state.totalCorrect += 1;
    const base = state.boots ? 2 : 1; const hardBonus = state.includeAdverbs ? 1 : 0; const streakBonus = state.streak % 3 === 0 ? 1 : 0;
    const gain = base + hardBonus + streakBonus; state.coins += gain; state.score += 1; state.best = Math.max(state.best, state.score);
    store.write("coins", state.coins); store.write("best", state.best); store.write("bestStreak", state.bestStreak); store.write("totalCorrect", state.totalCorrect);
    return { gain, streakBonus };
  }
  async function correctChoice(island) { island.classList.add("correct"); const reward = awardCorrect(); state.phaseScore += 1; sound.correct(); sound.coin(); burstAt(island); climbSky(); toast(reward.streakBonus ? `Sky streak! +${reward.gain} stars` : `Correct! +${reward.gain} star${reward.gain === 1 ? "" : "s"}`); updateHud(); [...els.choices.querySelectorAll(".island")].filter(choice => choice !== island).forEach((choice, index) => { choice.animate([{ transform: "translate(0,0)", opacity: 1 }, { transform: `translate(${-135 - index * 22}%, ${42 + index * 13}%)`, opacity: 0 }], { duration: 720, fill: "forwards", easing: "cubic-bezier(.35,.05,.8,.5)" }); }); await sleep(510); await moveNewAnchor(island); await sleep(140); newRound(); }
  async function bossCorrectChoice(island) { island.classList.add("correct", "boss-cleared"); const reward = awardCorrect(); state.bossRemaining -= 1; sound.correct(); sound.coin(); burstAt(island); updateHud(); toast(state.bossRemaining ? `Correct! +${reward.gain} · ${state.bossRemaining} right island${state.bossRemaining === 1 ? "" : "s"} left` : "Checkpoint cleared!"); await sleep(380); island.remove(); await returnPipToAnchor(); if (state.bossRemaining <= 0) await completeCheckpoint(); else { setPrompt(state.targetKind, true); state.busy = false; setChoicesDisabled(false); } }

  async function wrongChoice(island) { state.streak = 0; island.classList.add("wrong"); els.pip.classList.add("panic"); const phrase = `“${island.dataset.word}” is ${article(island.dataset.kind)} ${island.dataset.kind}, not ${article(state.targetKind)} ${state.targetKind}.`; toast(phrase, true); els.announcer.textContent = phrase; await sleep(170); for (let i = 1; i <= 3; i++) { island.classList.add(`crack-${i}`); sound.crack(i); await sleep(i === 3 ? 230 : 260); } els.pip.classList.remove("panic"); if (state.shield) { state.shield = false; store.write("shield", false); burstAt(island); toast("Cloud shield rescue!"); sound.correct(); await returnPipToAnchor(); island.remove(); state.busy = false; setChoicesDisabled(false); return; } sound.boom(); els.pip.classList.add("fall"); const distance = els.game.clientHeight * .72; const fallPip = els.pip.animate([{ transform: "translateY(0)" }, { transform: `translateY(${distance}px)` }], { duration: 720, fill: "forwards", easing: "cubic-bezier(.5,.1,.8,.7)" }); const fallIsland = island.animate([{ transform: "translateY(0) rotate(0)", opacity: 1 }, { transform: `translateY(${distance * .7}px) rotate(-18deg)`, opacity: 0 }], { duration: 660, fill: "forwards", easing: "ease-in" }); await Promise.all([fallPip.finished, fallIsland.finished]); state.hearts -= 1; updateHud(); island.remove(); fallPip.cancel(); fallIsland.cancel(); els.pip.classList.remove("fall"); if (state.hearts <= 0) { state.running = false; await sleep(280); showResult(false); } else { await returnPipToAnchor(); state.busy = false; setChoicesDisabled(false); } }
  async function returnPipToAnchor() { const end = getPipPosition(state.anchor); const start = { left: els.pip.offsetLeft, top: els.pip.offsetTop }; const dx = end.left - start.left; const dy = end.top - start.top; const motion = els.pip.animate([{ transform: "translate3d(0,0,0) scale(1)", opacity: 1 }, { transform: `translate3d(${dx * .52}px,${dy * .52 - els.game.clientHeight * .08}px,0) scale(.92)`, opacity: .78, offset: .52 }, { transform: `translate3d(${dx}px,${dy}px,0) scale(1)`, opacity: 1 }], { duration: 520, fill: "forwards", easing: "cubic-bezier(.16,1,.3,1)" }); await motion.finished; els.pip.style.left = `${end.left}px`; els.pip.style.top = `${end.top}px`; motion.cancel(); els.pip.classList.add("flash"); burstAt(state.anchor); await sleep(260); els.pip.classList.remove("flash"); }

  async function completeCheckpoint() { state.busy = true; els.choices.innerHTML = ""; state.checkpoints += 1; store.write("checkpoints", state.checkpoints); sound.checkpoint(); updateHomeRecord(); if (state.phase >= 5) { state.running = false; await announceBanner("SUMMIT CLEAR", "Master of the Wordwind", "Every phonics phase is complete!", 2500); showResult(true); return; } const nextPhase = state.phase + 1; state.unlockedPhase = Math.max(state.unlockedPhase, nextPhase); state.selectedPhase = nextPhase; store.write("unlockedPhase", state.unlockedPhase); store.write("selectedPhase", nextPhase); state.phase = nextPhase; state.phaseScore = 0; state.bossMode = false; state.previousKind = ""; state.anchor.classList.remove("checkpoint"); els.game.classList.remove("at-checkpoint"); applyPhase(nextPhase); els.promptVerb.textContent = "Ready for"; els.targetWord.textContent = `Phase ${nextPhase}`; els.promptHelp.textContent = phaseDetails().message; buildTrail(); updatePhasePicker(); updateHud(); await announceBanner(`PHASE ${nextPhase} UNLOCKED`, phaseDetails().name, `${phaseDetails().skin} gear equipped.`, 2500); pipSay(`New gear! Welcome to ${phaseDetails().name}.`, 2100); await sleep(320); newRound(); }
  async function handleChoice(island) { if (!state.running || state.busy || island.getAttribute("aria-disabled") === "true") return; sound.ready(); closeWordHelper(); els.pip.classList.remove("engaged", "talking"); els.pipTalk.classList.remove("show"); state.busy = true; setChoicesDisabled(true); await animatePipTo(island); if (state.bossMode) { if (island.dataset.bossCorrect === "true") await bossCorrectChoice(island); else await wrongChoice(island); } else if (island.dataset.kind === state.targetKind) await correctChoice(island); else await wrongChoice(island); }

  function resetAnchor() { let start = document.getElementById("startIsland"); if (!start) { start = document.createElement("div"); start.id = "startIsland"; start.className = "island anchor"; start.setAttribute("aria-hidden", "true"); start.innerHTML = '<div class="island-inner"><img class="island-art" src="assets/wind-island-v2.webp" alt=""></div>'; els.world.insertBefore(start, els.choices); } start.className = "island anchor"; start.removeAttribute("style"); state.anchor = start; els.pip.removeAttribute("style"); }
  function startGame() { sound.ready(); sound.scene("flight"); hideOverlay(els.introOverlay); hideOverlay(els.storyOverlay); hideOverlay(els.resultOverlay); hideOverlay(els.shopOverlay); hideOverlay(els.dictionaryOverlay); closeWordHelper(); state.running = true; state.busy = false; state.score = 0; state.phaseScore = 0; state.phase = state.selectedPhase; state.hearts = state.maxHearts; state.clues = 3; state.streak = 0; state.previousKind = ""; state.bossMode = false; state.bossRemaining = 0; els.game.classList.remove("run-won", "run-lost"); els.choices.innerHTML = ""; els.choices.className = ""; resetAnchor(); applyPhase(state.phase); buildTrail(); const startPosition = getPipPosition(state.anchor); els.pip.style.left = `${startPosition.left}px`; els.pip.style.top = `${startPosition.top}px`; updateHud(); newRound(); }
  function showResult(success) { els.game.classList.toggle("run-won", success); els.game.classList.toggle("run-lost", !success); els.resultPip.classList.toggle("success", success); els.resultPip.classList.toggle("failed", !success); els.resultEyebrow.textContent = success ? "All checkpoints clear" : "The wind caught Pip"; els.resultTitle.textContent = success ? "Wordwind champion!" : "Ready for another go?"; els.resultCopy.textContent = success ? "Pip reached the Starpilot Summit and mastered every word path." : `Pip reached Phase ${state.phase}. That route was tricky—but your personal best is waiting.`; els.resultScore.textContent = state.score; els.resultBest.textContent = state.best; els.resultCoins.textContent = state.coins; updateHomeRecord(); showOverlay(els.resultOverlay); }

  function updateShop() { const costs = { shield: 6, heart: 12, boots: 18 }; els.shopCoins.textContent = state.coins; const remaining = []; document.querySelectorAll(".buy-button").forEach(button => { const item = button.dataset.item; const owned = (item === "shield" && state.shield) || (item === "heart" && state.maxHearts >= 4) || (item === "boots" && state.boots); button.textContent = owned ? "Equipped" : `Get · ${costs[item]} ✦`; button.disabled = owned || state.coins < costs[item]; button.closest(".shop-item").classList.toggle("owned", owned); if (!owned) remaining.push(costs[item]); }); const next = remaining.length ? Math.min(...remaining) : 0; const progress = next ? Math.min(100, state.coins / next * 100) : 100; els.rewardFill.style.width = `${progress}%`; els.rewardMessage.textContent = next ? (state.coins >= next ? "An upgrade is ready!" : `${next - state.coins} stars to go`) : "Pack complete!"; }
  let shopReturnOverlay = null;
  function openShop() { if (els.shopOverlay.classList.contains("open")) { closeShop(); return; } shopReturnOverlay = [els.introOverlay, els.storyOverlay, els.resultOverlay].find(overlay => overlay.classList.contains("open")) || null; if (shopReturnOverlay) hideOverlay(shopReturnOverlay); updateShop(); showOverlay(els.shopOverlay); sound.ready(); sound.scene("shop"); }
  function closeShop() { hideOverlay(els.shopOverlay); if (shopReturnOverlay && !state.running) showOverlay(shopReturnOverlay); sound.scene(state.running ? "flight" : "flight"); shopReturnOverlay = null; }
  function buy(item) { const costs = { shield: 6, heart: 12, boots: 18 }; if (state.coins < costs[item]) return; state.coins -= costs[item]; if (item === "shield") { state.shield = true; store.write("shield", true); } if (item === "heart") { state.maxHearts = 4; state.hearts = Math.max(state.hearts, 4); store.write("maxHearts", 4); } if (item === "boots") { state.boots = true; store.write("boots", true); } store.write("coins", state.coins); sound.purchase(); const card = document.querySelector(`[data-item="${item}"]`).closest(".shop-item"); card.classList.add("just-bought"); setTimeout(() => card.classList.remove("just-bought"), 800); updateHud(); updateShop(); }
  function returnToPhaseChoice() { state.running = false; hideOverlay(els.resultOverlay); hideOverlay(els.shopOverlay); hideOverlay(els.dictionaryOverlay); els.game.classList.remove("run-won", "run-lost"); updatePhasePicker(); applyPhase(state.selectedPhase, true); showOverlay(els.introOverlay); }

  let dictionaryReturnOverlay = null;
  function renderDictionary() {
    els.dictionaryPhases.innerHTML = "";
    PHASE_ORDER.forEach(phase => { const button = document.createElement("button"); button.type = "button"; button.textContent = `Phase ${phase}`; button.className = phase === state.dictionaryPhase ? "active" : ""; button.setAttribute("aria-pressed", String(phase === state.dictionaryPhase)); button.addEventListener("click", () => { state.dictionaryPhase = phase; renderDictionary(); }); els.dictionaryPhases.appendChild(button); });
    const query = els.dictionarySearch.value.trim().toLowerCase(); els.dictionaryList.innerHTML = "";
    const labels = { noun: "Nouns", verb: "Verbs", adjective: "Adjectives", adverb: "Adverbs" };
    Object.entries(PHASES[state.dictionaryPhase].words).forEach(([kind, words]) => {
      const matches = words.filter(word => !query || word.includes(query)); if (!matches.length) return;
      const group = document.createElement("section"); group.className = `dictionary-group ${kind}`; group.innerHTML = `<h3>${labels[kind]} <span>${matches.length}</span></h3><div class="word-chips"></div>`;
      matches.forEach(word => { const button = document.createElement("button"); button.type = "button"; button.textContent = word; button.setAttribute("aria-label", `Hear ${word}, ${kind}`); button.addEventListener("click", () => { sound.clue(); speak(word); }); group.querySelector(".word-chips").appendChild(button); }); els.dictionaryList.appendChild(group);
    });
    if (!els.dictionaryList.children.length) els.dictionaryList.innerHTML = '<p class="dictionary-empty">No matching words.</p>';
  }
  function openDictionary() { if (els.dictionaryOverlay.classList.contains("open")) { closeDictionary(); return; } dictionaryReturnOverlay = [els.introOverlay, els.storyOverlay, els.resultOverlay].find(overlay => overlay.classList.contains("open")) || null; if (dictionaryReturnOverlay) hideOverlay(dictionaryReturnOverlay); state.dictionaryPhase = state.running ? state.phase : state.selectedPhase; els.dictionarySearch.value = ""; renderDictionary(); showOverlay(els.dictionaryOverlay); }
  function closeDictionary() { hideOverlay(els.dictionaryOverlay); if (dictionaryReturnOverlay && !state.running) showOverlay(dictionaryReturnOverlay); dictionaryReturnOverlay = null; }

  els.playButton.addEventListener("click", beginStory); els.againButton.addEventListener("click", startGame); els.choosePhaseButton.addEventListener("click", returnToPhaseChoice);
  els.shopButton.addEventListener("click", openShop); els.introShopButton.addEventListener("click", openShop); els.closeShopButton.addEventListener("click", closeShop); els.backToTrailButton.addEventListener("click", closeShop);
  els.dictionaryButton.addEventListener("click", openDictionary); els.introDictionaryButton.addEventListener("click", openDictionary); els.closeDictionaryButton.addEventListener("click", closeDictionary); els.dictionarySearch.addEventListener("input", renderDictionary); els.soundButton.addEventListener("click", () => sound.toggle());
  els.storyNextButton.addEventListener("click", advanceStory); els.storySkipButton.addEventListener("click", startGame); els.wordHelperClose.addEventListener("click", closeWordHelper);
  els.shopOverlay.addEventListener("click", event => { if (event.target === els.shopOverlay) closeShop(); });
  els.dictionaryOverlay.addEventListener("click", event => { if (event.target === els.dictionaryOverlay) closeDictionary(); });
  els.fullDictionaryLink.addEventListener("click", () => { const word = els.fullDictionaryLink.dataset.word || "word"; navigator.clipboard?.writeText(word).catch(() => {}); toast(`Opening the full dictionary for “${word}”.`); });
  document.addEventListener("keydown", event => { if (event.key !== "Escape") return; if (els.wordHelper.classList.contains("show")) closeWordHelper(); else if (els.shopOverlay.classList.contains("open")) closeShop(); else if (els.dictionaryOverlay.classList.contains("open")) closeDictionary(); });
  els.promptAudio.addEventListener("click", () => { sound.ready(); const prompt = state.bossMode ? `Find all the ${pluralKind(state.targetKind)}. ${state.bossRemaining} islands are right.` : `Land on ${article(state.targetKind)} ${state.targetKind}. ${KIND_HELP[state.targetKind]}.`; speak(prompt); });
  document.querySelectorAll(".buy-button").forEach(button => button.addEventListener("click", () => buy(button.dataset.item)));
  document.querySelectorAll(".phase-choice").forEach(button => button.addEventListener("click", () => { const phase = Number(button.dataset.phase); if (phase > state.unlockedPhase) return; state.selectedPhase = phase; store.write("selectedPhase", phase); updatePhasePicker(); applyPhase(phase, true); }));
  document.querySelectorAll(".difficulty-choice").forEach(button => button.addEventListener("click", () => { state.includeAdverbs = button.dataset.difficulty === "hard"; store.write("includeAdverbs", state.includeAdverbs); updateDifficultyPicker(); }));

  buildTrail(); updatePhasePicker(); updateSoundButton(); applyPhase(state.selectedPhase, true); updateHud();
  const assets = ["assets/wind-garden-bg-v2.webp", "assets/wind-island-v2.webp", "assets/pip-sprite-atlas-v4.webp", "assets/pip-phase3-rainfinder-atlas-v2.webp", "assets/pip-phase4-windrider-atlas-v2.webp", "assets/pip-phase5-starpilot-atlas-v2.webp"];
  Promise.all(assets.map(src => new Promise(resolve => { const image = new Image(); image.onload = image.onerror = resolve; image.src = src; }))).then(() => { hideOverlay(els.loadingOverlay); showOverlay(els.introOverlay); });
})();

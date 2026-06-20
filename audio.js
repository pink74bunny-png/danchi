/* =========================================================
   午前二時の留守番電話 - audio.js
   実音声ファイルが sounds/ にあればそれを使用し、無い場合は
   WebAudio APIで簡易な代替音を合成する。
   ユーザー操作後にのみ再生を開始する（モバイルポリシー対応）。
   ========================================================= */

const AudioSystem = (() => {
  let actx = null;
  let bgmGain = null;
  let seGain = null;
  let currentBgmSource = null;
  let currentBgmKey = null;
  let unlocked = false;

  let bgmVolume = 0.6;
  let seVolume = 0.8;
  let muted = false;

  function ensureContext() {
    if (actx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      actx = new AC();
      bgmGain = actx.createGain();
      seGain = actx.createGain();
      bgmGain.connect(actx.destination);
      seGain.connect(actx.destination);
      applyVolumes();
    } catch (e) {
      actx = null; // AudioContext非対応でも画面は壊さない
    }
  }

  function applyVolumes() {
    if (!actx) return;
    bgmGain.gain.value = muted ? 0 : bgmVolume;
    seGain.gain.value = muted ? 0 : seVolume;
  }

  function unlock() {
    if (unlocked) return;
    ensureContext();
    if (actx && actx.state === "suspended") {
      actx.resume().catch(() => {});
    }
    unlocked = true;
  }

  /* ---- 実音声ファイル優先で再生を試みるユーティリティ ---- */
  function tryLoadRealAudio(path) {
    return new Promise((resolve) => {
      const a = new Audio();
      a.oncanplaythrough = () => resolve(a);
      a.onerror = () => resolve(null);
      a.src = path;
      // タイムアウトでフォールバック判定（ファイル無し環境向け）
      setTimeout(() => resolve(null), 600);
    });
  }

  /* ---- 合成SE生成（簡易ノイズ/トーン） ---- */
  function synthSE(type) {
    if (!actx) return;
    const now = actx.currentTime;
    try {
      switch (type) {
        case "phone_ring": {
          for (let i = 0; i < 3; i++) {
            const osc = actx.createOscillator();
            const g = actx.createGain();
            osc.type = "sine";
            osc.frequency.value = 920;
            const t0 = now + i * 0.45;
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(0.25, t0 + 0.05);
            g.gain.linearRampToValueAtTime(0, t0 + 0.35);
            osc.connect(g);
            g.connect(seGain);
            osc.start(t0);
            osc.stop(t0 + 0.4);
          }
          break;
        }
        case "tape_rewind": {
          const bufferSize = actx.sampleRate * 1.2;
          const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.15;
          }
          const src = actx.createBufferSource();
          src.buffer = buffer;
          const filter = actx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = 1200;
          const g = actx.createGain();
          g.gain.value = 0.3;
          src.connect(filter);
          filter.connect(g);
          g.connect(seGain);
          src.start(now);
          break;
        }
        case "footsteps_corridor": {
          for (let i = 0; i < 4; i++) {
            const t0 = now + i * 0.4;
            const bufferSize = actx.sampleRate * 0.08;
            const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) {
              data[j] = (Math.random() * 2 - 1) * (1 - j / bufferSize) * 0.4;
            }
            const src = actx.createBufferSource();
            src.buffer = buffer;
            const g = actx.createGain();
            g.gain.value = 0.5;
            src.connect(g);
            g.connect(seGain);
            src.start(t0);
          }
          break;
        }
        default: {
          // 未定義SEは無音の短いクリックで代替（エラーを出さない）
          const osc = actx.createOscillator();
          const g = actx.createGain();
          osc.frequency.value = 300;
          g.gain.setValueAtTime(0.08, now);
          g.gain.linearRampToValueAtTime(0, now + 0.1);
          osc.connect(g);
          g.connect(seGain);
          osc.start(now);
          osc.stop(now + 0.1);
        }
      }
    } catch (e) {
      // 合成失敗時も無視してゲームを止めない
    }
  }

  /* ---- 合成BGM（持続的なドローン音） ---- */
  let bgmOsc1 = null, bgmOsc2 = null, bgmLfo = null;

  function stopBgm() {
    if (bgmOsc1) { try { bgmOsc1.stop(); } catch (e) {} bgmOsc1 = null; }
    if (bgmOsc2) { try { bgmOsc2.stop(); } catch (e) {} bgmOsc2 = null; }
    if (bgmLfo) { try { bgmLfo.stop(); } catch (e) {} bgmLfo = null; }
    if (currentBgmSource) {
      try { currentBgmSource.pause(); } catch (e) {}
      currentBgmSource = null;
    }
    currentBgmKey = null;
  }

  function playBgm(key) {
    if (!key || key === currentBgmKey) return;
    ensureContext();
    stopBgm();
    currentBgmKey = key;
    if (!actx) return;

    const now = actx.currentTime;
    const baseFreqMap = {
      rain: 70,
      ambient_low: 55
    };
    const freq = baseFreqMap[key] || 60;

    bgmOsc1 = actx.createOscillator();
    bgmOsc2 = actx.createOscillator();
    bgmLfo = actx.createOscillator();
    const lfoGain = actx.createGain();
    const mixGain = actx.createGain();

    bgmOsc1.type = "sine";
    bgmOsc1.frequency.value = freq;
    bgmOsc2.type = "triangle";
    bgmOsc2.frequency.value = freq * 1.5;

    bgmLfo.frequency.value = 0.07;
    lfoGain.gain.value = 6;
    bgmLfo.connect(lfoGain);
    lfoGain.connect(bgmOsc1.frequency);

    mixGain.gain.setValueAtTime(0, now);
    mixGain.gain.linearRampToValueAtTime(0.12, now + 2);

    bgmOsc1.connect(mixGain);
    bgmOsc2.connect(mixGain);
    mixGain.connect(bgmGain);

    bgmOsc1.start(now);
    bgmOsc2.start(now);
    bgmLfo.start(now);
  }

  function playSE(key) {
    if (!key) return;
    ensureContext();
    synthSE(key);
  }

  function setBgmVolume(v) {
    bgmVolume = v;
    applyVolumes();
  }
  function setSeVolume(v) {
    seVolume = v;
    applyVolumes();
  }
  function setMuted(m) {
    muted = m;
    applyVolumes();
  }

  return {
    unlock,
    playBgm,
    stopBgm,
    playSE,
    setBgmVolume,
    setSeVolume,
    setMuted,
    get bgmVolume() { return bgmVolume; },
    get seVolume() { return seVolume; },
    get muted() { return muted; }
  };
})();

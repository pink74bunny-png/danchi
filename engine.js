/* =========================================================
   午前二時の留守番電話 - engine.js
   ゲーム本体ロジック
   ========================================================= */

(() => {
  "use strict";

  /* ---------------------------------------------------------
     状態管理
  --------------------------------------------------------- */
  const state = {
    currentSceneId: null,
    flags: {},
    backlog: [],          // {speaker, text}[]
    history: [],          // 戻った時のためのシーン履歴
    typing: false,
    typingTimer: null,
    fullTextShown: false,
    autoMode: false,
    skipMode: false,
    autoTimer: null,
    settings: null,
    sceneStartTime: null
  };

  /* ---------------------------------------------------------
     DOM参照
  --------------------------------------------------------- */
  const el = {
    bgLayer: document.getElementById("bg-layer"),
    bgFlash: document.getElementById("bg-flash"),
    characterLayer: document.getElementById("character-layer"),
    titleScreen: document.getElementById("title-screen"),
    textWindow: document.getElementById("text-window"),
    speakerName: document.getElementById("speaker-name"),
    mainText: document.getElementById("main-text"),
    nextIndicator: document.getElementById("next-indicator"),
    choiceLayer: document.getElementById("choice-layer"),
    menuToggleBtn: document.getElementById("menu-toggle-btn"),
    menuOverlay: document.getElementById("menu-overlay"),
    sideMenu: document.getElementById("side-menu"),
    skipIndicator: document.getElementById("skip-indicator"),
    autoToggleItem: document.getElementById("auto-toggle-item"),
    skipToggleItem: document.getElementById("skip-toggle-item"),
    endingBanner: document.getElementById("ending-banner"),
    endingBannerText: document.getElementById("ending-banner-text"),
    gameFrame: document.getElementById("game-frame"),
    rotateHint: document.getElementById("rotate-hint")
  };

  const panels = {
    save: document.getElementById("panel-save"),
    load: document.getElementById("panel-load"),
    backlog: document.getElementById("panel-backlog"),
    settings: document.getElementById("panel-settings"),
    endings: document.getElementById("panel-endings"),
    chapters: document.getElementById("panel-chapters")
  };

  /* ---------------------------------------------------------
     初期化
  --------------------------------------------------------- */
  function init() {
    state.settings = SaveSystem.getSettings();
    applySettingsToUI();
    bindGlobalEvents();
    showTitleScreen();
    checkOrientationHint();
    window.addEventListener("resize", checkOrientationHint);
  }

  function checkOrientationHint() {
    const isPortraitNarrow = window.innerHeight > window.innerWidth && window.innerWidth < 600;
    const dismissed = sessionStorage.getItem("bansat_rotate_dismissed");
    if (isPortraitNarrow && !dismissed) {
      el.rotateHint.classList.add("show");
    } else {
      el.rotateHint.classList.remove("show");
    }
  }

  /* ---------------------------------------------------------
     タイトル画面
  --------------------------------------------------------- */
  function showTitleScreen() {
    closeAllPanels();
    el.sideMenu.classList.remove("open");
    el.menuOverlay.classList.remove("active");
    el.textWindow.classList.remove("active");
    el.choiceLayer.classList.remove("active");
    el.endingBanner.classList.remove("active");
    el.menuToggleBtn.style.display = "none";
    el.titleScreen.classList.add("active");
    setBackground("title_bg");
    AudioSystem.stopBgm();
  }

  function hideTitleScreen() {
    el.titleScreen.classList.remove("active");
    el.menuToggleBtn.style.display = "flex";
  }

  /* タイトルメニューのキーボード操作対応 */
  let titleMenuIndex = 0;
  function setupTitleMenuKeyboard() {
    const items = Array.from(document.querySelectorAll(".title-menu-item"));
    function render() {
      items.forEach((it, i) => it.classList.toggle("selected", i === titleMenuIndex));
    }
    render();
    document.addEventListener("keydown", (e) => {
      if (!el.titleScreen.classList.contains("active")) return;
      if (e.key === "ArrowDown") {
        titleMenuIndex = (titleMenuIndex + 1) % items.length;
        render();
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        titleMenuIndex = (titleMenuIndex - 1 + items.length) % items.length;
        render();
        e.preventDefault();
      } else if (e.key === "Enter") {
        items[titleMenuIndex].click();
        e.preventDefault();
      }
    });
    items.forEach((it, i) => {
      it.addEventListener("mouseenter", () => { titleMenuIndex = i; render(); });
    });
  }

  /* ---------------------------------------------------------
     シーン再生
  --------------------------------------------------------- */
  function startNewGame() {
    state.flags = {};
    state.backlog = [];
    state.history = [];
    hideTitleScreen();
    goToScene("prologue_001");
  }

  function continueGame() {
    const data = SaveSystem.loadAutosave();
    if (!data) {
      // オートセーブが無ければ最新スロットを探す
      const slots = SaveSystem.getSlots();
      const keys = Object.keys(slots);
      if (keys.length === 0) {
        startNewGame();
        return;
      }
      const latest = keys.sort((a, b) => new Date(slots[b].savedAt) - new Date(slots[a].savedAt))[0];
      loadGameData(slots[latest]);
      return;
    }
    loadGameData(data);
  }

  function loadGameData(data) {
    state.flags = data.flags || {};
    state.backlog = data.backlog || [];
    state.history = data.history || [];
    hideTitleScreen();
    goToScene(data.currentSceneId || "prologue_001", true);
  }

  function goToScene(sceneId, skipHistoryPush) {
    const scene = SCENARIO[sceneId];
    if (!scene) {
      // 未知のシーンIDでも画面を壊さずタイトルへ
      console && console.warn && console.warn("unknown scene:", sceneId);
      showTitleScreen();
      return;
    }

    if (!skipHistoryPush && state.currentSceneId) {
      state.history.push(state.currentSceneId);
    }
    state.currentSceneId = sceneId;
    state.sceneStartTime = Date.now();

    // ルート判定シーン（エンディング振り分け）
    if (scene.routeCheck) {
      renderRouteCheckScene(scene);
      return;
    }

    renderScene(scene);
  }

  function renderRouteCheckScene(scene) {
    // 一旦本文だけ表示してから振り分け
    showSceneVisuals(scene);
    playSceneEffectsOnce(scene);
    typeText(flattenText(scene.text), () => {
      // 表示完了後、自動で次の演出へ
    });
    el.choiceLayer.classList.remove("active");

    // クリックで進める通常仕様にしつつ、次へ進むタイミングで分岐
    state.pendingRouteCheck = true;
  }

  function decideEnding() {
    const f = state.flags;
    const tapeCount = [f.tape1Collected, f.tape2Collected, f.tape3Collected].filter(Boolean).length;

    // 真相エンド：3つのテープをすべて集め、聞き返した上で逃げない選択
    if (tapeCount >= 3 && f.allTapesReviewed && f.finalChoice === "wait") {
      return "ending_truth_001";
    }
    // 隠しエンド：電話を壊した上でなお午前二時を迎える
    if (f.phoneDestroyed && f.finalChoice !== "flee") {
      return "ending_hidden_001";
    }
    // 失踪エンド：404号室関連の選択を重ねて、最後に404へ向かう
    if (f.finalChoice === "404") {
      return "ending_missing_001";
    }
    // 逃亡エンド
    if (f.finalChoice === "flee") {
      return "ending_flee_001";
    }
    // 通常エンド（デフォルト）
    return "ending_normal_001";
  }

  /* ---------------------------------------------------------
     シーン描画
  --------------------------------------------------------- */
  function showSceneVisuals(scene) {
    setBackground(scene.background, scene.effect === "flicker");
    setCharacter(scene.character, scene.effect === "characterMorph");
    if (scene.bgm) AudioSystem.playBgm(scene.bgm);
  }

  function playSceneEffectsOnce(scene) {
    if (scene.sound) AudioSystem.playSE(scene.sound);
    if (scene.effect === "darkenFlash" && state.settings.screenShake) {
      el.bgFlash.classList.remove("darken");
      void el.bgFlash.offsetWidth; // reflow
      el.bgFlash.classList.add("darken");
    }
  }

  function renderScene(scene) {
    el.choiceLayer.classList.remove("active");
    el.choiceLayer.innerHTML = "";
    el.endingBanner.classList.remove("active");

    showSceneVisuals(scene);
    playSceneEffectsOnce(scene);

    const speaker = scene.speaker || "";
    el.speakerName.textContent = speaker;
    el.textWindow.classList.add("active");

    const fullText = flattenText(scene.text);
    const isChapterTitle = scene.effect === "chapterTitle";
    el.mainText.classList.toggle("chapter-title-text", !!isChapterTitle);

    const alreadyRead = SaveSystem.isRead(state.currentSceneId);

    const onTypeComplete = () => {
      SaveSystem.markRead(state.currentSceneId);
      pushBacklog(speaker, fullText);
      autosaveNow();

      if (scene.ending) {
        SaveSystem.unlockEnding(scene.ending);
        showEndingBanner(scene.endingTitle);
      }

      if (scene.choices && scene.choices.length) {
        renderChoices(scene.choices);
      } else if (state.autoMode && scene.next) {
        scheduleAutoAdvance();
      }
    };

    const speed = state.skipMode && alreadyRead ? 1 : (scene.effect === "slowText" ? state.settings.textSpeed * 2.4 : state.settings.textSpeed);

    typeText(fullText, onTypeComplete, speed, scene.effect === "shudderText");
  }

  function flattenText(text) {
    if (!text) return "";
    if (Array.isArray(text)) return text.join("\n");
    return text;
  }

  /* ---------------------------------------------------------
     タイプライター演出
  --------------------------------------------------------- */
  function typeText(fullText, onComplete, speedOverride, shudder) {
    clearTimeout(state.typingTimer);
    state.typing = true;
    state.fullTextShown = false;
    el.mainText.textContent = "";
    el.mainText.classList.toggle("shudder", !!(shudder && state.settings.screenShake));

    const speed = speedOverride !== undefined ? speedOverride : state.settings.textSpeed;
    let i = 0;

    function step() {
      if (!state.typing) return; // 一括表示済みなら停止
      i++;
      el.mainText.textContent = fullText.slice(0, i);
      if (i >= fullText.length) {
        finishTyping();
        return;
      }
      state.typingTimer = setTimeout(step, Math.max(1, speed));
    }

    function finishTyping() {
      state.typing = false;
      state.fullTextShown = true;
      el.mainText.textContent = fullText;
      el.nextIndicator.style.opacity = "";
      if (onComplete) onComplete();
    }

    if (speed <= 1) {
      // スキップ時は即時表示
      finishTyping();
    } else {
      step();
    }
  }

  function skipTypingToEnd() {
    state.typing = false;
  }

  /* ---------------------------------------------------------
     バックログ
  --------------------------------------------------------- */
  function pushBacklog(speaker, text) {
    state.backlog.push({ speaker, text });
    if (state.backlog.length > 300) state.backlog.shift();
  }

  /* ---------------------------------------------------------
     選択肢
  --------------------------------------------------------- */
  let choiceSelectedIndex = 0;

  function renderChoices(choices) {
    el.choiceLayer.innerHTML = "";
    const visibleChoices = choices.filter(c => choiceConditionMet(c));
    choiceSelectedIndex = 0;

    visibleChoices.forEach((choice, idx) => {
      const div = document.createElement("div");
      div.className = "choice-item";
      div.setAttribute("role", "option");
      div.setAttribute("tabindex", "0");
      div.textContent = choice.label;
      div.addEventListener("click", () => selectChoice(choice));
      div.addEventListener("keydown", (e) => {
        if (e.key === "Enter") selectChoice(choice);
      });
      el.choiceLayer.appendChild(div);
    });

    renderChoiceSelection();
    el.choiceLayer.classList.add("active");
    el.textWindow.classList.remove("active");

    state.currentChoiceList = visibleChoices;
  }

  function choiceConditionMet(choice) {
    if (!choice.condition) return true;
    if (choice.condition.tapesAtLeast !== undefined) {
      const f = state.flags;
      const count = [f.tape1Collected, f.tape2Collected, f.tape3Collected].filter(Boolean).length;
      return count >= choice.condition.tapesAtLeast;
    }
    return true;
  }

  function renderChoiceSelection() {
    const items = el.choiceLayer.querySelectorAll(".choice-item");
    items.forEach((it, i) => it.classList.toggle("selected", i === choiceSelectedIndex));
  }

  function selectChoice(choice) {
    if (choice.setFlags) {
      Object.assign(state.flags, choice.setFlags);
    }
    el.choiceLayer.classList.remove("active");
    el.textWindow.classList.add("active");
    goToScene(choice.next);
  }

  function moveChoiceSelection(delta) {
    if (!state.currentChoiceList || !state.currentChoiceList.length) return;
    const len = state.currentChoiceList.length;
    choiceSelectedIndex = (choiceSelectedIndex + delta + len) % len;
    renderChoiceSelection();
  }

  function confirmChoiceSelection() {
    if (!state.currentChoiceList || !state.currentChoiceList.length) return;
    selectChoice(state.currentChoiceList[choiceSelectedIndex]);
  }

  /* ---------------------------------------------------------
     背景・人物の反映
  --------------------------------------------------------- */
  function setBackground(key, flicker) {
    if (!key) return;
    el.bgLayer.classList.toggle("flicker", !!(flicker && state.settings.screenShake));
    resolveBackgroundURL(key, (url) => {
      el.bgLayer.style.backgroundImage = `url("${url}")`;
    });
  }

  function setCharacter(key, morph) {
    el.characterLayer.innerHTML = "";
    if (!key) return;
    const div = document.createElement("div");
    div.className = "character-silhouette" + (morph && state.settings.screenShake ? " morph" : "");
    el.characterLayer.appendChild(div);
  }

  /* ---------------------------------------------------------
     エンディングバナー
  --------------------------------------------------------- */
  function showEndingBanner(title) {
    el.endingBannerText.textContent = title || "";
    el.endingBanner.classList.add("active");
  }

  /* ---------------------------------------------------------
     進行（クリック・タップ・キー操作）
  --------------------------------------------------------- */
  function advance() {
    if (!el.titleScreen.classList.contains("active") === false) return; // タイトル中は無視
    if (el.choiceLayer.classList.contains("active")) return; // 選択肢表示中は無視

    if (state.typing) {
      // 一括表示
      state.typing = false;
      const scene = SCENARIO[state.currentSceneId];
      const fullText = flattenText(scene ? scene.text : "");
      el.mainText.textContent = fullText;
      state.fullTextShown = true;
      finishCurrentSceneAfterTyping(scene, fullText);
      return;
    }

    if (!state.fullTextShown) return;

    // ルート判定シーンの場合はここでエンディング振り分け
    if (state.pendingRouteCheck) {
      state.pendingRouteCheck = false;
      const endingId = decideEnding();
      goToScene(endingId);
      return;
    }

    const scene = SCENARIO[state.currentSceneId];
    if (!scene) return;
    if (scene.choices && scene.choices.length) return; // 選択肢待ち
    if (scene.ending) {
      // エンディング到達後はタイトルへ
      showTitleScreen();
      return;
    }
    if (scene.next) {
      goToScene(scene.next);
    }
  }

  function finishCurrentSceneAfterTyping(scene, fullText) {
    if (!scene) return;
    SaveSystem.markRead(state.currentSceneId);
    pushBacklog(scene.speaker || "", fullText);
    autosaveNow();
    if (scene.ending) {
      SaveSystem.unlockEnding(scene.ending);
      showEndingBanner(scene.endingTitle);
    }
    if (scene.choices && scene.choices.length) {
      renderChoices(scene.choices);
    }
  }

  /* ---------------------------------------------------------
     オート再生
  --------------------------------------------------------- */
  function scheduleAutoAdvance() {
    clearTimeout(state.autoTimer);
    state.autoTimer = setTimeout(() => {
      if (state.autoMode) advance();
    }, state.settings.autoPlaySpeed);
  }

  function toggleAuto() {
    state.autoMode = !state.autoMode;
    el.autoToggleItem.textContent = `オート：${state.autoMode ? "ON" : "OFF"}`;
    if (state.autoMode && state.fullTextShown && !state.typing) {
      scheduleAutoAdvance();
    }
  }

  function toggleSkip() {
    state.skipMode = !state.skipMode;
    el.skipToggleItem.textContent = `スキップ：${state.skipMode ? "ON" : "OFF"}`;
    el.skipIndicator.classList.toggle("active", state.skipMode);
  }

  /* ---------------------------------------------------------
     オートセーブ／手動セーブ
  --------------------------------------------------------- */
  function buildSaveData() {
    const scene = SCENARIO[state.currentSceneId];
    return {
      currentSceneId: state.currentSceneId,
      flags: state.flags,
      backlog: state.backlog,
      history: state.history,
      previewText: scene ? flattenText(scene.text).slice(0, 40) : ""
    };
  }

  function autosaveNow() {
    SaveSystem.autosave(buildSaveData());
    SaveSystem.saveLatestFlags(state.flags);
  }

  /* ---------------------------------------------------------
     パネル制御
  --------------------------------------------------------- */
  function closeAllPanels() {
    Object.values(panels).forEach(p => p.classList.remove("active"));
  }

  function openPanel(name) {
    closeAllPanels();
    closeSideMenu();
    if (panels[name]) {
      panels[name].classList.add("active");
      if (name === "save") renderSaveSlots();
      if (name === "load") renderLoadSlots();
      if (name === "backlog") renderBacklog();
      if (name === "endings") renderEndingList();
      if (name === "chapters") renderChapterList();
    }
  }

  function openSideMenu() {
    el.sideMenu.classList.add("open");
    el.menuOverlay.classList.add("active");
  }
  function closeSideMenu() {
    el.sideMenu.classList.remove("open");
    el.menuOverlay.classList.remove("active");
  }

  /* ---- セーブ画面 ---- */
  function renderSaveSlots() {
    const grid = document.getElementById("save-slot-grid");
    grid.innerHTML = "";
    const slots = SaveSystem.getSlots();
    for (let i = 1; i <= 8; i++) {
      const slotId = "slot" + i;
      const data = slots[slotId];
      const div = document.createElement("div");
      div.className = "save-slot" + (data ? "" : " empty");
      div.tabIndex = 0;
      div.setAttribute("role", "button");
      div.setAttribute("aria-label", `セーブスロット${i}`);
      div.innerHTML = `
        <div class="slot-label">スロット ${i}</div>
        <div class="slot-text">${data ? escapeHTML(data.previewText) : "― 空き ―"}</div>
        <div class="slot-time">${data ? formatTime(data.savedAt) : ""}</div>
      `;
      div.addEventListener("click", () => {
        SaveSystem.saveToSlot(slotId, buildSaveData());
        renderSaveSlots();
      });
      grid.appendChild(div);
    }
  }

  /* ---- ロード画面 ---- */
  function renderLoadSlots() {
    const grid = document.getElementById("load-slot-grid");
    grid.innerHTML = "";
    const slots = SaveSystem.getSlots();
    const autosaveData = SaveSystem.loadAutosave();

    if (autosaveData) {
      const div = document.createElement("div");
      div.className = "save-slot";
      div.tabIndex = 0;
      div.setAttribute("role", "button");
      div.innerHTML = `
        <div class="slot-label">オートセーブ</div>
        <div class="slot-text">${escapeHTML(autosaveData.previewText)}</div>
        <div class="slot-time">${formatTime(autosaveData.savedAt)}</div>
      `;
      div.addEventListener("click", () => {
        closeAllPanels();
        hideTitleScreen();
        loadGameData(autosaveData);
      });
      grid.appendChild(div);
    }

    for (let i = 1; i <= 8; i++) {
      const slotId = "slot" + i;
      const data = slots[slotId];
      if (!data) continue;
      const div = document.createElement("div");
      div.className = "save-slot";
      div.tabIndex = 0;
      div.setAttribute("role", "button");
      div.innerHTML = `
        <div class="slot-label">スロット ${i}</div>
        <div class="slot-text">${escapeHTML(data.previewText)}</div>
        <div class="slot-time">${formatTime(data.savedAt)}</div>
      `;
      div.addEventListener("click", () => {
        closeAllPanels();
        hideTitleScreen();
        loadGameData(data);
      });
      grid.appendChild(div);
    }

    if (!autosaveData && Object.keys(slots).length === 0) {
      grid.innerHTML = `<div class="slot-label" style="padding:20px 4px;">セーブデータがありません。</div>`;
    }
  }

  /* ---- バックログ画面 ---- */
  function renderBacklog() {
    const list = document.getElementById("backlog-list");
    list.innerHTML = "";
    if (state.backlog.length === 0) {
      list.innerHTML = `<div class="backlog-text" style="padding:10px 4px;">まだ記録がありません。</div>`;
      return;
    }
    state.backlog.slice().reverse().forEach(entry => {
      const div = document.createElement("div");
      div.className = "backlog-entry";
      div.innerHTML = `
        ${entry.speaker ? `<div class="backlog-speaker">${escapeHTML(entry.speaker)}</div>` : ""}
        <div class="backlog-text">${escapeHTML(entry.text)}</div>
      `;
      list.appendChild(div);
    });
  }

  /* ---- 設定画面 ---- */
  function applySettingsToUI() {
    document.getElementById("setting-text-speed").value = state.settings.textSpeed;
    document.getElementById("setting-bgm-volume").value = Math.round(state.settings.bgmVolume * 100);
    document.getElementById("setting-se-volume").value = Math.round(state.settings.seVolume * 100);
    toggleBtnState(document.getElementById("setting-mute-toggle"), state.settings.muted);
    toggleBtnState(document.getElementById("setting-shake-toggle"), state.settings.screenShake);
    AudioSystem.setBgmVolume(state.settings.bgmVolume);
    AudioSystem.setSeVolume(state.settings.seVolume);
    AudioSystem.setMuted(state.settings.muted);
  }

  function toggleBtnState(btn, on) {
    btn.classList.toggle("on", !!on);
    btn.textContent = on ? "ON" : "OFF";
  }

  function bindSettingsEvents() {
    document.getElementById("setting-text-speed").addEventListener("input", (e) => {
      state.settings.textSpeed = Number(e.target.value);
      SaveSystem.saveSettings(state.settings);
    });
    document.getElementById("setting-bgm-volume").addEventListener("input", (e) => {
      state.settings.bgmVolume = Number(e.target.value) / 100;
      AudioSystem.setBgmVolume(state.settings.bgmVolume);
      SaveSystem.saveSettings(state.settings);
    });
    document.getElementById("setting-se-volume").addEventListener("input", (e) => {
      state.settings.seVolume = Number(e.target.value) / 100;
      AudioSystem.setSeVolume(state.settings.seVolume);
      SaveSystem.saveSettings(state.settings);
    });
    document.getElementById("setting-mute-toggle").addEventListener("click", () => {
      state.settings.muted = !state.settings.muted;
      toggleBtnState(document.getElementById("setting-mute-toggle"), state.settings.muted);
      AudioSystem.setMuted(state.settings.muted);
      SaveSystem.saveSettings(state.settings);
    });
    document.getElementById("setting-shake-toggle").addEventListener("click", () => {
      state.settings.screenShake = !state.settings.screenShake;
      toggleBtnState(document.getElementById("setting-shake-toggle"), state.settings.screenShake);
      SaveSystem.saveSettings(state.settings);
    });
    document.getElementById("setting-fullscreen-toggle").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      if (!document.fullscreenElement) {
        const req = document.documentElement.requestFullscreen;
        if (req) {
          document.documentElement.requestFullscreen().then(() => {
            toggleBtnState(btn, true);
          }).catch(() => {});
        }
      } else {
        document.exitFullscreen && document.exitFullscreen().then(() => {
          toggleBtnState(btn, false);
        }).catch(() => {});
      }
    });
    document.addEventListener("fullscreenchange", () => {
      toggleBtnState(document.getElementById("setting-fullscreen-toggle"), !!document.fullscreenElement);
    });
  }

  /* ---- エンディング記録画面 ---- */
  function renderEndingList() {
    const list = document.getElementById("ending-list");
    list.innerHTML = "";
    ENDING_LIST.forEach(e => {
      const unlocked = SaveSystem.isEndingUnlocked(e.id);
      const div = document.createElement("div");
      div.className = "ending-entry" + (unlocked ? "" : " locked");
      div.tabIndex = unlocked ? 0 : -1;
      div.innerHTML = `
        <div class="ending-title">${unlocked ? escapeHTML(e.title) : "？？？？？"}</div>
        <div class="ending-hint">${unlocked ? escapeHTML(e.hint) : "未到達のエンディング"}</div>
      `;
      if (unlocked) {
        div.addEventListener("click", () => {
          closeAllPanels();
          hideTitleScreen();
          // エンディングの最初のシーンへ直接ジャンプして再確認
          const startId = "ending_" + e.id + "_001";
          if (SCENARIO[startId]) {
            state.flags = state.flags || {};
            goToScene(startId);
          }
        });
      }
      list.appendChild(div);
    });
  }

  /* ---- 章選択画面 ---- */
  function renderChapterList() {
    const list = document.getElementById("chapter-list");
    list.innerHTML = "";
    CHAPTER_LIST.forEach(ch => {
      const div = document.createElement("div");
      div.className = "ending-entry";
      div.tabIndex = 0;
      div.innerHTML = `<div class="ending-title">${escapeHTML(ch.label)}</div>`;
      div.addEventListener("click", () => {
        closeAllPanels();
        hideTitleScreen();
        state.flags = SaveSystem.loadLatestFlags() || {};
        state.backlog = [];
        state.history = [];
        goToScene(ch.start);
      });
      list.appendChild(div);
    });
  }

  /* ---------------------------------------------------------
     ユーティリティ
  --------------------------------------------------------- */
  function escapeHTML(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatTime(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    } catch (e) {
      return "";
    }
  }

  /* ---------------------------------------------------------
     イベントバインド
  --------------------------------------------------------- */
  let lastTapTime = 0;

  function bindGlobalEvents() {
    // タイトルメニュー
    document.querySelectorAll(".title-menu-item").forEach(item => {
      item.addEventListener("click", () => handleTitleAction(item.dataset.action));
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleTitleAction(item.dataset.action);
      });
    });
    setupTitleMenuKeyboard();

    // ゲーム画面クリックで進行（誤操作防止のためテキストウィンドウ周辺のみ）
    el.gameFrame.addEventListener("click", (e) => {
      AudioSystem.unlock();

      // ダブルタップ防止
      const now = Date.now();
      if (now - lastTapTime < 180) { e.preventDefault(); return; }
      lastTapTime = now;

      if (el.titleScreen.classList.contains("active")) return;
      if (panels.save.classList.contains("active")) return;
      if (panels.load.classList.contains("active")) return;
      if (panels.backlog.classList.contains("active")) return;
      if (panels.settings.classList.contains("active")) return;
      if (panels.endings.classList.contains("active")) return;
      if (panels.chapters.classList.contains("active")) return;
      if (el.sideMenu.classList.contains("open")) return;
      if (e.target.closest("#menu-toggle-btn")) return;
      if (e.target.closest(".choice-item")) return; // 選択肢自体は個別ハンドラ

      advance();
    });

    // 右クリック長押し等の誤操作（コンテキストメニュー）防止
    el.gameFrame.addEventListener("contextmenu", (e) => e.preventDefault());

    // キーボード操作
    document.addEventListener("keydown", (e) => {
      if (el.titleScreen.classList.contains("active")) return;

      if (el.choiceLayer.classList.contains("active")) {
        if (e.key === "ArrowDown") { moveChoiceSelection(1); e.preventDefault(); }
        else if (e.key === "ArrowUp") { moveChoiceSelection(-1); e.preventDefault(); }
        else if (e.key === "Enter") { confirmChoiceSelection(); e.preventDefault(); }
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        if (anyPanelOpen() || el.sideMenu.classList.contains("open")) return;
        advance();
        e.preventDefault();
      } else if (e.key === "Escape") {
        if (anyPanelOpen()) { closeAllPanels(); }
        else if (el.sideMenu.classList.contains("open")) { closeSideMenu(); }
        else { openSideMenu(); }
      }
    });

    // メニューボタン
    el.menuToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (el.sideMenu.classList.contains("open")) closeSideMenu();
      else openSideMenu();
    });
    el.menuOverlay.addEventListener("click", closeSideMenu);

    // サイドメニュー項目
    document.querySelectorAll(".side-menu-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        if (action === "save") openPanel("save");
        else if (action === "load") openPanel("load");
        else if (action === "backlog") openPanel("backlog");
        else if (action === "settings") openPanel("settings");
        else if (action === "toggle-auto") toggleAuto();
        else if (action === "toggle-skip") toggleSkip();
        else if (action === "title") {
          closeSideMenu();
          showTitleScreen();
        }
      });
    });

    // パネル閉じるボタン
    document.querySelectorAll('[data-action="close-panel"]').forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAllPanels();
      });
    });

    // パネル自体のクリックが背後に伝播しないように
    Object.values(panels).forEach(p => {
      p.addEventListener("click", (e) => e.stopPropagation());
    });
    el.sideMenu.addEventListener("click", (e) => e.stopPropagation());

    bindSettingsEvents();

    // 横画面案内の閉じる
    document.getElementById("rotate-hint-close").addEventListener("click", () => {
      sessionStorage.setItem("bansat_rotate_dismissed", "1");
      el.rotateHint.classList.remove("show");
    });
  }

  function anyPanelOpen() {
    return Object.values(panels).some(p => p.classList.contains("active"));
  }

  function handleTitleAction(action) {
    AudioSystem.unlock();
    if (action === "new-game") {
      startNewGame();
    } else if (action === "continue") {
      continueGame();
    } else if (action === "chapter-select") {
      openPanel("chapters");
    } else if (action === "settings") {
      openPanel("settings");
    } else if (action === "endings") {
      openPanel("endings");
    }
  }

  /* ---------------------------------------------------------
     起動
  --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", init);

})();

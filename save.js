/* =========================================================
   午前二時の留守番電話 - save.js
   localStorageを用いたセーブ／設定／既読／エンディング記録
   ========================================================= */

const StorageKeys = {
  SAVE_SLOTS: "bansat_save_slots_v1",
  AUTOSAVE: "bansat_autosave_v1",
  SETTINGS: "bansat_settings_v1",
  READ_LOG: "bansat_read_log_v1",
  ENDINGS: "bansat_endings_v1",
  FLAGS_LATEST: "bansat_flags_latest_v1"
};

const SaveSystem = (() => {
  function safeGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---- セーブスロット（手動 8枠） ---- */
  function getSlots() {
    return safeGet(StorageKeys.SAVE_SLOTS, {});
  }
  function saveToSlot(slotId, data) {
    const slots = getSlots();
    slots[slotId] = {
      ...data,
      savedAt: new Date().toISOString()
    };
    return safeSet(StorageKeys.SAVE_SLOTS, slots);
  }
  function loadFromSlot(slotId) {
    const slots = getSlots();
    return slots[slotId] || null;
  }
  function deleteSlot(slotId) {
    const slots = getSlots();
    delete slots[slotId];
    return safeSet(StorageKeys.SAVE_SLOTS, slots);
  }

  /* ---- オートセーブ（1枠） ---- */
  function autosave(data) {
    return safeSet(StorageKeys.AUTOSAVE, {
      ...data,
      savedAt: new Date().toISOString()
    });
  }
  function loadAutosave() {
    return safeGet(StorageKeys.AUTOSAVE, null);
  }

  /* ---- 設定 ---- */
  const DEFAULT_SETTINGS = {
    textSpeed: 32,       // 1文字あたりms（小さいほど速い）
    bgmVolume: 0.6,
    seVolume: 0.8,
    muted: false,
    screenShake: true,
    autoPlaySpeed: 1800  // 自動送りの待機ms
  };
  function getSettings() {
    return { ...DEFAULT_SETTINGS, ...safeGet(StorageKeys.SETTINGS, {}) };
  }
  function saveSettings(settings) {
    return safeSet(StorageKeys.SETTINGS, settings);
  }

  /* ---- 既読シーン記録（スキップ判定・バックログ用） ---- */
  function getReadLog() {
    return safeGet(StorageKeys.READ_LOG, {});
  }
  function markRead(sceneId) {
    const log = getReadLog();
    log[sceneId] = true;
    safeSet(StorageKeys.READ_LOG, log);
  }
  function isRead(sceneId) {
    const log = getReadLog();
    return !!log[sceneId];
  }

  /* ---- エンディング回収状況 ---- */
  function getEndings() {
    return safeGet(StorageKeys.ENDINGS, {});
  }
  function unlockEnding(endingId) {
    const endings = getEndings();
    endings[endingId] = {
      unlockedAt: new Date().toISOString()
    };
    safeSet(StorageKeys.ENDINGS, endings);
  }
  function isEndingUnlocked(endingId) {
    const endings = getEndings();
    return !!endings[endingId];
  }

  /* ---- 直近フラグ（章選択などに利用） ---- */
  function saveLatestFlags(flags) {
    safeSet(StorageKeys.FLAGS_LATEST, flags);
  }
  function loadLatestFlags() {
    return safeGet(StorageKeys.FLAGS_LATEST, {});
  }

  function clearAll() {
    Object.values(StorageKeys).forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  }

  return {
    getSlots, saveToSlot, loadFromSlot, deleteSlot,
    autosave, loadAutosave,
    getSettings, saveSettings,
    getReadLog, markRead, isRead,
    getEndings, unlockEnding, isEndingUnlocked,
    saveLatestFlags, loadLatestFlags,
    clearAll
  };
})();

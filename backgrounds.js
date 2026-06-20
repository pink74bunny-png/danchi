/* =========================================================
   午前二時の留守番電話 - backgrounds.js
   実写素材の代わりに、Canvas上で雰囲気のある背景を
   プロシージャル生成する。あとから本物の写真に差し替え
   やすいよう、キー名はそのまま images/backgrounds/{key}.jpg
   を探しに行き、見つからない場合のみ自動生成にフォール
   バックする。
   ========================================================= */

const BG_GENERATORS = {
  // 室内・夜（電話なし）
  room_night: (ctx, w, h) => {
    grad(ctx, w, h, ["#0b0f14", "#161b22", "#0a0c10"]);
    windowRect(ctx, w, h, w * 0.62, h * 0.12, w * 0.28, h * 0.5, "#1a2230");
    floorLine(ctx, w, h);
    boxesSilhouette(ctx, w, h);
  },
  // 室内・夜・電話あり（メインの定番背景）
  room_night_phone: (ctx, w, h) => {
    grad(ctx, w, h, ["#0c1016", "#171c24", "#0a0d12"]);
    windowRect(ctx, w, h, w * 0.66, h * 0.1, w * 0.26, h * 0.46, "#1c2433");
    floorLine(ctx, w, h);
    shelfWithPhone(ctx, w, h);
  },
  // 朝の室内
  room_morning: (ctx, w, h) => {
    grad(ctx, w, h, ["#21262e", "#2c333d", "#1b1f25"]);
    windowRect(ctx, w, h, w * 0.62, h * 0.1, w * 0.3, h * 0.5, "#4a5566");
    floorLine(ctx, w, h);
  },
  // 廊下・夜
  corridor_night: (ctx, w, h) => {
    grad(ctx, w, h, ["#070809", "#10141a", "#070809"]);
    corridorPerspective(ctx, w, h, "#171c22");
    lightDots(ctx, w, h, 5);
  },
  // 廊下・昼
  corridor_day: (ctx, w, h) => {
    grad(ctx, w, h, ["#2a2f35", "#383f47", "#22262b"]);
    corridorPerspective(ctx, w, h, "#454d57");
  },
  // 歩道橋・夕方
  footbridge_evening: (ctx, w, h) => {
    grad(ctx, w, h, ["#2c2630", "#3a2d2e", "#13141c"]);
    horizonLine(ctx, w, h, "#1a1620");
    railingLines(ctx, w, h);
  },
  // 階段〜404号室
  stairwell_404: (ctx, w, h) => {
    grad(ctx, w, h, ["#080a0c", "#11161c", "#06070a"]);
    corridorPerspective(ctx, w, h, "#141a20");
    doorShape(ctx, w, h);
  },
  // 雨の窓
  rain_window: (ctx, w, h) => {
    grad(ctx, w, h, ["#0b0e14", "#161c26", "#0a0c10"]);
    windowRect(ctx, w, h, w * 0.15, h * 0.06, w * 0.7, h * 0.7, "#1d2738");
    rainStreaks(ctx, w, h);
  },
  // 章タイトルカード
  title_card_dark: (ctx, w, h) => {
    grad(ctx, w, h, ["#050608", "#0a0c10", "#030405"]);
  },
  // タイトル画面
  title_bg: (ctx, w, h) => {
    grad(ctx, w, h, ["#080a0d", "#121821", "#06070a"]);
    corridorPerspective(ctx, w, h, "#171d25");
    oldPhoneSilhouette(ctx, w, h);
  }
};

function grad(ctx, w, h, colors) {
  const g = ctx.createLinearGradient(0, 0, w * 0.3, h);
  g.addColorStop(0, colors[0]);
  g.addColorStop(0.55, colors[1]);
  g.addColorStop(1, colors[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function windowRect(ctx, w, h, x, y, ww, hh, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(x, y, ww, hh);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.lineWidth = Math.max(2, w * 0.004);
  ctx.beginPath();
  ctx.moveTo(x + ww / 2, y);
  ctx.lineTo(x + ww / 2, y + hh);
  ctx.moveTo(x, y + hh / 2);
  ctx.lineTo(x + ww, y + hh / 2);
  ctx.stroke();
  ctx.restore();
}

function floorLine(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.78);
  ctx.lineTo(w, h * 0.74);
  ctx.stroke();
  ctx.restore();
}

function boxesSilhouette(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(w * 0.08, h * 0.62, w * 0.12, h * 0.18);
  ctx.fillRect(w * 0.22, h * 0.68, w * 0.09, h * 0.12);
  ctx.restore();
}

function shelfWithPhone(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(w * 0.1, h * 0.55, w * 0.22, h * 0.05);
  ctx.fillStyle = "rgba(10,10,10,0.85)";
  ctx.fillRect(w * 0.15, h * 0.46, w * 0.06, h * 0.09);
  ctx.fillStyle = "#5a1717";
  ctx.beginPath();
  ctx.arc(w * 0.15 + w * 0.005, h * 0.46, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function corridorPerspective(ctx, w, h, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, w * 0.002);
  const cx = w / 2, cy = h * 0.46;
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    ctx.beginPath();
    ctx.moveTo(w * (0.05 + t * 0.05), h);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * (0.95 - t * 0.05), h);
    ctx.lineTo(cx, cy);
    ctx.stroke();
  }
  ctx.restore();
}

function lightDots(ctx, w, h, count) {
  ctx.save();
  ctx.fillStyle = "rgba(180,180,150,0.18)";
  for (let i = 0; i < count; i++) {
    const x = w * (0.2 + i * 0.6 / count);
    const y = h * 0.3;
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.05, h * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function horizonLine(ctx, w, h, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(0, h * 0.58, w, h * 0.42);
  ctx.restore();
}

function railingLines(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.7)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.6);
  ctx.lineTo(w, h * 0.58);
  ctx.stroke();
  for (let i = 0; i < 10; i++) {
    const x = (w / 10) * i;
    ctx.beginPath();
    ctx.moveTo(x, h * 0.6);
    ctx.lineTo(x, h * 0.72);
    ctx.stroke();
  }
  ctx.restore();
}

function doorShape(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(w * 0.42, h * 0.28, w * 0.16, h * 0.46);
  ctx.strokeStyle = "rgba(122,31,31,0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(w * 0.42, h * 0.28, w * 0.16, h * 0.46);
  ctx.restore();
}

function rainStreaks(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(180,190,210,0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 4, y + 22);
    ctx.stroke();
  }
  ctx.restore();
}

function oldPhoneSilhouette(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  const x = w * 0.5, y = h * 0.62;
  ctx.fillRect(x - w * 0.04, y, w * 0.08, h * 0.1);
  ctx.fillRect(x - w * 0.06, y - h * 0.02, w * 0.12, h * 0.025);
  ctx.restore();
}

/* ---------------------------------------------------------
   背景URLキャッシュ生成（Canvas → dataURL）
--------------------------------------------------------- */
const _bgCache = {};

function generateBackgroundDataURL(key) {
  if (_bgCache[key]) return _bgCache[key];
  const w = 960, h = 540;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const gen = BG_GENERATORS[key] || BG_GENERATORS["room_night"];
  try {
    gen(ctx, w, h);
  } catch (e) {
    // フォールバック：単色背景（コンソールエラーを出さない）
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(0, 0, w, h);
  }
  // フィルムグレイン的な粒子をうっすら追加
  ctx.save();
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
  }
  ctx.restore();
  const url = canvas.toDataURL("image/png");
  _bgCache[key] = url;
  return url;
}

/* 実画像が images/backgrounds/{key}.jpg にあればそちらを優先し、
   読み込み失敗時は自動生成画像にフォールバックする */
function resolveBackgroundURL(key, callback) {
  const realPath = `images/backgrounds/${key}.jpg`;
  const testImg = new Image();
  testImg.onload = () => callback(realPath);
  testImg.onerror = () => callback(generateBackgroundDataURL(key));
  testImg.src = realPath;
}

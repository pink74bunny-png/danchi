# 午前二時の留守番電話

1997年、地方都市の古い団地を舞台にしたホラーサウンドノベルです。
HTML / CSS / JavaScriptのみで構築されており、外部フレームワークは使用していません。
ブラウザ（PC・スマートフォン）だけでプレイできます。

## 遊び方

`index.html` をブラウザで開くだけで遊べます。
（フォントはGoogle Fontsから読み込みますが、オフラインでもシステムの明朝体／ゴシック体に自動でフォールバックします）

## ファイル構成

```
index.html      … 画面構造（タイトル／ゲーム本編／各種パネル）
style.css       … 全スタイル定義
scenario.js     … シナリオ本文・選択肢・分岐データ（JSON的な構造）
engine.js       … ゲーム進行ロジック本体
backgrounds.js  … 背景画像の生成・読み込み処理
audio.js        … BGM／効果音の再生処理（WebAudio合成によるダミー音を含む）
save.js         … セーブ／設定／既読／エンディング記録のlocalStorage管理
images/backgrounds/  … 背景画像の差し替え用フォルダ（空）
sounds/              … 音声ファイルの差し替え用フォルダ（空）
```

## 仮素材から本物の素材への差し替え方法

### 背景画像
現在は `backgrounds.js` がCanvas上で簡易的な背景を自動生成しています。
本物の写真に差し替えたい場合は、以下の名前でJPEG画像を `images/backgrounds/` に置くだけで、
自動的にそちらが優先して読み込まれます（見つからない場合は自動生成画像にフォールバックします）。

| ファイル名 | 用途 |
|---|---|
| room_night.jpg | 部屋・夜（電話なし） |
| room_night_phone.jpg | 部屋・夜（電話あり、メイン背景） |
| room_morning.jpg | 部屋・朝 |
| corridor_night.jpg | 団地の廊下・夜 |
| corridor_day.jpg | 団地の廊下・昼 |
| footbridge_evening.jpg | 歩道橋・夕方 |
| stairwell_404.jpg | 404号室前の階段・廊下 |
| rain_window.jpg | 雨の窓 |
| title_card_dark.jpg | 章タイトルカード背景 |
| title_bg.jpg | タイトル画面背景 |

推奨サイズ：960×540px以上（16:9）。

### 効果音・BGM
現在は `audio.js` がWebAudio APIで簡易的な音を合成しています。
本物の音声ファイルに差し替えたい場合は、`audio.js` 内の `tryLoadRealAudio()` を使う形に
拡張するか、以下のキー名に対応するmp3/oggファイルを `sounds/` に配置して読み込み処理を
追加してください（差し替えの土台となるエラーハンドリング済みの関数を用意しています）。

主なキー：`rain`（雨音）、`ambient_low`（環境音BGM）、`phone_ring`（電話のベル）、
`tape_rewind`（カセットの回転音）、`footsteps_corridor`（廊下の足音）

## シナリオの追加・修正

`scenario.js` の `SCENARIO` オブジェクトに、以下の形式でシーンを追加するだけで
本編に組み込めます。

```js
"scene_id": {
  speaker: "話者名（地の文なら空文字）",
  text: ["1行目", "2行目", "3行目"],
  background: "room_night_phone",
  character: "silhouette_female", // 人物を出さないならnullまたは省略
  bgm: "ambient_low",
  sound: "phone_ring",
  effect: "flicker", // flicker / darkenFlash / shudderText / slowText / characterMorph / glitchLine / chapterTitle
  next: "次のシーンID",
  setFlags: { フラグ名: true }
}
```

選択肢を持たせる場合は `choices` 配列を、エンディングにする場合は
`ending`（エンディングID）と `endingTitle`（表示タイトル）を追加してください。

## データ保存について

すべての進行状況・設定・既読記録・エンディング回収状況はブラウザのlocalStorageに
保存されます。サーバーへの通信は行わず、完全にブラウザ内で完結します。

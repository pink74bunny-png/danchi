/* =========================================================
   午前二時の留守番電話 - シナリオデータ
   各シーンは以下の情報を持つ：
   id / speaker / text(配列可) / background / character /
   bgm / sound / effect / choices / next / setFlags / condNext
   ========================================================= */

const SCENARIO = {

  /* ---------------------------------------------------------
     プロローグ
  --------------------------------------------------------- */
  "prologue_001": {
    speaker: "",
    text: [
      "引っ越してきた日の夜、部屋にはまだ段ボールが積まれていた。",
      "新しい街、新しい部屋。誰も自分を知らない場所。",
      "それは少しだけ、心細くて、少しだけ自由だった。"
    ],
    background: "room_night",
    bgm: "rain",
    effect: "fadeIn",
    next: "prologue_002"
  },
  "prologue_002": {
    speaker: "",
    text: [
      "時計の針は、午前二時を指している。",
      "古い団地特有の、軋むような静けさ。",
      "壁の向こうから、誰かの生活音すら聞こえない。"
    ],
    background: "room_night",
    bgm: "rain",
    next: "prologue_003"
  },
  "prologue_003": {
    speaker: "",
    text: [
      "棚の上に、見覚えのない留守番電話機が置かれていた。",
      "不動産屋は「前の住人が置いていったもの」とだけ言っていた。",
      "再生ボタンの脇に、小さく赤いランプが点滅している。",
      "――録音が、一件残っている。"
    ],
    background: "room_night_phone",
    effect: "flicker",
    next: "prologue_004"
  },
  "prologue_004": {
    speaker: "留守番電話",
    text: [
      "『……まだ、そこにいるの。』",
      "『次は、あなたの番だから。』",
      "プツッ、と音が途切れ、テープの回転音だけが残った。"
    ],
    background: "room_night_phone",
    sound: "tape_rewind",
    effect: "shudderText",
    next: "ch1_001",
    setFlags: { heardPrologueTape: true }
  },

  /* ---------------------------------------------------------
     第1章：深夜2時、翌日の出来事を告げる電話
  --------------------------------------------------------- */
  "ch1_001": {
    speaker: "",
    text: [
      "第一章　午前二時の予言",
    ],
    background: "title_card_dark",
    effect: "chapterTitle",
    next: "ch1_002"
  },
  "ch1_002": {
    speaker: "",
    text: [
      "引っ越して三日目の夜。",
      "段ボールの片付けも終わらないまま、時計はまた午前二時を指そうとしていた。",
      "SE：古い電話のベル音"
    ],
    background: "room_night_phone",
    bgm: "ambient_low",
    next: "ch1_003"
  },
  "ch1_003": {
    speaker: "",
    text: [
      "突然、棚の上に置かれていた電話が鳴った。",
      "この電話には、まだ電話線を繋いでいない。",
      "繋いでいないのに、確かに、ベルが鳴っている。"
    ],
    background: "room_night_phone",
    sound: "phone_ring",
    effect: "darkenFlash",
    next: "ch1_choice_001"
  },
  "ch1_choice_001": {
    speaker: "",
    text: ["どうする――"],
    background: "room_night_phone",
    choices: [
      { label: "受話器を取る", next: "ch1_branch_take", setFlags: { ch1Choice: "take" } },
      { label: "電話線を確認する", next: "ch1_branch_check", setFlags: { ch1Choice: "check" } },
      { label: "鳴り止むまで待つ", next: "ch1_branch_wait", setFlags: { ch1Choice: "wait" } }
    ]
  },

  // --- 受話器を取る ---
  "ch1_branch_take": {
    speaker: "",
    text: [
      "震える指で受話器を取った。",
      "ノイズの向こうから、低くこもった女の声が聞こえる。"
    ],
    background: "room_night_phone",
    character: "silhouette_female",
    next: "ch1_branch_take_2"
  },
  "ch1_branch_take_2": {
    speaker: "女の声",
    text: [
      "『明日の十七時、あなたは駅前の歩道橋を渡る。』",
      "『青いビニール傘を持った男に、気をつけて。』",
      "そこで、声はぷつりと切れた。"
    ],
    background: "room_night_phone",
    character: "silhouette_female",
    effect: "slowText",
    next: "ch1_004",
    setFlags: { knowsTomorrow: true, tape1Collected: true }
  },

  // --- 電話線を確認する ---
  "ch1_branch_check": {
    speaker: "",
    text: [
      "震える手で電話の裏を確かめる。",
      "――やはり、線は繋がっていない。",
      "それでも受話器の奥から、かすかに声がする。"
    ],
    background: "room_night_phone",
    next: "ch1_branch_check_2"
  },
  "ch1_branch_check_2": {
    speaker: "",
    text: [
      "怖くなって、受話器をそっと持ち上げてみた。",
      "『……繋がってなくても、聞こえるよ。』",
      "全身が冷たくなった。"
    ],
    background: "room_night_phone",
    character: "silhouette_female",
    effect: "glitchLine",
    next: "ch1_004",
    setFlags: { suspiciousLine: true, tape1Collected: true }
  },

  // --- 鳴り止むまで待つ ---
  "ch1_branch_wait": {
    speaker: "",
    text: [
      "布団をかぶり、息を殺してベルが鳴り止むのを待った。",
      "十回、二十回――ベルは数えるたびに近づいてくるように感じた。",
      "やがて、ふつりと音が止まる。"
    ],
    background: "room_night_phone",
    effect: "darkenFlash",
    next: "ch1_branch_wait_2"
  },
  "ch1_branch_wait_2": {
    speaker: "",
    text: [
      "静寂の中、留守番電話の自動応答だけがテープに何かを録音していた。",
      "確かめる勇気は、まだなかった。"
    ],
    background: "room_night_phone",
    next: "ch1_004",
    setFlags: { avoidedCall: true }
  },

  "ch1_004": {
    speaker: "",
    text: [
      "翌日、なんとなく駅前を避けて遠回りをした。",
      "けれど夕方になり、結局いつもの歩道橋を渡ることになる。"
    ],
    background: "footbridge_evening",
    next: "ch1_005"
  },
  "ch1_005": {
    speaker: "",
    text: [
      "向かいから、青いビニール傘をさした男がゆっくりと近づいてくる。",
      "雨は降っていないのに。"
    ],
    background: "footbridge_evening",
    character: "silhouette_male_umbrella",
    sound: "footsteps_corridor",
    effect: "characterMorph",
    next: "ch1_choice_002"
  },
  "ch1_choice_002": {
    speaker: "",
    text: ["男とすれ違う前に――"],
    background: "footbridge_evening",
    character: "silhouette_male_umbrella",
    choices: [
      { label: "目を合わせずやり過ごす", next: "ch1_avoid", setFlags: { avoidedMan: true } },
      { label: "話しかけてみる", next: "ch1_talk", setFlags: { talkedToMan: true } }
    ]
  },
  "ch1_avoid": {
    speaker: "",
    text: [
      "うつむいたまま、足早にすれ違った。",
      "すれ違いざま、傘の内側から視線を感じた気がした。",
      "振り返らなかった。振り返れなかった、というほうが正しい。"
    ],
    background: "footbridge_evening",
    next: "ch1_006"
  },
  "ch1_talk": {
    speaker: "",
    text: [
      "「あの、」声をかけると、男はゆっくりと振り向いた。",
      "傘の影で、顔がよく見えない。"
    ],
    background: "footbridge_evening",
    character: "silhouette_male_umbrella",
    next: "ch1_talk_2"
  },
  "ch1_talk_2": {
    speaker: "男",
    text: [
      "『……404号室の人だね。』",
      "そう言い残し、男は雨も降っていないのに傘を畳まないまま立ち去った。",
      "この団地に、404号室は存在しない。"
    ],
    background: "footbridge_evening",
    character: "silhouette_male_umbrella",
    effect: "slowText",
    next: "ch1_006",
    setFlags: { heard404: true }
  },
  "ch1_006": {
    speaker: "",
    text: [
      "その夜、部屋に戻ると留守番電話のランプが再び点滅していた。",
      "再生してみると――昨夜とは違う声が録音されている。"
    ],
    background: "room_night_phone",
    next: "ch1_007"
  },
  "ch1_007": {
    speaker: "留守番電話",
    text: [
      "『当たったでしょう。』",
      "『次は、もっと近くまで教えてあげる。』",
      "テープの回転音が、やけに長く続いた。"
    ],
    background: "room_night_phone",
    sound: "tape_rewind",
    effect: "shudderText",
    next: "ch2_001",
    setFlags: { ch1Complete: true }
  },

  /* ---------------------------------------------------------
     第2章：404号室
  --------------------------------------------------------- */
  "ch2_001": {
    speaker: "",
    text: ["第二章　404号室"],
    background: "title_card_dark",
    effect: "chapterTitle",
    next: "ch2_002"
  },
  "ch2_002": {
    speaker: "",
    text: [
      "気になって、管理人室で団地の見取り図を見せてもらった。",
      "三階の四号室の上は、屋上に直結している。",
      "四階という階そのものが、存在しない。"
    ],
    background: "corridor_night",
    next: "ch2_003"
  },
  "ch2_003": {
    speaker: "",
    text: [
      "それでも、夜の廊下を歩くと、四階へ続くはずのない階段が目に入ることがある。",
      "気のせいだと、何度も自分に言い聞かせた。"
    ],
    background: "corridor_night",
    sound: "footsteps_corridor",
    effect: "flicker",
    next: "ch2_choice_001"
  },
  "ch2_choice_001": {
    speaker: "",
    text: ["その階段を――"],
    background: "corridor_night",
    choices: [
      { label: "上ってみる", next: "ch2_climb", setFlags: { climbedStairs: true } },
      { label: "見なかったことにする", next: "ch2_ignore", setFlags: { ignoredStairs: true } }
    ]
  },
  "ch2_climb": {
    speaker: "",
    text: [
      "蛍光灯が不規則に点滅する階段を、一段ずつ上っていく。",
      "踊り場を越えると、見たこともない廊下が伸びていた。",
      "ドアの一つに、かすれた文字で『404』とある。"
    ],
    background: "stairwell_404",
    effect: "flicker",
    next: "ch2_climb_2"
  },
  "ch2_climb_2": {
    speaker: "",
    text: [
      "ドアの隙間から、室内の電話が鳴っているのが聞こえる。",
      "誰も住んでいないはずの部屋で。"
    ],
    background: "stairwell_404",
    sound: "phone_ring",
    next: "ch2_004",
    setFlags: { sawRoom404: true, tape2Collected: true }
  },
  "ch2_ignore": {
    speaker: "",
    text: [
      "見なかったことにして、自分の部屋に戻った。",
      "けれどその夜、天井から微かな着信音が聞こえ続けた。"
    ],
    background: "room_night_phone",
    next: "ch2_004"
  },
  "ch2_004": {
    speaker: "",
    text: [
      "深夜二時、留守番電話のランプがまた点滅する。",
      "今度の声は、明らかに違う番号からだった。"
    ],
    background: "room_night_phone",
    next: "ch2_005"
  },
  "ch2_005": {
    speaker: "留守番電話",
    text: [
      "発信者表示：『404』",
      "『あなたの部屋にも、わたしの声が届くようになったね。』",
      "『次は、声だけじゃなくなる。』"
    ],
    background: "room_night_phone",
    character: "silhouette_female",
    effect: "glitchLine",
    next: "ch2_choice_002",
    setFlags: { ch2Warning: true }
  },
  "ch2_choice_002": {
    speaker: "",
    text: ["留守番電話に対して――"],
    background: "room_night_phone",
    choices: [
      { label: "テープを取り出して確認する", next: "ch2_tape", setFlags: { checkedTape: true } },
      { label: "電源を切る", next: "ch2_unplug", setFlags: { unpluggedMachine: true } },
      { label: "誰かに相談する", next: "ch2_consult", setFlags: { consultedSomeone: true } }
    ]
  },
  "ch2_tape": {
    speaker: "",
    text: [
      "震える手でテープを取り出すと、ラベルに見覚えのない文字が並んでいた。",
      "――自分の名前だった。書いた覚えのない、自分の名前。"
    ],
    background: "room_night_phone",
    effect: "slowText",
    next: "ch2_006",
    setFlags: { sawOwnNameTape: true, tape3Collected: true }
  },
  "ch2_unplug": {
    speaker: "",
    text: [
      "コンセントを抜いた。",
      "それでも赤いランプは、消えないまま点滅を続けていた。"
    ],
    background: "room_night_phone",
    effect: "darkenFlash",
    next: "ch2_006"
  },
  "ch2_consult": {
    speaker: "",
    text: [
      "大学の友人に電話で相談してみたが、",
      "「気のせいだよ」と笑われ、最後にこう言われた。",
      "『……でも、その部屋、前にも誰かいなくなってる気がする。』"
    ],
    background: "room_night_phone",
    next: "ch2_006",
    setFlags: { learnedRumor: true }
  },
  "ch2_006": {
    speaker: "",
    text: [
      "翌朝、管理人に404号室のことを尋ねてみた。",
      "管理人は顔をこわばらせ、それ以上は何も語らなかった。",
      "ただ一言、こう呟いた。"
    ],
    background: "corridor_day",
    next: "ch2_007"
  },
  "ch2_007": {
    speaker: "管理人",
    text: [
      "『……あの部屋の留守電、まだ生きてるのか。』",
      "『早く、引っ越したほうがいい。』"
    ],
    background: "corridor_day",
    character: "silhouette_old_man",
    next: "ch2_008",
    setFlags: { ch2Complete: true }
  },
  "ch2_008": {
    speaker: "",
    text: [
      "その夜も、午前二時はやってくる。",
      "次の録音には――聞き覚えのある声が入っていた。"
    ],
    background: "room_night_phone",
    effect: "flicker",
    next: "ch3_001"
  },

  /* ---------------------------------------------------------
     第3章：自分自身の声
  --------------------------------------------------------- */
  "ch3_001": {
    speaker: "",
    text: ["第三章　わたしの声"],
    background: "title_card_dark",
    effect: "chapterTitle",
    next: "ch3_002"
  },
  "ch3_002": {
    speaker: "",
    text: [
      "再生ボタンを押すと、流れてきたのは――自分自身の声だった。",
      "今まさに自分が考えていることを、一拍遅れて読み上げている。"
    ],
    background: "room_night_phone",
    effect: "shudderText",
    next: "ch3_003"
  },
  "ch3_003": {
    speaker: "留守番電話（自分の声）",
    text: [
      "『……これを聞いているということは。』",
      "『あなたはもう、何回目だろうね。』"
    ],
    background: "room_night_phone",
    effect: "glitchLine",
    next: "ch3_choice_001"
  },
  "ch3_choice_001": {
    speaker: "",
    text: ["問いかけに対し――"],
    background: "room_night_phone",
    choices: [
      { label: "「何回目」の意味を尋ねる", next: "ch3_ask", setFlags: { askedMeaning: true } },
      { label: "テープをすべて聞き返す", next: "ch3_listenall", setFlags: { listenedAll: true }, condition: { tapesAtLeast: 2 } },
      { label: "電話を壊す", next: "ch3_destroy", setFlags: { destroyedPhone: true } }
    ]
  },
  "ch3_ask": {
    speaker: "",
    text: [
      "「何回目って、どういうこと」",
      "そう尋ねると、テープの回転音だけが応える。",
      "答えはなかった。けれど、部屋の温度が少しだけ下がった気がした。"
    ],
    background: "room_night_phone",
    sound: "tape_rewind",
    next: "ch3_004"
  },
  "ch3_listenall": {
    speaker: "",
    text: [
      "これまで録りためたテープを、すべて並べて聞き返した。",
      "予言、404号室、そして自分の声。",
      "繋ぎ合わせると、ひとつの夜の記録のように聞こえてくる。"
    ],
    background: "room_night_phone",
    effect: "slowText",
    next: "ch3_004",
    setFlags: { allTapesReviewed: true }
  },
  "ch3_destroy": {
    speaker: "",
    text: [
      "衝動的に、留守番電話を床に叩きつけた。",
      "プラスチックの破片が散らばる中、テープだけが回り続けていた。",
      "壊れても、声は止まらなかった。"
    ],
    background: "room_night_phone",
    effect: "darkenFlash",
    next: "ch3_004",
    setFlags: { phoneDestroyed: true }
  },
  "ch3_004": {
    speaker: "",
    text: [
      "気がつくと、夜が明けかけていた。",
      "窓の外で、雨だけが静かに降り続いている。",
      "そして、ある事実に気づく。"
    ],
    background: "rain_window",
    bgm: "rain",
    next: "ch3_005"
  },
  "ch3_005": {
    speaker: "",
    text: [
      "不動産の契約書を見返すと、入居日の欄に違和感があった。",
      "そこに書かれていた日付は――今日、ちょうど一年前の日付だった。"
    ],
    background: "room_night_phone",
    effect: "slowText",
    next: "ch3_choice_002"
  },
  "ch3_choice_002": {
    speaker: "",
    text: ["最後の選択――"],
    background: "room_night_phone",
    choices: [
      { label: "部屋を出て逃げる", next: "end_route_check", setFlags: { finalChoice: "flee" } },
      { label: "午前二時を待つ", next: "end_route_check", setFlags: { finalChoice: "wait" } },
      { label: "404号室へ向かう", next: "end_route_check", setFlags: { finalChoice: "404" } }
    ]
  },

  /* ---------------------------------------------------------
     エンディング振り分け（条件判定はengine.js側で実施）
  --------------------------------------------------------- */
  "end_route_check": {
    speaker: "",
    text: ["……時計の針が、再び午前二時を指そうとしている。"],
    background: "room_night_phone",
    effect: "darkenFlash",
    routeCheck: true // engine.jsがここでflag判定しendingへ振り分ける
  },

  /* ---- 通常エンド ---- */
  "ending_normal_001": {
    speaker: "",
    text: [
      "結局、何も変わらないまま朝が来た。",
      "留守番電話のランプは、もう点滅していない。",
      "それだけが、唯一の救いだった。"
    ],
    background: "room_morning",
    effect: "fadeIn",
    next: "ending_normal_002"
  },
  "ending_normal_002": {
    speaker: "",
    text: [
      "数日後、引っ越しの話は流れ、結局その部屋に住み続けることになった。",
      "ただ、深夜二時になると、今でも少しだけ目が覚める。"
    ],
    background: "room_morning",
    ending: "normal",
    endingTitle: "通常エンド　― 続く日常 ―"
  },

  /* ---- 逃亡エンド ---- */
  "ending_flee_001": {
    speaker: "",
    text: [
      "荷物もまとめず、財布だけを掴んで部屋を飛び出した。",
      "夜の団地を、振り返らずに走り続けた。",
      "二度とあの部屋には戻らないと決めた。"
    ],
    background: "corridor_night",
    effect: "fadeIn",
    next: "ending_flee_002"
  },
  "ending_flee_002": {
    speaker: "",
    text: [
      "数年後、あの団地は取り壊されたと風の噂で聞いた。",
      "けれど今でも、深夜二時に電話が鳴る夢を見る。",
      "あの部屋の続きは、誰も知らない。"
    ],
    background: "footbridge_evening",
    ending: "flee",
    endingTitle: "逃亡エンド　― 振り返らない夜 ―"
  },

  /* ---- 失踪エンド ---- */
  "ending_missing_001": {
    speaker: "",
    text: [
      "気がつくと、見知らぬ廊下に立っていた。",
      "目の前には『404』と書かれたドア。",
      "誰かが、ドアの向こうから名前を呼んでいる。"
    ],
    background: "stairwell_404",
    effect: "glitchLine",
    next: "ending_missing_002"
  },
  "ending_missing_002": {
    speaker: "",
    text: [
      "それ以来、その部屋の住人を見た者はいない。",
      "管理人室の記録には、ただ一言だけ書き残されていた。",
      "『404号室、また増えた。』"
    ],
    background: "stairwell_404",
    ending: "missing",
    endingTitle: "失踪エンド　― 増えた部屋 ―"
  },

  /* ---- 真相エンド（隠し条件達成時） ---- */
  "ending_truth_001": {
    speaker: "",
    text: [
      "すべてのテープを聞き終えたとき、ようやく理解した。",
      "留守番電話は、未来を告げていたのではない。",
      "――何度も繰り返される夜を、記録していただけだった。"
    ],
    background: "room_night_phone",
    effect: "slowText",
    next: "ending_truth_002"
  },
  "ending_truth_002": {
    speaker: "留守番電話（自分の声）",
    text: [
      "『気づいてくれたんだね。』",
      "『じゃあ、今度こそ――』",
      "『鳴らさないであげる。』"
    ],
    background: "room_night_phone",
    effect: "shudderText",
    next: "ending_truth_003"
  },
  "ending_truth_003": {
    speaker: "",
    text: [
      "テープは静かに止まり、二度と鳴ることはなかった。",
      "朝、団地には穏やかな光が差し込んでいた。",
      "それが本当に終わりなのか、確かめる術はもうない。"
    ],
    background: "room_morning",
    ending: "truth",
    endingTitle: "真相エンド　― 止まったテープ ―"
  },

  /* ---- 隠しエンド ---- */
  "ending_hidden_001": {
    speaker: "",
    text: [
      "電話を壊し、すべてを終わらせたつもりだった。",
      "けれど深夜二時、隣の部屋から同じベルの音が聞こえてくる。",
      "壁越しに、誰かが受話器を取る音がした。"
    ],
    background: "corridor_night",
    effect: "darkenFlash",
    next: "ending_hidden_002"
  },
  "ending_hidden_002": {
    speaker: "",
    text: [
      "次の夜、自分の部屋番号が、いつの間にか『404』に変わっていた。",
      "今度は、自分が誰かに電話をかける番だった。"
    ],
    background: "room_night_phone",
    ending: "hidden",
    endingTitle: "隠しエンド　― 受け継がれる留守電 ―"
  }
};

/* ---------------------------------------------------------
   章選択用メタデータ（タイトル画面「章を選ぶ」で使用）
--------------------------------------------------------- */
const CHAPTER_LIST = [
  { id: "prologue", label: "プロローグ　引っ越しの夜", start: "prologue_001" },
  { id: "ch1", label: "第一章　午前二時の予言", start: "ch1_001" },
  { id: "ch2", label: "第二章　404号室", start: "ch2_001" },
  { id: "ch3", label: "第三章　わたしの声", start: "ch3_001" }
];

/* ---------------------------------------------------------
   エンディング一覧メタデータ（記録画面用）
--------------------------------------------------------- */
const ENDING_LIST = [
  { id: "normal", title: "通常エンド　― 続く日常 ―", hint: "何も選ばず、ただ夜をやり過ごす。" },
  { id: "flee",   title: "逃亡エンド　― 振り返らない夜 ―", hint: "すべてを捨てて、部屋を飛び出す。" },
  { id: "missing", title: "失踪エンド　― 増えた部屋 ―", hint: "404号室へ、自ら足を踏み入れる。" },
  { id: "truth",  title: "真相エンド　― 止まったテープ ―", hint: "すべてのテープを集め、真実にたどり着く。" },
  { id: "hidden", title: "隠しエンド　― 受け継がれる留守電 ―", hint: "電話を壊し、それでも終わらせられなかった者の末路。" }
];

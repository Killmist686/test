const pairs = [
  ["001.png","002.png"],
  ["003.png","004.png"],
  ["005.png","006.png"],
  ["007.png","008.png"],
  ["009.png","010.png"],
  ["011.png","012.png"]
];

const defaultBack = "000.png";

let cards = [];
let opened = [];
let miss = 0;          // お手つき回数
let stageFoundPairs = 0; // 現ステージで揃えたペア数
let totalPairs = 0;    // 累積ツガイ数
let combo = 0;         // 連続コンボ数
let stage = 1;         // 現在のステージ
let lock = false;      // 処理中ロック

// --- ゲーム初期化 ---
function initGame(newStage = false) {
  lock = false; // 初期化時にロック解除

  if (newStage) {
    stage++;
    stageFoundPairs = 0;
  } else {
    stage = 1;
    miss = 0;
    combo = 0;
    stageFoundPairs = 0;
    totalPairs = 0;
  }

  const board = document.getElementById("board");
  board.innerHTML = "";

  document.getElementById("stageDisplay").textContent = `ステージ: ${stage}`;
  document.getElementById("pairCount").textContent = `ツガイ: ${totalPairs}`;
  document.getElementById("missCount").textContent = miss;
  document.getElementById("comboCount").textContent = `コンボ: ${combo}`;

  // ペアをランダムに4つ選ぶ → 8枚
  let chosenPairs = pairs.sort(() => Math.random() - 0.5).slice(0, 4);
  let pool = chosenPairs.flat();
  // 孤立カード1枚追加
  let rest = pairs.flat().filter(img => !pool.includes(img));
  pool.push(rest[Math.floor(Math.random() * rest.length)]);
  pool = pool.sort(() => Math.random() - 0.5);

  cards = [];
  pool.forEach(img => {
    const card = document.createElement("div");
    card.className = "card";

    // 裏面決定
    let backImg = defaultBack;
    if (Math.random() < 0.25) backImg = img.replace(".png", "back.png");

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-back"><img src="img/${backImg}" width="120" height="160"></div>
        <div class="card-front"><img src="img/${img}" width="120" height="160"></div>
      </div>`;
    card.dataset.img = img;
    card.addEventListener("click", () => flip(card));
    board.appendChild(card);
    cards.push(card);
  });

  opened = [];
}

// --- カードをめくる ---
function flip(card) {
  if (lock) return;              
  if (card.classList.contains("flip") || opened.length === 2) return;

  card.classList.add("flip");
  opened.push(card);

  if (opened.length === 2) {
    lock = true; 
    setTimeout(checkMatch, 800);
  }
}

// --- ペア判定 ---
function checkMatch() {
  const [c1, c2] = opened;

  if (isPair(c1.dataset.img, c2.dataset.img)) {
    stageFoundPairs++;
    totalPairs++;
    combo++;
    document.getElementById("pairCount").textContent = `ツガイ: ${totalPairs}`;

    if (combo % 3 === 0 && combo > 0 && miss > 0) {
      miss--;
      document.getElementById("missCount").textContent = miss;
    }
  } else {
    opened.forEach(c => c.classList.remove("flip"));
    combo = 0;

    if (miss === 3) {
      const tempPairs = totalPairs;
      setTimeout(() => {
        alert(`ゲームオーバー！ ステージ${stage}　揃えたツガイ${tempPairs}`);
        initGame(false);
      }, 100);
      opened = [];
      lock = false;
      return;
    } else {
      miss++;
      document.getElementById("missCount").textContent = miss;
    }
  }

  document.getElementById("comboCount").textContent = `コンボ: ${combo}`;
  opened = [];

  // ステージクリア判定
  if (stageFoundPairs === 4) {
    setTimeout(() => {
      alert(`ステージ${stage}クリア！`);
      initGame(true); // 新ステージへ
    }, 100);
  }

  lock = false; 
}

// --- ツガイ判定 ---
function isPair(img1, img2) {
  return pairs.some(([a, b]) =>
    (img1 === a && img2 === b) || (img1 === b && img2 === a)
  );
}

// --- リスタートボタン ---
document.getElementById("restartBtn").addEventListener("click", () => initGame(false));

// --- ページ読み込み時に開始 ---
window.onload = () => initGame(false);

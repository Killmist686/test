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
let miss = 0;         
let stageFoundPairs = 0; 
let totalPairs = 0;    
let combo = 0;         
let stage = 1;         
let lock = false;      

// --- ゲーム初期化 ---
function initGame(newStage = false) {
  lock = false; 

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
    setTimeout(checkMatch, 750);
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
      // ゲームオーバー時は lock を解除せず、手動リトライ待ち
      const tempPairs = totalPairs;
      showMessage(`ゲームオーバー！ ステージ${stage}　揃えたツガイ${tempPairs}`, null, 0); 
      opened = [];
      lock = true;  
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
    lock = true;
    showMessage(`ステージ${stage}クリア！`, () => {
      initGame(true); // 2秒後自動進行
    }, 2000); 
  } else {
    lock = false;
  }
}

// --- ツガイ判定 ---
function isPair(img1, img2) {
  return pairs.some(([a, b]) =>
    (img1 === a && img2 === b) || (img1 === b && img2 === a)
  );
}

// --- メッセージ表示 ---
function showMessage(text, callback, duration = 2000) {
  const existing = document.getElementById("messageBox");
  if (existing) existing.remove(); // 古いメッセージ削除

  const msg = document.createElement("div");
  msg.id = "messageBox";
  msg.style.position = "absolute";
  msg.style.top = "50%";
  msg.style.left = "50%";
  msg.style.transform = "translate(-50%, -50%)";
  msg.style.backgroundColor = "rgba(255,255,255,0.9)";
  msg.style.padding = "20px";
  msg.style.fontSize = "1.5rem";
  msg.style.borderRadius = "10px";
  msg.style.textAlign = "center";
  msg.style.zIndex = 1000;
  msg.textContent = text;
  document.body.appendChild(msg);

  if (duration > 0) {
    setTimeout(() => {
      msg.remove();
      if (callback) callback();
    }, duration);
  } 
}

// --- リスタートボタン ---
document.getElementById("restartBtn").addEventListener("click", () => {
  const msg = document.getElementById("messageBox");
  if (msg) msg.remove();
  lock = false;
  initGame(false);
});

// --- ページ読み込み時に開始 ---
window.onload = () => initGame(false);

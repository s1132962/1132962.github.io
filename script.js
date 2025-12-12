let board = Array(9).fill(null); 
let current = 'X';
let active = true;

// 勝利的所有組合 (格子索引)
const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

/* ======================
   ★★★ 遊戲初始化與玩家移動 ★★★
   ====================== */

function init() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    board = Array(9).fill(null);
    active = true;
    current = 'X';
    document.getElementById('status').innerText = '玩家 (X) 先手';

    // 建立 9 個格子
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.onclick = () => playerMove(i);
        boardEl.appendChild(cell);
    }
}

function playerMove(i) {
    if (!active || board[i]) return;
    board[i] = 'X';
    updateBoard();

    if (checkWin('X')) {
        endGame('玩家 (X) 勝利！');
        return;
    } else if (isFull()) {
        endGame('平手！');
        return;
    }

    current = 'O';
    document.getElementById('status').innerText = '電腦思考中...';

    setTimeout(computerMove, 500);
}

/* ======================
   ★★★ 完美 AI 決策流程 ( Minimax Level ) ★★★
   ====================== */

function computerMove() {
    let move = null;

    // 1. 獲勝：嘗試自己獲勝 (最高優先)
    if (move === null) move = findWinningMove('O');
    
    // 2. 阻擋：嘗試阻止玩家獲勝
    if (move === null) move = findWinningMove('X');
    
    // 3. 建立 Fork：嘗試創造兩個致勝機會
    if (move === null) move = findForkSpot('O');
    
    // 4. 阻擋 Fork：嘗試阻止對手創造 Fork
    if (move === null) move = blockPlayerFork();
    
    // 5. 最佳非獲勝或阻擋移動 (中央 > 角位 > 邊位)
    if (move === null) move = findBestNonWinningMove(); 

    // 執行移動
    if (move !== null) {
        board[move] = 'O';
        updateBoard();
        
        if (checkWin('O')) {
            endGame('電腦 (O) 勝利！');
            return;
        } else if (isFull()) {
            endGame('平手！');
            return;
        }
        
        current = 'X';
        document.getElementById('status').innerText = '輪到玩家 (X)';
    }
}


/* ======================
   ★★★ AI 輔助函數 ★★★
   ====================== */

// [輔助函數] 找出所有 null 的索引 (空位)
function getEmptyCells() {
    return board.map((v, i) => (v === null ? i : null)).filter(v => v !== null);
}

// [步驟 1, 2] 找出單一步驟可以獲勝或需要阻擋的位置
function findWinningMove(player) {
    for (let [a, b, c] of WINNING_COMBOS) {
        const line = [board[a], board[b], board[c]];
        // 檢查該組合中是否有兩個是當前 player 且有一個是 null (空位)
        if (line.filter(v => v === player).length === 2 && line.includes(null)) {
            // 回傳空位所在的原索引 a, b, c
            if (board[a] === null) return a;
            if (board[b] === null) return b;
            if (board[c] === null) return c;
        }
    }
    return null; 
}


// [Fork 核心] 計算某一玩家在當前棋盤上「只差一步」的勝利線數量
function countImmediateWins(player) {
    let count = 0;
    for (let [a, b, c] of WINNING_COMBOS) {
        const line = [board[a], board[b], board[c]];
        // 檢查該線路是否包含兩個該 player 且有一個 null (即只差一步就能贏)
        if (line.filter(v => v === player).length === 2 && line.includes(null)) {
            count++;
        }
    }
    return count;
}

// [步驟 3] 找出電腦自己能建立 Fork (雙重威脅) 的位置
function findForkSpot(player) {
    const empty = getEmptyCells();

    for (let i of empty) {
        board[i] = player; // 暫時下棋
        let count = countImmediateWins(player);
        board[i] = null; // 恢復棋盤

        if (count >= 2) return i;
    }
    return null;
}

// [步驟 4] 找出對手能建立 Fork 的位置，並阻擋
function blockPlayerFork() {
    const empty = getEmptyCells();

    for (let i of empty) {
        board[i] = 'X'; // 假設玩家會下在這裡
        let count = countImmediateWins('X');
        board[i] = null; // 恢復棋盤

        if (count >= 2) return i;
    }
    return null;
}

// [步驟 5] 找出最佳非獲勝/阻擋/Fork 的移動 (中央 > 角位 > 邊位)
function findBestNonWinningMove() {
    const empty = getEmptyCells();
    if (empty.length === 0) return null;

    // 1. 中央 (索引 4)
    const center = 4;
    if (empty.includes(center)) {
        return center;
    }

    // 2. 角位 (索引 0, 2, 6, 8)
    const corners = [0, 2, 6, 8];
    const availableCorners = empty.filter(i => corners.includes(i));
    if (availableCorners.length > 0) {
        // 隨機選擇一個角位
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // 3. 邊位 (索引 1, 3, 5, 7)
    const edges = [1, 3, 5, 7];
    const availableEdges = empty.filter(i => edges.includes(i));
    if (availableEdges.length > 0) {
        // 隨機選擇一個邊位
        return availableEdges[Math.floor(Math.random() * availableEdges.length)];
    }
    
    // 備用：隨機下棋 (理論上不會執行)
    return getRandomMove();
}

// 備用隨機移動 (用於 findBestNonWinningMove)
function getRandomMove() {
    const empty = getEmptyCells();
    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
}


/* ======================
   ★★★ 基礎遊戲函數 ★★★
   ====================== */

function updateBoard() {
    const cells = document.getElementsByClassName('cell');
    for (let i = 0; i < 9; i++) {
        cells[i].innerText = board[i] || '';
    }
}

function checkWin(player) {
    return WINNING_COMBOS.some(([a, b, c]) =>
        board[a] === player && board[b] === player && board[c] === player
    );
}

function isFull() {
    return board.every(cell => cell !== null);
}

function endGame(message) {
    document.getElementById('status').innerText = message;
    active = false;
}

function resetGame() {
    init();
}

// 確保網頁載入時呼叫初始化函數
init();
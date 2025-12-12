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
   ★★★ 初始化與玩家移動 ★★★
   ====================== */

function init() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    board = Array(9).fill(null);
    active = true;
    current = 'X';
    document.getElementById('status').innerText = '玩家 (X) 先手';

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        // 為了統一風格，將 'X' 設為深色，'O' 設為淺色
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

    // 減少電腦思考時間至 500ms
    setTimeout(computerMove, 500);
}

/* ======================
   ★★★ 升級後 AI 決策流程 ( Minimax Level ) ★★★
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
    
    // 5. 佔領中央
    const center = 4;
    if (move === null && board[center] === null) move = center;

    // 6. 佔領角位
    if (move === null) move = chooseCorner();
    
    // 7. 佔領邊位 (最後選項)
    if (move === null) move = chooseSide();

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

// 找出單一步驟可以獲勝或需要阻擋的位置 (您先前遺漏了這個定義)
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
    return null; // 檢查所有組合後若無機會，則回傳 null
}


// 找出所有 null 的索引 (空位)
function getEmptyCells() {
    return board.map((v, i) => (v === null ? i : null)).filter(v => v !== null);
}

// 判斷 player 放在某格後是否會產生 2 個可勝出機會 (Fork)
function countWinningChances(player) {
    let count = 0;

    for (let [a, b, c] of WINNING_COMBOS) {
        const line = [board[a], board[b], board[c]];

        // 檢查該線路是否只有一個 player，且有兩個空位 (代表未來有潛在贏的機會)
        if (line.filter(v => v === player).length === 1 &&
            line.filter(v => v === null).length === 2) {
            count++;
        }
    }
    return count;
}

// 找出電腦自己能建立 Fork 的位置
function findForkSpot(player) {
    const empty = getEmptyCells();

    for (let i of empty) {
        // 暫時將棋子放在該位置
        board[i] = player;
        let count = findPotentialWins(player); // 檢查當前棋盤上，該 player 總共有多少潛在的贏線
        board[i] = null; // 恢復棋盤狀態

        if (count >= 2)
            return i;
    }
    return null;
}

// 找出對手能建立 Fork 的位置，並阻擋
function blockPlayerFork() {
    const empty = getEmptyCells();

    for (let i of empty) {
        // 假設玩家會下在這裡
        board[i] = 'X';
        let count = findPotentialWins('X');
        board[i] = null;

        if (count >= 2)
            return i;
    }
    return null;
}

// 輔助函數：計算某一玩家在當前棋盤上擁有多少條「只差一步」的勝利線
function findPotentialWins(player) {
    let count = 0;
    for (let [a, b, c] of WINNING_COMBOS) {
        const line = [board[a], board[b], board[c]];
        // 該線路必須包含該 player，並且剩下的格子都是空的
        if (line.filter(v => v === player).length === 1 && line.filter(v => v === null).length === 2) {
            count++;
        }
    }
    return count;
}

// 選擇角位
function chooseCorner() {
    const corners = [0, 2, 6, 8];
    const available = corners.filter(i => board[i] === null);
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}

// 選擇邊位
function chooseSide() {
    const sides = [1, 3, 5, 7];
    const available = sides.filter(i => board[i] === null);
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}


/* ======================
   ★★★ 基礎遊戲函數 (維持不變) ★★★
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

// 初始化遊戲
init();
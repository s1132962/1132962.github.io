let board = Array(9).fill(null); 
let current = 'X';
let active = true;

const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

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
   ★★★ 升級後 AI 區塊 ★★★
   ====================== */

function computerMove() {

    // 1. 嘗試自己獲勝
    let move = findWinningMove('O');

    // 2. 阻止玩家獲勝
    if (move === null) move = findWinningMove('X');

    // 3. 製造自己的 Fork（雙威脅）
    if (move === null) move = findForkMove('O');

    // 4. 阻止玩家 Fork
    if (move === null) move = blockOpponentFork();

    // 5. 中心優先
    if (move === null && board[4] === null) move = 4;

    // 6. 角落優先
    if (move === null) move = chooseCorner();

    // 7. 邊格
    if (move === null) move = chooseSide();

    // 8. 隨機
    if (move === null) move = getRandomMove();

    // === 執行下棋 ===
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

/* --- 基本贏法判斷 --- */
function findWinningMove(player) {
    for (let [a, b, c] of WINNING_COMBOS) {
        const line = [board[a], board[b], board[c]];
        if (line.filter(v => v === player).length === 2 && line.includes(null)) {
            if (board[a] === null) return a;
            if (board[b] === null) return b;
            if (board[c] === null) return c;
        }
    }
    return null;
}

/* --- 取得空格 --- */
function getEmptyCells() {
    return board.map((v, i) => (v === null ? i : null)).filter(v => v !== null);
}

/* --- 找出自己能造成 fork 的位置 --- */
function findForkMove(player) {
    const empty = getEmptyCells();

    for (let i of empty) {
        board[i] = player;
        let chances = 0;

        for (let [a, b, c] of WINNING_COMBOS) {
            const line = [board[a], board[b], board[c]];
            if (line.filter(v => v === player).length === 2 && line.includes(null)) {
                chances++;
            }
        }

        board[i] = null;

        if (chances >= 2) return i;
    }

    return null;
}

/* --- 阻止對手 fork --- */
function blockOpponentFork() {
    const opponent = 'X';
    const empty = getEmptyCells();

    for (let i of empty) {
        board[i] = opponent;
        let chances = 0;

        for (let [a, b, c] of WINNING_COMBOS) {
            const line = [board[a], board[b], board[c]];
            if (line.filter(v => v === opponent).length === 2 && line.includes(null)) {
                chances++;
            }
        }

        board[i] = null;

        if (chances >= 2) return i;
    }
    return null;
}

/* --- 角落優先 --- */
function chooseCorner() {
    const corners = [0, 2, 6, 8];
    const available = corners.filter(i => board[i] === null);
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}

/* --- 邊格 --- */
function chooseSide() {
    const sides = [1, 3, 5, 7];
    const available = sides.filter(i => board[i] === null);
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}

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

init();

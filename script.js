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

    // 1. 能贏 → 先贏
    let move = findWinningMove('O');

    // 2. 玩家下一步會贏 → 一定要擋
    if (move === null) move = findWinningMove('X');

    // 3. 製造自己的 Fork
    if (move === null) move = findForkSpot('O');

    // 4. 阻止玩家 fork（新的正確版本）
    if (move === null) move = blockPlayerFork();

    // 5. 中心
    if (move === null && board[4] === null) move = 4;

    // 6. 角落
    if (move === null) move = chooseCorner();

    // 7. 邊格
    if (move === null) move = chooseSide();

    // 8. 隨機
    if (move === null) move = getRandomMove();

    // 放棋
    board[move] = 'O';
    updateBoard();

    if (checkWin('O')) {
        endGame('電腦 (O) 勝利！');
        return;
    }
    if (isFull()) {
        endGame('平手！');
        return;
    }

    current = 'X';
    document.getElementById('status').innerText = '輪到玩家 (X)';
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
// 判斷 player 放在某格後是否會產生 2 個可勝出機會
function countWinningChances(player) {
    let count = 0;

    for (let [a, b, c] of WINNING_COMBOS) {
        const line = [board[a], board[b], board[c]];

        if (line.filter(v => v === player).length === 1 &&
            line.filter(v => v === null).length === 2) {
            count++;
        }
    }
    return count;
}

function findForkSpot(player) {
    const empty = getEmptyCells();

    for (let i of empty) {
        board[i] = player;
        let count = countWinningChances(player);
        board[i] = null;

        if (count >= 2)
            return i;
    }
    return null;
}


/* --- 阻止對手 fork --- */
function blockPlayerFork() {
    const empty = getEmptyCells();

    for (let i of empty) {
        board[i] = 'X';
        let count = countWinningChances('X');
        board[i] = null;

        if (count >= 2)
            return i;
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

let board = Array(9).fill(null); // 棋盤狀態
let current = 'X'; // 當前玩家（玩家為X）
let active = true;

// 勝利的所有組合 (格子索引)
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
    
    // 建立9個格子
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
    // 模擬電腦思考時間
    setTimeout(computerMove, 700); 
}

function computerMove() {
    // 1. 嘗試自己獲勝
    let move = findWinningMove('O');
    
    // 2. 嘗試阻止玩家獲勝
    if (move === null) move = findWinningMove('X');
    
    // 3. 否則隨機下在空格
    if (move === null) move = getRandomMove();
    
    // 如果還有空位就下棋
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

// *** 修正後的 findWinningMove 函數結構 ***
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
    return null; // 檢查所有組合後若無贏的或防守的機會，則回傳 null
}


function getRandomMove() {
    // 找出所有 null 的索引
    const empty = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    
    if (empty.length === 0) return null; // 沒有空位了
    
    return empty[Math.floor(Math.random() * empty.length)];
}

function updateBoard() {
    const cells = document.getElementsByClassName('cell');
    for (let i = 0; i < 9; i++) {
        cells[i].innerText = board[i] || '';
    }
}

function checkWin(player) {
    return WINNING_COMBOS.some(([a, b, c]) => board[a] === player && board[b] === player && board[c] === player);
}

function isFull() {
    return board.every(cell => cell !== null);
}

// 結束遊戲
function endGame(message) {
    document.getElementById('status').innerText = message;
    active = false;
}

// 給按鈕調用的重開函數
function resetGame() {
    init();
}

// 初始化遊戲
init();
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const newGameBtn = document.getElementById('newGameBtn');

let board = [];
let currentPlayer = 'X';
let isGameOver = false;

// Kích thước bảng
const ROWS = 12;
const COLS = 13;

function createBoard() {
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${COLS}, 30px)`;
    boardElement.style.gridTemplateRows = `repeat(${ROWS}, 30px)`;

    board = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
}

function handleCellClick(event) {
    if (isGameOver || currentPlayer !== 'X') return;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (board[row][col] === null) {
        board[row][col] = 'X';
        event.target.textContent = 'X';
        event.target.classList.add('x');

        const winner = checkWinner();
        if (winner) {
            statusElement.textContent = `Chúc mừng! Bạn đã thắng!`;
            isGameOver = true;
        } else {
            currentPlayer = 'O';
            statusElement.textContent = `Đến lượt máy.`;
            setTimeout(computerMove, 500);
        }
    }
}

function computerMove() {
    if (isGameOver) return;

    const bestMove = getBestMove();
    if (bestMove) {
        const { row, col } = bestMove;
        board[row][col] = 'O';
        const cell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = 'O';
        cell.classList.add('o');

        const winner = checkWinner();
        if (winner) {
            statusElement.textContent = `Máy đã thắng!`;
            isGameOver = true;
        } else {
            currentPlayer = 'X';
            statusElement.textContent = `Đến lượt bạn.`;
        }
    } else {
        statusElement.textContent = `Trò chơi hòa!`;
        isGameOver = true;
    }
}

function getBestMove() {
    let bestScore = -Infinity;
    let move = null;
    const emptyCells = getEmptyCells();

    for (const cell of emptyCells) {
        board[cell.row][cell.col] = 'O';
        const score = evaluateBoard();
        board[cell.row][cell.col] = null; // Hoàn tác nước đi

        if (score > bestScore) {
            bestScore = score;
            move = cell;
        }
    }
    return move;
}

function getScore(tempBoard, player) {
    let score = 0;
    
    // Đánh giá các đường 5 ô
    function evaluateLine(line) {
        const playerCount = line.filter(val => val === player).length;
        const opponentCount = line.filter(val => val !== null && val !== player).length;
        const emptyCount = line.filter(val => val === null).length;
        
        if (opponentCount > 0) return 0;
        
        if (playerCount === 5) return 100000;
        if (playerCount === 4 && emptyCount >= 1) return 1000;
        if (playerCount === 3 && emptyCount >= 2) return 100;
        if (playerCount === 2 && emptyCount >= 3) return 10;
        return 0;
    }

    // Đánh giá hàng ngang, dọc, chéo
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            // Hàng ngang
            if (j <= COLS - 5) score += evaluateLine(tempBoard[i].slice(j, j + 5));
            
            // Hàng dọc
            if (i <= ROWS - 5) {
                const line = [tempBoard[i][j], tempBoard[i+1][j], tempBoard[i+2][j], tempBoard[i+3][j], tempBoard[i+4][j]];
                score += evaluateLine(line);
            }
            
            // Đường chéo chính
            if (i <= ROWS - 5 && j <= COLS - 5) {
                const line = [tempBoard[i][j], tempBoard[i+1][j+1], tempBoard[i+2][j+2], tempBoard[i+3][j+3], tempBoard[i+4][j+4]];
                score += evaluateLine(line);
            }
            
            // Đường chéo phụ
            if (i <= ROWS - 5 && j >= 4) {
                const line = [tempBoard[i][j], tempBoard[i+1][j-1], tempBoard[i+2][j-2], tempBoard[i+3][j-3], tempBoard[i+4][j-4]];
                score += evaluateLine(line);
            }
        }
    }
    return score;
}

function evaluateBoard() {
    return getScore(board, 'O') - getScore(board, 'X');
}

function getEmptyCells() {
    const emptyCells = [];
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            if (board[i][j] === null) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }
    return emptyCells;
}

function checkWinner() {
    // Hàng ngang, dọc, chéo
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const player = board[i][j];
            if (player) {
                // Hàng ngang
                if (j <= COLS - 5 && player === board[i][j+1] && player === board[i][j+2] && player === board[i][j+3] && player === board[i][j+4]) return player;
                // Hàng dọc
                if (i <= ROWS - 5 && player === board[i+1][j] && player === board[i+2][j] && player === board[i+3][j] && player === board[i+4][j]) return player;
                // Đường chéo chính
                if (i <= ROWS - 5 && j <= COLS - 5 && player === board[i+1][j+1] && player === board[i+2][j+2] && player === board[i+3][j+3] && player === board[i+4][j+4]) return player;
                // Đường chéo phụ
                if (i <= ROWS - 5 && j >= 4 && player === board[i+1][j-1] && player === board[i+2][j-2] && player === board[i+3][j-3] && player === board[i+4][j-4]) return player;
            }
        }
    }

    if (getEmptyCells().length === 0) return 'Hòa';
    return null;
}

newGameBtn.addEventListener('click', () => {
    isGameOver = false;
    currentPlayer = 'X';
    statusElement.textContent = `Đến lượt bạn.`;
    createBoard();
});

createBoard();
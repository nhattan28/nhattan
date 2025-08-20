// Cấu hình game
const BOARD_SIZE = 10;
const NUMBER_OF_MINES = 15;

// Lấy các thành phần HTML
const boardElement = document.getElementById('board');
const statusMessage = document.getElementById('status-message');
const restartButton = document.getElementById('restart-button');

// Biến trạng thái game
let board = [];
let mines = [];
let isGameOver = false;
let cellsRevealed = 0;

// Khởi tạo game
function initializeGame() {
    isGameOver = false;
    cellsRevealed = 0;
    board = createBoard();
    placeMines();
    calculateNumbers();
    renderBoard();
    statusMessage.textContent = 'Hãy bắt đầu!';
}

// Tạo mảng 2D cho bàn cờ
function createBoard() {
    const newBoard = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        newBoard[row] = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            newBoard[row][col] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            };
        }
    }
    return newBoard;
}

// Đặt mìn ngẫu nhiên
function placeMines() {
    mines = [];
    while (mines.length < NUMBER_OF_MINES) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        if (!board[row][col].isMine) {
            board[row][col].isMine = true;
            mines.push({ row, col });
        }
    }
}

// Tính toán số lượng mìn xung quanh
function calculateNumbers() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col].isMine) continue;
            let count = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    if (
                        newRow >= 0 && newRow < BOARD_SIZE &&
                        newCol >= 0 && newCol < BOARD_SIZE &&
                        board[newRow][newCol].isMine
                    ) {
                        count++;
                    }
                }
            }
            board[row][col].neighborMines = count;
        }
    }
}

// Hiển thị bàn cờ trên HTML
function renderBoard() {
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleLeftClick);
            cell.addEventListener('contextmenu', handleRightClick);
            boardElement.appendChild(cell);
        }
    }
}

// Xử lý click chuột trái (khám phá ô)
function handleLeftClick(event) {
    if (isGameOver) return;
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = board[row][col];

    if (cell.isRevealed || cell.isFlagged) return;

    if (cell.isMine) {
        gameOver(false);
    } else {
        revealCell(row, col);
        checkWin();
    }
}

// Xử lý click chuột phải (cắm cờ)
function handleRightClick(event) {
    event.preventDefault(); // Ngăn chặn menu chuột phải
    if (isGameOver) return;
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = board[row][col];

    if (cell.isRevealed) return;
    
    cell.isFlagged = !cell.isFlagged;
    event.target.classList.toggle('flag');
}

// Hàm đệ quy để mở ô
function revealCell(row, col) {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return;
    const cell = board[row][col];

    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    cellsRevealed++;
    const htmlCell = boardElement.children[row * BOARD_SIZE + col];
    htmlCell.classList.add('revealed');

    if (cell.neighborMines > 0) {
        htmlCell.textContent = cell.neighborMines;
        htmlCell.classList.add(`number-${cell.neighborMines}`);
    } else {
        // Đệ quy để mở các ô trống liền kề
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                revealCell(row + i, col + j);
            }
        }
    }
}

// Kiểm tra thắng
function checkWin() {
    const totalSafeCells = (BOARD_SIZE * BOARD_SIZE) - NUMBER_OF_MINES;
    if (cellsRevealed === totalSafeCells) {
        gameOver(true);
    }
}

// Kết thúc game
function gameOver(isWin) {
    isGameOver = true;
    if (isWin) {
        statusMessage.textContent = 'Bạn đã thắng! 🎉';
        revealAllMines(true);
    } else {
        statusMessage.textContent = 'Bạn đã thua! 💥';
        revealAllMines(false);
    }
    
    // Vô hiệu hóa click trên các ô
    const allCells = document.querySelectorAll('.cell');
    allCells.forEach(cell => {
        cell.removeEventListener('click', handleLeftClick);
        cell.removeEventListener('contextmenu', handleRightClick);
        cell.style.cursor = 'default';
    });
}

// Hiển thị tất cả mìn khi game kết thúc
function revealAllMines(isWin) {
    mines.forEach(mine => {
        const htmlCell = boardElement.children[mine.row * BOARD_SIZE + mine.col];
        if (isWin) {
            htmlCell.classList.add('flag');
        } else {
            htmlCell.classList.add('bomb');
            htmlCell.textContent = '💣';
        }
    });
}

// Xử lý nút Chơi lại
restartButton.addEventListener('click', initializeGame);

// Bắt đầu game lần đầu tiên
initializeGame();
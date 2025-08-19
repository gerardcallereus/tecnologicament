const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const blockSize = 20;
context.scale(blockSize, blockSize);

const boardWidth = 10;
const boardHeight = 20;
const board = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(0));

const pieces = {
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  O: [
    [2, 2],
    [2, 2],
  ],
  L: [
    [0, 3, 0],
    [0, 3, 0],
    [0, 3, 3],
  ],
  J: [
    [0, 4, 0],
    [0, 4, 0],
    [4, 4, 0],
  ],
  I: [
    [0, 5, 0, 0],
    [0, 5, 0, 0],
    [0, 5, 0, 0],
    [0, 5, 0, 0],
  ],
  S: [
    [0, 6, 6],
    [6, 6, 0],
  ],
  Z: [
    [7, 7, 0],
    [0, 7, 7],
  ],
};

const colors = [
  null,
  '#ff0d72', '#0dc2ff', '#0dff72',
  '#f538ff', '#ff8e0d', '#ffe138', '#3877ff',
];

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
};

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

function collide(board, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (m[y][x] !== 0 && (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(board, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        board[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function clearLines() {
  for (let y = board.length - 1; y >= 0; y--) {
    if (board[y].every(value => value !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(boardWidth).fill(0));
      y++;
    }
  }
}

function playerReset() {
  const types = Object.keys(pieces);
  const type = types[Math.floor(Math.random() * types.length)];
  player.matrix = pieces[type].map(row => row.slice());
  player.pos.y = 0;
  player.pos.x = Math.floor(boardWidth / 2) - Math.floor(player.matrix[0].length / 2);
  if (collide(board, player)) {
    board.forEach(row => row.fill(0));
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(board, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

let dropCounter = 0;
let dropDelay = 1000;
let lastTime = 0;

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;
  if (dropCounter > dropDelay) {
    player.pos.y++;
    if (collide(board, player)) {
      player.pos.y--;
      merge(board, player);
      clearLines();
      playerReset();
    }
    dropCounter = 0;
  }
  draw();
  requestAnimationFrame(update);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') {
    player.pos.x--;
    if (collide(board, player)) {
      player.pos.x++;
    }
  } else if (e.key === 'ArrowRight') {
    player.pos.x++;
    if (collide(board, player)) {
      player.pos.x--;
    }
  } else if (e.key === 'ArrowDown') {
    player.pos.y++;
    if (collide(board, player)) {
      player.pos.y--;
      merge(board, player);
      clearLines();
      playerReset();
    }
    dropCounter = 0;
  } else if (e.key === 'ArrowUp') {
    const rotated = rotate(player.matrix);
    const posX = player.pos.x;
    player.matrix = rotated;
    let offset = 1;
    while (collide(board, player)) {
      player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > player.matrix[0].length) {
        player.matrix = rotate(rotate(rotate(rotated)));
        player.pos.x = posX;
        break;
      }
    }
  }
});

playerReset();
update();

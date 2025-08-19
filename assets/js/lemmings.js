const canvas = document.getElementById('lemmings');
const ctx = canvas.getContext('2d');

const groundY = 180;
const gap = { start: 150, end: 230 };
let blockPlaced = false;

const lemming = {
  x: 20,
  y: groundY - 10,
  vx: 1,
  vy: 0,
  size: 10,
  alive: true,
  reached: false,
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'lightblue';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'brown';
  ctx.fillRect(0, groundY, gap.start, canvas.height - groundY);
  ctx.fillRect(gap.end, groundY, canvas.width - gap.end, canvas.height - groundY);
  if (blockPlaced) {
    ctx.fillRect(gap.start, groundY - 10, gap.end - gap.start, 10);
  }

  ctx.fillStyle = 'green';
  ctx.fillRect(lemming.x, lemming.y, lemming.size, lemming.size);

  ctx.fillStyle = 'yellow';
  ctx.fillRect(canvas.width - 20, groundY - 20, 20, 20);

  ctx.fillStyle = 'black';
  if (!lemming.alive) {
    ctx.fillText('Game Over', 150, 50);
  } else if (lemming.reached) {
    ctx.fillText('You Win!', 150, 50);
  }
}

function update() {
  if (!lemming.alive || lemming.reached) {
    draw();
    return;
  }

  lemming.x += lemming.vx;
  lemming.y += lemming.vy;
  lemming.vy += 0.2;

  const onGround = lemming.y + lemming.size >= groundY;
  const overGap = lemming.x + lemming.size / 2 > gap.start &&
                  lemming.x + lemming.size / 2 < gap.end;

  if (onGround && (!overGap || blockPlaced)) {
    lemming.y = groundY - lemming.size;
    lemming.vy = 0;
  }

  if (lemming.x + lemming.size > canvas.width - 20 && onGround) {
    lemming.reached = true;
  }

  if (lemming.y > canvas.height) {
    lemming.alive = false;
  }

  draw();
  requestAnimationFrame(update);
}

canvas.addEventListener('click', () => {
  blockPlaced = true;
});

update();

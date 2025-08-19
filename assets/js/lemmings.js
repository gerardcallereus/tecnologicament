const canvas = document.getElementById('lemmings');
const { Engine, Render, World, Bodies, Body, Events } = Matter;

const engine = Engine.create();
const world = engine.world;

const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: 400,
    height: 200,
    wireframes: false,
    background: 'lightblue'
  }
});

Render.run(render);
Engine.run(engine);

const groundY = 180;
const gap = { start: 150, end: 230 };
let block = null;

const ground1 = Bodies.rectangle(gap.start / 2, groundY + 10, gap.start, 20, {
  isStatic: true,
  render: { fillStyle: 'brown' }
});
const ground2 = Bodies.rectangle(
  gap.end + (canvas.width - gap.end) / 2,
  groundY + 10,
  canvas.width - gap.end,
  20,
  {
    isStatic: true,
    render: { fillStyle: 'brown' }
  }
);
World.add(world, [ground1, ground2]);

const lemming = Bodies.rectangle(20, groundY - 10, 10, 10, {
  render: { fillStyle: 'green' }
});
World.add(world, lemming);

Body.setVelocity(lemming, { x: 1, y: 0 });

const exit = Bodies.rectangle(canvas.width - 10, groundY - 10, 20, 20, {
  isStatic: true,
  isSensor: true,
  render: { fillStyle: 'yellow' }
});
World.add(world, exit);

const gameState = { alive: true, reached: false };

Events.on(engine, 'beforeUpdate', () => {
  if (gameState.alive && !gameState.reached) {
    Body.setVelocity(lemming, { x: 1, y: lemming.velocity.y });
  }
});

canvas.addEventListener('click', () => {
  if (!block) {
    block = Bodies.rectangle((gap.start + gap.end) / 2, groundY, gap.end - gap.start, 10, {
      isStatic: true,
      render: { fillStyle: 'brown' }
    });
    World.add(world, block);
  }
});

Events.on(engine, 'afterUpdate', () => {
  if (lemming.position.y > canvas.height) {
    gameState.alive = false;
  }
});

Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((pair) => {
    const { bodyA, bodyB } = pair;
    if (
      (bodyA === lemming && bodyB === exit) ||
      (bodyB === lemming && bodyA === exit)
    ) {
      gameState.reached = true;
    }
  });
});

Events.on(render, 'afterRender', () => {
  const ctx = render.context;
  ctx.fillStyle = 'black';
  if (!gameState.alive) {
    ctx.fillText('Game Over', 150, 50);
  } else if (gameState.reached) {
    ctx.fillText('You Win!', 150, 50);
  }
});


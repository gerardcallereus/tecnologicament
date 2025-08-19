---
title: Joc de Tetris
nav_order: 6
---

# Joc de Tetris Unicorn

Utilitza les fletxes del teclat per moure les peces i forma línies completes.

<div style="display:flex; gap:10px;">
  <canvas id="tetris" width="200" height="400" style="border:1px solid #ccc"></canvas>
  <canvas id="next" width="80" height="80" style="border:1px solid #ccc"></canvas>
</div>
<script defer src="{{ '/assets/js/tetris.js' | relative_url }}"></script>

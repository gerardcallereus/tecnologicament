---
title: Càpsules
nav_order: 3
---

# Càpsules

Espai per compartir càpsules formatives.

## D3.js en acció

Per veure el potencial de D3.js, aquí tens alguns exemples simples:

### Exemple de la pàgina de projectes

<div id="grafica-d3"></div>

<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
  const dades = [30, 80, 45];

  const amplada = 300;
  const alçada = 100;
  const marge = 5;

  const svg = d3.select("#grafica-d3")
    .append("svg")
    .attr("width", amplada)
    .attr("height", alçada);

  svg.selectAll("rect")
    .data(dades)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * (amplada / dades.length) + marge / 2)
    .attr("y", d => alçada - d)
    .attr("width", amplada / dades.length - marge)
    .attr("height", d => d)
    .attr("fill", "steelblue");
</script>

### Cercle simple

<div id="d3-circle">

<script>
// Cercle
const svgCircle = d3.select("#d3-circle").append("svg")
  .attr("width", 120).attr("height", 120);
svgCircle.append("circle")
  .attr("cx", 60).attr("cy", 60).attr("r", 50)
  .attr("fill", "steelblue");
</script>
</div>

### Diagrama de barres

<div id="d3-bar">
<script>
// Diagrama de barres
const dataBar = [4, 8, 15, 16, 23, 42];
const svgBar = d3.select("#d3-bar").append("svg")
  .attr("width", 300).attr("height", 150);
svgBar.selectAll("rect")
  .data(dataBar)
  .enter().append("rect")
    .attr("x", (d, i) => i * 45)
    .attr("y", d => 150 - d * 3)
    .attr("width", 40)
    .attr("height", d => d * 3)
    .attr("fill", "orange");
</script>

  
</div>

### Gràfic de línia

<div id="d3-line">

<script>

// Gràfic de línia
const dataLine = [
  {x: 0, y: 20},
  {x: 1, y: 40},
  {x: 2, y: 25},
  {x: 3, y: 60},
  {x: 4, y: 45}
];
const svgLine = d3.select("#d3-line").append("svg")
  .attr("width", 300).attr("height", 150);
const line = d3.line()
  .x(d => d.x * 60)
  .y(d => 150 - d.y);
svgLine.append("path")
  .datum(dataLine)
  .attr("fill", "none")
  .attr("stroke", "green")
  .attr("stroke-width", 2)
  .attr("d", line);
</script>
</div>


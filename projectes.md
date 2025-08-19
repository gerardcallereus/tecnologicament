---
title: Projectes
nav_order: 2
has_children: true
---

# Projectes

![Pixel transparent](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==)

Aquí trobareu els projectes desenvolupats pels alumnes.

## Projectes per curs
- [1r d'ESO]({{ '/projectes/1r' | relative_url }})
- [2n d'ESO]({{ '/projectes/2n' | relative_url }})
- [3r d'ESO]({{ '/projectes/3r' | relative_url }})
- [4t d'ESO]({{ '/projectes/4t' | relative_url }})
## Visualització amb D3.js

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


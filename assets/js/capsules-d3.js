document.addEventListener('DOMContentLoaded', function () {
  // Cercle
  const svgCircle = d3.select('#d3-circle')
    .append('svg')
    .attr('width', 120)
    .attr('height', 120);

  svgCircle.append('circle')
    .attr('cx', 60)
    .attr('cy', 60)
    .attr('r', 50)
    .attr('fill', 'steelblue');

  // Diagrama de barres
  const dataBar = [4, 8, 15, 16, 23, 42];
  const svgBar = d3.select('#d3-bar')
    .append('svg')
    .attr('width', 300)
    .attr('height', 150);

  svgBar.selectAll('rect')
    .data(dataBar)
    .join('rect')
    .attr('x', (d, i) => i * 45)
    .attr('y', d => 150 - d * 3)
    .attr('width', 40)
    .attr('height', d => d * 3)
    .attr('fill', 'orange');

  // Gràfic de línia
  const dataLine = [
    { x: 0, y: 20 },
    { x: 1, y: 40 },
    { x: 2, y: 25 },
    { x: 3, y: 60 },
    { x: 4, y: 45 }
  ];

  const svgLine = d3.select('#d3-line')
    .append('svg')
    .attr('width', 300)
    .attr('height', 150);

  const line = d3.line()
    .x(d => d.x * 60)
    .y(d => 150 - d.y);

  svgLine.append('path')
    .datum(dataLine)
    .attr('fill', 'none')
    .attr('stroke', 'green')
    .attr('stroke-width', 2)
    .attr('d', line);
});

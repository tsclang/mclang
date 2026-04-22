'use strict';
const path = require('path');
const col  = require(path.join(__dirname, '../../mc/build/Release/colorimetry'));

const colors = [
  [1, 0, 0, 'Red'], [0, 1, 0, 'Green'], [0, 0, 1, 'Blue'],
  [1, 1, 1, 'White'], [0, 0, 0, 'Black'], [1, 1, 0, 'Yellow'],
];

console.log('=== Colorimetry (Node native addon) ===\n');
console.log('Name     L*       a*       b*');
for (const [r, g, b, name] of colors) {
  const L = col.lab_L(r,g,b), a = col.lab_a(r,g,b), bv = col.lab_b(r,g,b);
  console.log(`${name.padEnd(8)} ${L.toFixed(2).padStart(7)} ${a.toFixed(2).padStart(7)} ${bv.toFixed(2).padStart(7)}`);
}

console.log('\n=== WCAG Contrast ===');
for (const [r, g, b, name] of colors) {
  const crB = col.contrast_ratio(r, g, b, 0, 0, 0);
  const crW = col.contrast_ratio(r, g, b, 1, 1, 1);
  console.log(`${name.padEnd(8)} vs Black: ${crB.toFixed(2)}:1  vs White: ${crW.toFixed(2)}:1`);
}

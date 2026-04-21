'use strict';
const path = require('path');

const g = require(path.join(__dirname, '../../mc/build/Release/geometry'));

console.log('2D geometry:');
console.log(`  dist (0,0)→(3,4):    ${g.dist2d(0, 0, 3, 4).toFixed(4)}`);
console.log(`  dist (1,1)→(4,5):    ${g.dist2d(1, 1, 4, 5).toFixed(4)}`);
const rad = g.angle2d(1, 0, 0, 1);
console.log(`  angle (1,0)∠(0,1):   ${rad.toFixed(4)} rad = ${(rad * 180 / Math.PI).toFixed(1)}°`);
console.log(`  triangle area (0,0)(4,0)(0,3): ${g.triangle_area(0, 0, 4, 0, 0, 3).toFixed(4)}`);

'use strict';
const path = require('path');

const m = require(path.join(__dirname, '../../mc/build/Release/math'));

const r = 5, w = 4, h = 3;

console.log('=== area(r=5) — same name, different namespace ===');
console.log(`  s2::area (circle):  ${m.s2__area(r).toFixed(4)}`);
console.log(`  s3::area (sphere):  ${m.s3__area(r).toFixed(4)}`);

console.log('\n=== perimeter / volume (r=5) ===');
console.log(`  s2::perimeter (circle):  ${m.s2__perimeter(r).toFixed(4)}`);
console.log(`  s3::volume    (sphere):  ${m.s3__volume(r).toFixed(4)}`);

console.log('\n=== 2D shapes ===');
console.log(`  rect  area(${w}, ${h}):       ${m.s2__rect_area(w, h).toFixed(4)}`);
console.log(`  rect  perimeter(${w}, ${h}):  ${m.s2__rect_perimeter(w, h).toFixed(4)}`);
console.log(`  triangle area(3,4,5):    ${m.s2__tri_area(3, 4, 5).toFixed(4)}`);

console.log('\n=== 3D shapes ===');
console.log(`  cube  area(${w}):      ${m.s3__cube_area(w).toFixed(4)}`);
console.log(`  cube  volume(${w}):    ${m.s3__cube_volume(w).toFixed(4)}`);
console.log(`  cyl   area(${r},${h}):   ${m.s3__cyl_area(r, h).toFixed(4)}`);
console.log(`  cyl   volume(${r},${h}): ${m.s3__cyl_volume(r, h).toFixed(4)}`);

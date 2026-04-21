'use strict';
const path = require('path');
const fs   = require('fs');

const buildDir = path.join(__dirname, '..', '..', 'build');
const jsPath   = path.join(buildDir, 'math.js');

if (!fs.existsSync(jsPath)) {
  console.error(`Error: ${jsPath} not found.`);
  console.error('Build with: emcc mc/math.c -o build/math.js ...');
  process.exit(1);
}

const Module = require(jsPath);

Module.onRuntimeInitialized = () => {
  const d1 = (name) => Module.cwrap(name, 'number', ['number']);
  const d2 = (name) => Module.cwrap(name, 'number', ['number', 'number']);
  const d3 = (name) => Module.cwrap(name, 'number', ['number', 'number', 'number']);

  const s2_area      = d1('s2__area');
  const s2_perimeter = d1('s2__perimeter');
  const s2_rect_area = d2('s2__rect_area');
  const s2_rect_peri = d2('s2__rect_perimeter');
  const s2_tri_area  = d3('s2__tri_area');
  const s3_area      = d1('s3__area');
  const s3_volume    = d1('s3__volume');
  const s3_cube_area = d1('s3__cube_area');
  const s3_cube_vol  = d1('s3__cube_volume');
  const s3_cyl_area  = d2('s3__cyl_area');
  const s3_cyl_vol   = d2('s3__cyl_volume');

  const r = 5, w = 4, h = 3;

  console.log('=== area(r=5) — same name, different namespace ===');
  console.log(`  s2::area (circle):  ${s2_area(r).toFixed(4)}`);
  console.log(`  s3::area (sphere):  ${s3_area(r).toFixed(4)}`);

  console.log('\n=== perimeter / volume (r=5) ===');
  console.log(`  s2::perimeter (circle):  ${s2_perimeter(r).toFixed(4)}`);
  console.log(`  s3::volume    (sphere):  ${s3_volume(r).toFixed(4)}`);

  console.log('\n=== 2D shapes ===');
  console.log(`  rect  area(${w}, ${h}):       ${s2_rect_area(w, h).toFixed(4)}`);
  console.log(`  rect  perimeter(${w}, ${h}):  ${s2_rect_peri(w, h).toFixed(4)}`);
  console.log(`  triangle area(3,4,5):    ${s2_tri_area(3, 4, 5).toFixed(4)}`);

  console.log('\n=== 3D shapes ===');
  console.log(`  cube  area(${w}):      ${s3_cube_area(w).toFixed(4)}`);
  console.log(`  cube  volume(${w}):    ${s3_cube_vol(w).toFixed(4)}`);
  console.log(`  cyl   area(${r},${h}):   ${s3_cyl_area(r, h).toFixed(4)}`);
  console.log(`  cyl   volume(${r},${h}): ${s3_cyl_vol(r, h).toFixed(4)}`);
};

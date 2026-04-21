'use strict';
const path = require('path');
const fs   = require('fs');

const buildDir = path.join(__dirname, '..', '..', 'build');
const jsPath   = path.join(buildDir, 'statistics.js');

if (!fs.existsSync(jsPath)) {
  console.error(`Error: ${jsPath} not found. Build with emcc first.`);
  process.exit(1);
}

const Module = require(jsPath);

Module.onRuntimeInitialized = () => {
  const rawData = [2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0];
  const n = rawData.length;

  // Allocate array in wasm heap
  const ptr = Module._malloc(n * 8);
  rawData.forEach((v, i) => Module.HEAPF64[(ptr >> 3) + i] = v);

  const pn  = (name) => Module.cwrap(name, 'number', ['number', 'number']);
  const pnx = (name) => Module.cwrap(name, 'number', ['number', 'number', 'number']);

  const avg        = pn('avg');
  const spread     = pn('spread');
  const cv         = pn('cv');
  const data_range = pn('data_range');
  const z_score    = pnx('z_score');
  const normalize  = pnx('normalize');

  console.log('Data: [2, 4, 4, 4, 5, 5, 7, 9]');
  console.log(`  Mean:    ${avg(ptr, n).toFixed(4)}`);
  console.log(`  Std dev: ${spread(ptr, n).toFixed(4)}`);
  console.log(`  CV:      ${cv(ptr, n).toFixed(2)}%`);
  console.log(`  Range:   ${data_range(ptr, n).toFixed(1)}`);

  console.log('\nZ-scores:');
  rawData.forEach(x => console.log(`  ${x} → z=${z_score(ptr, n, x).toFixed(4)}`));

  console.log('\nNormalized:');
  rawData.forEach(x => console.log(`  ${x} → ${normalize(ptr, n, x).toFixed(4)}`));

  Module._free(ptr);
};

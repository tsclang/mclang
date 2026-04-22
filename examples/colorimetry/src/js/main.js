'use strict';
const path = require('path');
const fs   = require('fs');

const buildDir = path.join(__dirname, '..', '..', 'build');
const jsPath   = path.join(buildDir, 'colorimetry.js');

if (!fs.existsSync(jsPath)) {
  console.error(`Error: ${jsPath} not found.`);
  process.exit(1);
}

const Module = require(jsPath);

Module.onRuntimeInitialized = () => {
  const n1 = ['number'], n3 = Array(3).fill('number'), n6 = Array(6).fill('number');
  const srgb_to_linear = Module.cwrap('srgb_to_linear', 'number', n1);
  const linear_to_srgb = Module.cwrap('linear_to_srgb', 'number', n1);
  const lab_L          = Module.cwrap('lab_L',           'number', n3);
  const lab_a          = Module.cwrap('lab_a',           'number', n3);
  const lab_b          = Module.cwrap('lab_b',           'number', n3);
  const delta_e76      = Module.cwrap('delta_e76',       'number', n6);
  const contrast_ratio = Module.cwrap('contrast_ratio',  'number', n6);

  const colors = [
    [1, 0, 0, 'Red'], [0, 1, 0, 'Green'], [0, 0, 1, 'Blue'],
    [1, 1, 1, 'White'], [0, 0, 0, 'Black'], [1, 1, 0, 'Yellow'],
  ];

  console.log('=== Colorimetry (Wasm) ===\n');
  console.log('Name     L*       a*       b*');
  console.log('-'.repeat(35));
  for (const [r, g, b, name] of colors) {
    const L = lab_L(r,g,b), a = lab_a(r,g,b), bv = lab_b(r,g,b);
    console.log(`${name.padEnd(8)} ${L.toFixed(2).padStart(7)} ${a.toFixed(2).padStart(7)} ${bv.toFixed(2).padStart(7)}`);
  }

  console.log('\n=== WCAG Contrast ===');
  for (const [r, g, b, name] of colors) {
    const crB = contrast_ratio(r, g, b, 0, 0, 0);
    const crW = contrast_ratio(r, g, b, 1, 1, 1);
    console.log(`${name.padEnd(8)} vs Black: ${crB.toFixed(2)}:1  vs White: ${crW.toFixed(2)}:1`);
  }
};

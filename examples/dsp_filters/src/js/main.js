'use strict';
const path = require('path');
const fs   = require('fs');

const buildDir = path.join(__dirname, '..', '..', 'build');
const jsPath   = path.join(buildDir, 'dsp_filters.js');

if (!fs.existsSync(jsPath)) {
  console.error(`Error: ${jsPath} not found. Build with emcc — see run.sh`);
  process.exit(1);
}

const Module = require(jsPath);

Module.onRuntimeInitialized = () => {
  const hann       = Module.cwrap('hann',       'number', ['number', 'number']);
  const hamming    = Module.cwrap('hamming',    'number', ['number', 'number']);
  const blackman   = Module.cwrap('blackman',   'number', ['number', 'number']);
  const lp_hann    = Module.cwrap('lp_hann',   'number', ['number', 'number', 'number']);
  const lp_hamming = Module.cwrap('lp_hamming','number', ['number', 'number', 'number']);

  const N  = 9;
  const fc = 0.2;

  console.log('=== Window Coefficients (N=9) [Wasm] ===');
  for (let n = 0; n < N; n++) {
    console.log(`  n=${n}  hann=${hann(n, N).toFixed(6)}  hamming=${hamming(n, N).toFixed(6)}  blackman=${blackman(n, N).toFixed(6)}`);
  }

  console.log(`\n=== 9-tap LPF (Hann, fc=${fc}) ===`);
  let dcGain = 0;
  for (let n = 0; n < N; n++) {
    const v = lp_hann(n, N, fc);
    dcGain += v;
    console.log(`  h[${n}] = ${v.toFixed(6)}`);
  }
  console.log(`  DC gain (sum): ${dcGain.toFixed(6)}`);

  console.log('\n=== LPF window comparison (fc=0.2, centre tap n=4) ===');
  const centre = Math.floor(N / 2);
  console.log(`  lp_hann:    ${lp_hann(centre, N, fc).toFixed(6)}`);
  console.log(`  lp_hamming: ${lp_hamming(centre, N, fc).toFixed(6)}`);
};

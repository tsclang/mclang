'use strict';
const path = require('path');
const fs   = require('fs');

const buildDir = path.join(__dirname, '..', '..', 'build');
const jsPath   = path.join(buildDir, 'kalman.js');

if (!fs.existsSync(jsPath)) {
  console.error(`Error: ${jsPath} not found.`);
  console.error('Build with: emcc mc/kalman.c -o build/kalman.js \\');
  console.error('  -s EXPORTED_FUNCTIONS=\'["_kf_predict_x","_kf_predict_p","_kf_gain","_kf_update_x","_kf_update_p","_kf_innov","_kf_innov_cov","_kf_nis","_snr_db","_comp_tau","_comp_filter"]\' \\');
  console.error('  -s EXPORTED_RUNTIME_METHODS=\'["cwrap"]\' -lm');
  process.exit(1);
}

const Module = require(jsPath);

Module.onRuntimeInitialized = () => {
  const dd  = ['number', 'number'];
  const ddd = ['number', 'number', 'number'];

  const kf_predict_x = Module.cwrap('kf_predict_x', 'number', ['number','number','number','number']);
  const kf_predict_p = Module.cwrap('kf_predict_p', 'number', ddd);
  const kf_gain      = Module.cwrap('kf_gain',      'number', ddd);
  const kf_update_x  = Module.cwrap('kf_update_x',  'number', ['number','number','number','number']);
  const kf_update_p  = Module.cwrap('kf_update_p',  'number', ddd);
  const kf_innov     = Module.cwrap('kf_innov',     'number', ddd);
  const kf_innov_cov = Module.cwrap('kf_innov_cov', 'number', ddd);
  const kf_nis       = Module.cwrap('kf_nis',       'number', ['number','number','number','number','number']);
  const snr_db       = Module.cwrap('snr_db',       'number', dd);
  const comp_tau     = Module.cwrap('comp_tau',     'number', dd);
  const comp_filter  = Module.cwrap('comp_filter',  'number', ['number','number','number','number','number']);

  const a = 1.0, b = 0.0, u = 0.0;
  const h = 1.0, q = 0.001, r = 0.5;
  let x = 15.0, p = 1.0;

  const measurements = [19.3, 20.8, 19.7, 20.5, 21.1, 19.6, 20.2, 20.9, 19.4, 20.6];

  console.log('=== Kalman Filter: Temperature Tracking (Wasm) ===');
  console.log('True temperature: 20.0 C');
  console.log();

  let lastZ = 0, lastX = 0, lastP = 0;
  for (let i = 0; i < measurements.length; i++) {
    const z     = measurements[i];
    const xPred = kf_predict_x(x, a, u, b);
    const pPred = kf_predict_p(p, a, q);
    const k     = kf_gain(pPred, h, r);
    const innov = kf_innov(z, xPred, h);
    x = kf_update_x(xPred, k, z, h);
    p = kf_update_p(pPred, k, h);
    console.log(`Step ${i+1}: z=${z.toFixed(2)}, x=${x.toFixed(4)}, k=${k.toFixed(4)}, innov=${innov.toFixed(4)}`);
    lastZ = z; lastX = x; lastP = p;
  }

  const nis = kf_nis(lastZ, lastX, h, lastP, r);
  console.log(`\nNIS (last step): ${nis.toFixed(4)}`);

  console.log('\n=== Complementary Filter (Wasm) ===');
  let prev = 0.0;
  for (let i = 0; i < 5; i++) {
    prev = comp_filter(prev, 0.1, 0.5, 0.98, 0.01);
    console.log(`Step ${i+1}: angle=${prev.toFixed(6)} rad`);
  }
};

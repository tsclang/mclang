'use strict';
const path = require('path');
const fs   = require('fs');

const buildDir = path.join(__dirname, '..', '..', 'build');
const jsPath   = path.join(buildDir, 'linear_regression.js');

if (!fs.existsSync(jsPath)) {
  console.error(`Error: ${jsPath} not found.`);
  console.error('Build with: emcc mc/linear_regression.c -o build/linear_regression.js \\');
  console.error('  -s EXPORTED_FUNCTIONS=\'["_lr_slope","_lr_intercept","_lr_predict","_r_squared","_rmse","_pearson","_xtx_inv","_xtx_det"]\' \\');
  console.error('  -s EXPORTED_RUNTIME_METHODS=\'["cwrap"]\' -lm');
  process.exit(1);
}

const Module = require(jsPath);

Module.onRuntimeInitialized = () => {
  // Array functions: Wasm needs manual heap allocation
  const xData = [50, 60, 70, 80, 90, 100, 110, 120];
  const yData = [150, 180, 210, 235, 260, 285, 310, 340];
  const n = xData.length;

  // Allocate typed arrays in Wasm memory
  const bytes = n * 8;
  const xPtr = Module._malloc(bytes);
  const yPtr = Module._malloc(bytes);
  const heapF64 = new Float64Array(Module.HEAPF64.buffer);
  for (let i = 0; i < n; i++) {
    Module.HEAPF64[(xPtr >> 3) + i] = xData[i];
    Module.HEAPF64[(yPtr >> 3) + i] = yData[i];
  }

  const lr_slope     = Module.cwrap('lr_slope',     'number', ['number','number','number','number','number']);
  const lr_intercept = Module.cwrap('lr_intercept', 'number', ['number','number','number','number','number']);
  const lr_predict   = Module.cwrap('lr_predict',   'number', ['number','number','number']);
  const r_squared    = Module.cwrap('r_squared',    'number', ['number','number','number','number','number']);
  const rmse_fn      = Module.cwrap('rmse',         'number', ['number','number','number','number','number']);
  const pearson      = Module.cwrap('pearson',      'number', ['number','number','number','number','number']);

  const slope     = lr_slope(xPtr, n, yPtr, n, n);
  const intercept = lr_intercept(xPtr, n, yPtr, n, n);
  const r2        = r_squared(xPtr, n, yPtr, n, n);
  const err_rmse  = rmse_fn(xPtr, n, yPtr, n, n);
  const r         = pearson(xPtr, n, yPtr, n, n);

  console.log('=== Linear Regression: House Prices (Wasm) ===');
  console.log(`Slope:     ${slope.toFixed(4)} k€/m²`);
  console.log(`Intercept: ${intercept.toFixed(4)} k€`);
  console.log(`R²:        ${r2.toFixed(6)}`);
  console.log(`RMSE:      ${err_rmse.toFixed(4)} k€`);
  console.log(`Pearson r: ${r.toFixed(6)}`);
  console.log(`Predict 95m²: ${lr_predict(slope, intercept, 95.0).toFixed(2)} k€`);

  Module._free(xPtr);
  Module._free(yPtr);
};

'use strict';
const path = require('path');
const fs   = require('fs');

const buildDir = path.join(__dirname, '..', '..', 'build');
const jsPath   = path.join(buildDir, 'black_scholes.js');

if (!fs.existsSync(jsPath)) {
  console.error(`Error: ${jsPath} not found.`);
  console.error('Build with emcc: see run.sh');
  process.exit(1);
}

const Module = require(jsPath);

Module.onRuntimeInitialized = () => {
  const call_price  = Module.cwrap('call_price',  'number', ['number','number','number','number','number']);
  const put_price   = Module.cwrap('put_price',   'number', ['number','number','number','number','number']);
  const call_delta  = Module.cwrap('call_delta',  'number', ['number','number','number','number','number']);
  const put_delta   = Module.cwrap('put_delta',   'number', ['number','number','number','number','number']);
  const bs_gamma    = Module.cwrap('bs_gamma',    'number', ['number','number','number','number','number']);
  const bs_vega     = Module.cwrap('bs_vega',     'number', ['number','number','number','number','number']);
  const call_theta  = Module.cwrap('call_theta',  'number', ['number','number','number','number','number']);
  const call_rho    = Module.cwrap('call_rho',    'number', ['number','number','number','number','number']);
  const put_rho     = Module.cwrap('put_rho',     'number', ['number','number','number','number','number']);

  const S = 100.0, K = 100.0, r = 0.05, sig = 0.20, T = 1.0;

  console.log('=== Black-Scholes Option Pricing (Wasm) ===');
  console.log(`S=${S}, K=${K}, r=${r}, σ=${sig}, T=${T} yr\n`);

  const cp = call_price(S, K, r, sig, T);
  const pp = put_price(S, K, r, sig, T);
  console.log(`Call price: $${cp.toFixed(4)}`);
  console.log(`Put  price: $${pp.toFixed(4)}`);
  console.log(`Put-Call parity: ${(cp - pp - S + K * Math.exp(-r * T)).toFixed(6)}\n`);

  console.log('=== Greeks ===');
  console.log(`Call Delta:  ${call_delta(S, K, r, sig, T).toFixed(4)}`);
  console.log(`Put  Delta:  ${put_delta(S, K, r, sig, T).toFixed(4)}`);
  console.log(`Gamma:        ${bs_gamma(S, K, r, sig, T).toFixed(6)}`);
  console.log(`Vega:         ${bs_vega(S, K, r, sig, T).toFixed(4)}`);
  console.log(`Call Theta:   ${call_theta(S, K, r, sig, T).toFixed(4)}`);
  console.log(`Call Rho:     ${call_rho(S, K, r, sig, T).toFixed(4)}`);
  console.log(`Put  Rho:     ${put_rho(S, K, r, sig, T).toFixed(4)}`);

  const strikes = [80, 90, 100, 110, 120];
  const vols    = [0.10, 0.20, 0.30];
  console.log('\n=== Call Price Table ===');
  for (const strike of strikes) {
    const row = vols.map(v => call_price(S, strike, r, v, T).toFixed(4)).join('  ');
    console.log(`K=${strike}: ${row}`);
  }
};

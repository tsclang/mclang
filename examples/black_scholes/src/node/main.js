'use strict';
const path = require('path');

// Native addon built with node-gyp from black_scholes_napi.c
const bs = require(path.join(__dirname, '../../mc/build/Release/black_scholes'));

const S = 100.0, K = 100.0, r = 0.05, sig = 0.20, T = 1.0;

console.log('=== Black-Scholes Option Pricing (Node native addon) ===');
console.log(`S=${S}, K=${K}, r=${r}, σ=${sig}, T=${T} yr\n`);

const cp = bs.call_price(S, K, r, sig, T);
const pp = bs.put_price(S, K, r, sig, T);
console.log(`Call price: $${cp.toFixed(4)}`);
console.log(`Put  price: $${pp.toFixed(4)}`);
console.log(`Put-Call parity check: ${(cp - pp - S + K * Math.exp(-r * T)).toFixed(6)}\n`);

console.log('=== Greeks ===');
console.log(`Call Delta:  ${bs.call_delta(S, K, r, sig, T).toFixed(4)}`);
console.log(`Put  Delta:  ${bs.put_delta(S, K, r, sig, T).toFixed(4)}`);
console.log(`Gamma:        ${bs.bs_gamma(S, K, r, sig, T).toFixed(6)}`);
console.log(`Vega:         ${bs.bs_vega(S, K, r, sig, T).toFixed(4)}`);
console.log(`Call Theta:   ${bs.call_theta(S, K, r, sig, T).toFixed(4)}`);
console.log(`Call Rho:     ${bs.call_rho(S, K, r, sig, T).toFixed(4)}`);
console.log(`Put  Rho:     ${bs.put_rho(S, K, r, sig, T).toFixed(4)}`);

const strikes = [80, 90, 100, 110, 120];
const vols    = [0.10, 0.20, 0.30];
console.log('\n=== Call Price Table ===');
console.log(`${'K'.padStart(6)}  ` + vols.map(v => `σ=${(v*100).toFixed(0)}%  `.padStart(10)).join(' '));
for (const strike of strikes) {
  const row = vols.map(v => bs.call_price(S, strike, r, v, T).toFixed(4).padStart(8)).join('  ');
  console.log(`${String(strike).padStart(6)}  ${row}`);
}

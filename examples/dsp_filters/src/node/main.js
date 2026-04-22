'use strict';
const path = require('path');

const dsp = require(path.join(__dirname, '../../mc/build/Release/dsp_filters'));

const N  = 9;
const fc = 0.2;

console.log('=== Window Coefficients (N=9) ===');
console.log(`${'tap'.padStart(4)}  ${'Hann'.padStart(10)}  ${'Hamming'.padStart(10)}  ${'Blackman'.padStart(10)}`);
for (let n = 0; n < N; n++) {
  const row = [
    dsp.hann(n, N).toFixed(6).padStart(10),
    dsp.hamming(n, N).toFixed(6).padStart(10),
    dsp.blackman(n, N).toFixed(6).padStart(10),
  ].join('  ');
  console.log(`${String(n).padStart(4)}  ${row}`);
}

console.log(`\n=== 9-tap LPF (Hann, fc=${fc}) ===`);
const h = [];
for (let n = 0; n < N; n++) {
  const v = dsp.lp_hann(n, N, fc);
  h.push(v);
  console.log(`  h[${n}] = ${v.toFixed(6)}`);
}

// Build test signal
const N_SIG = 64;
const signal = Array.from({length: N_SIG}, (_, i) =>
  Math.sin(2 * Math.PI * 0.1 * i) + Math.sin(2 * Math.PI * 0.4 * i));

const rmsIn = Math.sqrt(signal.reduce((s, x) => s + x*x, 0) / N_SIG);
console.log(`\n=== Signal Analysis ===`);
console.log(`Input RMS:  ${rmsIn.toFixed(6)}`);

// Apply FIR
const n_out = N_SIG - N + 1;
const filtered = [];
for (let i = 0; i < n_out; i++) {
  const win = signal.slice(i, i + N);
  filtered.push(dsp.fir(h, win));
}

const rmsOut = Math.sqrt(filtered.reduce((s, x) => s + x*x, 0) / n_out);
const attnDb = 20 * Math.log10(rmsOut / rmsIn);
console.log(`Output RMS: ${rmsOut.toFixed(6)}  (high-freq attenuated)`);
console.log(`Attenuation: ${attnDb.toFixed(2)} dB`);

console.log('\nFirst 12 filtered samples:');
filtered.slice(0, 12).forEach((v, i) => {
  console.log(`  y[${String(i).padStart(2)}] = ${v.toFixed(5)}`);
});

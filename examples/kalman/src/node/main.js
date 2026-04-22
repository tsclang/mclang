'use strict';
const path = require('path');

const kf = require(path.join(__dirname, '../../mc/build/Release/kalman'));

const a = 1.0, b = 0.0, u = 0.0;
const h = 1.0, q = 0.001, r = 0.5;
let x = 15.0, p = 1.0;

const measurements = [19.3, 20.8, 19.7, 20.5, 21.1, 19.6, 20.2, 20.9, 19.4, 20.6];

console.log('=== Kalman Filter: Temperature Tracking ===');
console.log('True temperature: 20.0 C');
console.log(`Initial estimate: ${x.toFixed(1)} C, p0=${p.toFixed(1)}`);
console.log();
console.log('Step   Measurement   Estimate      Gain       Innovation');
console.log('----   -----------   --------      ----       ----------');

let lastZ = 0, lastX = 0, lastP = 0;
for (let i = 0; i < measurements.length; i++) {
  const z     = measurements[i];
  const xPred = kf.kf_predict_x(x, a, u, b);
  const pPred = kf.kf_predict_p(p, a, q);
  const k     = kf.kf_gain(pPred, h, r);
  const innov = kf.kf_innov(z, xPred, h);
  x = kf.kf_update_x(xPred, k, z, h);
  p = kf.kf_update_p(pPred, k, h);
  console.log(
    `${String(i + 1).padStart(4)}   ${z.toFixed(4).padEnd(13)} ${x.toFixed(4).padEnd(13)} ${k.toFixed(4).padEnd(10)} ${innov.toFixed(4)}`
  );
  lastZ = z; lastX = x; lastP = p;
}

const nis = kf.kf_nis(lastZ, lastX, h, lastP, r);
console.log(`\nNIS (last step): ${nis.toFixed(4)}`);

console.log('\n=== Complementary Filter (IMU fusion) ===');
let prev = 0.0;
const gyro_rate = 0.1, accel_angle = 0.5, alpha = 0.98, dt = 0.01;
console.log(`gyro_rate=${gyro_rate} rad/s, accel=${accel_angle} rad, alpha=${alpha}, dt=${dt} s\n`);
console.log('Step   Angle (rad)');
console.log('----   -----------');
for (let i = 0; i < 5; i++) {
  prev = kf.comp_filter(prev, gyro_rate, accel_angle, alpha, dt);
  console.log(`${String(i + 1).padStart(4)}   ${prev.toFixed(6)}`);
}
const tau = kf.comp_tau(dt, 1.0);
console.log(`\nalpha from comp_tau(dt=${dt}, T=1.0): ${tau.toFixed(4)}`);

'use strict';
const path = require('path');
const pid  = require(path.join(__dirname, '../../mc/build/Release/pid_control'));

const Kp = 2.0, Ki = 1.0, Kd = 0.1, dt = 0.05, r = 1.0;
let y = 0, integral = 0, e_prev = r - y;

console.log('=== PID Step-Response (Node native addon) ===');
console.log(`Kp=${Kp}  Ki=${Ki}  Kd=${Kd}  dt=${dt} s  setpoint=${r}\n`);

for (let step = 0; step <= 120; step++) {
  const e = r - y;
  integral = pid.pid_integral_clamped(Ki, e_prev, e, integral, dt, -2.0, 2.0);
  let u = pid.pid_out(Kp, Ki, Kd, e, e_prev, integral, dt);
  u = Math.max(-5, Math.min(5, u));
  y += (u - y) * dt;
  e_prev = e;
  if (step % 10 === 0)
    console.log(`t=${(step*dt).toFixed(2)}s  y=${y.toFixed(4)}  e=${e.toFixed(4)}  u=${u.toFixed(4)}`);
}

console.log(`\nZN: Kp=${pid.zn_kp(4).toFixed(3)}  Ki=${pid.zn_ki(4,0.8).toFixed(3)}  Kd=${pid.zn_kd(4,0.8).toFixed(3)}`);

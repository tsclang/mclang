'use strict';
const path = require('path');
const fs   = require('fs');

const buildDir = path.join(__dirname, '..', '..', 'build');
const jsPath   = path.join(buildDir, 'pid_control.js');

if (!fs.existsSync(jsPath)) {
  console.error(`Error: ${jsPath} not found.`);
  process.exit(1);
}

const Module = require(jsPath);

Module.onRuntimeInitialized = () => {
  const pid_p                = Module.cwrap('pid_p',                'number', Array(2).fill('number'));
  const pid_i_step           = Module.cwrap('pid_i_step',           'number', Array(4).fill('number'));
  const pid_out              = Module.cwrap('pid_out',              'number', Array(7).fill('number'));
  const pid_integral_clamped = Module.cwrap('pid_integral_clamped', 'number', Array(7).fill('number'));
  const zn_kp                = Module.cwrap('zn_kp', 'number', ['number']);
  const zn_ki                = Module.cwrap('zn_ki', 'number', Array(2).fill('number'));
  const zn_kd                = Module.cwrap('zn_kd', 'number', Array(2).fill('number'));

  const Kp = 2.0, Ki = 1.0, Kd = 0.1, dt = 0.05, r = 1.0;
  let y = 0, integral = 0, e_prev = r - y;

  console.log('=== PID Step-Response (Wasm) ===');
  console.log(`Kp=${Kp}  Ki=${Ki}  Kd=${Kd}  dt=${dt} s  setpoint=${r}\n`);
  console.log('t(s)     y         e         u         integral');
  console.log('-'.repeat(55));

  for (let step = 0; step <= 120; step++) {
    const t = step * dt;
    const e = r - y;
    integral = pid_integral_clamped(Ki, e_prev, e, integral, dt, -2.0, 2.0);
    let u = pid_out(Kp, Ki, Kd, e, e_prev, integral, dt);
    u = Math.max(-5, Math.min(5, u));
    y += (u - y) / 1.0 * dt;
    e_prev = e;
    if (step % 10 === 0)
      console.log(`${t.toFixed(2).padEnd(8)} ${y.toFixed(4).padEnd(10)} ${e.toFixed(4).padEnd(10)} ${u.toFixed(4).padEnd(10)} ${integral.toFixed(4)}`);
  }

  console.log('\n=== Ziegler-Nichols (Ku=4, Pu=0.8) ===');
  console.log(`Kp=${zn_kp(4).toFixed(3)}  Ki=${zn_ki(4, 0.8).toFixed(3)}  Kd=${zn_kd(4, 0.8).toFixed(3)}`);
};

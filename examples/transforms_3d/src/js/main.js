'use strict';
const path = require('path');
const fs   = require('fs');

const buildDir = path.join(__dirname, '..', '..', 'build');
const jsPath   = path.join(buildDir, 'transforms_3d.js');

if (!fs.existsSync(jsPath)) {
  console.error(`Error: ${jsPath} not found.`);
  console.error('Build with: emcc mc/transforms_3d.c -o build/transforms_3d.js \\');
  console.error('  -s EXPORTED_FUNCTIONS=\'["_euler_w","_euler_x","_euler_y","_euler_z","_qnorm","_qmul_w","_qmul_x","_qmul_y","_qmul_z","_axisangle_w","_axisangle_x","_axisangle_y","_axisangle_z","_rot_vx","_rot_vy","_rot_vz","_qdist","_rmat_00","_rmat_11","_rmat_22","_slerp_w","_slerp_x","_slerp_y","_slerp_z"]\' \\');
  console.error('  -s EXPORTED_RUNTIME_METHODS=\'["cwrap"]\' -lm');
  process.exit(1);
}

const Module = require(jsPath);

Module.onRuntimeInitialized = () => {
  const d3 = ['number','number','number'];
  const d4 = ['number','number','number','number'];
  const d7 = ['number','number','number','number','number','number','number'];
  const d8 = ['number','number','number','number','number','number','number','number'];
  const d9 = [...d8, 'number'];

  const euler_w     = Module.cwrap('euler_w',     'number', d3);
  const euler_x     = Module.cwrap('euler_x',     'number', d3);
  const euler_y     = Module.cwrap('euler_y',     'number', d3);
  const euler_z     = Module.cwrap('euler_z',     'number', d3);
  const qnorm       = Module.cwrap('qnorm',       'number', d4);
  const axisangle_w = Module.cwrap('axisangle_w', 'number', d4);
  const axisangle_x = Module.cwrap('axisangle_x', 'number', d4);
  const axisangle_y = Module.cwrap('axisangle_y', 'number', d4);
  const axisangle_z = Module.cwrap('axisangle_z', 'number', d4);
  const rot_vx      = Module.cwrap('rot_vx',      'number', d7);
  const rot_vy      = Module.cwrap('rot_vy',      'number', d7);
  const rot_vz      = Module.cwrap('rot_vz',      'number', d7);
  const qmul_w      = Module.cwrap('qmul_w',      'number', d8);
  const qmul_x      = Module.cwrap('qmul_x',      'number', d8);
  const qmul_y      = Module.cwrap('qmul_y',      'number', d8);
  const qmul_z      = Module.cwrap('qmul_z',      'number', d8);
  const qdist       = Module.cwrap('qdist',       'number', d8);
  const slerp_w     = Module.cwrap('slerp_w',     'number', d9);
  const slerp_x     = Module.cwrap('slerp_x',     'number', d9);
  const slerp_y     = Module.cwrap('slerp_y',     'number', d9);
  const slerp_z     = Module.cwrap('slerp_z',     'number', d9);

  const DEG = Math.PI / 180.0;
  const yaw = 45*DEG, pitch = 30*DEG, roll = 10*DEG;
  const ew = euler_w(yaw,pitch,roll), ex = euler_x(yaw,pitch,roll);
  const ey = euler_y(yaw,pitch,roll), ez = euler_z(yaw,pitch,roll);

  console.log('=== Transforms 3D (Wasm) ===');
  console.log(`Euler 45°/30°/10° → Q: (w=${ew.toFixed(6)}, x=${ex.toFixed(6)}, y=${ey.toFixed(6)}, z=${ez.toFixed(6)})`);
  console.log(`norm: ${qnorm(ew,ex,ey,ez).toFixed(8)}`);

  // Rotate (1,0,0) by 90° around Z
  const qz90w = axisangle_w(0,0,1,Math.PI/2);
  const qz90x = axisangle_x(0,0,1,Math.PI/2);
  const qz90y = axisangle_y(0,0,1,Math.PI/2);
  const qz90z = axisangle_z(0,0,1,Math.PI/2);
  const rvx = rot_vx(qz90w,qz90x,qz90y,qz90z,1,0,0);
  const rvy = rot_vy(qz90w,qz90x,qz90y,qz90z,1,0,0);
  const rvz = rot_vz(qz90w,qz90x,qz90y,qz90z,1,0,0);
  console.log(`\nRotate (1,0,0) by 90° around Z: (${rvx.toFixed(6)}, ${rvy.toFixed(6)}, ${rvz.toFixed(6)})`);

  // SLERP
  console.log('\nSLERP identity → 180° around Z:');
  for (const t of [0.0, 0.25, 0.5, 0.75, 1.0]) {
    const sw = slerp_w(1,0,0,0, 0,0,0,1, t);
    const sx = slerp_x(1,0,0,0, 0,0,0,1, t);
    const sy = slerp_y(1,0,0,0, 0,0,0,1, t);
    const sz = slerp_z(1,0,0,0, 0,0,0,1, t);
    console.log(`  t=${t.toFixed(2)}: w=${sw.toFixed(6)}, x=${sx.toFixed(6)}, y=${sy.toFixed(6)}, z=${sz.toFixed(6)}`);
  }

  // Angular distance
  const q60w = axisangle_w(0,0,1,60*DEG);
  const q60x = axisangle_x(0,0,1,60*DEG);
  const q60y = axisangle_y(0,0,1,60*DEG);
  const q60z = axisangle_z(0,0,1,60*DEG);
  const dist = qdist(1,0,0,0, q60w,q60x,q60y,q60z);
  console.log(`\nAngular distance identity vs 60°: ${dist.toFixed(6)} rad = ${(dist*180/Math.PI).toFixed(4)}°`);
};

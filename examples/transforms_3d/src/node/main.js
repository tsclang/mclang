'use strict';
const path = require('path');

const t3d = require(path.join(__dirname, '../../mc/build/Release/transforms_3d'));

const DEG = Math.PI / 180.0;

// 1. Euler → quaternion
const yaw = 45 * DEG, pitch = 30 * DEG, roll = 10 * DEG;
const ew = t3d.euler_w(yaw, pitch, roll);
const ex = t3d.euler_x(yaw, pitch, roll);
const ey = t3d.euler_y(yaw, pitch, roll);
const ez = t3d.euler_z(yaw, pitch, roll);
const enorm = t3d.qnorm(ew, ex, ey, ez);

console.log('=== 1. Euler ZYX → Quaternion ===');
console.log('Euler: yaw=45°, pitch=30°, roll=10°');
console.log(`Q: (w=${ew.toFixed(6)}, x=${ex.toFixed(6)}, y=${ey.toFixed(6)}, z=${ez.toFixed(6)})`);
console.log(`norm: ${enorm.toFixed(8)} (should be 1.0)\n`);

// 2. Rotate (1,0,0) by 90° around Z
const qz90w = t3d.axisangle_w(0, 0, 1, Math.PI / 2);
const qz90x = t3d.axisangle_x(0, 0, 1, Math.PI / 2);
const qz90y = t3d.axisangle_y(0, 0, 1, Math.PI / 2);
const qz90z = t3d.axisangle_z(0, 0, 1, Math.PI / 2);
const rvx = t3d.rot_vx(qz90w, qz90x, qz90y, qz90z, 1, 0, 0);
const rvy = t3d.rot_vy(qz90w, qz90x, qz90y, qz90z, 1, 0, 0);
const rvz = t3d.rot_vz(qz90w, qz90x, qz90y, qz90z, 1, 0, 0);
console.log('=== 2. Rotate (1,0,0) by 90° around Z ===');
console.log(`Rotated: (${rvx.toFixed(6)}, ${rvy.toFixed(6)}, ${rvz.toFixed(6)})`);
console.log('(should be approx (0, 1, 0))\n');

// 3. Compose Q1=90°X, Q2=90°Y
const q1w = t3d.axisangle_w(1, 0, 0, Math.PI / 2);
const q1x = t3d.axisangle_x(1, 0, 0, Math.PI / 2);
const q1y = t3d.axisangle_y(1, 0, 0, Math.PI / 2);
const q1z = t3d.axisangle_z(1, 0, 0, Math.PI / 2);
const q2w = t3d.axisangle_w(0, 1, 0, Math.PI / 2);
const q2x = t3d.axisangle_x(0, 1, 0, Math.PI / 2);
const q2y = t3d.axisangle_y(0, 1, 0, Math.PI / 2);
const q2z = t3d.axisangle_z(0, 1, 0, Math.PI / 2);
const qcw = t3d.qmul_w(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z);
const qcx = t3d.qmul_x(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z);
const qcy = t3d.qmul_y(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z);
const qcz = t3d.qmul_z(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z);
const v2x = t3d.rot_vx(qcw, qcx, qcy, qcz, 0, 0, 1);
const v2y = t3d.rot_vy(qcw, qcx, qcy, qcz, 0, 0, 1);
const v2z = t3d.rot_vz(qcw, qcx, qcy, qcz, 0, 0, 1);
console.log('=== 3. Composed Rotation Q2*Q1 ===');
console.log(`Q_composed: (w=${qcw.toFixed(6)}, x=${qcx.toFixed(6)}, y=${qcy.toFixed(6)}, z=${qcz.toFixed(6)})`);
console.log(`Rotated (0,0,1): (${v2x.toFixed(6)}, ${v2y.toFixed(6)}, ${v2z.toFixed(6)})`);
const r = [
  [t3d.rmat_00(qcw,qcx,qcy,qcz), t3d.rmat_01(qcw,qcx,qcy,qcz), t3d.rmat_02(qcw,qcx,qcy,qcz)],
  [t3d.rmat_10(qcw,qcx,qcy,qcz), t3d.rmat_11(qcw,qcx,qcy,qcz), t3d.rmat_12(qcw,qcx,qcy,qcz)],
  [t3d.rmat_20(qcw,qcx,qcy,qcz), t3d.rmat_21(qcw,qcx,qcy,qcz), t3d.rmat_22(qcw,qcx,qcy,qcz)],
];
console.log('Rotation matrix:');
for (const row of r) console.log(`  [ ${row.map(v => v.toFixed(5).padStart(8)).join('  ')} ]`);
console.log();

// 4. SLERP
console.log('=== 4. SLERP: identity → 180° around Z ===');
console.log('t       w          x          y          z');
console.log('------  ---------  ---------  ---------  ---------');
const si_w=1,si_x=0,si_y=0,si_z=0;
const sq_w=0,sq_x=0,sq_y=0,sq_z=1;
for (const t of [0.0, 0.25, 0.5, 0.75, 1.0]) {
  const sw = t3d.slerp_w(si_w,si_x,si_y,si_z, sq_w,sq_x,sq_y,sq_z, t);
  const sx = t3d.slerp_x(si_w,si_x,si_y,si_z, sq_w,sq_x,sq_y,sq_z, t);
  const sy = t3d.slerp_y(si_w,si_x,si_y,si_z, sq_w,sq_x,sq_y,sq_z, t);
  const sz = t3d.slerp_z(si_w,si_x,si_y,si_z, sq_w,sq_x,sq_y,sq_z, t);
  console.log(`${t.toFixed(2).padEnd(7)} ${sw.toFixed(6).padEnd(10)} ${sx.toFixed(6).padEnd(10)} ${sy.toFixed(6).padEnd(10)} ${sz.toFixed(6)}`);
}

// 5. Angular distance
console.log('\n=== 5. Angular Distance ===');
const q60w = t3d.axisangle_w(0, 0, 1, 60 * DEG);
const q60x = t3d.axisangle_x(0, 0, 1, 60 * DEG);
const q60y = t3d.axisangle_y(0, 0, 1, 60 * DEG);
const q60z = t3d.axisangle_z(0, 0, 1, 60 * DEG);
const dist = t3d.qdist(1, 0, 0, 0, q60w, q60x, q60y, q60z);
console.log(`Angular distance (identity vs 60° around Z): ${dist.toFixed(6)} rad = ${(dist * 180 / Math.PI).toFixed(4)}°`);

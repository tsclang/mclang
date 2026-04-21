'use strict';
const path = require('path');

// Native addon built with node-gyp from ballistics_napi.c
const b = require(path.join(__dirname, '../../mc/build/Release/ballistics'));

const v0    = 50.0;
const angle = Math.PI / 4.0;

console.log(`Projectile: v0=${v0.toFixed(1)} m/s, angle=45°`);
console.log(`  Range:          ${b.range(v0, angle).toFixed(2)} m`);
console.log(`  Max height:     ${b.max_height(v0, angle).toFixed(2)} m`);
console.log(`  Time of flight: ${b.time_of_flight(v0, angle).toFixed(2)} s`);
console.log(`  Height at x=50: ${b.height_at(v0, angle, 50.0).toFixed(2)} m`);

console.log();
console.log('Range vs angle (v0=50 m/s):');
for (let deg = 15; deg <= 75; deg += 15) {
  const a = deg * Math.PI / 180.0;
  console.log(`  ${String(deg).padStart(2)}° → ${b.range(v0, a).toFixed(2)} m`);
}

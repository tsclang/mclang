'use strict';
const path = require('path');
const fs   = require('fs');

const buildDir = path.join(__dirname, '..', '..', 'build');
const jsPath   = path.join(buildDir, 'ballistics.js');

if (!fs.existsSync(jsPath)) {
  console.error(`Error: ${jsPath} not found.`);
  console.error('Build with: emcc mc/ballistics.c -o build/ballistics.js \\');
  console.error('  -s EXPORTED_FUNCTIONS=\'["_range","_max_height","_time_of_flight","_height_at"]\' \\');
  console.error('  -s EXPORTED_RUNTIME_METHODS=\'["cwrap"]\' -lm');
  process.exit(1);
}

// Emscripten module is CommonJS — load and wait for runtime ready
const Module = require(jsPath);

Module.onRuntimeInitialized = () => {
  const range          = Module.cwrap('range',          'number', ['number', 'number']);
  const max_height     = Module.cwrap('max_height',     'number', ['number', 'number']);
  const time_of_flight = Module.cwrap('time_of_flight', 'number', ['number', 'number']);
  const height_at      = Module.cwrap('height_at',      'number', ['number', 'number', 'number']);

  const v0    = 50.0;
  const angle = Math.PI / 4.0;

  console.log(`Projectile: v0=${v0.toFixed(1)} m/s, angle=45°`);
  console.log(`  Range:          ${range(v0, angle).toFixed(2)} m`);
  console.log(`  Max height:     ${max_height(v0, angle).toFixed(2)} m`);
  console.log(`  Time of flight: ${time_of_flight(v0, angle).toFixed(2)} s`);
  console.log(`  Height at x=50: ${height_at(v0, angle, 50.0).toFixed(2)} m`);

  console.log();
  console.log('Range vs angle (v0=50 m/s):');
  for (let deg = 15; deg <= 75; deg += 15) {
    const a = deg * Math.PI / 180.0;
    console.log(`  ${String(deg).padStart(2)}° → ${range(v0, a).toFixed(2)} m`);
  }
};

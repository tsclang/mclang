'use strict';
const path = require('path');
const fs   = require('fs');

const buildDir = path.join(__dirname, '..', '..', 'build');
const jsPath   = path.join(buildDir, 'geodesy.js');

if (!fs.existsSync(jsPath)) {
  console.error(`Error: ${jsPath} not found.`);
  process.exit(1);
}

const Module = require(jsPath);

Module.onRuntimeInitialized = () => {
  const n1 = ['number'], n4 = Array(4).fill('number'), n6 = Array(6).fill('number');
  const haversine      = Module.cwrap('haversine',      'number', n4);
  const bearing        = Module.cwrap('bearing',        'number', n4);
  const normal_radius  = Module.cwrap('normal_radius',  'number', n1);
  const meridian_radius= Module.cwrap('meridian_radius','number', n1);
  const ecef_x         = Module.cwrap('ecef_x',        'number', Array(3).fill('number'));
  const ecef_y         = Module.cwrap('ecef_y',        'number', Array(3).fill('number'));
  const ecef_z         = Module.cwrap('ecef_z',        'number', Array(3).fill('number'));
  const cross_track    = Module.cwrap('cross_track',   'number', n6);
  const along_track    = Module.cwrap('along_track',   'number', n6);

  const DEG = Math.PI / 180;
  const RAD = 180 / Math.PI;
  const lat_msk = 55.7558 * DEG, lon_msk = 37.6173 * DEG;
  const lat_lon = 51.5074 * DEG, lon_lon = -0.1278 * DEG;

  console.log('=== Geodesy (Wasm) ===');
  const dist = haversine(lat_msk, lon_msk, lat_lon, lon_lon);
  const brng = bearing(lat_msk, lon_msk, lat_lon, lon_lon);
  console.log(`Haversine Moscow→London: ${(dist/1000).toFixed(1)} km`);
  console.log(`Initial bearing:         ${(brng * RAD).toFixed(2)}°\n`);

  const h = 150;
  console.log(`ECEF Moscow (h=${h} m):`);
  console.log(`  X = ${ecef_x(lat_msk, lon_msk, h).toFixed(1)} m`);
  console.log(`  Y = ${ecef_y(lat_msk, lon_msk, h).toFixed(1)} m`);
  console.log(`  Z = ${ecef_z(lat_msk, lon_msk, h).toFixed(1)} m\n`);

  const lat_hel = 60.1699 * DEG, lon_hel = 24.9384 * DEG;
  const xtd = cross_track(lat_msk, lon_msk, lat_lon, lon_lon, lat_hel, lon_hel);
  const atd = along_track(lat_msk, lon_msk, lat_lon, lon_lon, lat_hel, lon_hel);
  console.log('Helsinki relative to Moscow→London GC:');
  console.log(`  Cross-track: ${(Math.abs(xtd)/1000).toFixed(1)} km (${xtd >= 0 ? 'right' : 'left'})`);
  console.log(`  Along-track: ${(atd/1000).toFixed(1)} km`);
};

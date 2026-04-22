'use strict';
const path = require('path');
const geo  = require(path.join(__dirname, '../../mc/build/Release/geodesy'));

const DEG = Math.PI / 180, RAD = 180 / Math.PI;
const lat_msk = 55.7558 * DEG, lon_msk = 37.6173 * DEG;
const lat_lon = 51.5074 * DEG, lon_lon = -0.1278 * DEG;

console.log('=== Geodesy (Node native addon) ===');
const dist = geo.haversine(lat_msk, lon_msk, lat_lon, lon_lon);
const brng = geo.bearing(lat_msk, lon_msk, lat_lon, lon_lon);
console.log(`Haversine Moscow→London: ${(dist/1000).toFixed(1)} km`);
console.log(`Initial bearing:         ${(brng * RAD).toFixed(2)}°\n`);

const h = 150;
console.log(`ECEF Moscow (h=${h} m):`);
console.log(`  X = ${geo.ecef_x(lat_msk, lon_msk, h).toFixed(1)} m`);
console.log(`  Y = ${geo.ecef_y(lat_msk, lon_msk, h).toFixed(1)} m`);
console.log(`  Z = ${geo.ecef_z(lat_msk, lon_msk, h).toFixed(1)} m\n`);

const lat_hel = 60.1699 * DEG, lon_hel = 24.9384 * DEG;
const xtd = geo.cross_track(lat_msk, lon_msk, lat_lon, lon_lon, lat_hel, lon_hel);
const atd = geo.along_track(lat_msk, lon_msk, lat_lon, lon_lon, lat_hel, lon_hel);
console.log(`Helsinki cross-track: ${(Math.abs(xtd)/1000).toFixed(1)} km (${xtd >= 0 ? 'right' : 'left'})`);
console.log(`Helsinki along-track: ${(atd/1000).toFixed(1)} km`);

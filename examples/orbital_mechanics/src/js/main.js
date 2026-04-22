'use strict';
const path = require('path');
const fs   = require('fs');

const buildDir = path.join(__dirname, '..', '..', 'build');
const jsPath   = path.join(buildDir, 'orbital_mechanics.js');

if (!fs.existsSync(jsPath)) {
  console.error(`Error: ${jsPath} not found. Build with emcc — see run.sh`);
  process.exit(1);
}

const Module = require(jsPath);

Module.onRuntimeInitialized = () => {
  const vis_viva         = Module.cwrap('vis_viva',         'number', ['number', 'number']);
  const period_fn        = Module.cwrap('period',           'number', ['number']);
  const ecc_anomaly      = Module.cwrap('ecc_anomaly',      'number', ['number', 'number']);
  const true_anomaly     = Module.cwrap('true_anomaly',     'number', ['number', 'number']);
  const orbit_radius     = Module.cwrap('orbit_radius',     'number', ['number', 'number', 'number']);
  const v_circular       = Module.cwrap('v_circular',       'number', ['number']);
  const v_escape         = Module.cwrap('v_escape',         'number', ['number']);
  const dv1_hohmann      = Module.cwrap('dv1_hohmann',      'number', ['number', 'number']);
  const dv2_hohmann      = Module.cwrap('dv2_hohmann',      'number', ['number', 'number']);
  const dv_total_hohmann = Module.cwrap('dv_total_hohmann', 'number', ['number', 'number']);

  const PI   = Math.PI;
  const a_iss = 6371000 + 408000;
  const T_iss = period_fn(a_iss);

  console.log('=== ISS Orbital Parameters [Wasm] ===');
  console.log(`Orbital period:  ${(T_iss/60).toFixed(2)} min  (${(T_iss/3600).toFixed(2)} hr)`);
  console.log(`Circular speed:  ${(v_circular(a_iss)/1000).toFixed(4)} km/s`);
  console.log(`Escape speed:    ${(v_escape(a_iss)/1000).toFixed(4)} km/s\n`);

  const E_anom = ecc_anomaly(PI / 4, 0.1);
  const nu     = true_anomaly(E_anom, 0.1);
  console.log("=== Kepler's Equation (e=0.1, M=π/4) ===");
  console.log(`Eccentric anomaly: ${E_anom.toFixed(6)} rad  (${(E_anom*180/PI).toFixed(2)}°)`);
  console.log(`True anomaly:      ${nu.toFixed(6)} rad  (${(nu*180/PI).toFixed(2)}°)\n`);

  const r_leo = 6779000, r_geo = 42164000;
  const dvt   = dv_total_hohmann(r_leo, r_geo);
  const T_tr  = period_fn((r_leo + r_geo) / 2);
  console.log('=== Hohmann Transfer: LEO → GEO [Wasm] ===');
  console.log(`Δv₁:  ${(dv1_hohmann(r_leo, r_geo)/1000).toFixed(4)} km/s`);
  console.log(`Δv₂:  ${(dv2_hohmann(r_leo, r_geo)/1000).toFixed(4)} km/s`);
  console.log(`Total: ${(dvt/1000).toFixed(4)} km/s`);
  console.log(`Transfer time: ${(T_tr/2/3600).toFixed(2)} hr`);
};

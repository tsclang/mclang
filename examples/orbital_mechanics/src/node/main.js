'use strict';
const path = require('path');

const orb = require(path.join(__dirname, '../../mc/build/Release/orbital_mechanics'));

const PI = Math.PI;

// 1. ISS
const a_iss = 6371000 + 408000;
const T_iss = orb.period(a_iss);
console.log('=== ISS Orbital Parameters ===');
console.log(`Semi-major axis: ${(a_iss/1000).toFixed(0)} km`);
console.log(`Orbital period:  ${(T_iss/60).toFixed(2)} min  (${(T_iss/3600).toFixed(2)} hr)`);
console.log(`Circular speed:  ${(orb.v_circular(a_iss)/1000).toFixed(4)} km/s`);
console.log(`Escape speed:    ${(orb.v_escape(a_iss)/1000).toFixed(4)} km/s`);
console.log(`Vis-viva (circ): ${(orb.vis_viva(a_iss, a_iss)/1000).toFixed(4)} km/s\n`);

// 2. Kepler
const M_anom = PI / 4;
const ecc    = 0.1;
const E_anom = orb.ecc_anomaly(M_anom, ecc);
const nu     = orb.true_anomaly(E_anom, ecc);
console.log("=== Kepler's Equation (e=0.1, M=π/4) ===");
console.log(`Eccentric anomaly E: ${E_anom.toFixed(6)} rad  (${(E_anom*180/PI).toFixed(2)}°)`);
console.log(`True anomaly ν:      ${nu.toFixed(6)} rad  (${(nu*180/PI).toFixed(2)}°)`);
console.log(`Verification: ${(E_anom - ecc*Math.sin(E_anom)).toFixed(8)} (expect ${M_anom.toFixed(8)})\n`);

// 3. Orbital positions
const a_orbit = 7000000;
const e_orbit = 0.05;
console.log(`=== Orbital Positions (a=7000 km, e=${e_orbit}) ===`);
for (let k = 0; k < 8; k++) {
  const nu_k = k * PI / 4;
  const r_k  = orb.orbit_radius(a_orbit, e_orbit, nu_k);
  const x_k  = orb.orbit_x(a_orbit, e_orbit, nu_k);
  const y_k  = orb.orbit_y(a_orbit, e_orbit, nu_k);
  const v_k  = orb.vis_viva(r_k, a_orbit);
  console.log(`  ν=${String(Math.round(nu_k*180/PI)).padStart(4)}°  r=${(r_k/1000).toFixed(2).padStart(9)} km  v=${(v_k/1000).toFixed(4)} km/s`);
}

// 4. Hohmann
const r_leo = 6779000;
const r_geo = 42164000;
const dv1   = orb.dv1_hohmann(r_leo, r_geo);
const dv2   = orb.dv2_hohmann(r_leo, r_geo);
const dvt   = orb.dv_total_hohmann(r_leo, r_geo);
const T_tr  = orb.period((r_leo + r_geo) / 2);
console.log('\n=== Hohmann Transfer: LEO → GEO ===');
console.log(`Δv₁ (LEO burn):  ${(dv1/1000).toFixed(4)} km/s`);
console.log(`Δv₂ (GEO circ):  ${(dv2/1000).toFixed(4)} km/s`);
console.log(`Δv total:         ${(dvt/1000).toFixed(4)} km/s`);
console.log(`Transfer time:    ${(T_tr/2/3600).toFixed(2)} hr`);

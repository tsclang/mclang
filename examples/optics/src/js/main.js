const Module = require('../../mc/optics.js');
Module.onRuntimeInitialized = () => {
  const brewster_angle  = Module.cwrap('brewster_angle',  'number', ['number','number']);
  const critical_angle  = Module.cwrap('critical_angle',  'number', ['number','number']);
  const young_fringe_spacing = Module.cwrap('young_fringe_spacing', 'number', ['number','number','number']);
  const finesse         = Module.cwrap('finesse',         'number', ['number']);
  const fsr             = Module.cwrap('fsr',             'number', ['number','number','number']);
  const rayleigh_angle  = Module.cwrap('rayleigh_angle',  'number', ['number','number']);

  const lam = 550e-9;
  console.log(`Brewster angle (air→glass): ${(brewster_angle(1.0, 1.5) * 180/Math.PI).toFixed(2)}°`);
  console.log(`Critical angle (glass→air): ${(critical_angle(1.5, 1.0) * 180/Math.PI).toFixed(2)}°`);
  console.log(`Fringe spacing (d=0.5mm):   ${(young_fringe_spacing(lam, 1.0, 0.5e-3) * 1e3).toFixed(3)} mm`);
  console.log(`Fabry-Pérot finesse (R=0.9): ${finesse(0.9).toFixed(1)}`);
  console.log(`FSR (n=1.5, d=1mm):         ${(fsr(lam, 1.5, 1e-3) * 1e12).toFixed(3)} pm`);
  console.log(`Rayleigh angle (D=100mm):   ${(rayleigh_angle(lam, 0.1) * 1e6).toFixed(4)} μrad`);
};

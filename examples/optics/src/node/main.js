const optics = require('../../mc/build/Release/optics.node');
const lam = 550e-9;
console.log(`Brewster angle:  ${(optics.brewster_angle(1.0, 1.5) * 180/Math.PI).toFixed(2)}°`);
console.log(`Critical angle:  ${(optics.critical_angle(1.5, 1.0) * 180/Math.PI).toFixed(2)}°`);
console.log(`Fringe spacing:  ${(optics.young_fringe_spacing(lam, 1.0, 0.5e-3) * 1e3).toFixed(3)} mm`);
console.log(`Finesse (R=0.9): ${optics.finesse(0.9).toFixed(1)}`);
console.log(`FSR:             ${(optics.fsr(lam, 1.5, 1e-3) * 1e12).toFixed(3)} pm`);

'use strict';
const path = require('path');

const lr = require(path.join(__dirname, '../../mc/build/Release/linear_regression'));

const xData = [50, 60, 70, 80, 90, 100, 110, 120];
const yData = [150, 180, 210, 235, 260, 285, 310, 340];
const n = xData.length;

const slope     = lr.lr_slope(xData, yData, n);
const intercept = lr.lr_intercept(xData, yData, n);
const r2        = lr.r_squared(xData, yData, n);
const errRmse   = lr.rmse(xData, yData, n);
const r         = lr.pearson(xData, yData, n);

console.log('=== Linear Regression: House Prices ===');
console.log(`Data: area (m²) vs price (k€), n=${n}\n`);
console.log(`Slope:         ${slope.toFixed(4)} k€/m²`);
console.log(`Intercept:     ${intercept.toFixed(4)} k€`);
console.log(`R²:            ${r2.toFixed(6)}`);
console.log(`RMSE:          ${errRmse.toFixed(4)} k€`);
console.log(`Pearson r:     ${r.toFixed(6)}`);
console.log(`\nPrediction for 95 m²: ${lr.lr_predict(slope, intercept, 95.0).toFixed(2)} k€`);

console.log('\n=== Residuals ===');
console.log('Area      Price     Predicted   Residual');
console.log('------    -----     ---------   --------');
for (let i = 0; i < n; i++) {
  const pred  = lr.lr_predict(slope, intercept, xData[i]);
  const resid = yData[i] - pred;
  console.log(`${String(xData[i]).padEnd(9)} ${String(yData[i]).padEnd(9)} ${pred.toFixed(4).padEnd(11)} ${resid.toFixed(4)}`);
}

// Matrix normal equations
const sumX  = xData.reduce((a, v) => a + v, 0);
const sumX2 = xData.reduce((a, v) => a + v * v, 0);
const sumY  = yData.reduce((a, v) => a + v, 0);
const sumXY = xData.reduce((a, v, i) => a + v * yData[i], 0);

const XtX = [n, sumX, sumX, sumX2];
const detVal = lr.xtx_det(XtX, 2, 2);
const invMat = lr.xtx_inv(XtX, 2, 2);

console.log("\n=== Matrix Normal Equations (X'X) ===");
console.log(`X'X = [[${n}, ${sumX}], [${sumX}, ${sumX2}]]`);
console.log(`det(X'X) = ${detVal.toFixed(2)}`);
console.log(`(X'X)^-1 = [[${invMat[0].toFixed(6)}, ${invMat[1].toFixed(6)}], [${invMat[2].toFixed(6)}, ${invMat[3].toFixed(6)}]]`);

const beta0 = invMat[0]*sumY + invMat[1]*sumXY;
const beta1 = invMat[2]*sumY + invMat[3]*sumXY;
console.log(`Coefficients: intercept=${beta0.toFixed(4)}, slope=${beta1.toFixed(4)}`);

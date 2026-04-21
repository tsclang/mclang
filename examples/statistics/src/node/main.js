'use strict';
const path = require('path');

const s = require(path.join(__dirname, '../../mc/build/Release/statistics'));

const rawData = new Float64Array([2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0]);

// N-API wrapper gets array length from the TypedArray — no explicit n needed
console.log('Data: [2, 4, 4, 4, 5, 5, 7, 9]');
console.log(`  Mean:    ${s.avg(rawData).toFixed(4)}`);
console.log(`  Std dev: ${s.spread(rawData).toFixed(4)}`);
console.log(`  CV:      ${s.cv(rawData).toFixed(2)}%`);
console.log(`  Range:   ${s.data_range(rawData).toFixed(1)}`);

console.log('\nZ-scores:');
for (const x of rawData) {
  console.log(`  ${x} → z=${s.z_score(rawData, x).toFixed(4)}`);
}

console.log('\nNormalized:');
for (const x of rawData) {
  console.log(`  ${x} → ${s.normalize(rawData, x).toFixed(4)}`);
}

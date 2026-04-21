'use strict';
const path = require('path');

const nt = require(path.join(__dirname, '../../mc/build/Release/number_theory'));

console.log('GCD / LCM:');
console.log(`  gcd(48, 18) = ${nt.gcd(48, 18)}`);
console.log(`  gcd(100, 75) = ${nt.gcd(100, 75)}`);
console.log(`  lcm(4, 6) = ${nt.lcm(4, 6)}`);
console.log(`  lcm(12, 15) = ${nt.lcm(12, 15)}`);

console.log('\nDivisibility:');
console.log(`  is_even(8) = ${nt.is_even(8)}`);
console.log(`  is_odd(7)  = ${nt.is_odd(7)}`);
console.log(`  17 div 3?  = ${nt.is_divisible(17, 3)}`);
console.log(`  18 div 3?  = ${nt.is_divisible(18, 3)}`);

console.log('\nSet membership:');
console.log(`  is_integer(3.0)  = ${nt.is_integer(3.0)}`);
console.log(`  is_integer(3.5)  = ${nt.is_integer(3.5)}`);
console.log(`  is_natural(-1.0) = ${nt.is_natural(-1.0)}`);
console.log(`  is_natural(5.0)  = ${nt.is_natural(5.0)}`);

console.log('\nTriangular numbers T(1)..T(10):');
console.log('  ' + Array.from({ length: 10 }, (_, i) => nt.triangular(i + 1)).join(' '));

console.log('\nDigital roots:');
for (const n of [0, 1, 9, 10, 18, 19, 100, 493]) {
  console.log(`  dr(${n}) = ${nt.digital_root(n)}`);
}

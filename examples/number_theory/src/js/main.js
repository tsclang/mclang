'use strict';
const path = require('path');
const fs   = require('fs');

const buildDir = path.join(__dirname, '..', '..', 'build');
const jsPath   = path.join(buildDir, 'number_theory.js');

if (!fs.existsSync(jsPath)) {
  console.error(`Error: ${jsPath} not found. Build with emcc first.`);
  process.exit(1);
}

const Module = require(jsPath);

Module.onRuntimeInitialized = () => {
  const d1 = (name) => Module.cwrap(name, 'number', ['number']);
  const d2 = (name) => Module.cwrap(name, 'number', ['number', 'number']);

  const gcd          = d2('gcd');
  const lcm          = d2('lcm');
  const is_even      = d1('is_even');
  const is_odd       = d1('is_odd');
  const is_divisible = d2('is_divisible');
  const is_integer   = d1('is_integer');
  const is_natural   = d1('is_natural');
  const triangular   = d1('triangular');
  const digital_root = d1('digital_root');

  console.log('GCD / LCM:');
  console.log(`  gcd(48, 18) = ${gcd(48, 18)}`);
  console.log(`  gcd(100, 75) = ${gcd(100, 75)}`);
  console.log(`  lcm(4, 6) = ${lcm(4, 6)}`);
  console.log(`  lcm(12, 15) = ${lcm(12, 15)}`);

  console.log('\nDivisibility:');
  console.log(`  is_even(8) = ${is_even(8)}`);
  console.log(`  is_odd(7)  = ${is_odd(7)}`);
  console.log(`  17 div 3?  = ${is_divisible(17, 3)}`);
  console.log(`  18 div 3?  = ${is_divisible(18, 3)}`);

  console.log('\nSet membership:');
  console.log(`  is_integer(3.0)  = ${is_integer(3.0)}`);
  console.log(`  is_integer(3.5)  = ${is_integer(3.5)}`);
  console.log(`  is_natural(-1.0) = ${is_natural(-1.0)}`);
  console.log(`  is_natural(5.0)  = ${is_natural(5.0)}`);

  console.log('\nTriangular numbers T(1)..T(10):');
  console.log('  ' + Array.from({length:10}, (_,i) => triangular(i+1)).join(' '));

  console.log('\nDigital roots:');
  for (const n of [0, 1, 9, 10, 18, 19, 100, 493]) {
    console.log(`  dr(${n}) = ${digital_root(n)}`);
  }
};

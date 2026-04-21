'use strict';
const path = require('path');
const fs   = require('fs');

const buildDir = path.join(__dirname, '..', '..', 'build');
const jsPath   = path.join(buildDir, 'geometry.js');

if (!fs.existsSync(jsPath)) {
  console.error(`Error: ${jsPath} not found. Build with emcc first.`);
  process.exit(1);
}

const Module = require(jsPath);

Module.onRuntimeInitialized = () => {
  const d4 = (name) => Module.cwrap(name, 'number', ['number','number','number','number']);
  const d6 = (name) => Module.cwrap(name, 'number', ['number','number','number','number','number','number']);

  const dist2d        = d4('dist2d');
  const angle2d       = d4('angle2d');
  const triangle_area = d6('triangle_area');

  console.log('2D geometry:');
  console.log(`  dist (0,0)→(3,4):    ${dist2d(0,0,3,4).toFixed(4)}`);
  console.log(`  dist (1,1)→(4,5):    ${dist2d(1,1,4,5).toFixed(4)}`);
  const rad = angle2d(1,0,0,1);
  console.log(`  angle (1,0)∠(0,1):   ${rad.toFixed(4)} rad = ${(rad*180/Math.PI).toFixed(1)}°`);
  console.log(`  triangle area (0,0)(4,0)(0,3): ${triangle_area(0,0,4,0,0,3).toFixed(4)}`);
};

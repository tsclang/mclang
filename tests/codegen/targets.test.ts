import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';
import type { CgenOptions } from '../../src/codegen/codegen.js';

function compile(src: string, opts?: CgenOptions): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast, opts);
}

// ── Default target ────────────────────────────────────────────────────────────

describe('default options', () => {
  it('defaults to f64 precision (no MC_USE_FAST_FLOAT)', () => {
    const { c } = compile('f(x) = x\n');
    expect(c).not.toContain('#define MC_USE_FAST_FLOAT');
    expect(c).not.toContain('#define MC_USE_8BIT');
  });

  it('emits double typedef by default', () => {
    const { c } = compile('f(x) = x\n');
    expect(c).toContain('typedef double mc_num');
  });
});

// ── Precision flags ───────────────────────────────────────────────────────────

describe('--precision f32', () => {
  it('emits MC_USE_FAST_FLOAT define', () => {
    const { c } = compile('f(x) = x\n', { precision: 'f32' });
    expect(c).toContain('#define MC_USE_FAST_FLOAT');
  });

  it('also sets define in .h file', () => {
    const { h } = compile('f(x) = x\n', { precision: 'f32' });
    expect(h).toContain('MC_USE_FAST_FLOAT');
  });
});

describe('--precision fixed', () => {
  it('emits MC_USE_8BIT define', () => {
    const { c } = compile('f(x) = x\n', { precision: 'fixed' });
    expect(c).toContain('#define MC_USE_8BIT');
  });

  it('also sets define in .h file', () => {
    const { h } = compile('f(x) = x\n', { precision: 'fixed' });
    expect(h).toContain('MC_USE_8BIT');
  });
});

// ── Wasm target ───────────────────────────────────────────────────────────────

describe('--target wasm', () => {
  it('includes emscripten.h guard', () => {
    const { c } = compile('f(x) = x\n', { target: 'wasm' });
    expect(c).toContain('__EMSCRIPTEN__');
    expect(c).toContain('#include <emscripten.h>');
  });

  it('annotates public functions with EMSCRIPTEN_KEEPALIVE', () => {
    const { c } = compile('f(x) = x\n', { target: 'wasm' });
    expect(c).toContain('EMSCRIPTEN_KEEPALIVE');
  });

  it('does not annotate private functions', () => {
    const { c } = compile('_helper(x) = x\nf(x) = _helper(x)\n', { target: 'wasm' });
    // EMSCRIPTEN_KEEPALIVE appears only once (for f, not _helper)
    const count = (c.match(/EMSCRIPTEN_KEEPALIVE/g) ?? []).length;
    expect(count).toBe(1);
  });
});

describe('--target c (default)', () => {
  it('does not emit EMSCRIPTEN_KEEPALIVE', () => {
    const { c } = compile('f(x) = x\n', { target: 'c' });
    expect(c).not.toContain('EMSCRIPTEN_KEEPALIVE');
  });
});

// ── Physical constants ────────────────────────────────────────────────────────

describe('physical constants', () => {
  it('G → gravitational constant', () => {
    const { c } = compile('force(m1, m2, r) = G * m1 * m2 / r^2\n');
    expect(c).toContain('6.67430e-11');
  });

  it('c → speed of light', () => {
    // 'c' conflicts with common variable name, use in expression
    const { c: out } = compile('energy(m) = m * c * c\n');
    expect(out).toContain('299792458.0');
  });

  it('h → Planck constant', () => {
    const { c } = compile('photon(f) = h * f\n');
    expect(c).toContain('6.62607015e-34');
  });

  it('k_B → Boltzmann constant', () => {
    const { c } = compile('thermal(T) = k_B * T\n');
    expect(c).toContain('1.380649e-23');
  });

  it('N_A → Avogadro number', () => {
    const { c } = compile('moles(n) = n / N_A\n');
    expect(c).toContain('6.02214076e23');
  });

  it('R → universal gas constant', () => {
    const { c } = compile('pV(n, T) = n * R * T\n');
    expect(c).toContain('8.314462618');
  });
});

// ── Precision + wasm combined ─────────────────────────────────────────────────

describe('combined options', () => {
  it('wasm + f32 emits both define and EMSCRIPTEN_KEEPALIVE', () => {
    const { c } = compile('f(x) = x\n', { target: 'wasm', precision: 'f32' });
    expect(c).toContain('#define MC_USE_FAST_FLOAT');
    expect(c).toContain('EMSCRIPTEN_KEEPALIVE');
  });
});

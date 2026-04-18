import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

// ── Element-wise operations ───────────────────────────────────────────────────

describe('element-wise array +', () => {
  it('parses a + b for array params without error', () => {
    expect(() => compile('f(a: num[], b: num[]) = a + b\n')).not.toThrow();
  });

  it('a + b for arrays → mc_add_arr helper', () => {
    const { c } = compile('f(a: num[], b: num[]) = a + b\n');
    expect(c).toContain('mc_add_arr');
  });
});

describe('element-wise array -', () => {
  it('a - b for arrays → mc_sub_arr helper', () => {
    const { c } = compile('f(a: num[], b: num[]) = a - b\n');
    expect(c).toContain('mc_sub_arr');
  });
});

describe('element-wise .* (hadamard)', () => {
  it('parses a .* b without error', () => {
    expect(() => compile('f(a: num[], b: num[]) = a .* b\n')).not.toThrow();
  });

  it('a .* b for arrays → mc_mul_arr helper', () => {
    const { c } = compile('f(a: num[], b: num[]) = a .* b\n');
    expect(c).toContain('mc_mul_arr');
  });
});

describe('scalar * array', () => {
  it('parses 2 * v for array param without error', () => {
    expect(() => compile('f(v: num[]) = 2 * v\n')).not.toThrow();
  });

  it('scalar * array → mc_scale helper', () => {
    const { c } = compile('f(v: num[]) = 2 * v\n');
    expect(c).toContain('mc_scale');
  });
});

// ── transpose ─────────────────────────────────────────────────────────────────

describe('transpose(m)', () => {
  it('parses transpose(m) for matrix param without error', () => {
    expect(() => compile('f(m: num[][]) = transpose(m)\n')).not.toThrow();
  });

  it('transpose(m) → mc_transpose helper call', () => {
    const { c } = compile('f(m: num[][]) = transpose(m)\n');
    expect(c).toContain('mc_transpose');
  });

  it('mc_transpose runtime helper is emitted', () => {
    const { c } = compile('f(x) = x\n');
    expect(c).toContain('mc_transpose');
  });
});

// ── det ───────────────────────────────────────────────────────────────────────

describe('det(m)', () => {
  it('parses det(m) for matrix param without error', () => {
    expect(() => compile('f(m: num[][]) = det(m)\n')).not.toThrow();
  });

  it('det(m) → mc_det helper call', () => {
    const { c } = compile('f(m: num[][]) = det(m)\n');
    expect(c).toContain('mc_det');
  });

  it('mc_det runtime helper is emitted', () => {
    const { c } = compile('f(x) = x\n');
    expect(c).toContain('mc_det');
  });
});

// ── inv ───────────────────────────────────────────────────────────────────────

describe('inv(m)', () => {
  it('parses inv(m) for matrix param without error', () => {
    expect(() => compile('f(m: num[][]) = inv(m)\n')).not.toThrow();
  });

  it('inv(m) → mc_inv helper call', () => {
    const { c } = compile('f(m: num[][]) = inv(m)\n');
    expect(c).toContain('mc_inv');
  });

  it('mc_inv runtime helper is emitted', () => {
    const { c } = compile('f(x) = x\n');
    expect(c).toContain('mc_inv');
  });
});

// ── I(n), zeros, ones ─────────────────────────────────────────────────────────

describe('I(n) — identity matrix', () => {
  it('parses I(3) without error', () => {
    expect(() => compile('f(n) = I(n)\n')).not.toThrow();
  });

  it('I(n) → mc_identity helper call', () => {
    const { c } = compile('f(n) = I(n)\n');
    expect(c).toContain('mc_identity');
  });
});

describe('zeros(r, c)', () => {
  it('parses zeros(3, 3) without error', () => {
    expect(() => compile('f(r, c) = zeros(r, c)\n')).not.toThrow();
  });

  it('zeros(r, c) → mc_zeros helper call', () => {
    const { c } = compile('f(r, c) = zeros(r, c)\n');
    expect(c).toContain('mc_zeros');
  });
});

describe('ones(r, c)', () => {
  it('parses ones(3, 3) without error', () => {
    expect(() => compile('f(r, c) = ones(r, c)\n')).not.toThrow();
  });

  it('ones(r, c) → mc_ones helper call', () => {
    const { c } = compile('f(r, c) = ones(r, c)\n');
    expect(c).toContain('mc_ones');
  });
});

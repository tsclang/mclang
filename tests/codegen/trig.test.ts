import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

// ── Reciprocal trig ───────────────────────────────────────────────────────────

describe('cot(x)', () => {
  it('generates (1.0/tan(x))', () => {
    const { c } = compile('f(x) = cot(x)\n');
    expect(c).toContain('1.0/tan(');
  });
  it('ctg synonym', () => {
    const { c } = compile('f(x) = ctg(x)\n');
    expect(c).toContain('1.0/tan(');
  });
});

describe('sec(x)', () => {
  it('generates (1.0/cos(x))', () => {
    const { c } = compile('f(x) = sec(x)\n');
    expect(c).toContain('1.0/cos(');
  });
});

describe('csc(x)', () => {
  it('generates (1.0/sin(x))', () => {
    const { c } = compile('f(x) = csc(x)\n');
    expect(c).toContain('1.0/sin(');
  });
});

describe('arccot(x)', () => {
  it('generates atan2(1.0, x)', () => {
    const { c } = compile('f(x) = arccot(x)\n');
    expect(c).toContain('atan2(1.0,');
  });
  it('acot synonym', () => {
    const { c } = compile('f(x) = acot(x)\n');
    expect(c).toContain('atan2(1.0,');
  });
});

// ── Logarithms ────────────────────────────────────────────────────────────────

describe('lg(x)', () => {
  it('generates log10(x)', () => {
    const { c } = compile('f(x) = lg(x)\n');
    expect(c).toContain('log10(');
  });
});

// ── Gamma ─────────────────────────────────────────────────────────────────────

describe('gamma(x)', () => {
  it('generates tgamma(x)', () => {
    const { c } = compile('f(x) = gamma(x)\n');
    expect(c).toContain('tgamma(');
  });
});

// ── Inverse hyperbolic ────────────────────────────────────────────────────────

describe('inverse hyperbolic', () => {
  it('asinh via arcsh synonym', () => {
    const { c } = compile('f(x) = arcsh(x)\n');
    expect(c).toContain('asinh(');
  });
  it('acosh via arcch synonym', () => {
    const { c } = compile('f(x) = arcch(x)\n');
    expect(c).toContain('acosh(');
  });
  it('atanh via arcth synonym', () => {
    const { c } = compile('f(x) = arcth(x)\n');
    expect(c).toContain('atanh(');
  });
  it('asinh direct', () => {
    const { c } = compile('f(x) = asinh(x)\n');
    expect(c).toContain('asinh(');
  });
});

describe('coth(x)', () => {
  it('generates (1.0/tanh(x))', () => {
    const { c } = compile('f(x) = coth(x)\n');
    expect(c).toContain('1.0/tanh(');
  });
});

// ── hypot ─────────────────────────────────────────────────────────────────────

describe('hypot(x, y)', () => {
  it('generates hypot(x, y)', () => {
    const { c } = compile('f(x, y) = hypot(x, y)\n');
    expect(c).toContain('hypot(');
  });
});

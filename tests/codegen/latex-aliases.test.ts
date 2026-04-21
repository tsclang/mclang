import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

// ── \abs{x} ───────────────────────────────────────────────────────────────────

describe('\\abs{x}', () => {
  it('generates fabs(x)', () => {
    const { c } = compile('f(x) = \\abs{x}\n');
    expect(c).toContain('fabs(');
  });
  it('is equivalent to |x|', () => {
    const { c } = compile('f(x) = \\abs{x - 1}\n');
    expect(c).toContain('fabs(');
  });
});

// ── \lvert x \rvert ───────────────────────────────────────────────────────────

describe('\\lvert x \\rvert', () => {
  it('generates fabs(x)', () => {
    const { c } = compile('f(x) = \\lvert x \\rvert\n');
    expect(c).toContain('fabs(');
  });
});

// ── \mod ─────────────────────────────────────────────────────────────────────

describe('a \\mod b', () => {
  it('generates fmod(a, b)', () => {
    const { c } = compile('f(x, y) = x \\mod y\n');
    expect(c).toContain('fmod(');
  });
});

// ── \ne ───────────────────────────────────────────────────────────────────────

describe('\\ne', () => {
  it('is alias for \\neq (generates !=)', () => {
    const { c } = compile('f(x) = if (x \\ne 0) 1 else 0\n');
    expect(c).toContain('!=');
  });
});

// ── Russian trig as LaTeX commands ────────────────────────────────────────────

describe('Russian trig LaTeX aliases', () => {
  it('\\tg → tan', () => {
    const { c } = compile('f(x) = \\tg(x)\n');
    expect(c).toContain('tan(');
  });
  it('\\ctg → cot (1/tan)', () => {
    const { c } = compile('f(x) = \\ctg(x)\n');
    expect(c).toContain('1.0/tan(');
  });
  it('\\sh → sinh', () => {
    const { c } = compile('f(x) = \\sh(x)\n');
    expect(c).toContain('sinh(');
  });
  it('\\ch → cosh', () => {
    const { c } = compile('f(x) = \\ch(x)\n');
    expect(c).toContain('cosh(');
  });
  it('\\th → tanh', () => {
    const { c } = compile('f(x) = \\th(x)\n');
    expect(c).toContain('tanh(');
  });
  it('\\cth → coth (1/tanh)', () => {
    const { c } = compile('f(x) = \\cth(x)\n');
    expect(c).toContain('1.0/tanh(');
  });
  it('\\arctg → atan', () => {
    const { c } = compile('f(x) = \\arctg(x)\n');
    expect(c).toContain('atan(');
  });
  it('\\arcctg → acot (atan2)', () => {
    const { c } = compile('f(x) = \\arcctg(x)\n');
    expect(c).toContain('atan2(1.0,');
  });
  it('\\arccot → acot (atan2)', () => {
    const { c } = compile('f(x) = \\arccot(x)\n');
    expect(c).toContain('atan2(1.0,');
  });
});

// ── \erf ─────────────────────────────────────────────────────────────────────

describe('\\erf{x}', () => {
  it('\\erf as function call', () => {
    const { c } = compile('f(x) = \\erf(x)\n');
    expect(c).toContain('erf(');
  });
});

// ── \min, \max ───────────────────────────────────────────────────────────────

describe('\\min and \\max', () => {
  it('\\min generates fmin', () => {
    const { c } = compile('f(x, y) = \\min(x, y)\n');
    expect(c).toContain('fmin(');
  });
  it('\\max generates fmax', () => {
    const { c } = compile('f(x, y) = \\max(x, y)\n');
    expect(c).toContain('fmax(');
  });
});

// ── \det ─────────────────────────────────────────────────────────────────────

describe('\\det(A)', () => {
  it('\\det generates mc_det', () => {
    const { c } = compile('f(A) = \\det(A)\n');
    expect(c).toContain('mc_det(');
  });
});

// ── \operatorname ────────────────────────────────────────────────────────────

describe('\\operatorname{name}', () => {
  it('\\operatorname{sgn} acts as sgn identifier', () => {
    const { c } = compile('f(x) = \\operatorname{sgn}(x)\n');
    expect(c).toContain('mc_sgn(');
  });
});

// ── e^x → exp(x) ─────────────────────────────────────────────────────────────

describe('e^x optimization', () => {
  it('e^x generates exp(x) not pow(M_E, x)', () => {
    const { c } = compile('f(x) = e^x\n');
    expect(c).toContain('exp(');
    expect(c).not.toContain('pow(M_E');
  });
  it('e^{2x} generates exp(2x)', () => {
    const { c } = compile('f(x) = e^{2*x}\n');
    expect(c).toContain('exp(');
    expect(c).not.toContain('pow(M_E');
  });
});

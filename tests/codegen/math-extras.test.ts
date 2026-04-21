import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

// ── Logarithms ────────────────────────────────────────────────────────────────

describe('log2(x)', () => {
  it('generates log2(x)', () => {
    const { c } = compile('f(x) = log2(x)\n');
    expect(c).toContain('log2(');
  });
});

// ── Roots ─────────────────────────────────────────────────────────────────────

describe('cbrt(x)', () => {
  it('generates cbrt(x)', () => {
    const { c } = compile('f(x) = cbrt(x)\n');
    expect(c).toContain('cbrt(');
  });
});

// ── Rounding ──────────────────────────────────────────────────────────────────

describe('trunc(x)', () => {
  it('generates trunc(x)', () => {
    const { c } = compile('f(x) = trunc(x)\n');
    expect(c).toContain('trunc(');
  });
});

// ── Special ───────────────────────────────────────────────────────────────────

describe('erfc(x)', () => {
  it('generates erfc(x)', () => {
    const { c } = compile('f(x) = erfc(x)\n');
    expect(c).toContain('erfc(');
  });
});

describe('sign(x)', () => {
  it('sign is alias for mc_sgn', () => {
    const { c } = compile('f(x) = sign(x)\n');
    expect(c).toContain('mc_sgn(');
  });
});

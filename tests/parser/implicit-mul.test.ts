import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/index.js';
import { parseSource } from '../../src/parser/index.js';
import { generateC } from '../../src/codegen/index.js';

function compile(src: string) {
  const lexer = new Lexer(src, 'test.mc');
  const tokens = lexer.tokenize();
  const ast = parseSource(tokens);
  return generateC(ast, { target: 'c', precision: 'f64' });
}

describe('implicit multiplication', () => {
  it('2x → 2 * x', () => {
    const { c } = compile('f(x) = 2x\n');
    expect(c).toContain('2.0 * x');
  });

  it('2(x + 1) → 2 * (x + 1)', () => {
    const { c } = compile('f(x) = 2(x + 1)\n');
    expect(c).toContain('2.0 * (');
    expect(c).toContain('(x + 1.0)');
  });

  it('2x^2 → 2 * (x^2), exponent binds tighter', () => {
    const { c } = compile('f(x) = 2x^2\n');
    expect(c).toContain('pow(x, 2.0)');
    expect(c).toContain('2.0 * pow(x, 2.0)');
  });

  it('a b c → (a * b) * c (left-associative)', () => {
    const { c } = compile('f(a, b, c) = a b c\n');
    expect(c).toContain('(a * b)');
    expect(c).toContain('* c)');
  });

  it('2\\sin(x) → 2 * sin(x)', () => {
    const { c } = compile('f(x) = 2\\sin(x)\n');
    expect(c).toContain('2.0 * sin(x)');
  });

  it('2\\sqrt{x} → 2 * sqrt(x)', () => {
    const { c } = compile('f(x) = 2\\sqrt{x}\n');
    expect(c).toContain('2.0 * sqrt(x)');
  });

  it('does not apply across newlines', () => {
    expect(() => compile('f(x) = x\ng(y) = y\n')).not.toThrow();
    const { c } = compile('f(x) = x\n');
    expect(c).toContain('return x');
  });

  // ── Greek letters and ASCII identifiers ───────────────────────────────────

  it('2π d → 2 * π * d (space separates tokens)', () => {
    const { c } = compile('f(d) = 2π d\n');
    expect(c).toContain('2.0 * M_PI');
    expect(c).toContain('* d');
  });

  it('2πd → 2 * πd (no space: πd is one identifier)', () => {
    // πd merges into a single identifier __uni_pid — NOT π * d
    const { c } = compile('f(d) = 2πd\n');
    expect(c).toContain('2.0 * __uni_pid');
  });

  it('2π*d → 2 * π * d (explicit * also works)', () => {
    const { c } = compile('f(d) = 2π*d\n');
    expect(c).toContain('2.0 * M_PI');
    expect(c).toContain('* d');
  });

  // ── Number + LaTeX function ────────────────────────────────────────────────

  it('2\\cos{x} → 2 * cos(x)', () => {
    const { c } = compile('f(x) = 2\\cos{x}\n');
    expect(c).toContain('2.0 * cos(x)');
  });

  it('r\\sin{θ} → r * sin(θ)', () => {
    const { c } = compile('f(r, θ) = r\\sin{θ}\n');
    expect(c).toContain('r * sin(');
  });

  it('2\\frac{a}{b} → 2 * (a/b)', () => {
    const { c } = compile('f(a, b) = 2\\frac{a}{b}\n');
    expect(c).toContain('2.0 * (');
    expect(c).toContain('((a) / (b))');
  });

  // ── Multi-factor chains ────────────────────────────────────────────────────

  it('2π d \\cos{θ} → 2 * π * d * cos(θ)', () => {
    const { c } = compile('f(d, θ) = 2π d \\cos{θ}\n');
    expect(c).toContain('M_PI');
    expect(c).toContain('* d');
    expect(c).toContain('cos(');
  });

  it('r^2 \\sin{θ} → pow(r,2) * sin(θ)', () => {
    const { c } = compile('f(r, θ) = r^2 \\sin{θ}\n');
    expect(c).toContain('pow(r, 2.0)');
    expect(c).toContain('* sin(');
  });

  it('\\frac{2π d}{λ} → (2*π*d)/λ', () => {
    const { c } = compile('f(d, λ) = \\frac{2π d}{λ}\n');
    expect(c).toContain('M_PI');
    expect(c).toContain('* d');
    expect(c).toContain('__uni_lambda');
  });
});

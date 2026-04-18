import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

// ── is_nan / is_inf / is_finite ───────────────────────────────────────────────

describe('is_nan / is_inf / is_finite', () => {
  it('is_nan(x) → isnan(x)', () => {
    const { c } = compile('f(x) = is_nan(x)\n');
    expect(c).toContain('isnan(x)');
  });

  it('is_inf(x) → isinf(x)', () => {
    const { c } = compile('f(x) = is_inf(x)\n');
    expect(c).toContain('isinf(x)');
  });

  it('is_finite(x) → isfinite(x)', () => {
    const { c } = compile('f(x) = is_finite(x)\n');
    expect(c).toContain('isfinite(x)');
  });
});

// ── Derivative \frac{d}{dx} ───────────────────────────────────────────────────

describe('Derivative \\frac{d}{dx}', () => {
  it('parses \\frac{d}{dx} x^2 without error', () => {
    expect(() => compile('f(x) = \\frac{d}{dx} x^2\n')).not.toThrow();
  });

  it('generates finite difference with h=1e-7', () => {
    const { c } = compile('f(x) = \\frac{d}{dx} x^2\n');
    expect(c).toContain('1e-7');
  });

  it('evaluates body at x+h and x separately', () => {
    const { c } = compile('f(x) = \\frac{d}{dx} x^2\n');
    // Should contain (x + 1e-7) for the shifted evaluation
    expect(c).toContain('x + 1e-7');
  });

  it('generates division by h', () => {
    const { c } = compile('f(x) = \\frac{d}{dx} x^2\n');
    expect(c).toContain(') / 1e-7');
  });

  it('derivative of sin(x)', () => {
    const { c } = compile('f(x) = \\frac{d}{dx} sin(x)\n');
    expect(c).toContain('sin(');
    expect(c).toContain('1e-7');
  });
});

// ── Limit \lim ───────────────────────────────────────────────────────────────

describe('Limit \\lim', () => {
  it('parses \\lim_{x \\to 0} sin(x)/x without error', () => {
    expect(() => compile('f() = \\lim_{x \\to 0} sin(x)\n')).not.toThrow();
  });

  it('generates local variable assignment for limit', () => {
    const { c } = compile('f() = \\lim_{x \\to 0} sin(x)\n');
    // Should evaluate at a + 1e-9
    expect(c).toContain('1e-9');
    expect(c).toContain('sin(');
  });

  it('\\lim_{x \\to \\infty} uses 1e15', () => {
    const { c } = compile('f() = \\lim_{x \\to \\infty} 1/x\n');
    expect(c).toContain('1e15');
  });
});

// ── Integral \int ─────────────────────────────────────────────────────────────

describe('Integral \\int', () => {
  it('parses \\int{0}{π} sin(x) dx without error', () => {
    expect(() => compile('f() = \\int{0}{π} sin(x) dx\n')).not.toThrow();
  });

  it('generates for loop with Simpson rule weights', () => {
    const { c } = compile('f() = \\int{0}{π} sin(x) dx\n');
    expect(c).toContain('for(int ');
    expect(c).toContain('sin(');
  });

  it('generates 1000 steps', () => {
    const { c } = compile('f() = \\int{0}{π} sin(x) dx\n');
    expect(c).toContain('1000');
  });

  it('uses h/3 scaling (Simpson)', () => {
    const { c } = compile('f() = \\int{0}{π} sin(x) dx\n');
    expect(c).toContain('/3.0');
  });

  it('three-brace form: \\int{0}{2}{t} t^2', () => {
    expect(() => compile('f() = \\int{0}{2}{t} t^2\n')).not.toThrow();
    const { c } = compile('f() = \\int{0}{2}{t} t^2\n');
    expect(c).toContain('pow(t,');
  });
});

// ── Solve (bisection) ─────────────────────────────────────────────────────────

describe('solve (bisection)', () => {
  it('parses solve(x, 0, 2) { x^2 - 2 } without error', () => {
    expect(() => compile('f() = solve(x, 0, 2) { x^2 - 2 }\n')).not.toThrow();
  });

  it('generates bisection loop', () => {
    const { c } = compile('f() = solve(x, 0, 2) { x^2 - 2 }\n');
    expect(c).toContain('for(int ');
    expect(c).toContain('0.5');
    expect(c).toContain('fabs(');
  });

  it('returns NAN if no solution found', () => {
    const { c } = compile('f() = solve(x, 0, 2) { x^2 - 2 }\n');
    expect(c).toContain('NAN');
  });

  it('tolerance 1e-9', () => {
    const { c } = compile('f() = solve(x, 0, 2) { x^2 - 2 }\n');
    expect(c).toContain('1e-9');
  });

  it('solve without braces also works', () => {
    expect(() => compile('f() = solve(x, 0, 2) x^2 - 2\n')).not.toThrow();
  });
});

// ── Criterion ─────────────────────────────────────────────────────────────────

describe('Phase 7 criterion', () => {
  it('integral sin(x) from 0 to π compiles', () => {
    const src = 'integral_sin() = \\int{0}{π} sin(x) dx\n';
    expect(() => compile(src)).not.toThrow();
    const { c } = compile(src);
    expect(c).toContain('M_PI');
    expect(c).toContain('sin(');
    expect(c).toContain('/3.0');
  });

  it('derivative x^2 compiles (≈ 6 at x=3)', () => {
    const src = 'deriv_sq(x) = \\frac{d}{dx} x^2\n';
    expect(() => compile(src)).not.toThrow();
    const { c } = compile(src);
    expect(c).toContain('1e-7');
    expect(c).toContain('pow(');
  });

  it('solve x^2 - 2 = 0 compiles (root ≈ √2)', () => {
    const src = 'sqrt2() = solve(x, 0, 2) { x^2 - 2 }\n';
    expect(() => compile(src)).not.toThrow();
    const { c } = compile(src);
    expect(c).toContain('fabs(');
    expect(c).toContain('1e-9');
  });
});

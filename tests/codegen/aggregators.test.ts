import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

// ── Factorial n! ──────────────────────────────────────────────────────────────

describe('Factorial n!', () => {
  it('n! → mc_factorial call', () => {
    const { c } = compile('f(n: int) = n!\n');
    expect(c).toContain('mc_factorial(');
  });

  it('mc_factorial helper is defined', () => {
    const { c } = compile('f(n: int) = n!\n');
    expect(c).toContain('static inline mc_num mc_factorial(');
  });

  it('5! constant folded or emitted', () => {
    const { c } = compile('f() = 5!\n');
    // 5 is a number literal, PostfixExpr wraps it
    expect(c).toContain('mc_factorial');
  });
});

// ── Binomial \binom{n}{k} ─────────────────────────────────────────────────────

describe('Binomial \\binom', () => {
  it('\\binom{n}{k} → mc_binom(n, k)', () => {
    const { c } = compile('f(n, k) = \\binom{n}{k}\n');
    expect(c).toContain('mc_binom(n, k)');
  });

  it('mc_binom helper is defined', () => {
    const { c } = compile('f(n, k) = \\binom{n}{k}\n');
    expect(c).toContain('static inline mc_num mc_binom(');
  });
});

// ── GCD / LCM ─────────────────────────────────────────────────────────────────

describe('gcd / lcm', () => {
  it('\\gcd{a}{b} → mc_gcd(a, b)', () => {
    const { c } = compile('f(a, b) = \\gcd{a}{b}\n');
    expect(c).toContain('mc_gcd(a, b)');
  });

  it('mc_gcd helper is defined', () => {
    const { c } = compile('f(a, b) = \\gcd{a}{b}\n');
    expect(c).toContain('static inline mc_num mc_gcd(');
  });

  it('lcm(a, b) → mc_lcm(a, b)', () => {
    const { c } = compile('f(a, b) = \\lcm{a}{b}\n');
    expect(c).toContain('mc_lcm(a, b)');
  });

  it('mc_lcm helper is defined', () => {
    const { c } = compile('f(a, b) = \\lcm{a}{b}\n');
    expect(c).toContain('static inline mc_num mc_lcm(');
  });
});

// ── sgn ───────────────────────────────────────────────────────────────────────

describe('sgn(x)', () => {
  it('sgn(x) → mc_sgn(x)', () => {
    const { c } = compile('f(x) = sgn(x)\n');
    expect(c).toContain('mc_sgn(x)');
  });

  it('mc_sgn helper is defined', () => {
    const { c } = compile('f(x) = sgn(x)\n');
    expect(c).toContain('static inline mc_num mc_sgn(');
  });
});

// ── Array aggregators ─────────────────────────────────────────────────────────

describe('Array aggregators', () => {
  it('sum(v) → mc_sum(v, v_len) for typed array param', () => {
    const { c } = compile('f(v: num[]) = sum(v)\n');
    expect(c).toContain('mc_sum(v, v_len)');
  });

  it('product(v) → mc_product(v, v_len)', () => {
    const { c } = compile('f(v: num[]) = product(v)\n');
    expect(c).toContain('mc_product(v, v_len)');
  });

  it('mean(v) → mc_mean(v, v_len)', () => {
    const { c } = compile('f(v: num[]) = mean(v)\n');
    expect(c).toContain('mc_mean(v, v_len)');
  });

  it('std(v) → mc_std(v, v_len)', () => {
    const { c } = compile('f(v: num[]) = std(v)\n');
    expect(c).toContain('mc_std(v, v_len)');
  });

  it('mc_sum helper is defined', () => {
    const { c } = compile('f(v: num[]) = sum(v)\n');
    expect(c).toContain('static inline mc_num mc_sum(');
  });

  it('mc_std helper is defined', () => {
    const { c } = compile('f(v: num[]) = std(v)\n');
    expect(c).toContain('static inline mc_num mc_std(');
  });
});

// ── min/max dispatch ──────────────────────────────────────────────────────────

describe('min/max dispatch', () => {
  it('min(a, b) → fmin(a, b) for 2 scalar args', () => {
    const { c } = compile('f(a, b) = min(a, b)\n');
    expect(c).toContain('fmin(a, b)');
  });

  it('min(v) → mc_min_arr(v, v_len) for array arg', () => {
    const { c } = compile('f(v: num[]) = min(v)\n');
    expect(c).toContain('mc_min_arr(v, v_len)');
  });

  it('max(a, b) → fmax(a, b)', () => {
    const { c } = compile('f(a, b) = max(a, b)\n');
    expect(c).toContain('fmax(a, b)');
  });

  it('max(v) → mc_max_arr(v, v_len) for array arg', () => {
    const { c } = compile('f(v: num[]) = max(v)\n');
    expect(c).toContain('mc_max_arr(v, v_len)');
  });
});

// ── ∑_{x ∈ v} — array iteration ──────────────────────────────────────────────

describe('Sum over array ∑_{x ∈ v}', () => {
  it('\\sum_{x \\in v} x^2 → for loop over array', () => {
    const { c } = compile('f(v: num[]) = \\sum_{x \\in v} x^2\n');
    expect(c).toContain('for (int ');
    expect(c).toContain('v_len');
    expect(c).toContain('pow(x, 2.0)');
  });
});

// ── erf / gamma ───────────────────────────────────────────────────────────────

describe('erf / gamma', () => {
  it('erf(x) → erf(x)', () => {
    const { c } = compile('f(x) = erf(x)\n');
    expect(c).toContain('erf(x)');
  });

  it('\\Gamma{x} → tgamma(x)', () => {
    const { c } = compile('f(x) = \\Gamma{x}\n');
    expect(c).toContain('tgamma(x)');
  });
});

// ── Criterion: factorial, binom, array stats ──────────────────────────────────

describe('Phase 6 criterion', () => {
  it('factorial function compiles', () => {
    const src = 'fact(n: int) = n!\n';
    expect(() => compile(src)).not.toThrow();
    const { c } = compile(src);
    expect(c).toContain('mc_factorial');
  });

  it('binomial coefficient compiles', () => {
    const src = 'binom_coeff(n, k) = \\binom{n}{k}\n';
    expect(() => compile(src)).not.toThrow();
    const { c } = compile(src);
    expect(c).toContain('mc_binom');
  });

  it('array statistics compile', () => {
    const src = `
mean_of(v: num[]) = mean(v)
std_of(v: num[]) = std(v)
`;
    expect(() => compile(src)).not.toThrow();
    const { c } = compile(src);
    expect(c).toContain('mc_mean');
    expect(c).toContain('mc_std');
  });
});

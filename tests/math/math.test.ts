import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { insertImplicitMul } from '../../src/math/implicit-mul.js';
import { parseSource } from '../../src/parser/parser.js';
import { transformFile } from '../../src/math/transforms.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = insertImplicitMul(new Lexer(src).tokenize());
  const ast = transformFile(parseSource(tokens));
  return generateC(ast);
}

// ── Implicit multiplication ───────────────────────────────────────────────────

describe('implicit multiplication', () => {
  it('2x → 2*x', () => {
    const { c } = compile('f(x) = 2x\n');
    expect(c).toContain('(2.0 * x)');
  });

  it('2(a+b) → 2*(a+b)', () => {
    const { c } = compile('f(a, b) = 2(a + b)\n');
    expect(c).toContain('2.0 *');
    expect(c).toContain('(a + b)');
  });

  it('preserves function calls: f(x) not f*x', () => {
    const { c } = compile('sq(x) = x^2\nf(x) = sq(x)\n');
    expect(c).toContain('sq(x)');
    expect(c).not.toMatch(/sq\s*\*/);
  });

  it('2πr → 2*π*r (M_PI)', () => {
    const { c } = compile('f(r) = 2πr\n');
    expect(c).toContain('M_PI');
    expect(c).toContain('2.0');
  });
});

// ── Constant folding ──────────────────────────────────────────────────────────

describe('constant folding', () => {
  it('folds 2 + 3 → 5', () => {
    const { c } = compile('f() = 2 + 3\n');
    expect(c).toContain('5');
  });

  it('folds 6 / 2 → 3', () => {
    const { c } = compile('f() = 6 / 2\n');
    expect(c).toContain('3');
  });

  it('folds 2^10 → 1024', () => {
    const { c } = compile('f() = 2^10\n');
    expect(c).toContain('1024');
  });

  it('does not fold variable expressions', () => {
    const { c } = compile('f(x) = x + 2\n');
    expect(c).toContain('(x + 2.0)');
  });
});

// ── e^x → exp(x) transform ───────────────────────────────────────────────────

describe('e^x transform', () => {
  it('e^x → exp(x)', () => {
    const { c } = compile('f(x) = e^x\n');
    expect(c).toContain('exp(x)');
    expect(c).not.toContain('pow(M_E');
  });

  it('e^(2*x) → exp(2*x)', () => {
    const { c } = compile('f(x) = e^(2*x)\n');
    expect(c).toContain('exp(');
  });
});

// ── log_{base}{x} ─────────────────────────────────────────────────────────────

describe('log with base', () => {
  it('\\log_{2}{x} → log(x)/log(2)', () => {
    const { c } = compile('f(x) = \\log_{2}{x}\n');
    expect(c).toContain('log(x)');
    expect(c).toContain('log(2.0)');
  });

  it('\\log{10}{x} → log(x)/log(10)', () => {
    const { c } = compile('f(x) = \\log{10}{x}\n');
    expect(c).toContain('log(x)');
    expect(c).toContain('log(10.0)');
  });
});

// ── Gaussian function ─────────────────────────────────────────────────────────

describe('Gaussian / normal distribution density', () => {
  // f(x, mu, sigma) = \frac{1}{\sigma \sqrt{2\pi}} * e^{-\frac{(x-mu)^2}{2\sigma^2}}
  const src = `gauss(x, mu, sigma) = \\frac{1}{sigma * \\sqrt{2π}} * e^(-(x - mu)^2 / (2 * sigma^2))\n`;

  it('parses without error', () => {
    expect(() => compile(src)).not.toThrow();
  });

  it('uses exp() for e^...', () => {
    const { c } = compile(src);
    expect(c).toContain('exp(');
  });

  it('uses sqrt() for sqrt', () => {
    const { c } = compile(src);
    expect(c).toContain('sqrt(');
  });

  it('uses M_PI for π', () => {
    const { c } = compile(src);
    expect(c).toContain('M_PI');
  });
});

// ── Newton gravity ────────────────────────────────────────────────────────────

describe('Newton gravity', () => {
  const src = `G = 6.674e-11
newton_gravity(m1, m2, r) = G * \\frac{m1 * m2}{r^2}
    where
        m1 > 0
        m2 > 0
        r > 0
`;

  it('parses without error', () => {
    expect(() => compile(src)).not.toThrow();
  });

  it('generates NAN guards for all three where clauses', () => {
    const { c } = compile(src);
    expect((c.match(/return NAN/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });

  it('uses pow(r, 2.0) for r^2', () => {
    const { c } = compile(src);
    expect(c).toContain('pow(r, 2.0)');
  });

  it('generates constant G', () => {
    const { c } = compile(src);
    expect(c).toContain('static const mc_num G =');
  });
});

// ── Quadratic equation (discriminant) ────────────────────────────────────────

describe('quadratic discriminant', () => {
  const src = `discriminant(a, b, c) = b^2 - 4*a*c\n`;

  it('parses without error', () => {
    expect(() => compile(src)).not.toThrow();
  });

  it('generates pow(b, 2.0)', () => {
    const { c } = compile(src);
    expect(c).toContain('pow(b, 2.0)');
  });

  it('output contains subtraction', () => {
    const { c } = compile(src);
    expect(c).toContain(' - ');
  });
});

describe('quadratic roots via sqrt', () => {
  const src = `quad_root_pos(a, b, c) = \\frac{-b + \\sqrt{b^2 - 4*a*c}}{2*a}\n`;

  it('parses without error', () => {
    expect(() => compile(src)).not.toThrow();
  });

  it('uses sqrt()', () => {
    const { c } = compile(src);
    expect(c).toContain('sqrt(');
  });

  it('divides by 2*a', () => {
    const { c } = compile(src);
    expect(c).toContain('2.0');
    expect(c).toContain('a');
  });
});

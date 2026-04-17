import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

function hasLine(code: string, pattern: string | RegExp): boolean {
  return typeof pattern === 'string'
    ? code.includes(pattern)
    : pattern.test(code);
}

// ── Header (.h) ───────────────────────────────────────────────────────────────

describe('.h file', () => {
  it('contains mc_num typedef', () => {
    const { h } = compile('f(x) = x\n');
    expect(h).toContain('typedef double mc_num');
  });

  it('exports public functions', () => {
    const { h } = compile('f(x) = x\n');
    expect(h).toContain('mc_num f(');
  });

  it('does not export private functions', () => {
    const { h } = compile('_helper(x) = x\n');
    expect(h).not.toContain('_helper');
  });

  it('exports multiple public functions', () => {
    const { h } = compile('f(x) = x\ng(y) = y\n');
    expect(h).toContain('mc_num f(');
    expect(h).toContain('mc_num g(');
  });
});

// ── Constants ─────────────────────────────────────────────────────────────────

describe('ConstDef', () => {
  it('generates static const mc_num', () => {
    const { c } = compile('g = 9.806\n');
    expect(c).toContain('static const mc_num g = 9.806');
  });

  it('generates integer constant', () => {
    const { c } = compile('N = 42\n');
    expect(c).toContain('static const mc_num N = 42.0');
  });
});

// ── Simple functions ──────────────────────────────────────────────────────────

describe('FuncDef — simple', () => {
  it('generates function with return', () => {
    const { c } = compile('double_it(x) = x * 2\n');
    expect(c).toContain('mc_num double_it(mc_num x)');
    expect(c).toContain('return (x * 2.0);');
  });

  it('generates multi-param function', () => {
    const { c } = compile('add(a, b) = a + b\n');
    expect(c).toContain('mc_num add(mc_num a, mc_num b)');
    expect(c).toContain('return (a + b);');
  });

  it('generates unary minus', () => {
    const { c } = compile('neg(x) = -x\n');
    expect(c).toContain('return (-(x));');
  });
});

// ── Binary operators ─────────────────────────────────────────────────────────

describe('Binary operators', () => {
  it('addition', () => {
    const { c } = compile('f(a, b) = a + b\n');
    expect(c).toContain('(a + b)');
  });

  it('subtraction', () => {
    const { c } = compile('f(a, b) = a - b\n');
    expect(c).toContain('(a - b)');
  });

  it('multiplication', () => {
    const { c } = compile('f(a, b) = a * b\n');
    expect(c).toContain('(a * b)');
  });

  it('division', () => {
    const { c } = compile('f(a, b) = a / b\n');
    expect(c).toContain('(a / b)');
  });

  it('power → pow()', () => {
    const { c } = compile('sq(x) = x^2\n');
    expect(c).toContain('pow(x, 2.0)');
  });

  it('comparison → 1.0 / 0.0', () => {
    const { c } = compile('lt(a, b) = a < b\n');
    expect(c).toContain('((a) < (b) ? 1.0 : 0.0)');
  });
});

// ── Math constructs ───────────────────────────────────────────────────────────

describe('\\frac', () => {
  it('generates division', () => {
    const { c } = compile('f(m, v) = \\frac{m * v^2}{2}\n');
    expect(c).toContain('/ (2.0)');
    expect(c).toContain('pow(v, 2.0)');
  });
});

describe('\\sqrt', () => {
  it('generates sqrt()', () => {
    const { c } = compile('f(x) = \\sqrt{x}\n');
    expect(c).toContain('sqrt(x)');
  });

  it('generates nth root via pow', () => {
    const { c } = compile('f(x) = \\sqrt[3]{x}\n');
    expect(c).toContain('pow(x, 1.0 / (3.0))');
  });
});

describe('abs |x|', () => {
  it('generates fabs()', () => {
    const { c } = compile('f(x) = |x|\n');
    expect(c).toContain('fabs(x)');
  });
});

describe('floor / ceil', () => {
  it('generates floor()', () => {
    const { c } = compile('f(x) = \\lfloor x \\rfloor\n');
    expect(c).toContain('floor(x)');
  });

  it('generates ceil()', () => {
    const { c } = compile('f(x) = \\lceil x \\rceil\n');
    expect(c).toContain('ceil(x)');
  });
});

// ── Where block ───────────────────────────────────────────────────────────────

describe('Where block', () => {
  it('generates guard → if (!cond) return NAN', () => {
    const { c } = compile('f(m, a) = m * a\n    where\n        m > 0\n');
    expect(c).toContain('return NAN;');
    expect(c).toContain('if (!(');
  });

  it('generates where def before body', () => {
    const { c } = compile('f(m, x) = E + 1\n    where\n        E = m * x\n');
    const ePos = c.indexOf('mc_num E = ');
    const retPos = c.indexOf('return');
    expect(ePos).toBeGreaterThan(-1);
    expect(ePos).toBeLessThan(retPos);
  });
});

// ── Control flow ─────────────────────────────────────────────────────────────

describe('if/else', () => {
  it('generates inline if as ternary', () => {
    const { c } = compile('f(x) = if (x < 0) -1 else x\n');
    expect(c).toMatch(/\? .* : .*/);
  });

  it('generates block if/else', () => {
    const { c } = compile('f(x) =\n    if x < 0\n        -1\n    else\n        x\n');
    expect(c).toContain('if (');
    expect(c).toContain('} else {');
  });
});

describe('for loop', () => {
  it('generates C for loop', () => {
    const { c } = compile('f(n: int) =\n    res = 0\n    for i in 1..n\n        res = res + i\n    res\n');
    expect(c).toContain('for (int i =');
    expect(c).toContain('<= (int)(n)');
  });
});

describe('while loop', () => {
  it('generates C while loop', () => {
    const { c } = compile('f(x) =\n    while x > 0\n        x = x - 1\n    x\n');
    expect(c).toContain('while (');
  });
});

// ── Typed params ─────────────────────────────────────────────────────────────

describe('Typed params', () => {
  it('generates mc_num* + _len for num[] param', () => {
    const { c } = compile('f(v: num[]) = v[0]\n');
    expect(c).toContain('mc_num* v');
    expect(c).toContain('int v_len');
  });

  it('generates int param', () => {
    const { c } = compile('f(n: int) = n\n');
    expect(c).toContain('int n');
  });
});

// ── Member access ─────────────────────────────────────────────────────────────

describe('Member access', () => {
  it('v.length → v_len', () => {
    const { c } = compile('f(v: num[]) = v.length\n');
    expect(c).toContain('v_len');
  });
});

// ── Built-in identifiers ─────────────────────────────────────────────────────

describe('Built-in constants', () => {
  it('π → M_PI', () => {
    const { c } = compile('f(r) = π * r\n');
    expect(c).toContain('M_PI');
  });

  it('e → M_E', () => {
    const { c } = compile('f(x) = e * x\n');
    expect(c).toContain('M_E');
  });
});

// ── Function calls ────────────────────────────────────────────────────────────

describe('Function calls', () => {
  it('sin(x) → sin(x)', () => {
    const { c } = compile('f(x) = sin(x)\n');
    expect(c).toContain('sin(x)');
  });

  it('user-defined call', () => {
    const { c } = compile('sq(x) = x^2\nf(x) = sq(x)\n');
    expect(c).toContain('sq(x)');
  });
});

// ── Chain comparison ─────────────────────────────────────────────────────────

describe('Chain comparison', () => {
  it('0 < x < 10 → ((0) < (x) && (x) < (10))', () => {
    const { c } = compile('valid(x) = 0 < x < 10\n');
    expect(c).toContain('&&');
    // Should have both comparisons
    expect(c.match(/</g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });
});

// ── Degree ────────────────────────────────────────────────────────────────────

describe('Postfix degree °', () => {
  it('30° → 30 * (M_PI / 180)', () => {
    const { c } = compile('f() = 30°\n');
    expect(c).toContain('M_PI / 180.0');
  });
});

// ── Sum expression ∑ ─────────────────────────────────────────────────────────

describe('Sum expression', () => {
  it('∑(i=0, n) i → for loop with _acc', () => {
    const { c } = compile('f(n: int) = ∑(i=0, n) i\n');
    expect(c).toContain('for (int i =');
    expect(c).toContain('_acc_');
  });
});

// ── Full example from SPEC §22 ────────────────────────────────────────────────

describe('SPEC §22 full example — codegen', () => {
  const src = `g = 9.806

get_pos(pos, prev_pos, acc, dt) =
    pos + (pos - prev_pos) + acc * dt^2

newton(m, a) = m * a
    where
        m > 0

E_k(m, v) = \\frac{m * v^2}{2}

reflect_vel(v, normal, friction = 0.9) =
    (v - 2 * (v ⋅ normal) * normal) * friction

total_energy(masses: num[], velocities: num[]) =
    ∑(i=0, masses.length - 1) \\frac{masses[i] * velocities[i]^2}{2}
`;

  it('generates without error', () => {
    expect(() => compile(src)).not.toThrow();
  });

  it('g constant in output', () => {
    const { c } = compile(src);
    expect(c).toContain('static const mc_num g = 9.806');
  });

  it('get_pos uses pow for dt^2', () => {
    const { c } = compile(src);
    expect(c).toContain('pow(dt, 2.0)');
  });

  it('newton has NAN guard', () => {
    const { c } = compile(src);
    expect(c).toContain('return NAN;');
  });

  it('E_k uses frac → division', () => {
    const { c } = compile(src);
    expect(c).toContain('/ (2.0)');
  });

  it('total_energy has for loop', () => {
    const { c } = compile(src);
    expect(c).toContain('for (int i =');
  });

  it('total_energy params include _len', () => {
    const { c } = compile(src);
    expect(c).toContain('masses_len');
    expect(c).toContain('velocities_len');
  });

  it('.h exports all public funcs', () => {
    const { h } = compile(src);
    for (const fn of ['get_pos', 'newton', 'E_k', 'reflect_vel', 'total_energy']) {
      expect(h).toContain(fn);
    }
  });
});

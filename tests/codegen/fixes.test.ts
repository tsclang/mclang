import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

// ── A.29: genAssign shadowing fix ────────────────────────────────────────────

describe('A.29 — no shadowing in loops', () => {
  it('accumulator pattern: res declared once, assigned inside loop', () => {
    const { c } = compile('sum_sq(n) =\n  res = 0\n  for i in 1..n\n    res = res + i\n  res\n');
    // res should be declared once (mc_num res = 0;) and assigned inside loop without mc_num prefix
    const decls = [...c.matchAll(/mc_num res\s*=/g)];
    expect(decls.length).toBe(1);
    // Inside loop: just assignment, no type prefix
    expect(c).toMatch(/res\s*=\s*\(?\s*res\s*\+\s*i\s*\)?/);
  });

  it('two sequential assignments to same var — only one declaration', () => {
    const { c } = compile('f(x) =\n  a = x + 1\n  a = a * 2\n  a\n');
    const decls = [...c.matchAll(/mc_num a\s*=/g)];
    expect(decls.length).toBe(1);
    // Second assignment: no mc_num prefix
    expect(c).toMatch(/a\s*=\s*\(?\s*a\s*\*\s*2\s*\)?/);
  });
});

// ── A.14: \Sigma in GREEK_LETTERS ────────────────────────────────────────────

describe('A.14 — \\Sigma Greek letter', () => {
  it('\\Sigma → Σ token', () => {
    const tokens = new Lexer('\\Sigma\n').tokenize();
    expect(tokens[0]?.value).toBe('Σ');
  });

  it('\\Sigma used as identifier compiles', () => {
    const { c } = compile('f(Σ) = Σ + 1\n');
    expect(c).toContain('__uni_Sigma');
  });
});

// ── A.5: where block topological sort ────────────────────────────────────────

describe('A.5 — where block topological sort', () => {
  it('out-of-order defs are sorted correctly', () => {
    const { c } = compile(`
energy(m) = E
  where
    E = k * m
    k = 9.81
`);
    // k must appear before E in the output
    const kIdx = c.indexOf('mc_num k = ');
    const eIdx = c.indexOf('mc_num E = ');
    expect(kIdx).toBeGreaterThan(-1);
    expect(eIdx).toBeGreaterThan(-1);
    expect(kIdx).toBeLessThan(eIdx);
  });

  it('chain of 3 defs sorted correctly', () => {
    const { c } = compile(`
f(x) = c
  where
    c = b * 2
    b = a + 1
    a = x * x
`);
    const aIdx = c.indexOf('mc_num a = ');
    const bIdx = c.indexOf('mc_num b = ');
    const cIdx = c.indexOf('mc_num c = ');
    expect(aIdx).toBeLessThan(bIdx);
    expect(bIdx).toBeLessThan(cIdx);
  });
});

// ── A.7: runtime guard for equal-length arrays ───────────────────────────────

describe('A.7 — runtime length guard for array params', () => {
  it('two num[] params → length guard emitted', () => {
    const { c } = compile('f(a: num[], b: num[]) = a[0] + b[0]\n');
    expect(c).toContain('if (a_len != b_len) return NAN;');
  });

  it('single num[] param → no guard', () => {
    const { c } = compile('f(a: num[]) = a[0]\n');
    expect(c).not.toContain('a_len != b_len');
  });

  it('three num[] params → two guards', () => {
    const { c } = compile('f(a: num[], b: num[], c: num[]) = a[0]\n');
    expect(c).toContain('if (a_len != b_len) return NAN;');
    expect(c).toContain('if (a_len != c_len) return NAN;');
  });
});

// ── A.6: .length on matrix → error ───────────────────────────────────────────

describe('A.6 — .length on matrix is a compile error', () => {
  it('matrix.length throws', () => {
    expect(() => compile('f(m: num[][]) = m.length\n')).toThrow(/\.length.*matrix|matrix.*\.length/i);
  });

  it('matrix.rows works', () => {
    const { c } = compile('f(m: num[][]) = m.rows\n');
    expect(c).toContain('m_rows');
  });

  it('matrix.cols works', () => {
    const { c } = compile('f(m: num[][]) = m.cols\n');
    expect(c).toContain('m_cols');
  });
});

// ── A.33: matrix × matrix via ⋅ ─────────────────────────────────────────────

describe('A.33 — matrix multiplication via ⋅', () => {
  it('A ⋅ B calls mc_matmul', () => {
    const { c } = compile('f(A: num[][], B: num[][]) = A ⋅ B\n');
    expect(c).toContain('mc_matmul(');
  });

  it('vector ⋅ vector still calls mc_dot, not mc_matmul in function body', () => {
    const { c } = compile('f(a: num[], b: num[]) = a ⋅ b\n');
    expect(c).toContain('mc_dot(');
    // mc_matmul appears in runtime helpers but should NOT appear as a call in function body
    // Check the function body (after the runtime helpers section)
    const fnStart = c.indexOf('mc_num f(');
    expect(fnStart).toBeGreaterThan(-1);
    const fnBody = c.slice(fnStart);
    expect(fnBody).not.toContain('mc_matmul(');
  });
});

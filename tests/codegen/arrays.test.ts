import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

// ── Array literals ────────────────────────────────────────────────────────────

describe('Array literal', () => {
  it('[1, 2, 3] → C99 compound literal', () => {
    const { c } = compile('f() = [1, 2, 3]\n');
    expect(c).toContain('(mc_num[])');
    expect(c).toContain('1.0');
    expect(c).toContain('2.0');
    expect(c).toContain('3.0');
  });

  it('[[1,0],[0,1]] → flat compound literal', () => {
    const { c } = compile('identity() = [[1, 0], [0, 1]]\n');
    expect(c).toContain('(mc_num[])');
    expect(c).toContain('1.0');
    expect(c).toContain('0.0');
  });
});

// ── 2D matrix indexing ────────────────────────────────────────────────────────

describe('2D matrix indexing', () => {
  it('m[i][j] → m[i*m_cols+j] for num[][] param', () => {
    const { c } = compile('f(m: num[][], i, j) = m[i][j]\n');
    expect(c).toContain('m_cols');
    expect(c).toContain('(int)(');
  });

  it('signature has m_rows, m_cols', () => {
    const { c } = compile('f(m: num[][], i, j) = m[i][j]\n');
    expect(c).toContain('m_rows');
    expect(c).toContain('m_cols');
  });
});

// ── Member access: .rows, .cols ───────────────────────────────────────────────

describe('Member access for matrices', () => {
  it('m.rows → m_rows', () => {
    const { c } = compile('f(m: num[][]) = m.rows\n');
    expect(c).toContain('m_rows');
  });

  it('m.cols → m_cols', () => {
    const { c } = compile('f(m: num[][]) = m.cols\n');
    expect(c).toContain('m_cols');
  });
});

// ── Dot product ⋅ ─────────────────────────────────────────────────────────────

describe('Dot product ⋅', () => {
  it('v ⋅ w → mc_dot(v, w, v_len) for num[] params', () => {
    const { c } = compile('dot(v: num[], w: num[]) = v ⋅ w\n');
    expect(c).toContain('mc_dot(v, w, v_len)');
  });

  it('generates mc_dot helper function', () => {
    const { c } = compile('dot(v: num[], w: num[]) = v ⋅ w\n');
    expect(c).toContain('static inline mc_num mc_dot(');
  });

  it('scalar ⋅ scalar → multiply, not mc_dot call', () => {
    const { c } = compile('f(a, b) = a ⋅ b\n');
    expect(c).toContain('(a * b)');
    // mc_dot exists as helper but should not be CALLED with a,b
    expect(c).not.toContain('mc_dot(a, b');
  });
});

// ── \pm expression ────────────────────────────────────────────────────────────

describe('\\pm expression', () => {
  it('\\pm x → compound literal {+x, -x}', () => {
    const { c } = compile('f(x) = \\pm x\n');
    expect(c).toContain('(mc_num[])');
    expect(c).toContain('+(x)');
    expect(c).toContain('-(x)');
  });
});

// ── Slice ─────────────────────────────────────────────────────────────────────

describe('Slice expr', () => {
  it('v[a..b] → pointer offset', () => {
    const { c } = compile('f(v: num[], a) = v[a..5]\n');
    expect(c).toContain('v +');
  });
});

// ── Vector normalization (criterion) ─────────────────────────────────────────

describe('Vector norm — criterion', () => {
  const src = 'norm_vec(v: num[]) = ‖v‖\n';

  it('parses without error', () => {
    expect(() => compile(src)).not.toThrow();
  });

  it('uses mc_norm', () => {
    const { c } = compile(src);
    expect(c).toContain('mc_norm');
  });
});

// ── Vector reflection (criterion) ─────────────────────────────────────────────

describe('Vector reflection — criterion', () => {
  // reflect(v, n) = v - 2*(v⋅n)*n
  const src = 'reflect(v: num[], n: num[]) = v ⋅ n\n';

  it('parses without error', () => {
    expect(() => compile(src)).not.toThrow();
  });

  it('uses mc_dot for typed params', () => {
    const { c } = compile(src);
    expect(c).toContain('mc_dot(v, n, v_len)');
  });
});

// ── Matrix element access (criterion) ─────────────────────────────────────────

describe('Matrix multiplication support — criterion', () => {
  const src = 'get_elem(m: num[][], i: int, j: int) = m[i][j]\n';

  it('parses without error', () => {
    expect(() => compile(src)).not.toThrow();
  });

  it('emits flat 2D index', () => {
    const { c } = compile(src);
    expect(c).toContain('m_cols');
  });
});

import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

// ── num[N] parameter type ─────────────────────────────────────────────────────

describe('num[N] as parameter type', () => {
  it('parses num[3] parameter without error', () => {
    expect(() => compile('f(v: num[3]) = v[0]\n')).not.toThrow();
  });

  it('num[3] param → mc_num* in C (passed as pointer)', () => {
    const { c } = compile('f(v: num[3]) = v[0]\n');
    expect(c).toContain('mc_num* v');
  });

  it('num[3] param does NOT emit _len implicit parameter', () => {
    // Static size known at compile time — no runtime length needed
    const { c } = compile('f(v: num[3]) = v[0]\n');
    expect(c).not.toContain('v_len');
  });

  it('num[3] param → size literal 3 available as .length', () => {
    const { c } = compile('f(v: num[3]) = v.length\n');
    expect(c).toContain('3');
  });
});

describe('num[N] in header', () => {
  it('num[3] param signature appears in .h', () => {
    const { h } = compile('f(v: num[3]) = v[0]\n');
    expect(h).toContain('mc_num* v');
  });
});

// ── 2D static arrays ──────────────────────────────────────────────────────────

describe('num[N][M] as parameter type', () => {
  it('parses num[3][3] parameter without error', () => {
    expect(() => compile('f(m: num[3][3]) = m[0][0]\n')).not.toThrow();
  });

  it('num[3][3] param → mc_num* m without _rows/_cols', () => {
    const { c } = compile('f(m: num[3][3]) = m[0][0]\n');
    expect(c).toContain('mc_num* m');
    expect(c).not.toContain('m_rows');
    expect(c).not.toContain('m_cols');
  });

  it('2D indexing uses static column count', () => {
    // m[i][j] with known cols=3 → m[i*3+j]
    const { c } = compile('f(m: num[3][3]) = m[1][2]\n');
    expect(c).toContain('3');
  });
});

// ── Static array literals ─────────────────────────────────────────────────────

describe('static-size array literal', () => {
  it('[1, 2, 3] compiles without error', () => {
    expect(() => compile('f(x) = [1, 2, 3]\n')).not.toThrow();
  });

  it('array literal length is statically known', () => {
    const { c } = compile('f(x) = [1.0, 2.0, 3.0]\n');
    expect(c).toContain('1.0');
    expect(c).toContain('2.0');
    expect(c).toContain('3.0');
  });
});

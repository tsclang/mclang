import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): string {
  return generateC(parseSource(new Lexer(src).tokenize())).c;
}

// ── m[:, j] — column slice ────────────────────────────────────────────────────

describe('codegen — m[:, j] column slice', () => {
  it('m[:, j] generates a temp array filled with column j', () => {
    const c = compile('f(m: num[][], j: int) = m[:, j]');
    expect(c).toMatch(/mc_num _col_\d+\[256\]/);
    expect(c).toMatch(/for \(int _i_\d+ = 0/);
    expect(c).toContain('m_rows');
    expect(c).toContain('m_cols');
  });

  it('loop body accesses m[i*cols+j] pattern', () => {
    const c = compile('f(m: num[][], j: int) = m[:, j]');
    // Should have row-major indexing: i*m_cols + j
    expect(c).toMatch(/\*m_cols\+\(int\)/);
  });

  it('returns temp column array by name', () => {
    const c = compile('f(m: num[][], j: int) = m[:, j]');
    // The return statement should return the temp var name
    expect(c).toMatch(/return _col_\d+/);
  });

  it('column index 0 — first column', () => {
    const c = compile('f(m: num[][], j: int) = m[:, 0]');
    expect(c).toContain('m_rows');
    expect(c).toMatch(/mc_num _col_\d+/);
  });

  it('column index as expression', () => {
    const c = compile('f(m: num[][], j: int) = m[:, j + 1]');
    expect(c).toContain('m_rows');
    expect(c).toMatch(/mc_num _col_\d+/);
  });
});

// ── m[i, :] — row slice ───────────────────────────────────────────────────────

describe('codegen — m[i, :] row slice', () => {
  it('m[i, :] returns pointer to start of row i', () => {
    const c = compile('f(m: num[][], i: int) = m[i, :]');
    // Row is contiguous: pointer arithmetic m + i*cols
    expect(c).toContain('m_cols');
    expect(c).toMatch(/m \+ \(int\)/);
  });

  it('row index as expression', () => {
    const c = compile('f(m: num[][], i: int) = m[i + 1, :]');
    expect(c).toContain('m_cols');
  });
});

// ── Parser: AST shape ─────────────────────────────────────────────────────────

describe('parser — MatrixSlice AST', () => {
  it('m[:, j] parses to MatrixSlice with rowAll=true', () => {
    const tokens = new Lexer('f(m: num[][], j: int) = m[:, j]').tokenize();
    const ast = parseSource(tokens);
    const fn = ast.body[0] as any;
    const body = fn.body[0].expr; // ExprStmt → expr
    expect(body.kind).toBe('MatrixSlice');
    expect(body.rowAll).toBe(true);
    expect(body.colAll).toBe(false);
    expect(body.colIdx.name).toBe('j');
  });

  it('m[i, :] parses to MatrixSlice with colAll=true', () => {
    const tokens = new Lexer('f(m: num[][], i: int) = m[i, :]').tokenize();
    const ast = parseSource(tokens);
    const fn = ast.body[0] as any;
    const body = fn.body[0].expr;
    expect(body.kind).toBe('MatrixSlice');
    expect(body.rowAll).toBe(false);
    expect(body.colAll).toBe(true);
    expect(body.rowIdx.name).toBe('i');
  });
});

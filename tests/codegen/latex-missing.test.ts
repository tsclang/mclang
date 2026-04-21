import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

// ── \sin x без скобок ────────────────────────────────────────────────────────

describe('\\sin x without parens', () => {
  it('\\sin x → sin(x)', () => {
    const { c } = compile('f(x) = \\sin x\n');
    expect(c).toContain('sin(');
    expect(c).not.toContain('sin()');
  });
  it('\\cos x → cos(x)', () => {
    const { c } = compile('f(x) = \\cos x\n');
    expect(c).toContain('cos(');
    expect(c).not.toContain('cos()');
  });
  it('\\ln x → log(x)', () => {
    const { c } = compile('f(x) = \\ln x\n');
    expect(c).toContain('log(');
  });
  it('\\sin x + y = sin(x) + y, not sin(x+y)', () => {
    const { c } = compile('f(x, y) = \\sin x + y\n');
    expect(c).toContain('sin(');
    // result should be (sin(x) + y), not sin((x + y))
    expect(c).toContain('+ y');
  });
  it('\\sin 2 → sin(2)', () => {
    const { c } = compile('f() = \\sin 2\n');
    expect(c).toContain('sin(2');
  });
});

// ── \min_{x \in v}, \max_{x \in v} ───────────────────────────────────────────

describe('\\min / \\max array aggregators', () => {
  it('\\min_{x \\in v} x generates loop with <', () => {
    const { c } = compile('f(v) = \\min_{x \\in v} x\n');
    expect(c).toContain('for (int');
    expect(c).toContain('<');
    expect(c).toContain('v[0]');
  });
  it('\\max_{x \\in v} x generates loop with >', () => {
    const { c } = compile('f(v) = \\max_{x \\in v} x\n');
    expect(c).toContain('for (int');
    expect(c).toContain('>');
    expect(c).toContain('v[0]');
  });
  it('\\max_{x \\in v} x*x — body expression works', () => {
    const { c } = compile('f(v) = \\max_{x \\in v} x*x\n');
    expect(c).toContain('for (int');
    expect(c).toContain('*');
  });
  it('\\min as function call still works', () => {
    const { c } = compile('f(x, y) = \\min(x, y)\n');
    expect(c).toContain('fmin(');
  });
  it('\\max as function call still works', () => {
    const { c } = compile('f(x, y) = \\max(x, y)\n');
    expect(c).toContain('fmax(');
  });
});

// ── A^{\top} → transpose(A) ───────────────────────────────────────────────────

describe('A^{\\top} postfix transpose', () => {
  it('A^{\\top} generates mc_transpose', () => {
    const { c } = compile('f(A) = A^{\\top}\n');
    expect(c).toContain('mc_transpose(');
  });
  it('A^{T} also generates transpose', () => {
    const { c } = compile('f(A) = A^{T}\n');
    expect(c).toContain('mc_transpose(');
  });
  it('A^{\\top} is equivalent to transpose(A)', () => {
    const c1 = compile('f(A) = A^{\\top}\n').c;
    const c2 = compile('f(A) = transpose(A)\n').c;
    // both should call mc_transpose
    expect(c1).toContain('mc_transpose(');
    expect(c2).toContain('mc_transpose(');
  });
});

// ── A^{-1} → inv(A) ──────────────────────────────────────────────────────────

describe('A^{-1} postfix inverse', () => {
  it('A^{-1} generates mc_inv', () => {
    const { c } = compile('f(A) = A^{-1}\n');
    expect(c).toContain('mc_inv(');
  });
  it('A^{-1} is equivalent to inv(A)', () => {
    const c1 = compile('f(A) = A^{-1}\n').c;
    const c2 = compile('f(A) = inv(A)\n').c;
    expect(c1).toContain('mc_inv(');
    expect(c2).toContain('mc_inv(');
  });
  it('regular negative powers still work: x^{-2}', () => {
    const { c } = compile('f(x) = x^{-2}\n');
    expect(c).toContain('pow(');
    // function body should use pow, not call mc_inv
    const body = c.slice(c.lastIndexOf('mc_num f('));
    expect(body).not.toContain('mc_inv(');
  });
});

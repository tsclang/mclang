import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

describe('recursion', () => {
  it('self-recursive function compiles without error', () => {
    const { c } = compile('fac(n) = if (n <= 1) 1 else n * fac(n - 1)');
    expect(c).toContain('fac(');
    expect(c).toMatch(/fac\([^)]*n[^)]*1/);
  });

  it('self-recursive function has forward declaration before body', () => {
    const { c } = compile('fac(n) = if (n <= 1) 1 else n * fac(n - 1)');
    // prototype ends with semicolon
    expect(c).toMatch(/mc_num fac\(mc_num n\);/);
    const protoIdx = c.indexOf('mc_num fac(mc_num n);');
    const bodyIdx  = c.indexOf('mc_num fac(mc_num n) {');
    expect(protoIdx).toBeGreaterThanOrEqual(0);
    expect(bodyIdx).toBeGreaterThan(protoIdx);
  });

  it('fibonacci compiles with both recursive calls', () => {
    const { c } = compile('fib(n) = if (n <= 1) n else fib(n - 1) + fib(n - 2)');
    expect(c).toMatch(/fib\([^)]*n[^)]*1/);
    expect(c).toMatch(/fib\([^)]*n[^)]*2/);
  });

  it('mutual recursion: even calls odd, odd calls even', () => {
    const src = [
      'even(n) = if (n == 0) 1 else odd(n - 1)',
      'odd(n) = if (n == 0) 0 else even(n - 1)',
    ].join('\n');
    const { c } = compile(src);
    expect(c).toContain('even(');
    expect(c).toContain('odd(');
    expect(c).toMatch(/odd\([^)]*n[^)]*1/);
    expect(c).toMatch(/even\([^)]*n[^)]*1/);
  });

  it('mutual recursion: even prototype before odd body', () => {
    const src = [
      'odd(n) = if (n == 0) 0 else even(n - 1)',
      'even(n) = if (n == 0) 1 else odd(n - 1)',
    ].join('\n');
    const { c } = compile(src);
    // even prototype must come before odd body (which calls even)
    const evenProtoIdx = c.indexOf('mc_num even(mc_num n);');
    const oddBodyIdx   = c.indexOf('mc_num odd(mc_num n) {');
    expect(evenProtoIdx).toBeGreaterThanOrEqual(0);
    expect(evenProtoIdx).toBeLessThan(oddBodyIdx);
  });

  it('private recursive function works', () => {
    const { c } = compile('_helper(n) = if (n <= 0) 0 else _helper(n - 1) + 1');
    expect(c).toContain('_helper(');
    expect(c).toMatch(/_helper\([^)]*n[^)]*1/);
  });

  it('private function not exported in header', () => {
    const { h } = compile('_helper(n) = if (n <= 0) 0 else _helper(n - 1) + 1');
    expect(h).not.toContain('_helper');
  });

  it('multiple independent functions still have prototypes', () => {
    const src = 'f(x) = x + 1\ng(x) = f(x) * 2';
    const { c } = compile(src);
    expect(c).toMatch(/mc_num f\(mc_num x\);/);
    expect(c).toMatch(/mc_num g\(mc_num x\);/);
    // Prototypes come before bodies
    const fProto = c.indexOf('mc_num f(mc_num x);');
    const fBody  = c.indexOf('mc_num f(mc_num x) {');
    expect(fProto).toBeLessThan(fBody);
  });
});

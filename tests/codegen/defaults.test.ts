import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

describe('default parameters — .c output', () => {
  it('no defaults: normal function name, no macro', () => {
    const { c } = compile('f(x, y) = x + y');
    expect(c).toContain('mc_num f(');
    expect(c).not.toMatch(/#define f\(\.\.\.\)/);
  });

  it('single default: impl renamed to _f_impl', () => {
    const { c } = compile('f(x, y = 0) = x + y');
    expect(c).toContain('_f_impl(');
    expect(c).not.toMatch(/^mc_num f\(/m);
  });

  it('single default: wrapper _f_d1 with one fewer param', () => {
    const { c } = compile('f(x, y = 0) = x + y');
    expect(c).toMatch(/static inline mc_num _f_d1\(mc_num x\)/);
  });

  it('single default: wrapper calls impl with default value', () => {
    const { c } = compile('f(x, y = 0) = x + y');
    expect(c).toMatch(/_f_d1.*\{.*return _f_impl\(x,/);
  });

  it('single default: dispatch macro defined', () => {
    const { c } = compile('f(x, y = 0) = x + y');
    expect(c).toMatch(/#define f\(\.\.\.\)/);
  });

  it('single default: macro routes 2 args to impl, 1 arg to d1', () => {
    const { c } = compile('f(x, y = 0) = x + y');
    expect(c).toMatch(/#define f\(\.\.\..*_f_impl.*_f_d1/);
  });

  it('two defaults: two wrappers generated', () => {
    const { c } = compile('f(x, y = 0, z = 1) = x + y + z');
    expect(c).toMatch(/static inline mc_num _f_d1\(/);
    expect(c).toMatch(/static inline mc_num _f_d2\(/);
  });

  it('two defaults: d1 wrapper has 2 params', () => {
    const { c } = compile('f(x, y = 0, z = 1) = x + y + z');
    expect(c).toMatch(/static inline mc_num _f_d1\(mc_num x, mc_num y\)/);
  });

  it('two defaults: d2 wrapper has 1 param', () => {
    const { c } = compile('f(x, y = 0, z = 1) = x + y + z');
    expect(c).toMatch(/static inline mc_num _f_d2\(mc_num x\)/);
  });

  it('two defaults: macro covers 3/2/1 arg variants', () => {
    const { c } = compile('f(x, y = 0, z = 1) = x + y + z');
    expect(c).toMatch(/#define f\(\.\.\..*_f_impl.*_f_d1.*_f_d2/);
  });

  it('default value expression is emitted correctly', () => {
    const { c } = compile('f(x, y = 3.14) = x + y');
    expect(c).toMatch(/_f_d1.*_f_impl\(x, 3\.14\)/);
  });
});

describe('default parameters — .h output', () => {
  it('header declares _f_impl', () => {
    const { h } = compile('f(x, y = 0) = x + y');
    expect(h).toContain('_f_impl(');
  });

  it('header contains static inline wrapper', () => {
    const { h } = compile('f(x, y = 0) = x + y');
    expect(h).toMatch(/static inline mc_num _f_d1/);
  });

  it('header contains dispatch macro', () => {
    const { h } = compile('f(x, y = 0) = x + y');
    expect(h).toMatch(/#define f\(\.\.\.\)/);
  });

  it('header does NOT export _f_impl as bare mc_num f(', () => {
    const { h } = compile('f(x, y = 0) = x + y');
    expect(h).not.toMatch(/^mc_num f\(/m);
  });
});

describe('default parameters — private functions', () => {
  it('private func with default: impl generated in .c', () => {
    const { c } = compile('_g(x, y = 0) = x + y');
    expect(c).toContain('__g_impl(');
  });

  it('private func with default: NOT exported to header', () => {
    const { h } = compile('_g(x, y = 0) = x + y');
    expect(h).not.toContain('__g_impl');
    expect(h).not.toMatch(/#define _g\(/);
  });
});

describe('default parameters — mixed with non-default functions', () => {
  it('two functions: one with default, one without', () => {
    const src = 'plain(x) = x * 2\nwith_def(x, y = 10) = x + y';
    const { c } = compile(src);
    expect(c).toMatch(/mc_num plain\(mc_num x\) \{/);
    expect(c).toMatch(/_with_def_impl\(/);
    expect(c).toMatch(/#define with_def\(\.\.\.\)/);
  });
});

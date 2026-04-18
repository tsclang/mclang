import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

// ── Runtime helper ────────────────────────────────────────────────────────────

describe('mc_interp runtime helper', () => {
  it('mc_interp is emitted in every output', () => {
    const { c } = compile('f(x) = x\n');
    expect(c).toContain('mc_interp');
  });
});

// ── Numeric key tables ────────────────────────────────────────────────────────

describe('numeric key tables', () => {
  it('emits _xs and _ys arrays', () => {
    const { c } = compile('speed = table { 0 -> 0.0, 10 -> 9.8, 20 -> 19.0 }\n');
    expect(c).toContain('_speed_xs');
    expect(c).toContain('_speed_ys');
  });

  it('emits _n count', () => {
    const { c } = compile('speed = table { 0 -> 0.0, 10 -> 9.8 }\n');
    expect(c).toContain('_speed_n = 2');
  });

  it('arrays contain the correct values', () => {
    const { c } = compile('speed = table { 0 -> 0.0, 10 -> 9.8 }\n');
    expect(c).toContain('0.0, 10.0');
    expect(c).toContain('0.0, 9.8');
  });

  it('table call dispatches to mc_interp', () => {
    const src = 'speed = table { 0 -> 0.0, 10 -> 9.8 }\nf(x) = speed(x)\n';
    const { c } = compile(src);
    expect(c).toContain('mc_interp(x, _speed_xs, _speed_ys, _speed_n)');
  });

  it('table with expression values', () => {
    const { c } = compile('tbl = table { 1 -> 2+3, 2 -> 4+5 }\n');
    expect(c).toContain('_tbl_xs');
    expect(c).toContain('(2.0 + 3.0)');
  });

  it('arrays are static const', () => {
    const { c } = compile('t = table { 1 -> 10.0 }\n');
    expect(c).toMatch(/static const mc_num _t_xs/);
    expect(c).toMatch(/static const mc_num _t_ys/);
  });
});

// ── String key tables ─────────────────────────────────────────────────────────

describe('string key tables', () => {
  it('emits a C function with strcmp', () => {
    const { c } = compile('color = table { "red" -> 1.0, "blue" -> 2.0 }\n');
    expect(c).toContain('strcmp');
    expect(c).toContain('"red"');
    expect(c).toContain('"blue"');
  });

  it('function returns correct values', () => {
    const { c } = compile('color = table { "red" -> 1.0, "blue" -> 2.0 }\n');
    expect(c).toContain('return 1.0');
    expect(c).toContain('return 2.0');
  });

  it('falls through to NAN if no match', () => {
    const { c } = compile('cat = table { "a" -> 1.0 }\n');
    expect(c).toContain('return NAN');
  });

  it('emits static function named after the const', () => {
    const { c } = compile('mymap = table { "x" -> 99.0 }\n');
    expect(c).toMatch(/static mc_num mymap\s*\(/);
  });
});

// ── Table in header ───────────────────────────────────────────────────────────

describe('table header visibility', () => {
  it('numeric table arrays are not in the header', () => {
    const { h } = compile('speed = table { 0 -> 0.0, 10 -> 9.8 }\n');
    expect(h).not.toContain('_speed_xs');
  });
});

// ── string.h included ─────────────────────────────────────────────────────────

describe('string.h inclusion', () => {
  it('output includes string.h', () => {
    const { c } = compile('f(x) = x\n');
    expect(c).toContain('#include <string.h>');
  });
});

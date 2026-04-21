import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateRust } from '../../src/codegen/rust.js';

function rustGen(src: string, base = 'test', precision: 'f64' | 'f32' | 'fixed' = 'f64') {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateRust(ast, base, precision);
}

describe('Rust bindings — simple scalar functions', () => {
  it('generates extern "C" block', () => {
    const rs = rustGen('f(x) = x * 2\n');
    expect(rs).toContain('unsafe extern "C"');
  });

  it('scalar params → f64', () => {
    const rs = rustGen('range(v0, angle) = v0 * angle\n');
    expect(rs).toContain('pub fn range(v0: f64, angle: f64) -> f64;');
  });

  it('private functions excluded', () => {
    const rs = rustGen('_helper(x) = x\npub_fn(x) = x\n');
    expect(rs).not.toContain('_helper');
    expect(rs).toContain('pub_fn');
  });
});

describe('Rust bindings — array params', () => {
  it('num[] → *const f64, i32', () => {
    const rs = rustGen('f(v: num[]) = v[0]\n');
    expect(rs).toContain('v: *const f64, v_len: i32');
  });

  it('num[][] → *const f64, i32, i32', () => {
    const rs = rustGen('f(m: num[][], n) = n\n');
    expect(rs).toContain('m: *const f64, m_rows: i32, m_cols: i32');
  });
});

describe('Rust bindings — precision', () => {
  it('f32 precision → f32', () => {
    const rs = rustGen('f(x) = x\n', 'test', 'f32');
    expect(rs).toContain('x: f32');
    expect(rs).toContain('-> f32');
  });

  it('fixed precision → i16', () => {
    const rs = rustGen('f(x) = x\n', 'test', 'fixed');
    expect(rs).toContain('x: i16');
  });
});

describe('Rust bindings — default params', () => {
  it('exposes _impl and _d1 wrappers', () => {
    const rs = rustGen('f(x, y = 0.0) = x + y\n');
    expect(rs).toContain('pub fn _f_impl(x: f64, y: f64) -> f64;');
    expect(rs).toContain('pub fn _f_d1(x: f64) -> f64;');
  });
});

describe('Rust bindings — build.rs hint', () => {
  it('includes cc crate instructions', () => {
    const rs = rustGen('f(x) = x\n', 'physics');
    expect(rs).toContain('cc::Build::new().file("physics.c")');
    expect(rs).toContain('[build-dependencies]');
  });
});

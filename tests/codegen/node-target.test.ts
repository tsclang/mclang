import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateNapiC, generateBindingGyp, generateNodeBindings } from '../../src/codegen/node-addon.js';

function napiGen(src: string, base = 'test') {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateNapiC(ast, base);
}

function gypGen(base = 'test') {
  return generateBindingGyp(base);
}

function jsGen(src: string, base = 'test') {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateNodeBindings(ast, base);
}

describe('node-addon — napi C wrapper', () => {
  it('includes node_api.h and base header', () => {
    const c = napiGen('f(x) = x\n');
    expect(c).toContain('#include <node_api.h>');
    expect(c).toContain('#include "test.h"');
  });

  it('generates wrapper and Init for scalar function', () => {
    const c = napiGen('f(x, y) = x + y\n');
    expect(c).toContain('static napi_value _js_f(');
    expect(c).toContain('napi_get_value_double(env, argv[0]');
    expect(c).toContain('napi_get_value_double(env, argv[1]');
    expect(c).toContain('mc_num _r = f(');
    expect(c).toContain('napi_create_double(env, (double)_r');
    expect(c).toContain('NAPI_MODULE(NODE_GYP_MODULE_NAME, _Init)');
  });

  it('registers function in Init', () => {
    const c = napiGen('range(v0, angle) = v0 * angle\n');
    expect(c).toContain('napi_set_named_property(env, exports, "range"');
  });

  it('private functions excluded', () => {
    const c = napiGen('_helper(x) = x\npub_fn(x) = x\n');
    expect(c).not.toContain('_js__helper');
    expect(c).toContain('_js_pub_fn');
  });

  it('array param uses napi_get_typedarray_info', () => {
    const c = napiGen('avg(v: num[], n) = v[0]\n');
    expect(c).toContain('napi_get_typedarray_info(env, argv[0]');
    expect(c).toContain('v_len = (int)_v_cnt');
  });

  it('matrix param extracts flat array + rows + cols', () => {
    const c = napiGen('trace(m: num[][], n) = n\n');
    expect(c).toContain('napi_get_typedarray_info(env, argv[0]');
    expect(c).toContain('m_rows = (int)_m_r');
    expect(c).toContain('m_cols = (int)_m_c');
  });
});

describe('node-addon — binding.gyp', () => {
  it('is valid JSON', () => {
    expect(() => JSON.parse(gypGen('mylib'))).not.toThrow();
  });

  it('includes source files', () => {
    const gyp = gypGen('mylib');
    const parsed = JSON.parse(gyp);
    const sources: string[] = parsed.targets[0].sources;
    expect(sources).toContain('mylib.c');
    expect(sources).toContain('mylib_napi.c');
  });

  it('links -lm on non-Windows', () => {
    const parsed = JSON.parse(gypGen('foo'));
    const cond = parsed.targets[0].conditions[0];
    expect(cond[0]).toContain("OS!='win'");
    expect(cond[1].libraries).toContain('-lm');
  });
});

describe('node-addon — JS loader', () => {
  it('requires the native addon', () => {
    const js = jsGen('f(x) = x\n', 'mylib');
    expect(js).toContain("require('./build/Release/mylib')");
  });

  it('exports each public function', () => {
    const js = jsGen('range(v0, a) = v0\nheight(v0, a) = a\n');
    expect(js).toContain('exports.range');
    expect(js).toContain('exports.height');
  });

  it('private functions not exported', () => {
    const js = jsGen('_helper(x) = x\npub_fn(x) = x\n');
    expect(js).not.toContain('exports._helper');
    expect(js).toContain('exports.pub_fn');
  });

  it('array-return functions note Float64Array return type', () => {
    const js = jsGen('pm(x) = \\pm x\n');
    expect(js).toContain('Float64Array');
  });
});

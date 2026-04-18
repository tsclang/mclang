import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { typeCheck, type TypeError } from '../../src/types/checker.js';

function check(src: string): TypeError[] {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return typeCheck(ast);
}

describe('type checker — argument count', () => {
  it('no errors for valid single-arg call', () => {
    expect(check('f(x) = x\ng(x) = f(x)')).toHaveLength(0);
  });

  it('no errors for valid two-arg call', () => {
    expect(check('f(x, y) = x + y\ng(a) = f(a, a)')).toHaveLength(0);
  });

  it('error: too few arguments', () => {
    const errs = check('f(x, y) = x + y\ng() = f(1)');
    expect(errs.length).toBeGreaterThan(0);
    expect(errs[0]!.message).toMatch(/argument|arity/i);
  });

  it('error: too many arguments', () => {
    const errs = check('f(x) = x\ng() = f(1, 2)');
    expect(errs.length).toBeGreaterThan(0);
    expect(errs[0]!.message).toMatch(/argument|arity/i);
  });

  it('error includes function name', () => {
    const errs = check('myFn(x, y) = x + y\ng() = myFn(1)');
    expect(errs[0]!.message).toContain('myFn');
  });
});

describe('type checker — parameter immutability', () => {
  it('error: reassigning a parameter', () => {
    const errs = check('f(x) =\n  x = 5\n  x + 1');
    expect(errs.length).toBeGreaterThan(0);
    expect(errs[0]!.message).toMatch(/immutable|parameter|assign/i);
  });

  it('error: parameter name in assignment', () => {
    const errs = check('f(a, b) =\n  a = b + 1\n  a');
    expect(errs.length).toBeGreaterThan(0);
  });

  it('no error: assigning to local variable', () => {
    expect(check('f(x) =\n  y = x + 1\n  y * 2')).toHaveLength(0);
  });

  it('no error: where-block defines new variable', () => {
    expect(check('f(x) = x + d\n  where\n    d = x * 2')).toHaveLength(0);
  });
});

describe('type checker — undefined references', () => {
  it('error: calling undefined user function', () => {
    const errs = check('f(x) = unknown_func(x)');
    expect(errs.length).toBeGreaterThan(0);
    expect(errs[0]!.message).toMatch(/undefined|unknown/i);
  });

  it('no error: calling builtin math function', () => {
    expect(check('f(x) = sin(x)')).toHaveLength(0);
  });

  it('no error: calling builtin cos', () => {
    expect(check('f(x) = cos(x) + tan(x)')).toHaveLength(0);
  });

  it('no error: calling builtin sqrt', () => {
    expect(check('f(x) = sqrt(x)')).toHaveLength(0);
  });

  it('no error: self-recursion', () => {
    expect(check('fac(n) = if (n <= 1) 1 else n * fac(n - 1)')).toHaveLength(0);
  });

  it('no error: mutual recursion', () => {
    const src = 'even(n) = if (n == 0) 1 else odd(n - 1)\nodd(n) = if (n == 0) 0 else even(n - 1)';
    expect(check(src)).toHaveLength(0);
  });

  it('no error: calling another defined function', () => {
    expect(check('double(x) = x * 2\nquad(x) = double(double(x))')).toHaveLength(0);
  });
});

describe('type checker — TypeError shape', () => {
  it('error has message and span', () => {
    const errs = check('f(x, y) = x + y\ng() = f(1)');
    expect(errs[0]).toHaveProperty('message');
    expect(errs[0]).toHaveProperty('span');
  });

  it('span has start and end with line/col', () => {
    const errs = check('f(x, y) = x + y\ng() = f(1)');
    expect(errs[0]!.span.start).toHaveProperty('line');
    expect(errs[0]!.span.start).toHaveProperty('col');
  });
});

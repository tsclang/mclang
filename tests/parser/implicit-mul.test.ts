import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/index.js';
import { parseSource } from '../../src/parser/index.js';
import { generateC } from '../../src/codegen/index.js';

function compile(src: string) {
  const lexer = new Lexer(src, 'test.mc');
  const tokens = lexer.tokenize();
  const ast = parseSource(tokens);
  return generateC(ast, { target: 'c', precision: 'f64' });
}

describe('implicit multiplication', () => {
  it('2x → 2 * x', () => {
    const { c } = compile('f(x) = 2x\n');
    expect(c).toContain('2.0 * x');
  });

  it('2(x + 1) → 2 * (x + 1)', () => {
    const { c } = compile('f(x) = 2(x + 1)\n');
    expect(c).toContain('2.0 * (');
    expect(c).toContain('(x + 1.0)');
  });

  it('2x^2 → 2 * (x^2), exponent binds tighter', () => {
    const { c } = compile('f(x) = 2x^2\n');
    expect(c).toContain('pow(x, 2.0)');
    expect(c).toContain('2.0 * pow(x, 2.0)');
  });

  it('a b c → (a * b) * c (left-associative)', () => {
    const { c } = compile('f(a, b, c) = a b c\n');
    expect(c).toContain('(a * b)');
    expect(c).toContain('* c)');
  });

  it('2\\sin(x) → 2 * sin(x)', () => {
    const { c } = compile('f(x) = 2\\sin(x)\n');
    expect(c).toContain('2.0 * sin(x)');
  });

  it('2\\sqrt{x} → 2 * sqrt(x)', () => {
    const { c } = compile('f(x) = 2\\sqrt{x}\n');
    expect(c).toContain('2.0 * sqrt(x)');
  });

  it('does not apply across newlines', () => {
    expect(() => compile('f(x) = x\ng(y) = y\n')).not.toThrow();
    const { c } = compile('f(x) = x\n');
    expect(c).toContain('return x');
  });
});

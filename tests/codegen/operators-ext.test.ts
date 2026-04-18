import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';

function compile(src: string): { c: string; h: string } {
  const tokens = new Lexer(src).tokenize();
  const ast = parseSource(tokens);
  return generateC(ast);
}

// ── <> alias for != ───────────────────────────────────────────────────────────

describe('<> operator', () => {
  it('parses x <> y without error', () => {
    expect(() => compile('f(x, y) = x <> y\n')).not.toThrow();
  });

  it('x <> y → != comparison in C', () => {
    const { c } = compile('f(x, y) = x <> y\n');
    expect(c).toContain('!=');
  });
});

// ── Unicode logical operators ─────────────────────────────────────────────────

describe('∧ (logical AND)', () => {
  it('parses x ∧ y without error', () => {
    expect(() => compile('f(x, y) = x ∧ y\n')).not.toThrow();
  });

  it('x ∧ y → && in C', () => {
    const { c } = compile('f(x, y) = x ∧ y\n');
    expect(c).toContain('&&');
  });
});

describe('∨ (logical OR)', () => {
  it('parses x ∨ y without error', () => {
    expect(() => compile('f(x, y) = x ∨ y\n')).not.toThrow();
  });

  it('x ∨ y → || in C', () => {
    const { c } = compile('f(x, y) = x ∨ y\n');
    expect(c).toContain('||');
  });
});

describe('⊕ (logical XOR)', () => {
  it('parses x ⊕ y without error', () => {
    expect(() => compile('f(x, y) = x ⊕ y\n')).not.toThrow();
  });

  it('x ⊕ y → xor logic in C', () => {
    const { c } = compile('f(x, y) = x ⊕ y\n');
    expect(c).toMatch(/\^/); // XOR emitted as ^
  });
});

describe('¬ (logical NOT)', () => {
  it('parses ¬x without error', () => {
    expect(() => compile('f(x) = ¬x\n')).not.toThrow();
  });

  it('¬x → ! in C', () => {
    const { c } = compile('f(x) = ¬x\n');
    expect(c).toContain('!');
  });
});

// ── in / !in with ranges ──────────────────────────────────────────────────────

describe('x in [a, b] (closed range)', () => {
  it('parses x in [0, 1] without error', () => {
    expect(() => compile('f(x) = x in [0, 1]\n')).not.toThrow();
  });

  it('x in [0, 1] → x >= 0 && x <= 1', () => {
    const { c } = compile('f(x) = x in [0, 1]\n');
    expect(c).toContain('>=');
    expect(c).toContain('<=');
  });
});

describe('x in (a, b) (open range)', () => {
  it('parses x in (0, 1) without error', () => {
    expect(() => compile('f(x) = x in (0, 1)\n')).not.toThrow();
  });

  it('x in (0, 1) → strict inequalities', () => {
    const { c } = compile('f(x) = x in (0, 1)\n');
    expect(c).toMatch(/>\s*\(?0/);  // (x) > (0.0) or similar
    expect(c).toMatch(/<\s*\(?1/);
  });
});

describe('x !in [a, b]', () => {
  it('parses x !in [0, 1] without error', () => {
    expect(() => compile('f(x) = x !in [0, 1]\n')).not.toThrow();
  });

  it('x !in [0, 1] → negated range check', () => {
    const { c } = compile('f(x) = x !in [0, 1]\n');
    expect(c).toContain('!');
    expect(c).toContain('>=');
    expect(c).toContain('<=');
  });
});

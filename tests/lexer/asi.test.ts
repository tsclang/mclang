import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { TokenKind } from '../../src/lexer/token.js';

function kinds(src: string): TokenKind[] {
  return new Lexer(src).tokenize().map(t => t.kind);
}

function hasNewline(src: string): boolean {
  return kinds(src).includes(TokenKind.Newline);
}

describe('ASI — line continuation', () => {
  it('emits NEWLINE between two statements on separate lines', () => {
    expect(hasNewline('a\nb')).toBe(true);
  });

  it('no NEWLINE after trailing + operator', () => {
    expect(hasNewline('x = a +\n    b')).toBe(false);
  });

  it('no NEWLINE after trailing - operator', () => {
    expect(hasNewline('x = a -\n    b')).toBe(false);
  });

  it('no NEWLINE after trailing * operator', () => {
    expect(hasNewline('x = a *\n    b')).toBe(false);
  });

  it('no NEWLINE after trailing / operator', () => {
    expect(hasNewline('x = a /\n    b')).toBe(false);
  });

  it('no NEWLINE after trailing == operator', () => {
    expect(hasNewline('x = a ==\n    b')).toBe(false);
  });

  it('no NEWLINE inside parens — single arg', () => {
    expect(hasNewline('f(\n  a\n)')).toBe(false);
  });

  it('no NEWLINE inside parens — multi-line call', () => {
    expect(hasNewline('f(a,\n  b)')).toBe(false);
  });

  it('no NEWLINE inside square brackets', () => {
    expect(hasNewline('[a,\n  b,\n  c]')).toBe(false);
  });

  it('no NEWLINE inside curly braces', () => {
    expect(hasNewline('table {\n  1 -> 2\n}')).toBe(false);
  });

  it('NEWLINE after closing paren at top level', () => {
    expect(hasNewline('f(a)\ng(b)')).toBe(true);
  });

  it('no NEWLINE inside nested parens', () => {
    expect(hasNewline('f(g(a,\n  b),\n  c)')).toBe(false);
  });

  it('NEWLINE restored after paren closes', () => {
    const ks = kinds('f(a,\n  b)\nx');
    // After f(...) closes, the next newline before x should be emitted
    expect(ks).toContain(TokenKind.Newline);
  });

  it('no NEWLINE after comma at top level inside bracket', () => {
    expect(hasNewline('[1,\n2,\n3]')).toBe(false);
  });
});

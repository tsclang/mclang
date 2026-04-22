import { describe, it, expect } from 'vitest';
import { Lexer, LexerError, TokenKind } from '../../src/lexer/index.js';

function lex(source: string) {
  return new Lexer(source, 'test.mc').tokenize();
}

function kinds(source: string): TokenKind[] {
  return lex(source).map(t => t.kind);
}

function values(source: string): string[] {
  return lex(source).map(t => t.value);
}

// ── T-001: Number literals ─────────────────────────────────────────────────
describe('T-001: Number literals', () => {
  it('tokenizes integer', () => {
    const toks = lex('42');
    expect(toks[0]?.kind).toBe(TokenKind.Number);
    expect(toks[0]?.value).toBe('42');
  });

  it('tokenizes float', () => {
    const toks = lex('3.14');
    expect(toks[0]?.kind).toBe(TokenKind.Number);
    expect(toks[0]?.value).toBe('3.14');
  });

  it('tokenizes scientific notation 1e9', () => {
    const toks = lex('1e9');
    expect(toks[0]?.kind).toBe(TokenKind.Number);
    expect(toks[0]?.value).toBe('1e9');
  });

  it('tokenizes scientific notation 1e-9', () => {
    const toks = lex('1e-9');
    expect(toks[0]?.kind).toBe(TokenKind.Number);
    expect(toks[0]?.value).toBe('1e-9');
  });

  it('tokenizes 6.674e-11', () => {
    const toks = lex('6.674e-11');
    expect(toks[0]?.kind).toBe(TokenKind.Number);
    expect(toks[0]?.value).toBe('6.674e-11');
  });
});

// ── T-002: ASCII identifiers ───────────────────────────────────────────────
describe('T-002: ASCII identifiers', () => {
  it('tokenizes simple identifier', () => {
    const toks = lex('foo');
    expect(toks[0]?.kind).toBe(TokenKind.Identifier);
    expect(toks[0]?.value).toBe('foo');
  });

  it('tokenizes identifier with underscore prefix (private)', () => {
    const toks = lex('_helper');
    expect(toks[0]?.kind).toBe(TokenKind.Identifier);
    expect(toks[0]?.value).toBe('_helper');
  });

  it('recognizes keyword `where`', () => {
    expect(kinds('where')[0]).toBe(TokenKind.KwWhere);
  });
});

// ── T-003: Unicode identifiers ─────────────────────────────────────────────
describe('T-003: Unicode identifiers', () => {
  it('tokenizes Greek letter π', () => {
    const toks = lex('π');
    expect(toks[0]?.kind).toBe(TokenKind.Identifier);
    expect(toks[0]?.value).toBe('π');
  });

  it('tokenizes \\pi as identifier π', () => {
    const toks = lex('\\pi');
    expect(toks[0]?.kind).toBe(TokenKind.Identifier);
    expect(toks[0]?.value).toBe('π');
  });

  it('tokenizes \\alpha as identifier α', () => {
    const toks = lex('\\alpha');
    expect(toks[0]?.kind).toBe(TokenKind.Identifier);
    expect(toks[0]?.value).toBe('α');
  });
});

// ── T-004: LaTeX commands → tokens ────────────────────────────────────────
describe('T-004: LaTeX commands', () => {
  it('\\lfloor → FloorOpen token', () => {
    expect(kinds('\\lfloor')[0]).toBe(TokenKind.FloorOpen);
  });

  it('\\rfloor → FloorClose token', () => {
    expect(kinds('\\rfloor')[0]).toBe(TokenKind.FloorClose);
  });

  it('\\lceil → CeilOpen token', () => {
    expect(kinds('\\lceil')[0]).toBe(TokenKind.CeilOpen);
  });

  it('\\rceil → CeilClose token', () => {
    expect(kinds('\\rceil')[0]).toBe(TokenKind.CeilClose);
  });

  it('\\lVert → NormOpen token', () => {
    expect(kinds('\\lVert')[0]).toBe(TokenKind.NormOpen);
  });

  it('\\frac → Frac token', () => {
    expect(kinds('\\frac')[0]).toBe(TokenKind.Frac);
  });

  it('\\sqrt → Sqrt token', () => {
    expect(kinds('\\sqrt')[0]).toBe(TokenKind.Sqrt);
  });

  it('\\sum → Sum token', () => {
    expect(kinds('\\sum')[0]).toBe(TokenKind.Sum);
  });

  it('\\leq → Leq2 token (≤)', () => {
    expect(kinds('\\leq')[0]).toBe(TokenKind.Leq2);
  });

  it('\\neq → Neq2 token (≠)', () => {
    expect(kinds('\\neq')[0]).toBe(TokenKind.Neq2);
  });
});

// ── T-005: Trig synonyms ──────────────────────────────────────────────────
describe('T-005: Trig synonyms', () => {
  it('tg → tan', () => {
    const toks = lex('tg');
    expect(toks[0]?.value).toBe('tan');
  });

  it('ctg → cot', () => {
    const toks = lex('ctg');
    expect(toks[0]?.value).toBe('cot');
  });

  it('sh → sinh', () => {
    const toks = lex('sh');
    expect(toks[0]?.value).toBe('sinh');
  });

  it('arctg → atan', () => {
    const toks = lex('arctg');
    expect(toks[0]?.value).toBe('atan');
  });
});

// ── T-006: Pipe disambiguation ────────────────────────────────────────────
describe('T-006: Pipe disambiguation |', () => {
  it('| at start of expression → AbsOpen', () => {
    const toks = lex('|x|');
    expect(toks[0]?.kind).toBe(TokenKind.AbsOpen);
  });

  it('closing | after identifier → AbsClose', () => {
    const toks = lex('|x|');
    // toks: AbsOpen, Identifier, AbsClose, EOF
    expect(toks[2]?.kind).toBe(TokenKind.AbsClose);
  });

  it('|| is Or token', () => {
    const toks = lex('a || b');
    expect(toks[1]?.kind).toBe(TokenKind.Or);
  });

  it('| after ) is AbsClose', () => {
    const toks = lex('|(x+y)|');
    expect(toks[0]?.kind).toBe(TokenKind.AbsOpen);
    // Last | before EOF
    const lastPipe = toks.slice(0, -1).reverse().find(t => t.value === '|');
    expect(lastPipe?.kind).toBe(TokenKind.AbsClose);
  });
});

// ── T-007: Sigma/Gamma lookahead ──────────────────────────────────────────
describe('T-007: \\sigma and \\Gamma lookahead', () => {
  it('\\sigma{ → Sigma (function)', () => {
    const toks = lex('\\sigma{');
    expect(toks[0]?.kind).toBe(TokenKind.Sigma);
  });

  it('\\sigma alone → SigmaId (identifier)', () => {
    const toks = lex('\\sigma ');
    expect(toks[0]?.kind).toBe(TokenKind.SigmaId);
  });

  it('\\Gamma{ → Gamma (function)', () => {
    const toks = lex('\\Gamma{');
    expect(toks[0]?.kind).toBe(TokenKind.Gamma);
  });

  it('\\Gamma alone → GammaId (identifier)', () => {
    const toks = lex('\\Gamma ');
    expect(toks[0]?.kind).toBe(TokenKind.GammaId);
  });
});

// ── T-008: INDENT/DEDENT ──────────────────────────────────────────────────
describe('T-008: INDENT and DEDENT', () => {
  it('indented block emits Indent then Dedent', () => {
    const src = `fn f(x)
  x + 1`;
    const k = kinds(src);
    expect(k).toContain(TokenKind.Indent);
    expect(k).toContain(TokenKind.Dedent);
  });

  it('Indent comes after Newline', () => {
    const src = `fn f(x)\n  x`;
    const k = kinds(src);
    const newlineIdx = k.indexOf(TokenKind.Newline);
    const indentIdx = k.indexOf(TokenKind.Indent);
    expect(indentIdx).toBeGreaterThan(newlineIdx);
  });
});

// ── T-009: Degree and Factorial ───────────────────────────────────────────
describe('T-009: Degree ° and Factorial !', () => {
  it('° after number → Degree token', () => {
    const toks = lex('90°');
    expect(toks[0]?.kind).toBe(TokenKind.Number);
    expect(toks[1]?.kind).toBe(TokenKind.Degree);
  });

  it('n! after identifier → Factorial token', () => {
    const toks = lex('n!');
    expect(toks[0]?.kind).toBe(TokenKind.Identifier);
    expect(toks[1]?.kind).toBe(TokenKind.Factorial);
  });

  it('! at start → Not token', () => {
    const toks = lex('!x');
    expect(toks[0]?.kind).toBe(TokenKind.Not);
  });
});

// ── T-010: Comment skipping ───────────────────────────────────────────────
describe('T-010: Comment skipping', () => {
  it('// comment is skipped', () => {
    const toks = lex('x // this is a comment\ny');
    const identifiers = toks.filter(t => t.kind === TokenKind.Identifier);
    expect(identifiers.map(t => t.value)).toEqual(['x', 'y']);
  });

  it('full line comment is skipped', () => {
    const toks = lex('// only a comment\nx');
    const identifiers = toks.filter(t => t.kind === TokenKind.Identifier);
    expect(identifiers[0]?.value).toBe('x');
  });

  it('# comment is skipped', () => {
    const toks = lex('x # this is a comment\ny');
    const identifiers = toks.filter(t => t.kind === TokenKind.Identifier);
    expect(identifiers.map(t => t.value)).toEqual(['x', 'y']);
  });

  it('full # line comment is skipped', () => {
    const toks = lex('# only a comment\nx');
    const identifiers = toks.filter(t => t.kind === TokenKind.Identifier);
    expect(identifiers[0]?.value).toBe('x');
  });
});

// ── Span tracking ─────────────────────────────────────────────────────────
describe('Span tracking', () => {
  it('tracks line and col for first token', () => {
    const toks = lex('foo');
    expect(toks[0]?.span.start.line).toBe(1);
    expect(toks[0]?.span.start.col).toBe(1);
  });

  it('tracks line for second line token', () => {
    const toks = lex('x\ny');
    const y = toks.find(t => t.value === 'y');
    expect(y?.span.start.line).toBe(2);
    expect(y?.span.start.col).toBe(1);
  });
});

// ── Error cases ───────────────────────────────────────────────────────────
describe('Lexer errors', () => {
  it('E-010: throws on unknown LaTeX command', () => {
    expect(() => lex('\\unknowncmd')).toThrow(LexerError);
  });

  it('unknown character throws LexerError', () => {
    expect(() => lex('@')).toThrow(LexerError);
  });
});

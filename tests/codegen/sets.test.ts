import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import { generateC } from '../../src/codegen/codegen.js';
import { TokenKind } from '../../src/lexer/token.js';

function compile(src: string): string {
  return generateC(parseSource(new Lexer(src).tokenize())).c;
}

function tokens(src: string) {
  return new Lexer(src).tokenize().map(t => t.kind);
}

// ── Lexer ─────────────────────────────────────────────────────────────────────

describe('lexer — set tokens', () => {
  it('ℕ → KwSetN', () => expect(tokens('ℕ')).toContain(TokenKind.KwSetN));
  it('ℤ → KwSetZ', () => expect(tokens('ℤ')).toContain(TokenKind.KwSetZ));
  it('ℝ → KwSetR', () => expect(tokens('ℝ')).toContain(TokenKind.KwSetR));
  it('ℚ → KwSetQ', () => expect(tokens('ℚ')).toContain(TokenKind.KwSetQ));
  it('ℂ → KwSetC', () => expect(tokens('ℂ')).toContain(TokenKind.KwSetC));

  it('\\mathbb{N} → KwSetN', () => expect(tokens('\\mathbb{N}')).toContain(TokenKind.KwSetN));
  it('\\mathbb{Z} → KwSetZ', () => expect(tokens('\\mathbb{Z}')).toContain(TokenKind.KwSetZ));
  it('\\mathbb{R} → KwSetR', () => expect(tokens('\\mathbb{R}')).toContain(TokenKind.KwSetR));
  it('\\mathbb{Q} → KwSetQ', () => expect(tokens('\\mathbb{Q}')).toContain(TokenKind.KwSetQ));
  it('\\mathbb{C} → KwSetC', () => expect(tokens('\\mathbb{C}')).toContain(TokenKind.KwSetC));
});

// ── Codegen: x in ℕ / x ∈ ℕ ──────────────────────────────────────────────────

describe('codegen — x in ℕ (natural numbers)', () => {
  it('x in ℕ → non-negative integer check', () => {
    const c = compile('f(x) = x in ℕ');
    expect(c).toMatch(/>=\s*0/);
    expect(c).toContain('fmod');
  });

  it('x in \\mathbb{N} — same as Unicode form', () => {
    const c = compile('f(x) = x in \\mathbb{N}');
    expect(c).toMatch(/>=\s*0/);
    expect(c).toContain('fmod');
  });

  it('x ∈ ℕ — Unicode in operator', () => {
    const c = compile('f(x) = x ∈ ℕ');
    expect(c).toMatch(/>=\s*0/);
    expect(c).toContain('fmod');
  });
});

describe('codegen — x in ℤ (integers)', () => {
  it('x in ℤ → integer check (fmod)', () => {
    const c = compile('f(x) = x in ℤ');
    expect(c).toContain('fmod');
    // Only divisibility check — no non-negativity. Extract function body to avoid
    // false positives from runtime helpers (e.g. mc_factorial uses n>=0).
    const body = c.split('mc_num f(')[1] ?? '';
    expect(body).not.toMatch(/>=\s*\(?0/);
  });

  it('x in \\mathbb{Z} — same result', () => {
    expect(compile('f(x) = x in \\mathbb{Z}')).toContain('fmod');
  });
});

describe('codegen — x in ℝ (reals)', () => {
  it('x in ℝ → isfinite check', () => {
    const c = compile('f(x) = x in ℝ');
    expect(c).toContain('isfinite');
  });

  it('x in \\mathbb{R} — same result', () => {
    expect(compile('f(x) = x in \\mathbb{R}')).toContain('isfinite');
  });

  it('x ∈ ℝ — Unicode form', () => {
    expect(compile('f(x) = x ∈ ℝ')).toContain('isfinite');
  });
});

describe('codegen — x in ℚ (rationals)', () => {
  it('x in ℚ → isfinite (rationals ≈ reals in float)', () => {
    expect(compile('f(x) = x in ℚ')).toContain('isfinite');
  });
});

describe('codegen — x in ℂ (complex)', () => {
  it('x in ℂ → always true (1)', () => {
    const c = compile('f(x) = x in ℂ');
    expect(c).toMatch(/1[^=]|return 1/);
  });
});

// ── Negation: x !in / x ∉ ───────────────────────────────────────────────────

describe('codegen — negation', () => {
  it('x !in ℕ → negated check', () => {
    const c = compile('f(x) = x !in ℕ');
    expect(c).toContain('!');
    expect(c).toContain('fmod');
  });

  it('x ∉ ℤ → negated integer check', () => {
    const c = compile('f(x) = x ∉ ℤ');
    expect(c).toContain('!');
    expect(c).toContain('fmod');
  });

  it('x ∉ ℝ → !isfinite', () => {
    const c = compile('f(x) = x ∉ ℝ');
    expect(c).toMatch(/!.*isfinite|isfinite.*!/);
  });
});

// ── Where guard ───────────────────────────────────────────────────────────────

describe('codegen — set guard in where block', () => {
  it('where guard: n ∈ ℕ → if (!...) return NAN', () => {
    const src = 'f(n) = n * 2\n  where\n    n ∈ ℕ';
    const c = compile(src);
    expect(c).toContain('return NAN');
    expect(c).toContain('fmod');
  });
});

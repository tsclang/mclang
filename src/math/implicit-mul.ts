import { type Token, TokenKind, token } from '../lexer/token.js';

// Tokens that end a value expression
const VALUE_END = new Set<TokenKind>([
  TokenKind.Number,
  TokenKind.Identifier,
  TokenKind.RParen,
  TokenKind.RBracket,
  TokenKind.Factorial,
  TokenKind.Degree,
  TokenKind.KwNaN,
  TokenKind.KwInf,
  TokenKind.KwTrue,
  TokenKind.KwFalse,
  TokenKind.SigmaId,
  TokenKind.GammaId,
]);

// LaTeX/special tokens that start an implicit-multipliable expression
const IMPLICIT_START = new Set<TokenKind>([
  TokenKind.Number,
  TokenKind.Frac,
  TokenKind.Sqrt,
  TokenKind.Sigma,
  TokenKind.Gamma,
  TokenKind.Bar,
  TokenKind.Sum,
  TokenKind.Prod,
  TokenKind.Sin,   TokenKind.Cos,    TokenKind.Tan,
  TokenKind.Cot,   TokenKind.Sec,    TokenKind.Csc,
  TokenKind.Arcsin,TokenKind.Arccos, TokenKind.Arctan,
  TokenKind.Sinh,  TokenKind.Cosh,   TokenKind.Tanh,
  TokenKind.Log,   TokenKind.Lg,     TokenKind.Ln,
  TokenKind.Binom, TokenKind.Gcd,    TokenKind.Lcm,
  TokenKind.AbsOpen,
  TokenKind.NormOpen,
  TokenKind.FloorOpen,
  TokenKind.CeilOpen,
  TokenKind.Pm,
  TokenKind.PlusMinus,
]);

function shouldInsert(prev: Token, curr: Token): boolean {
  // prev must end a value
  if (!VALUE_END.has(prev.kind)) return false;

  // LParen: insert only when prev is NOT an identifier (function calls: f( stay as-is)
  if (curr.kind === TokenKind.LParen) {
    return prev.kind !== TokenKind.Identifier;
  }

  // Identifier (not a keyword — keywords have their own token kinds):
  // insert after Number, Identifier, ), ]
  if (curr.kind === TokenKind.Identifier) return true;

  if (IMPLICIT_START.has(curr.kind)) return true;

  return false;
}

export function insertImplicitMul(tokens: Token[]): Token[] {
  const result: Token[] = [];

  for (const curr of tokens) {
    // Find last non-structural token in result, but do NOT cross Newline boundaries
    let prev: Token | undefined;
    for (let i = result.length - 1; i >= 0; i--) {
      const k = result[i]!.kind;
      if (k === TokenKind.Newline) break; // statement boundary — stop
      if (k !== TokenKind.Indent && k !== TokenKind.Dedent) {
        prev = result[i];
        break;
      }
    }

    if (prev && shouldInsert(prev, curr)) {
      result.push(token(TokenKind.Star, '*', curr.span));
    }

    result.push(curr);
  }

  return result;
}

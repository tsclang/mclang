import type { Span } from '../types/index.js';
import type { Token, TokenKind } from '../lexer/token.js';

export type ParseDiagnostic = {
  message: string;
  span: Span;
  hint?: string;
};

export class ParseError extends Error {
  readonly diagnostic: ParseDiagnostic;

  constructor(diag: ParseDiagnostic) {
    super(diag.message);
    this.name = 'ParseError';
    this.diagnostic = diag;
  }
}

export function unexpectedToken(token: Token, expected: string): ParseError {
  return new ParseError({
    message: `Expected ${expected}, got '${token.value}' (${token.kind})`,
    span: token.span,
    hint: `Replace this token with ${expected}.`,
  });
}

export function unexpectedEof(span: Span, expected: string): ParseError {
  return new ParseError({
    message: `Unexpected end of file, expected ${expected}`,
    span,
  });
}

export function expectedKind(token: Token, kind: TokenKind): ParseError {
  return new ParseError({
    message: `Expected '${kind}', got '${token.value}' (${token.kind})`,
    span: token.span,
  });
}

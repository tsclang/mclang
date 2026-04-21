import type { Span } from '../types/index.js';
import type { Token, TokenKind } from '../lexer/token.js';
export type ParseDiagnostic = {
    message: string;
    span: Span;
    hint?: string;
};
export declare class ParseError extends Error {
    readonly diagnostic: ParseDiagnostic;
    constructor(diag: ParseDiagnostic);
}
export declare function unexpectedToken(token: Token, expected: string): ParseError;
export declare function unexpectedEof(span: Span, expected: string): ParseError;
export declare function expectedKind(token: Token, kind: TokenKind): ParseError;
//# sourceMappingURL=error.d.ts.map
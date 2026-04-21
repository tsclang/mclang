export class ParseError extends Error {
    diagnostic;
    constructor(diag) {
        super(diag.message);
        this.name = 'ParseError';
        this.diagnostic = diag;
    }
}
export function unexpectedToken(token, expected) {
    return new ParseError({
        message: `Expected ${expected}, got '${token.value}' (${token.kind})`,
        span: token.span,
        hint: `Replace this token with ${expected}.`,
    });
}
export function unexpectedEof(span, expected) {
    return new ParseError({
        message: `Unexpected end of file, expected ${expected}`,
        span,
    });
}
export function expectedKind(token, kind) {
    return new ParseError({
        message: `Expected '${kind}', got '${token.value}' (${token.kind})`,
        span: token.span,
    });
}
//# sourceMappingURL=error.js.map
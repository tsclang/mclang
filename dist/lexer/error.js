// Re-export diagnostics types used by the lexer.
// The lexer builds Diagnostic values and throws CompilerError on fatal issues.
export { CompilerError as LexerError, DiagnosticBag, formatDiagnostic, formatDiagnostics, } from '../diagnostics/index.js';
//# sourceMappingURL=error.js.map
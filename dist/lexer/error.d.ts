import type { Span } from '../types/index.js';
export type DiagnosticLevel = 'error' | 'warning';
export type Diagnostic = {
    level: DiagnosticLevel;
    code: string;
    message: string;
    span: Span;
    hint?: string;
    notes?: string[];
};
export declare class LexerError extends Error {
    readonly diagnostic: Diagnostic;
    constructor(diagnostic: Diagnostic);
}
export declare function formatDiagnostic(diag: Diagnostic, source: string): string;
//# sourceMappingURL=error.d.ts.map
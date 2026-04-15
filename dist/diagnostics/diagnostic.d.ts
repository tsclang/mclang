import type { Span } from '../types/index.js';
import type { ErrorCode } from './codes.js';
export type DiagnosticLevel = 'error' | 'warning' | 'info';
/** A labelled source location shown inside a diagnostic. */
export type Label = {
    span: Span;
    /** Short message printed under the underline. */
    message: string;
    /** Primary labels get ^^^ (red/yellow), secondary labels get --- (blue). */
    primary: boolean;
};
/**
 * A single compiler diagnostic (error, warning, or info note).
 *
 * Rendered as:
 *
 *   Error [E030]: Cannot reassign parameter 'x'
 *     --> physics.mc:4:5
 *      |
 *    4 |     x = x + 1
 *      |     ^ parameter 'x' is immutable
 *      |
 *    1 | f(x) =
 *      | - 'x' declared here as a parameter
 *      |
 *     = Hint: Create a local variable instead: y = x + 1
 */
export type Diagnostic = {
    level: DiagnosticLevel;
    code: ErrorCode;
    message: string;
    /** The primary labelled location (always shown first). */
    primary: Label;
    /** Optional additional labelled locations (shown after primary). */
    secondary?: Label[];
    /** Free-form hint shown at the bottom. May contain newlines for multi-line hints. */
    hint?: string;
    /** Additional notes shown below the hint. */
    notes?: string[];
};
/** Collects diagnostics during a compilation pass. */
export declare class DiagnosticBag {
    private readonly _items;
    get items(): readonly Diagnostic[];
    get hasErrors(): boolean;
    get errorCount(): number;
    get warningCount(): number;
    add(diag: Diagnostic): void;
    /** Convenience: add an error and immediately throw it. */
    fatal(diag: Diagnostic): never;
}
/** Thrown when a fatal diagnostic is emitted via DiagnosticBag.fatal(). */
export declare class CompilerError extends Error {
    readonly diagnostic: Diagnostic;
    constructor(diagnostic: Diagnostic);
}
//# sourceMappingURL=diagnostic.d.ts.map
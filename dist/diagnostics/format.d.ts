import type { Diagnostic } from './diagnostic.js';
export type FormatOptions = {
    /** Number of context lines to show around each labelled location (default 0). */
    contextLines?: number;
    /** Whether to emit ANSI colour codes (default: auto-detect via NO_COLOR). */
    color?: boolean;
};
/**
 * Format a diagnostic in the Rust-inspired style.
 *
 * Example output (with colour):
 *
 *   error[E030]: Cannot reassign parameter 'x'
 *     --> physics.mc:4:5
 *      |
 *    4 |     x = x + 1
 *      |     ^ parameter 'x' is immutable
 *      |
 *    1 | f(x) =
 *      | - 'x' declared here as a parameter
 *      |
 *     = hint: Create a local variable instead: y = x + 1
 */
export declare function formatDiagnostic(diag: Diagnostic, sources: Map<string, string>, opts?: FormatOptions): string;
/**
 * Format multiple diagnostics, separated by a blank line.
 * Appends a summary line: "2 errors, 1 warning".
 */
export declare function formatDiagnostics(diags: readonly Diagnostic[], sources: Map<string, string>, opts?: FormatOptions): string;
/**
 * Return the documentation string for a given error code.
 * Used by `mclang --explain E030`.
 */
export declare function explainCode(code: string): string | undefined;
//# sourceMappingURL=format.d.ts.map
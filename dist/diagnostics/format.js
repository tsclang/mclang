import { ERROR_DESCRIPTIONS } from './codes.js';
// ── ANSI colour helpers ───────────────────────────────────────────────────
function isNoColor() {
    return (process.env['NO_COLOR'] !== undefined ||
        process.env['TERM'] === 'dumb');
}
function ansi(code, text) {
    if (isNoColor())
        return text;
    return `\x1b[${code}m${text}\x1b[0m`;
}
const red = (s) => ansi('31;1', s);
const yellow = (s) => ansi('33;1', s);
const blue = (s) => ansi('34;1', s);
const cyan = (s) => ansi('36', s);
const bold = (s) => ansi('1', s);
const dim = (s) => ansi('2', s);
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
export function formatDiagnostic(diag, sources, opts = {}) {
    const context = opts.contextLines ?? 0;
    const useColor = opts.color ?? !isNoColor();
    const col = useColor
        ? { red, yellow, blue, cyan, bold, dim }
        : {
            red: identity, yellow: identity, blue: identity,
            cyan: identity, bold: identity, dim: identity,
        };
    const levelStr = diag.level === 'error' ? col.red(col.bold('error'))
        : diag.level === 'warning' ? col.yellow(col.bold('warning'))
            : col.cyan(col.bold('info'));
    const parts = [];
    // ── Header ──────────────────────────────────────────────────────────────
    parts.push(`${levelStr}[${col.bold(diag.code)}]: ${col.bold(diag.message)}`);
    // ── File location (primary span) ─────────────────────────────────────────
    const { span } = diag.primary;
    parts.push(`  ${col.dim('-->')} ${span.file}:${span.start.line}:${span.start.col}`);
    // ── Labelled source snippets ──────────────────────────────────────────────
    const allLabels = [diag.primary, ...(diag.secondary ?? [])];
    // Group labels by file so we emit one block per file
    const byFile = new Map();
    for (const label of allLabels) {
        const file = label.span.file;
        const arr = byFile.get(file) ?? [];
        arr.push(label);
        byFile.set(file, arr);
    }
    for (const [file, labels] of byFile) {
        const source = sources.get(file) ?? '';
        const sourceLines = source.split('\n');
        // Collect all line numbers we need to show (labels + context)
        const lineSet = new Set();
        for (const label of labels) {
            const lo = Math.max(1, label.span.start.line - context);
            const hi = Math.min(sourceLines.length, label.span.end.line + context);
            for (let l = lo; l <= hi; l++)
                lineSet.add(l);
        }
        const linesToShow = [...lineSet].sort((a, b) => a - b);
        // Width of the widest line number
        const maxLineNum = linesToShow[linesToShow.length - 1] ?? 1;
        const w = String(maxLineNum).length;
        const pad = ' '.repeat(w);
        const bar = col.dim(`${pad} |`);
        parts.push(bar);
        let prev = null;
        for (const lineNum of linesToShow) {
            // Gap marker
            if (prev !== null && lineNum > prev + 1) {
                parts.push(col.dim(`${pad} :`));
            }
            prev = lineNum;
            const src = sourceLines[lineNum - 1] ?? '';
            parts.push(`${col.dim(String(lineNum).padStart(w))} ${col.dim('|')} ${src}`);
            // Emit underlines for labels on this line
            for (const label of labels) {
                if (label.span.start.line !== lineNum)
                    continue;
                const startCol = label.span.start.col;
                const endCol = label.span.end.line === lineNum
                    ? label.span.end.col
                    : src.length + 1;
                const underlineLen = Math.max(1, endCol - startCol);
                const spaces = ' '.repeat(startCol - 1);
                let underline;
                if (label.primary) {
                    const carets = '^'.repeat(underlineLen);
                    const coloured = diag.level === 'error' ? col.red(carets) : col.yellow(carets);
                    underline = `${pad} ${col.dim('|')} ${spaces}${coloured} ${label.message}`;
                }
                else {
                    const dashes = '-'.repeat(underlineLen);
                    underline = `${pad} ${col.dim('|')} ${spaces}${col.blue(dashes)} ${col.dim(label.message)}`;
                }
                parts.push(underline);
            }
        }
        parts.push(bar);
    }
    // ── Hint ──────────────────────────────────────────────────────────────────
    if (diag.hint !== undefined) {
        const lines = diag.hint.split('\n');
        const prefix = ` ${col.cyan('=')} ${col.bold('hint')}: `;
        const indent = ' '.repeat(prefix.replace(/\x1b\[[^m]*m/g, '').length);
        parts.push(lines.map((l, i) => (i === 0 ? prefix : indent) + l).join('\n'));
    }
    // ── Notes ─────────────────────────────────────────────────────────────────
    for (const note of diag.notes ?? []) {
        const noteLines = note.split('\n');
        const prefix = ` ${col.dim('=')} ${col.bold('note')}: `;
        const indent = ' '.repeat(prefix.replace(/\x1b\[[^m]*m/g, '').length);
        parts.push(noteLines.map((l, i) => (i === 0 ? prefix : indent) + l).join('\n'));
    }
    return parts.join('\n');
}
/**
 * Format multiple diagnostics, separated by a blank line.
 * Appends a summary line: "2 errors, 1 warning".
 */
export function formatDiagnostics(diags, sources, opts = {}) {
    const useColor = opts.color ?? !isNoColor();
    const col = useColor
        ? { red, yellow, bold, dim }
        : { red: identity, yellow: identity, bold: identity, dim: identity };
    const formatted = diags.map(d => formatDiagnostic(d, sources, opts));
    const errors = diags.filter(d => d.level === 'error').length;
    const warnings = diags.filter(d => d.level === 'warning').length;
    const parts = [...formatted];
    if (errors > 0 || warnings > 0) {
        const errPart = errors > 0 ? col.red(col.bold(`${errors} error${errors !== 1 ? 's' : ''}`)) : '';
        const wrnPart = warnings > 0 ? col.yellow(col.bold(`${warnings} warning${warnings !== 1 ? 's' : ''}`)) : '';
        const summary = [errPart, wrnPart].filter(Boolean).join(', ');
        parts.push(`\n${col.bold('aborting due to')} ${summary}`);
    }
    return parts.join('\n\n');
}
/**
 * Return the documentation string for a given error code.
 * Used by `mclang --explain E030`.
 */
export function explainCode(code) {
    const entry = Object.entries(ERROR_DESCRIPTIONS).find(([k]) => k === code);
    if (entry === undefined)
        return undefined;
    return `${code}: ${entry[1]}`;
}
// ── Helpers ───────────────────────────────────────────────────────────────
function identity(s) { return s; }
//# sourceMappingURL=format.js.map
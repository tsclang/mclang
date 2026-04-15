export class LexerError extends Error {
    diagnostic;
    constructor(diagnostic) {
        super(diagnostic.message);
        this.diagnostic = diagnostic;
        this.name = 'LexerError';
    }
}
// Format a diagnostic in the Rust-inspired style:
//
//   Error [E001]: <message>
//     --> file.mc:2:5
//      |
//    2 |     x = x + 1
//      |     ^ <label>
//      |
//     = Hint: <suggestion>
//
export function formatDiagnostic(diag, source) {
    const lines = source.split('\n');
    const { start } = diag.span;
    const lineNum = start.line;
    const colNum = start.col;
    const sourceLine = lines[lineNum - 1] ?? '';
    const lineNumWidth = String(lineNum).length;
    const pad = ' '.repeat(lineNumWidth);
    const arrow = ' '.repeat(colNum - 1) + '^';
    const level = diag.level === 'error' ? 'Error' : 'Warning';
    const header = `${level} [${diag.code}]: ${diag.message}`;
    const location = `  --> ${diag.span.file}:${lineNum}:${colNum}`;
    const separator = `${pad} |`;
    const codeLine = `${String(lineNum).padStart(lineNumWidth)} | ${sourceLine}`;
    const indicator = `${pad} | ${arrow}`;
    const parts = [header, location, separator, codeLine, indicator, separator];
    if (diag.hint !== undefined) {
        parts.push(` = Hint: ${diag.hint}`);
    }
    for (const note of diag.notes ?? []) {
        parts.push(` = Note: ${note}`);
    }
    return parts.join('\n');
}
//# sourceMappingURL=error.js.map
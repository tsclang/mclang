/** Collects diagnostics during a compilation pass. */
export class DiagnosticBag {
    _items = [];
    get items() {
        return this._items;
    }
    get hasErrors() {
        return this._items.some(d => d.level === 'error');
    }
    get errorCount() {
        return this._items.filter(d => d.level === 'error').length;
    }
    get warningCount() {
        return this._items.filter(d => d.level === 'warning').length;
    }
    add(diag) {
        this._items.push(diag);
    }
    /** Convenience: add an error and immediately throw it. */
    fatal(diag) {
        this.add(diag);
        throw new CompilerError(diag);
    }
}
/** Thrown when a fatal diagnostic is emitted via DiagnosticBag.fatal(). */
export class CompilerError extends Error {
    diagnostic;
    constructor(diagnostic) {
        super(diagnostic.message);
        this.diagnostic = diagnostic;
        this.name = 'CompilerError';
    }
}
//# sourceMappingURL=diagnostic.js.map
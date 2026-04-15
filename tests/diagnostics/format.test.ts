import { describe, it, expect } from 'vitest';
import {
  formatDiagnostic,
  formatDiagnostics,
  explainCode,
  ErrorCode,
} from '../../src/diagnostics/index.js';
import type { Diagnostic } from '../../src/diagnostics/index.js';

// Always pass { color: false } to formatDiagnostic calls for predictable output
const NO_COLOR_OPTS = { color: false } as const;

function makeSpan(file: string, line: number, col: number, endCol?: number) {
  return {
    file,
    start: { line, col, offset: 0 },
    end:   { line, col: endCol ?? col, offset: 0 },
  };
}

// ── formatDiagnostic ──────────────────────────────────────────────────────

describe('formatDiagnostic', () => {
  it('renders error header with code and message', () => {
    const diag: Diagnostic = {
      level: 'error',
      code: ErrorCode.ImmutableParameter,
      message: "Cannot reassign parameter 'x'",
      primary: {
        span: makeSpan('file.mc', 2, 5, 6),
        message: "parameter 'x' is immutable",
        primary: true,
      },
      hint: 'Create a local variable instead: y = x + 1',
    };
    const sources = new Map([['file.mc', 'f(x) =\n    x = x + 1\n    x']]);
    const out = formatDiagnostic(diag, sources, NO_COLOR_OPTS);

    expect(out).toContain('error[E030]');
    expect(out).toContain("Cannot reassign parameter 'x'");
    expect(out).toContain('--> file.mc:2:5');
  });

  it('underlines correct number of chars (^)', () => {
    const diag: Diagnostic = {
      level: 'error',
      code: ErrorCode.ImmutableParameter,
      message: "Cannot reassign parameter 'x'",
      primary: {
        span: makeSpan('file.mc', 2, 5, 6),  // 1 char
        message: "immutable",
        primary: true,
      },
    };
    const sources = new Map([['file.mc', 'f(x) =\n    x = x + 1']]);
    const out = formatDiagnostic(diag, sources, NO_COLOR_OPTS);
    // 4 spaces indent + 1 caret
    expect(out).toMatch(/\s{4}\^\s/);
  });

  it('underlines a range of chars (^^^^)', () => {
    const diag: Diagnostic = {
      level: 'error',
      code: ErrorCode.UnknownLatexCommand,
      message: "Unknown LaTeX command '\\unknown'",
      primary: {
        span: makeSpan('file.mc', 1, 8, 16),  // 8 chars
        message: 'not in the supported LaTeX table',
        primary: true,
      },
    };
    const sources = new Map([['file.mc', 'f(x) = \\unknown{x}']]);
    const out = formatDiagnostic(diag, sources, NO_COLOR_OPTS);
    expect(out).toContain('^^^^^^^^');
  });

  it('renders secondary label with dashes', () => {
    const diag: Diagnostic = {
      level: 'error',
      code: ErrorCode.ImmutableParameter,
      message: "Cannot reassign parameter 'x'",
      primary: {
        span: makeSpan('file.mc', 2, 5, 6),
        message: 'assignment here',
        primary: true,
      },
      secondary: [{
        span: makeSpan('file.mc', 1, 3, 4),
        message: "'x' declared here as a parameter",
        primary: false,
      }],
    };
    const sources = new Map([['file.mc', 'f(x) =\n    x = x + 1']]);
    const out = formatDiagnostic(diag, sources, NO_COLOR_OPTS);
    expect(out).toContain('-');
    expect(out).toContain("'x' declared here as a parameter");
  });

  it('renders hint at the bottom', () => {
    const diag: Diagnostic = {
      level: 'error',
      code: ErrorCode.ExplicitReturn,
      message: "'return' is not allowed",
      primary: {
        span: makeSpan('file.mc', 2, 5, 11),
        message: 'explicit return not needed',
        primary: true,
      },
      hint: 'The last expression is returned automatically.',
    };
    const sources = new Map([['file.mc', 'f(x) =\n    return x + 1']]);
    const out = formatDiagnostic(diag, sources, NO_COLOR_OPTS);
    expect(out).toContain('hint:');
    expect(out).toContain('The last expression is returned automatically.');
  });

  it('renders notes', () => {
    const diag: Diagnostic = {
      level: 'warning',
      code: ErrorCode.DivisionByZero,
      message: 'Division by zero at compile time',
      primary: {
        span: makeSpan('file.mc', 1, 7, 12),
        message: "result will be 'inf'",
        primary: true,
      },
      notes: ['mclang follows IEEE 754: 1/0 = inf, 0/0 = nan'],
    };
    const sources = new Map([['file.mc', 'f() = 1 / 0']]);
    const out = formatDiagnostic(diag, sources, NO_COLOR_OPTS);
    expect(out).toContain('warning[W001]');
    expect(out).toContain('note:');
    expect(out).toContain('IEEE 754');
  });

  it('shows context lines when contextLines > 0', () => {
    const source = 'line1\nline2\nf(x) =\n    x = 1\nline5';
    const diag: Diagnostic = {
      level: 'error',
      code: ErrorCode.ImmutableParameter,
      message: 'test',
      primary: {
        span: makeSpan('f.mc', 4, 5, 6),
        message: 'here',
        primary: true,
      },
    };
    const sources = new Map([['f.mc', source]]);
    const out = formatDiagnostic(diag, sources, { contextLines: 1 });
    // Should show line 3 and line 5 as context around line 4
    expect(out).toContain('f(x) =');
    expect(out).toContain('line5');
  });

  it('shows gap marker : when lines are not adjacent', () => {
    const source = Array.from({ length: 10 }, (_, i) => `line ${i + 1}`).join('\n');
    const diag: Diagnostic = {
      level: 'error',
      code: ErrorCode.ImmutableParameter,
      message: 'test',
      primary: {
        span: makeSpan('f.mc', 1, 1, 5),
        message: 'first',
        primary: true,
      },
      secondary: [{
        span: makeSpan('f.mc', 9, 1, 5),
        message: 'second',
        primary: false,
      }],
    };
    const sources = new Map([['f.mc', source]]);
    const out = formatDiagnostic(diag, sources, NO_COLOR_OPTS);
    expect(out).toContain(':');
  });
});

// ── formatDiagnostics ─────────────────────────────────────────────────────

describe('formatDiagnostics', () => {
  it('includes summary with error count', () => {
    const diag: Diagnostic = {
      level: 'error',
      code: ErrorCode.ImmutableParameter,
      message: 'test error',
      primary: { span: makeSpan('f.mc', 1, 1), message: 'x', primary: true },
    };
    const sources = new Map([['f.mc', 'x = 1']]);
    const out = formatDiagnostics([diag], sources, NO_COLOR_OPTS);
    expect(out).toContain('1 error');
    expect(out).toContain('aborting due to');
  });

  it('counts errors and warnings separately', () => {
    const err: Diagnostic = {
      level: 'error',
      code: ErrorCode.ImmutableParameter,
      message: 'err',
      primary: { span: makeSpan('f.mc', 1, 1), message: '', primary: true },
    };
    const warn: Diagnostic = {
      level: 'warning',
      code: ErrorCode.DivisionByZero,
      message: 'warn',
      primary: { span: makeSpan('f.mc', 2, 1), message: '', primary: true },
    };
    const sources = new Map([['f.mc', 'x\ny']]);
    const out = formatDiagnostics([err, warn], sources, NO_COLOR_OPTS);
    expect(out).toContain('1 error');
    expect(out).toContain('1 warning');
  });

  it('produces no summary for empty list', () => {
    const out = formatDiagnostics([], new Map());
    expect(out).not.toContain('aborting');
  });
});

// ── explainCode ───────────────────────────────────────────────────────────

describe('explainCode', () => {
  it('returns description for known code', () => {
    const result = explainCode('E030');
    expect(result).toBeDefined();
    expect(result).toContain('E030');
    expect(result).toContain('immutable');
  });

  it('returns undefined for unknown code', () => {
    expect(explainCode('E999')).toBeUndefined();
  });
});

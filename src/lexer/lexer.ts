import type { Position, Span } from '../types/index.js';
import {
  type Token,
  TokenKind,
  KEYWORDS,
  LATEX_COMMANDS,
  LATEX_UNICODE,
  TRIG_SYNONYMS,
  token,
} from './token.js';
import { LexerError, type Diagnostic } from './error.js';
import { ErrorCode } from '../diagnostics/index.js';

// Tokens after which `|` is treated as AbsClose (value context)
// Any token that can end an expression/value:
const VALUE_TOKENS = new Set<TokenKind>([
  TokenKind.Number,
  TokenKind.Identifier,
  TokenKind.RParen,
  TokenKind.RBracket,
  TokenKind.RBrace,
  TokenKind.Factorial,
  TokenKind.Degree,
  TokenKind.KwTrue,
  TokenKind.KwFalse,
  TokenKind.KwNaN,
  TokenKind.KwInf,
]);

// Greek letters → Unicode identifiers
const GREEK_LETTERS: ReadonlyMap<string, string> = new Map([
  ['\\alpha',   'α'],
  ['\\beta',    'β'],
  ['\\gamma',   'γ'],
  ['\\delta',   'δ'],
  ['\\epsilon', 'ε'],
  ['\\zeta',    'ζ'],
  ['\\eta',     'η'],
  ['\\theta',   'θ'],
  ['\\iota',    'ι'],
  ['\\kappa',   'κ'],
  ['\\lambda',  'λ'],
  ['\\mu',      'μ'],
  ['\\nu',      'ν'],
  ['\\xi',      'ξ'],
  ['\\pi',      'π'],
  ['\\rho',     'ρ'],
  ['\\tau',     'τ'],
  ['\\upsilon', 'υ'],
  ['\\phi',     'φ'],
  ['\\chi',     'χ'],
  ['\\psi',     'ψ'],
  ['\\omega',   'ω'],
  ['\\Alpha',   'Α'],
  ['\\Beta',    'Β'],
  ['\\Delta',   'Δ'],
  ['\\Epsilon', 'Ε'],
  ['\\Zeta',    'Ζ'],
  ['\\Eta',     'Η'],
  ['\\Theta',   'Θ'],
  ['\\Iota',    'Ι'],
  ['\\Kappa',   'Κ'],
  ['\\Lambda',  'Λ'],
  ['\\Mu',      'Μ'],
  ['\\Nu',      'Ν'],
  ['\\Xi',      'Ξ'],
  ['\\Pi',      'Π'],
  ['\\Rho',     'Ρ'],
  ['\\Tau',     'Τ'],
  ['\\Upsilon', 'Υ'],
  ['\\Phi',     'Φ'],
  ['\\Chi',     'Χ'],
  ['\\Psi',     'Ψ'],
  ['\\Omega',   'Ω'],
  // Note: \sigma and \Gamma handled specially (lookahead)
]);

export class Lexer {
  private readonly source: string;
  private readonly file: string;
  private pos = 0;
  private line = 1;
  private col = 1;
  private readonly tokens: Token[] = [];
  private readonly indentStack: number[] = [0];
  private lastTokenKind: TokenKind | null = null;
  private atLineStart = true;

  constructor(source: string, file = '<input>') {
    this.source = source;
    this.file = file;
  }

  tokenize(): Token[] {
    while (this.pos < this.source.length) {
      this.scanToken();
    }

    // Close any remaining indent levels
    while (this.indentStack.length > 1) {
      this.indentStack.pop();
      this.pushToken(TokenKind.Dedent, 'DEDENT');
    }

    this.pushToken(TokenKind.EOF, '');
    return this.tokens;
  }

  private scanToken(): void {
    const ch = this.current();

    // Handle indentation at line start
    if (this.atLineStart) {
      this.atLineStart = false;
      this.handleIndentation();
      // After handling indent, re-check current char (may have moved)
      if (this.pos >= this.source.length) return;
    }

    const c = this.current();

    // Whitespace (non-newline)
    if (c === ' ' || c === '\t' || c === '\r') {
      this.advance();
      return;
    }

    // Newline
    if (c === '\n') {
      this.handleNewline();
      return;
    }

    // Comments: // and #
    if ((c === '/' && this.peek(1) === '/') || c === '#') {
      this.skipLineComment();
      return;
    }

    // Numbers
    if (this.isDigit(c) || (c === '.' && this.isDigit(this.peek(1)))) {
      this.scanNumber();
      return;
    }

    // LaTeX commands starting with backslash
    if (c === '\\') {
      this.scanLatex();
      return;
    }

    // Identifiers and keywords
    if (this.isIdentStart(c)) {
      this.scanIdentifier();
      return;
    }

    // Multi-char operators
    if (c === '*' && this.peek(1) === '*') {
      this.pushTokenAt(TokenKind.StarStar, '**', 2);
      return;
    }
    if (c === '.' && this.peek(1) === '.') {
      this.pushTokenAt(TokenKind.Dot2, '..', 2);
      return;
    }
    if (c === '-' && this.peek(1) === '>') {
      this.pushTokenAt(TokenKind.Arrow, '->', 2);
      return;
    }
    if (c === ':' && this.peek(1) === '=') {
      this.pushTokenAt(TokenKind.ColonEq, ':=', 2);
      return;
    }
    if (c === '=' && this.peek(1) === '=') {
      this.pushTokenAt(TokenKind.Eq, '==', 2);
      return;
    }
    if (c === '!' && this.peek(1) === '=') {
      this.pushTokenAt(TokenKind.Neq, '!=', 2);
      return;
    }
    if (c === '<' && this.peek(1) === '=') {
      this.pushTokenAt(TokenKind.Leq, '<=', 2);
      return;
    }
    if (c === '>' && this.peek(1) === '=') {
      this.pushTokenAt(TokenKind.Geq, '>=', 2);
      return;
    }
    if (c === '&' && this.peek(1) === '&') {
      this.pushTokenAt(TokenKind.And, '&&', 2);
      return;
    }
    if (c === '|' && this.peek(1) === '|') {
      this.pushTokenAt(TokenKind.Or, '||', 2);
      return;
    }

    // Pipe: disambiguate | as AbsOpen vs AbsClose
    if (c === '|') {
      this.scanPipe();
      return;
    }

    // Postfix `!` (factorial) vs `!=` handled above
    // If we reach here and prev was a value token, it's FACTORIAL
    if (c === '!') {
      if (this.lastTokenKind !== null && VALUE_TOKENS.has(this.lastTokenKind)) {
        this.pushTokenAt(TokenKind.Factorial, '!', 1);
      } else {
        this.pushTokenAt(TokenKind.Not, '!', 1);
      }
      return;
    }

    // Single-char tokens
    const single = this.scanSingleChar(c);
    if (single !== null) {
      this.pushTokenAt(single, c, 1);
      return;
    }

    // Unicode operators and special characters
    const cp = this.source.codePointAt(this.pos);
    if (cp !== undefined) {
      const charLen = cp > 0xFFFF ? 2 : 1;
      const uchar = this.source.slice(this.pos, this.pos + charLen);
      const unicodeTok = this.scanUnicode(uchar);
      if (unicodeTok !== null) {
        this.pushTokenAt(unicodeTok, uchar, charLen);
        return;
      }

      // Unicode identifier character (Greek letters typed directly)
      if (this.isIdentStart(uchar)) {
        this.scanIdentifier();
        return;
      }
    }

    // Unknown character
    const unknownPos = this.capturePos();
    this.errorAt(
      ErrorCode.UnknownCharacter,
      `Unexpected character '${c}'`,
      'not a valid mclang character',
      unknownPos,
      undefined,
      { hint: 'Remove or replace this character.' },
    );
  }

  private handleIndentation(): void {
    let indent = 0;
    const startPos = this.capturePos();

    while (this.pos < this.source.length) {
      const c = this.current();
      if (c === ' ') {
        indent++;
        this.pos++;
        this.col++;
      } else if (c === '\t') {
        // Tabs count as 4 spaces
        indent += 4;
        this.pos++;
        this.col++;
      } else {
        break;
      }
    }

    // Skip blank lines and comment-only lines
    const c = this.current();
    if (c === '\n' || c === '\r' || (c === '/' && this.peek(1) === '/')) {
      return;
    }
    if (this.pos >= this.source.length) return;

    const currentIndent = this.indentStack[this.indentStack.length - 1] ?? 0;

    if (indent > currentIndent) {
      this.indentStack.push(indent);
      this.pushToken(TokenKind.Indent, 'INDENT');
    } else if (indent < currentIndent) {
      while (this.indentStack.length > 1) {
        const top = this.indentStack[this.indentStack.length - 1] ?? 0;
        if (top <= indent) break;
        this.indentStack.pop();
        this.pushToken(TokenKind.Dedent, 'DEDENT');
      }
      const top = this.indentStack[this.indentStack.length - 1] ?? 0;
      if (top !== indent) {
        this.errorAt(
          ErrorCode.InconsistentIndent,
          'Inconsistent indentation',
          `expected ${top} spaces, got ${indent}`,
          startPos,
          undefined,
          { hint: 'Use consistent indentation. All lines in a block must align.' },
        );
      }
    }
  }

  private handleNewline(): void {
    // Emit NEWLINE only if last meaningful token was a value (ASI)
    if (this.lastTokenKind !== null && VALUE_TOKENS.has(this.lastTokenKind)) {
      this.pushToken(TokenKind.Newline, '\n');
    }
    this.advance();
    this.line++;
    this.col = 1;
    this.atLineStart = true;
  }

  private skipLineComment(): void {
    while (this.pos < this.source.length && this.current() !== '\n') {
      this.advance();
    }
  }

  private scanNumber(): void {
    const start = this.capturePos();
    let value = '';

    // Integer part
    while (this.pos < this.source.length && this.isDigit(this.current())) {
      value += this.current();
      this.advance();
    }

    // Fractional part
    if (this.current() === '.' && this.isDigit(this.peek(1))) {
      value += '.';
      this.advance();
      while (this.pos < this.source.length && this.isDigit(this.current())) {
        value += this.current();
        this.advance();
      }
    }

    // Scientific notation: 1e9, 1e-9, 1E+3
    if ((this.current() === 'e' || this.current() === 'E')) {
      const next = this.peek(1);
      if (this.isDigit(next) || next === '+' || next === '-') {
        value += this.current();
        this.advance();
        if (this.current() === '+' || this.current() === '-') {
          value += this.current();
          this.advance();
        }
        if (!this.isDigit(this.current())) {
          const badPos = this.capturePos();
          this.errorAt(
            ErrorCode.BadScientificNotation,
            'Invalid scientific notation: expected digit after exponent sign',
            'digit expected here',
            badPos,
            undefined,
            { hint: 'Write the exponent as a number, e.g. 1e-9 or 6.674e+11' },
          );
        }
        while (this.pos < this.source.length && this.isDigit(this.current())) {
          value += this.current();
          this.advance();
        }
      }
    }

    const end = this.capturePos();
    this.emitToken(TokenKind.Number, value, start, end);
  }

  private scanLatex(): void {
    const start = this.capturePos();
    let cmd = '\\';
    this.advance(); // consume backslash

    // Read command name (letters only)
    while (this.pos < this.source.length && /[a-zA-Z]/.test(this.current())) {
      cmd += this.current();
      this.advance();
    }

    // Special lookahead: \sigma{ → std function, \sigma → identifier
    if (cmd === '\\sigma') {
      const next = this.current();
      const kind = next === '{' ? TokenKind.Sigma : TokenKind.SigmaId;
      const end = this.capturePos();
      this.emitToken(kind, cmd, start, end);
      return;
    }

    if (cmd === '\\Gamma') {
      const next = this.current();
      const kind = next === '{' ? TokenKind.Gamma : TokenKind.GammaId;
      const end = this.capturePos();
      this.emitToken(kind, cmd, start, end);
      return;
    }

    // Unicode translation (single-char tokens: \lfloor → ⌊, etc.)
    const unicode = LATEX_UNICODE.get(cmd);
    if (unicode !== undefined) {
      const end = this.capturePos();
      const kind = this.unicodeToKind(unicode);
      if (kind !== null) {
        this.emitToken(kind, unicode, start, end);
      } else {
        this.emitToken(TokenKind.Identifier, unicode, start, end);
      }
      return;
    }

    // Greek letters → Unicode identifiers
    const greek = GREEK_LETTERS.get(cmd);
    if (greek !== undefined) {
      const end = this.capturePos();
      this.emitToken(TokenKind.Identifier, greek, start, end);
      return;
    }

    // Known LaTeX commands
    const latexKind = LATEX_COMMANDS.get(cmd);
    if (latexKind !== undefined) {
      const end = this.capturePos();
      this.emitToken(latexKind, cmd, start, end);
      return;
    }

    // Unknown LaTeX command
    const end = this.capturePos();
    this.errorAt(
      ErrorCode.UnknownLatexCommand,
      `Unknown LaTeX command '${cmd}'`,
      'not in the supported LaTeX table',
      start,
      end,
      { hint: 'Supported commands: \\frac, \\sqrt, \\sin, \\cos, \\int, \\sum, ...\nSee LATEX.md for the full list.' },
    );
  }

  private scanIdentifier(): void {
    const start = this.capturePos();
    let value = '';

    // Handle multi-byte Unicode identifiers (Greek letters typed directly)
    while (this.pos < this.source.length) {
      const cp = this.source.codePointAt(this.pos);
      if (cp === undefined) break;
      const charLen = cp > 0xFFFF ? 2 : 1;
      const c = this.source.slice(this.pos, this.pos + charLen);
      if (!this.isIdentPart(c)) break;
      value += c;
      this.pos += charLen;
      this.col += charLen;
    }

    const end = this.capturePos();

    // Check trig synonyms
    const canonical = TRIG_SYNONYMS.get(value);
    if (canonical !== undefined) {
      this.emitToken(TokenKind.Identifier, canonical, start, end);
      return;
    }

    // Check keywords
    const kwKind = KEYWORDS.get(value);
    if (kwKind !== undefined) {
      this.emitToken(kwKind, value, start, end);
      return;
    }

    this.emitToken(TokenKind.Identifier, value, start, end);
  }

  private scanPipe(): void {
    // Disambiguate `|` based on previous token context.
    // If last token was a value (number, identifier, ), ]), it's AbsClose.
    // Otherwise it's AbsOpen.
    if (this.lastTokenKind !== null && VALUE_TOKENS.has(this.lastTokenKind)) {
      this.pushTokenAt(TokenKind.AbsClose, '|', 1);
    } else {
      this.pushTokenAt(TokenKind.AbsOpen, '|', 1);
    }
  }

  private scanSingleChar(c: string): TokenKind | null {
    switch (c) {
      case '+': return TokenKind.Plus;
      case '-': return TokenKind.Minus;
      case '*': return TokenKind.Star;
      case '/': return TokenKind.Slash;
      case '%': return TokenKind.Percent;
      case '^': return TokenKind.Caret;
      case '(': return TokenKind.LParen;
      case ')': return TokenKind.RParen;
      case '[': return TokenKind.LBracket;
      case ']': return TokenKind.RBracket;
      case '{': return TokenKind.LBrace;
      case '}': return TokenKind.RBrace;
      case ',': return TokenKind.Comma;
      case ':': return TokenKind.Colon;
      case ';': return TokenKind.Semicolon;
      case '<': return TokenKind.Lt;
      case '>': return TokenKind.Gt;
      case '=': return TokenKind.Assign;
      default: return null;
    }
  }

  private scanUnicode(c: string): TokenKind | null {
    switch (c) {
      case '⋅': return TokenKind.Dot;
      case '÷': return TokenKind.Divide;
      case '⨯': return TokenKind.Cross;
      case '±': return TokenKind.PlusMinus;
      case '≠': return TokenKind.Neq2;
      case '≤': return TokenKind.Leq2;
      case '≥': return TokenKind.Geq2;
      case '⌊': return TokenKind.FloorOpen;
      case '⌋': return TokenKind.FloorClose;
      case '⌈': return TokenKind.CeilOpen;
      case '⌉': return TokenKind.CeilClose;
      case '‖': return this.lastTokenKind !== null && VALUE_TOKENS.has(this.lastTokenKind)
        ? TokenKind.NormClose
        : TokenKind.NormOpen;
      case '°': return TokenKind.Degree;
      default: return null;
    }
  }

  private unicodeToKind(unicode: string): TokenKind | null {
    return this.scanUnicode(unicode);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private current(): string {
    return this.source[this.pos] ?? '';
  }

  private peek(offset: number): string {
    return this.source[this.pos + offset] ?? '';
  }

  private advance(): void {
    this.pos++;
    this.col++;
  }

  private capturePos(): Position {
    return { line: this.line, col: this.col, offset: this.pos };
  }

  private emitToken(kind: TokenKind, value: string, start: Position, end: Position): void {
    const sp: Span = { start, end, file: this.file };
    this.tokens.push(token(kind, value, sp));
    this.lastTokenKind = kind;
  }

  private pushToken(kind: TokenKind, value: string): void {
    const pos = this.capturePos();
    this.emitToken(kind, value, pos, pos);
  }

  private pushTokenAt(kind: TokenKind, value: string, len: number): void {
    const start = this.capturePos();
    for (let i = 0; i < len; i++) this.advance();
    const end = this.capturePos();
    this.emitToken(kind, value, start, end);
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private isIdentStart(c: string): boolean {
    // ASCII letters, underscore, or Unicode letter (Greek etc.)
    if (c === '_') return true;
    if (c >= 'a' && c <= 'z') return true;
    if (c >= 'A' && c <= 'Z') return true;
    const cp = c.codePointAt(0);
    if (cp === undefined) return false;
    // Greek and other Unicode letters (basic range check)
    return cp > 127 && /\p{L}/u.test(c);
  }

  private isIdentPart(c: string): boolean {
    if (this.isIdentStart(c)) return true;
    return c >= '0' && c <= '9';
  }

  private errorAt(
    code: ErrorCode,
    message: string,
    labelMsg: string,
    startPos: Position,
    endPos?: Position,
    opts: { hint?: string; notes?: string[] } = {},
  ): never {
    const end = endPos ?? startPos;
    const span: Span = { start: startPos, end, file: this.file };
    const diag: Diagnostic = {
      level: 'error',
      code,
      message,
      primary: { span, message: labelMsg, primary: true },
      ...(opts.hint  !== undefined ? { hint: opts.hint }   : {}),
      ...(opts.notes !== undefined ? { notes: opts.notes } : {}),
    };
    throw new LexerError(diag);
  }

  private warnAt(
    code: ErrorCode,
    message: string,
    labelMsg: string,
    startPos: Position,
    endPos?: Position,
    opts: { hint?: string; notes?: string[] } = {},
  ): void {
    const end = endPos ?? startPos;
    const span: Span = { start: startPos, end, file: this.file };
    const diag: Diagnostic = {
      level: 'warning',
      code,
      message,
      primary: { span, message: labelMsg, primary: true },
      ...(opts.hint  !== undefined ? { hint: opts.hint }   : {}),
      ...(opts.notes !== undefined ? { notes: opts.notes } : {}),
    };
    // Warnings are collected; fatal errors throw immediately.
    // For now we print to stderr and continue.
    process.stderr.write(message + '\n');
    void diag; // TODO: route through DiagnosticBag in phase 2
  }
}

import { KEYWORDS, LATEX_COMMANDS, LATEX_UNICODE, TRIG_SYNONYMS, token, } from './token.js';
import { LexerError } from './error.js';
// Tokens after which `|` is treated as AbsClose (value context)
// Any token that can end an expression/value:
const VALUE_TOKENS = new Set([
    "Number" /* TokenKind.Number */,
    "Identifier" /* TokenKind.Identifier */,
    ")" /* TokenKind.RParen */,
    "]" /* TokenKind.RBracket */,
    "}" /* TokenKind.RBrace */,
    "FACTORIAL" /* TokenKind.Factorial */,
    "DEGREE" /* TokenKind.Degree */,
    "true" /* TokenKind.KwTrue */,
    "false" /* TokenKind.KwFalse */,
    "nan" /* TokenKind.KwNaN */,
    "inf" /* TokenKind.KwInf */,
]);
// Greek letters → Unicode identifiers
const GREEK_LETTERS = new Map([
    ['\\alpha', 'α'],
    ['\\beta', 'β'],
    ['\\gamma', 'γ'],
    ['\\delta', 'δ'],
    ['\\epsilon', 'ε'],
    ['\\zeta', 'ζ'],
    ['\\eta', 'η'],
    ['\\theta', 'θ'],
    ['\\iota', 'ι'],
    ['\\kappa', 'κ'],
    ['\\lambda', 'λ'],
    ['\\mu', 'μ'],
    ['\\nu', 'ν'],
    ['\\xi', 'ξ'],
    ['\\pi', 'π'],
    ['\\rho', 'ρ'],
    ['\\tau', 'τ'],
    ['\\upsilon', 'υ'],
    ['\\phi', 'φ'],
    ['\\chi', 'χ'],
    ['\\psi', 'ψ'],
    ['\\omega', 'ω'],
    ['\\Alpha', 'Α'],
    ['\\Beta', 'Β'],
    ['\\Delta', 'Δ'],
    ['\\Epsilon', 'Ε'],
    ['\\Zeta', 'Ζ'],
    ['\\Eta', 'Η'],
    ['\\Theta', 'Θ'],
    ['\\Iota', 'Ι'],
    ['\\Kappa', 'Κ'],
    ['\\Lambda', 'Λ'],
    ['\\Mu', 'Μ'],
    ['\\Nu', 'Ν'],
    ['\\Xi', 'Ξ'],
    ['\\Pi', 'Π'],
    ['\\Rho', 'Ρ'],
    ['\\Tau', 'Τ'],
    ['\\Upsilon', 'Υ'],
    ['\\Phi', 'Φ'],
    ['\\Chi', 'Χ'],
    ['\\Psi', 'Ψ'],
    ['\\Omega', 'Ω'],
    // Note: \sigma and \Gamma handled specially (lookahead)
]);
export class Lexer {
    source;
    file;
    pos = 0;
    line = 1;
    col = 1;
    tokens = [];
    indentStack = [0];
    lastTokenKind = null;
    atLineStart = true;
    constructor(source, file = '<input>') {
        this.source = source;
        this.file = file;
    }
    tokenize() {
        while (this.pos < this.source.length) {
            this.scanToken();
        }
        // Close any remaining indent levels
        while (this.indentStack.length > 1) {
            this.indentStack.pop();
            this.pushToken("DEDENT" /* TokenKind.Dedent */, 'DEDENT');
        }
        this.pushToken("EOF" /* TokenKind.EOF */, '');
        return this.tokens;
    }
    scanToken() {
        const ch = this.current();
        // Handle indentation at line start
        if (this.atLineStart) {
            this.atLineStart = false;
            this.handleIndentation();
            // After handling indent, re-check current char (may have moved)
            if (this.pos >= this.source.length)
                return;
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
        // Comment //
        if (c === '/' && this.peek(1) === '/') {
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
            this.pushTokenAt("**" /* TokenKind.StarStar */, '**', 2);
            return;
        }
        if (c === '.' && this.peek(1) === '.') {
            this.pushTokenAt(".." /* TokenKind.Dot2 */, '..', 2);
            return;
        }
        if (c === '-' && this.peek(1) === '>') {
            this.pushTokenAt("->" /* TokenKind.Arrow */, '->', 2);
            return;
        }
        if (c === ':' && this.peek(1) === '=') {
            this.pushTokenAt(":=" /* TokenKind.ColonEq */, ':=', 2);
            return;
        }
        if (c === '=' && this.peek(1) === '=') {
            this.pushTokenAt("==" /* TokenKind.Eq */, '==', 2);
            return;
        }
        if (c === '!' && this.peek(1) === '=') {
            this.pushTokenAt("!=" /* TokenKind.Neq */, '!=', 2);
            return;
        }
        if (c === '<' && this.peek(1) === '=') {
            this.pushTokenAt("<=" /* TokenKind.Leq */, '<=', 2);
            return;
        }
        if (c === '>' && this.peek(1) === '=') {
            this.pushTokenAt(">=" /* TokenKind.Geq */, '>=', 2);
            return;
        }
        if (c === '&' && this.peek(1) === '&') {
            this.pushTokenAt("&&" /* TokenKind.And */, '&&', 2);
            return;
        }
        if (c === '|' && this.peek(1) === '|') {
            this.pushTokenAt("||" /* TokenKind.Or */, '||', 2);
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
                this.pushTokenAt("FACTORIAL" /* TokenKind.Factorial */, '!', 1);
            }
            else {
                this.pushTokenAt("!" /* TokenKind.Not */, '!', 1);
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
        this.errorAt(`Unexpected character '${c}'`, this.pos, {
            hint: `Remove or replace this character.`,
        });
    }
    handleIndentation() {
        let indent = 0;
        const startPos = this.pos;
        while (this.pos < this.source.length) {
            const c = this.current();
            if (c === ' ') {
                indent++;
                this.pos++;
                this.col++;
            }
            else if (c === '\t') {
                // Tabs count as 4 spaces
                indent += 4;
                this.pos++;
                this.col++;
            }
            else {
                break;
            }
        }
        // Skip blank lines and comment-only lines
        const c = this.current();
        if (c === '\n' || c === '\r' || (c === '/' && this.peek(1) === '/')) {
            return;
        }
        if (this.pos >= this.source.length)
            return;
        const currentIndent = this.indentStack[this.indentStack.length - 1] ?? 0;
        if (indent > currentIndent) {
            this.indentStack.push(indent);
            this.pushToken("INDENT" /* TokenKind.Indent */, 'INDENT');
        }
        else if (indent < currentIndent) {
            while (this.indentStack.length > 1) {
                const top = this.indentStack[this.indentStack.length - 1] ?? 0;
                if (top <= indent)
                    break;
                this.indentStack.pop();
                this.pushToken("DEDENT" /* TokenKind.Dedent */, 'DEDENT');
            }
            const top = this.indentStack[this.indentStack.length - 1] ?? 0;
            if (top !== indent) {
                this.errorAt(`Inconsistent indentation`, startPos, {
                    hint: `Expected ${top} spaces but got ${indent}. Use consistent indentation.`,
                });
            }
        }
    }
    handleNewline() {
        // Emit NEWLINE only if last meaningful token was a value (ASI)
        if (this.lastTokenKind !== null && VALUE_TOKENS.has(this.lastTokenKind)) {
            this.pushToken("NEWLINE" /* TokenKind.Newline */, '\n');
        }
        this.advance();
        this.line++;
        this.col = 1;
        this.atLineStart = true;
    }
    skipLineComment() {
        while (this.pos < this.source.length && this.current() !== '\n') {
            this.advance();
        }
    }
    scanNumber() {
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
                    this.errorAt(`Invalid scientific notation: expected digit after exponent`, this.pos, {
                        hint: `Write the exponent as a number, e.g. 1e-9`,
                    });
                }
                while (this.pos < this.source.length && this.isDigit(this.current())) {
                    value += this.current();
                    this.advance();
                }
            }
        }
        const end = this.capturePos();
        this.emitToken("Number" /* TokenKind.Number */, value, start, end);
    }
    scanLatex() {
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
            const kind = next === '{' ? "\\sigma" /* TokenKind.Sigma */ : "\\sigma_id" /* TokenKind.SigmaId */;
            const end = this.capturePos();
            this.emitToken(kind, cmd, start, end);
            return;
        }
        if (cmd === '\\Gamma') {
            const next = this.current();
            const kind = next === '{' ? "\\Gamma" /* TokenKind.Gamma */ : "\\Gamma_id" /* TokenKind.GammaId */;
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
            }
            else {
                this.emitToken("Identifier" /* TokenKind.Identifier */, unicode, start, end);
            }
            return;
        }
        // Greek letters → Unicode identifiers
        const greek = GREEK_LETTERS.get(cmd);
        if (greek !== undefined) {
            const end = this.capturePos();
            this.emitToken("Identifier" /* TokenKind.Identifier */, greek, start, end);
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
        this.emitTokenAt(`Unknown LaTeX command: ${cmd}`, start, {
            hint: `Check the command spelling. Supported commands are listed in LATEX.md.`,
        });
    }
    scanIdentifier() {
        const start = this.capturePos();
        let value = '';
        // Handle multi-byte Unicode identifiers (Greek letters typed directly)
        while (this.pos < this.source.length) {
            const cp = this.source.codePointAt(this.pos);
            if (cp === undefined)
                break;
            const charLen = cp > 0xFFFF ? 2 : 1;
            const c = this.source.slice(this.pos, this.pos + charLen);
            if (!this.isIdentPart(c))
                break;
            value += c;
            this.pos += charLen;
            this.col += charLen;
        }
        const end = this.capturePos();
        // Check trig synonyms
        const canonical = TRIG_SYNONYMS.get(value);
        if (canonical !== undefined) {
            this.emitToken("Identifier" /* TokenKind.Identifier */, canonical, start, end);
            return;
        }
        // Check keywords
        const kwKind = KEYWORDS.get(value);
        if (kwKind !== undefined) {
            this.emitToken(kwKind, value, start, end);
            return;
        }
        this.emitToken("Identifier" /* TokenKind.Identifier */, value, start, end);
    }
    scanPipe() {
        // Disambiguate `|` based on previous token context.
        // If last token was a value (number, identifier, ), ]), it's AbsClose.
        // Otherwise it's AbsOpen.
        if (this.lastTokenKind !== null && VALUE_TOKENS.has(this.lastTokenKind)) {
            this.pushTokenAt("|" /* TokenKind.AbsClose */, '|', 1);
        }
        else {
            this.pushTokenAt("|" /* TokenKind.AbsOpen */, '|', 1);
        }
    }
    scanSingleChar(c) {
        switch (c) {
            case '+': return "+" /* TokenKind.Plus */;
            case '-': return "-" /* TokenKind.Minus */;
            case '*': return "*" /* TokenKind.Star */;
            case '/': return "/" /* TokenKind.Slash */;
            case '%': return "%" /* TokenKind.Percent */;
            case '^': return "^" /* TokenKind.Caret */;
            case '(': return "(" /* TokenKind.LParen */;
            case ')': return ")" /* TokenKind.RParen */;
            case '[': return "[" /* TokenKind.LBracket */;
            case ']': return "]" /* TokenKind.RBracket */;
            case '{': return "{" /* TokenKind.LBrace */;
            case '}': return "}" /* TokenKind.RBrace */;
            case ',': return "," /* TokenKind.Comma */;
            case ':': return ":" /* TokenKind.Colon */;
            case ';': return ";" /* TokenKind.Semicolon */;
            case '<': return "<" /* TokenKind.Lt */;
            case '>': return ">" /* TokenKind.Gt */;
            case '=': return "=" /* TokenKind.Assign */;
            default: return null;
        }
    }
    scanUnicode(c) {
        switch (c) {
            case '⋅': return "\u22C5" /* TokenKind.Dot */;
            case '÷': return "\u00F7" /* TokenKind.Divide */;
            case '⨯': return "\u2A2F" /* TokenKind.Cross */;
            case '±': return "\u00B1" /* TokenKind.PlusMinus */;
            case '≠': return "\u2260" /* TokenKind.Neq2 */;
            case '≤': return "\u2264" /* TokenKind.Leq2 */;
            case '≥': return "\u2265" /* TokenKind.Geq2 */;
            case '⌊': return "\u230A" /* TokenKind.FloorOpen */;
            case '⌋': return "\u230B" /* TokenKind.FloorClose */;
            case '⌈': return "\u2308" /* TokenKind.CeilOpen */;
            case '⌉': return "\u2309" /* TokenKind.CeilClose */;
            case '‖': return this.lastTokenKind !== null && VALUE_TOKENS.has(this.lastTokenKind)
                ? "\u2016" /* TokenKind.NormClose */
                : "\u2016" /* TokenKind.NormOpen */;
            case '°': return "DEGREE" /* TokenKind.Degree */;
            default: return null;
        }
    }
    unicodeToKind(unicode) {
        return this.scanUnicode(unicode);
    }
    // ── Helpers ──────────────────────────────────────────────────────────────
    current() {
        return this.source[this.pos] ?? '';
    }
    peek(offset) {
        return this.source[this.pos + offset] ?? '';
    }
    advance() {
        this.pos++;
        this.col++;
    }
    capturePos() {
        return { line: this.line, col: this.col, offset: this.pos };
    }
    emitToken(kind, value, start, end) {
        const sp = { start, end, file: this.file };
        this.tokens.push(token(kind, value, sp));
        this.lastTokenKind = kind;
    }
    pushToken(kind, value) {
        const pos = this.capturePos();
        this.emitToken(kind, value, pos, pos);
    }
    pushTokenAt(kind, value, len) {
        const start = this.capturePos();
        for (let i = 0; i < len; i++)
            this.advance();
        const end = this.capturePos();
        this.emitToken(kind, value, start, end);
    }
    isDigit(c) {
        return c >= '0' && c <= '9';
    }
    isIdentStart(c) {
        // ASCII letters, underscore, or Unicode letter (Greek etc.)
        if (c === '_')
            return true;
        if (c >= 'a' && c <= 'z')
            return true;
        if (c >= 'A' && c <= 'Z')
            return true;
        const cp = c.codePointAt(0);
        if (cp === undefined)
            return false;
        // Greek and other Unicode letters (basic range check)
        return cp > 127 && /\p{L}/u.test(c);
    }
    isIdentPart(c) {
        if (this.isIdentStart(c))
            return true;
        return c >= '0' && c <= '9';
    }
    errorAt(message, posOrOffset, opts = {}) {
        const pos = typeof posOrOffset === 'number'
            ? { line: this.line, col: this.col, offset: posOrOffset }
            : posOrOffset;
        const span = { start: pos, end: pos, file: this.file };
        const diag = {
            level: 'error',
            code: 'E000',
            message,
            span,
            ...(opts.hint !== undefined ? { hint: opts.hint } : {}),
            ...(opts.notes !== undefined ? { notes: opts.notes } : {}),
        };
        throw new LexerError(diag);
    }
    emitTokenAt(message, start, opts = {}) {
        const span = { start, end: this.capturePos(), file: this.file };
        const diag = {
            level: 'error',
            code: 'E000',
            message,
            span,
            ...(opts.hint !== undefined ? { hint: opts.hint } : {}),
        };
        throw new LexerError(diag);
    }
}
//# sourceMappingURL=lexer.js.map
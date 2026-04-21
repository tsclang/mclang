import { unexpectedToken, expectedKind, } from './error.js';
export class Parser {
    tokens;
    pos = 0;
    constructor(tokens) {
        this.tokens = tokens;
    }
    parse() {
        const start = this.peek().span.start;
        const body = [];
        while (!this.check("EOF" /* TokenKind.EOF */)) {
            this.skipNewlines();
            if (this.check("EOF" /* TokenKind.EOF */))
                break;
            body.push(this.parseTopLevel());
        }
        const end = this.peek().span.end;
        return { kind: 'File', body, span: this.mkSpan(start, end) };
    }
    // ── Top-level ───────────────────────────────────────────────────────────────
    parseTopLevel() {
        if (this.check("import" /* TokenKind.KwImport */) || this.check("from" /* TokenKind.KwFrom */)) {
            return this.parseImport();
        }
        const t = this.peek();
        if (t.kind !== "Identifier" /* TokenKind.Identifier */) {
            throw unexpectedToken(t, 'identifier or import');
        }
        // lookahead: identifier followed by `(` → func def
        const next = this.peekAt(1);
        if (next.kind === "(" /* TokenKind.LParen */) {
            return this.parseFuncDef();
        }
        // identifier followed by `=` → const def
        if (next.kind === "=" /* TokenKind.Assign */) {
            return this.parseConstDef();
        }
        throw unexpectedToken(next, '( or =');
    }
    parseImport() {
        const start = this.peek().span.start;
        const isFrom = this.check("from" /* TokenKind.KwFrom */);
        this.advance(); // consume 'import' or 'from'
        // Accept string literal or bare identifier as path
        const pathTok = this.peek();
        if (pathTok.kind !== "Identifier" /* TokenKind.Identifier */ && pathTok.kind !== "string_lit" /* TokenKind.StringLit */) {
            throw unexpectedToken(pathTok, 'import path');
        }
        const path = pathTok.value;
        this.advance();
        let alias;
        let names;
        if (isFrom) {
            // from "./file.mc" import name [, name2]
            this.expect("import" /* TokenKind.KwImport */);
            names = [this.expectIdent()];
            while (this.check("," /* TokenKind.Comma */)) {
                this.advance();
                names.push(this.expectIdent());
            }
        }
        else {
            // import "./file.mc" [as alias]
            if (this.check("as" /* TokenKind.KwAs */)) {
                this.advance();
                alias = this.expectIdent();
            }
        }
        this.skipNewlines();
        const end = this.prev().span.end;
        return { kind: 'ImportDef', path, alias, names, span: this.mkSpan(start, end) };
    }
    parseConstDef() {
        const start = this.peek().span.start;
        const name = this.expectIdent();
        this.expect("=" /* TokenKind.Assign */);
        const value = this.parseExpr();
        this.skipNewlines();
        const end = this.prev().span.end;
        return { kind: 'ConstDef', name, value, span: this.mkSpan(start, end) };
    }
    parseFuncDef() {
        const start = this.peek().span.start;
        const name = this.expectIdent();
        this.expect("(" /* TokenKind.LParen */);
        const params = this.parseParams();
        this.expect(")" /* TokenKind.RParen */);
        this.expect("=" /* TokenKind.Assign */);
        let body;
        let where;
        if (this.check("INDENT" /* TokenKind.Indent */)) {
            // Block body: func(x) =\n  INDENT stmts DEDENT
            // (no Newline emitted after `=` since Assign is not a value token)
            this.expect("INDENT" /* TokenKind.Indent */);
            ({ stmts: body, where } = this.parseBlockBody());
            this.expect("DEDENT" /* TokenKind.Dedent */);
        }
        else {
            // Inline body: func(x) = expr
            const expr = this.parseExpr();
            body = [{ kind: 'ExprStmt', expr, span: expr.span }];
            this.skipNewlines();
            // Check for where block: INDENT KwWhere ...
            if (this.check("INDENT" /* TokenKind.Indent */)) {
                this.advance(); // consume INDENT
                where = this.parseWhereBlock();
                this.expect("DEDENT" /* TokenKind.Dedent */);
            }
        }
        const end = this.prev().span.end;
        return { kind: 'FuncDef', name, params, body, where, span: this.mkSpan(start, end) };
    }
    // ── Params ──────────────────────────────────────────────────────────────────
    parseParams() {
        const params = [];
        if (this.check(")" /* TokenKind.RParen */))
            return params;
        params.push(this.parseParam());
        while (this.check("," /* TokenKind.Comma */)) {
            this.advance();
            params.push(this.parseParam());
        }
        return params;
    }
    parseParam() {
        const start = this.peek().span.start;
        const name = this.expectIdent();
        let type;
        let def;
        if (this.check(":" /* TokenKind.Colon */)) {
            this.advance();
            type = this.parseType();
        }
        if (this.check("=" /* TokenKind.Assign */)) {
            this.advance();
            def = this.parseExpr();
        }
        const end = this.prev().span.end;
        return { name, type, default: def, span: this.mkSpan(start, end) };
    }
    parseType() {
        if (this.check("int" /* TokenKind.KwInt */)) {
            this.advance();
            return { kind: 'IntType' };
        }
        if (this.check("bool" /* TokenKind.KwBool */)) {
            this.advance();
            return { kind: 'BoolType' };
        }
        this.expect("num" /* TokenKind.KwNum */);
        let dims = 0;
        let staticSize;
        while (this.check("[" /* TokenKind.LBracket */)) {
            this.advance();
            dims++;
            if (this.check("Number" /* TokenKind.Number */)) {
                staticSize = Number(this.advance().value);
            }
            this.expect("]" /* TokenKind.RBracket */);
        }
        return { kind: 'NumType', dims, staticSize };
    }
    // ── Block body ──────────────────────────────────────────────────────────────
    parseBlockBody() {
        const stmts = [];
        let where;
        while (!this.check("DEDENT" /* TokenKind.Dedent */) && !this.check("EOF" /* TokenKind.EOF */)) {
            this.skipNewlines();
            if (this.check("DEDENT" /* TokenKind.Dedent */) || this.check("EOF" /* TokenKind.EOF */))
                break;
            if (this.check("where" /* TokenKind.KwWhere */)) {
                where = this.parseWhereBlock();
                break; // where is always last
            }
            stmts.push(this.parseStmt());
        }
        return { stmts, where };
    }
    // ── Where block ─────────────────────────────────────────────────────────────
    parseWhereBlock() {
        const start = this.peek().span.start;
        this.expect("where" /* TokenKind.KwWhere */);
        this.skipNewlines();
        this.expect("INDENT" /* TokenKind.Indent */);
        const lines = [];
        while (!this.check("DEDENT" /* TokenKind.Dedent */) && !this.check("EOF" /* TokenKind.EOF */)) {
            this.skipNewlines();
            if (this.check("DEDENT" /* TokenKind.Dedent */) || this.check("EOF" /* TokenKind.EOF */))
                break;
            lines.push(this.parseWhereLine());
            this.skipNewlines();
        }
        this.expect("DEDENT" /* TokenKind.Dedent */);
        const end = this.prev().span.end;
        return { kind: 'WhereBlock', lines, span: this.mkSpan(start, end) };
    }
    parseWhereLine() {
        const start = this.peek().span.start;
        // identifier followed by `=` (not `==`) → WhereDef
        if (this.check("Identifier" /* TokenKind.Identifier */) && this.peekAt(1).kind === "=" /* TokenKind.Assign */) {
            const name = this.expectIdent();
            this.advance(); // consume `=`
            const value = this.parseExpr();
            const end = this.prev().span.end;
            return { kind: 'WhereDef', name, value, span: this.mkSpan(start, end) };
        }
        // Otherwise it's a guard expression
        const expr = this.parseExpr();
        const end = this.prev().span.end;
        return { kind: 'WhereGuard', expr, span: this.mkSpan(start, end) };
    }
    // ── Statements ──────────────────────────────────────────────────────────────
    parseStmt() {
        if (this.check("for" /* TokenKind.KwFor */))
            return this.parseFor();
        if (this.check("while" /* TokenKind.KwWhile */))
            return this.parseWhile();
        if (this.check("if" /* TokenKind.KwIf */))
            return this.parseIfStmt();
        // identifier followed by `=` (not `==`) → AssignStmt
        if (this.check("Identifier" /* TokenKind.Identifier */) && this.peekAt(1).kind === "=" /* TokenKind.Assign */) {
            return this.parseAssign();
        }
        // Otherwise expression statement
        const start = this.peek().span.start;
        const expr = this.parseExpr();
        this.skipNewlines();
        const end = this.prev().span.end;
        return { kind: 'ExprStmt', expr, span: this.mkSpan(start, end) };
    }
    parseAssign() {
        const start = this.peek().span.start;
        const name = this.expectIdent();
        this.expect("=" /* TokenKind.Assign */);
        const value = this.parseExpr();
        this.skipNewlines();
        const end = this.prev().span.end;
        return { kind: 'AssignStmt', name, value, span: this.mkSpan(start, end) };
    }
    parseFor() {
        const start = this.peek().span.start;
        this.expect("for" /* TokenKind.KwFor */);
        const varName = this.expectIdent();
        this.expect("in" /* TokenKind.KwIn */);
        const lo = this.parseExpr();
        this.expect(".." /* TokenKind.Dot2 */);
        const hi = this.parseExpr();
        let step;
        if (this.check("step" /* TokenKind.KwStep */)) {
            this.advance();
            step = this.parseExpr();
        }
        this.skipNewlines();
        const body = this.parseIndentedBlock();
        const end = this.prev().span.end;
        return { kind: 'ForStmt', var: varName, lo, hi, step, body, span: this.mkSpan(start, end) };
    }
    parseWhile() {
        const start = this.peek().span.start;
        this.expect("while" /* TokenKind.KwWhile */);
        const cond = this.parseExpr();
        this.skipNewlines();
        const body = this.parseIndentedBlock();
        const end = this.prev().span.end;
        return { kind: 'WhileStmt', cond, body, span: this.mkSpan(start, end) };
    }
    parseIfStmt() {
        const start = this.peek().span.start;
        this.expect("if" /* TokenKind.KwIf */);
        // Optional parentheses around condition
        const hasParen = this.check("(" /* TokenKind.LParen */);
        if (hasParen)
            this.advance();
        const cond = this.parseExpr();
        if (hasParen)
            this.expect(")" /* TokenKind.RParen */);
        let then;
        let else_;
        if (this.check("NEWLINE" /* TokenKind.Newline */) || this.check("EOF" /* TokenKind.EOF */)) {
            // Block form
            this.skipNewlines();
            then = this.parseIndentedBlock();
            if (this.check("else" /* TokenKind.KwElse */)) {
                this.advance();
                if (this.check("if" /* TokenKind.KwIf */)) {
                    else_ = this.parseIfStmt();
                }
                else {
                    this.skipNewlines();
                    else_ = this.parseIndentedBlock();
                }
            }
        }
        else {
            // Inline form: if cond then_expr [else else_expr]
            then = this.parseExpr();
            this.skipNewlines();
            if (this.check("else" /* TokenKind.KwElse */)) {
                this.advance();
                if (this.check("if" /* TokenKind.KwIf */)) {
                    else_ = this.parseIfStmt();
                }
                else {
                    else_ = this.parseExpr();
                    this.skipNewlines();
                }
            }
        }
        const end = this.prev().span.end;
        return { kind: 'IfNode', cond, then, else_, span: this.mkSpan(start, end) };
    }
    parseIndentedBlock() {
        this.expect("INDENT" /* TokenKind.Indent */);
        const { stmts } = this.parseBlockBody();
        this.expect("DEDENT" /* TokenKind.Dedent */);
        return stmts;
    }
    // ── Expressions ─────────────────────────────────────────────────────────────
    parseExpr() {
        return this.parseXorExpr();
    }
    parseXorExpr() {
        let left = this.parseOrExpr();
        while (this.check("xor" /* TokenKind.KwXor */)) {
            const op = this.advance();
            const right = this.parseOrExpr();
            left = this.mkBinary('xor', left, right, op.span.start);
        }
        return left;
    }
    parseOrExpr() {
        let left = this.parseAndExpr();
        while (this.check("||" /* TokenKind.Or */) || this.check("or" /* TokenKind.KwOr */)) {
            const op = this.advance();
            const right = this.parseAndExpr();
            left = this.mkBinary('||', left, right, op.span.start);
        }
        return left;
    }
    parseAndExpr() {
        let left = this.parseInExpr();
        while (this.check("&&" /* TokenKind.And */) || this.check("and" /* TokenKind.KwAnd */)) {
            const op = this.advance();
            const right = this.parseInExpr();
            left = this.mkBinary('&&', left, right, op.span.start);
        }
        return left;
    }
    parseInExpr() {
        const left = this.parseCmpExpr();
        // Range membership: x in [a, b] or x in (a, b)
        if (this.check("in" /* TokenKind.KwIn */)) {
            const next = this.peekAt(1).kind;
            if (next === "[" /* TokenKind.LBracket */ || next === "(" /* TokenKind.LParen */) {
                return this.parseRangeMembership(left, false);
            }
            if (this.isSetToken(next)) {
                this.advance();
                return this.parseSetMembership(left, this.advance().kind, false);
            }
            this.advance();
            const right = this.parseCmpExpr();
            return this.mkBinary('∈', left, right, left.span.start);
        }
        // Negated range: x !in [a, b] or x !in ℕ
        if (this.check("!in" /* TokenKind.BangIn */)) {
            if (this.isSetToken(this.peekAt(1).kind)) {
                this.advance(); // consume !in
                return this.parseSetMembership(left, this.advance().kind, true);
            }
            return this.parseRangeMembership(left, true);
        }
        // Unicode ∈ / ∉
        if (this.check("\\in" /* TokenKind.In2 */)) {
            this.advance();
            if (this.isSetToken(this.peek().kind)) {
                return this.parseSetMembership(left, this.advance().kind, false);
            }
            const right = this.parseCmpExpr();
            return this.mkBinary('∈', left, right, left.span.start);
        }
        if (this.check("\\notin" /* TokenKind.NotIn */)) {
            this.advance();
            if (this.isSetToken(this.peek().kind)) {
                return this.parseSetMembership(left, this.advance().kind, true);
            }
            const right = this.parseCmpExpr();
            return this.mkBinary('∉', left, right, left.span.start);
        }
        return left;
    }
    isSetToken(k) {
        return k === "SET_N" /* TokenKind.KwSetN */ || k === "SET_Z" /* TokenKind.KwSetZ */ ||
            k === "SET_R" /* TokenKind.KwSetR */ || k === "SET_Q" /* TokenKind.KwSetQ */ ||
            k === "SET_C" /* TokenKind.KwSetC */;
    }
    parseSetMembership(left, setKind, negate) {
        const s = left.span.start;
        const span = this.mkSpan(s, this.prev().span.end);
        const zero = { kind: 'NumberLit', value: 0, raw: '0', span };
        const one = { kind: 'NumberLit', value: 1, raw: '1', span };
        const fmod = (x) => ({ kind: 'FuncCallExpr', name: 'fmod', args: [x, one], span });
        const eqZ = (x) => this.mkBinary('==', x, zero, s);
        const isfinite = (x) => ({ kind: 'FuncCallExpr', name: 'isfinite', args: [x], span });
        let result;
        switch (setKind) {
            case "SET_N" /* TokenKind.KwSetN */:
                // x >= 0 && fmod(x, 1) == 0
                result = this.mkBinary('&&', this.mkBinary('>=', left, zero, s), eqZ(fmod(left)), s);
                break;
            case "SET_Z" /* TokenKind.KwSetZ */:
                // fmod(x, 1) == 0
                result = eqZ(fmod(left));
                break;
            case "SET_R" /* TokenKind.KwSetR */:
            case "SET_Q" /* TokenKind.KwSetQ */:
                // isfinite(x)
                result = isfinite(left);
                break;
            case "SET_C" /* TokenKind.KwSetC */:
            default:
                // always true: 1
                result = one;
        }
        if (negate) {
            return { kind: 'UnaryExpr', op: '!', operand: result, span };
        }
        return { ...result, span };
    }
    parseRangeMembership(left, negate) {
        this.advance(); // consume `in` or `!in`
        const closed = this.check("[" /* TokenKind.LBracket */); // [ = closed end, ( = open end
        const closeToken = closed ? "]" /* TokenKind.RBracket */ : ")" /* TokenKind.RParen */;
        const loOp = closed ? '>=' : '>';
        const hiOp = closed ? '<=' : '<';
        this.advance(); // consume `[` or `(`
        const lo = this.parseExpr();
        this.expect("," /* TokenKind.Comma */);
        const hi = this.parseExpr();
        this.expect(closeToken);
        const span = this.mkSpan(left.span.start, this.prev().span.end);
        const loCmp = this.mkBinary(loOp, left, lo, left.span.start);
        const hiCmp = this.mkBinary(hiOp, left, hi, left.span.start);
        const combined = this.mkBinary('&&', loCmp, hiCmp, left.span.start);
        if (negate) {
            return { kind: 'UnaryExpr', op: '!', operand: combined, span };
        }
        return { ...combined, span };
    }
    parseCmpExpr() {
        const first = this.parseAddExpr();
        if (!this.isCmpOp())
            return first;
        // Chain comparison: collect parts and ops
        const parts = [first];
        const ops = [];
        while (this.isCmpOp()) {
            ops.push(this.cmpOpKind());
            this.advance();
            parts.push(this.parseAddExpr());
        }
        if (parts.length === 2) {
            return this.mkBinary(ops[0], parts[0], parts[1], parts[0].span.start);
        }
        const span = this.mkSpan(parts[0].span.start, parts[parts.length - 1].span.end);
        return { kind: 'ChainCmpExpr', parts, ops, span };
    }
    isCmpOp() {
        const k = this.peek().kind;
        return (k === "==" /* TokenKind.Eq */ || k === "!=" /* TokenKind.Neq */ || k === "\u2260" /* TokenKind.Neq2 */ ||
            k === "<" /* TokenKind.Lt */ || k === ">" /* TokenKind.Gt */ ||
            k === "<=" /* TokenKind.Leq */ || k === "\u2264" /* TokenKind.Leq2 */ ||
            k === ">=" /* TokenKind.Geq */ || k === "\u2265" /* TokenKind.Geq2 */);
    }
    cmpOpKind() {
        switch (this.peek().kind) {
            case "==" /* TokenKind.Eq */: return '==';
            case "!=" /* TokenKind.Neq */:
            case "\u2260" /* TokenKind.Neq2 */: return '!=';
            case "<" /* TokenKind.Lt */: return '<';
            case ">" /* TokenKind.Gt */: return '>';
            case "<=" /* TokenKind.Leq */:
            case "\u2264" /* TokenKind.Leq2 */: return '<=';
            case ">=" /* TokenKind.Geq */:
            case "\u2265" /* TokenKind.Geq2 */: return '>=';
            default: return '==';
        }
    }
    parseAddExpr() {
        let left = this.parseVecExpr();
        while (this.check("+" /* TokenKind.Plus */) || this.check("-" /* TokenKind.Minus */)) {
            const op = this.advance();
            const right = this.parseVecExpr();
            left = this.mkBinary(op.kind === "+" /* TokenKind.Plus */ ? '+' : '-', left, right, op.span.start);
        }
        return left;
    }
    parseVecExpr() {
        let left = this.parseMulExpr();
        while (this.check("\u2A2F" /* TokenKind.Cross */)) {
            const op = this.advance();
            const right = this.parseMulExpr();
            left = this.mkBinary('⨯', left, right, op.span.start);
        }
        return left;
    }
    parseMulExpr() {
        let left = this.parsePowExpr();
        while (this.isMulOp()) {
            const op = this.advance();
            const right = this.parsePowExpr();
            left = this.mkBinary(this.mulOpKind(op.kind), left, right, op.span.start);
        }
        return left;
    }
    isMulOp() {
        const k = this.peek().kind;
        return (k === "*" /* TokenKind.Star */ || k === "\u22C5" /* TokenKind.Dot */ || k === ".*" /* TokenKind.DotStar */ ||
            k === "/" /* TokenKind.Slash */ || k === "\u00F7" /* TokenKind.Divide */ ||
            k === "%" /* TokenKind.Percent */ || k === "mod" /* TokenKind.KwMod */);
    }
    mulOpKind(kind) {
        switch (kind) {
            case "*" /* TokenKind.Star */: return '*';
            case ".*" /* TokenKind.DotStar */: return '.*';
            case "\u22C5" /* TokenKind.Dot */: return '⋅';
            case "/" /* TokenKind.Slash */: return '/';
            case "\u00F7" /* TokenKind.Divide */: return '÷';
            case "%" /* TokenKind.Percent */:
            case "mod" /* TokenKind.KwMod */: return '%';
            default: return '*';
        }
    }
    parsePowExpr() {
        const base = this.parseUnary();
        if (this.check("^" /* TokenKind.Caret */) || this.check("**" /* TokenKind.StarStar */)) {
            const opTok = this.advance();
            let exp;
            if (this.check("{" /* TokenKind.LBrace */)) {
                // x^{a + b}
                this.advance();
                exp = this.parseExpr();
                this.expect("}" /* TokenKind.RBrace */);
            }
            else {
                // right-associative: x^y^z = x^(y^z)
                exp = this.parsePowExpr();
            }
            const span = this.mkSpan(base.span.start, exp.span.end);
            return { kind: 'BinaryExpr', op: '^', left: base, right: exp, span };
        }
        return base;
    }
    parseUnary() {
        const t = this.peek();
        if (t.kind === "-" /* TokenKind.Minus */) {
            this.advance();
            const operand = this.parsePostfix();
            const span = this.mkSpan(t.span.start, operand.span.end);
            return { kind: 'UnaryExpr', op: '-', operand, span };
        }
        if (t.kind === "!" /* TokenKind.Not */ || t.kind === "not" /* TokenKind.KwNot */) {
            this.advance();
            const operand = this.parsePostfix();
            const span = this.mkSpan(t.span.start, operand.span.end);
            return { kind: 'UnaryExpr', op: '!', operand, span };
        }
        return this.parsePostfix();
    }
    parsePostfix() {
        let expr = this.parsePrimary();
        for (;;) {
            if (this.check("FACTORIAL" /* TokenKind.Factorial */)) {
                const op = this.advance();
                const span = this.mkSpan(expr.span.start, op.span.end);
                expr = { kind: 'PostfixExpr', op: '!', operand: expr, span };
                continue;
            }
            if (this.check("DEGREE" /* TokenKind.Degree */)) {
                const op = this.advance();
                const span = this.mkSpan(expr.span.start, op.span.end);
                expr = { kind: 'PostfixExpr', op: '°', operand: expr, span };
                continue;
            }
            if (this.check("[" /* TokenKind.LBracket */)) {
                this.advance();
                // Matrix slice: m[:, j] or m[i, :]
                if (this.check(":" /* TokenKind.Colon */)) {
                    this.advance();
                    if (this.check("," /* TokenKind.Comma */)) {
                        // m[:, j] — column slice
                        this.advance();
                        const colIdx = this.parseExpr();
                        this.expect("]" /* TokenKind.RBracket */);
                        const span = this.mkSpan(expr.span.start, this.prev().span.end);
                        expr = { kind: 'MatrixSlice', object: expr, rowAll: true, colAll: false, colIdx, span };
                        continue;
                    }
                    // 1D slice: v[:] or v[:hi]
                    const hi = this.check("]" /* TokenKind.RBracket */) ? undefined : this.parseExpr();
                    this.expect("]" /* TokenKind.RBracket */);
                    const span = this.mkSpan(expr.span.start, this.prev().span.end);
                    expr = { kind: 'SliceExpr', object: expr, lo: undefined, hi, span };
                    continue;
                }
                const idx = this.parseExpr();
                if (this.check("," /* TokenKind.Comma */)) {
                    // m[i, :] — row slice
                    this.advance();
                    this.expect(":" /* TokenKind.Colon */);
                    this.expect("]" /* TokenKind.RBracket */);
                    const span = this.mkSpan(expr.span.start, this.prev().span.end);
                    expr = { kind: 'MatrixSlice', object: expr, rowAll: false, rowIdx: idx, colAll: true, span };
                    continue;
                }
                if (this.check(".." /* TokenKind.Dot2 */)) {
                    this.advance();
                    const hi = this.check("]" /* TokenKind.RBracket */) ? undefined : this.parseExpr();
                    this.expect("]" /* TokenKind.RBracket */);
                    const span = this.mkSpan(expr.span.start, this.prev().span.end);
                    expr = { kind: 'SliceExpr', object: expr, lo: idx, hi, span };
                    continue;
                }
                this.expect("]" /* TokenKind.RBracket */);
                const span = this.mkSpan(expr.span.start, this.prev().span.end);
                expr = { kind: 'IndexExpr', object: expr, index: idx, span };
                continue;
            }
            if (this.check("." /* TokenKind.Period */)) {
                this.advance();
                const member = this.expectIdent();
                // alias.func(args) → QualifiedCallExpr; alias.field → MemberExpr
                if (this.check("(" /* TokenKind.LParen */) && expr.kind === 'IdentExpr') {
                    this.advance(); // consume (
                    const args = [];
                    if (!this.check(")" /* TokenKind.RParen */)) {
                        args.push(this.parseExpr());
                        while (this.check("," /* TokenKind.Comma */)) {
                            this.advance();
                            args.push(this.parseExpr());
                        }
                    }
                    this.expect(")" /* TokenKind.RParen */);
                    const span = this.mkSpan(expr.span.start, this.prev().span.end);
                    expr = { kind: 'QualifiedCallExpr', ns: expr.name, name: member, args, span };
                }
                else {
                    const span = this.mkSpan(expr.span.start, this.prev().span.end);
                    expr = { kind: 'MemberExpr', object: expr, member, span };
                }
                continue;
            }
            break;
        }
        return expr;
    }
    parsePrimary() {
        const t = this.peek();
        // Parenthesized expression
        if (t.kind === "(" /* TokenKind.LParen */) {
            this.advance();
            const expr = this.parseExpr();
            this.expect(")" /* TokenKind.RParen */);
            return expr;
        }
        // |x| — absolute value
        if (t.kind === "|" /* TokenKind.AbsOpen */) {
            const start = t.span.start;
            this.advance();
            const operand = this.parseExpr();
            this.expect("|" /* TokenKind.AbsClose */);
            const span = this.mkSpan(start, this.prev().span.end);
            return { kind: 'AbsExpr', operand, span };
        }
        // ‖v‖ — norm
        if (t.kind === "\u2016" /* TokenKind.NormOpen */) {
            const start = t.span.start;
            this.advance();
            const operand = this.parseExpr();
            this.expect("\u2016" /* TokenKind.NormClose */);
            const span = this.mkSpan(start, this.prev().span.end);
            return { kind: 'NormExpr', operand, span };
        }
        // ⌊x⌋ — floor
        if (t.kind === "\u230A" /* TokenKind.FloorOpen */) {
            const start = t.span.start;
            this.advance();
            const operand = this.parseExpr();
            this.expect("\u230B" /* TokenKind.FloorClose */);
            const span = this.mkSpan(start, this.prev().span.end);
            return { kind: 'FloorExpr', operand, span };
        }
        // ⌈x⌉ — ceil
        if (t.kind === "\u2308" /* TokenKind.CeilOpen */) {
            const start = t.span.start;
            this.advance();
            const operand = this.parseExpr();
            this.expect("\u2309" /* TokenKind.CeilClose */);
            const span = this.mkSpan(start, this.prev().span.end);
            return { kind: 'CeilExpr', operand, span };
        }
        // \pm expr
        if (t.kind === "\\pm" /* TokenKind.Pm */ || t.kind === "\u00B1" /* TokenKind.PlusMinus */) {
            const start = t.span.start;
            this.advance();
            const operand = this.parseExpr();
            const span = this.mkSpan(start, operand.span.end);
            return { kind: 'PmExpr', operand, span };
        }
        // \frac{a}{b}
        if (t.kind === "\\frac" /* TokenKind.Frac */) {
            return this.parseFrac();
        }
        // \sqrt{x} or \sqrt[n]{x}
        if (t.kind === "\\sqrt" /* TokenKind.Sqrt */) {
            return this.parseSqrt();
        }
        // \begin{cases}
        if (t.kind === "\\begin" /* TokenKind.Begin */) {
            return this.parseCases();
        }
        // \sum, \prod, ∑, ∏
        if (t.kind === "\\sum" /* TokenKind.Sum */ || t.kind === "\\prod" /* TokenKind.Prod */) {
            return this.parseSumExpr(t.kind === "\\sum" /* TokenKind.Sum */ ? 'sum' : 'prod');
        }
        // \lim_{x \to a} body
        if (t.kind === "\\lim" /* TokenKind.Lim */) {
            return this.parseLim();
        }
        // \int{lo}{hi} body d{var}  or  \int{lo}{hi}{var} body
        if (t.kind === "\\int" /* TokenKind.Int */) {
            return this.parseIntegral();
        }
        // \sigma{v} → std(v)
        if (t.kind === "\\sigma" /* TokenKind.Sigma */) {
            const start = t.span.start;
            this.advance();
            this.expect("{" /* TokenKind.LBrace */);
            const arg = this.parseExpr();
            this.expect("}" /* TokenKind.RBrace */);
            const span = this.mkSpan(start, this.prev().span.end);
            return { kind: 'FuncCallExpr', name: 'std', args: [arg], span };
        }
        // \Gamma{x} → tgamma(x)
        if (t.kind === "\\Gamma" /* TokenKind.Gamma */) {
            const start = t.span.start;
            this.advance();
            this.expect("{" /* TokenKind.LBrace */);
            const arg = this.parseExpr();
            this.expect("}" /* TokenKind.RBrace */);
            const span = this.mkSpan(start, this.prev().span.end);
            return { kind: 'FuncCallExpr', name: 'tgamma', args: [arg], span };
        }
        // \bar{v} → mean(v)
        if (t.kind === "\\bar" /* TokenKind.Bar */) {
            const start = t.span.start;
            this.advance();
            this.expect("{" /* TokenKind.LBrace */);
            const arg = this.parseExpr();
            this.expect("}" /* TokenKind.RBrace */);
            const span = this.mkSpan(start, this.prev().span.end);
            return { kind: 'FuncCallExpr', name: 'mean', args: [arg], span };
        }
        // \sigmaId / \GammaId → identifiers
        if (t.kind === "\\sigma_id" /* TokenKind.SigmaId */) {
            this.advance();
            return { kind: 'IdentExpr', name: 'σ', span: t.span };
        }
        if (t.kind === "\\Gamma_id" /* TokenKind.GammaId */) {
            this.advance();
            return { kind: 'IdentExpr', name: 'Γ', span: t.span };
        }
        // inline if expr
        if (t.kind === "if" /* TokenKind.KwIf */) {
            return this.parseIfExpr();
        }
        // solve(var, lo, hi) { body }
        if (t.kind === "solve" /* TokenKind.KwSolve */) {
            return this.parseSolve();
        }
        // Identifiers and function calls
        if (t.kind === "Identifier" /* TokenKind.Identifier */) {
            return this.parseIdentOrCall();
        }
        // Built-in function-like keywords used as function calls
        if (this.isBuiltinFnKeyword(t.kind)) {
            return this.parseBuiltinFnCall();
        }
        // Number literal
        if (t.kind === "Number" /* TokenKind.Number */) {
            this.advance();
            return { kind: 'NumberLit', value: Number(t.value), raw: t.value, span: t.span };
        }
        // Boolean literals
        if (t.kind === "true" /* TokenKind.KwTrue */) {
            this.advance();
            return { kind: 'BoolLit', value: true, span: t.span };
        }
        if (t.kind === "false" /* TokenKind.KwFalse */) {
            this.advance();
            return { kind: 'BoolLit', value: false, span: t.span };
        }
        // nan / inf
        if (t.kind === "nan" /* TokenKind.KwNaN */) {
            this.advance();
            return { kind: 'NumberLit', value: NaN, raw: 'nan', span: t.span };
        }
        if (t.kind === "inf" /* TokenKind.KwInf */ || t.kind === "\\infty" /* TokenKind.Inf2 */) {
            this.advance();
            return { kind: 'NumberLit', value: Infinity, raw: 'inf', span: t.span };
        }
        // Array / matrix literal
        if (t.kind === "[" /* TokenKind.LBracket */) {
            return this.parseArrayOrMatrix();
        }
        // String literal
        if (t.kind === "string_lit" /* TokenKind.StringLit */) {
            this.advance();
            return { kind: 'StringLitExpr', value: t.value, span: t.span };
        }
        // table { ... }
        if (t.kind === "table" /* TokenKind.KwTable */) {
            return this.parseTable();
        }
        throw unexpectedToken(t, 'expression');
    }
    // ── LaTeX constructs ─────────────────────────────────────────────────────────
    parseFrac() {
        const start = this.peek().span.start;
        this.expect("\\frac" /* TokenKind.Frac */);
        this.expect("{" /* TokenKind.LBrace */);
        const num = this.parseExpr();
        this.expect("}" /* TokenKind.RBrace */);
        this.expect("{" /* TokenKind.LBrace */);
        const den = this.parseExpr();
        this.expect("}" /* TokenKind.RBrace */);
        // \frac{d}{dx} expr → DerivExpr(var='x', body=expr)
        if (num.kind === 'IdentExpr' && num.name === 'd' &&
            den.kind === 'IdentExpr' && den.name.length > 1 && den.name.startsWith('d')) {
            const varName = den.name.slice(1); // 'dx' → 'x'
            const body = this.parseExpr();
            const span = this.mkSpan(start, body.span.end);
            return { kind: 'DerivExpr', var: varName, body, span };
        }
        const span = this.mkSpan(start, this.prev().span.end);
        return { kind: 'FracExpr', num, den, span };
    }
    parseSqrt() {
        const start = this.peek().span.start;
        this.expect("\\sqrt" /* TokenKind.Sqrt */);
        let degree;
        if (this.check("[" /* TokenKind.LBracket */)) {
            this.advance();
            degree = this.parseExpr();
            this.expect("]" /* TokenKind.RBracket */);
        }
        this.expect("{" /* TokenKind.LBrace */);
        const radicand = this.parseExpr();
        this.expect("}" /* TokenKind.RBrace */);
        const span = this.mkSpan(start, this.prev().span.end);
        return { kind: 'SqrtExpr', degree, radicand, span };
    }
    parseCases() {
        const start = this.peek().span.start;
        this.expect("\\begin" /* TokenKind.Begin */);
        this.expect("{" /* TokenKind.LBrace */);
        // consume 'cases' identifier
        const nameT = this.peek();
        if (nameT.kind !== "Identifier" /* TokenKind.Identifier */ || nameT.value !== 'cases') {
            throw unexpectedToken(nameT, '"cases"');
        }
        this.advance();
        this.expect("}" /* TokenKind.RBrace */);
        this.skipNewlines();
        const cases = [];
        let else_;
        while (!this.check("\\end" /* TokenKind.End */) && !this.check("EOF" /* TokenKind.EOF */)) {
            this.skipNewlines();
            if (this.check("\\end" /* TokenKind.End */) || this.check("EOF" /* TokenKind.EOF */))
                break;
            const value = this.parseExpr();
            if (this.check("&&" /* TokenKind.And */)) {
                // `&` used as cases separator — but `&` is `And` (&&), not a single `&`.
                // Actually the spec uses `&` not `&&`. We'll check for `And` since lexer maps `&&`.
                // For now just treat any `&`-like as separator.
                this.advance();
                const cond = this.parseExpr();
                // consume `\\` (two backslashes) — lexed as Backslash twice
                if (this.check("\\" /* TokenKind.Backslash */)) {
                    this.advance();
                    if (this.check("\\" /* TokenKind.Backslash */))
                        this.advance();
                }
                this.skipNewlines();
                cases.push({ value, cond });
            }
            else {
                // Last case — no condition
                else_ = value;
                this.skipNewlines();
                break;
            }
        }
        this.expect("\\end" /* TokenKind.End */);
        this.expect("{" /* TokenKind.LBrace */);
        const endName = this.peek();
        if (endName.kind !== "Identifier" /* TokenKind.Identifier */ || endName.value !== 'cases') {
            throw unexpectedToken(endName, '"cases"');
        }
        this.advance();
        this.expect("}" /* TokenKind.RBrace */);
        const span = this.mkSpan(start, this.prev().span.end);
        return { kind: 'CasesExpr', cases, else_, span };
    }
    parseSumExpr(op) {
        const start = this.peek().span.start;
        this.advance(); // consume \sum / \prod / ∑ / ∏
        let iterKind;
        let varName;
        let lo;
        let hi;
        let array;
        if (this.check("(" /* TokenKind.LParen */)) {
            // Short form: ∑(i=lo, hi) body
            this.advance();
            varName = this.expectIdent();
            this.expect("=" /* TokenKind.Assign */);
            lo = this.parseExpr();
            this.expect("," /* TokenKind.Comma */);
            hi = this.parseExpr();
            this.expect(")" /* TokenKind.RParen */);
            iterKind = 'range';
        }
        else {
            // LaTeX form: \sum_{i=lo}^{hi} body  or  \sum_{x \in v} body
            // Consume `_` (underscore identifier or Identifier("_"))
            // The lexer produces Identifier("_") for bare `_`
            if (this.check("Identifier" /* TokenKind.Identifier */) && this.peek().value === '_') {
                this.advance(); // consume '_'
            }
            this.expect("{" /* TokenKind.LBrace */);
            varName = this.expectIdent();
            if (this.check("=" /* TokenKind.Assign */)) {
                // range: i=lo}^{hi
                iterKind = 'range';
                this.advance();
                lo = this.parseExpr();
                this.expect("}" /* TokenKind.RBrace */);
                this.expect("^" /* TokenKind.Caret */);
                this.expect("{" /* TokenKind.LBrace */);
                hi = this.parseExpr();
                this.expect("}" /* TokenKind.RBrace */);
            }
            else if (this.check("\\in" /* TokenKind.In2 */)) {
                // array: x \in v
                iterKind = 'array';
                this.advance();
                array = this.expectIdent();
                this.expect("}" /* TokenKind.RBrace */);
            }
            else {
                throw unexpectedToken(this.peek(), '= or \\in');
            }
        }
        const body = this.parseExpr();
        const span = this.mkSpan(start, body.span.end);
        return { kind: 'SumExpr', op, iterKind, var: varName, lo, hi, array, body, span };
    }
    // ── Identifier / function call ───────────────────────────────────────────────
    parseIdentOrCall() {
        const t = this.peek();
        const name = t.value;
        this.advance();
        if (this.check("(" /* TokenKind.LParen */)) {
            // Function call
            const start = t.span.start;
            this.advance();
            const args = [];
            if (!this.check(")" /* TokenKind.RParen */)) {
                args.push(this.parseExpr());
                while (this.check("," /* TokenKind.Comma */)) {
                    this.advance();
                    args.push(this.parseExpr());
                }
            }
            this.expect(")" /* TokenKind.RParen */);
            const span = this.mkSpan(start, this.prev().span.end);
            return { kind: 'FuncCallExpr', name, args, span };
        }
        return { kind: 'IdentExpr', name, span: t.span };
    }
    isBuiltinFnKeyword(kind) {
        return (kind === "\\sin" /* TokenKind.Sin */ || kind === "\\cos" /* TokenKind.Cos */ || kind === "\\tan" /* TokenKind.Tan */ ||
            kind === "\\cot" /* TokenKind.Cot */ || kind === "\\sec" /* TokenKind.Sec */ || kind === "\\csc" /* TokenKind.Csc */ ||
            kind === "\\arcsin" /* TokenKind.Arcsin */ || kind === "\\arccos" /* TokenKind.Arccos */ || kind === "\\arctan" /* TokenKind.Arctan */ ||
            kind === "\\sinh" /* TokenKind.Sinh */ || kind === "\\cosh" /* TokenKind.Cosh */ || kind === "\\tanh" /* TokenKind.Tanh */ ||
            kind === "\\log" /* TokenKind.Log */ || kind === "\\lg" /* TokenKind.Lg */ || kind === "\\ln" /* TokenKind.Ln */ ||
            kind === "\\gcd" /* TokenKind.Gcd */ || kind === "\\lcm" /* TokenKind.Lcm */ || kind === "\\binom" /* TokenKind.Binom */);
    }
    parseBuiltinFnCall() {
        const t = this.advance();
        const name = t.value.replace(/^\\/, ''); // strip leading backslash
        const start = t.span.start;
        // \log_{base}{x} or \log{base}{x} → __log_base(x, base)
        if ((name === 'log' || name === 'lg') && (this.checkIdentUnderscore() || this.check("{" /* TokenKind.LBrace */))) {
            let base;
            if (this.checkIdentUnderscore()) {
                this.advance(); // consume _
                this.expect("{" /* TokenKind.LBrace */);
                base = this.parseExpr();
                this.expect("}" /* TokenKind.RBrace */);
            }
            else {
                // \log{base}{x} form
                this.expect("{" /* TokenKind.LBrace */);
                base = this.parseExpr();
                this.expect("}" /* TokenKind.RBrace */);
            }
            this.expect("{" /* TokenKind.LBrace */);
            const x = this.parseExpr();
            this.expect("}" /* TokenKind.RBrace */);
            const span = this.mkSpan(start, this.prev().span.end);
            return { kind: 'FuncCallExpr', name: '__log_base', args: [x, base], span };
        }
        if (this.check("{" /* TokenKind.LBrace */)) {
            // LaTeX two-brace form: \binom{n}{k}, \gcd{a}{b}, \lcm{a}{b}
            const twoArgFns = new Set(['binom', 'gcd', 'lcm']);
            this.advance();
            const arg1 = this.parseExpr();
            this.expect("}" /* TokenKind.RBrace */);
            if (twoArgFns.has(name) && this.check("{" /* TokenKind.LBrace */)) {
                this.advance();
                const arg2 = this.parseExpr();
                this.expect("}" /* TokenKind.RBrace */);
                const span = this.mkSpan(start, this.prev().span.end);
                return { kind: 'FuncCallExpr', name, args: [arg1, arg2], span };
            }
            const span = this.mkSpan(start, this.prev().span.end);
            return { kind: 'FuncCallExpr', name, args: [arg1], span };
        }
        if (this.check("(" /* TokenKind.LParen */)) {
            // Regular call \sin(x)
            this.advance();
            const args = [];
            if (!this.check(")" /* TokenKind.RParen */)) {
                args.push(this.parseExpr());
                while (this.check("," /* TokenKind.Comma */)) {
                    this.advance();
                    args.push(this.parseExpr());
                }
            }
            this.expect(")" /* TokenKind.RParen */);
            const span = this.mkSpan(start, this.prev().span.end);
            return { kind: 'FuncCallExpr', name, args, span };
        }
        // Bare keyword (no args) — treat as identifier
        return { kind: 'FuncCallExpr', name, args: [], span: t.span };
    }
    // ── if expression (inline) ───────────────────────────────────────────────────
    parseIfExpr() {
        const start = this.peek().span.start;
        this.expect("if" /* TokenKind.KwIf */);
        const hasParen = this.check("(" /* TokenKind.LParen */);
        if (hasParen)
            this.advance();
        const cond = this.parseExpr();
        if (hasParen)
            this.expect(")" /* TokenKind.RParen */);
        const then = this.parseExpr();
        this.expect("else" /* TokenKind.KwElse */);
        const else_ = this.parseExpr();
        const span = this.mkSpan(start, else_.span.end);
        return { kind: 'IfExpr', cond, then, else_, span };
    }
    // ── Array / matrix ───────────────────────────────────────────────────────────
    parseArrayOrMatrix() {
        const start = this.peek().span.start;
        this.expect("[" /* TokenKind.LBracket */);
        this.skipNewlines();
        // Empty array
        if (this.check("]" /* TokenKind.RBracket */)) {
            this.advance();
            const span = this.mkSpan(start, this.prev().span.end);
            return { kind: 'ArrayLit', elements: [], span };
        }
        // If first element is `[`, it's a matrix
        if (this.check("[" /* TokenKind.LBracket */)) {
            const rows = [];
            while (!this.check("]" /* TokenKind.RBracket */) && !this.check("EOF" /* TokenKind.EOF */)) {
                this.skipNewlines();
                if (this.check("]" /* TokenKind.RBracket */))
                    break;
                const rowStart = this.peek().span.start;
                this.expect("[" /* TokenKind.LBracket */);
                const elements = this.parseExprList();
                this.expect("]" /* TokenKind.RBracket */);
                const rowSpan = this.mkSpan(rowStart, this.prev().span.end);
                rows.push({ kind: 'ArrayLit', elements, span: rowSpan });
                // skip optional comma between rows
                if (this.check("," /* TokenKind.Comma */))
                    this.advance();
                this.skipNewlines();
            }
            this.expect("]" /* TokenKind.RBracket */);
            const span = this.mkSpan(start, this.prev().span.end);
            return { kind: 'MatrixLit', rows, span };
        }
        // Regular array
        const elements = this.parseExprList();
        this.expect("]" /* TokenKind.RBracket */);
        const span = this.mkSpan(start, this.prev().span.end);
        return { kind: 'ArrayLit', elements, span };
    }
    parseExprList() {
        const items = [];
        if (this.check("]" /* TokenKind.RBracket */) || this.check("EOF" /* TokenKind.EOF */))
            return items;
        items.push(this.parseExpr());
        while (this.check("," /* TokenKind.Comma */)) {
            this.advance();
            if (this.check("]" /* TokenKind.RBracket */))
                break;
            items.push(this.parseExpr());
        }
        return items;
    }
    // ── Helpers ──────────────────────────────────────────────────────────────────
    mkBinary(op, left, right, _start) {
        const span = this.mkSpan(left.span.start, right.span.end);
        return { kind: 'BinaryExpr', op, left, right, span };
    }
    mkSpan(start, end) {
        const file = this.tokens[0]?.span.file ?? '<input>';
        return { start, end, file };
    }
    peek() {
        return this.tokens[this.pos] ?? this.tokens[this.tokens.length - 1];
    }
    peekAt(offset) {
        const idx = this.pos + offset;
        return this.tokens[idx] ?? this.tokens[this.tokens.length - 1];
    }
    prev() {
        return this.tokens[this.pos - 1] ?? this.tokens[0];
    }
    advance() {
        const t = this.peek();
        if (t.kind !== "EOF" /* TokenKind.EOF */)
            this.pos++;
        return t;
    }
    check(kind) {
        return this.peek().kind === kind;
    }
    checkIdentUnderscore() {
        const t = this.peek();
        return t.kind === "Identifier" /* TokenKind.Identifier */ && t.value === '_';
    }
    expect(kind) {
        const t = this.peek();
        if (t.kind !== kind)
            throw expectedKind(t, kind);
        return this.advance();
    }
    expectIdent() {
        const t = this.peek();
        if (t.kind !== "Identifier" /* TokenKind.Identifier */)
            throw unexpectedToken(t, 'identifier');
        this.advance();
        return t.value;
    }
    skipNewlines() {
        while (this.check("NEWLINE" /* TokenKind.Newline */))
            this.advance();
    }
    // ── Phase 7 — numerical constructs ──────────────────────────────────────────
    parseLim() {
        // \lim_{x \to a} body  OR  \lim_{x \to \infty} body
        const start = this.peek().span.start;
        this.expect("\\lim" /* TokenKind.Lim */);
        // Consume optional `_` identifier
        if (this.checkIdentUnderscore())
            this.advance();
        this.expect("{" /* TokenKind.LBrace */);
        const varName = this.expectIdent();
        this.expect("\\to" /* TokenKind.To */); // \to
        const isInfToken = () => this.check("\\infty" /* TokenKind.Inf2 */) || this.check("inf" /* TokenKind.KwInf */) ||
            (this.check("Identifier" /* TokenKind.Identifier */) && (this.peek().value === '∞' || this.peek().value === 'inf'));
        const toInf = isInfToken();
        let to;
        if (toInf) {
            const tInf = this.advance();
            to = { kind: 'NumberLit', value: Infinity, raw: 'inf', span: tInf.span };
        }
        else {
            to = this.parseExpr();
        }
        this.expect("}" /* TokenKind.RBrace */);
        const body = this.parseExpr();
        const span = this.mkSpan(start, body.span.end);
        return { kind: 'LimExpr', var: varName, to, toInf, body, span };
    }
    parseIntegral() {
        // \int{lo}{hi} body dx   — 'dx' is an identifier: var name starts after 'd'
        // OR  \int{lo}{hi}{var} body
        const start = this.peek().span.start;
        this.expect("\\int" /* TokenKind.Int */);
        // Optional subscript/superscript LaTeX form: skip _ and ^ brace groups
        if (this.checkIdentUnderscore()) {
            this.advance();
            this.expect("{" /* TokenKind.LBrace */);
            // skip subscript content
            let depth = 1;
            while (depth > 0 && !this.check("EOF" /* TokenKind.EOF */)) {
                if (this.check("{" /* TokenKind.LBrace */))
                    depth++;
                else if (this.check("}" /* TokenKind.RBrace */))
                    depth--;
                if (depth > 0)
                    this.advance();
            }
            this.expect("}" /* TokenKind.RBrace */);
            if (this.check("^" /* TokenKind.Caret */)) {
                this.advance();
                this.expect("{" /* TokenKind.LBrace */);
                depth = 1;
                while (depth > 0 && !this.check("EOF" /* TokenKind.EOF */)) {
                    if (this.check("{" /* TokenKind.LBrace */))
                        depth++;
                    else if (this.check("}" /* TokenKind.RBrace */))
                        depth--;
                    if (depth > 0)
                        this.advance();
                }
                this.expect("}" /* TokenKind.RBrace */);
            }
        }
        this.expect("{" /* TokenKind.LBrace */);
        const lo = this.parseExpr();
        this.expect("}" /* TokenKind.RBrace */);
        this.expect("{" /* TokenKind.LBrace */);
        const hi = this.parseExpr();
        this.expect("}" /* TokenKind.RBrace */);
        // Optional {var} brace — if not present, next ident starting with 'd' is the var
        let varName = 'x';
        if (this.check("{" /* TokenKind.LBrace */)) {
            this.advance();
            varName = this.expectIdent();
            this.expect("}" /* TokenKind.RBrace */);
            const body = this.parseExpr();
            const span = this.mkSpan(start, body.span.end);
            return { kind: 'IntegralExpr', var: varName, lo, hi, body, span };
        }
        const body = this.parseExpr();
        // Consume trailing 'd{var}' identifier like 'dx', 'dt'
        if (this.check("Identifier" /* TokenKind.Identifier */)) {
            const dv = this.peek().value;
            if (dv.length > 1 && dv.startsWith('d')) {
                varName = dv.slice(1);
                this.advance();
            }
        }
        const span = this.mkSpan(start, body.span.end);
        return { kind: 'IntegralExpr', var: varName, lo, hi, body, span };
    }
    parseSolve() {
        // solve(var, lo, hi) { body }  — body should equal 0
        const start = this.peek().span.start;
        this.expect("solve" /* TokenKind.KwSolve */);
        this.expect("(" /* TokenKind.LParen */);
        const varName = this.expectIdent();
        this.expect("," /* TokenKind.Comma */);
        const lo = this.parseExpr();
        this.expect("," /* TokenKind.Comma */);
        const hi = this.parseExpr();
        this.expect(")" /* TokenKind.RParen */);
        // Body in braces or as a direct expression
        let body;
        if (this.check("{" /* TokenKind.LBrace */)) {
            this.advance();
            body = this.parseExpr();
            this.expect("}" /* TokenKind.RBrace */);
        }
        else {
            body = this.parseExpr();
        }
        const span = this.mkSpan(start, body.span.end);
        return { kind: 'SolveExpr', var: varName, lo, hi, body, span };
    }
    // ── Phase 8 — table ──────────────────────────────────────────────────────────
    parseTable() {
        // table { key -> value, key -> value, ... }
        const start = this.peek().span.start;
        this.expect("table" /* TokenKind.KwTable */);
        this.expect("{" /* TokenKind.LBrace */);
        this.skipNewlines();
        const pairs = [];
        while (!this.check("}" /* TokenKind.RBrace */) && !this.check("EOF" /* TokenKind.EOF */)) {
            const key = this.parsePrimary(); // number or string literal
            this.expect("->" /* TokenKind.Arrow */); // ->
            const value = this.parseExpr();
            pairs.push({ key, value });
            if (this.check("," /* TokenKind.Comma */))
                this.advance();
            this.skipNewlines();
        }
        this.expect("}" /* TokenKind.RBrace */);
        const span = this.mkSpan(start, this.prev().span.end);
        return { kind: 'TableExpr', pairs, span };
    }
}
export function parseSource(tokens) {
    return new Parser(tokens).parse();
}
//# sourceMappingURL=parser.js.map
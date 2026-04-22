import type { Span, Position } from '../types/index.js';
import { type Token, TokenKind } from '../lexer/token.js';
import {
  ParseError, unexpectedToken, unexpectedEof, expectedKind,
} from './error.js';
import type {
  File, TopLevelNode, ConstDef, FuncDef, ImportDef, Param, McType,
  Stmt, AssignStmt, IfNode, ForStmt, WhileStmt, ExprStmt,
  WhereBlock, WhereLine,
  Expr, NumberLit, IdentExpr, BinaryExpr, BinOp, UnaryExpr,
  FuncCallExpr, QualifiedCallExpr, IfExpr, IndexExpr, SliceExpr, MatrixSlice, MemberExpr,
  ArrayLit, MatrixLit, FracExpr, SqrtExpr,
  AbsExpr, NormExpr, FloorExpr, CeilExpr, PmExpr, CasesExpr,
  SumExpr, PostfixExpr, ChainCmpExpr,
  LimExpr, DerivExpr, IntegralExpr, SolveExpr,
} from '../ast/nodes.js';

// Builtin functions that support \fn^n x → pow(fn(x), n) LaTeX power notation
const POWER_TRIG_FUNCS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'arcsin', 'arccos', 'arctan', 'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
  'log', 'ln', 'lg', 'exp', 'sqrt',
]);

export class Parser {
  private readonly tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): File {
    const start = this.peek().span.start;
    const body: TopLevelNode[] = [];

    while (!this.check(TokenKind.EOF)) {
      this.skipNewlines();
      if (this.check(TokenKind.EOF)) break;
      body.push(this.parseTopLevel());
    }

    const end = this.peek().span.end;
    return { kind: 'File', body, span: this.mkSpan(start, end) };
  }

  // ── Top-level ───────────────────────────────────────────────────────────────

  private parseTopLevel(): TopLevelNode {
    if (this.check(TokenKind.KwImport) || this.check(TokenKind.KwFrom)) {
      return this.parseImport();
    }

    const t = this.peek();
    if (t.kind !== TokenKind.Identifier) {
      throw unexpectedToken(t, 'identifier or import');
    }

    // lookahead: identifier followed by `(` → func def
    const next = this.peekAt(1);
    if (next.kind === TokenKind.LParen) {
      return this.parseFuncDef();
    }
    // identifier followed by `=` → const def
    if (next.kind === TokenKind.Assign) {
      return this.parseConstDef();
    }

    throw unexpectedToken(next, '( or =');
  }

  private parseImport(): ImportDef {
    const start = this.peek().span.start;
    const isFrom = this.check(TokenKind.KwFrom);
    this.advance(); // consume 'import' or 'from'

    // Accept string literal or bare identifier as path
    const pathTok = this.peek();
    if (pathTok.kind !== TokenKind.Identifier && pathTok.kind !== TokenKind.StringLit) {
      throw unexpectedToken(pathTok, 'import path');
    }
    const path = pathTok.value;
    this.advance();

    let alias: string | undefined;
    let names: string[] | undefined;

    if (isFrom) {
      // from "./file.mc" import name [, name2]
      this.expect(TokenKind.KwImport);
      names = [this.expectIdent()];
      while (this.check(TokenKind.Comma)) {
        this.advance();
        names.push(this.expectIdent());
      }
    } else {
      // import "./file.mc" [as alias]
      if (this.check(TokenKind.KwAs)) {
        this.advance();
        alias = this.expectIdent();
      }
    }

    this.skipNewlines();
    const end = this.prev().span.end;
    return { kind: 'ImportDef', path, alias, names, span: this.mkSpan(start, end) };
  }

  private parseConstDef(): ConstDef {
    const start = this.peek().span.start;
    const name = this.expectIdent();
    this.expect(TokenKind.Assign);
    const value = this.parseExpr();
    this.skipNewlines();
    const end = this.prev().span.end;
    return { kind: 'ConstDef', name, value, span: this.mkSpan(start, end) };
  }

  private parseFuncDef(): FuncDef {
    const start = this.peek().span.start;
    const name = this.expectIdent();
    this.expect(TokenKind.LParen);
    const params = this.parseParams();
    this.expect(TokenKind.RParen);
    this.expect(TokenKind.Assign);

    let body: Stmt[];
    let where: WhereBlock | undefined;

    if (this.check(TokenKind.Indent)) {
      // Block body: func(x) =\n  INDENT stmts DEDENT
      // (no Newline emitted after `=` since Assign is not a value token)
      this.expect(TokenKind.Indent);
      ({ stmts: body, where } = this.parseBlockBody());
      this.expect(TokenKind.Dedent);
    } else {
      // Inline body: func(x) = expr
      const expr = this.parseExpr();
      body = [{ kind: 'ExprStmt', expr, span: expr.span }];
      this.skipNewlines();
      // Check for where block: INDENT KwWhere ...
      if (this.check(TokenKind.Indent)) {
        this.advance(); // consume INDENT
        where = this.parseWhereBlock();
        this.expect(TokenKind.Dedent);
      }
    }

    const end = this.prev().span.end;
    return { kind: 'FuncDef', name, params, body, where, span: this.mkSpan(start, end) };
  }

  // ── Params ──────────────────────────────────────────────────────────────────

  private parseParams(): Param[] {
    const params: Param[] = [];
    if (this.check(TokenKind.RParen)) return params;

    params.push(this.parseParam());
    while (this.check(TokenKind.Comma)) {
      this.advance();
      params.push(this.parseParam());
    }
    return params;
  }

  private parseParam(): Param {
    const start = this.peek().span.start;
    const name = this.expectIdent();
    let type: McType | undefined;
    let def: Expr | undefined;

    if (this.check(TokenKind.Colon)) {
      this.advance();
      type = this.parseType();
    }
    if (this.check(TokenKind.Assign)) {
      this.advance();
      def = this.parseExpr();
    }

    const end = this.prev().span.end;
    return { name, type, default: def, span: this.mkSpan(start, end) };
  }

  private parseType(): McType {
    if (this.check(TokenKind.KwInt)) {
      this.advance();
      return { kind: 'IntType' };
    }
    this.expect(TokenKind.KwNum);
    let dims = 0;
    let staticSize: number | undefined;

    while (this.check(TokenKind.LBracket)) {
      this.advance();
      dims++;
      if (this.check(TokenKind.Number)) {
        staticSize = Number(this.advance().value);
      }
      this.expect(TokenKind.RBracket);
    }
    return { kind: 'NumType', dims, staticSize };
  }

  // ── Block body ──────────────────────────────────────────────────────────────

  private parseBlockBody(): { stmts: Stmt[]; where?: WhereBlock } {
    const stmts: Stmt[] = [];
    let where: WhereBlock | undefined;

    while (!this.check(TokenKind.Dedent) && !this.check(TokenKind.EOF)) {
      this.skipNewlines();
      if (this.check(TokenKind.Dedent) || this.check(TokenKind.EOF)) break;

      if (this.check(TokenKind.KwWhere)) {
        where = this.parseWhereBlock();
        break; // where is always last
      }

      stmts.push(this.parseStmt());
    }

    return { stmts, where };
  }

  // ── Where block ─────────────────────────────────────────────────────────────

  private parseWhereBlock(): WhereBlock {
    const start = this.peek().span.start;
    this.expect(TokenKind.KwWhere);
    this.skipNewlines();
    this.expect(TokenKind.Indent);

    const lines: WhereLine[] = [];
    while (!this.check(TokenKind.Dedent) && !this.check(TokenKind.EOF)) {
      this.skipNewlines();
      if (this.check(TokenKind.Dedent) || this.check(TokenKind.EOF)) break;
      lines.push(this.parseWhereLine());
      this.skipNewlines();
    }

    this.expect(TokenKind.Dedent);
    const end = this.prev().span.end;
    return { kind: 'WhereBlock', lines, span: this.mkSpan(start, end) };
  }

  private parseWhereLine(): WhereLine {
    const start = this.peek().span.start;
    // identifier followed by `=` (not `==`) → WhereDef
    if (this.check(TokenKind.Identifier) && this.peekAt(1).kind === TokenKind.Assign) {
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

  private parseStmt(): Stmt {
    if (this.check(TokenKind.KwFor)) return this.parseFor();
    if (this.check(TokenKind.KwWhile)) return this.parseWhile();
    if (this.check(TokenKind.KwIf)) return this.parseIfStmt();

    // identifier followed by `=` (not `==`) → AssignStmt
    if (this.check(TokenKind.Identifier) && this.peekAt(1).kind === TokenKind.Assign) {
      return this.parseAssign();
    }

    // Otherwise expression statement
    const start = this.peek().span.start;
    const expr = this.parseExpr();
    this.skipNewlines();
    const end = this.prev().span.end;
    return { kind: 'ExprStmt', expr, span: this.mkSpan(start, end) };
  }

  private parseAssign(): AssignStmt {
    const start = this.peek().span.start;
    const name = this.expectIdent();
    this.expect(TokenKind.Assign);
    const value = this.parseExpr();
    this.skipNewlines();
    const end = this.prev().span.end;
    return { kind: 'AssignStmt', name, value, span: this.mkSpan(start, end) };
  }

  private parseFor(): ForStmt {
    const start = this.peek().span.start;
    this.expect(TokenKind.KwFor);
    const varName = this.expectIdent();
    this.expect(TokenKind.KwIn);
    const lo = this.parseExpr();
    this.expect(TokenKind.Dot2);
    const hi = this.parseExpr();
    let step: Expr | undefined;
    if (this.check(TokenKind.KwStep)) {
      this.advance();
      step = this.parseExpr();
    }
    this.skipNewlines();
    const body = this.parseIndentedBlock();
    const end = this.prev().span.end;
    return { kind: 'ForStmt', var: varName, lo, hi, step, body, span: this.mkSpan(start, end) };
  }

  private parseWhile(): WhileStmt {
    const start = this.peek().span.start;
    this.expect(TokenKind.KwWhile);
    const cond = this.parseExpr();
    this.skipNewlines();
    const body = this.parseIndentedBlock();
    const end = this.prev().span.end;
    return { kind: 'WhileStmt', cond, body, span: this.mkSpan(start, end) };
  }

  private parseIfStmt(): IfNode {
    const start = this.peek().span.start;
    this.expect(TokenKind.KwIf);

    // Optional parentheses around condition
    const hasParen = this.check(TokenKind.LParen);
    if (hasParen) this.advance();
    const cond = this.parseExpr();
    if (hasParen) this.expect(TokenKind.RParen);

    let then: Expr | Stmt[];
    let else_: Expr | Stmt[] | IfNode | undefined;

    if (this.check(TokenKind.Newline) || this.check(TokenKind.EOF)) {
      // Block form
      this.skipNewlines();
      then = this.parseIndentedBlock();
      if (this.check(TokenKind.KwElse)) {
        this.advance();
        if (this.check(TokenKind.KwIf)) {
          else_ = this.parseIfStmt();
        } else {
          this.skipNewlines();
          else_ = this.parseIndentedBlock();
        }
      }
    } else {
      // Inline form: if cond then_expr [else else_expr]
      then = this.parseExpr();
      this.skipNewlines();
      if (this.check(TokenKind.KwElse)) {
        this.advance();
        if (this.check(TokenKind.KwIf)) {
          else_ = this.parseIfStmt();
        } else {
          else_ = this.parseExpr();
          this.skipNewlines();
        }
      }
    }

    const end = this.prev().span.end;
    return { kind: 'IfNode', cond, then, else_, span: this.mkSpan(start, end) };
  }

  private parseIndentedBlock(): Stmt[] {
    this.expect(TokenKind.Indent);
    const { stmts } = this.parseBlockBody();
    this.expect(TokenKind.Dedent);
    return stmts;
  }

  // ── Expressions ─────────────────────────────────────────────────────────────

  parseExpr(): Expr {
    return this.parseXorExpr();
  }

  private parseXorExpr(): Expr {
    let left = this.parseOrExpr();
    while (this.check(TokenKind.KwXor)) {
      const op = this.advance();
      const right = this.parseOrExpr();
      left = this.mkBinary('xor', left, right, op.span.start);
    }
    return left;
  }

  private parseOrExpr(): Expr {
    let left = this.parseAndExpr();
    while (this.check(TokenKind.Or) || this.check(TokenKind.KwOr)) {
      const op = this.advance();
      const right = this.parseAndExpr();
      left = this.mkBinary('||', left, right, op.span.start);
    }
    return left;
  }

  private parseAndExpr(): Expr {
    let left = this.parseInExpr();
    while (this.check(TokenKind.And) || this.check(TokenKind.KwAnd)) {
      const op = this.advance();
      const right = this.parseInExpr();
      left = this.mkBinary('&&', left, right, op.span.start);
    }
    return left;
  }

  private parseInExpr(): Expr {
    const left = this.parseCmpExpr();

    // Range membership: x in [a, b] or x in (a, b)
    if (this.check(TokenKind.KwIn)) {
      const next = this.peekAt(1).kind;
      if (next === TokenKind.LBracket || next === TokenKind.LParen) {
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
    if (this.check(TokenKind.BangIn)) {
      if (this.isSetToken(this.peekAt(1).kind)) {
        this.advance(); // consume !in
        return this.parseSetMembership(left, this.advance().kind, true);
      }
      return this.parseRangeMembership(left, true);
    }

    // Unicode ∈ / ∉
    if (this.check(TokenKind.In2)) {
      this.advance();
      if (this.isSetToken(this.peek().kind)) {
        return this.parseSetMembership(left, this.advance().kind, false);
      }
      const right = this.parseCmpExpr();
      return this.mkBinary('∈', left, right, left.span.start);
    }
    if (this.check(TokenKind.NotIn)) {
      this.advance();
      if (this.isSetToken(this.peek().kind)) {
        return this.parseSetMembership(left, this.advance().kind, true);
      }
      const right = this.parseCmpExpr();
      return this.mkBinary('∉', left, right, left.span.start);
    }
    return left;
  }

  private isSetToken(k: TokenKind): boolean {
    return k === TokenKind.KwSetN || k === TokenKind.KwSetZ ||
           k === TokenKind.KwSetR || k === TokenKind.KwSetQ ||
           k === TokenKind.KwSetC;
  }

  private parseSetMembership(left: Expr, setKind: TokenKind, negate: boolean): Expr {
    const s = left.span.start;
    const span = this.mkSpan(s, this.prev().span.end);

    const zero:  Expr = { kind: 'NumberLit', value: 0, raw: '0', span };
    const one:   Expr = { kind: 'NumberLit', value: 1, raw: '1', span };
    const fmod = (x: Expr): Expr =>
      ({ kind: 'FuncCallExpr', name: 'fmod', args: [x, one], span });
    const eqZ = (x: Expr): Expr => this.mkBinary('==', x, zero, s);
    const isfinite = (x: Expr): Expr =>
      ({ kind: 'FuncCallExpr', name: 'isfinite', args: [x], span });

    let result: Expr;
    switch (setKind) {
      case TokenKind.KwSetN:
        // x >= 0 && fmod(x, 1) == 0
        result = this.mkBinary('&&',
          this.mkBinary('>=', left, zero, s),
          eqZ(fmod(left)), s);
        break;
      case TokenKind.KwSetZ:
        // fmod(x, 1) == 0
        result = eqZ(fmod(left));
        break;
      case TokenKind.KwSetR:
      case TokenKind.KwSetQ:
        // isfinite(x)
        result = isfinite(left);
        break;
      case TokenKind.KwSetC:
      default:
        // always true: 1
        result = one;
    }

    if (negate) {
      return { kind: 'UnaryExpr', op: '!', operand: result, span };
    }
    return { ...result, span };
  }

  private parseRangeMembership(left: Expr, negate: boolean): Expr {
    this.advance(); // consume `in` or `!in`
    const closed = this.check(TokenKind.LBracket); // [ = closed end, ( = open end
    const closeToken = closed ? TokenKind.RBracket : TokenKind.RParen;
    const loOp: BinOp = closed ? '>=' : '>';
    const hiOp: BinOp = closed ? '<=' : '<';

    this.advance(); // consume `[` or `(`
    const lo = this.parseExpr();
    this.expect(TokenKind.Comma);
    const hi = this.parseExpr();
    this.expect(closeToken);

    const span = this.mkSpan(left.span.start, this.prev().span.end);
    const loCmp = this.mkBinary(loOp, left, lo, left.span.start);
    const hiCmp = this.mkBinary(hiOp, left, hi, left.span.start);
    const combined: Expr = this.mkBinary('&&', loCmp, hiCmp, left.span.start);

    if (negate) {
      return { kind: 'UnaryExpr', op: '!', operand: combined, span };
    }
    return { ...combined, span };
  }

  private parseCmpExpr(): Expr {
    const first = this.parseAddExpr();
    if (!this.isCmpOp()) return first;

    // Chain comparison: collect parts and ops
    const parts: Expr[] = [first];
    const ops: BinOp[] = [];

    while (this.isCmpOp()) {
      ops.push(this.cmpOpKind());
      this.advance();
      parts.push(this.parseAddExpr());
    }

    if (parts.length === 2) {
      return this.mkBinary(ops[0]!, parts[0]!, parts[1]!, parts[0]!.span.start);
    }

    const span = this.mkSpan(parts[0]!.span.start, parts[parts.length - 1]!.span.end);
    return { kind: 'ChainCmpExpr', parts, ops, span };
  }

  private isCmpOp(): boolean {
    const k = this.peek().kind;
    return (
      k === TokenKind.Eq || k === TokenKind.Neq || k === TokenKind.Neq2 ||
      k === TokenKind.Lt || k === TokenKind.Gt ||
      k === TokenKind.Leq || k === TokenKind.Leq2 ||
      k === TokenKind.Geq || k === TokenKind.Geq2
    );
  }

  private cmpOpKind(): BinOp {
    switch (this.peek().kind) {
      case TokenKind.Eq:   return '==';
      case TokenKind.Neq:
      case TokenKind.Neq2: return '!=';
      case TokenKind.Lt:   return '<';
      case TokenKind.Gt:   return '>';
      case TokenKind.Leq:
      case TokenKind.Leq2: return '<=';
      case TokenKind.Geq:
      case TokenKind.Geq2: return '>=';
      default: return '==';
    }
  }

  private parseAddExpr(): Expr {
    let left = this.parseVecExpr();
    while (this.check(TokenKind.Plus) || this.check(TokenKind.Minus)) {
      const op = this.advance();
      const right = this.parseVecExpr();
      left = this.mkBinary(op.kind === TokenKind.Plus ? '+' : '-', left, right, op.span.start);
    }
    return left;
  }

  private parseVecExpr(): Expr {
    let left = this.parseMulExpr();
    while (this.check(TokenKind.Cross)) {
      const op = this.advance();
      const right = this.parseMulExpr();
      left = this.mkBinary('⨯', left, right, op.span.start);
    }
    return left;
  }

  private parseMulExpr(): Expr {
    let left = this.parsePowExpr();
    for (;;) {
      if (this.isMulOp()) {
        const op = this.advance();
        const right = this.parsePowExpr();
        left = this.mkBinary(this.mulOpKind(op.kind), left, right, op.span.start);
      } else if (this.isImplicitMulStart()) {
        const right = this.parsePowExpr();
        left = this.mkBinary('*', left, right, left.span.start);
      } else {
        break;
      }
    }
    return left;
  }

  private isImplicitMulStart(): boolean {
    const k = this.peek().kind;
    return (
      k === TokenKind.Identifier ||
      k === TokenKind.LParen ||
      // AbsOpen (|) and NormOpen (‖) are excluded: they share the same token kind
      // as AbsClose/NormClose, causing ambiguity when used after a parsed expression.
      k === TokenKind.FloorOpen ||
      k === TokenKind.CeilOpen ||
      k === TokenKind.Sqrt ||
      k === TokenKind.Frac ||
      k === TokenKind.Sigma || k === TokenKind.SigmaId ||
      k === TokenKind.Gamma || k === TokenKind.GammaId ||
      k === TokenKind.Bar ||
      k === TokenKind.Sin || k === TokenKind.Cos || k === TokenKind.Tan ||
      k === TokenKind.Cot || k === TokenKind.Sec || k === TokenKind.Csc ||
      k === TokenKind.Arcsin || k === TokenKind.Arccos || k === TokenKind.Arctan ||
      k === TokenKind.Sinh || k === TokenKind.Cosh || k === TokenKind.Tanh ||
      k === TokenKind.Log || k === TokenKind.Ln || k === TokenKind.Lg ||
      k === TokenKind.Gcd || k === TokenKind.Lcm ||
      k === TokenKind.Abs2 ||
      k === TokenKind.LatexMin || k === TokenKind.LatexMax
    );
  }

  private isMulOp(): boolean {
    const k = this.peek().kind;
    return (
      k === TokenKind.Star || k === TokenKind.Dot || k === TokenKind.DotStar ||
      k === TokenKind.Slash || k === TokenKind.Divide ||
      k === TokenKind.Percent || k === TokenKind.KwMod || k === TokenKind.LatexMod
    );
  }

  private mulOpKind(kind: TokenKind): BinOp {
    switch (kind) {
      case TokenKind.Star:    return '*';
      case TokenKind.DotStar: return '.*';
      case TokenKind.Dot:     return '⋅';
      case TokenKind.Slash:   return '/';
      case TokenKind.Divide:  return '÷';
      case TokenKind.Percent:
      case TokenKind.KwMod:
      case TokenKind.LatexMod: return '%';
      default:                return '*';
    }
  }

  private parsePowExpr(): Expr {
    const base = this.parseUnary();
    if (this.check(TokenKind.Caret) || this.check(TokenKind.StarStar)) {
      const opTok = this.advance();
      let exp: Expr;
      if (this.check(TokenKind.LBrace)) {
        // x^{a + b}
        this.advance();
        exp = this.parseExpr();
        this.expect(TokenKind.RBrace);
      } else {
        // right-associative: x^y^z = x^(y^z)
        exp = this.parsePowExpr();
      }
      // A^{\top} or A^{T} → transpose(A)
      if (exp.kind === 'IdentExpr' && (exp.name === 'top' || exp.name === 'T')) {
        const span = this.mkSpan(base.span.start, this.prev().span.end);
        return { kind: 'FuncCallExpr', name: 'transpose', args: [base], span };
      }
      // A^{-1} → inv(A)
      if (exp.kind === 'UnaryExpr' && exp.op === '-' &&
          exp.operand.kind === 'NumberLit' && exp.operand.value === 1) {
        const span = this.mkSpan(base.span.start, this.prev().span.end);
        return { kind: 'FuncCallExpr', name: 'inv', args: [base], span };
      }
      // \sin^2 x → pow(sin(x), 2): builtin zero-arg call followed by power then argument
      if (base.kind === 'FuncCallExpr' && base.args.length === 0 &&
          POWER_TRIG_FUNCS.has(base.name)) {
        let arg: Expr | undefined;
        if (this.check(TokenKind.LParen)) {
          this.advance();
          arg = this.parseExpr();
          this.expect(TokenKind.RParen);
        } else if (this.check(TokenKind.LBrace)) {
          this.advance();
          arg = this.parseExpr();
          this.expect(TokenKind.RBrace);
        } else if (this.check(TokenKind.Identifier) || this.check(TokenKind.Number)) {
          arg = this.parsePrimary();
        }
        if (arg !== undefined) {
          const callSpan = this.mkSpan(base.span.start, arg.span.end);
          const newBase: FuncCallExpr = { ...base, args: [arg], span: callSpan };
          const span = this.mkSpan(base.span.start, arg.span.end);
          return { kind: 'BinaryExpr', op: '^', left: newBase, right: exp, span };
        }
      }
      const span = this.mkSpan(base.span.start, exp.span.end);
      return { kind: 'BinaryExpr', op: '^', left: base, right: exp, span };
    }
    return base;
  }

  private parseUnary(): Expr {
    const t = this.peek();
    if (t.kind === TokenKind.Minus) {
      this.advance();
      const operand = this.parsePostfix();
      const span = this.mkSpan(t.span.start, operand.span.end);
      return { kind: 'UnaryExpr', op: '-', operand, span };
    }
    if (t.kind === TokenKind.Not || t.kind === TokenKind.KwNot) {
      this.advance();
      const operand = this.parsePostfix();
      const span = this.mkSpan(t.span.start, operand.span.end);
      return { kind: 'UnaryExpr', op: '!', operand, span };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): Expr {
    let expr = this.parsePrimary();

    for (;;) {
      if (this.check(TokenKind.Factorial)) {
        const op = this.advance();
        const span = this.mkSpan(expr.span.start, op.span.end);
        expr = { kind: 'PostfixExpr', op: '!', operand: expr, span };
        continue;
      }
      if (this.check(TokenKind.Degree)) {
        const op = this.advance();
        const span = this.mkSpan(expr.span.start, op.span.end);
        expr = { kind: 'PostfixExpr', op: '°', operand: expr, span };
        continue;
      }
      if (this.check(TokenKind.LBracket)) {
        this.advance();
        // Matrix slice: m[:, j] or m[i, :]
        if (this.check(TokenKind.Colon)) {
          this.advance();
          if (this.check(TokenKind.Comma)) {
            // m[:, j] — column slice
            this.advance();
            const colIdx = this.parseExpr();
            this.expect(TokenKind.RBracket);
            const span = this.mkSpan(expr.span.start, this.prev().span.end);
            expr = { kind: 'MatrixSlice', object: expr, rowAll: true, colAll: false, colIdx, span } as MatrixSlice;
            continue;
          }
          // 1D slice: v[:] or v[:hi]
          const hi = this.check(TokenKind.RBracket) ? undefined : this.parseExpr();
          this.expect(TokenKind.RBracket);
          const span = this.mkSpan(expr.span.start, this.prev().span.end);
          expr = { kind: 'SliceExpr', object: expr, lo: undefined, hi, span };
          continue;
        }
        const idx = this.parseExpr();
        if (this.check(TokenKind.Comma)) {
          // m[i, :] — row slice
          this.advance();
          this.expect(TokenKind.Colon);
          this.expect(TokenKind.RBracket);
          const span = this.mkSpan(expr.span.start, this.prev().span.end);
          expr = { kind: 'MatrixSlice', object: expr, rowAll: false, rowIdx: idx, colAll: true, span } as MatrixSlice;
          continue;
        }
        if (this.check(TokenKind.Dot2)) {
          this.advance();
          const hi = this.check(TokenKind.RBracket) ? undefined : this.parseExpr();
          this.expect(TokenKind.RBracket);
          const span = this.mkSpan(expr.span.start, this.prev().span.end);
          expr = { kind: 'SliceExpr', object: expr, lo: idx, hi, span };
          continue;
        }
        this.expect(TokenKind.RBracket);
        const span = this.mkSpan(expr.span.start, this.prev().span.end);
        expr = { kind: 'IndexExpr', object: expr, index: idx, span };
        continue;
      }
      if (this.check(TokenKind.Period)) {
        this.advance();
        const member = this.expectIdent();
        // alias.func(args) → QualifiedCallExpr; alias.field → MemberExpr
        if (this.check(TokenKind.LParen) && expr.kind === 'IdentExpr') {
          this.advance(); // consume (
          const args: Expr[] = [];
          if (!this.check(TokenKind.RParen)) {
            args.push(this.parseExpr());
            while (this.check(TokenKind.Comma)) { this.advance(); args.push(this.parseExpr()); }
          }
          this.expect(TokenKind.RParen);
          const span = this.mkSpan(expr.span.start, this.prev().span.end);
          expr = { kind: 'QualifiedCallExpr', ns: expr.name, name: member, args, span };
        } else {
          const span = this.mkSpan(expr.span.start, this.prev().span.end);
          expr = { kind: 'MemberExpr', object: expr, member, span };
        }
        continue;
      }
      break;
    }

    return expr;
  }

  private parsePrimary(): Expr {
    const t = this.peek();

    // Parenthesized expression
    if (t.kind === TokenKind.LParen) {
      this.advance();
      const expr = this.parseExpr();
      this.expect(TokenKind.RParen);
      return expr;
    }

    // |x| — absolute value
    if (t.kind === TokenKind.AbsOpen) {
      const start = t.span.start;
      this.advance();
      const operand = this.parseExpr();
      this.expect(TokenKind.AbsClose);
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'AbsExpr', operand, span };
    }

    // \abs{x} — absolute value (LaTeX brace syntax)
    if (t.kind === TokenKind.Abs2) {
      const start = t.span.start;
      this.advance();
      this.expect(TokenKind.LBrace);
      const operand = this.parseExpr();
      this.expect(TokenKind.RBrace);
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'AbsExpr', operand, span };
    }

    // ‖v‖ — norm
    if (t.kind === TokenKind.NormOpen) {
      const start = t.span.start;
      this.advance();
      const operand = this.parseExpr();
      this.expect(TokenKind.NormClose);
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'NormExpr', operand, span };
    }

    // ⌊x⌋ — floor
    if (t.kind === TokenKind.FloorOpen) {
      const start = t.span.start;
      this.advance();
      const operand = this.parseExpr();
      this.expect(TokenKind.FloorClose);
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'FloorExpr', operand, span };
    }

    // ⌈x⌉ — ceil
    if (t.kind === TokenKind.CeilOpen) {
      const start = t.span.start;
      this.advance();
      const operand = this.parseExpr();
      this.expect(TokenKind.CeilClose);
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'CeilExpr', operand, span };
    }

    // \pm expr → [+expr, -expr]
    if (t.kind === TokenKind.Pm || t.kind === TokenKind.PlusMinus) {
      const start = t.span.start;
      this.advance();
      const operand = this.parseExpr();
      const span = this.mkSpan(start, operand.span.end);
      return { kind: 'PmExpr', operand, span };
    }

    // \mp expr → [-expr, +expr]  (reversed order vs \pm)
    // Trick: negate operand → codegen {+(−op), −(−op)} = {−op, +op} ✓
    if (t.kind === TokenKind.MinusPlus) {
      const start = t.span.start;
      this.advance();
      const operand = this.parseExpr();
      const span = this.mkSpan(start, operand.span.end);
      const neg: UnaryExpr = { kind: 'UnaryExpr', op: '-', operand, span: operand.span };
      return { kind: 'PmExpr', operand: neg, span };
    }

    // \frac{a}{b}
    if (t.kind === TokenKind.Frac) {
      return this.parseFrac();
    }

    // \sqrt{x} or \sqrt[n]{x}
    if (t.kind === TokenKind.Sqrt) {
      return this.parseSqrt();
    }

    // \begin{cases}
    if (t.kind === TokenKind.Begin) {
      return this.parseCases();
    }

    // \sum, \prod, ∑, ∏
    if (t.kind === TokenKind.Sum || t.kind === TokenKind.Prod) {
      return this.parseSumExpr(t.kind === TokenKind.Sum ? 'sum' : 'prod');
    }

    // \lim_{x \to a} body
    if (t.kind === TokenKind.Lim) {
      return this.parseLim();
    }

    // \int{lo}{hi} body d{var}  or  \int{lo}{hi}{var} body
    if (t.kind === TokenKind.Int) {
      return this.parseIntegral();
    }

    // \sigma{v} → std(v)
    if (t.kind === TokenKind.Sigma) {
      const start = t.span.start;
      this.advance();
      this.expect(TokenKind.LBrace);
      const arg = this.parseExpr();
      this.expect(TokenKind.RBrace);
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'FuncCallExpr', name: 'std', args: [arg], span };
    }

    // \Gamma{x} → tgamma(x)
    if (t.kind === TokenKind.Gamma) {
      const start = t.span.start;
      this.advance();
      this.expect(TokenKind.LBrace);
      const arg = this.parseExpr();
      this.expect(TokenKind.RBrace);
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'FuncCallExpr', name: 'tgamma', args: [arg], span };
    }

    // \bar{v} → mean(v)
    if (t.kind === TokenKind.Bar) {
      const start = t.span.start;
      this.advance();
      this.expect(TokenKind.LBrace);
      const arg = this.parseExpr();
      this.expect(TokenKind.RBrace);
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'FuncCallExpr', name: 'mean', args: [arg], span };
    }

    // \sigmaId / \GammaId → identifiers
    if (t.kind === TokenKind.SigmaId) {
      this.advance();
      return { kind: 'IdentExpr', name: 'σ', span: t.span };
    }
    if (t.kind === TokenKind.GammaId) {
      this.advance();
      return { kind: 'IdentExpr', name: 'Γ', span: t.span };
    }

    // inline if expr
    if (t.kind === TokenKind.KwIf) {
      return this.parseIfExpr();
    }

    // solve(var, lo, hi) { body }
    if (t.kind === TokenKind.KwSolve) {
      return this.parseSolve();
    }

    // Identifiers and function calls
    if (t.kind === TokenKind.Identifier) {
      return this.parseIdentOrCall();
    }

    // Built-in function-like keywords used as function calls
    if (this.isBuiltinFnKeyword(t.kind)) {
      return this.parseBuiltinFnCall();
    }

    // Number literal
    if (t.kind === TokenKind.Number) {
      this.advance();
      return { kind: 'NumberLit', value: Number(t.value), raw: t.value, span: t.span };
    }

    // nan / inf
    if (t.kind === TokenKind.KwNaN) {
      this.advance();
      return { kind: 'NumberLit', value: NaN, raw: 'nan', span: t.span };
    }
    if (t.kind === TokenKind.KwInf || t.kind === TokenKind.Inf2) {
      this.advance();
      return { kind: 'NumberLit', value: Infinity, raw: 'inf', span: t.span };
    }

    // Array / matrix literal
    if (t.kind === TokenKind.LBracket) {
      return this.parseArrayOrMatrix();
    }

    throw unexpectedToken(t, 'expression');
  }

  // ── LaTeX constructs ─────────────────────────────────────────────────────────

  private parseFrac(): FracExpr | DerivExpr {
    const start = this.peek().span.start;
    this.expect(TokenKind.Frac);
    this.expect(TokenKind.LBrace);
    const num = this.parseExpr();
    this.expect(TokenKind.RBrace);
    this.expect(TokenKind.LBrace);
    const den = this.parseExpr();
    this.expect(TokenKind.RBrace);

    // \frac{d}{dx} expr → DerivExpr(var='x', body=expr)
    if (
      num.kind === 'IdentExpr' && num.name === 'd' &&
      den.kind === 'IdentExpr' && den.name.length > 1 && den.name.startsWith('d')
    ) {
      const varName = den.name.slice(1); // 'dx' → 'x'
      const body = this.parseExpr();
      const span = this.mkSpan(start, body.span.end);
      return { kind: 'DerivExpr', var: varName, body, span };
    }

    const span = this.mkSpan(start, this.prev().span.end);
    return { kind: 'FracExpr', num, den, span };
  }

  private parseSqrt(): SqrtExpr {
    const start = this.peek().span.start;
    this.expect(TokenKind.Sqrt);
    let degree: Expr | undefined;
    if (this.check(TokenKind.LBracket)) {
      this.advance();
      degree = this.parseExpr();
      this.expect(TokenKind.RBracket);
    }
    this.expect(TokenKind.LBrace);
    const radicand = this.parseExpr();
    this.expect(TokenKind.RBrace);
    const span = this.mkSpan(start, this.prev().span.end);
    return { kind: 'SqrtExpr', degree, radicand, span };
  }

  private parseCases(): CasesExpr {
    const start = this.peek().span.start;
    this.expect(TokenKind.Begin);
    this.expect(TokenKind.LBrace);
    // consume 'cases' identifier
    const nameT = this.peek();
    if (nameT.kind !== TokenKind.Identifier || nameT.value !== 'cases') {
      throw unexpectedToken(nameT, '"cases"');
    }
    this.advance();
    this.expect(TokenKind.RBrace);
    this.skipNewlines();

    // Consume optional INDENT when cases body is indented
    const hasIndent = this.check(TokenKind.Indent);
    if (hasIndent) this.advance();

    const cases: Array<{ value: Expr; cond: Expr }> = [];
    let else_: Expr | undefined;

    while (!this.check(TokenKind.End) && !this.check(TokenKind.Dedent) && !this.check(TokenKind.EOF)) {
      this.skipNewlines();
      if (this.check(TokenKind.End) || this.check(TokenKind.Dedent) || this.check(TokenKind.EOF)) break;

      // Parse value at Cmp level (stops before && and ||) so they can serve as separators
      const value = this.parseCmpExpr();

      // Cases separator: & or &&
      if (this.check(TokenKind.Ampersand) || this.check(TokenKind.And)) {
        this.advance(); // consume & or &&

        // Skip \text{if} or bare 'if' keyword used as visual separator
        if (this.check(TokenKind.KwIf)) this.advance();

        const cond = this.parseExpr();
        // Consume \\ row separator (now emits CasesRowSep)
        if (this.check(TokenKind.CasesRowSep)) this.advance();
        this.skipNewlines();
        cases.push({ value, cond });
      } else {
        // No separator — this is the else branch (no-condition last case)
        else_ = value;
        if (this.check(TokenKind.CasesRowSep)) this.advance();
        this.skipNewlines();
        break;
      }
    }

    // Consume DEDENT if body was indented
    if (hasIndent && this.check(TokenKind.Dedent)) this.advance();

    this.expect(TokenKind.End);
    this.expect(TokenKind.LBrace);
    const endName = this.peek();
    if (endName.kind !== TokenKind.Identifier || endName.value !== 'cases') {
      throw unexpectedToken(endName, '"cases"');
    }
    this.advance();
    this.expect(TokenKind.RBrace);

    const span = this.mkSpan(start, this.prev().span.end);
    return { kind: 'CasesExpr', cases, else_, span };
  }

  private parseSumExpr(op: 'sum' | 'prod'): SumExpr {
    const start = this.peek().span.start;
    this.advance(); // consume \sum / \prod / ∑ / ∏

    let iterKind: 'range' | 'array';
    let varName: string;
    let lo: Expr | undefined;
    let hi: Expr | undefined;
    let array: string | undefined;

    if (this.check(TokenKind.LParen)) {
      // Short form: ∑(i=lo, hi) body
      this.advance();
      varName = this.expectIdent();
      this.expect(TokenKind.Assign);
      lo = this.parseExpr();
      this.expect(TokenKind.Comma);
      hi = this.parseExpr();
      this.expect(TokenKind.RParen);
      iterKind = 'range';
    } else {
      // LaTeX form: \sum_{i=lo}^{hi} body  or  \sum_{x \in v} body
      // Consume `_` (underscore identifier or Identifier("_"))
      // The lexer produces Identifier("_") for bare `_`
      if (this.check(TokenKind.Identifier) && this.peek().value === '_') {
        this.advance(); // consume '_'
      }
      this.expect(TokenKind.LBrace);
      varName = this.expectIdent();
      if (this.check(TokenKind.Assign)) {
        // range: i=lo}^{hi
        iterKind = 'range';
        this.advance();
        lo = this.parseExpr();
        this.expect(TokenKind.RBrace);
        this.expect(TokenKind.Caret);
        this.expect(TokenKind.LBrace);
        hi = this.parseExpr();
        this.expect(TokenKind.RBrace);
      } else if (this.check(TokenKind.In2)) {
        // array: x \in v
        iterKind = 'array';
        this.advance();
        array = this.expectIdent();
        this.expect(TokenKind.RBrace);
      } else {
        throw unexpectedToken(this.peek(), '= or \\in');
      }
    }

    const body = this.parseExpr();
    const span = this.mkSpan(start, body.span.end);
    return { kind: 'SumExpr', op, iterKind, var: varName, lo, hi, array, body, span };
  }

  // ── Identifier / function call ───────────────────────────────────────────────

  private parseIdentOrCall(): Expr {
    const t = this.peek();
    const name = t.value;
    this.advance();

    if (this.check(TokenKind.LParen)) {
      // Function call
      const start = t.span.start;
      this.advance();
      const args: Expr[] = [];
      if (!this.check(TokenKind.RParen)) {
        args.push(this.parseExpr());
        while (this.check(TokenKind.Comma)) {
          this.advance();
          args.push(this.parseExpr());
        }
      }
      this.expect(TokenKind.RParen);
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'FuncCallExpr', name, args, span };
    }

    return { kind: 'IdentExpr', name, span: t.span };
  }

  private isBuiltinFnKeyword(kind: TokenKind): boolean {
    return (
      kind === TokenKind.Sin || kind === TokenKind.Cos || kind === TokenKind.Tan ||
      kind === TokenKind.Cot || kind === TokenKind.Sec || kind === TokenKind.Csc ||
      kind === TokenKind.Arcsin || kind === TokenKind.Arccos || kind === TokenKind.Arctan ||
      kind === TokenKind.Sinh || kind === TokenKind.Cosh || kind === TokenKind.Tanh ||
      kind === TokenKind.Log || kind === TokenKind.Lg || kind === TokenKind.Ln ||
      kind === TokenKind.Gcd || kind === TokenKind.Lcm || kind === TokenKind.Binom ||
      kind === TokenKind.LatexMin || kind === TokenKind.LatexMax
    );
  }

  private parseBuiltinFnCall(): FuncCallExpr | SumExpr {
    const t = this.advance();
    const rawName = t.value.replace(/^\\/, ''); // strip leading backslash
    // \inf / \sup are semantic aliases for min / max
    const name = rawName === 'inf' ? 'min' : rawName === 'sup' ? 'max' : rawName;
    const start = t.span.start;

    // \min / \max / \inf / \sup with subscript → SumExpr aggregator
    if ((name === 'min' || name === 'max') && this.checkIdentUnderscore()) {
      return this.parseSumExprWith(name as 'min' | 'max', start);
    }

    // \log_{base}{x} or \log{base}{x} → __log_base(x, base)
    if ((name === 'log' || name === 'lg') && (this.checkIdentUnderscore() || this.check(TokenKind.LBrace))) {
      let base: Expr | undefined;
      if (this.checkIdentUnderscore()) {
        this.advance(); // consume _
        this.expect(TokenKind.LBrace);
        base = this.parseExpr();
        this.expect(TokenKind.RBrace);
      } else {
        // \log{base}{x} form
        this.expect(TokenKind.LBrace);
        base = this.parseExpr();
        this.expect(TokenKind.RBrace);
      }
      this.expect(TokenKind.LBrace);
      const x = this.parseExpr();
      this.expect(TokenKind.RBrace);
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'FuncCallExpr', name: '__log_base', args: [x, base], span };
    }

    if (this.check(TokenKind.LBrace)) {
      // LaTeX two-brace form: \binom{n}{k}, \gcd{a}{b}, \lcm{a}{b}
      const twoArgFns = new Set(['binom', 'gcd', 'lcm']);
      this.advance();
      const arg1 = this.parseExpr();
      this.expect(TokenKind.RBrace);
      if (twoArgFns.has(name) && this.check(TokenKind.LBrace)) {
        this.advance();
        const arg2 = this.parseExpr();
        this.expect(TokenKind.RBrace);
        const span = this.mkSpan(start, this.prev().span.end);
        return { kind: 'FuncCallExpr', name, args: [arg1, arg2], span };
      }
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'FuncCallExpr', name, args: [arg1], span };
    }

    if (this.check(TokenKind.LParen)) {
      // Regular call \sin(x)
      this.advance();
      const args: Expr[] = [];
      if (!this.check(TokenKind.RParen)) {
        args.push(this.parseExpr());
        while (this.check(TokenKind.Comma)) {
          this.advance();
          args.push(this.parseExpr());
        }
      }
      this.expect(TokenKind.RParen);
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'FuncCallExpr', name, args, span };
    }

    // \sin x — bare identifier atom as argument (LaTeX no-paren form)
    if (this.check(TokenKind.Identifier) || this.check(TokenKind.Number)) {
      const arg = this.parsePrimary();
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'FuncCallExpr', name, args: [arg], span };
    }

    // Bare keyword (no args) — treat as zero-arg call (identifier)
    return { kind: 'FuncCallExpr', name, args: [], span: t.span };
  }

  // \min_{x \in v} expr  or  \max_{x \in v} expr
  private parseSumExprWith(op: 'min' | 'max', start: Position): SumExpr {
    this.advance(); // consume '_'
    this.expect(TokenKind.LBrace);
    const varName = this.expectIdent();
    this.expect(TokenKind.In2);
    const array = this.expectIdent();
    this.expect(TokenKind.RBrace);
    const body = this.parseExpr();
    const span = this.mkSpan(start, body.span.end);
    return { kind: 'SumExpr', op, iterKind: 'array', var: varName, array, body, span };
  }

  // ── if expression (inline) ───────────────────────────────────────────────────

  private parseIfExpr(): IfExpr {
    const start = this.peek().span.start;
    this.expect(TokenKind.KwIf);
    const hasParen = this.check(TokenKind.LParen);
    if (hasParen) this.advance();
    const cond = this.parseExpr();
    if (hasParen) this.expect(TokenKind.RParen);
    const then = this.parseExpr();
    this.expect(TokenKind.KwElse);
    const else_ = this.parseExpr();
    const span = this.mkSpan(start, else_.span.end);
    return { kind: 'IfExpr', cond, then, else_, span };
  }

  // ── Array / matrix ───────────────────────────────────────────────────────────

  private parseArrayOrMatrix(): ArrayLit | MatrixLit {
    const start = this.peek().span.start;
    this.expect(TokenKind.LBracket);
    this.skipNewlines();

    // Empty array
    if (this.check(TokenKind.RBracket)) {
      this.advance();
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'ArrayLit', elements: [], span };
    }

    // If first element is `[`, it's a matrix
    if (this.check(TokenKind.LBracket)) {
      const rows: ArrayLit[] = [];
      while (!this.check(TokenKind.RBracket) && !this.check(TokenKind.EOF)) {
        this.skipNewlines();
        if (this.check(TokenKind.RBracket)) break;
        const rowStart = this.peek().span.start;
        this.expect(TokenKind.LBracket);
        const elements = this.parseExprList();
        this.expect(TokenKind.RBracket);
        const rowSpan = this.mkSpan(rowStart, this.prev().span.end);
        rows.push({ kind: 'ArrayLit', elements, span: rowSpan });
        // skip optional comma between rows
        if (this.check(TokenKind.Comma)) this.advance();
        this.skipNewlines();
      }
      this.expect(TokenKind.RBracket);
      const span = this.mkSpan(start, this.prev().span.end);
      return { kind: 'MatrixLit', rows, span };
    }

    // Regular array
    const elements = this.parseExprList();
    this.expect(TokenKind.RBracket);
    const span = this.mkSpan(start, this.prev().span.end);
    return { kind: 'ArrayLit', elements, span };
  }

  private parseExprList(): Expr[] {
    const items: Expr[] = [];
    if (this.check(TokenKind.RBracket) || this.check(TokenKind.EOF)) return items;
    items.push(this.parseExpr());
    while (this.check(TokenKind.Comma)) {
      this.advance();
      if (this.check(TokenKind.RBracket)) break;
      items.push(this.parseExpr());
    }
    return items;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private mkBinary(op: BinOp, left: Expr, right: Expr, _start: Position): BinaryExpr {
    const span = this.mkSpan(left.span.start, right.span.end);
    return { kind: 'BinaryExpr', op, left, right, span };
  }

  private mkSpan(start: Position, end: Position): Span {
    const file = this.tokens[0]?.span.file ?? '<input>';
    return { start, end, file };
  }

  private peek(): Token {
    return this.tokens[this.pos] ?? this.tokens[this.tokens.length - 1]!;
  }

  private peekAt(offset: number): Token {
    const idx = this.pos + offset;
    return this.tokens[idx] ?? this.tokens[this.tokens.length - 1]!;
  }

  private prev(): Token {
    return this.tokens[this.pos - 1] ?? this.tokens[0]!;
  }

  private advance(): Token {
    const t = this.peek();
    if (t.kind !== TokenKind.EOF) this.pos++;
    return t;
  }

  private check(kind: TokenKind): boolean {
    return this.peek().kind === kind;
  }

  private checkIdentUnderscore(): boolean {
    const t = this.peek();
    return t.kind === TokenKind.Identifier && t.value === '_';
  }

  private expect(kind: TokenKind): Token {
    const t = this.peek();
    if (t.kind !== kind) throw expectedKind(t, kind);
    return this.advance();
  }

  private expectIdent(): string {
    const t = this.peek();
    if (t.kind !== TokenKind.Identifier) throw unexpectedToken(t, 'identifier');
    this.advance();
    return t.value;
  }

  private skipNewlines(): void {
    while (this.check(TokenKind.Newline)) this.advance();
  }

  // ── Phase 7 — numerical constructs ──────────────────────────────────────────

  private parseLim(): LimExpr {
    // \lim_{x \to a} body  OR  \lim_{x \to \infty} body
    const start = this.peek().span.start;
    this.expect(TokenKind.Lim);
    // Consume optional `_` identifier
    if (this.checkIdentUnderscore()) this.advance();
    this.expect(TokenKind.LBrace);
    const varName = this.expectIdent();
    this.expect(TokenKind.To); // \to
    const isInfToken = () =>
      this.check(TokenKind.Inf2) || this.check(TokenKind.KwInf) ||
      (this.check(TokenKind.Identifier) && (this.peek().value === '∞' || this.peek().value === 'inf'));
    const toInf = isInfToken();
    let to: Expr;
    if (toInf) {
      const tInf = this.advance();
      to = { kind: 'NumberLit', value: Infinity, raw: 'inf', span: tInf.span };
    } else {
      to = this.parseExpr();
    }
    this.expect(TokenKind.RBrace);
    const body = this.parseExpr();
    const span = this.mkSpan(start, body.span.end);
    return { kind: 'LimExpr', var: varName, to, toInf, body, span };
  }

  private parseIntegral(): IntegralExpr {
    // Standard LaTeX: \int_{lo}^{hi} body dx
    // Our custom form: \int{lo}{hi} body dx  or  \int{lo}{hi}{var} body
    const start = this.peek().span.start;
    this.expect(TokenKind.Int);

    let lo: Expr;
    let hi: Expr;

    if (this.checkIdentUnderscore()) {
      // Standard LaTeX subscript/superscript form: \int_{lo}^{hi}
      this.advance(); // consume '_'
      this.expect(TokenKind.LBrace);
      lo = this.parseExpr();
      this.expect(TokenKind.RBrace);
      if (this.check(TokenKind.Caret)) {
        this.advance();
        this.expect(TokenKind.LBrace);
        hi = this.parseExpr();
        this.expect(TokenKind.RBrace);
      } else {
        hi = lo; // degenerate — should not appear in practice
      }
    } else {
      // Our brace form: \int{lo}{hi}
      this.expect(TokenKind.LBrace);
      lo = this.parseExpr();
      this.expect(TokenKind.RBrace);
      this.expect(TokenKind.LBrace);
      hi = this.parseExpr();
      this.expect(TokenKind.RBrace);
    }
    // Optional {var} brace — if not present, next ident starting with 'd' is the var
    let varName = 'x';
    if (this.check(TokenKind.LBrace)) {
      this.advance();
      varName = this.expectIdent();
      this.expect(TokenKind.RBrace);
      const body = this.parseExpr();
      const span = this.mkSpan(start, body.span.end);
      return { kind: 'IntegralExpr', var: varName, lo, hi, body, span };
    }
    const body = this.parseExpr();
    // Consume trailing 'd{var}' identifier like 'dx', 'dt'
    if (this.check(TokenKind.Identifier)) {
      const dv = this.peek().value;
      if (dv.length > 1 && dv.startsWith('d')) {
        varName = dv.slice(1);
        this.advance();
      }
    }
    const span = this.mkSpan(start, body.span.end);
    return { kind: 'IntegralExpr', var: varName, lo, hi, body, span };
  }

  private parseSolve(): SolveExpr {
    // solve(var, lo, hi) { body }  — body should equal 0
    const start = this.peek().span.start;
    this.expect(TokenKind.KwSolve);
    this.expect(TokenKind.LParen);
    const varName = this.expectIdent();
    this.expect(TokenKind.Comma);
    const lo = this.parseExpr();
    this.expect(TokenKind.Comma);
    const hi = this.parseExpr();
    this.expect(TokenKind.RParen);
    // Body in braces or as a direct expression
    let body: Expr;
    if (this.check(TokenKind.LBrace)) {
      this.advance();
      body = this.parseExpr();
      this.expect(TokenKind.RBrace);
    } else {
      body = this.parseExpr();
    }
    const span = this.mkSpan(start, body.span.end);
    return { kind: 'SolveExpr', var: varName, lo, hi, body, span };
  }

}

export function parseSource(tokens: Token[]): File {
  return new Parser(tokens).parse();
}

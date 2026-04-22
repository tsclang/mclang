import type { Span } from './index.js';
import type {
  File, FuncDef, Stmt, Expr,
  AssignStmt, IfNode, ForStmt, WhileStmt,
  WhereBlock, FuncCallExpr,
} from '../ast/nodes.js';
import { ErrorCode } from '../diagnostics/codes.js';

export type TypeError = {
  code: ErrorCode;
  level: 'error' | 'warning';
  message: string;
  span: Span;
};

// Known builtin functions (no arity check — variadic or well-known)
const BUILTINS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'asin', 'acos', 'atan', 'atan2', 'arctan2', 'acot',
  'arcsin', 'arccos', 'arctan', 'arccot',
  'sinh', 'cosh', 'tanh', 'coth', 'asinh', 'acosh', 'atanh',
  'sqrt', 'cbrt', 'exp', 'log', 'ln', 'log2', 'log10', 'lg', 'deg',
  'abs', 'fabs', 'floor', 'ceil', 'round', 'trunc',
  'min', 'max', 'fmin', 'fmax', 'hypot',
  'pow', 'sgn', 'erf', 'erfc',
  'sum', 'product', 'mean', 'std', 'norm',
  'dot', 'cross', 'transpose', 'det', 'inv',
  'I', 'zeros', 'ones',
  'is_nan', 'is_inf', 'is_finite',
  'mod', 'gcd', 'lcm',
]);

type FuncSig = { paramCount: number };

export function typeCheck(file: File): TypeError[] {
  const errors: TypeError[] = [];

  // Collect global constant names (ConstDef nodes)
  const globalConsts = new Set<string>();
  for (const node of file.body) {
    if (node.kind === 'ConstDef') {
      globalConsts.add(node.name);
    }
  }

  // First pass: collect all function signatures (enables mutual recursion check)
  const funcSigs = new Map<string, FuncSig>();
  for (const node of file.body) {
    if (node.kind === 'FuncDef') {
      funcSigs.set(node.name, { paramCount: node.params.length });
    }
  }

  // Second pass: check each function body
  for (const node of file.body) {
    if (node.kind === 'FuncDef') {
      checkFunc(node, funcSigs, globalConsts, errors);
    }
  }

  return errors;
}

function checkFunc(
  node: FuncDef,
  funcSigs: Map<string, FuncSig>,
  globalConsts: Set<string>,
  errors: TypeError[],
): void {
  const paramNames = new Set(node.params.map(p => p.name));

  // Check body statements
  checkStmts(node.body, paramNames, funcSigs, globalConsts, errors);

  // Check where block (unused variable detection + expression checks)
  if (node.where) {
    checkWhereBlock(node.where, paramNames, funcSigs, globalConsts, node.body, errors);
  }
}

function checkStmts(
  stmts: Stmt[],
  params: Set<string>,
  funcSigs: Map<string, FuncSig>,
  globalConsts: Set<string>,
  errors: TypeError[],
): void {
  for (const stmt of stmts) {
    checkStmt(stmt, params, funcSigs, globalConsts, errors);
  }
}

function checkStmt(
  stmt: Stmt,
  params: Set<string>,
  funcSigs: Map<string, FuncSig>,
  globalConsts: Set<string>,
  errors: TypeError[],
): void {
  switch (stmt.kind) {
    case 'AssignStmt':
      checkAssign(stmt, params, funcSigs, globalConsts, errors);
      break;
    case 'ExprStmt':
      checkExpr(stmt.expr, params, funcSigs, errors);
      break;
    case 'IfNode':
      checkIfNode(stmt, params, funcSigs, globalConsts, errors);
      break;
    case 'ForStmt':
      checkForStmt(stmt, params, funcSigs, globalConsts, errors);
      break;
    case 'WhileStmt':
      checkWhileStmt(stmt, params, funcSigs, globalConsts, errors);
      break;
  }
}

function checkAssign(
  stmt: AssignStmt,
  params: Set<string>,
  funcSigs: Map<string, FuncSig>,
  globalConsts: Set<string>,
  errors: TypeError[],
): void {
  if (params.has(stmt.name)) {
    errors.push({
      code: ErrorCode.ImmutableParameter,
      level: 'error',
      message: `Cannot assign to parameter '${stmt.name}': function parameters are immutable`,
      span: stmt.span,
    });
  } else if (globalConsts.has(stmt.name)) {
    errors.push({
      code: ErrorCode.ImmutableConstant,
      level: 'error',
      message: `Cannot assign to constant '${stmt.name}': global constants are immutable`,
      span: stmt.span,
    });
  }
  checkExpr(stmt.value, params, funcSigs, errors);
}

function checkIfNode(
  node: IfNode,
  params: Set<string>,
  funcSigs: Map<string, FuncSig>,
  globalConsts: Set<string>,
  errors: TypeError[],
): void {
  checkExpr(node.cond, params, funcSigs, errors);
  if (Array.isArray(node.then)) {
    checkStmts(node.then as Stmt[], params, funcSigs, globalConsts, errors);
  } else {
    checkExpr(node.then as Expr, params, funcSigs, errors);
  }
  if (node.else_ !== undefined) {
    if (Array.isArray(node.else_)) {
      checkStmts(node.else_ as Stmt[], params, funcSigs, globalConsts, errors);
    } else if (typeof node.else_ === 'object' && 'kind' in node.else_) {
      const el = node.else_ as Expr | IfNode;
      if (el.kind === 'IfNode') {
        checkIfNode(el, params, funcSigs, globalConsts, errors);
      } else {
        checkExpr(el as Expr, params, funcSigs, errors);
      }
    }
  }
}

function checkForStmt(
  stmt: ForStmt,
  params: Set<string>,
  funcSigs: Map<string, FuncSig>,
  globalConsts: Set<string>,
  errors: TypeError[],
): void {
  checkExpr(stmt.lo, params, funcSigs, errors);
  checkExpr(stmt.hi, params, funcSigs, errors);
  if (stmt.step) checkExpr(stmt.step, params, funcSigs, errors);
  checkStmts(stmt.body, params, funcSigs, globalConsts, errors);
}

function checkWhileStmt(
  stmt: WhileStmt,
  params: Set<string>,
  funcSigs: Map<string, FuncSig>,
  globalConsts: Set<string>,
  errors: TypeError[],
): void {
  checkExpr(stmt.cond, params, funcSigs, errors);
  checkStmts(stmt.body, params, funcSigs, globalConsts, errors);
}

function checkWhereBlock(
  where: WhereBlock,
  params: Set<string>,
  funcSigs: Map<string, FuncSig>,
  globalConsts: Set<string>,
  bodyStmts: Stmt[],
  errors: TypeError[],
): void {
  // Collect all identifiers referenced in body statements and in other where lines
  const usedInBody = new Set<string>();
  for (const stmt of bodyStmts) collectIdentsFromStmt(stmt, usedInBody);

  const defs = where.lines.filter(l => l.kind === 'WhereDef') as Array<{ kind: 'WhereDef'; name: string; value: Expr; span: import('./index.js').Span }>;
  const guards = where.lines.filter(l => l.kind === 'WhereGuard') as Array<{ kind: 'WhereGuard'; expr: Expr; span: import('./index.js').Span }>;

  // Collect identifiers used by other where defs and guards
  const usedInWhere = new Set<string>();
  for (const def of defs) collectIdentsFromExpr(def.value, usedInWhere);
  for (const guard of guards) collectIdentsFromExpr(guard.expr, usedInWhere);

  // W003: any WhereDef name not referenced in body or other where lines
  for (const def of defs) {
    if (!usedInBody.has(def.name) && !usedInWhere.has(def.name)) {
      errors.push({
        code: ErrorCode.UnusedVariable,
        level: 'warning',
        message: `Variable '${def.name}' is defined in where block but never used`,
        span: def.span,
      });
    }
    checkExpr(def.value, params, funcSigs, errors);
  }
  for (const guard of guards) {
    checkExpr(guard.expr, params, funcSigs, errors);
  }
}

function checkExpr(
  expr: Expr,
  params: Set<string>,
  funcSigs: Map<string, FuncSig>,
  errors: TypeError[],
): void {
  switch (expr.kind) {
    case 'FuncCallExpr':
      checkFuncCall(expr, params, funcSigs, errors);
      break;
    case 'QualifiedCallExpr':
      for (const arg of (expr as import('../ast/nodes.js').QualifiedCallExpr).args) {
        checkExpr(arg, params, funcSigs, errors);
      }
      break;
    case 'BinaryExpr':
      checkExpr(expr.left, params, funcSigs, errors);
      checkExpr(expr.right, params, funcSigs, errors);
      break;
    case 'UnaryExpr':
      checkExpr(expr.operand, params, funcSigs, errors);
      break;
    case 'IfExpr':
      checkExpr(expr.cond, params, funcSigs, errors);
      checkExpr(expr.then, params, funcSigs, errors);
      checkExpr(expr.else_, params, funcSigs, errors);
      break;
    case 'IndexExpr':
      checkExpr(expr.object, params, funcSigs, errors);
      checkExpr(expr.index, params, funcSigs, errors);
      break;
    case 'SliceExpr':
      checkExpr(expr.object, params, funcSigs, errors);
      if (expr.lo) checkExpr(expr.lo, params, funcSigs, errors);
      if (expr.hi) checkExpr(expr.hi, params, funcSigs, errors);
      break;
    case 'MemberExpr':
      checkExpr(expr.object, params, funcSigs, errors);
      break;
    case 'ArrayLit':
      for (const el of expr.elements) checkExpr(el, params, funcSigs, errors);
      break;
    case 'MatrixLit':
      for (const row of expr.rows) for (const el of row.elements) checkExpr(el, params, funcSigs, errors);
      break;
    case 'FracExpr':
      checkExpr(expr.num, params, funcSigs, errors);
      checkExpr(expr.den, params, funcSigs, errors);
      break;
    case 'SqrtExpr':
      checkExpr(expr.radicand, params, funcSigs, errors);
      if (expr.degree) checkExpr(expr.degree, params, funcSigs, errors);
      break;
    case 'AbsExpr':
    case 'NormExpr':
    case 'FloorExpr':
    case 'CeilExpr':
    case 'PmExpr':
    case 'PostfixExpr':
      checkExpr(expr.operand, params, funcSigs, errors);
      break;
    case 'CasesExpr':
      for (const c of expr.cases) {
        checkExpr(c.value, params, funcSigs, errors);
        checkExpr(c.cond, params, funcSigs, errors);
      }
      if (expr.else_) checkExpr(expr.else_, params, funcSigs, errors);
      break;
    case 'SumExpr':
      checkExpr(expr.body, params, funcSigs, errors);
      if (expr.lo) checkExpr(expr.lo, params, funcSigs, errors);
      if (expr.hi) checkExpr(expr.hi, params, funcSigs, errors);
      break;
    case 'ChainCmpExpr':
      for (const operand of expr.parts) checkExpr(operand, params, funcSigs, errors);
      break;
    case 'LimExpr':
      checkExpr(expr.body, params, funcSigs, errors);
      if (expr.to) checkExpr(expr.to, params, funcSigs, errors);
      break;
    case 'DerivExpr':
      checkExpr(expr.body, params, funcSigs, errors);
      break;
    case 'IntegralExpr':
      checkExpr(expr.body, params, funcSigs, errors);
      checkExpr(expr.lo, params, funcSigs, errors);
      checkExpr(expr.hi, params, funcSigs, errors);
      break;
    case 'SolveExpr':
      checkExpr(expr.body, params, funcSigs, errors);
      checkExpr(expr.lo, params, funcSigs, errors);
      checkExpr(expr.hi, params, funcSigs, errors);
      break;
    // Leaf nodes: no sub-expressions to check
    case 'NumberLit':
    case 'IdentExpr':
      break;
  }
}

function checkFuncCall(
  expr: FuncCallExpr,
  params: Set<string>,
  funcSigs: Map<string, FuncSig>,
  errors: TypeError[],
): void {
  // Check each argument
  for (const arg of expr.args) {
    checkExpr(arg, params, funcSigs, errors);
  }

  const name = expr.name;

  // Skip builtins
  if (BUILTINS.has(name)) return;

  const sig = funcSigs.get(name);
  if (sig === undefined) {
    errors.push({
      code: ErrorCode.UndefinedIdentifier,
      level: 'error',
      message: `Call to undefined function '${name}'`,
      span: expr.span,
    });
    return;
  }

  if (expr.args.length !== sig.paramCount) {
    errors.push({
      code: ErrorCode.TypeMismatch,
      level: 'error',
      message: `'${name}' expects ${sig.paramCount} argument(s), got ${expr.args.length}`,
      span: expr.span,
    });
  }
}

function collectIdentsFromExpr(expr: Expr, out: Set<string>): void {
  switch (expr.kind) {
    case 'IdentExpr': out.add(expr.name); break;
    case 'BinaryExpr':
      collectIdentsFromExpr(expr.left, out);
      collectIdentsFromExpr(expr.right, out);
      break;
    case 'UnaryExpr': collectIdentsFromExpr(expr.operand, out); break;
    case 'FuncCallExpr': for (const a of expr.args) collectIdentsFromExpr(a, out); break;
    case 'QualifiedCallExpr': for (const a of (expr as import('../ast/nodes.js').QualifiedCallExpr).args) collectIdentsFromExpr(a, out); break;
    case 'IfExpr':
      collectIdentsFromExpr(expr.cond, out);
      collectIdentsFromExpr(expr.then, out);
      collectIdentsFromExpr(expr.else_, out);
      break;
    case 'IndexExpr':
      collectIdentsFromExpr(expr.object, out);
      collectIdentsFromExpr(expr.index, out);
      break;
    case 'SliceExpr':
      collectIdentsFromExpr(expr.object, out);
      if (expr.lo) collectIdentsFromExpr(expr.lo, out);
      if (expr.hi) collectIdentsFromExpr(expr.hi, out);
      break;
    case 'MemberExpr': collectIdentsFromExpr(expr.object, out); break;
    case 'ArrayLit': for (const el of expr.elements) collectIdentsFromExpr(el, out); break;
    case 'MatrixLit': for (const row of expr.rows) for (const el of row.elements) collectIdentsFromExpr(el, out); break;
    case 'FracExpr':
      collectIdentsFromExpr(expr.num, out);
      collectIdentsFromExpr(expr.den, out);
      break;
    case 'SqrtExpr':
      collectIdentsFromExpr(expr.radicand, out);
      if (expr.degree) collectIdentsFromExpr(expr.degree, out);
      break;
    case 'AbsExpr':
    case 'NormExpr':
    case 'FloorExpr':
    case 'CeilExpr':
    case 'PmExpr':
    case 'PostfixExpr':
      collectIdentsFromExpr(expr.operand, out);
      break;
    case 'CasesExpr':
      for (const c of expr.cases) {
        collectIdentsFromExpr(c.value, out);
        collectIdentsFromExpr(c.cond, out);
      }
      if (expr.else_) collectIdentsFromExpr(expr.else_, out);
      break;
    case 'SumExpr':
      collectIdentsFromExpr(expr.body, out);
      if (expr.lo) collectIdentsFromExpr(expr.lo, out);
      if (expr.hi) collectIdentsFromExpr(expr.hi, out);
      break;
    case 'ChainCmpExpr': for (const p of expr.parts) collectIdentsFromExpr(p, out); break;
    case 'LimExpr':
      collectIdentsFromExpr(expr.body, out);
      if (expr.to) collectIdentsFromExpr(expr.to, out);
      break;
    case 'DerivExpr': collectIdentsFromExpr(expr.body, out); break;
    case 'IntegralExpr':
    case 'SolveExpr':
      collectIdentsFromExpr(expr.body, out);
      collectIdentsFromExpr(expr.lo, out);
      collectIdentsFromExpr(expr.hi, out);
      break;
  }
}

function collectIdentsFromStmt(stmt: Stmt, out: Set<string>): void {
  switch (stmt.kind) {
    case 'AssignStmt':
      collectIdentsFromExpr(stmt.value, out);
      break;
    case 'ExprStmt':
      collectIdentsFromExpr(stmt.expr, out);
      break;
    case 'IfNode':
      collectIdentsFromExpr(stmt.cond, out);
      if (Array.isArray(stmt.then)) {
        for (const s of stmt.then as Stmt[]) collectIdentsFromStmt(s, out);
      } else {
        collectIdentsFromExpr(stmt.then as Expr, out);
      }
      if (stmt.else_ !== undefined) {
        if (Array.isArray(stmt.else_)) {
          for (const s of stmt.else_ as Stmt[]) collectIdentsFromStmt(s, out);
        } else if (typeof stmt.else_ === 'object' && 'kind' in stmt.else_) {
          const el = stmt.else_ as Expr | import('../ast/nodes.js').IfNode;
          if (el.kind === 'IfNode') {
            collectIdentsFromStmt(el as unknown as Stmt, out);
          } else {
            collectIdentsFromExpr(el as Expr, out);
          }
        }
      }
      break;
    case 'ForStmt':
      collectIdentsFromExpr(stmt.lo, out);
      collectIdentsFromExpr(stmt.hi, out);
      if (stmt.step) collectIdentsFromExpr(stmt.step, out);
      for (const s of stmt.body) collectIdentsFromStmt(s, out);
      break;
    case 'WhileStmt':
      collectIdentsFromExpr(stmt.cond, out);
      for (const s of stmt.body) collectIdentsFromStmt(s, out);
      break;
  }
}

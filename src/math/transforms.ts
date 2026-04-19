import type {
  File, TopLevelNode, ConstDef, FuncDef,
  Stmt, AssignStmt, IfNode, ForStmt, WhileStmt, ExprStmt,
  WhereBlock, WhereLine, Param,
  Expr, BinaryExpr, UnaryExpr, FuncCallExpr, IfExpr,
  IndexExpr, SliceExpr, MatrixSlice, MemberExpr,
  FracExpr, SqrtExpr, AbsExpr, NormExpr, FloorExpr, CeilExpr,
  PmExpr, CasesExpr, SumExpr, PostfixExpr, ChainCmpExpr,
  LimExpr, DerivExpr, IntegralExpr, SolveExpr,
  TableExpr,
} from '../ast/nodes.js';
import { constantFold } from './const-fold.js';

// ── Public entry point ────────────────────────────────────────────────────────

export function transformFile(file: File): File {
  return { ...file, body: file.body.map(transformTopLevel) };
}

// ── Top-level ─────────────────────────────────────────────────────────────────

function transformTopLevel(node: TopLevelNode): TopLevelNode {
  switch (node.kind) {
    case 'ConstDef':
      return { ...node, value: transformExpr(node.value) };
    case 'FuncDef':
      return {
        ...node,
        body: node.body.map(transformStmt),
        where: node.where ? transformWhere(node.where) : undefined,
      };
    case 'ImportDef': return node;
  }
}

// ── Where block ───────────────────────────────────────────────────────────────

function transformWhere(w: WhereBlock): WhereBlock {
  return {
    ...w,
    lines: w.lines.map((line): WhereLine => {
      if (line.kind === 'WhereDef') {
        return { ...line, value: transformExpr(line.value) };
      }
      return { ...line, expr: transformExpr(line.expr) };
    }),
  };
}

// ── Statements ────────────────────────────────────────────────────────────────

function transformStmt(stmt: Stmt): Stmt {
  switch (stmt.kind) {
    case 'AssignStmt':
      return { ...stmt, value: transformExpr(stmt.value) };
    case 'ExprStmt':
      return { ...stmt, expr: transformExpr(stmt.expr) };
    case 'IfNode':
      return {
        ...stmt,
        cond: transformExpr(stmt.cond),
        then: Array.isArray(stmt.then) ? stmt.then.map(transformStmt) : transformExpr(stmt.then as Expr),
        else_: stmt.else_
          ? Array.isArray(stmt.else_)
            ? (stmt.else_ as Stmt[]).map(transformStmt)
            : stmt.else_.kind === 'IfNode'
              ? transformStmt(stmt.else_ as Stmt)
              : transformExpr(stmt.else_ as Expr)
          : undefined,
      } as IfNode;
    case 'ForStmt':
      return {
        ...stmt,
        lo: transformExpr(stmt.lo),
        hi: transformExpr(stmt.hi),
        step: stmt.step ? transformExpr(stmt.step) : undefined,
        body: stmt.body.map(transformStmt),
      };
    case 'WhileStmt':
      return {
        ...stmt,
        cond: transformExpr(stmt.cond),
        body: stmt.body.map(transformStmt),
      };
  }
}

// ── Expressions ───────────────────────────────────────────────────────────────

function transformExpr(expr: Expr): Expr {
  // First recurse, then apply pattern rules, then constant-fold
  const e = recurseExpr(expr);
  const p = applyPatterns(e);
  return constantFold(p);
}

function recurseExpr(expr: Expr): Expr {
  switch (expr.kind) {
    case 'NumberLit':
    case 'BoolLit':
    case 'IdentExpr':
      return expr;
    case 'BinaryExpr': {
      const b = expr as BinaryExpr;
      return { ...b, left: transformExpr(b.left), right: transformExpr(b.right) };
    }
    case 'UnaryExpr': {
      const u = expr as UnaryExpr;
      return { ...u, operand: transformExpr(u.operand) };
    }
    case 'FuncCallExpr': {
      const f = expr as FuncCallExpr;
      return { ...f, args: f.args.map(transformExpr) };
    }
    case 'QualifiedCallExpr': {
      const q = expr as import('../ast/nodes.js').QualifiedCallExpr;
      return { ...q, args: q.args.map(transformExpr) };
    }
    case 'IfExpr': {
      const i = expr as IfExpr;
      return { ...i, cond: transformExpr(i.cond), then: transformExpr(i.then), else_: transformExpr(i.else_) };
    }
    case 'IndexExpr': {
      const ix = expr as IndexExpr;
      return { ...ix, object: transformExpr(ix.object), index: transformExpr(ix.index) };
    }
    case 'SliceExpr': {
      const sl = expr as SliceExpr;
      return {
        ...sl,
        object: transformExpr(sl.object),
        lo: sl.lo ? transformExpr(sl.lo) : undefined,
        hi: sl.hi ? transformExpr(sl.hi) : undefined,
      };
    }
    case 'MatrixSlice': {
      const ms = expr as MatrixSlice;
      return {
        ...ms,
        object: transformExpr(ms.object),
        rowIdx: ms.rowIdx ? transformExpr(ms.rowIdx) : undefined,
        colIdx: ms.colIdx ? transformExpr(ms.colIdx) : undefined,
      };
    }
    case 'MemberExpr': {
      const m = expr as MemberExpr;
      return { ...m, object: transformExpr(m.object) };
    }
    case 'FracExpr': {
      const fr = expr as FracExpr;
      return { ...fr, num: transformExpr(fr.num), den: transformExpr(fr.den) };
    }
    case 'SqrtExpr': {
      const sq = expr as SqrtExpr;
      return {
        ...sq,
        radicand: transformExpr(sq.radicand),
        degree: sq.degree ? transformExpr(sq.degree) : undefined,
      };
    }
    case 'AbsExpr':
    case 'NormExpr':
    case 'FloorExpr':
    case 'CeilExpr':
    case 'PmExpr': {
      const u = expr as AbsExpr;
      return { ...u, operand: transformExpr(u.operand) };
    }
    case 'CasesExpr': {
      const c = expr as CasesExpr;
      return {
        ...c,
        cases: c.cases.map(cs => ({
          value: transformExpr(cs.value),
          cond: transformExpr(cs.cond),
        })),
        else_: c.else_ ? transformExpr(c.else_) : undefined,
      };
    }
    case 'SumExpr': {
      const s = expr as SumExpr;
      return {
        ...s,
        lo: s.lo ? transformExpr(s.lo) : undefined,
        hi: s.hi ? transformExpr(s.hi) : undefined,
        body: transformExpr(s.body),
      };
    }
    case 'PostfixExpr': {
      const p = expr as PostfixExpr;
      return { ...p, operand: transformExpr(p.operand) };
    }
    case 'ChainCmpExpr': {
      const ch = expr as ChainCmpExpr;
      return { ...ch, parts: ch.parts.map(transformExpr) };
    }
    case 'ArrayLit': return { ...expr, elements: expr.elements.map(transformExpr) };
    case 'MatrixLit': return {
      ...expr,
      rows: expr.rows.map(r => ({ ...r, elements: r.elements.map(transformExpr) })),
    };
    case 'LimExpr': {
      const l = expr as LimExpr;
      return { ...l, to: transformExpr(l.to), body: transformExpr(l.body) };
    }
    case 'DerivExpr': {
      const d = expr as DerivExpr;
      return { ...d, body: transformExpr(d.body) };
    }
    case 'IntegralExpr': {
      const i = expr as IntegralExpr;
      return { ...i, lo: transformExpr(i.lo), hi: transformExpr(i.hi), body: transformExpr(i.body) };
    }
    case 'SolveExpr': {
      const s = expr as SolveExpr;
      return { ...s, lo: transformExpr(s.lo), hi: transformExpr(s.hi), body: transformExpr(s.body) };
    }
    case 'StringLitExpr': return expr;
    case 'TableExpr': {
      const t = expr as TableExpr;
      return {
        ...t,
        pairs: t.pairs.map(p => ({ key: transformExpr(p.key), value: transformExpr(p.value) })),
      };
    }
    default: return expr;
  }
}

// ── Pattern rules ─────────────────────────────────────────────────────────────

function applyPatterns(expr: Expr): Expr {
  // e^x → exp(x)
  if (
    expr.kind === 'BinaryExpr' &&
    expr.op === '^' &&
    expr.left.kind === 'IdentExpr' &&
    expr.left.name === 'e'
  ) {
    return { kind: 'FuncCallExpr', name: 'exp', args: [expr.right], span: expr.span };
  }

  // x^(-1) → 1/x  — skip for now, basic case
  // x^(1/2) → sqrt(x) — skip, keep as pow

  // \frac{a}{b} → already BinaryExpr(/, a, b) style via genFrac; keep as FracExpr

  // log{base}{x} form — parser now emits FuncCallExpr('__log_base', [x, base])
  // → transformed in codegen

  return expr;
}

import type {
  File, TopLevelNode, ConstDef, FuncDef,
  Stmt, AssignStmt, IfNode, ForStmt, WhileStmt, ExprStmt,
  WhereBlock, WhereLine, Param,
  Expr, BinaryExpr, UnaryExpr, FuncCallExpr, IfExpr,
  IndexExpr, SliceExpr, MatrixSlice, MemberExpr,
  FracExpr, SqrtExpr, AbsExpr, NormExpr, FloorExpr, CeilExpr,
  PmExpr, CasesExpr, SumExpr, PostfixExpr, ChainCmpExpr,
  LimExpr, DerivExpr, IntegralExpr, SolveExpr,
} from '../ast/nodes.js';
import { constantFold, type WarnFn } from './const-fold.js';

export type { WarnFn };

// ── Public entry point ────────────────────────────────────────────────────────

export function transformFile(file: File, warn?: WarnFn): File {
  return { ...file, body: file.body.map(n => transformTopLevel(n, warn)) };
}

// ── Top-level ─────────────────────────────────────────────────────────────────

function transformTopLevel(node: TopLevelNode, warn?: WarnFn): TopLevelNode {
  switch (node.kind) {
    case 'ConstDef':
      return { ...node, value: transformExpr(node.value, warn) };
    case 'FuncDef':
      return {
        ...node,
        body: node.body.map(s => transformStmt(s, warn)),
        where: node.where ? transformWhere(node.where, warn) : undefined,
      };
    case 'ImportDef': return node;
  }
}

// ── Where block ───────────────────────────────────────────────────────────────

function transformWhere(w: WhereBlock, warn?: WarnFn): WhereBlock {
  return {
    ...w,
    lines: w.lines.map((line): WhereLine => {
      if (line.kind === 'WhereDef') {
        return { ...line, value: transformExpr(line.value, warn) };
      }
      return { ...line, expr: transformExpr(line.expr, warn) };
    }),
  };
}

// ── Statements ────────────────────────────────────────────────────────────────

function transformStmt(stmt: Stmt, warn?: WarnFn): Stmt {
  switch (stmt.kind) {
    case 'AssignStmt':
      return { ...stmt, value: transformExpr(stmt.value, warn) };
    case 'ExprStmt':
      return { ...stmt, expr: transformExpr(stmt.expr, warn) };
    case 'IfNode':
      return {
        ...stmt,
        cond: transformExpr(stmt.cond, warn),
        then: Array.isArray(stmt.then) ? stmt.then.map(s => transformStmt(s, warn)) : transformExpr(stmt.then as Expr, warn),
        else_: stmt.else_
          ? Array.isArray(stmt.else_)
            ? (stmt.else_ as Stmt[]).map(s => transformStmt(s, warn))
            : stmt.else_.kind === 'IfNode'
              ? transformStmt(stmt.else_ as Stmt, warn)
              : transformExpr(stmt.else_ as Expr, warn)
          : undefined,
      } as IfNode;
    case 'ForStmt':
      return {
        ...stmt,
        lo: transformExpr(stmt.lo, warn),
        hi: transformExpr(stmt.hi, warn),
        step: stmt.step ? transformExpr(stmt.step, warn) : undefined,
        body: stmt.body.map(s => transformStmt(s, warn)),
      };
    case 'WhileStmt':
      return {
        ...stmt,
        cond: transformExpr(stmt.cond, warn),
        body: stmt.body.map(s => transformStmt(s, warn)),
      };
  }
}

// ── Expressions ───────────────────────────────────────────────────────────────

function transformExpr(expr: Expr, warn?: WarnFn): Expr {
  // First recurse, then apply pattern rules, then constant-fold
  const e = recurseExpr(expr, warn);
  const p = applyPatterns(e);
  return constantFold(p, warn);
}

function recurseExpr(expr: Expr, warn?: WarnFn): Expr {
  switch (expr.kind) {
    case 'NumberLit':
    case 'IdentExpr':
      return expr;
    case 'BinaryExpr': {
      const b = expr as BinaryExpr;
      return { ...b, left: transformExpr(b.left, warn), right: transformExpr(b.right, warn) };
    }
    case 'UnaryExpr': {
      const u = expr as UnaryExpr;
      return { ...u, operand: transformExpr(u.operand, warn) };
    }
    case 'FuncCallExpr': {
      const f = expr as FuncCallExpr;
      return { ...f, args: f.args.map(a => transformExpr(a, warn)) };
    }
    case 'QualifiedCallExpr': {
      const q = expr as import('../ast/nodes.js').QualifiedCallExpr;
      return { ...q, args: q.args.map(a => transformExpr(a, warn)) };
    }
    case 'IfExpr': {
      const i = expr as IfExpr;
      return { ...i, cond: transformExpr(i.cond, warn), then: transformExpr(i.then, warn), else_: transformExpr(i.else_, warn) };
    }
    case 'IndexExpr': {
      const ix = expr as IndexExpr;
      return { ...ix, object: transformExpr(ix.object, warn), index: transformExpr(ix.index, warn) };
    }
    case 'SliceExpr': {
      const sl = expr as SliceExpr;
      return {
        ...sl,
        object: transformExpr(sl.object, warn),
        lo: sl.lo ? transformExpr(sl.lo, warn) : undefined,
        hi: sl.hi ? transformExpr(sl.hi, warn) : undefined,
      };
    }
    case 'MatrixSlice': {
      const ms = expr as MatrixSlice;
      return {
        ...ms,
        object: transformExpr(ms.object, warn),
        rowIdx: ms.rowIdx ? transformExpr(ms.rowIdx, warn) : undefined,
        colIdx: ms.colIdx ? transformExpr(ms.colIdx, warn) : undefined,
      };
    }
    case 'MemberExpr': {
      const m = expr as MemberExpr;
      return { ...m, object: transformExpr(m.object, warn) };
    }
    case 'FracExpr': {
      const fr = expr as FracExpr;
      return { ...fr, num: transformExpr(fr.num, warn), den: transformExpr(fr.den, warn) };
    }
    case 'SqrtExpr': {
      const sq = expr as SqrtExpr;
      return {
        ...sq,
        radicand: transformExpr(sq.radicand, warn),
        degree: sq.degree ? transformExpr(sq.degree, warn) : undefined,
      };
    }
    case 'AbsExpr':
    case 'NormExpr':
    case 'FloorExpr':
    case 'CeilExpr':
    case 'PmExpr': {
      const u = expr as AbsExpr;
      return { ...u, operand: transformExpr(u.operand, warn) };
    }
    case 'CasesExpr': {
      const c = expr as CasesExpr;
      return {
        ...c,
        cases: c.cases.map(cs => ({
          value: transformExpr(cs.value, warn),
          cond: transformExpr(cs.cond, warn),
        })),
        else_: c.else_ ? transformExpr(c.else_, warn) : undefined,
      };
    }
    case 'SumExpr': {
      const s = expr as SumExpr;
      return {
        ...s,
        lo: s.lo ? transformExpr(s.lo, warn) : undefined,
        hi: s.hi ? transformExpr(s.hi, warn) : undefined,
        body: transformExpr(s.body, warn),
      };
    }
    case 'PostfixExpr': {
      const p = expr as PostfixExpr;
      return { ...p, operand: transformExpr(p.operand, warn) };
    }
    case 'ChainCmpExpr': {
      const ch = expr as ChainCmpExpr;
      return { ...ch, parts: ch.parts.map(p => transformExpr(p, warn)) };
    }
    case 'ArrayLit': return { ...expr, elements: expr.elements.map(e => transformExpr(e, warn)) };
    case 'MatrixLit': return {
      ...expr,
      rows: expr.rows.map(r => ({ ...r, elements: r.elements.map(e => transformExpr(e, warn)) })),
    };
    case 'LimExpr': {
      const l = expr as LimExpr;
      return { ...l, to: transformExpr(l.to, warn), body: transformExpr(l.body, warn) };
    }
    case 'DerivExpr': {
      const d = expr as DerivExpr;
      return { ...d, body: transformExpr(d.body, warn) };
    }
    case 'IntegralExpr': {
      const i = expr as IntegralExpr;
      return { ...i, lo: transformExpr(i.lo, warn), hi: transformExpr(i.hi, warn), body: transformExpr(i.body, warn) };
    }
    case 'SolveExpr': {
      const s = expr as SolveExpr;
      return { ...s, lo: transformExpr(s.lo, warn), hi: transformExpr(s.hi, warn), body: transformExpr(s.body, warn) };
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

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
    case 'FuncDef': {
      const paramNames = new Set(node.params.map((p: Param) => p.name));
      return {
        ...node,
        body: node.body.map(s => transformStmt(s, warn, paramNames)),
        where: node.where ? transformWhere(node.where, warn, paramNames) : undefined,
      };
    }
    case 'ImportDef': return node;
  }
}

// ── Where block ───────────────────────────────────────────────────────────────

function transformWhere(w: WhereBlock, warn?: WarnFn, localNames?: Set<string>): WhereBlock {
  return {
    ...w,
    lines: w.lines.map((line): WhereLine => {
      if (line.kind === 'WhereDef') {
        return { ...line, value: transformExpr(line.value, warn, localNames) };
      }
      return { ...line, expr: transformExpr(line.expr, warn, localNames) };
    }),
  };
}

// ── Statements ────────────────────────────────────────────────────────────────

function transformStmt(stmt: Stmt, warn?: WarnFn, localNames?: Set<string>): Stmt {
  switch (stmt.kind) {
    case 'AssignStmt':
      return { ...stmt, value: transformExpr(stmt.value, warn, localNames) };
    case 'ExprStmt':
      return { ...stmt, expr: transformExpr(stmt.expr, warn, localNames) };
    case 'IfNode':
      return {
        ...stmt,
        cond: transformExpr(stmt.cond, warn, localNames),
        then: Array.isArray(stmt.then) ? stmt.then.map(s => transformStmt(s, warn, localNames)) : transformExpr(stmt.then as Expr, warn, localNames),
        else_: stmt.else_
          ? Array.isArray(stmt.else_)
            ? (stmt.else_ as Stmt[]).map(s => transformStmt(s, warn, localNames))
            : stmt.else_.kind === 'IfNode'
              ? transformStmt(stmt.else_ as Stmt, warn, localNames)
              : transformExpr(stmt.else_ as Expr, warn, localNames)
          : undefined,
      } as IfNode;
    case 'ForStmt':
      return {
        ...stmt,
        lo: transformExpr(stmt.lo, warn, localNames),
        hi: transformExpr(stmt.hi, warn, localNames),
        step: stmt.step ? transformExpr(stmt.step, warn, localNames) : undefined,
        body: stmt.body.map(s => transformStmt(s, warn, localNames)),
      };
    case 'WhileStmt':
      return {
        ...stmt,
        cond: transformExpr(stmt.cond, warn, localNames),
        body: stmt.body.map(s => transformStmt(s, warn, localNames)),
      };
  }
}

// ── Expressions ───────────────────────────────────────────────────────────────

function transformExpr(expr: Expr, warn?: WarnFn, localNames?: Set<string>): Expr {
  // First recurse, then apply pattern rules, then constant-fold
  const e = recurseExpr(expr, warn, localNames);
  const p = applyPatterns(e, localNames);
  return constantFold(p, warn);
}

function recurseExpr(expr: Expr, warn?: WarnFn, localNames?: Set<string>): Expr {
  switch (expr.kind) {
    case 'NumberLit':
    case 'IdentExpr':
      return expr;
    case 'BinaryExpr': {
      const b = expr as BinaryExpr;
      return { ...b, left: transformExpr(b.left, warn, localNames), right: transformExpr(b.right, warn, localNames) };
    }
    case 'UnaryExpr': {
      const u = expr as UnaryExpr;
      return { ...u, operand: transformExpr(u.operand, warn, localNames) };
    }
    case 'FuncCallExpr': {
      const f = expr as FuncCallExpr;
      return { ...f, args: f.args.map(a => transformExpr(a, warn, localNames)) };
    }
    case 'QualifiedCallExpr': {
      const q = expr as import('../ast/nodes.js').QualifiedCallExpr;
      return { ...q, args: q.args.map(a => transformExpr(a, warn, localNames)) };
    }
    case 'IfExpr': {
      const i = expr as IfExpr;
      return { ...i, cond: transformExpr(i.cond, warn, localNames), then: transformExpr(i.then, warn, localNames), else_: transformExpr(i.else_, warn, localNames) };
    }
    case 'IndexExpr': {
      const ix = expr as IndexExpr;
      return { ...ix, object: transformExpr(ix.object, warn, localNames), index: transformExpr(ix.index, warn, localNames) };
    }
    case 'SliceExpr': {
      const sl = expr as SliceExpr;
      return {
        ...sl,
        object: transformExpr(sl.object, warn, localNames),
        lo: sl.lo ? transformExpr(sl.lo, warn, localNames) : undefined,
        hi: sl.hi ? transformExpr(sl.hi, warn, localNames) : undefined,
      };
    }
    case 'MatrixSlice': {
      const ms = expr as MatrixSlice;
      return {
        ...ms,
        object: transformExpr(ms.object, warn, localNames),
        rowIdx: ms.rowIdx ? transformExpr(ms.rowIdx, warn, localNames) : undefined,
        colIdx: ms.colIdx ? transformExpr(ms.colIdx, warn, localNames) : undefined,
      };
    }
    case 'MemberExpr': {
      const m = expr as MemberExpr;
      return { ...m, object: transformExpr(m.object, warn, localNames) };
    }
    case 'FracExpr': {
      const fr = expr as FracExpr;
      return { ...fr, num: transformExpr(fr.num, warn, localNames), den: transformExpr(fr.den, warn, localNames) };
    }
    case 'SqrtExpr': {
      const sq = expr as SqrtExpr;
      return {
        ...sq,
        radicand: transformExpr(sq.radicand, warn, localNames),
        degree: sq.degree ? transformExpr(sq.degree, warn, localNames) : undefined,
      };
    }
    case 'AbsExpr':
    case 'NormExpr':
    case 'FloorExpr':
    case 'CeilExpr':
    case 'PmExpr': {
      const u = expr as AbsExpr;
      return { ...u, operand: transformExpr(u.operand, warn, localNames) };
    }
    case 'CasesExpr': {
      const c = expr as CasesExpr;
      return {
        ...c,
        cases: c.cases.map(cs => ({
          value: transformExpr(cs.value, warn, localNames),
          cond: transformExpr(cs.cond, warn, localNames),
        })),
        else_: c.else_ ? transformExpr(c.else_, warn, localNames) : undefined,
      };
    }
    case 'SumExpr': {
      const s = expr as SumExpr;
      return {
        ...s,
        lo: s.lo ? transformExpr(s.lo, warn, localNames) : undefined,
        hi: s.hi ? transformExpr(s.hi, warn, localNames) : undefined,
        body: transformExpr(s.body, warn, localNames),
      };
    }
    case 'PostfixExpr': {
      const p = expr as PostfixExpr;
      return { ...p, operand: transformExpr(p.operand, warn, localNames) };
    }
    case 'ChainCmpExpr': {
      const ch = expr as ChainCmpExpr;
      return { ...ch, parts: ch.parts.map(p => transformExpr(p, warn, localNames)) };
    }
    case 'ArrayLit': return { ...expr, elements: expr.elements.map(e => transformExpr(e, warn, localNames)) };
    case 'MatrixLit': return {
      ...expr,
      rows: expr.rows.map(r => ({ ...r, elements: r.elements.map(e => transformExpr(e, warn, localNames)) })),
    };
    case 'LimExpr': {
      const l = expr as LimExpr;
      return { ...l, to: transformExpr(l.to, warn, localNames), body: transformExpr(l.body, warn, localNames) };
    }
    case 'DerivExpr': {
      const d = expr as DerivExpr;
      return { ...d, body: transformExpr(d.body, warn, localNames) };
    }
    case 'IntegralExpr': {
      const i = expr as IntegralExpr;
      return { ...i, lo: transformExpr(i.lo, warn, localNames), hi: transformExpr(i.hi, warn, localNames), body: transformExpr(i.body, warn, localNames) };
    }
    case 'SolveExpr': {
      const s = expr as SolveExpr;
      return { ...s, lo: transformExpr(s.lo, warn, localNames), hi: transformExpr(s.hi, warn, localNames), body: transformExpr(s.body, warn, localNames) };
    }
    default: return expr;
  }
}

// ── Pattern rules ─────────────────────────────────────────────────────────────

function applyPatterns(expr: Expr, localNames?: Set<string>): Expr {
  // e^x → exp(x), but only when 'e' is the Euler constant (not a local parameter)
  if (
    expr.kind === 'BinaryExpr' &&
    expr.op === '^' &&
    expr.left.kind === 'IdentExpr' &&
    expr.left.name === 'e' &&
    !localNames?.has('e')
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

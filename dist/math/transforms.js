import { constantFold } from './const-fold.js';
// ── Public entry point ────────────────────────────────────────────────────────
export function transformFile(file) {
    return { ...file, body: file.body.map(transformTopLevel) };
}
// ── Top-level ─────────────────────────────────────────────────────────────────
function transformTopLevel(node) {
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
function transformWhere(w) {
    return {
        ...w,
        lines: w.lines.map((line) => {
            if (line.kind === 'WhereDef') {
                return { ...line, value: transformExpr(line.value) };
            }
            return { ...line, expr: transformExpr(line.expr) };
        }),
    };
}
// ── Statements ────────────────────────────────────────────────────────────────
function transformStmt(stmt) {
    switch (stmt.kind) {
        case 'AssignStmt':
            return { ...stmt, value: transformExpr(stmt.value) };
        case 'ExprStmt':
            return { ...stmt, expr: transformExpr(stmt.expr) };
        case 'IfNode':
            return {
                ...stmt,
                cond: transformExpr(stmt.cond),
                then: Array.isArray(stmt.then) ? stmt.then.map(transformStmt) : transformExpr(stmt.then),
                else_: stmt.else_
                    ? Array.isArray(stmt.else_)
                        ? stmt.else_.map(transformStmt)
                        : stmt.else_.kind === 'IfNode'
                            ? transformStmt(stmt.else_)
                            : transformExpr(stmt.else_)
                    : undefined,
            };
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
function transformExpr(expr) {
    // First recurse, then apply pattern rules, then constant-fold
    const e = recurseExpr(expr);
    const p = applyPatterns(e);
    return constantFold(p);
}
function recurseExpr(expr) {
    switch (expr.kind) {
        case 'NumberLit':
        case 'BoolLit':
        case 'IdentExpr':
            return expr;
        case 'BinaryExpr': {
            const b = expr;
            return { ...b, left: transformExpr(b.left), right: transformExpr(b.right) };
        }
        case 'UnaryExpr': {
            const u = expr;
            return { ...u, operand: transformExpr(u.operand) };
        }
        case 'FuncCallExpr': {
            const f = expr;
            return { ...f, args: f.args.map(transformExpr) };
        }
        case 'QualifiedCallExpr': {
            const q = expr;
            return { ...q, args: q.args.map(transformExpr) };
        }
        case 'IfExpr': {
            const i = expr;
            return { ...i, cond: transformExpr(i.cond), then: transformExpr(i.then), else_: transformExpr(i.else_) };
        }
        case 'IndexExpr': {
            const ix = expr;
            return { ...ix, object: transformExpr(ix.object), index: transformExpr(ix.index) };
        }
        case 'SliceExpr': {
            const sl = expr;
            return {
                ...sl,
                object: transformExpr(sl.object),
                lo: sl.lo ? transformExpr(sl.lo) : undefined,
                hi: sl.hi ? transformExpr(sl.hi) : undefined,
            };
        }
        case 'MatrixSlice': {
            const ms = expr;
            return {
                ...ms,
                object: transformExpr(ms.object),
                rowIdx: ms.rowIdx ? transformExpr(ms.rowIdx) : undefined,
                colIdx: ms.colIdx ? transformExpr(ms.colIdx) : undefined,
            };
        }
        case 'MemberExpr': {
            const m = expr;
            return { ...m, object: transformExpr(m.object) };
        }
        case 'FracExpr': {
            const fr = expr;
            return { ...fr, num: transformExpr(fr.num), den: transformExpr(fr.den) };
        }
        case 'SqrtExpr': {
            const sq = expr;
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
            const u = expr;
            return { ...u, operand: transformExpr(u.operand) };
        }
        case 'CasesExpr': {
            const c = expr;
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
            const s = expr;
            return {
                ...s,
                lo: s.lo ? transformExpr(s.lo) : undefined,
                hi: s.hi ? transformExpr(s.hi) : undefined,
                body: transformExpr(s.body),
            };
        }
        case 'PostfixExpr': {
            const p = expr;
            return { ...p, operand: transformExpr(p.operand) };
        }
        case 'ChainCmpExpr': {
            const ch = expr;
            return { ...ch, parts: ch.parts.map(transformExpr) };
        }
        case 'ArrayLit': return { ...expr, elements: expr.elements.map(transformExpr) };
        case 'MatrixLit': return {
            ...expr,
            rows: expr.rows.map(r => ({ ...r, elements: r.elements.map(transformExpr) })),
        };
        case 'LimExpr': {
            const l = expr;
            return { ...l, to: transformExpr(l.to), body: transformExpr(l.body) };
        }
        case 'DerivExpr': {
            const d = expr;
            return { ...d, body: transformExpr(d.body) };
        }
        case 'IntegralExpr': {
            const i = expr;
            return { ...i, lo: transformExpr(i.lo), hi: transformExpr(i.hi), body: transformExpr(i.body) };
        }
        case 'SolveExpr': {
            const s = expr;
            return { ...s, lo: transformExpr(s.lo), hi: transformExpr(s.hi), body: transformExpr(s.body) };
        }
        case 'StringLitExpr': return expr;
        case 'TableExpr': {
            const t = expr;
            return {
                ...t,
                pairs: t.pairs.map(p => ({ key: transformExpr(p.key), value: transformExpr(p.value) })),
            };
        }
        default: return expr;
    }
}
// ── Pattern rules ─────────────────────────────────────────────────────────────
function applyPatterns(expr) {
    // e^x → exp(x)
    if (expr.kind === 'BinaryExpr' &&
        expr.op === '^' &&
        expr.left.kind === 'IdentExpr' &&
        expr.left.name === 'e') {
        return { kind: 'FuncCallExpr', name: 'exp', args: [expr.right], span: expr.span };
    }
    // x^(-1) → 1/x  — skip for now, basic case
    // x^(1/2) → sqrt(x) — skip, keep as pow
    // \frac{a}{b} → already BinaryExpr(/, a, b) style via genFrac; keep as FracExpr
    // log{base}{x} form — parser now emits FuncCallExpr('__log_base', [x, base])
    // → transformed in codegen
    return expr;
}
//# sourceMappingURL=transforms.js.map
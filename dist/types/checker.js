// Known builtin functions (no arity check — variadic or well-known)
const BUILTINS = new Set([
    'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
    'asin', 'acos', 'atan', 'atan2', 'acot',
    'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
    'sqrt', 'cbrt', 'exp', 'log', 'log2', 'log10',
    'abs', 'fabs', 'floor', 'ceil', 'round', 'trunc',
    'min', 'max', 'fmin', 'fmax', 'hypot',
    'pow', 'sign', 'sgn', 'erf', 'erfc',
    'sum', 'product', 'mean', 'std', 'norm',
    'dot', 'cross', 'transpose', 'det', 'inv',
    'I', 'zeros', 'ones',
    'is_nan', 'is_inf', 'is_finite',
    'mod', 'gcd', 'lcm',
]);
export function typeCheck(file) {
    const errors = [];
    // First pass: collect all function signatures (enables mutual recursion check)
    const funcSigs = new Map();
    for (const node of file.body) {
        if (node.kind === 'FuncDef') {
            funcSigs.set(node.name, { paramCount: node.params.length });
        }
    }
    // Second pass: check each function body
    for (const node of file.body) {
        if (node.kind === 'FuncDef') {
            checkFunc(node, funcSigs, errors);
        }
    }
    return errors;
}
function checkFunc(node, funcSigs, errors) {
    const paramNames = new Set(node.params.map(p => p.name));
    // Check body statements
    checkStmts(node.body, paramNames, funcSigs, errors);
    // Check where block
    if (node.where) {
        checkWhereBlock(node.where, paramNames, funcSigs, errors);
    }
}
function checkStmts(stmts, params, funcSigs, errors) {
    for (const stmt of stmts) {
        checkStmt(stmt, params, funcSigs, errors);
    }
}
function checkStmt(stmt, params, funcSigs, errors) {
    switch (stmt.kind) {
        case 'AssignStmt':
            checkAssign(stmt, params, funcSigs, errors);
            break;
        case 'ExprStmt':
            checkExpr(stmt.expr, params, funcSigs, errors);
            break;
        case 'IfNode':
            checkIfNode(stmt, params, funcSigs, errors);
            break;
        case 'ForStmt':
            checkForStmt(stmt, params, funcSigs, errors);
            break;
        case 'WhileStmt':
            checkWhileStmt(stmt, params, funcSigs, errors);
            break;
    }
}
function checkAssign(stmt, params, funcSigs, errors) {
    if (params.has(stmt.name)) {
        errors.push({
            message: `Cannot assign to parameter '${stmt.name}': function parameters are immutable`,
            span: stmt.span,
        });
    }
    checkExpr(stmt.value, params, funcSigs, errors);
}
function checkIfNode(node, params, funcSigs, errors) {
    checkExpr(node.cond, params, funcSigs, errors);
    if (Array.isArray(node.then)) {
        checkStmts(node.then, params, funcSigs, errors);
    }
    else {
        checkExpr(node.then, params, funcSigs, errors);
    }
    if (node.else_ !== undefined) {
        if (Array.isArray(node.else_)) {
            checkStmts(node.else_, params, funcSigs, errors);
        }
        else if (typeof node.else_ === 'object' && 'kind' in node.else_) {
            const el = node.else_;
            if (el.kind === 'IfNode') {
                checkIfNode(el, params, funcSigs, errors);
            }
            else {
                checkExpr(el, params, funcSigs, errors);
            }
        }
    }
}
function checkForStmt(stmt, params, funcSigs, errors) {
    checkExpr(stmt.lo, params, funcSigs, errors);
    checkExpr(stmt.hi, params, funcSigs, errors);
    if (stmt.step)
        checkExpr(stmt.step, params, funcSigs, errors);
    checkStmts(stmt.body, params, funcSigs, errors);
}
function checkWhileStmt(stmt, params, funcSigs, errors) {
    checkExpr(stmt.cond, params, funcSigs, errors);
    checkStmts(stmt.body, params, funcSigs, errors);
}
function checkWhereBlock(where, params, funcSigs, errors) {
    for (const line of where.lines) {
        if (line.kind === 'WhereDef') {
            checkExpr(line.value, params, funcSigs, errors);
        }
        else {
            checkExpr(line.expr, params, funcSigs, errors);
        }
    }
}
function checkExpr(expr, params, funcSigs, errors) {
    switch (expr.kind) {
        case 'FuncCallExpr':
            checkFuncCall(expr, params, funcSigs, errors);
            break;
        case 'QualifiedCallExpr':
            for (const arg of expr.args) {
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
            if (expr.lo)
                checkExpr(expr.lo, params, funcSigs, errors);
            if (expr.hi)
                checkExpr(expr.hi, params, funcSigs, errors);
            break;
        case 'MemberExpr':
            checkExpr(expr.object, params, funcSigs, errors);
            break;
        case 'ArrayLit':
            for (const el of expr.elements)
                checkExpr(el, params, funcSigs, errors);
            break;
        case 'MatrixLit':
            for (const row of expr.rows)
                for (const el of row)
                    checkExpr(el, params, funcSigs, errors);
            break;
        case 'FracExpr':
            checkExpr(expr.num, params, funcSigs, errors);
            checkExpr(expr.den, params, funcSigs, errors);
            break;
        case 'SqrtExpr':
            checkExpr(expr.radicand, params, funcSigs, errors);
            if (expr.index)
                checkExpr(expr.index, params, funcSigs, errors);
            break;
        case 'AbsExpr':
        case 'NormExpr':
        case 'FloorExpr':
        case 'CeilExpr':
        case 'PmExpr':
        case 'PostfixExpr':
            checkExpr(expr.expr, params, funcSigs, errors);
            break;
        case 'CasesExpr':
            for (const c of expr.cases) {
                checkExpr(c.value, params, funcSigs, errors);
                checkExpr(c.cond, params, funcSigs, errors);
            }
            if (expr.otherwise)
                checkExpr(expr.otherwise, params, funcSigs, errors);
            break;
        case 'SumExpr':
            checkExpr(expr.body, params, funcSigs, errors);
            if (expr.lo)
                checkExpr(expr.lo, params, funcSigs, errors);
            if (expr.hi)
                checkExpr(expr.hi, params, funcSigs, errors);
            break;
        case 'ChainCmpExpr':
            for (const operand of expr.operands)
                checkExpr(operand, params, funcSigs, errors);
            break;
        case 'LimExpr':
            checkExpr(expr.body, params, funcSigs, errors);
            if (expr.to)
                checkExpr(expr.to, params, funcSigs, errors);
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
        case 'TableExpr':
            for (const pair of expr.pairs) {
                checkExpr(pair.key, params, funcSigs, errors);
                checkExpr(pair.value, params, funcSigs, errors);
            }
            break;
        // Leaf nodes: no sub-expressions to check
        case 'NumberLit':
        case 'BoolLit':
        case 'IdentExpr':
        case 'StringLitExpr':
            break;
    }
}
function checkFuncCall(expr, params, funcSigs, errors) {
    // Check each argument
    for (const arg of expr.args) {
        checkExpr(arg, params, funcSigs, errors);
    }
    const name = expr.name;
    // Skip builtins
    if (BUILTINS.has(name))
        return;
    const sig = funcSigs.get(name);
    if (sig === undefined) {
        errors.push({
            message: `Call to undefined function '${name}'`,
            span: expr.span,
        });
        return;
    }
    if (expr.args.length !== sig.paramCount) {
        errors.push({
            message: `'${name}' expects ${sig.paramCount} argument(s), got ${expr.args.length}`,
            span: expr.span,
        });
    }
}
//# sourceMappingURL=checker.js.map
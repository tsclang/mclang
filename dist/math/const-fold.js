export function constantFold(expr) {
    switch (expr.kind) {
        case 'NumberLit':
        case 'BoolLit':
        case 'IdentExpr':
            return expr;
        case 'UnaryExpr': {
            const u = expr;
            const operand = constantFold(u.operand);
            if (u.op === '-' && operand.kind === 'NumberLit') {
                return { kind: 'NumberLit', value: -operand.value, span: u.span };
            }
            return { ...u, operand };
        }
        case 'BinaryExpr': {
            const b = expr;
            const left = constantFold(b.left);
            const right = constantFold(b.right);
            if (left.kind === 'NumberLit' && right.kind === 'NumberLit') {
                const l = left.value;
                const r = right.value;
                let result;
                switch (b.op) {
                    case '+':
                        result = l + r;
                        break;
                    case '-':
                        result = l - r;
                        break;
                    case '*':
                        result = l * r;
                        break;
                    case '/':
                        result = r !== 0 ? l / r : undefined;
                        break;
                    case '^':
                        result = Math.pow(l, r);
                        break;
                }
                if (result !== undefined && isFinite(result)) {
                    return { kind: 'NumberLit', value: result, span: b.span };
                }
            }
            // x + 0 → x, x - 0 → x
            if (right.kind === 'NumberLit' && right.value === 0 && (b.op === '+' || b.op === '-')) {
                return left;
            }
            // x * 1 → x, x / 1 → x
            if (right.kind === 'NumberLit' && right.value === 1 && (b.op === '*' || b.op === '/')) {
                return left;
            }
            // 0 + x → x, 1 * x → x
            if (left.kind === 'NumberLit' && left.value === 0 && b.op === '+')
                return right;
            if (left.kind === 'NumberLit' && left.value === 1 && b.op === '*')
                return right;
            // x * 0 → 0, 0 * x → 0
            if ((right.kind === 'NumberLit' && right.value === 0 && b.op === '*') ||
                (left.kind === 'NumberLit' && left.value === 0 && b.op === '*')) {
                return { kind: 'NumberLit', value: 0, span: b.span };
            }
            return { ...b, left, right };
        }
        case 'FracExpr': {
            const num = constantFold(expr.num);
            const den = constantFold(expr.den);
            if (num.kind === 'NumberLit' && den.kind === 'NumberLit' && den.value !== 0) {
                return { kind: 'NumberLit', value: num.value / den.value, span: expr.span };
            }
            return { ...expr, num, den };
        }
        default:
            return expr;
    }
}
//# sourceMappingURL=const-fold.js.map
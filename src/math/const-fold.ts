import type { Expr, BinaryExpr, UnaryExpr, FuncCallExpr, SqrtExpr } from '../ast/nodes.js';
import type { Span } from '../types/index.js';
import { ErrorCode } from '../diagnostics/codes.js';

export type WarnFn = (code: ErrorCode, message: string, span: Span) => void;

export function constantFold(expr: Expr, warn?: WarnFn): Expr {
  switch (expr.kind) {
    case 'NumberLit':
    case 'IdentExpr':
      return expr;

    case 'UnaryExpr': {
      const u = expr as UnaryExpr;
      const operand = constantFold(u.operand, warn);
      if (u.op === '-' && operand.kind === 'NumberLit') {
        return { kind: 'NumberLit', value: -operand.value, raw: String(-operand.value), span: u.span };
      }
      return { ...u, operand };
    }

    case 'BinaryExpr': {
      const b = expr as BinaryExpr;
      const left = constantFold(b.left, warn);
      const right = constantFold(b.right, warn);
      if (left.kind === 'NumberLit' && right.kind === 'NumberLit') {
        const l = left.value;
        const r = right.value;
        let result: number | undefined;
        switch (b.op) {
          case '+': result = l + r; break;
          case '-': result = l - r; break;
          case '*': result = l * r; break;
          case '/':
            if (r === 0) {
              warn?.(ErrorCode.DivisionByZero, 'Division by zero in constant expression', b.span);
            }
            result = r !== 0 ? l / r : undefined;
            break;
          case '^': result = Math.pow(l, r); break;
        }
        if (result !== undefined && isFinite(result)) {
          return { kind: 'NumberLit', value: result, raw: String(result), span: b.span };
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
      if (left.kind === 'NumberLit' && left.value === 0 && b.op === '+') return right;
      if (left.kind === 'NumberLit' && left.value === 1 && b.op === '*') return right;
      // x * 0 → 0, 0 * x → 0
      if (
        (right.kind === 'NumberLit' && right.value === 0 && b.op === '*') ||
        (left.kind === 'NumberLit' && left.value === 0 && b.op === '*')
      ) {
        return { kind: 'NumberLit', value: 0, raw: '0', span: b.span };
      }
      return { ...b, left, right };
    }

    case 'FracExpr': {
      const num = constantFold(expr.num, warn);
      const den = constantFold(expr.den, warn);
      if (num.kind === 'NumberLit' && den.kind === 'NumberLit') {
        if (den.value === 0) {
          warn?.(ErrorCode.DivisionByZero, 'Division by zero in constant expression', expr.span);
        } else {
          return { kind: 'NumberLit', value: num.value / den.value, raw: String(num.value / den.value), span: expr.span };
        }
      }
      return { ...expr, num, den };
    }

    case 'SqrtExpr': {
      const sq = expr as SqrtExpr;
      const radicand = constantFold(sq.radicand, warn);
      if (radicand.kind === 'NumberLit' && radicand.value < 0) {
        warn?.(ErrorCode.SqrtOfNegative, `sqrt of negative constant (${radicand.value}) produces NaN`, sq.span);
      }
      const degree = sq.degree ? constantFold(sq.degree, warn) : undefined;
      return { ...sq, radicand, degree };
    }

    case 'FuncCallExpr': {
      const fc = expr as FuncCallExpr;
      const args = fc.args.map(a => constantFold(a, warn));
      if (fc.name === 'sqrt' && args.length === 1 && args[0]!.kind === 'NumberLit' && args[0]!.value < 0) {
        warn?.(ErrorCode.SqrtOfNegative, `sqrt of negative constant (${(args[0] as import('../ast/nodes.js').NumberLit).value}) produces NaN`, fc.span);
      }
      return { ...fc, args };
    }

    default:
      return expr;
  }
}

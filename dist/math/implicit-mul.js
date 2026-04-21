import { token } from '../lexer/token.js';
// Tokens that end a value expression
const VALUE_END = new Set([
    "Number" /* TokenKind.Number */,
    "Identifier" /* TokenKind.Identifier */,
    ")" /* TokenKind.RParen */,
    "]" /* TokenKind.RBracket */,
    "FACTORIAL" /* TokenKind.Factorial */,
    "DEGREE" /* TokenKind.Degree */,
    "nan" /* TokenKind.KwNaN */,
    "inf" /* TokenKind.KwInf */,
    "true" /* TokenKind.KwTrue */,
    "false" /* TokenKind.KwFalse */,
    "\\sigma_id" /* TokenKind.SigmaId */,
    "\\Gamma_id" /* TokenKind.GammaId */,
]);
// LaTeX/special tokens that start an implicit-multipliable expression
const IMPLICIT_START = new Set([
    "Number" /* TokenKind.Number */,
    "\\frac" /* TokenKind.Frac */,
    "\\sqrt" /* TokenKind.Sqrt */,
    "\\sigma" /* TokenKind.Sigma */,
    "\\Gamma" /* TokenKind.Gamma */,
    "\\bar" /* TokenKind.Bar */,
    "\\sum" /* TokenKind.Sum */,
    "\\prod" /* TokenKind.Prod */,
    "\\sin" /* TokenKind.Sin */, "\\cos" /* TokenKind.Cos */, "\\tan" /* TokenKind.Tan */,
    "\\cot" /* TokenKind.Cot */, "\\sec" /* TokenKind.Sec */, "\\csc" /* TokenKind.Csc */,
    "\\arcsin" /* TokenKind.Arcsin */, "\\arccos" /* TokenKind.Arccos */, "\\arctan" /* TokenKind.Arctan */,
    "\\sinh" /* TokenKind.Sinh */, "\\cosh" /* TokenKind.Cosh */, "\\tanh" /* TokenKind.Tanh */,
    "\\log" /* TokenKind.Log */, "\\lg" /* TokenKind.Lg */, "\\ln" /* TokenKind.Ln */,
    "\\binom" /* TokenKind.Binom */, "\\gcd" /* TokenKind.Gcd */, "\\lcm" /* TokenKind.Lcm */,
    "|" /* TokenKind.AbsOpen */,
    "\u2016" /* TokenKind.NormOpen */,
    "\u230A" /* TokenKind.FloorOpen */,
    "\u2308" /* TokenKind.CeilOpen */,
    "\\pm" /* TokenKind.Pm */,
    "\u00B1" /* TokenKind.PlusMinus */,
]);
function shouldInsert(prev, curr) {
    // prev must end a value
    if (!VALUE_END.has(prev.kind))
        return false;
    // LParen: insert only when prev is NOT an identifier (function calls: f( stay as-is)
    if (curr.kind === "(" /* TokenKind.LParen */) {
        return prev.kind !== "Identifier" /* TokenKind.Identifier */;
    }
    // Identifier (not a keyword — keywords have their own token kinds):
    // insert after Number, Identifier, ), ]
    if (curr.kind === "Identifier" /* TokenKind.Identifier */)
        return true;
    if (IMPLICIT_START.has(curr.kind))
        return true;
    return false;
}
export function insertImplicitMul(tokens) {
    const result = [];
    for (const curr of tokens) {
        // Find last non-structural token in result, but do NOT cross Newline boundaries
        let prev;
        for (let i = result.length - 1; i >= 0; i--) {
            const k = result[i].kind;
            if (k === "NEWLINE" /* TokenKind.Newline */)
                break; // statement boundary — stop
            if (k !== "INDENT" /* TokenKind.Indent */ && k !== "DEDENT" /* TokenKind.Dedent */) {
                prev = result[i];
                break;
            }
        }
        if (prev && shouldInsert(prev, curr)) {
            result.push(token("*" /* TokenKind.Star */, '*', curr.span));
        }
        result.push(curr);
    }
    return result;
}
//# sourceMappingURL=implicit-mul.js.map
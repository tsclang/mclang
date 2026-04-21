import type { Span } from '../types/index.js';
export declare const enum TokenKind {
    Number = "Number",
    Identifier = "Identifier",
    KwFn = "fn",
    KwConst = "const",
    KwIf = "if",
    KwElse = "else",
    KwFor = "for",
    KwIn = "in",
    KwWhile = "while",
    KwWhere = "where",
    KwReturn = "return",
    KwNum = "num",
    KwInt = "int",
    KwBool = "bool",
    KwTrue = "true",
    KwFalse = "false",
    KwSolve = "solve",
    KwNaN = "nan",
    KwInf = "inf",
    KwAnd = "and",
    KwOr = "or",
    KwNot = "not",
    KwXor = "xor",
    KwStep = "step",
    KwMod = "mod",
    KwImport = "import",
    KwFrom = "from",
    KwAs = "as",
    KwTable = "table",
    KwSetN = "SET_N",
    KwSetZ = "SET_Z",
    KwSetR = "SET_R",
    KwSetQ = "SET_Q",
    KwSetC = "SET_C",
    StringLit = "string_lit",
    Plus = "+",
    Minus = "-",
    Star = "*",
    Slash = "/",
    Percent = "%",
    Caret = "^",// exponent (also x^n)
    StarStar = "**",// exponent alternative
    DotStar = ".*",// element-wise multiply
    Dot = "\u22C5",// multiply / dot product / matrix multiply
    Divide = "\u00F7",// division alias
    Cross = "\u2A2F",// cross product (vectors)
    PlusMinus = "\u00B1",// multiple return \pm
    Eq = "==",
    Neq = "!=",
    Neq2 = "\u2260",// \neq
    Lt = "<",
    Gt = ">",
    Leq = "<=",
    Leq2 = "\u2264",// \leq
    Geq = ">=",
    Geq2 = "\u2265",// \geq
    And = "&&",
    Or = "||",
    Not = "!",// unary
    BangIn = "!in",// range exclusion: x !in [a, b]
    Assign = "=",
    ColonEq = ":=",
    LParen = "(",
    RParen = ")",
    LBracket = "[",
    RBracket = "]",
    LBrace = "{",
    RBrace = "}",
    Comma = ",",
    Colon = ":",
    Semicolon = ";",
    Dot2 = "..",// range a..b
    Arrow = "->",
    Backslash = "\\",
    Period = ".",// member access (v.length)
    AbsOpen = "|",// context-sensitive: open abs
    AbsClose = "|",// context-sensitive: close abs
    NormOpen = "\u2016",// \lVert
    NormClose = "\u2016",// \rVert
    FloorOpen = "\u230A",// \lfloor
    FloorClose = "\u230B",// \rfloor
    CeilOpen = "\u2308",// \lceil
    CeilClose = "\u2309",// \rceil
    Factorial = "FACTORIAL",// !
    Degree = "DEGREE",// °
    Frac = "\\frac",
    Sqrt = "\\sqrt",
    Sum = "\\sum",
    Prod = "\\prod",
    Int = "\\int",
    Lim = "\\lim",
    Begin = "\\begin",
    End = "\\end",
    Binom = "\\binom",
    Gcd = "\\gcd",
    Lcm = "\\lcm",
    Log = "\\log",
    Lg = "\\lg",
    Ln = "\\ln",
    Sin = "\\sin",
    Cos = "\\cos",
    Tan = "\\tan",
    Cot = "\\cot",
    Sec = "\\sec",
    Csc = "\\csc",
    Arcsin = "\\arcsin",
    Arccos = "\\arccos",
    Arctan = "\\arctan",
    Sinh = "\\sinh",
    Cosh = "\\cosh",
    Tanh = "\\tanh",
    Inf2 = "\\infty",
    To = "\\to",
    In2 = "\\in",
    NotIn = "\\notin",
    Cdot = "\\cdot",
    Times = "\\times",
    Pm = "\\pm",
    Sigma = "\\sigma",// std (if followed by {)
    SigmaId = "\\sigma_id",// identifier (if not followed by {)
    Gamma = "\\Gamma",// tgamma (if followed by {)
    GammaId = "\\Gamma_id",// identifier (if not followed by {)
    Bar = "\\bar",// mean
    Indent = "INDENT",
    Dedent = "DEDENT",
    Newline = "NEWLINE",
    EOF = "EOF"
}
export declare const ABS_PIPE: "|";
export type Token = {
    kind: TokenKind;
    value: string;
    span: Span;
};
export declare function token(kind: TokenKind, value: string, span: Span): Token;
export declare const KEYWORDS: ReadonlyMap<string, TokenKind>;
export declare const LATEX_COMMANDS: ReadonlyMap<string, TokenKind>;
export declare const LATEX_UNICODE: ReadonlyMap<string, string>;
export declare const TRIG_SYNONYMS: ReadonlyMap<string, string>;
//# sourceMappingURL=token.d.ts.map
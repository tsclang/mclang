import type { Span } from '../types/index.js';

export const enum TokenKind {
  // Literals
  Number = 'Number',
  Identifier = 'Identifier',

  // Keywords
  KwFn = 'fn',
  KwConst = 'const',
  KwIf = 'if',
  KwElse = 'else',
  KwFor = 'for',
  KwIn = 'in',
  KwWhile = 'while',
  KwWhere = 'where',
  KwReturn = 'return',
  KwNum = 'num',
  KwInt = 'int',
  KwBool = 'bool',
  KwTrue = 'true',
  KwFalse = 'false',
  KwSolve = 'solve',
  KwNaN = 'nan',
  KwInf = 'inf',
  KwAnd = 'and',
  KwOr = 'or',
  KwNot = 'not',
  KwXor = 'xor',
  KwStep = 'step',
  KwMod = 'mod',
  KwImport = 'import',
  KwFrom = 'from',
  KwAs = 'as',
  KwTable = 'table',
  KwOtherwise = 'otherwise',

  // Mathematical sets: ℕ ℤ ℝ ℚ ℂ  /  \mathbb{N} etc.
  KwSetN = 'SET_N',
  KwSetZ = 'SET_Z',
  KwSetR = 'SET_R',
  KwSetQ = 'SET_Q',
  KwSetC = 'SET_C',

  StringLit = 'string_lit',

  // Arithmetic operators
  Plus = '+',
  Minus = '-',
  Star = '*',
  Slash = '/',
  Percent = '%',
  Caret = '^',      // exponent (also x^n)
  StarStar = '**',  // exponent alternative
  DotStar = '.*',  // element-wise multiply

  // Math operators (Unicode)
  Dot = '⋅',        // multiply / dot product / matrix multiply
  Divide = '÷',     // division alias
  Cross = '⨯',      // cross product (vectors)
  PlusMinus = '±',  // multiple return \pm

  // Comparison
  Eq = '==',
  Neq = '!=',
  Neq2 = '≠',       // \neq
  Lt = '<',
  Gt = '>',
  Leq = '<=',
  Leq2 = '≤',       // \leq
  Geq = '>=',
  Geq2 = '≥',       // \geq

  // Logical
  And = '&&',
  Or = '||',
  Not = '!',        // unary
  BangIn = '!in',   // range exclusion: x !in [a, b]
  Ampersand = '&',  // single & — cases separator in \begin{cases}

  // Assignment
  Assign = '=',
  ColonEq = ':=',

  // Delimiters
  LParen = '(',
  RParen = ')',
  LBracket = '[',
  RBracket = ']',
  LBrace = '{',
  RBrace = '}',
  Comma = ',',
  Colon = ':',
  Semicolon = ';',
  Dot2 = '..',      // range a..b
  Arrow = '->',
  Backslash = '\\',

  // Punctuation
  Period = '.',     // member access (v.length)

  // Math delimiters (Unicode, after LaTeX translation)
  AbsOpen = '|',    // context-sensitive: open abs
  AbsClose = '|',   // context-sensitive: close abs
  NormOpen = '‖',   // \lVert
  NormClose = '‖',  // \rVert
  FloorOpen = '⌊',  // \lfloor
  FloorClose = '⌋', // \rfloor
  CeilOpen = '⌈',   // \lceil
  CeilClose = '⌉',  // \rceil

  // Special postfix
  Factorial = 'FACTORIAL', // !
  Degree = 'DEGREE',       // °

  // LaTeX keywords (parsed as identifiers or special nodes)
  Frac = '\\frac',
  Sqrt = '\\sqrt',
  Sum = '\\sum',
  Prod = '\\prod',
  Int = '\\int',
  Lim = '\\lim',
  Begin = '\\begin',
  End = '\\end',
  Binom = '\\binom',
  Gcd = '\\gcd',
  Lcm = '\\lcm',
  Log = '\\log',
  Lg = '\\lg',
  Ln = '\\ln',
  Sin = '\\sin',
  Cos = '\\cos',
  Tan = '\\tan',
  Cot = '\\cot',
  Sec = '\\sec',
  Csc = '\\csc',
  Arcsin = '\\arcsin',
  Arccos = '\\arccos',
  Arctan = '\\arctan',
  Sinh = '\\sinh',
  Cosh = '\\cosh',
  Tanh = '\\tanh',
  Inf2 = '\\infty',
  To = '\\to',
  In2 = '\\in',
  NotIn = '\\notin',
  Cdot = '\\cdot',
  Times = '\\times',
  Pm = '\\pm',
  Sigma = '\\sigma',     // std (if followed by {)
  SigmaId = '\\sigma_id',// identifier (if not followed by {)
  Gamma = '\\Gamma',     // tgamma (if followed by {)
  GammaId = '\\Gamma_id',// identifier (if not followed by {)
  Bar = '\\bar',         // mean
  Abs2 = '\\abs',        // \abs{x} → AbsExpr
  LatexMod = '\\mod',    // a \mod b → fmod(a,b)
  LatexMin = '\\min',    // \min(a,b) or \min_{x \in v}
  LatexMax = '\\max',    // \max(a,b) or \max_{x \in v}
  CasesRowSep = 'CASES_ROW_SEP',  // \\ row separator inside \begin{cases}

  // Indentation
  Indent = 'INDENT',
  Dedent = 'DEDENT',
  Newline = 'NEWLINE',

  // Meta
  EOF = 'EOF',
}

// For disambiguation: `|` is either AbsOpen or AbsClose depending on context
export const ABS_PIPE = '|' as const;

export type Token = {
  kind: TokenKind;
  value: string;
  span: Span;
};

export function token(kind: TokenKind, value: string, span: Span): Token {
  return { kind, value, span };
}

// Keywords map: identifier text → token kind
export const KEYWORDS: ReadonlyMap<string, TokenKind> = new Map([
  ['fn',      TokenKind.KwFn],
  ['const',   TokenKind.KwConst],
  ['if',      TokenKind.KwIf],
  ['else',    TokenKind.KwElse],
  ['for',     TokenKind.KwFor],
  ['in',      TokenKind.KwIn],
  ['while',   TokenKind.KwWhile],
  ['where',   TokenKind.KwWhere],
  ['return',  TokenKind.KwReturn],
  ['num',     TokenKind.KwNum],
  ['int',     TokenKind.KwInt],
  ['bool',    TokenKind.KwBool],
  ['true',    TokenKind.KwTrue],
  ['false',   TokenKind.KwFalse],
  ['solve',   TokenKind.KwSolve],
  ['nan',     TokenKind.KwNaN],
  ['inf',     TokenKind.KwInf],
  ['and',     TokenKind.KwAnd],
  ['or',      TokenKind.KwOr],
  ['not',     TokenKind.KwNot],
  ['xor',     TokenKind.KwXor],
  ['step',    TokenKind.KwStep],
  ['mod',     TokenKind.KwMod],
  ['import',  TokenKind.KwImport],
  ['from',    TokenKind.KwFrom],
  ['as',      TokenKind.KwAs],
  ['table',     TokenKind.KwTable],
  ['otherwise', TokenKind.KwOtherwise],
]);

// LaTeX commands → token kind
export const LATEX_COMMANDS: ReadonlyMap<string, TokenKind> = new Map([
  ['\\frac',   TokenKind.Frac],
  ['\\sqrt',   TokenKind.Sqrt],
  ['\\sum',    TokenKind.Sum],
  ['\\prod',   TokenKind.Prod],
  ['\\int',    TokenKind.Int],
  ['\\lim',    TokenKind.Lim],
  ['\\begin',  TokenKind.Begin],
  ['\\end',    TokenKind.End],
  ['\\binom',  TokenKind.Binom],
  ['\\gcd',    TokenKind.Gcd],
  ['\\lcm',    TokenKind.Lcm],
  ['\\log',    TokenKind.Log],
  ['\\lg',     TokenKind.Lg],
  ['\\ln',     TokenKind.Ln],
  ['\\sin',    TokenKind.Sin],
  ['\\cos',    TokenKind.Cos],
  ['\\tan',    TokenKind.Tan],
  ['\\cot',    TokenKind.Cot],
  ['\\sec',    TokenKind.Sec],
  ['\\csc',    TokenKind.Csc],
  ['\\arcsin', TokenKind.Arcsin],
  ['\\arccos', TokenKind.Arccos],
  ['\\arctan', TokenKind.Arctan],
  ['\\sinh',   TokenKind.Sinh],
  ['\\cosh',   TokenKind.Cosh],
  ['\\tanh',   TokenKind.Tanh],
  ['\\infty',  TokenKind.Inf2],
  ['\\to',     TokenKind.To],
  ['\\in',     TokenKind.In2],
  ['\\notin',  TokenKind.NotIn],
  ['\\cdot',   TokenKind.Cdot],
  ['\\times',  TokenKind.Times],
  ['\\pm',     TokenKind.Pm],
  ['\\bar',    TokenKind.Bar],
  ['\\abs',    TokenKind.Abs2],
  ['\\mod',    TokenKind.LatexMod],
  ['\\min',    TokenKind.LatexMin],
  ['\\max',    TokenKind.LatexMax],
  // \sigma and \Gamma handled via lookahead in lexer
]);

// LaTeX → Unicode translation (single-char tokens)
export const LATEX_UNICODE: ReadonlyMap<string, string> = new Map([
  ['\\lfloor', '⌊'],
  ['\\rfloor', '⌋'],
  ['\\lceil',  '⌈'],
  ['\\rceil',  '⌉'],
  ['\\lVert',  '‖'],
  ['\\rVert',  '‖'],
  ['\\neq',    '≠'],
  ['\\ne',     '≠'],
  ['\\leq',    '≤'],
  ['\\geq',    '≥'],
  ['\\cdot',   '⋅'],
  ['\\times',  '⨯'],
  ['\\pm',     '±'],
  ['\\infty',  '∞'],
]);

// Trig function synonyms → canonical name
export const TRIG_SYNONYMS: ReadonlyMap<string, string> = new Map([
  ['tg',    'tan'],
  ['ctg',   'cot'],
  ['tg',    'tan'],
  ['sh',    'sinh'],
  ['ch',    'cosh'],
  ['th',    'tanh'],
  ['arctg', 'atan'],
  ['arcctg','acot'],
  ['arcsh', 'asinh'],
  ['arcch', 'acosh'],
  ['arcth', 'atanh'],
]);

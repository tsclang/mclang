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

  // Arithmetic operators
  Plus = '+',
  Minus = '-',
  Star = '*',
  Slash = '/',
  Percent = '%',
  Caret = '^',      // exponent (also x^n)
  StarStar = '**',  // exponent alternative

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

import type { Span } from '../types/index.js';

// ── Types ─────────────────────────────────────────────────────────────────────

export type McType =
  | { kind: 'NumType'; dims: number; staticSize?: number } // num, num[], num[][], num[N]
  | { kind: 'IntType' }
  | { kind: 'BoolType' };

// ── Top-level ─────────────────────────────────────────────────────────────────

export type File = {
  kind: 'File';
  body: TopLevelNode[];
  span: Span;
};

export type TopLevelNode = ConstDef | FuncDef | ImportDef;

export type ConstDef = {
  kind: 'ConstDef';
  name: string;
  value: Expr;
  span: Span;
};

export type FuncDef = {
  kind: 'FuncDef';
  name: string;
  params: Param[];
  body: Stmt[];
  where?: WhereBlock;
  span: Span;
};

export type ImportDef = {
  kind: 'ImportDef';
  path: string;
  alias?: string;   // import "./f.mc" as alias
  names?: string[]; // from "./f.mc" import a, b, c
  span: Span;
};

export type Param = {
  name: string;
  type?: McType;
  default?: Expr;
  span: Span;
};

// ── Statements ────────────────────────────────────────────────────────────────

export type Stmt = AssignStmt | IfNode | ForStmt | WhileStmt | ExprStmt;

export type AssignStmt = {
  kind: 'AssignStmt';
  name: string;
  value: Expr;
  span: Span;
};

export type IfNode = {
  kind: 'IfNode';
  cond: Expr;
  then: Expr | Stmt[];
  else_?: Expr | Stmt[] | IfNode;
  span: Span;
};

export type ForStmt = {
  kind: 'ForStmt';
  var: string;
  lo: Expr;
  hi: Expr;
  step?: Expr;
  body: Stmt[];
  span: Span;
};

export type WhileStmt = {
  kind: 'WhileStmt';
  cond: Expr;
  body: Stmt[];
  span: Span;
};

export type ExprStmt = {
  kind: 'ExprStmt';
  expr: Expr;
  span: Span;
};

// ── Where block ───────────────────────────────────────────────────────────────

export type WhereBlock = {
  kind: 'WhereBlock';
  lines: WhereLine[];
  span: Span;
};

export type WhereLine =
  | { kind: 'WhereDef'; name: string; value: Expr; span: Span }
  | { kind: 'WhereGuard'; expr: Expr; span: Span };

// ── Expressions ───────────────────────────────────────────────────────────────

export type Expr =
  | NumberLit
  | BoolLit
  | IdentExpr
  | BinaryExpr
  | UnaryExpr
  | FuncCallExpr
  | QualifiedCallExpr
  | IfExpr
  | IndexExpr
  | SliceExpr
  | MemberExpr
  | ArrayLit
  | MatrixLit
  | FracExpr
  | SqrtExpr
  | AbsExpr
  | NormExpr
  | FloorExpr
  | CeilExpr
  | PmExpr
  | CasesExpr
  | SumExpr
  | PostfixExpr
  | ChainCmpExpr
  | LimExpr
  | DerivExpr
  | IntegralExpr
  | SolveExpr
  | TableExpr
  | StringLitExpr;

export type NumberLit = { kind: 'NumberLit'; value: number; raw: string; span: Span };
export type BoolLit   = { kind: 'BoolLit';   value: boolean; span: Span };
export type IdentExpr = { kind: 'IdentExpr'; name: string;   span: Span };

export type BinOp =
  | '+' | '-' | '*' | '/' | '%' | '^' | '**'
  | '⋅' | '÷' | '⨯' | '.*'
  | '==' | '!=' | '<' | '>' | '<=' | '>=' | '≠' | '≤' | '≥'
  | '&&' | '||' | 'xor' | '∈' | '∉';

export type BinaryExpr = {
  kind: 'BinaryExpr';
  op: BinOp;
  left: Expr;
  right: Expr;
  span: Span;
};

export type UnaryExpr = {
  kind: 'UnaryExpr';
  op: '-' | '!' | 'not';
  operand: Expr;
  span: Span;
};

export type FuncCallExpr = {
  kind: 'FuncCallExpr';
  name: string;
  args: Expr[];
  span: Span;
};

export type QualifiedCallExpr = {
  kind: 'QualifiedCallExpr';
  ns: string;    // alias namespace
  name: string;  // function name
  args: Expr[];
  span: Span;
};

export type IfExpr = {
  kind: 'IfExpr';
  cond: Expr;
  then: Expr;
  else_: Expr;
  span: Span;
};

export type IndexExpr = {
  kind: 'IndexExpr';
  object: Expr;
  index: Expr;
  span: Span;
};

export type SliceExpr = {
  kind: 'SliceExpr';
  object: Expr;
  lo?: Expr;
  hi?: Expr;
  span: Span;
};

export type MemberExpr = {
  kind: 'MemberExpr';
  object: Expr;
  member: string;
  span: Span;
};

export type ArrayLit = {
  kind: 'ArrayLit';
  elements: Expr[];
  span: Span;
};

export type MatrixLit = {
  kind: 'MatrixLit';
  rows: ArrayLit[];
  span: Span;
};

export type FracExpr = {
  kind: 'FracExpr';
  num: Expr;
  den: Expr;
  span: Span;
};

export type SqrtExpr = {
  kind: 'SqrtExpr';
  degree?: Expr;
  radicand: Expr;
  span: Span;
};

export type AbsExpr   = { kind: 'AbsExpr';   operand: Expr; span: Span };
export type NormExpr  = { kind: 'NormExpr';  operand: Expr; span: Span };
export type FloorExpr = { kind: 'FloorExpr'; operand: Expr; span: Span };
export type CeilExpr  = { kind: 'CeilExpr';  operand: Expr; span: Span };
export type PmExpr    = { kind: 'PmExpr';    operand: Expr; span: Span };

export type CasesExpr = {
  kind: 'CasesExpr';
  cases: Array<{ value: Expr; cond: Expr }>;
  else_?: Expr;
  span: Span;
};

export type SumExpr = {
  kind: 'SumExpr';
  op: 'sum' | 'prod' | 'min' | 'max';
  iterKind: 'range' | 'array';
  var: string;
  lo?: Expr;
  hi?: Expr;
  array?: string;
  body: Expr;
  span: Span;
};

export type PostfixExpr = {
  kind: 'PostfixExpr';
  op: '!' | '°';
  operand: Expr;
  span: Span;
};

export type ChainCmpExpr = {
  kind: 'ChainCmpExpr';
  parts: Expr[];
  ops: BinOp[];
  span: Span;
};

export type LimExpr = {
  kind: 'LimExpr';
  var: string;
  to: Expr;
  toInf: boolean;
  body: Expr;
  span: Span;
};

export type DerivExpr = {
  kind: 'DerivExpr';
  var: string;
  body: Expr;
  span: Span;
};

export type IntegralExpr = {
  kind: 'IntegralExpr';
  var: string;
  lo: Expr;
  hi: Expr;
  body: Expr;
  span: Span;
};

export type SolveExpr = {
  kind: 'SolveExpr';
  var: string;
  lo: Expr;
  hi: Expr;
  body: Expr;
  span: Span;
};

export type StringLitExpr = {
  kind: 'StringLitExpr';
  value: string;
  span: Span;
};

export type TableExpr = {
  kind: 'TableExpr';
  pairs: Array<{ key: Expr; value: Expr }>;
  span: Span;
};

// Error and warning code registry.
// Format: E = error, W = warning
// Ranges:
//   E000–E009  Lexer
//   E010–E019  Parser
//   E020–E029  Imports / modules
//   E030–E049  Semantics / type checker
//   E050–E059  Code generator
//   W001–W009  Warnings

export const enum ErrorCode {
  // ── Lexer ───────────────────────────────────────────────────────────────
  UnknownCharacter       = 'E000',
  UnknownLatexCommand    = 'E001',
  BadScientificNotation  = 'E002',
  InconsistentIndent     = 'E003',

  // ── Parser ──────────────────────────────────────────────────────────────
  UnclosedParen          = 'E010',
  UnclosedBracket        = 'E011',
  UnclosedBrace          = 'E012',
  UnexpectedToken        = 'E013',
  ValueFirstIf           = 'E014',
  ExplicitReturn         = 'E015',
  BreakOrContinue        = 'E016',
  MissingOperand         = 'E017',

  // ── Imports / modules ───────────────────────────────────────────────────
  CircularImport         = 'E020',
  FileNotFound           = 'E021',
  NameConflict           = 'E022',
  UnknownImportedName    = 'E023',

  // ── Semantics / type checker ─────────────────────────────────────────────
  ImmutableParameter     = 'E030',
  ImmutableConstant      = 'E031',
  UninitializedVariable  = 'E032',
  CircularWhereDep       = 'E033',
  MatrixDotLength        = 'E034',
  UnitMismatch           = 'E035',
  ArraySizeMismatch      = 'E036',
  RecursionNotSupported  = 'E037',
  UndefinedIdentifier    = 'E038',
  TypeMismatch           = 'E039',

  // ── Code generator ───────────────────────────────────────────────────────
  UnsupportedTarget      = 'E050',

  // ── Warnings ─────────────────────────────────────────────────────────────
  DivisionByZero         = 'W001',
  SqrtOfNegative         = 'W002',
  UnusedVariable         = 'W003',
  UnreachableCode        = 'W004',
}

export type ErrorCodeString = `E${string}` | `W${string}`;

/** Human-readable description for each code (shown in `--explain <code>`) */
export const ERROR_DESCRIPTIONS: Readonly<Record<ErrorCode, string>> = {
  [ErrorCode.UnknownCharacter]:
    'The source file contains a character the lexer cannot recognise.',
  [ErrorCode.UnknownLatexCommand]:
    'A LaTeX command (starting with \\) was not found in the supported table.',
  [ErrorCode.BadScientificNotation]:
    'Scientific notation requires a digit after the exponent sign (e.g. 1e-9).',
  [ErrorCode.InconsistentIndent]:
    'An indented block does not align with any surrounding block level.',

  [ErrorCode.UnclosedParen]:
    'An opening parenthesis was never matched with a closing one.',
  [ErrorCode.UnclosedBracket]:
    'An opening bracket [ was never matched with ].',
  [ErrorCode.UnclosedBrace]:
    'An opening brace { was never matched with }.',
  [ErrorCode.UnexpectedToken]:
    'The parser encountered a token it did not expect at this position.',
  [ErrorCode.ValueFirstIf]:
    'mclang only supports if-first syntax: `if (cond) value else other`.',
  [ErrorCode.ExplicitReturn]:
    '`return` is not a keyword in mclang. The last expression is returned implicitly.',
  [ErrorCode.BreakOrContinue]:
    '`break` and `continue` are not supported. Use a while condition instead.',
  [ErrorCode.MissingOperand]:
    'An operator was found but the expected operand is missing.',

  [ErrorCode.CircularImport]:
    'Two or more files import each other, creating a dependency cycle.',
  [ErrorCode.FileNotFound]:
    'The imported file path does not exist relative to the current file.',
  [ErrorCode.NameConflict]:
    'The same name is exported by two different imported modules.',
  [ErrorCode.UnknownImportedName]:
    'A `from ... import name` references a name that does not exist in the module.',

  [ErrorCode.ImmutableParameter]:
    'Function parameters are immutable and cannot be reassigned.',
  [ErrorCode.ImmutableConstant]:
    'Global constants and built-in constants cannot be reassigned.',
  [ErrorCode.UninitializedVariable]:
    'A variable was used before it was assigned a value.',
  [ErrorCode.CircularWhereDep]:
    'Definitions in a where block form a cycle and cannot be sorted.',
  [ErrorCode.MatrixDotLength]:
    'Matrices do not have a `.length` property. Use `.rows` or `.cols`.',
  [ErrorCode.UnitMismatch]:
    'Two values with incompatible physical units were combined.',
  [ErrorCode.ArraySizeMismatch]:
    'An operation requires arrays of equal length, but sizes differ.',
  [ErrorCode.RecursionNotSupported]:
    'Recursive function calls are not supported in mclang MVP.',
  [ErrorCode.UndefinedIdentifier]:
    'An identifier was used that has no matching definition in scope.',
  [ErrorCode.TypeMismatch]:
    'The types of two operands or a function argument are incompatible.',

  [ErrorCode.UnsupportedTarget]:
    'The requested --target is not yet implemented.',

  [ErrorCode.DivisionByZero]:
    'A compile-time constant expression divides by zero. Result will be inf or nan.',
  [ErrorCode.SqrtOfNegative]:
    'sqrt() of a negative constant produces nan at runtime.',
  [ErrorCode.UnusedVariable]:
    'A local variable was declared but never used.',
  [ErrorCode.UnreachableCode]:
    'Code after an unconditional return expression can never execute.',
};

// Error and warning code registry.
// Format: E = error, W = warning
// Ranges:
//   E000–E009  Lexer
//   E010–E019  Parser
//   E020–E029  Imports / modules
//   E030–E049  Semantics / type checker
//   E050–E059  Code generator
//   W001–W009  Warnings
/** Human-readable description for each code (shown in `--explain <code>`) */
export const ERROR_DESCRIPTIONS = {
    ["E000" /* ErrorCode.UnknownCharacter */]: 'The source file contains a character the lexer cannot recognise.',
    ["E001" /* ErrorCode.UnknownLatexCommand */]: 'A LaTeX command (starting with \\) was not found in the supported table.',
    ["E002" /* ErrorCode.BadScientificNotation */]: 'Scientific notation requires a digit after the exponent sign (e.g. 1e-9).',
    ["E003" /* ErrorCode.InconsistentIndent */]: 'An indented block does not align with any surrounding block level.',
    ["E010" /* ErrorCode.UnclosedParen */]: 'An opening parenthesis was never matched with a closing one.',
    ["E011" /* ErrorCode.UnclosedBracket */]: 'An opening bracket [ was never matched with ].',
    ["E012" /* ErrorCode.UnclosedBrace */]: 'An opening brace { was never matched with }.',
    ["E013" /* ErrorCode.UnexpectedToken */]: 'The parser encountered a token it did not expect at this position.',
    ["E014" /* ErrorCode.ValueFirstIf */]: 'mclang only supports if-first syntax: `if (cond) value else other`.',
    ["E015" /* ErrorCode.ExplicitReturn */]: '`return` is not a keyword in mclang. The last expression is returned implicitly.',
    ["E016" /* ErrorCode.BreakOrContinue */]: '`break` and `continue` are not supported. Use a while condition instead.',
    ["E017" /* ErrorCode.MissingOperand */]: 'An operator was found but the expected operand is missing.',
    ["E020" /* ErrorCode.CircularImport */]: 'Two or more files import each other, creating a dependency cycle.',
    ["E021" /* ErrorCode.FileNotFound */]: 'The imported file path does not exist relative to the current file.',
    ["E022" /* ErrorCode.NameConflict */]: 'The same name is exported by two different imported modules.',
    ["E023" /* ErrorCode.UnknownImportedName */]: 'A `from ... import name` references a name that does not exist in the module.',
    ["E030" /* ErrorCode.ImmutableParameter */]: 'Function parameters are immutable and cannot be reassigned.',
    ["E031" /* ErrorCode.ImmutableConstant */]: 'Global constants and built-in constants cannot be reassigned.',
    ["E032" /* ErrorCode.UninitializedVariable */]: 'A variable was used before it was assigned a value.',
    ["E033" /* ErrorCode.CircularWhereDep */]: 'Definitions in a where block form a cycle and cannot be sorted.',
    ["E034" /* ErrorCode.MatrixDotLength */]: 'Matrices do not have a `.length` property. Use `.rows` or `.cols`.',
    ["E035" /* ErrorCode.UnitMismatch */]: 'Two values with incompatible physical units were combined.',
    ["E036" /* ErrorCode.ArraySizeMismatch */]: 'An operation requires arrays of equal length, but sizes differ.',
    ["E037" /* ErrorCode.RecursionNotSupported */]: 'Recursive function calls are not supported in mclang MVP.',
    ["E038" /* ErrorCode.UndefinedIdentifier */]: 'An identifier was used that has no matching definition in scope.',
    ["E039" /* ErrorCode.TypeMismatch */]: 'The types of two operands or a function argument are incompatible.',
    ["E050" /* ErrorCode.UnsupportedTarget */]: 'The requested --target is not yet implemented.',
    ["W001" /* ErrorCode.DivisionByZero */]: 'A compile-time constant expression divides by zero. Result will be inf or nan.',
    ["W002" /* ErrorCode.SqrtOfNegative */]: 'sqrt() of a negative constant produces nan at runtime.',
    ["W003" /* ErrorCode.UnusedVariable */]: 'A local variable was declared but never used.',
    ["W004" /* ErrorCode.UnreachableCode */]: 'Code after an unconditional return expression can never execute.',
    ["W005" /* ErrorCode.PrecisionLoss */]: 'Assigning a f64 value to a f32 context may lose precision.',
};
//# sourceMappingURL=codes.js.map
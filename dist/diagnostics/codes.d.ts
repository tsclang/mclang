export declare const enum ErrorCode {
    UnknownCharacter = "E000",
    UnknownLatexCommand = "E001",
    BadScientificNotation = "E002",
    InconsistentIndent = "E003",
    UnclosedParen = "E010",
    UnclosedBracket = "E011",
    UnclosedBrace = "E012",
    UnexpectedToken = "E013",
    ValueFirstIf = "E014",
    ExplicitReturn = "E015",
    BreakOrContinue = "E016",
    MissingOperand = "E017",
    CircularImport = "E020",
    FileNotFound = "E021",
    NameConflict = "E022",
    UnknownImportedName = "E023",
    ImmutableParameter = "E030",
    ImmutableConstant = "E031",
    UninitializedVariable = "E032",
    CircularWhereDep = "E033",
    MatrixDotLength = "E034",
    UnitMismatch = "E035",
    ArraySizeMismatch = "E036",
    RecursionNotSupported = "E037",
    UndefinedIdentifier = "E038",
    TypeMismatch = "E039",
    UnsupportedTarget = "E050",
    DivisionByZero = "W001",
    SqrtOfNegative = "W002",
    UnusedVariable = "W003",
    UnreachableCode = "W004",
    PrecisionLoss = "W005"
}
export type ErrorCodeString = `E${string}` | `W${string}`;
/** Human-readable description for each code (shown in `--explain <code>`) */
export declare const ERROR_DESCRIPTIONS: Readonly<Record<ErrorCode, string>>;
//# sourceMappingURL=codes.d.ts.map
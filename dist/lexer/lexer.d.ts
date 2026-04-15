import { type Token } from './token.js';
export declare class Lexer {
    private readonly source;
    private readonly file;
    private pos;
    private line;
    private col;
    private readonly tokens;
    private readonly indentStack;
    private lastTokenKind;
    private atLineStart;
    constructor(source: string, file?: string);
    tokenize(): Token[];
    private scanToken;
    private handleIndentation;
    private handleNewline;
    private skipLineComment;
    private scanNumber;
    private scanLatex;
    private scanIdentifier;
    private scanPipe;
    private scanSingleChar;
    private scanUnicode;
    private unicodeToKind;
    private current;
    private peek;
    private advance;
    private capturePos;
    private emitToken;
    private pushToken;
    private pushTokenAt;
    private isDigit;
    private isIdentStart;
    private isIdentPart;
    private errorAt;
    private emitTokenAt;
}
//# sourceMappingURL=lexer.d.ts.map
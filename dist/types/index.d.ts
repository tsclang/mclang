export type Position = {
    line: number;
    col: number;
    offset: number;
};
export type Span = {
    start: Position;
    end: Position;
    file: string;
};
export declare function span(start: Position, end: Position, file: string): Span;
//# sourceMappingURL=index.d.ts.map
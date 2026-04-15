// Shared type definitions for the mclang compiler

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

export function span(start: Position, end: Position, file: string): Span {
  return { start, end, file };
}

import type { Span } from './index.js';
import type { File } from '../ast/nodes.js';
export type TypeError = {
    message: string;
    span: Span;
};
export declare function typeCheck(file: File): TypeError[];
//# sourceMappingURL=checker.d.ts.map
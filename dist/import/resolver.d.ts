import type { File } from '../ast/nodes.js';
export type ReadFile = (absPath: string) => string;
export declare class ImportCycleError extends Error {
    constructor(cycle: string[]);
}
export declare class ImportNotFoundError extends Error {
    constructor(path: string, from: string);
}
export declare function resolveImports(entryPath: string, entrySource: string, readFile: ReadFile): File;
//# sourceMappingURL=resolver.d.ts.map
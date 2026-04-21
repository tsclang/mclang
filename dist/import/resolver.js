// Cross-platform path helpers (forward-slash based, works with both POSIX and Windows paths)
function pathDirname(p) {
    const i = p.lastIndexOf('/');
    return i >= 0 ? p.slice(0, i) : '.';
}
function pathResolve(dir, rel) {
    if (rel.startsWith('/'))
        return rel;
    const base = dir.endsWith('/') ? dir : dir + '/';
    const parts = (base + rel).split('/');
    const out = [];
    for (const part of parts) {
        if (part === '..')
            out.pop();
        else if (part !== '.')
            out.push(part);
    }
    return out.join('/');
}
import { Lexer } from '../lexer/lexer.js';
import { parseSource } from '../parser/parser.js';
export class ImportCycleError extends Error {
    constructor(cycle) {
        super(`Import cycle detected: ${cycle.join(' → ')}`);
        this.name = 'ImportCycleError';
    }
}
export class ImportNotFoundError extends Error {
    constructor(path, from) {
        super(`Cannot find import '${path}' from '${from}'`);
        this.name = 'ImportNotFoundError';
    }
}
// ── Main entry ────────────────────────────────────────────────────────────────
export function resolveImports(entryPath, entrySource, readFile) {
    // Cache maps absPath → the own public nodes of that file (not recursively merged)
    const ownNodes = new Map();
    const resolving = new Set();
    // Track which deps have already been included in the final output (dedup)
    const included = new Set();
    function parseFile(absPath, source) {
        const tokens = new Lexer(source, absPath).tokenize();
        return parseSource(tokens);
    }
    function collectNodes(absPath, source) {
        // Cycle detection: if currently resolving this file, it's a cycle
        if (resolving.has(absPath)) {
            throw new ImportCycleError([...resolving, absPath]);
        }
        // Already fully processed — return nothing (dedup)
        if (included.has(absPath))
            return [];
        resolving.add(absPath);
        included.add(absPath);
        const file = parseFile(absPath, source);
        const result = [];
        for (const node of file.body) {
            if (node.kind !== 'ImportDef')
                continue;
            const imp = node;
            const dir = pathDirname(absPath);
            const depPath = pathResolve(dir, imp.path);
            let depSource;
            try {
                depSource = readFile(depPath);
            }
            catch {
                throw new ImportNotFoundError(imp.path, absPath);
            }
            // Recurse — cycle check happens inside, dedup handled by included set
            const alreadyIncluded = included.has(depPath);
            const transitive = collectNodes(depPath, depSource);
            result.push(...transitive);
            // Own public nodes of the dep only if this is the first time we include it
            if (alreadyIncluded)
                continue;
            const own = ownNodes.get(depPath) ?? [];
            for (const depNode of own) {
                if (!isNamedNode(depNode))
                    continue;
                const name = getNodeName(depNode);
                if (name.startsWith('_'))
                    continue;
                if (imp.names !== undefined) {
                    if (!imp.names.includes(name))
                        continue;
                    result.push(depNode);
                }
                else if (imp.alias !== undefined) {
                    result.push(renameNode(depNode, `${imp.alias}__${name}`));
                }
                else {
                    result.push(depNode);
                }
            }
        }
        // Store own non-import nodes for parent to use
        const own = file.body.filter(n => n.kind !== 'ImportDef');
        ownNodes.set(absPath, own);
        resolving.delete(absPath);
        return result;
    }
    const transitive = collectNodes(entryPath, entrySource);
    const entryFile = parseFile(entryPath, entrySource);
    const entryOwn = entryFile.body.filter(n => n.kind !== 'ImportDef');
    return { ...entryFile, body: [...transitive, ...entryOwn] };
}
// ── Helpers ───────────────────────────────────────────────────────────────────
function isNamedNode(node) {
    return node.kind === 'FuncDef' || node.kind === 'ConstDef';
}
function getNodeName(node) {
    return node.name;
}
function renameNode(node, newName) {
    return { ...node, name: newName };
}
//# sourceMappingURL=resolver.js.map
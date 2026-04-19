import { posix as nodePath } from 'path';
import { Lexer } from '../lexer/lexer.js';
import { parseSource } from '../parser/parser.js';
import type { File, TopLevelNode, FuncDef, ConstDef, ImportDef } from '../ast/nodes.js';

export type ReadFile = (absPath: string) => string;

export class ImportCycleError extends Error {
  constructor(cycle: string[]) {
    super(`Import cycle detected: ${cycle.join(' → ')}`);
    this.name = 'ImportCycleError';
  }
}

export class ImportNotFoundError extends Error {
  constructor(path: string, from: string) {
    super(`Cannot find import '${path}' from '${from}'`);
    this.name = 'ImportNotFoundError';
  }
}

// ── Main entry ────────────────────────────────────────────────────────────────

export function resolveImports(
  entryPath: string,
  entrySource: string,
  readFile: ReadFile,
): File {
  // Cache maps absPath → the own public nodes of that file (not recursively merged)
  const ownNodes = new Map<string, TopLevelNode[]>();
  const resolving = new Set<string>();
  // Track which deps have already been included in the final output (dedup)
  const included = new Set<string>();

  function parseFile(absPath: string, source: string): File {
    const tokens = new Lexer(source, absPath).tokenize();
    return parseSource(tokens);
  }

  function collectNodes(absPath: string, source: string): TopLevelNode[] {
    // Cycle detection: if currently resolving this file, it's a cycle
    if (resolving.has(absPath)) {
      throw new ImportCycleError([...resolving, absPath]);
    }

    // Already fully processed — return nothing (dedup)
    if (included.has(absPath)) return [];

    resolving.add(absPath);
    included.add(absPath);

    const file = parseFile(absPath, source);
    const result: TopLevelNode[] = [];

    for (const node of file.body) {
      if (node.kind !== 'ImportDef') continue;

      const imp = node as ImportDef;
      const dir = nodePath.dirname(absPath);
      const depPath = nodePath.resolve(dir, imp.path);

      let depSource: string;
      try {
        depSource = readFile(depPath);
      } catch {
        throw new ImportNotFoundError(imp.path, absPath);
      }

      // Recurse — cycle check happens inside, dedup handled by included set
      const alreadyIncluded = included.has(depPath);
      const transitive = collectNodes(depPath, depSource);
      result.push(...transitive);

      // Own public nodes of the dep only if this is the first time we include it
      if (alreadyIncluded) continue;
      const own = ownNodes.get(depPath) ?? [];
      for (const depNode of own) {
        if (!isNamedNode(depNode)) continue;
        const name = getNodeName(depNode);
        if (name.startsWith('_')) continue;

        if (imp.names !== undefined) {
          if (!imp.names.includes(name)) continue;
          result.push(depNode);
        } else if (imp.alias !== undefined) {
          result.push(renameNode(depNode, `${imp.alias}__${name}`));
        } else {
          result.push(depNode);
        }
      }
    }

    // Store own non-import nodes for parent to use
    const own: TopLevelNode[] = file.body.filter(n => n.kind !== 'ImportDef');
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

function isNamedNode(node: TopLevelNode): node is FuncDef | ConstDef {
  return node.kind === 'FuncDef' || node.kind === 'ConstDef';
}

function getNodeName(node: FuncDef | ConstDef): string {
  return node.name;
}

function renameNode(node: FuncDef | ConstDef, newName: string): FuncDef | ConstDef {
  return { ...node, name: newName } as FuncDef | ConstDef;
}

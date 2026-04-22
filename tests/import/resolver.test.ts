import { describe, it, expect } from 'vitest';
import { resolveImports, ImportCycleError, ImportNotFoundError } from '../../src/import/resolver.js';
import { generateC } from '../../src/codegen/codegen.js';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import type { FuncDef, ConstDef } from '../../src/ast/nodes.js';

function makeFS(files: Record<string, string>) {
  return (p: string) => {
    const content = files[p];
    if (content === undefined) throw new Error(`File not found: ${p}`);
    return content;
  };
}

function resolve(files: Record<string, string>, entry = '/entry.mc') {
  const fs = makeFS(files);
  return resolveImports(entry, files[entry]!, fs);
}

function funcNames(file: ReturnType<typeof resolve>): string[] {
  return file.body
    .filter((n): n is FuncDef => n.kind === 'FuncDef')
    .map(n => n.name);
}

function constNames(file: ReturnType<typeof resolve>): string[] {
  return file.body
    .filter((n): n is ConstDef => n.kind === 'ConstDef')
    .map(n => n.name);
}

// ── Basic import ──────────────────────────────────────────────────────────────

describe('import — basic', () => {
  it('no imports — returns original AST unchanged', () => {
    const file = resolve({ '/entry.mc': 'f(x) = x + 1' });
    expect(funcNames(file)).toEqual(['f']);
  });

  it('import all — all public defs from dep included', () => {
    const file = resolve({
      '/entry.mc': 'import "./lib.mc"\ng(x) = f(x)',
      '/lib.mc': 'f(x) = x * 2',
    });
    expect(funcNames(file)).toContain('f');
    expect(funcNames(file)).toContain('g');
  });

  it('import all — dep defs come before entry defs', () => {
    const file = resolve({
      '/entry.mc': 'import "./lib.mc"\ng(x) = f(x)',
      '/lib.mc': 'f(x) = x * 2',
    });
    const names = funcNames(file);
    expect(names.indexOf('f')).toBeLessThan(names.indexOf('g'));
  });

  it('import all — private defs (_prefix) included for compilation', () => {
    // Private helpers from bare imports must be present in the merged AST so that
    // public functions which call them can compile. Header exclusion is the codegen's job.
    const file = resolve({
      '/entry.mc': 'import "./lib.mc"\ng(x) = x',
      '/lib.mc': '_helper(x) = x\npub(x) = _helper(x)',
    });
    expect(funcNames(file)).toContain('_helper');
    expect(funcNames(file)).toContain('pub');
  });

  it('import all — constants included', () => {
    const file = resolve({
      '/entry.mc': 'import "./consts.mc"\nf(x) = x + G',
      '/consts.mc': 'G = 9.81',
    });
    expect(constNames(file)).toContain('G');
  });

  it('import with string literal path', () => {
    const file = resolve({
      '/entry.mc': 'import "./lib.mc"\ng(x) = f(x)',
      '/lib.mc': 'f(x) = x',
    });
    expect(funcNames(file)).toContain('f');
  });
});

// ── from import ───────────────────────────────────────────────────────────────

describe('from ... import name', () => {
  it('only the named function is included', () => {
    const file = resolve({
      '/entry.mc': 'from "./lib.mc" import f\ng(x) = f(x)',
      '/lib.mc': 'f(x) = x * 2\nh(x) = x + 1',
    });
    expect(funcNames(file)).toContain('f');
    expect(funcNames(file)).not.toContain('h');
  });

  it('multiple names: from "./lib.mc" import a, b', () => {
    const file = resolve({
      '/entry.mc': 'from "./lib.mc" import f, h\ng(x) = f(x)',
      '/lib.mc': 'f(x) = x\nh(x) = x + 1\nignored(x) = x',
    });
    expect(funcNames(file)).toContain('f');
    expect(funcNames(file)).toContain('h');
    expect(funcNames(file)).not.toContain('ignored');
  });

  it('private function not importable even if named', () => {
    const file = resolve({
      '/entry.mc': 'from "./lib.mc" import _secret\ng(x) = x',
      '/lib.mc': '_secret(x) = x\npub(x) = x',
    });
    expect(funcNames(file)).not.toContain('_secret');
  });
});

// ── as alias ──────────────────────────────────────────────────────────────────

describe('import ... as alias', () => {
  it('imported functions renamed with alias__ prefix', () => {
    const file = resolve({
      '/entry.mc': 'import "./lib.mc" as math\ng(x) = math.f(x)',
      '/lib.mc': 'f(x) = x * 2',
    });
    expect(funcNames(file)).toContain('math__f');
    expect(funcNames(file)).not.toContain('f');
  });

  it('two aliased imports — no name collision', () => {
    const file = resolve({
      '/entry.mc': 'import "./a.mc" as aa\nimport "./b.mc" as bb\nmain(x) = aa.f(x) + bb.f(x)',
      '/a.mc': 'f(x) = x * 2',
      '/b.mc': 'f(x) = x + 10',
    });
    expect(funcNames(file)).toContain('aa__f');
    expect(funcNames(file)).toContain('bb__f');
  });

  it('aliased import — original name not in scope', () => {
    const file = resolve({
      '/entry.mc': 'import "./lib.mc" as m\ng(x) = m.f(x)',
      '/lib.mc': 'f(x) = x',
    });
    expect(funcNames(file)).not.toContain('f');
  });
});

// ── Cycle detection ───────────────────────────────────────────────────────────

describe('cycle detection', () => {
  it('direct cycle a → b → a throws ImportCycleError', () => {
    expect(() => resolve({
      '/entry.mc': 'import "./b.mc"\nf(x) = x',
      '/b.mc': 'import "./entry.mc"\ng(x) = x',
    })).toThrow(ImportCycleError);
  });

  it('self-import throws ImportCycleError', () => {
    expect(() => resolve({
      '/entry.mc': 'import "./entry.mc"\nf(x) = x',
    })).toThrow(ImportCycleError);
  });

  it('cycle error message contains the cycle path', () => {
    try {
      resolve({
        '/entry.mc': 'import "./b.mc"\nf(x) = x',
        '/b.mc': 'import "./entry.mc"\ng(x) = x',
      });
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).toMatch(/cycle/i);
    }
  });
});

// ── Cache / diamond dependency ────────────────────────────────────────────────

describe('cache — diamond dependency', () => {
  it('shared dep imported by two files included only once', () => {
    const file = resolve({
      '/entry.mc': 'import "./a.mc"\nimport "./b.mc"\nmain(x) = x',
      '/a.mc': 'import "./shared.mc"\nfa(x) = x',
      '/b.mc': 'import "./shared.mc"\nfb(x) = x',
      '/shared.mc': 'shared(x) = x * 2',
    });
    const names = funcNames(file);
    const sharedCount = names.filter(n => n === 'shared').length;
    expect(sharedCount).toBe(1);
  });
});

// ── Error cases ───────────────────────────────────────────────────────────────

describe('error cases', () => {
  it('missing file throws ImportNotFoundError', () => {
    expect(() => resolve({
      '/entry.mc': 'import "./missing.mc"\nf(x) = x',
    })).toThrow(ImportNotFoundError);
  });

  it('error message contains the missing filename', () => {
    try {
      resolve({ '/entry.mc': 'import "./missing.mc"\nf(x) = x' });
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).toContain('missing.mc');
    }
  });
});

// ── Parser: QualifiedCallExpr ─────────────────────────────────────────────────

describe('parser — QualifiedCallExpr', () => {
  it('alias.func(x) parses as QualifiedCallExpr', () => {
    const tokens = new Lexer('f(x) = math.sin(x)').tokenize();
    const ast = parseSource(tokens);
    const funcDef = ast.body[0] as FuncDef;
    const lastStmt = funcDef.body[funcDef.body.length - 1]!;
    expect(lastStmt.kind).toBe('ExprStmt');
    const expr = (lastStmt as { kind: string; expr: unknown }).expr as { kind: string };
    expect(expr.kind).toBe('QualifiedCallExpr');
  });

  it('QualifiedCallExpr has correct ns and name', () => {
    const tokens = new Lexer('f(x) = math.sin(x)').tokenize();
    const ast = parseSource(tokens);
    const funcDef = ast.body[0] as FuncDef;
    const lastStmt = funcDef.body[funcDef.body.length - 1]!;
    const expr = (lastStmt as { kind: string; expr: unknown }).expr as { kind: string; ns: string; name: string };
    expect(expr.ns).toBe('math');
    expect(expr.name).toBe('sin');
  });

  it('v.length remains MemberExpr (not QualifiedCallExpr)', () => {
    const tokens = new Lexer('f(v: num[]) = v.length').tokenize();
    const ast = parseSource(tokens);
    const funcDef = ast.body[0] as FuncDef;
    const lastStmt = funcDef.body[funcDef.body.length - 1]!;
    const expr = (lastStmt as { kind: string; expr: unknown }).expr as { kind: string };
    expect(expr.kind).toBe('MemberExpr');
  });
});

// ── Codegen with resolved import ──────────────────────────────────────────────

describe('codegen — resolved import', () => {
  it('aliased import generates mangled function call', () => {
    const file = resolve({
      '/entry.mc': 'import "./lib.mc" as m\ng(x) = m.f(x)',
      '/lib.mc': 'f(x) = x * 2',
    });
    const { c } = generateC(file);
    expect(c).toContain('m__f(');
    expect(c).toContain('m__f(mc_num x)');
  });

  it('plain import — function called by original name', () => {
    const file = resolve({
      '/entry.mc': 'import "./lib.mc"\ng(x) = f(x)',
      '/lib.mc': 'f(x) = x * 2',
    });
    const { c } = generateC(file);
    expect(c).toContain('mc_num f(');
    expect(c).toContain('f(x)');
  });
});

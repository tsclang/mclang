import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { Lexer } from '../lexer/index.js';
import { parseSource } from '../parser/index.js';
import { generateC } from '../codegen/index.js';
import { CompilerError, formatDiagnostic } from '../diagnostics/index.js';
import type { FuncDef } from '../ast/nodes.js';

function findGcc(): string {
  for (const candidate of ['gcc', 'cc', 'clang']) {
    try {
      execSync(`${candidate} --version`, { stdio: 'ignore' });
      return candidate;
    } catch {
      // try next
    }
  }
  throw new Error('GCC not found. Install gcc and make sure it is in PATH.');
}

function gccEnv(): NodeJS.ProcessEnv {
  if (process.platform !== 'win32') return process.env;
  // MinGW gcc (MSYS2) must see its own directories first in PATH so it can
  // locate cc1.exe, as.exe etc. Always prepend mingw64/bin + usr/bin when present.
  const prepend = ['C:\\msys64\\mingw64\\bin', 'C:\\msys64\\usr\\bin']
    .filter(d => existsSync(d));
  if (prepend.length === 0) return process.env;
  return { ...process.env, PATH: prepend.join(';') + ';' + (process.env.PATH ?? '') };
}

function parseCall(callStr: string): { name: string; args: number[] } | null {
  const m = callStr.match(/^(\w+)\s*\(\s*(.*)\s*\)$/s);
  if (!m) return null;
  const name = m[1]!;
  const argsRaw = m[2]!.trim();
  if (argsRaw === '') return { name, args: [] };
  const args = argsRaw.split(',').map(s => {
    const v = parseFloat(s.trim());
    return v;
  });
  if (args.some(isNaN)) return null;
  return { name, args };
}

function formatFuncList(funcs: FuncDef[]): string {
  return funcs.map(f => {
    const params = f.params.map(p => {
      const t = p.type;
      if (!t) return p.name;
      if (t.kind === 'NumType' && t.dims === 1) return `${p.name}: num[]`;
      if (t.kind === 'NumType' && t.dims === 2) return `${p.name}: num[][]`;
      if (t.kind === 'IntType') return `${p.name}: int`;
      return p.name;
    });
    return `${f.name}(${params.join(', ')})`;
  }).join('\n');
}

function isScalarParam(f: FuncDef): boolean {
  return f.params.every(p => {
    if (!p.type) return true;
    if (p.type.kind === 'NumType' && p.type.dims === 0) return true;
    if (p.type.kind === 'IntType') return true;
    return false;
  });
}

function buildDriver(cHeader: string, funcName: string, args: number[], callStr: string): string {
  const argList = args.map(a => {
    // preserve integer representation for clean output
    return Number.isInteger(a) ? `${a}.0` : `${a}`;
  }).join(', ');

  return [
    '#include <stdio.h>',
    `#include "${cHeader}"`,
    '',
    'int main(void) {',
    `  mc_num _r = ${funcName}(${argList});`,
    `  printf("${callStr} = %.10g\\n", (double)_r);`,
    '  return 0;',
    '}',
  ].join('\n');
}

export function runEval(mcFile: string | undefined, callArgs: string[]): void {
  if (!mcFile) {
    console.error('Usage: mclang eval <file.mc> [func(arg1, arg2, ...)]');
    process.exit(1);
  }

  const absInput = resolve(mcFile);
  let source: string;
  try {
    source = readFileSync(absInput, 'utf-8');
  } catch {
    console.error(`Error: cannot read file '${mcFile}'`);
    process.exit(1);
  }

  // Parse
  let ast;
  const sources = new Map([[mcFile, source]]);
  try {
    const lexer = new Lexer(source, mcFile);
    const tokens = lexer.tokenize();
    ast = parseSource(tokens);
  } catch (err) {
    if (err instanceof CompilerError) {
      process.stderr.write(formatDiagnostic(err.diagnostic, sources) + '\n');
      process.exit(1);
    }
    throw err;
  }

  const exported = ast.body.filter(
    (n): n is FuncDef => n.kind === 'FuncDef' && !n.name.startsWith('_'),
  );

  // No call expression — just list functions
  if (callArgs.length === 0) {
    if (exported.length === 0) {
      console.log('(no exported functions)');
    } else {
      console.log(formatFuncList(exported));
    }
    return;
  }

  // Join all call args in case shell split them (e.g. "range(50, 0.785)" → two tokens)
  const callStr = callArgs.join(' ').trim();
  const parsed = parseCall(callStr);

  if (!parsed) {
    console.error(`Error: cannot parse call '${callStr}'`);
    console.error('Expected format: funcname(arg1, arg2, ...)');
    process.exit(1);
  }

  const { name, args } = parsed;

  const funcDef = exported.find(f => f.name === name);
  if (!funcDef) {
    const names = exported.map(f => f.name).join(', ');
    console.error(`Error: function '${name}' not found or is private.`);
    console.error(`Available: ${names}`);
    process.exit(1);
  }

  if (!isScalarParam(funcDef)) {
    console.error(`Error: '${name}' has array/matrix parameters.`);
    console.error('eval only supports scalar parameters (num, int).');
    process.exit(1);
  }

  if (args.length !== funcDef.params.length) {
    console.error(
      `Error: '${name}' expects ${funcDef.params.length} argument(s), got ${args.length}.`,
    );
    process.exit(1);
  }

  // Generate C
  let cCode: string, hCode: string;
  try {
    ({ c: cCode, h: hCode } = generateC(ast, { target: 'c', precision: 'f64' }));
  } catch (err) {
    if (err instanceof CompilerError) {
      process.stderr.write(formatDiagnostic(err.diagnostic, sources) + '\n');
      process.exit(1);
    }
    throw err;
  }

  // Work in temp dir
  const tmp = mkdtempSync(join(tmpdir(), 'mclang-eval-'));
  const fwd = (p: string) => p.replace(/\\/g, '/');
  try {
    const base = basename(absInput).replace(/\.mc$/, '');
    const cPath      = join(tmp, `${base}.c`);
    const hPath      = join(tmp, `${base}.h`);
    const driverPath = join(tmp, '_eval_driver.c');
    const binPath    = join(tmp, '_eval_bin');
    const binExe     = process.platform === 'win32' ? binPath + '.exe' : binPath;

    writeFileSync(cPath, cCode, 'utf-8');
    writeFileSync(hPath, hCode, 'utf-8');

    const driver = buildDriver(`${base}.h`, name, args, callStr);
    writeFileSync(driverPath, driver, 'utf-8');

    const gcc = findGcc();
    const env = gccEnv();
    execSync(`${gcc} "${fwd(cPath)}" "${fwd(driverPath)}" -lm -o "${fwd(binPath)}"`, { stdio: 'pipe', env });

    const output = execSync(`"${fwd(binExe)}"`, { encoding: 'utf-8', env });
    process.stdout.write(output);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'stderr' in err) {
      const msg = (err as { stderr: Buffer }).stderr?.toString?.() ?? '';
      console.error('Compilation error:\n' + msg);
    } else if (err instanceof Error) {
      console.error('Error: ' + err.message);
    }
    process.exit(1);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

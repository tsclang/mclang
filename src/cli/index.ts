#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, basename, dirname, join } from 'node:path';
import { Lexer } from '../lexer/index.js';
import { parseSource } from '../parser/index.js';
import { TokenKind } from '../lexer/token.js';
import { resolveImports } from '../import/resolver.js';
import { generateC } from '../codegen/index.js';
import type { CgenTarget, CgenPrecision } from '../codegen/index.js';
import {
  CompilerError,
  formatDiagnostic,
  explainCode,
} from '../diagnostics/index.js';
import { runEval } from './eval.js';
import { generateRust } from '../codegen/rust.js';

const HELP = `
mclang — Math C Language compiler

Usage:
  mclang <file.mc> [options]
  mclang eval <file.mc> [func(arg1, arg2, ...)]

Options:
  --target <c|wasm|shared|rust>   Output target (default: c)
  --precision <f64|f32|fixed>     Number precision (default: f64)
  --out <dir>                     Output directory (default: same as input)
  --tokens                        Dump token stream and exit
  --no-color                      Disable ANSI colour output
  --explain <CODE>                Explain an error code (e.g. --explain E030)
  --help                          Show this help

Examples:
  mclang physics.mc --target c
  mclang math.mc --target wasm --precision f32
  mclang --explain E030
  mclang eval ballistics.mc
  mclang eval ballistics.mc "range(50, 0.785)"
`.trim();

function flag(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(HELP);
    process.exit(0);
  }

  // --explain <CODE>
  const explainArg = flag(args, '--explain');
  if (explainArg !== undefined) {
    const explanation = explainCode(explainArg);
    if (explanation === undefined) {
      console.error(`Unknown error code: ${explainArg}`);
      process.exit(1);
    }
    console.log(explanation);
    process.exit(0);
  }

  // eval subcommand
  if (args[0] === 'eval') {
    const [, mcFile, ...callArgs] = args;
    runEval(mcFile, callArgs);
    return;
  }

  if (args.includes('--no-color')) {
    process.env['NO_COLOR'] = '1';
  }

  const inputFile = args[0];
  if (inputFile === undefined || inputFile.startsWith('--')) {
    console.error('Error: expected a .mc file as the first argument');
    console.error('Run `mclang --help` for usage.');
    process.exit(1);
  }

  const targetArg = (flag(args, '--target') ?? 'c') as CgenTarget;
  if (!['c', 'wasm', 'shared', 'rust'].includes(targetArg)) {
    console.error(`Error: unknown target '${targetArg}'. Use c, wasm, shared, or rust.`);
    process.exit(1);
  }

  const precisionArg = (flag(args, '--precision') ?? 'f64') as CgenPrecision;
  if (!['f64', 'f32', 'fixed'].includes(precisionArg)) {
    console.error(`Error: unknown precision '${precisionArg}'. Use f64, f32, or fixed.`);
    process.exit(1);
  }

  const dumpTokens = args.includes('--tokens');
  const outDir = flag(args, '--out');

  let source: string;
  const absInput = resolve(inputFile);
  try {
    source = readFileSync(absInput, 'utf-8');
  } catch {
    console.error(`Error: cannot read file '${inputFile}'`);
    process.exit(1);
  }

  const sources = new Map([[inputFile, source]]);

  try {
    const lexer = new Lexer(source, inputFile);
    const tokens = lexer.tokenize();

    if (dumpTokens) {
      for (const tok of tokens) {
        const { kind, value, span } = tok;
        console.log(
          `${String(kind).padEnd(16)} ${JSON.stringify(value).padEnd(20)} ` +
          `${span.start.line}:${span.start.col}–${span.end.line}:${span.end.col}`,
        );
      }
      return;
    }

    const hasImports = tokens.some(t => t.kind === TokenKind.KwImport);
    const absInputFwd = absInput.replace(/\\/g, '/');
    const ast = hasImports
      ? resolveImports(absInputFwd, source, (p) => readFileSync(p, 'utf-8'))
      : parseSource(tokens);
    const { c, h } = generateC(ast, { target: targetArg, precision: precisionArg });

    // Determine output paths
    const base = basename(absInput).replace(/\.mc$/, '');
    const dir = outDir ? resolve(outDir) : dirname(absInput);
    const cPath = join(dir, `${base}.c`);
    const hPath = join(dir, `${base}.h`);

    writeFileSync(cPath, c, 'utf-8');
    writeFileSync(hPath, h, 'utf-8');

    if (targetArg === 'rust') {
      const rsPath = join(dir, `${base}_bindings.rs`);
      const rs = generateRust(ast, base, precisionArg);
      writeFileSync(rsPath, rs, 'utf-8');
      console.log(`Wrote ${cPath}`);
      console.log(`Wrote ${hPath}`);
      console.log(`Wrote ${rsPath}`);
      console.log(`\nAdd to Cargo.toml:\n  [build-dependencies]\n  cc = "1"`);
      console.log(`\nCreate build.rs:\n  fn main() { cc::Build::new().file("${base}.c").compile("${base}"); }`);
    } else if (targetArg === 'shared') {
      const pyPath = join(dir, `${base}_loader.py`);
      const pyStub = genPythonStub(base, h);
      writeFileSync(pyPath, pyStub, 'utf-8');
      console.log(`Wrote ${cPath}`);
      console.log(`Wrote ${hPath}`);
      console.log(`Wrote ${pyPath}`);
      console.log(`\nBuild with: gcc -shared -fPIC -o ${base}.so ${base}.c -lm`);
    } else if (targetArg === 'wasm') {
      console.log(`Wrote ${cPath}`);
      console.log(`Wrote ${hPath}`);
      console.log(`\nBuild with: emcc ${base}.c -o ${base}.js -s EXPORTED_FUNCTIONS='[...]' -lm`);
    } else {
      console.log(`Wrote ${cPath}`);
      console.log(`Wrote ${hPath}`);
    }
  } catch (err) {
    if (err instanceof CompilerError) {
      process.stderr.write(formatDiagnostic(err.diagnostic, sources) + '\n');
      process.exit(1);
    }
    if (err instanceof Error) {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exit(1);
    }
    throw err;
  }
}

function genPythonStub(base: string, _h: string): string {
  return `"""Auto-generated ctypes loader for ${base}.so (mclang)"""
import ctypes, os

_lib = ctypes.CDLL(os.path.join(os.path.dirname(__file__), '${base}.so'))

# TODO: set argtypes / restype for each exported function, e.g.:
# _lib.my_func.argtypes = [ctypes.c_double]
# _lib.my_func.restype  = ctypes.c_double

def load():
    return _lib
`;
}

main();

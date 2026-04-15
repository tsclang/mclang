#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Lexer } from '../lexer/index.js';
import {
  CompilerError,
  formatDiagnostic,
  formatDiagnostics,
  explainCode,
} from '../diagnostics/index.js';

const HELP = `
mclang — Math C Language compiler

Usage:
  mclang <file.mc> [options]

Options:
  --target <c|wasm|shared>        Output target (default: c)
  --precision <f64|f32|fixed>     Number precision (default: f64)
  --tokens                        Dump token stream and exit
  --no-color                      Disable ANSI colour output
  --explain <CODE>                Explain an error code (e.g. --explain E030)
  --help                          Show this help

Examples:
  mclang physics.mc --target c
  mclang math.mc --target wasm --precision f32
  mclang --explain E030
`.trim();

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(HELP);
    process.exit(0);
  }

  // --explain <CODE>
  const explainIdx = args.indexOf('--explain');
  if (explainIdx !== -1) {
    const code = args[explainIdx + 1];
    if (code === undefined) {
      console.error('Error: --explain requires an error code, e.g. --explain E030');
      process.exit(1);
    }
    const explanation = explainCode(code);
    if (explanation === undefined) {
      console.error(`Unknown error code: ${code}`);
      process.exit(1);
    }
    console.log(explanation);
    process.exit(0);
  }

  if (args.includes('--no-color')) {
    process.env['NO_COLOR'] = '1';
  }

  const file = args[0];
  if (file === undefined || file.startsWith('--')) {
    console.error('Error: expected a .mc file as the first argument');
    console.error('Run `mclang --help` for usage.');
    process.exit(1);
  }

  const dumpTokens = args.includes('--tokens');

  let source: string;
  try {
    source = readFileSync(resolve(file), 'utf-8');
  } catch {
    console.error(`Error: cannot read file '${file}'`);
    process.exit(1);
  }

  const sources = new Map([[file, source]]);

  try {
    const lexer = new Lexer(source, file);
    const tokens = lexer.tokenize();

    if (dumpTokens) {
      for (const tok of tokens) {
        const { kind, value, span } = tok;
        console.log(
          `${kind.padEnd(16)} ${JSON.stringify(value).padEnd(20)} ` +
          `${span.start.line}:${span.start.col}–${span.end.line}:${span.end.col}`,
        );
      }
      return;
    }

    // TODO: Phase 2 — parse tokens into AST
    console.log(`Lexed ${tokens.length} tokens. Parser not yet implemented.`);
  } catch (err) {
    if (err instanceof CompilerError) {
      process.stderr.write(formatDiagnostic(err.diagnostic, sources) + '\n');
      process.exit(1);
    }
    throw err;
  }
}

main();

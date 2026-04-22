import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/index.js';
import { parseSource } from '../../src/parser/index.js';
import { generateC } from '../../src/codegen/index.js';

function compile(src: string) {
  const lexer = new Lexer(src, 'test.mc');
  const tokens = lexer.tokenize();
  const ast = parseSource(tokens);
  return generateC(ast, { target: 'c', precision: 'f64' });
}

describe('\\begin{cases}', () => {
  it('parses LaTeX style with & \\text{if} \\\\', () => {
    const src = [
      'sign(x) = \\begin{cases}',
      '    1  & \\text{if} x > 0 \\\\',
      '    -1 & \\text{if} x < 0 \\\\',
      '    0',
      '\\end{cases}',
    ].join('\n');
    const { c } = compile(src);
    expect(c).toContain('if ((x) > (0.0))');
    expect(c).toContain('else if ((x) < (0.0))');
    expect(c).toContain('else');
  });

  it('parses && style without \\text{if}', () => {
    const src = [
      'sign(x) = \\begin{cases}',
      '    1  && x > 0 \\\\',
      '    -1 && x < 0 \\\\',
      '    0',
      '\\end{cases}',
    ].join('\n');
    const { c } = compile(src);
    expect(c).toContain('if ((x) > (0.0))');
    expect(c).toContain('else if ((x) < (0.0))');
  });

  it('parses without row separator (newline only)', () => {
    const src = [
      'abs_val(x) = \\begin{cases}',
      '    x  & \\text{if} x >= 0',
      '    -x',
      '\\end{cases}',
    ].join('\n');
    const { c } = compile(src);
    expect(c).toContain('if ((x) >= (0.0))');
  });

  it('generates correct C for sign function', () => {
    const src = [
      'sign(x) = \\begin{cases}',
      '    1  & \\text{if} x > 0 \\\\',
      '    -1 & \\text{if} x < 0 \\\\',
      '    0',
      '\\end{cases}',
    ].join('\n');
    const { c } = compile(src);
    expect(c).toMatch(/if.*else if.*else/s);
    expect(c).toContain('return 1.0');
    expect(c).toContain('return (-(1.0))');
    expect(c).toContain('return 0.0');
  });

  it('works inline (no indent)', () => {
    const src = 'f(x) = \\begin{cases} 1 && x > 0 \\\\ -1 \\end{cases}';
    const { c } = compile(src);
    expect(c).toContain('if ((x) > (0.0))');
  });

  it('native if/else alternative still works', () => {
    const src = [
      'sign(x) =',
      '    if (x > 0) 1',
      '    else if (x < 0) -1',
      '    else 0',
    ].join('\n');
    const { c } = compile(src);
    expect(c).toContain('if ((x) > (0.0))');
    expect(c).toContain('else if ((x) < (0.0))');
  });
});
